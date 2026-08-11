/**
 * enviar-verificacion.mjs — Campaña "Verifica tu ficha" (fase 3 directorio)
 *
 * Comienza donde acabó enviar-campana.mjs: cada club ya recibió el correo de
 * presentación de Padel Organizers. Este segundo contacto le pide CONFIRMAR su
 * ficha del directorio con un enlace mágico. La confirmación otorga la insignia
 * "Verificado" (solo vía RPC confirmar_verificacion, con token aleatorio).
 *
 * Flujo (en este orden):
 *   1) node clientes/enviar-verificacion.mjs --tokens   → genera un token
 *      aleatorio por club, calcula su sha256 y escribe el SQL de carga:
 *      clientes/tokens_verificacion.sql  (PEGAR en el SQL Editor de Supabase)
 *      y guarda los tokens en claro en clientes/tokens_verificacion.json.
 *   2) Pegar y ejecutar tokens_verificacion.sql en Supabase SQL Editor.
 *   3) node clientes/enviar-verificacion.mjs --dry       → revisa un HTML
 *   4) node clientes/enviar-verificacion.mjs --solo=0    → prueba un envío
 *   5) node clientes/enviar-verificacion.mjs             → envía a todos
 *
 * Reutiliza campana_log.csv: los clubes ya 'ok' en la campaña 1 se saltan,
 * salvo --fase=verificacion que gestiona este envío con log propio
 * (clientes/verificacion_log.csv).
 *
 * Requisitos en .env: GMAIL_USER + (GMAIL_APP_PASS o GOOGLE-APP-KEY).
 */

import nodemailer from 'nodemailer'
import crypto from 'node:crypto'
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
  console.error('Faltan GMAIL_USER y (GMAIL_APP_PASS o GOOGLE-APP-KEY) en .env.')
  process.exit(1)
}

const BASE_URL = 'https://padelorganizers.vercel.app'
const DEMO_URL = `${BASE_URL}/torneo?utm_source=email&utm_medium=campana&utm_campaign=verificacion&utm_content=demo`
const DIRECTORY_URL = `${BASE_URL}/clubes`
const TOKENS_SQL = join(__dirname, 'tokens_verificacion.sql')
const TOKENS_JSON = join(__dirname, 'tokens_verificacion.json')
const CAMPANA_LOG = join(__dirname, 'campana_log.csv')
const VERIF_LOG = join(__dirname, 'verificacion_log.csv')

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

function readCsvLog(path) {
  if (!existsSync(path)) return { headers: null, rows: [] }
  const rows = parseCsv(readFileSync(path, 'utf8'))
  return { headers: rows[0], rows: rows.slice(1) }
}

const { rows: campanaRows } = readCsvLog(CAMPANA_LOG)

// El estado "ok" de la campaña de presentación indica que el club sí recibió
// el primer correo -> candidato a recibir el de verificación.
const okAnteriores = new Set(campanaRows.filter((r) => r[6] === 'ok').map((r) => r[0]))

function cargarClubes() {
  const fuentes = []
  for (const f of ['leads_vigo.csv', 'leads_madrid.csv']) {
    const path = join(__dirname, f)
    if (existsSync(path)) {
      const rows = parseCsv(readFileSync(path, 'utf8'))
      const headers = rows[0]
      for (const r of rows.slice(1)) {
        const o = {}
        headers.forEach((h, i) => { o[h] = r[i] ?? '' })
        fuentes.push(o)
      }
    }
  }
  return fuentes
}

const clubes = cargarClubes()

