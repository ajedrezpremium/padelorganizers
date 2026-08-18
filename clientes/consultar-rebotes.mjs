/**
 * consultar-rebotes.mjs — Lee el buzón de Gmail vía IMAP y busca correos de
 * devolución (rebotes) relacionados con la campaña de Padel Organizers.
 *
 * Usa GMAIL_USER + GOOGLE-APP-KEY del .env (el App Password funciona para IMAP).
 *
 * Uso:
 *   node clientes/consultar-rebotes.mjs          # últimos 30 días
 *   node clientes/consultar-rebotes.mjs --dias=7
 *   node clientes/consultar-rebotes.mjs --todo   # sin filtro de fecha
 */

import { ImapFlow } from 'imapflow'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
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

const dias = args.todo !== undefined ? null : Number(args.dias ?? 30)
const desde = dias ? new Date(Date.now() - dias * 86400000) : null

const BOUNCE_RE = /(delivery (status )?notification|mail delivery (failed|subsystem)|undeliverable|mailer-daemon|postmaster|delivery failure|no entregad|rebot|bounce)/i
const CAMPAIGN_RE = /(padel|organizers|organizer|torneos de padel|chessagency)/i
const vistos = new Set()

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
  for (const mb of mailboxes) {
    const path = mb.path
    let lock
    try {
      lock = await client.getMailboxLock(path)
    } catch (e) {
      console.log(`(salto buzón no seleccionable: ${path})`)
      continue
    }
    try {
      let status
      try { status = await client.status(path, { messages: true }) } catch { continue }
      if (!status.messages) continue
      let found = 0
      for await (const msg of client.fetch('1:*', {
        uid: true, envelope: true, source: true, flags: true,
      })) {
        if (desde) {
          const d = msg.envelope?.date
          if (d && new Date(d) < desde) {
            if (found === 0 && path.toLowerCase().includes('inbox')) {
              // Deja de leer el resto: ya pasó la ventana de tiempo (ordenado antiguo→nuevo)
            }
          }
        }
        const from = msg.envelope?.from?.map((a) => a.address).join(', ') || ''
        const subj = msg.envelope?.subject || ''
        const isBounce = BOUNCE_RE.test(subj) || BOUNCE_RE.test(from)
        const isCampaign = CAMPAIGN_RE.test(subj) || (msg.source && CAMPAIGN_RE.test(msg.source.toString('utf8', 0, 8000)))
        if (isBounce && isCampaign) {
          totalRebotes++
          // dedupe por dirección fallida
          const src = msg.source ? msg.source.toString('utf8') : ''
          const mFail = src.match(/final-recipient:\s*rfc822;?\s*([^\s\r\n]+)/i)?.[1]
            || src.match(/final-recipient:\s*([^\r\n]+)/i)?.[1]?.split(';').pop()?.trim()
            || ''
          const dedup = mFail.toLowerCase()
          if (dedup && vistos.has(dedup)) continue
          if (dedup) vistos.add(dedup)
          rebotes.push({ path, uid: msg.uid, from, subj, fail: mFail })
          console.log(`[REBOTE] buzón=${path} uid=${msg.uid} de=${from}`)
          console.log(`         asunto: ${subj}`)
          // intentar extraer la dirección fallida del cuerpo
          const srcBody = msg.source ? msg.source.toString('utf8') : ''
          const mFailB = srcBody.match(/final-recipient:\s*rfc822;?\s*([^\s\r\n]+)/i)?.[1]
            || srcBody.match(/final-recipient:\s*([^\r\n]+)/i)?.[1]?.split(';').pop()?.trim()
            || ''
          const origTo = srcBody.match(/^To:\s*([^\r\n]+)/m)?.[1]?.trim() || ''
          const srcTo = srcBody.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)
          if (mFailB) console.log(`         destinatario: ${mFailB}`)
          else if (origTo) console.log(`         destinatario: ${origTo}`)
          else if (srcTo) console.log(`         destinatario: ${srcTo.slice(0, 6).join(', ')}...`)
          console.log('')
        }
        found++
      }
      console.log(`  -> ${path}: ${found} mensaje(s) revisado(s)`)
    } finally {
      await lock.release()
    }
  }
  console.log(`\nTOTAL: ${totalRebotes} rebote(s) de campaña encontrado(s).`)

  // Volcar los rebotes únicos a CSV para cruzar con los leads
  const unicos = new Map()
  for (const r of rebotes) {
    const key = r.fail?.toLowerCase() || `${r.uid}@${r.path}`
    if (!unicos.has(key)) unicos.set(key, r)
  }
  const out = ['destinatario,asunto,buzon,uid']
  for (const r of unicos.values()) {
    out.push(`"${r.fail}","${String(r.subj).replace(/"/g, '""')}","${r.path}","${r.uid}"`)
  }
  const outFile = join(__dirname, 'rebotes.csv')
  writeFileSync(outFile, out.join('\n'), 'utf8')
  console.log(`Rebotes únicos: ${unicos.size}. CSV en clientes/rebotes.csv`)
  await client.logout()
}

main().catch((e) => { console.error('ERROR:', e); process.exit(1) })