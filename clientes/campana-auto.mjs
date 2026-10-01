/**
 * campana-auto.mjs — Piloto automático comercial.
 * Una sola orden hace todo el ciclo:
 *   1) Sincroniza CSVs → Supabase (commercial_leads)
 *   2) Envía la tanda (respeta límites y validación anti-spam)
 *   3) Vigila el buzón: SOLO avisa si hay solicitud de demo (exit 2)
 *
 * Uso:
 *   node clientes/campana-auto.mjs --csv=leads_premium_ok.csv --max=30
 *   node clientes/campana-auto.mjs --csv=leads_madrid_ok.csv --max=30 --dias=2
 *
 * Para programarlo a diario en Windows (una vez):
 *   schtasks /create /tn "PadelCampana" /tr "node C:\Users\param\Documents\PADELORGANIZERS\clientes\campana-auto.mjs --csv=leads_premium_ok.csv --max=30" /sc daily /st 09:00
 */
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-zA-Z_]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}

const CSV = args.csv || 'leads_premium_ok.csv'
const MAX = args.max || '30'
const DIAS = args.dias || '2'

const run = (script, extra = []) => {
  console.log(`\n===== node ${script} ${extra.join(' ')} =====`)
  const r = spawnSync('node', [join(__dirname, script), ...extra], { stdio: 'inherit', encoding: 'utf8' })
  return r.status ?? 1
}

let demo = false
const s1 = run('subir-leads-supabase.mjs')
if (s1 !== 0) console.log('(!) Sync Supabase falló — sigo con el envío local.')
run('enviar-campana.mjs', [`--csv=${CSV}`, `--max=${MAX}`])
const s3 = run('detectar-demo.mjs', [`--dias=${DIAS}`])
if (s3 === 2) demo = true

console.log('\n===== RESUMEN =====')
console.log(`CSV: ${CSV} · máx: ${MAX}`)
console.log(demo ? '🎾 HAY SOLICITUD DE DEMO — revisa tu email y Supabase (demo_requests).' : 'Sin solicitudes de demo. Todo sigue en automático.')
process.exit(demo ? 2 : 0)
