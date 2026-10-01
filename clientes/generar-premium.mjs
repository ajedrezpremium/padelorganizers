/**
 * generar-premium.mjs — Construye leads_premium.csv (alta calidad, ~100 contactos)
 * Fuentes: federaciones ES + INT + FIP + escuelas + top clubes (Madrid/Barcelona/Valencia/Sevilla/Vigo)
 * Dedupe por correo. Capado para ritmo 30/dia.
 * Uso: node clientes/generar-premium.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

function load(file) {
  const p = join(__dirname, file)
  if (!existsSync(p)) return []
  const rows = parseCsv(readFileSync(p, 'utf8'))
  const h = rows[0]
  return rows.slice(1).map(r => {
    const o = {}
    h.forEach((k, i) => { o[k] = r[i] ?? '' })
    return o
  })
}

function normEmail(e) { return (e || '').trim().toLowerCase() }
function validEmail(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && !/example|test|sales@yoursite|info@hostinger/i.test(e) }

const out = []
const seen = new Set()
function push(list, segmento, ciudad, prioridad) {
  for (const c of list) {
    const email = normEmail(c['Correo'] || c['correo'] || '')
    if (!validEmail(email) || seen.has(email)) continue
    seen.add(email)
    out.push({
      Nombre: c['Nombre'] || c['nombre'] || '',
      Correo: email,
      'Dirección': c['Dirección'] || c['direccion'] || '',
      'Teléfono': c['Teléfono'] || c['telefono'] || '',
      'Página Web': c['Página Web'] || c['web'] || '',
      'Plataforma de Reserva': c['Plataforma de Reserva'] || c['plataforma'] || 'N/A',
      Pistas: c['Pistas'] || '',
      Segmento: segmento,
      Ciudad: ciudad,
      Prioridad: String(prioridad),
    })
  }
}

// 1 = federaciones (max prioridad)
push(load('leads_fip.csv'), 'fip', 'int', 1)
push(load('leads_federaciones.csv'), 'federacion', 'espana', 1)
push(load('leads_federaciones_int.csv'), 'federacion', 'int', 1)
push(load('leads_federaciones_int_2.csv'), 'federacion', 'int', 1)
push(load('leads_federaciones_2.csv'), 'federacion', 'espana', 1)
// 2 = escuelas
push(load('leads_escuelas.csv'), 'escuela', 'espana', 2)
push(load('leads_escuelas_2.csv'), 'escuela', 'espana', 2)
// 3 = top clubes (con email valido, limitados para no diluir calidad)
const topClubes = [
  ...load('leads_madrid.csv').slice(0, 25),
  ...load('leads_barcelona.csv').slice(0, 20),
  ...load('leads_vigo.csv'),
  ...load('leads_valencia.csv'),
  ...load('leads_sevilla.csv').slice(0, 10),
]
push(topClubes, 'club', 'espana', 3)

out.sort((a, b) => Number(a.Prioridad) - Number(b.Prioridad))

const headers = ['Nombre','Correo','Dirección','Teléfono','Página Web','Plataforma de Reserva','Pistas','Segmento','Ciudad','Prioridad']
const lines = [headers.join(',')]
for (const r of out) lines.push(headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
writeFileSync(join(__dirname, 'leads_premium.csv'), lines.join('\n'), 'utf8')
console.log(`leads_premium.csv: ${out.length} contactos`)
console.log(' por segmento:', JSON.stringify(out.reduce((a, r) => { a[r.Segmento] = (a[r.Segmento]||0)+1; return a }, {})))
