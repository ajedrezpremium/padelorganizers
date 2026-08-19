/**
 * revisar-correo.mjs — Revisión diaria del buzón de Gmail (chessagencyai):
 *  - Rebotes de la campaña (reutiliza la lógica de consultar-rebotes.mjs)
 *  - Respuestas/emails de interés de clubes, escuelas o federaciones
 * Escribe un informe en clientes/informes/revision_<fecha>.md
 *
 * Uso: node clientes/revisar-correo.mjs [--dias=N]
 */

import { ImapFlow } from 'imapflow'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function loadEnv() {
  const envFile = join(ROOT, '.env')
  if (!existsSync(envFile)) return {}
  const out = {}
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
  return out
}

const env = loadEnv()
const USER = env.GMAIL_USER
const PASS = (env.GMAIL_APP_PASS || env['GOOGLE-APP-KEY'] || '').replace(/\s+/g, '')

if (!USER || !PASS) {
  console.error('Faltan GMAIL_USER y (GMAIL_APP_PASS o GOOGLE-APP-KEY) en .env')
  process.exit(1)
}

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}
const dias = Number(args.dias ?? 2)
const desde = new Date(Date.now() - dias * 86400000)

const BOUNCE_RE = /(delivery (status )?notification|mail delivery (failed|subsystem)|undeliverable|mailer-daemon|postmaster|delivery failure|no entregad|rebot|bounce)/i
const NOISE_FROM = /(noreply|no-reply|notifications@|newsletter|mailer-daemon|googlemail)/i
const INTERES_RE = /(padel|pádel|tenis|club|escuela|federaci|organiz|torneo|reserva|gracias|interes|quieren|info@|presupuesto|cita|reuni)/i

const vistos = new Set()
const informes = []

const client = new ImapFlow({
  host: 'imap.gmail.com',
  port: 993,
  secure: true,
  auth: { user: USER, pass: PASS },
  tls: env.SMTP_ALLOW_INSECURE === '1' ? { rejectUnauthorized: false } : undefined,
  logger: false,
})

async function main() {
  await client.connect()
  const mailboxes = await client.list()
  console.log(`Conectado a ${USER}. Buzones: ${mailboxes.map((m) => m.path).join(', ')}\n`)

  let totalRebotes = 0
  const rebotes = []
  let interes = []

  for (const mb of mailboxes) {
    const path = mb.path
    // Solo interesan INBOX (entrantes) y Sent Mail (enviados de la campaña).
    const isInbox = path.toLowerCase().includes('inbox')
    const isSent = path.toLowerCase().includes('sent')
    if (!isInbox && !isSent) continue
    let lock
    try { lock = await client.getMailboxLock(path) } catch { continue }
    try {
      let status
      try { status = await client.status(path, { messages: true }) } catch { continue }
      if (!status.messages) continue
      let found = 0
      // Buscar solo mensajes dentro de la ventana (orden temporal correcto).
      let uids = []
      try {
        const res = await client.search({ since: desde })
        uids = res || []
      } catch { uids = [] }
      if (!uids.length) { console.log(`  -> ${path}: 0 mensaje(s) revisado(s) (nada en ventana)`); continue }
      for await (const msg of client.fetch(uids.join(','), { uid: true, envelope: true, source: true, flags: true })) {
        const d = msg.envelope?.date ? new Date(msg.envelope.date) : new Date()
        if (d < desde) continue
        const from = msg.envelope?.from?.map((a) => a.address).join(', ') || ''
        const fromName = msg.envelope?.from?.map((a) => a.name).join(', ') || ''
        const subj = msg.envelope?.subject || ''
        const src = msg.source ? msg.source.toString('utf8', 0, 12000) : ''
        found++

        // 1) Rebotes de campaña
        if ((BOUNCE_RE.test(subj) || BOUNCE_RE.test(from)) && /padel|organiz|chess/i.test(src.slice(0, 4000))) {
          const mFail = src.match(/final-recipient:\s*rfc822;?\s*([^\s\r\n]+)/i)?.[1]
            || src.match(/^To:\s*([^\r\n]+)/m)?.[1]?.trim() || ''
          const key = mFail.toLowerCase() || `${msg.uid}@${path}`
          if (vistos.has(key)) continue
          vistos.add(key)
          // Ignorar rebotes hacia nuestra propia cuenta (auto-eco de Gmail)
          if (mFail && mFail.toLowerCase() === USER.toLowerCase()) continue
          totalRebotes++
          rebotes.push({ path, uid: msg.uid, from, subj, fail: mFail })
          console.log(`[REBOTE] ${from} → ${mFail || '?'}`)
          continue
        }

        // 2) Mensajes de interés (no ruido, no rebotes)
        if (isInbox && !NOISE_FROM.test(from) && INTERES_RE.test(subj + ' ' + fromName + ' ' + from)) {
          const key = `${msg.uid}@${path}`
          if (vistos.has(key)) continue
          vistos.add(key)
          const cuerpo = src.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          interes.push({ path, uid: msg.uid, from, fromName, subj, fecha: d.toISOString(), snippet: cuerpo.slice(0, 300) })
          console.log(`[INTERÉS] ${fromName} <${from}> — ${subj}`)
        }
      }
      console.log(`  -> ${path}: ${found} mensaje(s) revisado(s)`)
    } finally {
      await lock.release()
    }
  }

  // Informe
  const dir = join(__dirname, 'informes')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const fecha = new Date()
  const stamp = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}_${String(fecha.getHours()).padStart(2, '0')}${String(fecha.getMinutes()).padStart(2, '0')}`
  const file = join(dir, `revision_${stamp}.md`)
  const lines = []
  lines.push(`# Revisión de correo — ${stamp}`)
  lines.push(`Fecha: ${fecha.toISOString()}`)
  lines.push(`Cuenta: ${USER}`)
  lines.push('')
  lines.push(`## Rebotes (${rebotes.length})`)
  for (const r of rebotes) lines.push(`- [REBOTE] ${r.fail || '?'} — ${r.subj}`)
  lines.push('')
  lines.push(`## Mensajes de interés (${interes.length})`)
  for (const m of interes) {
    lines.push(`- [${m.fecha}] ${m.fromName} <${m.from}> — ${m.subj}`)
    lines.push(`  ${m.snippet}`)
  }
  lines.push('')
  writeFileSync(file, lines.join('\n'), 'utf8')
  console.log(`\nTOTAL: ${totalRebotes} rebotes, ${interes.length} mensajes de interés.`)
  console.log(`Informe: ${file}`)
  await client.logout()
}

main().catch((e) => { console.error('ERROR:', e); process.exit(1) })