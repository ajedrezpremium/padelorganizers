/**
 * generar-seed-directorio.mjs — Genera las entradas de CLUBES_SEMILLA a partir
 * de los CSVs de leads y las inserta en src/services/clubDirectoryService.js.
 * También escribe la migración SQL supabase/migrations/20260819000000_directorio_masivo_padelizados.sql
 * con los mismos clubes (idempotente por slug).
 *
 * Uso: node clientes/generar-seed-directorio.mjs
 *   --escribir   aplica los cambios en el archivo (sin flag solo imprime conteo)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'src', 'services', 'clubDirectoryService.js')
const SQL_OUT = join(__dirname, '..', 'supabase', 'migrations', '20260819000000_directorio_masivo_padelizados.sql')
const args = {}
for (const a of process.argv.slice(2)) { if (a === '--escribir') args.escribir = true }

// ciudad -> provincia (aproximada, solo para el directorio)
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
  'Vitoria-Gasteiz': 'Álava', 'Zamora': 'Zamora', 'Zaragoza': 'Zaragoza',
  'Vigo': 'Pontevedra',
}

function slug(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
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

// Ignoramos consolidados/segmentos especiales; solo ciudades + escuelas.
const ficheros = readdirSync(join(__dirname, '..', 'clientes'))
  .filter(f => /^leads_[a-z0-9-]+\.csv$/.test(f))
  .filter(f => !['leads_todos.csv', 'leads_federaciones.csv', 'leads_palma.csv', 'leads_vigo.csv'].includes(f))
  .sort()

// Reutiliza los patrones de emails placeholder de limpiar-leads.mjs
const EMAIL_MALO = [
  /example\./i, /your(?:site|domain|mail)/i, /hostinger/i, /^\s*xxx@/i,
  /mail@ejemplo/i, /@ejemplo\./i, /@padel\.com$/i, /@agpd\.es/i,
  /wixpress/i, /@[a-z]*\.sites/i, /info@[a-z]*\.fair/i, /wetelecom/i,
  /arcmultimedia/i, /^[a-z]{1,2}x{2,}[a-z]*@/i,
]
const esEmailOk = (e) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e) && !EMAIL_MALO.some(re => re.test(e))

const clubes = []
let next = 1000
for (const f of ficheros) {
  const ciudad = f.replace('leads_', '').replace('.csv', '')
  const txt = readFileSync(join(__dirname, '..', 'clientes', f), 'utf8')
  const lines = txt.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) continue
  const header = csvParseLine(lines[0]).map(h => h.trim())
  for (const line of lines.slice(1)) {
    const v = csvParseLine(line)
    const o = {}; header.forEach((h, i) => { o[h] = (v[i] ?? '').trim() })
    const nombre = o['Nombre']
    if (!nombre) continue
    const email = o['Correo'] || ''
    const emailOk = esEmailOk(email)
    const phone = o['Teléfono'] || ''
    clubes.push({
      id: `c-${next++}`,
      name: nombre,
      city: ciudad === 'palma-de-mallorca' ? 'Palma de Mallorca' : ciudad.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      province: PROVINCIA[ciudad] || '',
      country: 'ES',
      address: o['Dirección'] || '',
      latitude: null, longitude: null, geo_approx: true,
      phone: phone ? `+34 ${phone.replace(/^\+34\s?/, '')}` : '',
      email: emailOk ? email : '',
      website: (o['Página Web'] || '').replace(/^mailto:/i, ''),
      courts: '', indoor: null, grass: '',
      booking_platform: 'N/A',
      has_school: /escuela|school|academy|training|formaci/i.test(nombre),
      has_shop: false,
      is_verified: false, is_featured: false, status: 'pendiente_verificacion',
      description: '',
    })
  }
}

console.log(`Clubes generados desde CSVs: ${clubes.length}`)
const conEmail = clubes.filter(c => c.email).length
console.log(`Con email: ${conEmail}`)
const conTelefono = clubes.filter(c => c.phone).length
console.log(`Con teléfono: ${conTelefono}`)

if (args.escribir) {
  const src = readFileSync(OUT, 'utf8')
  // Localizar el array de CLUBES_SEMILLA y su cierre real.
  const ini = src.indexOf('export const CLUBES_SEMILLA')
  const open = src.indexOf('[', ini)
  const cierre = src.indexOf('];', open)
  if (open === -1 || cierre === -1) { console.error('No se encontró el array CLUBES_SEMILLA'); process.exit(1) }
  const antes = src.slice(0, cierre)          // hasta el último cierre de objeto
  const despues = src.slice(cierre)           // desde '];' en adelante
  const js = clubes.map(c => {
    const q = (v) => JSON.stringify(v ?? '')
    return `  {\n    id: ${q(c.id)}, name: ${q(c.name)}, city: ${q(c.city)}, province: ${q(c.province)}, country: ${q(c.country)},\n    address: ${q(c.address)}, latitude: null, longitude: null, geo_approx: true,\n    phone: ${q(c.phone)}, email: ${q(c.email)}, website: ${q(c.website)},\n    courts: ${q(c.courts)}, indoor: null, grass: ${q(c.grass)}, booking_platform: ${q(c.booking_platform)},\n    has_school: ${c.has_school}, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',\n    description: ${q(c.description)},\n  },`
  }).join('\n')
  const nuevo = antes + '\n' + js + '\n' + despues
  writeFileSync(OUT, nuevo, 'utf8')
  console.log(`Insertadas ${clubes.length} entradas en CLUBES_SEMILLA (${OUT})`)

  // Migración SQL idempotente (ON CONFLICT slug).
  const esc = (v) => String(v ?? '').replace(/'/g, "''")
  const bloques = clubes.map(c => {
    const rows = [
      `  ('${esc(c.name)}', '${esc(slug(c.name))}', '${esc(c.city)}', '${esc(c.province)}',`,
      `   '${esc(c.address)}', null, null, true,`,
      `   '${esc(c.phone)}', '${esc(c.email)}', '${esc(c.website)}',`,
      `   '${esc(c.courts)}', null, '${esc(c.grass)}', 'N/A',`,
      `   ${c.has_school}, false, false, 'pendiente_verificacion',`,
      `   '${esc(c.description)}')`,
    ].join('\n')
    return rows
  })
  const sql = `-- ============================================================\n` +
    `-- PADELORGANIZERS.COM — Directorio masivo desde padelizados.es\n` +
    `-- ${clubes.length} clubes/escuelas reales (${Object.keys(PROVINCIA).length} provincias).\n` +
    `-- Idempotente: reejecutable sin duplicar (ON CONFLICT slug).\n` +
    `-- ============================================================\n\n` +
    `insert into public.clubes\n` +
    `  (name, slug, city, province, address, latitude, longitude, geo_approx,\n` +
    `   phone, email, website, courts, indoor, grass, booking_platform,\n` +
    `   has_school, has_shop, is_verified, status, description)\n` +
    `values\n` +
    bloques.join(',\n') + '\n' +
    `on conflict (slug) do nothing;\n`
  writeFileSync(SQL_OUT, sql, 'utf8')
  console.log(`Escrita migración SQL con ${clubes.length} clubes (${SQL_OUT})`)
} else {
  console.log('Ejecuta con --escribir para aplicar los cambios.')
}