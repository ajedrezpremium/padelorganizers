/**
 * gestionar-premium.mjs — Cuadro de mando de la campana premium (30/dia).
 * Uso:
 *   node clientes/gestionar-premium.mjs                  # estado + proximos 30
 *   node clientes/gestionar-premium.mjs --responde=3 --nota="quiere demo martes"
 *   node clientes/gestionar-premium.mjs --no-insistir=5   # dijo "no"
 *   node clientes/gestionar-premium.mjs --pendientes      # solo pendientes (prox. tanda)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOG = join(__dirname, 'campana_log_leads_premium.csv')
const CSV = join(__dirname, 'leads_premium.csv')

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

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-zA-Z_-]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}

function loadLog() {
  if (!existsSync(LOG)) return []
  const r = parseCsv(readFileSync(LOG, 'utf8'))
  const h = r[0]; return r.slice(1).map(x => { const o = {}; h.forEach((k, i) => { o[k] = x[i] ?? '' }); return o })
}
function saveLog(log) {
  const h = ['idx','nombre','correo','segmento','estado','fecha','error','respuesta']
  writeFileSync(LOG, [h.join(','), ...log.map(r => h.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n'), 'utf8')
}
function loadLeads() {
  const r = parseCsv(readFileSync(CSV, 'utf8'))
  const h = r[0]; return r.slice(1).map((x, i) => { const o = { _idx: i }; h.forEach((k, j) => { o[k] = x[j] ?? '' }); return o })
}

let log = loadLog()
if (args.responde !== undefined) {
  const idx = String(args.responde)
  const t = log.find(r => r.idx === idx)
  if (!t) { console.error(`idx ${idx} sin envio previo`); process.exit(1) }
  t.estado = 'respondido'; t.respuesta = String(args.nota || args['nota'] || 'respondio')
  t.fecha = new Date().toISOString(); saveLog(log)
  console.log(`[${idx}] marcado RESPONDIDO: ${t.respuesta}`); process.exit(0)
}
if (args['no-insistir'] !== undefined) {
  const idx = String(args['no-insistir'])
  const t = log.find(r => r.idx === idx)
  if (!t) { console.error(`idx ${idx} sin envio previo`); process.exit(1) }
  t.estado = 'no-insistir'; t.fecha = new Date().toISOString(); saveLog(log)
  console.log(`[${idx}] marcado NO-INSISTIR`); process.exit(0)
}

const leads = loadLeads()
const porIdx = new Map(log.map(r => [r.idx, r]))
const estados = {}
for (const l of leads) {
  const e = porIdx.get(String(l._idx))?.estado || 'pendiente'
  estados[e] = (estados[e] || 0) + 1
}
console.log(`== PREMIUM: ${leads.length} leads ==`)
console.log('Estados:', JSON.stringify(estados))
const porSeg = {}
for (const l of leads) {
  const e = porIdx.get(String(l._idx))?.estado || 'pendiente'
  const k = `${l.Segmento}/${e}`
  porSeg[k] = (porSeg[k] || 0) + 1
}
console.log('Por segmento/estado:', JSON.stringify(porSeg, null, 1))

// follow-up: enviados hace >3 dias sin respuesta
const hace3d = Date.now() - 3 * 864e5
const follow = log.filter(r => r.estado === 'ok' && new Date(r.fecha).getTime() < hace3d)
console.log(`\nFollow-up pendiente (>3 dias sin respuesta): ${follow.length}`)
follow.slice(0, 15).forEach(r => console.log(` - [${r.idx}] ${r.nombre} <${r.correo}> enviado ${r.fecha.slice(0, 10)}`))

// proximos 30 pendientes por prioridad
const pend = leads.filter(l => {
  const e = porIdx.get(String(l._idx))?.estado || 'pendiente'
  return e === 'pendiente' || e === 'fallo'
}).sort((a, b) => Number(a.Prioridad) - Number(b.Prioridad))
console.log(`\nProxima tanda (30): ${Math.min(30, pend.length)} de ${pend.length} pendientes`)
pend.slice(0, 30).forEach(l => console.log(` - [${l._idx}] P${l.Prioridad} ${l.Segmento} ${l.Nombre} <${l.Correo}>`))
console.log('\nEnvio: node clientes/enviar-premium.mjs --max=30')
console.log('Solo 1 segmento: node clientes/enviar-premium.mjs --max=30 --segmento=federacion')
console.log('Marcar respuesta: node clientes/gestionar-premium.mjs --responde=IDX --nota="..."')
