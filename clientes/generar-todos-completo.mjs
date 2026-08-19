import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
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

const esc = (t) => `"${String(t ?? '').replace(/"/g, '""')}"`

const excluidos = new Set([
  'leads_todos.csv', 'leads_todos_completo.csv', 'leads_federaciones.csv',
  'leads_escuelas.csv', 'leads_palma.csv', 'leads_vigo.csv',
])

const ficheros = readdirSync(__dirname)
  .filter(f => /^leads_[a-z0-9-]+\.csv$/.test(f) && !excluidos.has(f))
  .sort()

const header = ['Nombre', 'Pistas', 'Dirección', 'Teléfono', 'Correo', 'Página Web', 'Plataforma de Reserva']
const porNombre = new Map()

for (const f of ficheros) {
  const txt = readFileSync(join(__dirname, f), 'utf8')
  const lines = txt.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim())
  const h = csvParseLine(lines[0]).map(x => x.trim())
  for (const line of lines.slice(1)) {
    const v = csvParseLine(line)
    const o = {}; h.forEach((k, i) => { o[k] = (v[i] ?? '').trim() })
    if (!o['Nombre']) continue
    const clave = o['Nombre'].toLowerCase().trim()
    if (!porNombre.has(clave)) porNombre.set(clave, o)
    else {
      // priorizar el registro que tiene email
      const exist = porNombre.get(clave)
      if (!exist['Correo'] && o['Correo']) porNombre.set(clave, o)
    }
  }
}

const rows = Array.from(porNombre.values())
const lines = [header.map(esc).join(',')]
for (const r of rows) {
  lines.push(header.map(k => esc(r[k])).join(','))
}
const out = join(__dirname, 'leads_todos_completo.csv')
writeFileSync(out, lines.join('\n'), 'utf8')
const conEmail = rows.filter(r => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(r['Correo'])).length
console.log(`leads_todos_completo.csv: ${rows.length} clubes (${conEmail} con email)`)