/**
 * enviar-espaciado.mjs — Reintento automático espaciado de la campaña.
 *
 * Respeta el límite diario de Gmail (550-5.4.5 "Daily user sending limit"):
 *  - Solo envía correos con estado 'pendiente' o 'fallo' (idempotente).
 *  - Envía 1 correo cada ESPERA segundos; cada RESP IRO5 define un respiro.
 *  - Si Gmail rebota por límite diario: NO marca fallo, deja 'pendiente' y
 *    sale con código 3 para reintentar más tarde (sin quemar envíos).
 *  - Registra el progreso en el mismo log de la campaña.
 *
 * Uso:
 *   node clientes/enviar-espaciado.mjs            # correo a correo, espaciado
 *   node clientes/enviar-espaciado.mjs --espera=20 --respiro=5 --max=3
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

const ESPERA = Number(args.espera ?? 20)         // segundos entre envíos
const RESPIRA_ = Number(args.respiro ?? 5)       // pausa tras este nº de envíos
const PAUSA = Number(args.pausa ?? 150)          // segundos de respiro
const MAX = args.max !== undefined ? Number(args.max) : 999999

// Tanda: reintento Barcelona (idx 9) + 6 ciudades con leads con email.
const TANDA = [
  { ciudad: 'barcelona', solo: '9', motivo: 'reintento fallo límite Gmail' },
  { ciudad: 'valencia', motivo: '3 con email' },
  { ciudad: 'murcia', motivo: '3 con email' },
  { ciudad: 'palma', motivo: '2 con email' },
  { ciudad: 'bilbao', motivo: '2 con email' },
  { ciudad: 'sevilla', motivo: '1 con email' },
  { ciudad: 'malaga', motivo: '1 con email' },
]

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  console.log(`[espaciado] cada ${ESPERA}s, respiro ${PAUSA}s tras ${RESPIRA_} envíos, máx ${MAX}`)
  let enviados = 0
  let consecutivos = 0
  for (const paso of TANDA) {
    const cmd = ['clientes/enviar-campana.mjs', `--ciudad=${paso.ciudad}`]
    if (paso.solo) cmd.push(`--solo=${paso.solo}`)
    if (MAX) cmd.push(`--max=${MAX}`)
    console.log(`\n=== [${paso.ciudad}] ${paso.motivo} ===`)
    const res = spawnSync('node', cmd, { encoding: 'utf8' })
    const out = (res.stdout || '') + (res.stderr || '')
    // Detectar si la cuenta sigue en límite diario (no gastar los pendientes)
    if (/Daily user sending limit exceeded/.test(out)) {
      console.log(`[espaciado] LÍMITE DIARIO aún activo en [${paso.ciudad}]. Aborto limpio (pendientes intactos).`)
      process.exit(3)
    }
    // Contar envíos reales de esta ciudad para el ritmo
    const nuevos = (out.match(/ENVIADO a/g) || []).length
    enviados += nuevos
    consecutivos += nuevos
    console.log(`[espaciado] ${nuevos} enviado(s) en [${paso.ciudad}]. Total esta tanda: ${enviados}`)
    if (consecutivos >= RESPIRA_ && enviados < MAX) {
      console.log(`[espaciado] respiro ${PAUSA}s…`)
      await espera(PAUSA * 1000)
      consecutivos = 0
    }
    if (enviados >= MAX) {
      console.log(`[espaciado] tocado tope (${MAX}).`)
      break
    }
    await espera(ESPERA * 1000)
  }
  console.log(`\nTanda espaciada completada: ${enviados} envíos.`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })