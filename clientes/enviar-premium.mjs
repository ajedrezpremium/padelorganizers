/**
 * enviar-premium.mjs — Campaña premium: pocos correos, mucha calidad. Max 30/dia.
 * Lee clientes/leads_premium.csv, elige plantilla por segmento y envia espaciado.
 * Log: clientes/campana_log_leads_premium.csv (idx,nombre,correo,segmento,estado,fecha,error,respuesta)
 *
 * Uso:
 *   node clientes/enviar-premium.mjs --dry                 # preview sin enviar (idx 0)
 *   node clientes/enviar-premium.mjs --dry --solo=5        # preview del idx 5
 *   node clientes/enviar-premium.mjs --max=30              # tanda diaria (defecto 30)
 *   node clientes/enviar-premium.mjs --max=10 --segmento=club
 *   node clientes/enviar-premium.mjs --solo=3              # reenvio puntual (ignora max)
 *   node clientes/enviar-premium.mjs --espera=90           # segundos entre envios (defecto 90)
 */
import nodemailer from 'nodemailer'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function loadEnv() {
  const p = join(ROOT, '.env')
  if (!existsSync(p)) return {}
  const out = {}
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
  return out
}
const env = loadEnv()
const GMAIL_USER = env.GMAIL_USER
const GMAIL_APP_PASS = (env.GMAIL_APP_PASS || env['GOOGLE-APP-KEY'] || '').replace(/\s+/g, '')
if (!GMAIL_USER || !GMAIL_APP_PASS) { console.error('Faltan GMAIL_USER / GMAIL_APP_PASS en .env'); process.exit(1) }

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-zA-Z_]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
  else if (a.includes('@')) args.bcc = a
}
const MAX = args.solo !== undefined ? 1 : (args.max !== undefined ? Number(args.max) : 30)
const ESPERA = Number(args.espera ?? 90)
const SEG = (args.segmento || '').toLowerCase()
const CSV_FILE = 'leads_premium.csv'
const LOG_FILE = join(__dirname, 'campana_log_leads_premium.csv')
const BASE_URL = 'https://padelorganizers.vercel.app'
const DEMO_URL = `${BASE_URL}/torneo?utm_source=email&utm_medium=premium&utm_campaign=premium30`

function parseCsv(text) {
  const rows = []
  for (const line of text.split(/\r?\n/)) {
    const cells = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQ) {
        if (ch === '"' && line[i+1] === '"') { cur += '"'; i++ }
        else if (ch === '"') inQ = false
        else cur += ch
      } else if (ch === '"') inQ = true
      else if (ch === ',') { cells.push(cur); cur = '' }
      else cur += ch
    }
    cells.push(cur)
    rows.push(cells.map(c => c.trim()))
  }
  return rows.filter(r => r.some(c => c.length > 0))
}

const rows = parseCsv(readFileSync(join(__dirname, CSV_FILE), 'utf8'))
const headers = rows[0]
const leads = rows.slice(1).map((r, i) => { const o = { _idx: i }; headers.forEach((h, j) => { o[h] = r[j] ?? '' }); return o })

