import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

function parseCsv(path) {
  if (!existsSync(path)) return []
  const text = readFileSync(path, 'utf8')
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const header = csvParseLine(lines[0]).map(h => h.trim())
  const rows = []
  for (const line of lines.slice(1)) {
    const v = csvParseLine(line)
    const o = {}; header.forEach((h, i) => { o[h] = (v[i] ?? '').trim() })
    rows.push(o)
  }
  return rows
}

// 1. Todos los emails ya procesados (ok/fallo/sin-correo/rebote) desde todos los logs
const procesados = new Map() // email -> estado
const logFiles = readdirSync(__dirname).filter(f => /^campana_log(_leads_\w+)?\.csv$/.test(f))
for (const f of logFiles) {
  for (const r of parseCsv(join(__dirname, f))) {
    const email = (r.correo || '').toLowerCase().trim()
    if (!email) continue
    // prioriza estado definitivo: ok > rebote > fallo > pendiente
    if (!procesados.has(email) || r.estado === 'ok') procesados.set(email, r.estado)
  }
}
// rebotes.csv: destinos que rebotaron (con cualquier remitente)
if (existsSync(join(__dirname, 'rebotes.csv'))) {
  for (const r of parseCsv(join(__dirname, 'rebotes.csv'))) {
    const email = (r.destinatario || '').toLowerCase().trim()
    if (email && !procesados.has(email)) procesados.set(email, 'rebote')
  }
}

// 2. Base de contactos de padelizados
const todos = parseCsv(join(__dirname, 'leads_todos_completo.csv'))
const EMAIL_MALO = [
  /example\./i, /your(?:site|domain|mail)/i, /hostinger/i, /^\s*xxx@/i,
  /mail@ejemplo/i, /@ejemplo\./i, /@padel\.com$/i, /@agpd\.es/i,
  /wixpress/i, /@[a-z]*\.sites/i, /info@[a-z]*\.fair/i, /wetelecom/i,
  /arcmultimedia/i, /^[a-z]{1,2}x{2,}[a-z]*@/i,
]
const esEmailOk = (e) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e) && !EMAIL_MALO.some(re => re.test(e))

const pendientes = []
const yaProcesados = []
const sinCorreo = []
for (const c of todos) {
  const email = (c.Correo || '').toLowerCase().trim()
  if (!esEmailOk(email)) { sinCorreo.push(c); continue }
  if (procesados.has(email)) { yaProcesados.push({ ...c, estado: procesados.get(email) }); continue }
  pendientes.push(c)
}

console.log(`Total leads: ${todos.length}`)
console.log(`Sin email válido: ${sinCorreo.length}`)
console.log(`Ya procesados (ok/rebote/sin-correo): ${yaProcesados.length}`)
const porEstado = {}
for (const p of yaProcesados) porEstado[p.estado] = (porEstado[p.estado] || 0) + 1
console.log('  Estado de los ya procesados:', JSON.stringify(porEstado))
console.log(`PENDIENTES DE ENVIAR: ${pendientes.length}`)

// Generar CSV de pendientes
const esc = (t) => `"${String(t ?? '').replace(/"/g, '""')}"`
const header = ['Nombre', 'Pistas', 'Dirección', 'Teléfono', 'Correo', 'Página Web', 'Plataforma de Reserva']
const lines = [header.map(esc).join(',')]
for (const c of pendientes) lines.push(header.map(k => esc(c[k])).join(','))
writeFileSync(join(__dirname, 'leads_pendientes.csv'), lines.join('\n'), 'utf8')
console.log('CSV de pendientes en clientes/leads_pendientes.csv')
console.log('\nPrimeros 10 pendientes:')
for (const c of pendientes.slice(0, 10)) console.log(`  ${c.Nombre} <${c.Correo}>`)