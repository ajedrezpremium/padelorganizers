/**
 * subir-leads-supabase.mjs — Sube el estado comercial (CSVs) a Supabase.
 * Lee clientes/campana_log_*.csv (estado real de cada envío) y los
 * *_ok.csv (nuevos pendientes) y hace upsert en public.commercial_leads.
 * Es idempotente: se puede correr antes/después de cada tanda.
 *
 * Requiere en .env: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
 * (o SUPABASE_URL / SUPABASE_SERVICE_ROLE). Previamente aplicar
 * supabase/migrations/20260929000000_comercial.sql
 *
 * Uso: node clientes/subir-leads-supabase.mjs
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const out = {}
  const p = join(__dirname, '..', '.env')
  if (existsSync(p)) {
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(.*)\s*$/)
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
    }
  }
  return out
}
const env = loadEnv()
const URL = process.env.SUPABASE_URL || env.VITE_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE || env.VITE_SUPABASE_ANON_KEY
if (!URL || !KEY) { console.error('Falta Supabase URL/KEY en .env'); process.exit(1) }

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

// email -> { nombre, ciudad, fuente, estado, ultimo_error }
const leads = new Map()
const set = (email, patch) => {
  email = (email || '').toLowerCase().trim()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return
  const prev = leads.get(email) || { email, nombre: '', ciudad: '', fuente: '', estado: 'nuevo', ultimo_error: '' }
  leads.set(email, { ...prev, ...patch, email })
}

// 1) Logs de campaña: estado real (ok/fallo/sin-correo + rebotes).
// Se excluyen backups históricos (esquemas corruptos pre-reparación).
for (const f of readdirSync(__dirname).filter((f) => /^campana_log_.*\.csv$/i.test(f) && !/backup/i.test(f) && !/\.bak/i.test(f))) {
  const ciudad = f.replace(/^campana_log_/, '').replace(/\.csv$/i, '')
  const rows = parseCsv(readFileSync(join(__dirname, f), 'utf8'))
  if (rows.length < 2) continue
  const h = rows[0]
  const ix = (n) => h.indexOf(n)
  for (const r of rows.slice(1)) {
    const o = {}
    h.forEach((k, i) => { o[k] = r[i] ?? '' })
    const email = o.correo || ''
    const est = (o.estado || '').toLowerCase()
    const err = (o.error || '').toLowerCase()
    const estado = est === 'ok' ? 'contactado'
      : /rebote/.test(err) || est === 'rebote' ? 'rebote'
      : est === 'sin-correo' ? 'sin_correo'
      : est === 'pausado' ? 'pausado' : 'nuevo'
    set(email, { nombre: o.nombre || '', ciudad, fuente: ciudad, estado, ultimo_error: o.error || '' })
  }
}

// 2) Listas _ok validadas que aún no tengan estado → nuevo
for (const f of readdirSync(__dirname).filter((f) => /^leads_.*_ok\.csv$/i.test(f))) {
  const fuente = f.replace(/_ok\.csv$/i, '')
  const rows = parseCsv(readFileSync(join(__dirname, f), 'utf8'))
  if (rows.length < 2) continue
  const h = rows[0]
  const eI = h.findIndex((x) => /correo/i.test(x))
  const nI = h.findIndex((x) => /nombre/i.test(x))
  if (eI < 0) continue
  for (const r of rows.slice(1)) {
    const email = (r[eI] || '').toLowerCase().trim()
    if (!leads.has(email)) set(email, { nombre: nI >= 0 ? r[nI] : '', ciudad: fuente, fuente, estado: 'nuevo' })
  }
}

const all = [...leads.values()]

// No degradar: el panel (y los scripts) avanzan estados (seguimiento,
// respondido, demo, ganado…) que el CSV ya no refleja. Se leen los estados
// actuales y solo se sube si el nuevo es igual o más avanzado.
const RANK = { nuevo: 1, sin_correo: 2, rebote: 2, pausado: 2, contactado: 3, seguimiento: 4, respondido: 5, demo_solicitada: 6, demo_hecha: 7, negociacion: 8, ganado: 9, perdido: 9 }
let actuales = new Map()
try {
  const r = await fetch(`${URL}/rest/v1/commercial_leads?select=email,estado`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  })
  if (r.ok) {
    for (const row of await r.json()) actuales.set((row.email || '').toLowerCase(), row.estado)
  }
} catch { /* sin lectura previa: se sube todo */ }
const utiles = all.filter((l) => {
  const prev = actuales.get(l.email.toLowerCase())
  if (!prev) return true
  return (RANK[l.estado] || 0) >= (RANK[prev] || 0)
})
console.log(`Upsert de ${utiles.length}/${all.length} leads (se respetan ${all.length - utiles.length} estados avanzados del panel)…`)
let ok = 0
for (let i = 0; i < utiles.length; i += 200) {
  const batch = utiles.slice(i, i + 200).map((l) => ({ ...l, updated_at: new Date().toISOString() }))
  const r = await fetch(`${URL}/rest/v1/commercial_leads?on_conflict=email`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(batch),
  })
  if (!r.ok) { console.error(`Batch ${i}: ${r.status} ${await r.text()}`); process.exit(1) }
  ok += batch.length
  console.log(`  ${ok}/${utiles.length}`)
}
console.log(`Listo: ${ok} leads sincronizados.`)
