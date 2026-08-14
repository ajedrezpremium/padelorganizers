/**
 * genera-whatsapp.mjs — Lista de venta por WhatsApp (enlaces wa.me precargados).
 *
 * Lee los CSVs de leads de clientes/ y selecciona los clubes que tienen teléfono
 * pero SIN correo (los que la campaña de email no alcanzó). Para cada uno genera
 * un mensaje personalizado de venta y un enlace wa.me con el texto precargado.
 *
 * Salida: clientes/whatsapp-campana.html (lista por ciudad, enlaces listos).
 *
 * Uso:
 *   node clientes/genera-whatsapp.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CIUDADES = ['vigo','barcelona','madrid','zaragoza','bilbao','malaga','sevilla','palma','murcia','valencia']
const EMAIL_RE = /[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/

function parseCsv(text) {
  const rows = []
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue
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

function primerTelefono(tel) {
  const m = tel.match(/\+?[\d\s().-]+/)
  if (!m) return null
  const dig = m[0].replace(/\D/g, '')
  if (dig.startsWith('00')) return dig.slice(2)
  if (dig.startsWith('34') && dig.length >= 11) return dig
  if (dig.startsWith('+')) return dig.slice(1)
  return dig
}

function msgPara(club, ciudad) {
  const nombre = club.Nombre || ''
  const dir = club.Dirección || club.direccion || ''
  const asp = (dir + ' ' + nombre).toLowerCase().includes('padel') ? 'tu club de pádel' : 'tus instalaciones'
  const demo = 'https://padelorganizers.vercel.app/?utm_source=whatsapp&utm_medium=campana&utm_campaign=presentacion&utm_content=demo&club=' + encodeURIComponent(nombre)
  return [
    `Hola, equipo de ${nombre} 👋`,
    `Somos Padel Organizers: organizamos tu torneo de pádel en 1 clic. Cuadro automático (americano, liga, mexicano, eliminatoria), control de pistas en vivo y cobro de reservas integrado.`,
    `Cubrimos 20 de 20 funciones clave del mercado del pádel — más que Playtomic (11), MATCHi (11), Padel Mates (10) y Padel Manager (6) — incluido un Coach IA que ninguno tiene.`,
    `Puedes probarlo gratis sin dar ningún dato — hay un torneo de ejemplo con 32 jugadores ya montado: ${demo}`,
    `En ${dir} seguro que el torneo de este fin de semana os ha costado horas. Con esto lo tenéis en minutos y los jugadores ven los partidos en directo. 😊`,
    `¿Te enseño una demo de 3 minutos cuando te venga bien?`
  ].join('\n\n')
}

function waLink(tel, msg) {
  const base = primerTelefono(tel)
  if (!base) return null
  return `https://wa.me/${base}?text=${encodeURIComponent(msg)}`
}

let total = 0
const ciudades = []
for (const city of CIUDADES) {
  const file = join(__dirname, `leads_${city}.csv`)
  if (!existsSync(file)) continue
  const rows = parseCsv(readFileSync(file, 'utf8'))
  if (rows.length === 0) continue
  const headers = rows[0]
  const clubs = rows.slice(1).map((r) => {
    const o = {}
    headers.forEach((h, i) => (o[h] = r[i] ?? ''))
    return o
  })
  const lista = []
  for (const club of clubs) {
    const tel = club['Teléfono'] || club['Telefono'] || ''
    const mail = club['Correo'] || club['Email'] || ''
    if (!tel || EMAIL_RE.test(mail)) continue
    const link = waLink(tel, msgPara(club, city))
    if (!link) continue
    total++
    lista.push({ nombre: club['Nombre'], tel, link })
  }
  if (lista.length) ciudades.push({ ciudad: city, clubs: lista })
}

let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WhatsApp — Campaña Padel Organizers</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:24px;background:#f0fdf4;color:#1f2937}
  h1{font-size:22px;color:#0f172a}
  h2{font-size:17px;color:#16a34a;border-bottom:2px solid #16a34a;padding-bottom:6px;margin-top:28px}
  .club{background:#fff;border:1px solid #d1fae5;border-radius:10px;padding:14px 16px;margin:10px 0;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .club .info{font-weight:600}
  .club .tel{color:#64748b;font-size:13px;margin-top:2px}
  a.wa{background:#25d366;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:8px;white-space:nowrap}
  a.wa:hover{background:#1eb856}
  .total{color:#475569;font-size:14px;margin-top:8px}
</style>
</head>
<body>
<h1>📲 WhatsApp — Campaña Padel Organizers</h1>
<p class="total"><strong>${total} clubes</strong> alcanzables por WhatsApp (sin email en la base). Pulsa el enlace de cada club, el mensaje se abre ya escrito en tu WhatsApp; revisa y envía.</p>
`

for (const c of ciudades) {
  html += `<h2>${c.ciudad.charAt(0).toUpperCase() + c.ciudad.slice(1)} (${c.clubs.length})</h2>\n`
  for (const club of c.clubs) {
    html += `<div class="club"><div class="info">${club.nombre}<div class="tel">${club.tel}</div></div><a class="wa" target="_blank" rel="noopener" href="${club.link}">Abrir WhatsApp →</a></div>\n`
  }
}

html += `</body>\n</html>\n`

const out = join(__dirname, 'whatsapp-campana.html')
writeFileSync(out, html, 'utf8')
console.log(`Generado ${out} — ${total} clubes en ${ciudades.length} ciudades.`)