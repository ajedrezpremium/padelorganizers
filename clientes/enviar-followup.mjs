/**
 * enviar-followup.mjs — 2º toque a los que recibieron el primer email y no
 * respondieron. Lee campana_log_*.csv (estado 'ok' con fecha > --dias días),
 * excluye rebotes/sin-MX/ya-contactados y envía plantilla-followup.
 * NO toca el estado del log principal: registra en followup_log.csv.
 * Respeta el mismo blindaje anti-spam que enviar-campana.mjs.
 *
 * Uso:
 *   node clientes/enviar-followup.mjs --dry            # previsualiza 1º candidato
 *   node clientes/enviar-followup.mjs --max=30         # envía hasta 30
 *   node clientes/enviar-followup.mjs --max=30 --dias=2 --solo=madrid
 */
import nodemailer from 'nodemailer'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promises as dns } from 'node:dns'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function loadEnv() {
  const out = {}
  const p = join(ROOT, '.env')
  if (!existsSync(p)) return out
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
  return out
}
const env = loadEnv()
const GMAIL_USER = env.GMAIL_USER
const GMAIL_APP_PASS = (env.GMAIL_APP_PASS || env['GOOGLE-APP-KEY'] || '').replace(/\s+/g, '')
if (!GMAIL_USER || !GMAIL_APP_PASS) { console.error('Faltan GMAIL_USER y APP KEY en .env'); process.exit(1) }

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-zA-Z_]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}
const MAX = Number(args.max ?? 30)
const DIAS = Number(args.dias ?? 3)
const DRY = args.dry !== undefined
const SOLO = (args.solo || '').toLowerCase()
const CORTE = Date.now() - DIAS * 86400000

function parseCsv(text) {
  const rows = []
  for (const line of text.split(/\r?\n/)) {
    const cells = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
        else if (ch === '"') inQ = false
        else cur += ch
      } else if (ch === '"') inQ = true
      else if (ch === ',') { cells.push(cur); cur = '' }
      else cur += ch
    }
    cells.push(cur)
    rows.push(cells.map((c) => c.trim()))
  }
  return rows.filter((r) => r.some((c) => c.length > 0))
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const ES_INT = /argentina|mexico|italia|francia|portugal|brasil|_uk|usa|federaciones_int/i
const mxCache = new Map()
async function tieneMx(correo) {
  const d = ((correo.split('@')[1]) || '').toLowerCase().trim()
  if (!d) return false
  if (!mxCache.has(d)) {
    mxCache.set(d, (async () => {
      try {
        const mx = await Promise.race([dns.resolveMx(d), new Promise((_, rej) => setTimeout(() => rej(new Error('t')), 6000))])
        return Array.isArray(mx) && mx.length > 0
      } catch { return false }
    })())
  }
  return mxCache.get(d)
}

// Rebotes conocidos
const rebotes = new Set()
const rebFile = join(__dirname, 'rebotes.csv')
if (existsSync(rebFile)) {
  for (const l of readFileSync(rebFile, 'utf8').split(/\r?\n/).slice(1)) {
    const e = l.split(',')[0].replace(/"/g, '').trim().toLowerCase()
    if (e) rebotes.add(e)
  }
}

// Ya contactados con follow-up
const FUP_LOG = join(__dirname, 'followup_log.csv')
const yaFup = new Set()
if (existsSync(FUP_LOG)) {
  for (const r of parseCsv(readFileSync(FUP_LOG, 'utf8')).slice(1)) {
    if (r[0]) yaFup.add(r[0].toLowerCase())
  }
}

// Candidatos: estado ok + fecha anterior al corte
const candidatos = []
for (const f of readdirSync(__dirname).filter((x) => /^campana_log_.*\.csv$/i.test(x) && !/backup/i.test(x) && !/\.bak/i.test(x))) {
  const fuente = f.replace(/^campana_log_/, '').replace(/\.csv$/i, '')
  if (SOLO && !fuente.toLowerCase().includes(SOLO)) continue
  const rows = parseCsv(readFileSync(join(__dirname, f), 'utf8'))
  if (rows.length < 2) continue
  const h = rows[0]
  const g = (r, n) => r[h.indexOf(n)] ?? ''
  for (const r of rows.slice(1)) {
    if ((g(r, 'estado') || '').toLowerCase() !== 'ok') continue
    const fecha = new Date(g(r, 'fecha') || 0).getTime()
    if (!(fecha && fecha < CORTE)) continue
    const email = (g(r, 'correo') || '').trim()
    if (!EMAIL_RE.test(email)) continue
    const low = email.toLowerCase()
    if (rebotes.has(low) || yaFup.has(low)) continue
    candidatos.push({ email, nombre: g(r, 'nombre'), fuente, intl: ES_INT.test(fuente) })
  }
}
// Dedup por email (varias ciudades)
const vistos = new Set()
const lista = candidatos.filter((c) => {
  const k = c.email.toLowerCase()
  if (vistos.has(k)) return false
  vistos.add(k)
  return true
})

console.log(`Candidatos follow-up (ok hace >${DIAS}d, sin repetir): ${lista.length}`)
if (!lista.length) process.exit(0)

const BASE_URL = 'https://padelorganizers.vercel.app'
const DEMO_URL = `${BASE_URL}/torneo?utm_source=email&utm_medium=followup&utm_campaign=presentacion&utm_content=demo`
const tplEs = readFileSync(join(__dirname, 'plantilla-followup.html'), 'utf8')
const tplEn = readFileSync(join(__dirname, 'plantilla-followup-int.html'), 'utf8')
const render = (tpl, c) => tpl
  .replaceAll('{{NOMBRE_CLUB}}', c.nombre || 'tu club')
  .replaceAll('{{DEMO_URL}}', `${DEMO_URL}&club=${encodeURIComponent(c.nombre || '')}`)
const toText = (html) => html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim()

if (DRY) {
  const c = lista[0]
  writeFileSync(join(__dirname, 'preview-followup.html'), render(c.intl ? tplEn : tplEs, c), 'utf8')
  console.log(`[dry] ${c.nombre} -> ${c.email} (${c.intl ? 'EN' : 'ES'}). HTML en clientes/preview-followup.html`)
  process.exit(0)
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS },
  tls: env.SMTP_ALLOW_INSECURE === '1' ? { rejectUnauthorized: false } : undefined,
})

