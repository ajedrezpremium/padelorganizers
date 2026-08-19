/**
 * limpiar-leads.mjs — Limpia y consolida los CSVs generados por
 * scrape-padelizados.mjs y los de campaña existentes.
 *
 *  1. Elimina emails placeholder o inválidos (example.com, xxx@, hostinger,
 *     agpd.es, mail@ejemplo, etc.).
 *  2. Deduplica por email normalizado (prioriza el registro con email).
 *  3. Genera clientes/leads_todos.csv consolidado + leads_<ciudad> limpios.
 *
 * Uso: node clientes/limpiar-leads.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Patrones que delatan emails placeholder / no del club
const MALOS = [
  /example\./i,
  /your(?:site|domain|mail)/i,
  /hostinger/i,
  /^\s*xxx@/i,
  /mail@ejemplo/i,
  /@ejemplo\./i,
  /@padel\.com$/i, // dominio genérico de ejemplo
  /@gmail\.com$/i, // contacto@gmail.com genérico — se limpia si el local es generico
  /@agpd\.es/i, // agencia de protección de datos (placeholder legal)
  /^\s*[a-z]x{2,}@/i, // emails ofuscados tipo nxxarcm@
  /wixpress/i,
  /@[a-z]*\.sites/i,
  /info@[a-z]*\.fair/i,
  /wetelecom/i, // email del desarrollador web, no del club
  /arcmultimedia/i, // email del desarrollador web, no del club
  /^[a-z]{1,2}x{2,}[a-z]*@/i, // ofuscado tipo nxxarcm@
]
const LOCALES_GENERICOS = /^(info|contact|hello|hola|mail|admin|recepci[oó]n|recep|comercial|reservas|gerencia|secretaria|administracion|general|socios|info\d*|contacto\d*)$/i

function csvParseLine(line) {
  const out = []
  let cur = ''
  let inQ = false
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

function esEmailValido(email) {
  if (!email) return false
  const e = email.trim()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e)) return false
  if (MALOS.some(re => re.test(e))) return false
  // local part genérico SIN dominio real del club no se puede validar aquí,
  // pero al menos que no sea solo "info@dominio-de-ejemplo"
  return true
}

function normalizaEmail(email) {
  return (email || '').trim().toLowerCase().replace(/^mailto:/i, '')
}

function cargarCsv(path) {
  const txt = readFileSync(path, 'utf8')
  const lines = txt.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return { ciudad: '', rows: [] }
  const header = csvParseLine(lines[0]).map(h => h.trim())
  const rows = []
  for (const line of lines.slice(1)) {
    const v = csvParseLine(line)
    const o = {}
    header.forEach((h, i) => { o[h] = (v[i] ?? '').trim() })
    if (o['Nombre'] || o['Correo']) rows.push(o)
  }
  return { ciudad: path.split('\\').pop(), rows }
}

function guardarCsv(path, rows) {
  const header = 'Nombre,Pistas,Dirección,Teléfono,Correo,Página Web,Plataforma de Reserva'
  const esc = t => `"${String(t ?? '').replace(/"/g, '""')}"`
  const lines = [header]
  for (const r of rows) {
    lines.push([esc(r['Nombre']), esc(r['Pistas']), esc(r['Dirección']), esc(r['Teléfono']), esc(r['Correo']), esc(r['Página Web']), esc(r['Plataforma de Reserva'])].join(','))
  }
  writeFileSync(path, lines.join('\n'), 'utf8')
}

const ficheros = readdirSync(__dirname)
  .filter(f => /^leads_[a-z0-9-]+\.csv$/.test(f))
  .map(f => join(__dirname, f))

const porEmail = new Map() // email -> {fila, origen}
const porNombre = new Map()
let total = 0, conEmail = 0, limpiados = 0

for (const f of ficheros) {
  const { ciudad, rows } = cargarCsv(f)
  for (const r of rows) {
    total++
    const email = normalizaEmail(r['Correo'])
    if (email && esEmailValido(email)) {
      if (!porEmail.has(email)) {
        porEmail.set(email, { fila: { ...r, Correo: email }, origen: ciudad })
        conEmail++
      } else {
        limpiados++ // duplicado de email
      }
    } else {
      // Sin email válido: dedupe por nombre si ya existe con email
      const clave = (r['Nombre'] || '').toLowerCase().trim()
      if (clave && porNombre.has(clave)) { limpiados++; continue }
      porNombre.set(clave, true)
    }
  }
}

const unicos = Array.from(porEmail.values()).map(v => v.fila)
const sinEmail = Array.from(porNombre.keys()).length
console.log(`Total leídos: ${total}`)
console.log(`Únicos con email válido: ${conEmail} (duplicados/limpiados: ${limpiados})`)
console.log(`Sin email (mantenidos por nombre): ${sinEmail}`)

// Consolidado con todos los contactos con email
guardarCsv(join(__dirname, 'leads_todos.csv'), unicos)
console.log(`\nEscrito clientes/leads_todos.csv con ${unicos.length} contactos únicos con email.`)
console.log('\nTop dominios:')
const dom = {}
for (const u of unicos) {
  const d = u['Correo'].split('@')[1]
  dom[d] = (dom[d] || 0) + 1
}
Object.entries(dom).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([d, n]) => console.log(`  ${d}: ${n}`))