/**
 * enviar-segmentos.mjs — Tanda de campaña para los segmentos nuevos:
 * escuelas de pádel y federaciones. Reutiliza enviar-campana.mjs (que elige
 * la plantilla según el CSV) y respeta el límite diario de Gmail.
 *
 * Uso:
 *   node clientes/enviar-segmentos.mjs             # escuelas + federaciones, espaciado
 *   node clientes/enviar-segmentos.mjs --max=5     # máximo 5 envíos esta tanda
 *   node clientes/enviar-segmentos.mjs --dry       # solo genera previews
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

const ESPERA = 20          // segundos entre envíos
const PAUSA = 150          // respiro tras RESPIRA_ envíos
const RESPIRA_ = 5
const MAX = args.max !== undefined ? Number(args.max) : 999999

const TANDA = [
  { csv: 'leads_escuelas.csv', motivo: 'escuelas de pádel (11 con email)' },
  { csv: 'leads_federaciones.csv', motivo: 'federaciones autonómicas + FEP (9)' },
]

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  if (args.dry !== undefined) {
    for (const paso of TANDA) {
      const res = spawnSync('node', [SCRIPT, `--csv=${paso.csv}`, '--dry'], { encoding: 'utf8' })
      console.log(`[dry] ${paso.csv}: ${(res.stdout || '').trim()}`)
    }
    process.exit(0)
  }
  console.log(`[segmentos] cada ${ESPERA}s, respiro ${PAUSA}s tras ${RESPIRA_} envíos, máx ${MAX}`)
  let enviados = 0
  let consecutivos = 0
  for (const paso of TANDA) {
    const cmd = [SCRIPT, `--csv=${paso.csv}`]
    if (MAX) cmd.push(`--max=${MAX}`)
    console.log(`\n=== [${paso.csv}] ${paso.motivo} ===`)
    const res = spawnSync('node', cmd, { encoding: 'utf8' })
    const out = (res.stdout || '') + (res.stderr || '')
    if (/Daily user sending limit exceeded/.test(out)) {
      console.log(`[segmentos] LÍMITE DIARIO en [${paso.csv}]. Aborto limpio (pendientes intactos).`)
      process.exit(3)
    }
    const nuevos = (out.match(/ENVIADO a/g) || []).length
    enviados += nuevos
    consecutivos += nuevos
    console.log(`[segmentos] ${nuevos} enviado(s) en [${paso.csv}]. Total: ${enviados}`)
    if (consecutivos >= RESPIRA_ && enviados < MAX) {
      console.log(`[segmentos] respiro ${PAUSA}s…`)
      await espera(PAUSA * 1000)
      consecutivos = 0
    }
    if (enviados >= MAX) {
      console.log(`[segmentos] tope (${MAX}) alcanzado.`)
      break
    }
    await espera(ESPERA * 1000)
  }
  console.log(`\nTanda de segmentos completada: ${enviados} envíos.`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })