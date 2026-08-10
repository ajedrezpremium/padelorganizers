/**
 * enviar-campana.mjs — Campaña "Presentación Padel Organizers" (Vigo)
 * Envía el primer correo personalizado a los clubes de clientes/leads_vigo.csv
 * usando Gmail SMTP con App Password. Lleva un registro de envíos en
 * clientes/campana_log.csv (estado: pendiente / ok / fallo) que servirá de base
 * para el CRM posterior.
 *
 * Requisitos en .env:
 *   GMAIL_USER=tu-cuenta@gmail.com
 *   GMAIL_APP_PASS=xxxxxxxxxxxxxxxx  (App Password de 16 dígitos)
 *
 * Uso:
 *   node clientes/enviar-campana.mjs            # envía a los pendientes
 *   node clientes/enviar-campana.mjs --solo=1   # solo al index 1 (prueba)
 *   node clientes/enviar-campana.mjs --dry      # solo genera HTML, no envía
 */

import nodemailer from 'nodemailer'
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
const GMAIL_USER = env.GMAIL_USER
const GMAIL_APP_PASS = (env.GMAIL_APP_PASS || env['GOOGLE-APP-KEY'] || '').replace(/\s+/g, '')

if (!GMAIL_USER || !GMAIL_APP_PASS) {
  console.error('Faltan GMAIL_USER y (GMAIL_APP_PASS o GOOGLE-APP-KEY) en .env. Consulta el comentario del script.')
  process.exit(1)
}

const BASE_URL = 'https://padelorganizers.vercel.app'
const BANNER_URL = `${BASE_URL}/images/banner-email.jpg`
const DEMO_URL = `${BASE_URL}/torneo?utm_source=email&utm_medium=campana&utm_campaign=presentacion&utm_content=demo`
const LOG_FILE = join(__dirname, 'campana_log.csv')
const LOCK = join(__dirname, '.campana_lock')

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}

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

function buildLog() {
  if (!existsSync(LOG_FILE)) {
    writeFileSync(LOG_FILE, 'idx,nombre,correo,direccion,plataforma,web,estado,fecha,error\n', 'utf8')
  }
  const text = readFileSync(LOG_FILE, 'utf8')
  const rows = parseCsv(text)
  if (!rows[0]) return []
  const headers = rows[0]
  return rows.slice(1).map((r) => {
    const o = {}
    headers.forEach((h, i) => { o[h] = r[i] ?? '' })
    return o
  })
}

function estadoDe(idx) {
  return buildLog().find((r) => r.idx === String(idx))?.estado || 'pendiente'
}

function marcar(idx, estado, error = '', club = {}) {
  const log = buildLog()
  const target = log.find((r) => r.idx === String(idx))
  const fecha = new Date().toISOString()
  const nombre = club['Nombre'] !== undefined ? club['Nombre'] : target?.nombre || ''
  const correo = club['Correo'] !== undefined ? club['Correo'] : target?.correo || ''
  const direccion = club['Dirección'] !== undefined ? club['Dirección'] : target?.direccion || ''
  const plataforma = club['Plataforma de Reserva'] !== undefined ? club['Plataforma de Reserva'] : target?.plataforma || ''
  const web = club['Página Web'] !== undefined ? club['Página Web'] : target?.web || ''
  if (target) {
    Object.assign(target, { nombre, correo, direccion, plataforma, web, estado, fecha, error })
  } else {
    log.push({ idx: String(idx), nombre, correo, direccion, plataforma, web, estado, fecha, error })
  }
  const headers = ['idx', 'nombre', 'correo', 'direccion', 'plataforma', 'web', 'estado', 'fecha', 'error']
  const lines = [headers.join(',')]
  for (const r of log) {
    lines.push(headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
  }
  writeFileSync(LOG_FILE, lines.join('\n'), 'utf8')
}

const clubes = parseCsv(readFileSync(join(__dirname, 'leads_vigo.csv'), 'utf8'))
const headers = clubes[0]
const clubs = clubes.slice(1).map((r) => {
  const o = {}
  headers.forEach((h, i) => { o[h] = r[i] ?? '' })
  return o
})

function personalizar(template, club, idx) {
  const nombre = club['Nombre'] || ''
  const aspecto = nombre.toLowerCase().includes('padel') ? 'tus pistas de pádel' : 'tus instalaciones'
  const web = club['Página Web'] && !/^N\/?A/i.test(club['Página Web']) ? club['Página Web'] : 'tu página web'
  const plato = club['Plataforma de Reserva'] || 'tu plataforma de reservas'
  return template
    .replaceAll('{{NOMBRE_CLUB}}', nombre)
    .replaceAll('{{DIRECCION}}', club['Dirección'] || 'tu club')
    .replaceAll('{{ASPECTO_DESTACADO}}', aspecto)
    .replaceAll('{{PLATAFORMA_RESERVA}}', plato)
    .replaceAll('{{WEB_CLUB}}', web)
    .replaceAll('{{BANNER_URL}}', BANNER_URL)
    .replaceAll('{{DEMO_URL}}', `${DEMO_URL}&club=${encodeURIComponent(nombre)}`)
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS },
  tls: env.SMTP_ALLOW_INSECURE === '1'
    ? { rejectUnauthorized: false }   // p.ej. cuando Avast/antivirus intercepta el SMTP
    : undefined,
});

const template = readFileSync(join(__dirname, 'plantilla-primer-contacto.html'), 'utf8')

let targetIdx = null
if (args.solo !== undefined) targetIdx = Number(args.solo)
if (args.dry !== undefined) {
  const club = clubs[targetIdx ?? 0]
  const html = personalizar(template, club, targetIdx ?? 0)
  const out = join(__dirname, 'preview-email.html')
  writeFileSync(out, html, 'utf8')
  console.log(`[dry] ${club['Nombre']} -> ${club['Correo']}. HTML en ${join('clientes', 'preview-email.html')}`)
  process.exit(0)
}

async function main() {
  console.log(`Transporte Gmail configurado para ${GMAIL_USER}. Clubes: ${clubs.length}.`)
  for (let i = 0; i < clubs.length; i++) {
    if (targetIdx !== null && i !== targetIdx) continue
    const club = clubs[i]
    const correo = (club['Correo'] || '').trim()
    const estado = estadoDe(i)
    if (estado === 'ok') {
      console.log(`- [${i}] ${club['Nombre']}: ya enviado, salto.`)
      continue
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      console.log(`- [${i}] ${club['Nombre']}: correo no válido ("${correo}"), registro como 'sin-correo'.`)
      marcar(i, 'sin-correo', 'email inválido o vía web', club)
      continue
    }
    const html = personalizar(template, club, i)
    const mail = {
      from: `Padel Organizers <${GMAIL_USER}>`,
      to: correo,
      subject: `${club['Nombre']} — tu gestión de torneos de pádel en 1 clic`,
      html,
    }
    try {
      await transporter.sendMail(mail)
      marcar(i, 'ok', '', club)
      console.log(`- [${i}] ENVIADO a ${correo} (${club['Nombre']}).`)
    } catch (err) {
      marcar(i, 'fallo', String(err.message || err), club)
      console.error(`- [${i}] FALLO ${correo}: ${String(err.message || err)}`)
    }
    await new Promise((r) => setTimeout(r, 4500))
  }
  console.log('\nListo. Registro completo en clientes/campana_log.csv (base del CRM).')
}

main().catch((e) => { console.error(e); process.exit(1) })