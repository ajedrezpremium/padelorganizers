/**
 * reparar-logs.mjs — Repara campana_log_*.csv corruptos.
 * Causa: una versión antigua de marcar() escribía sin entrecomillar, y los
 * errores multilínea de Gmail (550-5.4.5…) partían filas en basura.
 * - Copia de seguridad: cada archivo → .bak-YYYYMMDD antes de tocarlo.
 * - Elimina filas sin email válido o idx no numérico (fragmentos de error).
 * - Si estado es vacío/timestamp: error menciona rebote → 'sin-correo';
 *   si no, 'pausado' (revisión humana, NUNCA se reenvía solo).
 * - Dedup por idx quedándose con el estado más avanzado
 *   (ok > fallo > sin-correo > pausado).
 *
 * Uso: node clientes/reparar-logs.mjs --dry   # solo informa
 *      node clientes/reparar-logs.mjs          # repara con backup
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}
const DRY = args.dry !== undefined
const STAMP = new Date().toISOString().slice(0, 10).replace(/-/g, '')

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

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/
const RANK = { ok: 4, fallo: 3, 'sin-correo': 2, rebote: 2, pausado: 1 }
const HEADERS = ['idx', 'nombre', 'correo', 'direccion', 'plataforma', 'web', 'estado', 'fecha', 'error']

const files = readdirSync(__dirname).filter((f) => /^campana_log_.*\.csv$/i.test(f) && !/backup/i.test(f) && !/\.bak/i.test(f))
let totDrop = 0, totFix = 0, totFiles = 0

for (const f of files) {
  const p = join(__dirname, f)
  const rows = parseCsv(readFileSync(p, 'utf8'))
  if (rows.length < 2) continue
  const h = rows[0]
  const g = (r, n) => r[h.indexOf(n)] ?? ''
  const byIdx = new Map()
  let dropped = 0, fixed = 0

  for (const r of rows.slice(1)) {
    const idx = g(r, 'idx')
    const correo = (g(r, 'correo') || '').trim()
    if (!/^\d+$/.test(idx) || !EMAIL_RE.test(correo)) { dropped++; continue } // fragmento basura
    // Normalizar a esquema estándar (premium usa 'segmento' en vez de direccion…)
    let estado = (g(r, 'estado') || '').toLowerCase().trim()
    const error = g(r, 'error') || g(r, 'respuesta') || ''
    if (!RANK[estado] && estado !== 'pendiente') {
      fixed++
      estado = /rebote|undeliver|mailer-daemon|550/i.test(error) ? 'sin-correo' : 'pausado'
    }
    const rec = {
      idx, nombre: g(r, 'nombre'), correo,
      direccion: g(r, 'direccion'), plataforma: g(r, 'plataforma'),
      web: (g(r, 'web') || '').split('"')[0], // corta restos pegados ("rebote)
      estado, fecha: ISO_RE.test(g(r, 'fecha')) ? g(r, 'fecha') : '',
      error: estado === 'pausado' && !error ? 'fila corrupta histórica — revisar antes de reenviar' : error,
    }
    const prev = byIdx.get(idx)
    if (!prev || (RANK[estado] || 0) >= (RANK[prev.estado] || 0)) byIdx.set(idx, rec)
  }

  const out = [HEADERS.join(',')].concat(
    [...byIdx.values()].sort((a, b) => Number(a.idx) - Number(b.idx))
      .map((o) => HEADERS.map((k) => `"${String(o[k] ?? '').replace(/"/g, '""')}"`).join(','))
  ).join('\n')

  console.log(`- ${f}: ${rows.length - 1} → ${byIdx.size} válidas (basura:${dropped} reparadas:${fixed})`)
  totDrop += dropped; totFix += fixed; totFiles++
  if (!DRY) {
    copyFileSync(p, `${p}.bak-${STAMP}`)
    writeFileSync(p, out, 'utf8')
  }
}
console.log(DRY ? `\nDRY: ${totDrop} basura, ${totFix} a reparar en ${totFiles} archivos.` : `\nReparado: backup .bak-${STAMP}, ${totDrop} filas basura eliminadas, ${totFix} reparadas.`)
