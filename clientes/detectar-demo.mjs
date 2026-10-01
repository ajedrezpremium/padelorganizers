/**
 * detectar-demo.mjs — Vigía silencioso del buzón.
 * Busca RESPUESTAS con intención de demo virtual (videollamada, reunión,
 * "quiero verlo", precios…) y SOLO entonces avisa al dueño por email
 * y registra en Supabase (demo_requests, fuente=email).
 * Sin intención de demo: silencio total (exit 0). Con demo: exit 2.
 *
 * Uso:
 *   node clientes/detectar-demo.mjs            # últimos 2 días
 *   node clientes/detectar-demo.mjs --dias=7
 *   node clientes/detectar-demo.mjs --dry      # lista sin avisar ni registrar
 */
import { ImapFlow } from 'imapflow'
import nodemailer from 'nodemailer'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

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
const USER = env.GMAIL_USER
const PASS = (env.GMAIL_APP_PASS || env['GOOGLE-APP-KEY'] || '').replace(/\s+/g, '')
if (!USER || !PASS) { console.error('Faltan GMAIL_USER y APP KEY en .env'); process.exit(1) }

const SUPA_URL = env.VITE_SUPABASE_URL
const SUPA_KEY = env.VITE_SUPABASE_ANON_KEY
const ALERT_EMAIL = env.ALERT_EMAIL || USER

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}
const dias = Number(args.dias ?? 2)
const DRY = args.dry !== undefined
const desde = new Date(Date.now() - dias * 86400000)

// Intención de demo virtual (ES/EN/FR/PT)
const DEMO_RE = /(demo|videollamada|video.?call|llamada|call me|reuni[oó]n|meeting|quiero ver|mu[ée]strame|contratar|precio|price|presupuesto|cu[aá]ndo (podemos|podr[ií]|hablamos)|disponibilidad|agenda|probar con (mi|nuestro|el) club|try (it|with)|interesado|intéressé|interested)/i
const BOUNCE_RE = /(delivery (status )?notification|mail delivery (failed|subsystem)|undeliverable|mailer-daemon|postmaster|delivery failure|bounce)/i
const NOISE_FROM = /(noreply|no-reply|newsletter|notificaci|mailer-daemon|googlemail)/i
const CAMPAIGN_RE = /(padel|organiz|chessagency|torneo)/i

const VISTOS_FILE = join(__dirname, '.demo_vistos.json')
let vistos = new Set()
try { if (existsSync(VISTOS_FILE)) vistos = new Set(JSON.parse(readFileSync(VISTOS_FILE, 'utf8'))) } catch { vistos = new Set() }
const saveVistos = () => { try { writeFileSync(VISTOS_FILE, JSON.stringify([...vistos]), 'utf8') } catch { /* noop */ } }

async function registrarDemo({ email, nombre, snippet }) {
  if (!SUPA_URL || !SUPA_KEY) return false
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/demo_requests`, {
      method: 'POST',
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ email, nombre, fuente: 'email', idioma: 'es' }),
    })
    return r.ok
  } catch { return false }
}

async function avisar({ from, nombre, subj, snippet, email }) {
  const tr = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: USER, pass: PASS } })
  await tr.sendMail({
    from: `Padel Organizers <${USER}>`,
    to: ALERT_EMAIL,
    subject: `🎾 Demo solicitada por email: ${nombre || from}`,
    text: `Intención de demo detectada en tu buzón.\n\nDe: ${from}\nAsunto: ${subj}\nEmail: ${email || '-'}\n\nFragmento:\n${snippet.slice(0, 800)}\n\nResponde en <24h con día/hora para la videollamada.`,
  })
}

const client = new ImapFlow({
  host: 'imap.gmail.com', port: 993, secure: true,
  auth: { user: USER, pass: PASS },
  tls: env.SMTP_ALLOW_INSECURE === '1' ? { rejectUnauthorized: false } : undefined,
  logger: false,
})

async function main() {
  await client.connect()
  const lock = await client.getMailboxLock('INBOX')
  const hallazgos = []
  try {
    const uids = await client.search({ since: desde }) || []
    if (uids.length) {
      for await (const msg of client.fetch(uids.join(','), { uid: true, envelope: true, source: true })) {
        const from = msg.envelope?.from?.map((a) => a.address).join(', ') || ''
        const fromName = msg.envelope?.from?.map((a) => a.name).join(', ') || ''
        const subj = msg.envelope?.subject || ''
        if (BOUNCE_RE.test(subj + ' ' + from) || NOISE_FROM.test(from)) continue
        if (from.toLowerCase() === USER.toLowerCase()) continue
        const key = `${from.toLowerCase()}|${msg.uid}`
        if (vistos.has(key)) continue
        const src = msg.source ? msg.source.toString('utf8', 0, 15000) : ''
        const texto = `${subj} ${src.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')}`
        const esReply = /^re:/i.test(subj) || CAMPAIGN_RE.test(src.slice(0, 6000))
        if (DEMO_RE.test(texto) && esReply) {
          vistos.add(key)
          const mail = (src.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi) || []).find((e) => !e.toLowerCase().includes('padelorganizers') && !e.toLowerCase().includes('gmail.com')) || from
          const h = { from, nombre: fromName, subj, snippet: texto.slice(0, 500), email: mail }
          hallazgos.push(h)
          console.log(`[DEMO] ${fromName} <${from}> — ${subj}`)
          if (!DRY) {
            try { await registrarDemo(h) } catch { /* noop */ }
            try { await avisar(h); console.log('  → aviso enviado a ' + ALERT_EMAIL) } catch (e) { console.error('  → FALLO aviso: ' + e.message) }
          }
        }
      }
    }
  } finally {
    await lock.release()
    await client.logout()
  }
  if (!DRY) saveVistos()
  if (!hallazgos.length) console.log(`Sin intención de demo (últimos ${dias}d). Silencio.`)
  else console.log(`${hallazgos.length} solicitud(es) de demo.`)
  process.exit(hallazgos.length && !DRY ? 2 : 0)
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1) })
