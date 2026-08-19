/**
 * subir-directorio-supabase.mjs — Inserta/actualiza los clubes del directorio
 * en Supabase vía REST API (usa la ANON KEY + política clubes_insert con
 * check(true)). Upsert por `slug` (columna unique).
 *
 * Uso: node clientes/subir-directorio-supabase.mjs [--limite=N] [--solo=slug1,slug2]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}

function loadEnv() {
  const txt = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  const get = (k) => {
    const l = txt.split(/\r?\n/).find(l => l.startsWith(k + '='))
    return l ? l.slice(k.length + 1).trim() : ''
  }
  const url = process.env.SUPABASE_URL || get('VITE_SUPABASE_URL')
  const key = process.env.SUPABASE_SERVICE_ROLE || get('VITE_SUPABASE_ANON_KEY')
  return { url, key }
}

const { url, key } = loadEnv()
if (!url || !key) { console.error('Faltan credenciales (.env o SUPABASE_URL/SUPABASE_SERVICE_ROLE)'); process.exit(1) }

function slug(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

function csvParseLine(line) {
  const out = []; let cur = ''; let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (c === '"') inQ = false
      else cur += c
    } else {
      if (c === '"') inQ = true
      else if (c === ',') { out.push(cur); cur = '' }
      else cur += c
    }
  }
  out.push(cur)
  return out
}

const PROVINCIA = {
  'A Coruña': 'A Coruña', 'Albacete': 'Albacete', 'Alicante': 'Alicante', 'Almería': 'Almería',
  'Ávila': 'Ávila', 'Badajoz': 'Badajoz', 'Barcelona': 'Barcelona', 'Bilbao': 'Bizkaia',
  'Burgos': 'Burgos', 'Cádiz': 'Cádiz', 'Castellón': 'Castellón', 'Ceuta': 'Ceuta',
  'Ciudad Real': 'Ciudad Real', 'Córdoba': 'Córdoba', 'Cuenca': 'Cuenca',
  'Donostia-San Sebastián': 'Gipuzkoa', 'Girona': 'Girona', 'Granada': 'Granada',
  'Huelva': 'Huelva', 'Huesca': 'Huesca', 'Jaén': 'Jaén', 'León': 'León', 'Lleida': 'Lleida',
  'Logroño': 'La Rioja', 'Lugo': 'Lugo', 'Madrid': 'Madrid', 'Málaga': 'Málaga',
  'Melilla': 'Melilla', 'Murcia': 'Murcia', 'Ourense': 'Ourense', 'Oviedo': 'Asturias',
  'Palencia': 'Palencia', 'Palma de Mallorca': 'Illes Balears', 'Pamplona': 'Navarra',
  'Pontevedra': 'Pontevedra', 'Salamanca': 'Salamanca', 'Santander': 'Cantabria',
  'Segovia': 'Segovia', 'Sevilla': 'Sevilla', 'Tarragona': 'Tarragona', 'Teruel': 'Teruel',
  'Toledo': 'Toledo', 'Valencia': 'Valencia', 'Valladolid': 'Valladolid',
  'Vitoria-Gasteiz': 'Álava', 'Zamora': 'Zamora', 'Zaragoza': 'Zaragoza', 'Vigo': 'Pontevedra',
}

const EMAIL_MALO = [
  /example\./i, /your(?:site|domain|mail)/i, /hostinger/i, /^\s*xxx@/i,
  /mail@ejemplo/i, /@ejemplo\./i, /@padel\.com$/i, /@agpd\.es/i,
  /wixpress/i, /@[a-z]*\.sites/i, /info@[a-z]*\.fair/i, /wetelecom/i,
  /arcmultimedia/i, /^[a-z]{1,2}x{2,}[a-z]*@/i,
]
const esEmailOk = (e) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e) && !EMAIL_MALO.some(re => re.test(e))

const ficheros = ['leads_todos.csv'] // consolidado único por email
const todos = []
for (const f of ficheros) {
  const txt = readFileSync(join(__dirname, f), 'utf8')
  const lines = txt.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim())
  const header = csvParseLine(lines[0]).map(h => h.trim())
  for (const line of lines.slice(1)) {
    const v = csvParseLine(line)
    const o = {}; header.forEach((h, i) => { o[h] = (v[i] ?? '').trim() })
    if (!o['Nombre']) continue
    todos.push(o)
  }
}

// Si existe leads_todos_completo.csv (todos los clubes, con o sin email),
// se usa en su lugar.
const completoPath = join(__dirname, 'leads_todos_completo.csv')
if (existsSync(completoPath)) {
  const txt = readFileSync(completoPath, 'utf8')
  const lines = txt.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim())
  const header = csvParseLine(lines[0]).map(h => h.trim())
  todos.length = 0
  for (const line of lines.slice(1)) {
    const v = csvParseLine(line)
    const o = {}; header.forEach((h, i) => { o[h] = (v[i] ?? '').trim() })
    if (!o['Nombre']) continue
    todos.push(o)
  }
}

let clubes = todos.map(o => {
  const email = esEmailOk(o['Correo']) ? o['Correo'].trim() : ''
  const address = o['Dirección'] || ''
  const cityRaw = (address.match(/, (\d{5}), ([^,]+)$/) || [])[2] || ''
  const city = cityRaw.trim()
  const province = PROVINCIA[city] || ''
  return {
    name: o['Nombre'],
    slug: slug(o['Nombre']),
    city: city || 'España',
    province,
    address,
    latitude: null, longitude: null, geo_approx: true,
    phone: o['Teléfono'] || '',
    email,
    website: o['Página Web'] || '',
    courts: o['Pistas'] || '',
    indoor: null, grass: '', booking_platform: o['Plataforma de Reserva'] || 'N/A',
    has_school: /escuela|school|academy|training|formaci/i.test(o['Nombre']),
    has_shop: false,
    is_verified: false,
    status: 'pendiente_verificacion',
    description: '',
  }
})

if (args.limite) clubes = clubes.slice(0, Number(args.limite))
if (args.solo) {
  const sels = new Set(args.solo.split(',').map(s => s.trim()))
  clubes = clubes.filter(c => sels.has(c.slug))
}

console.log(`Subiendo ${clubes.length} clubes a ${url}...`)

const endpoint = `${url}/rest/v1/clubes?on_conflict=slug`
const headers = {
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates',
}

// Lotes de 50
const LOTE = 50
let ok = 0, err = 0
for (let i = 0; i < clubes.length; i += LOTE) {
  const lote = clubes.slice(i, i + LOTE)
  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(lote) })
  if (res.ok) { ok += lote.length }
  else {
    err += lote.length
    const text = await res.text()
    console.error(`Lote ${i / LOTE + 1} ERROR ${res.status}: ${text.slice(0, 400)}`)
  }
  process.stdout.write(`\r  ${i + lote.length}/${clubes.length} (ok=${ok} err=${err})`)
}
console.log(`\nListo: ${ok} ok, ${err} errores.`)