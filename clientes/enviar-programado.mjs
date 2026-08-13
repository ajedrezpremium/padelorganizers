/**
 * enviar-programado.mjs — Tanda automática para el día siguiente al límite de Gmail.
 *
 * Reintenta el club fallido de Barcelona (Pàdel Indoor L'Hospitalet) y envía las
 * tandas pendientes de las 6 ciudades. Es idempotente: los 'ok' y 'sin-correo'
 * de campaña_log_leads_<ciudad>.csv se saltan, solo se envían 'pendiente'/'fallo'.
 *
 * Construye el HTML con enviar-campana.mjs (--dry) y reenvía por SMTP Gmail.
 *
 * Requisitos en .env: GMAIL_USER + GMAIL_APP_PASS.
 *
 * Uso:
 *   node clientes/enviar-programado.mjs            # envía todo (Barcelona + 6 tandas)
 *   node clientes/enviar-programado.mjs --dry      # genera previews, no envía
 *   node clientes/enviar-programado.mjs --max=4    # máximo 4 envíos en esta ejecución
 */

import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCRIPT = join(__dirname, 'enviar-campana.mjs')

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}

// Tanda: reintento Barcelona (idx 9) + 6 ciudades con sus leads con email.
// Orden prioriza las ciudades ya analizadas y el fallo conocido.
const TANDA = [
  { ciudad: 'barcelona', solo: '9', motivo: 'reintento fallo límite Gmail' },
  { ciudad: 'valencia', motivo: '3 con email' },
  { ciudad: 'murcia', motivo: '3 con email' },
  { ciudad: 'palma', motivo: '2 con email' },
  { ciudad: 'bilbao', motivo: '2 con email' },
  { ciudad: 'sevilla', motivo: '1 con email' },
  { ciudad: 'malaga', motivo: '1 con email' },
]

let salto = 0
for (const paso of TANDA) {
  const cmd = ['clientes/enviar-campana.mjs', `--ciudad=${paso.ciudad}`]
  if (paso.solo) cmd.push(`--solo=${paso.solo}`)
  if (args.max) cmd.push(`--max=${args.max}`)
  if (args.dry !== undefined) cmd.push('--dry')
  console.log(`\n=== [${paso.ciudad}] ${paso.motivo} ===`)
  const res = spawnSync('node', cmd, { stdio: 'inherit', encoding: 'utf8' })
  if (res.status !== 0) process.exitCode = 1
  salto++
}

console.log(`\nTanda lista: ${salto} pasos. Reintenta mañana (límite Gmail 24h) o cuando se restablezca.`)