// Slugs reales desde Supabase (la columna slug puede diferir del derivado del
// nombre, p.ej. "Círculo Cultural Mercantil…" -> circulo-mercantil-vigo).
const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON = env.VITE_SUPABASE_ANON_KEY
let CLUBES_BD = []
async function cargarClubesBD() {
  if (!SUPABASE_URL || !SUPABASE_ANON) return
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/clubes?select=id,slug,name,email`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    })
    if (r.ok) CLUBES_BD = await r.json()
  } catch {}
}
function normalize(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
function clubBDPorNombre(nombre) {
  const n = normalize(nombre)
  const ALIAS = {
    'real-club-nautico-de-vigo-instalaciones-los-abetos': 'real-club-nautico-vigo-los-abetos',
    'complexo-deportivo-de-samil-municipal-imd': 'complexo-deportivo-samil-imd',
  }
  const directo = CLUBES_BD.find((c) => normalize(c.name) === n)
  if (directo) return directo
  const alias = ALIAS[slugDe(nombre)]
  if (alias) return CLUBES_BD.find((c) => c.slug === alias) || null
  return CLUBES_BD.find((c) => slugDe(c.name) === slugDe(nombre)) || null
}

function slugDe(nombre) {
  return String(nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---- Modo --tokens: generar tokens + SQL de carga de hash --------------
if (args.tokens !== undefined) {
  await cargarClubesBD()
  const map = {}
  const lines = ['-- Padel Organizers · Fase 3: carga de tokens de verificación',
    '-- Ejecutar en Supabase SQL Editor (solo una vez). Los tokens en claro',
    '-- NUNCA se guardan en la BD; solo su sha256.',
    '']
  let sinBD = 0
  for (const c of clubes) {
    const idx = clubes.indexOf(c)
    if (!okAnteriores.has(String(idx))) continue
    const bd = clubBDPorNombre(c['Nombre'])
    const token = crypto.randomBytes(24).toString('hex')
    const sha = crypto.createHash('sha256').update(token).digest('hex')
    const slug = bd ? bd.slug : slugDe(c['Nombre'])
    const clubId = bd ? bd.id : ''
    if (!bd) { sinBD++; console.warn(`  ! ${c['Nombre']}: sin match en BD, uso slug derivado (${slug}).`) }
    map[String(idx)] = { nombre: c['Nombre'], correo: c['Correo'], slug, clubId, token }
    lines.push(`update public.clubes set claim_token_sha = '${sha}' where slug = '${slug}';`)
  }
  writeFileSync(TOKENS_SQL, lines.join('\n') + '\n')
  writeFileSync(TOKENS_JSON, JSON.stringify(map, null, 2))
  const n = Object.keys(map).length
  console.log(`Tokens generados: ${n} clubes${sinBD ? ` (${sinBD} sin match en BD)` : ''}.`)
  console.log(`→ SQL en  clientes/tokens_verificacion.sql (PEGAR en Supabase SQL Editor)`)
  console.log(`→ JSON en clientes/tokens_verificacion.json (tokens en claro, para el resto de la campaña)`)
  process.exit(0)
}

// ---- Cargar tokens ------------------------------------------------------
if (!existsSync(TOKENS_JSON)) {
  console.error('No existe tokens_verificacion.json. Ejecuta primero: node clientes/enviar-verificacion.mjs --tokens')
  process.exit(1)
}
const tokens = JSON.parse(readFileSync(TOKENS_JSON, 'utf8'))

function buildLog() {
  if (!existsSync(VERIF_LOG)) {
    writeFileSync(VERIF_LOG, 'idx,nombre,correo,estado,fecha,error\n', 'utf8')
    return []
  }
  const { headers, rows } = readCsvLog(VERIF_LOG)
  return rows.map((r) => {
    const o = {}
    headers.forEach((h, i) => { o[h] = r[i] ?? '' })
    return o
  })
}
function marcar(idx, estado, error = '') {
  const log = buildLog()
  const target = tokens[idx]
  const fecha = new Date().toISOString()
  let entry = log.find((r) => r.idx === String(idx))
  if (entry) { Object.assign(entry, { estado, fecha, error }) }
  else if (target) { log.push({ idx: String(idx), nombre: target.nombre, correo: target.correo, estado, fecha, error }) }
  const lines = ['idx,nombre,correo,estado,fecha,error']
  for (const r of log) lines.push(`"${String(r.idx)}","${String(r.nombre)}","${String(r.correo)}","${String(r.estado)}","${String(r.fecha)}","${String(r.error).replace(/"/g, '""')}"`)
  writeFileSync(VERIF_LOG, lines.join('\n'), 'utf8')
}
function estadoDe(idx) {
  return buildLog().find((r) => r.idx === String(idx))?.estado || 'pendiente'
}

const template = readFileSync(join(__dirname, 'plantilla-verificacion.html'), 'utf8')

function personalizar(c, token) {
  const nombre = c['Nombre'] || ''
  const clave = token.clubId || token.slug
  return template
    .replaceAll('{{NOMBRE_CLUB}}', nombre)
    .replaceAll('{{CLUB_URL}}', `${DIRECTORY_URL}?club=${encodeURIComponent(clave)}`)
    .replaceAll('{{VERIFY_URL}}', `${BASE_URL}/verificar?club=${encodeURIComponent(clave)}&t=${encodeURIComponent(token.token)}`)
    .replaceAll('{{DEMO_URL}}', `${DEMO_URL}&club=${encodeURIComponent(nombre)}`)
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS },
  tls: env.SMTP_ALLOW_INSECURE === '1' ? { rejectUnauthorized: false } : undefined,
})

const targetIdx = args.solo !== undefined ? Number(args.solo) : null

function clubesObjetivo() {
  const out = []
  for (const c of clubes) {
    const i = clubes.indexOf(c)
    if (targetIdx !== null && i !== targetIdx) continue
    if (!okAnteriores.has(String(i))) continue
    if (!tokens[i]) { console.log(`- [${i}] ${c['Nombre']}: sin token (¿no se generó?).`); continue }
    out.push({ i, c, t: tokens[i] })
  }
  return out
}

async function main() {
  const lista = clubesObjetivo()
  console.log(`Clubes objetivo de verificación: ${lista.length}.`)
  if (args.dry !== undefined) {
    const { c, t } = lista[0]
    const html = personalizar(c, t)
    writeFileSync(join(__dirname, 'preview-verificacion.html'), html, 'utf8')
    console.log(`[dry] ${c['Nombre']} -> ${c['Correo']}. HTML en clientes/preview-verificacion.html`)
    console.log(`[dry] Enlace: ${BASE_URL}/verificar?club=${t.slug}&t=${t.token}`)
    process.exit(0)
  }
  for (const { i, c, t } of lista) {
    const correo = (c['Correo'] || '').trim()
    const estado = estadoDe(i)
    if (estado === 'ok') { console.log(`- [${i}] ${c['Nombre']}: ya enviado.`); continue }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      marcar(i, 'sin-correo', 'email inválido')
      continue
    }
    const html = personalizar(c, t)
    try {
      await transporter.sendMail({ from: `Padel Organizers <${GMAIL_USER}>`, to: correo, subject: `Confirma la ficha de ${c['Nombre']} en el directorio de pádel ✓`, html })
      marcar(i, 'ok')
      console.log(`- [${i}] ENVIADO a ${correo} (${c['Nombre']}).`)
    } catch (err) {
      marcar(i, 'fallo', String(err.message || err))
      console.error(`- [${i}] FALLO ${correo}: ${String(err.message || err)}`)
    }
    await new Promise((r) => setTimeout(r, 4500))
  }
  console.log('\nListo. Registro en clientes/verificacion_log.csv.')
}

main().catch((e) => { console.error(e); process.exit(1) })