if (!existsSync(FUP_LOG)) writeFileSync(FUP_LOG, 'email,nombre,fuente,fecha,plantilla\n', 'utf8')
let enviados = 0
const enviadosLista = []
for (const c of lista) {
  if (enviados >= MAX) { console.log(`[*] Tope ${MAX} alcanzado.`); break }
  if (!await tieneMx(c.email)) { console.log(`- ${c.email}: sin MX, salto.`); continue }
  const html = render(c.intl ? tplEn : tplEs, c)
  const subject = c.intl ? `${c.nombre} — did you see my email?` : `${c.nombre} — ¿viste mi email?`
  try {
    await transporter.sendMail({
      from: `Padel Organizers (Chess Agency) <${GMAIL_USER}>`,
      to: c.email,
      replyTo: 'info@padelorganizers.com',
      subject,
      text: toText(html),
      html,
      headers: { 'List-Unsubscribe': `<mailto:info@padelorganizers.com?subject=Unsubscribe%20${encodeURIComponent(c.email)}>` },
    })
    enviados++
    enviadosLista.push(c)
    console.log(`- ENVIADO follow-up a ${c.email} (${c.nombre})`)
    const line = `"${c.email}","${c.nombre.replace(/"/g, '""')}","${c.fuente}","${new Date().toISOString()}","${c.intl ? 'followup-int' : 'followup'}"\n`
    writeFileSync(FUP_LOG, readFileSync(FUP_LOG, 'utf8') + line, 'utf8')
  } catch (e) {
    const msg = String(e.message || e)
    if (/Daily user sending limit exceeded/.test(msg)) {
      console.log(`[!] Límite diario Gmail alcanzado tras ${enviados} envíos. Paro limpio: lo no registrado en followup_log.csv se reintenta mañana.`)
      break
    }
    console.error(`- FALLO ${c.email}: ${msg.split('\n')[0]}`)
  }
  await new Promise((r) => setTimeout(r, 4500))
}
console.log(`\nListo: ${enviados} follow-ups. Registro en clientes/followup_log.csv`)

// Reflejo en el panel: los contactados pasan a 'seguimiento' en Supabase.
// Best-effort en un solo batch (el sync diario lo consolidaría igualmente).
if (enviadosLista.length) {
  const SUPA_URL = env.VITE_SUPABASE_URL
  const SUPA_KEY = env.VITE_SUPABASE_ANON_KEY
  if (SUPA_URL && SUPA_KEY) {
    try {
      const batch = enviadosLista.map((c) => ({
        email: c.email.toLowerCase(), nombre: c.nombre, ciudad: c.fuente,
        fuente: c.fuente, estado: 'seguimiento', updated_at: new Date().toISOString(),
      }))
      const r = await fetch(`${SUPA_URL}/rest/v1/commercial_leads?on_conflict=email`, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(batch),
      })
      console.log(r.ok ? `Panel actualizado: ${batch.length} en 'seguimiento'.` : `(!) Panel no actualizado (${r.status}); lo hará el próximo sync.`)
    } catch { console.log('(!) Sin conexión a Supabase; lo hará el próximo sync.') }
  }
}
