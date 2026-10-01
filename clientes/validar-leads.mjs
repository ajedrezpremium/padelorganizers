/**
 * validar-leads.mjs — Validación masiva de clientes/leads_*.csv
 *
 * Chequea cada fila: formato email, teléfono sintético (1111 2222),
 * rebote ya conocido (clientes/rebotes.csv) y MX del dominio.
 * Genera por cada archivo un *_ok.csv solo con enviables + resumen global.
 *
 * Uso:
 *   node clientes/validar-leads.mjs            # todos (salta agregados)
 *   node clientes/validar-leads.mjs --solo=uk  # solo leads_uk.csv
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promises as dns } from 'node:dns'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-zA-Z_]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}

// Agregados que duplican filas de otros archivos: se saltan por defecto
const AGREGADOS = new Set(['leads_todos.csv', 'leads_todos_completo.csv', 'leads_pendientes.csv'])

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

const toCsv = (headers, rows) =>
  [headers.join(',')].concat(
    rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
  ).join('\n')

// Rebotes duros ya conocidos
const rebotes = new Set()
const rebFile = join(__dirname, 'rebotes.csv')
if (existsSync(rebFile)) {
  for (const l of readFileSync(rebFile, 'utf8').split(/\r?\n/).slice(1)) {
    const e = l.split(',')[0].replace(/"/g, '').trim().toLowerCase()
    if (e) rebotes.add(e)
  }
}

// Caché de MX por dominio
const mxCache = new Map()
async function tieneMx(dominio) {
  dominio = (dominio || '').toLowerCase().trim()
  if (!dominio) return false
  if (mxCache.has(dominio)) return mxCache.get(dominio)
  const p = (async () => {
    try {
      const mx = await Promise.race([
        dns.resolveMx(dominio),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000)),
      ])
      return Array.isArray(mx) && mx.length > 0
    } catch { return false }
  })()
  mxCache.set(dominio, p)
  return p
}

const esSintetico = (tel) => {
  const d = (tel || '').replace(/\D/g, '')
  return /11112222|1112222/.test(d) || /^(1111|0000)/.test(d)
}

let files = readdirSync(__dirname).filter((f) => /^leads_.*\.csv$/i.test(f) && !/_ok\.csv$/i.test(f))
if (args.solo) files = files.filter((f) => f.toLowerCase().includes(String(args.solo).toLowerCase()))
else files = files.filter((f) => !AGREGADOS.has(f))
if (!files.length) { console.error('Sin archivos a validar.'); process.exit(1) }

const resumen = []
let totOk = 0, totMal = 0

for (const f of files) {
  const rows = parseCsv(readFileSync(join(__dirname, f), 'utf8'))
  if (rows.length < 2) continue
  const headers = rows[0]
  const emailIdx = headers.findIndex((h) => /correo/i.test(h))
  const telIdx = headers.findIndex((h) => /tel[eé]fono/i.test(h))
  if (emailIdx < 0) { console.log(`- ${f}: sin columna Correo, salto.`); continue }
  const data = rows.slice(1).map((r) => {
    const o = {}
    headers.forEach((h, i) => { o[h] = r[i] ?? '' })
    return o
  })

  // MX en paralelo con pool limitado
  const mxRes = new Array(data.length)
  const POOL = 25
  for (let s = 0; s < data.length; s += POOL) {
    const chunk = data.slice(s, s + POOL)
    const rs = await Promise.all(chunk.map((c) =>
      tieneMx((c[headers[emailIdx]] || '').split('@')[1] || '')))
    rs.forEach((r, k) => { mxRes[s + k] = r })
  }

  const ok = []
  const counts = { formato: 0, sintetico: 0, rebote: 0, sinmx: 0 }
  data.forEach((c, i) => {
    const email = (c[headers[emailIdx]] || '').trim()
    const low = email.toLowerCase()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { counts.formato++; return }
    if (telIdx >= 0 && esSintetico(c[headers[telIdx]])) { counts.sintetico++; return }
    if (rebotes.has(low)) { counts.rebote++; return }
    if (!mxRes[i]) { counts.sinmx++; return }
    ok.push(c)
  })

  const outFile = f.replace(/\.csv$/i, '_ok.csv')
  writeFileSync(join(__dirname, outFile), toCsv(headers, ok), 'utf8')
  const mal = data.length - ok.length
  totOk += ok.length; totMal += mal
  resumen.push({ archivo: f, total: data.length, ok: ok.length, ...counts })
  console.log(`- ${f}: ${data.length} filas → ${ok.length} OK (${outFile}) | mal-formato:${counts.formato} sintético:${counts.sintetico} rebote:${counts.rebote} sin-MX:${counts.sinmx}`)
}

// Informe global
const stamp = new Date().toISOString().slice(0, 10)
const md = [`# Validación de leads — ${stamp}`, ``,
  `Total OK: **${totOk}** · Descartados: **${totMal}** · Rebotes conocidos: ${rebotes.size}`, ``,
  `| Archivo | Total | OK | Mal formato | Sintético | Rebote | Sin MX |`,
  `|---|---|---|---|---|---|---|`,
  ...resumen.map((r) => `| ${r.archivo} | ${r.total} | ${r.ok} | ${r.formato} | ${r.sintetico} | ${r.rebote} | ${r.sinmx} |`),
  ``, `_ok.csv = solo enviables. Los agregados (todos/pendientes) se saltan por duplicar filas._`]
writeFileSync(join(__dirname, 'informes', `validacion_${stamp}.md`), md.join('\n'), 'utf8')
console.log(`\nTOTAL: ${totOk} enviables, ${totMal} descartados. Informe en clientes/informes/validacion_${stamp}.md`)