function loadLog() {
  if (!existsSync(LOG_FILE)) { writeFileSync(LOG_FILE, 'idx,nombre,correo,segmento,estado,fecha,error,respuesta\n', 'utf8') }
  const lr = parseCsv(readFileSync(LOG_FILE, 'utf8'))
  const h = lr[0]
  return lr.slice(1).map(r => { const o = {}; h.forEach((k, i) => { o[k] = r[i] ?? '' }); return o })
}
function estadoDe(idx) { return loadLog().find(r => r.idx === String(idx))?.estado || 'pendiente' }
function marcar(idx, estado, error = '', lead = {}) {
  const log = loadLog()
  const t = log.find(r => r.idx === String(idx))
  const fecha = new Date().toISOString()
  const row = { idx: String(idx), nombre: lead.Nombre || t?.nombre || '', correo: lead.Correo || t?.correo || '', segmento: lead.Segmento || t?.segmento || '', estado, fecha, error, respuesta: t?.respuesta || '' }
  if (t) Object.assign(t, row); else log.push(row)
  const h = ['idx','nombre','correo','segmento','estado','fecha','error','respuesta']
  writeFileSync(LOG_FILE, [h.join(','), ...log.map(r => h.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n'), 'utf8')
}

function plantillaDe(seg) {
  if (seg === 'escuela') return 'plantilla-premium-escuela.html'
  if (seg === 'club') return 'plantilla-premium-club.html'
  return 'plantilla-premium-federacion.html'
}
function asuntoDe(lead) {
  const n = lead.Nombre || ''
  if (lead.Segmento === 'escuela') return `${n} — cobros de fin de mes sin Excel?`
  if (lead.Segmento === 'club') return `${n} — vuestro próximo americano sin liaros en WhatsApp?`
  return `${n} — gestionar el circuito sin Excel?`
}
function datoClave(lead) {
  const bits = []
  if (lead.Pistas && !/^n\/?a/i.test(lead.Pistas)) bits.push(lead.Pistas)
  if (lead['Dirección']) bits.push(lead['Dirección'])
  if (lead.Ciudad && lead.Ciudad !== 'espana' && lead.Ciudad !== 'int') bits.push(lead.Ciudad)
  return bits.length ? bits.slice(0, 2).join(' · ') : 'vuestra sede'
}
function plataformaDe(lead) {
  const p = (lead['Plataforma de Reserva'] || '').trim()
  return (!p || /^n\/?a/i.test(p)) ? 'vuestra plataforma actual' : p
}
function personalizar(tpl, lead) {
  return tpl
    .replaceAll('{{NOMBRE}}', lead.Nombre || 'equipo')
    .replaceAll('{{NOMBRE_CLUB}}', lead.Nombre || 'equipo')
    .replaceAll('{{DATO_CLAVE}}', datoClave(lead))
    .replaceAll('{{CIUDAD}}', lead.Ciudad || '')
    .replaceAll('{{PLATAFORMA}}', plataformaDe(lead))
    .replaceAll('{{WEB}}', lead['Página Web'] || '')
    .replaceAll('{{DEMO_URL}}', `${DEMO_URL}&club=${encodeURIComponent(lead.Nombre || '')}`)
    .replaceAll('{{BANNER_URL}}', `${BASE_URL}/images/banner-email.jpg`)
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS },
  tls: env.SMTP_ALLOW_INSECURE === '1' ? { rejectUnauthorized: false } : undefined,
})
const FROM_NAME = 'Gonzalo — Padel Organizers'
const espera = ms => new Promise(r => setTimeout(r, ms))

if (args.dry !== undefined) {
  const idx = args.solo !== undefined ? Number(args.solo) : 0
  const lead = leads[idx]
  if (!lead) { console.error(`idx ${idx} no existe (0-${leads.length - 1})`); process.exit(1) }
  const tpl = readFileSync(join(__dirname, plantillaDe(lead.Segmento)), 'utf8')
  writeFileSync(join(__dirname, 'preview-premium.html'), personalizar(tpl, lead), 'utf8')
  console.log(`[dry] idx=${idx} ${lead.Nombre} <${lead.Correo}> [${lead.Segmento}] asunto="${asuntoDe(lead)}" -> clientes/preview-premium.html`)
  process.exit(0)
}

async function main() {
  console.log(`Premium: ${leads.length} leads, max ${MAX} esta ejecucion, espera ${ESPERA}s, segmento=${SEG || 'todos'}`)
  let enviados = 0
  for (const lead of leads) {
    const i = lead._idx
    if (args.solo !== undefined && i !== Number(args.solo)) continue
    if (SEG && lead.Segmento !== SEG) continue
    const est = estadoDe(i)
    if (est === 'ok' || est === 'respondido' || est === 'no-insistir') { if (args.solo === undefined) continue }
    if (args.solo === undefined && enviados >= MAX) { console.log(`\n[*] Tope ${MAX} alcanzado. Resto pendiente para manana.`); break }
    const correo = (lead.Correo || '').trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) { marcar(i, 'sin-correo', 'email invalido', lead); continue }
    const tpl = readFileSync(join(__dirname, plantillaDe(lead.Segmento)), 'utf8')
    try {
      await transporter.sendMail({ from: `${FROM_NAME} <${GMAIL_USER}>`, to: correo, subject: asuntoDe(lead), html: personalizar(tpl, lead), ...(args.bcc ? { bcc: args.bcc } : {}) })
      marcar(i, 'ok', '', lead); enviados++
      console.log(`- [${i}] ENVIADO ${lead.Segmento} a ${correo} (${lead.Nombre})`)
    } catch (err) {
      const msg = String(err.message || err)
      marcar(i, 'fallo', msg, lead)
      console.error(`- [${i}] FALLO ${correo}: ${msg}`)
      if (/Daily user sending limit/i.test(msg)) { console.log('LIMITE DIARIO Gmail. Paro limpio, pendientes intactos.'); process.exit(3) }
    }
    if (args.solo === undefined) await espera(ESPERA * 1000)
  }
  console.log(`\nListo. ${enviados} enviados. Log: campana_log_leads_premium.csv. Gestion: node clientes/gestionar-premium.mjs`)
}
main().catch(e => { console.error(e); process.exit(1) })
