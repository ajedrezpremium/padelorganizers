/**
 * reintento-ciclico.mjs — Reintenta la tanda espaciada en bucle hasta que
 * el límite diario de Gmail se restablezca y la campaña se complete.
 *
 * Lógica:
 *   - Lanza `enviar-espaciado.mjs`.
 *   - exit 3  → límite diario aún activo → espera INTERVALO min y reintenta.
 *   - exit 0  → tanda completada → termina.
 *   - exit !=0→ error → espera y reintenta (con tope de ciclos por seguridad).
 * Escribe su progreso en clientes/reintento_ciclico.log.
 */

import { spawnSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCRIPT = join(__dirname, 'enviar-espaciado.mjs')
const LOG = join(__dirname, 'reintento_ciclico.log')

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}

const INTERVALO = Number(args.intervalo ?? 30) * 1000
const TOPE = Number(args.tope ?? 20)

const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  try { appendFileSync(LOG, line + '\n') } catch { /* ignore */ }
}

async function main() {
  log('Reintento cíclico iniciado. Intervalo: ' + (INTERVALO / 1000) + 's. Tope: ' + TOPE + ' ciclos.')
  for (let ciclo = 1; ciclo <= TOPE; ciclo++) {
    log(`Ciclo ${ciclo}/${TOPE} — ejecutando tanda espaciada…`)
    const res = spawnSync('node', [SCRIPT, '--espera=20', '--respiro=5', '--pausa=120'], { encoding: 'utf8' })
    const code = res.status
    log(`  → exit ${code}`)
    if (code === 0) {
      log('Tanda completada. Terminando bucle.')
      process.exit(0)
    }
    if (code === 3) {
      log('Límite diario aún activo. Esperando ' + (INTERVALO / 1000) + 's y reintentando…')
    } else {
      log('Exit inesperado (' + code + '). Esperando y reintentando…')
    }
    await espera(INTERVALO)
  }
  log('Tope de ciclos alcanzado sin completar. Avisar para una nueva pasada.')
  process.exit(1)
}

main().catch((e) => { log('FATAL: ' + e); process.exit(2) })