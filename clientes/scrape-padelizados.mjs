/**
 * scrape-padelizados.mjs — Extrae clubes de pádel reales de padelizados.es
 * (directorio con ~1576 clubes en España). Para cada ciudad:
 *   1. Lista los clubes (página de ciudad).
 *   2. Abre la ficha de cada club y extrae nombre, dirección, email, teléfono.
 *   3. Guarda clientes/leads_<ciudad>.csv en el mismo formato que la campaña.
 *
 * Usa el Chromium/patchright del VS Code (CodeGPT) para saltar Cloudflare.
 *
 * Uso:
 *   node clientes/scrape-padelizados.mjs --ciudad=Madrid
 *   node clientes/scrape-padelizados.mjs --todas
 *   node clientes/scrape-padelizados.mjs --nuevas   (solo ciudades sin CSV)
 *   node clientes/scrape-padelizados.mjs --max=50   (top N clubes por ciudad)
 */

import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname)

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z]+)(?:=(.*))?$/)
  if (m) args[m[1]] = m[2] === undefined ? true : m[2]
}

// Todas las ciudades + URL de su página en padelizados.es (del home).
const CIUDADES = [
  ['A Coruña', 'https://padelizados.es/es-es/z/clubs-de-padel/1966-a-coruna/'],
  ['Albacete', 'https://padelizados.es/es-es/z/clubs-de-padel/4688-albacete/'],
  ['Alicante', 'https://padelizados.es/es-es/z/clubs-de-padel/4498-alicante/'],
  ['Almería', 'https://padelizados.es/es-es/z/clubs-de-padel/2104-almeria/'],
  ['Ávila', 'https://padelizados.es/es-es/z/clubs-de-padel/2831-avila/'],
  ['Badajoz', 'https://padelizados.es/es-es/z/clubs-de-padel/5378-badajoz/'],
  ['Barcelona', 'https://padelizados.es/es-es/z/clubs-de-padel/5129-barcelona/'],
  ['Bilbao', 'https://padelizados.es/es-es/z/clubs-de-padel/1839-bilbao/'],
  ['Burgos', 'https://padelizados.es/es-es/z/clubs-de-padel/6373-burgos/'],
  ['Cádiz', 'https://padelizados.es/es-es/z/clubs-de-padel/1162-cadiz/'],
  ['Castellón', 'https://padelizados.es/es-es/z/clubs-de-padel/3171-castellon-de-la-plana/'],
  ['Ceuta', 'https://padelizados.es/es-es/z/clubs-de-padel/3528-ceuta/'],
  ['Ciudad Real', 'https://padelizados.es/es-es/z/clubs-de-padel/1763-ciudad-real/'],
  ['Córdoba', 'https://padelizados.es/es-es/z/clubs-de-padel/4632-cordoba/'],
  ['Cuenca', 'https://padelizados.es/es-es/z/clubs-de-padel/4812-cuenca/'],
  ['Donostia-San Sebastián', 'https://padelizados.es/es-es/z/clubs-de-padel/8673-donostia-san-sebastian/'],
  ['Girona', 'https://padelizados.es/es-es/z/clubs-de-padel/4227-girona/'],
  ['Granada', 'https://padelizados.es/es-es/z/clubs-de-padel/4400-granada/'],
  ['Huelva', 'https://padelizados.es/es-es/z/clubs-de-padel/5989-huelva/'],
  ['Huesca', 'https://padelizados.es/es-es/z/clubs-de-padel/6578-huesca/'],
  ['Jaén', 'https://padelizados.es/es-es/z/clubs-de-padel/4116-jaen/'],
  ['León', 'https://padelizados.es/es-es/z/clubs-de-padel/6250-leon/'],
  ['Lleida', 'https://padelizados.es/es-es/z/clubs-de-padel/6100-lleida/'],
  ['Logroño', 'https://padelizados.es/es-es/z/clubs-de-padel/3465-logrono/'],
  ['Lugo', 'https://padelizados.es/es-es/z/clubs-de-padel/3373-lugo/'],
  ['Madrid', 'https://padelizados.es/es-es/z/clubs-de-padel/5593-madrid/'],
  ['Málaga', 'https://padelizados.es/es-es/z/clubs-de-padel/6753-malaga/'],
  ['Melilla', 'https://padelizados.es/es-es/z/clubs-de-padel/5112-melilla/'],
  ['Murcia', 'https://padelizados.es/es-es/z/clubs-de-padel/3562-murcia/'],
  ['Ourense', 'https://padelizados.es/es-es/z/clubs-de-padel/1433-ourense/'],
  ['Oviedo', 'https://padelizados.es/es-es/z/clubs-de-padel/6668-oviedo/'],
  ['Palencia', 'https://padelizados.es/es-es/z/clubs-de-padel/831-palencia/'],
  ['Palma de Mallorca', 'https://padelizados.es/es-es/z/clubs-de-padel/6319-palma-de-mallorca/'],
  ['Pamplona', 'https://padelizados.es/es-es/z/clubs-de-padel/1351-pamplona-iruna/'],
  ['Pontevedra', 'https://padelizados.es/es-es/z/clubs-de-padel/4960-pontevedra/'],
  ['Salamanca', 'https://padelizados.es/es-es/z/clubs-de-padel/3775-salamanca/'],
  ['Santander', 'https://padelizados.es/es-es/z/clubs-de-padel/2070-santander/'],
  ['Segovia', 'https://padelizados.es/es-es/z/clubs-de-padel/1617-segovia/'],
  ['Sevilla', 'https://padelizados.es/es-es/z/clubs-de-padel/5757-sevilla/'],
  ['Tarragona', 'https://padelizados.es/es-es/z/clubs-de-padel/3329-tarragona/'],
  ['Teruel', 'https://padelizados.es/es-es/z/clubs-de-padel/5076-teruel/'],
  ['Toledo', 'https://padelizados.es/es-es/z/clubs-de-padel/3104-toledo/'],
  ['Valencia', 'https://padelizados.es/es-es/z/clubs-de-padel/5942-valencia/'],
  ['Valladolid', 'https://padelizados.es/es-es/z/clubs-de-padel/4034-valladolid/'],
  ['Vitoria-Gasteiz', 'https://padelizados.es/es-es/z/clubs-de-padel/1936-vitoria-gasteiz/'],
  ['Zamora', 'https://padelizados.es/es-es/z/clubs-de-padel/1148-zamora/'],
  ['Zaragoza', 'https://padelizados.es/es-es/z/clubs-de-padel/2417-zaragoza/'],
]

function resolveChromium() {
  const roots = []
  for (const base of [join(homedir(), '.vscode-server/extensions'), join(homedir(), '.vscode/extensions')]) {
    if (!existsSync(base)) continue
    const dirs = readdirSync(base)
      .filter((d) => d.startsWith('danielsanmedium.dscodegpt-'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    const newest = dirs[dirs.length - 1]
    if (newest) roots.push(join(base, newest, 'standalone') + '/')
  }
  for (const root of roots) {
    try {
      const mod = createRequire(root)('patchright')
      if (mod?.chromium) return { chromium: mod.chromium, root }
    } catch {}
  }
  throw new Error('patchright no encontrado')
}

const { chromium } = resolveChromium()
const MAX = args.max !== undefined ? Number(args.max) : 999999
const PAUSA_MS = 700

function slug(city) {
  return city.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function csvEsc(text) { return `"${String(text ?? '').replace(/"/g, '""')}"` }

function guardarCsv(city, rows) {
  const path = join(OUT, `leads_${slug(city)}.csv`)
  const header = 'Nombre,Pistas,Dirección,Teléfono,Correo,Página Web,Plataforma de Reserva'
  const lines = [header]
  for (const r of rows) {
    lines.push([csvEsc(r.nombre), csvEsc(r.pistas), csvEsc(r.direccion), csvEsc(r.telefono), csvEsc(r.correo), csvEsc(r.web), csvEsc('N/A')].join(','))
  }
  writeFileSync(path, lines.join('\n'), 'utf8')
  return path
}

function parseListado(page) {
  return page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/i/"]'))
    const seen = new Set()
    const out = []
    for (const a of links) {
      const text = (a.innerText || '').trim()
      const href = a.href
      if (!text || seen.has(href)) continue
      seen.add(href)
      out.push({ href, text })
    }
    return out
  })
}

function parseFicha(page) {
  return page.evaluate(() => {
    const email = (document.querySelector('a[href^="mailto:"]')?.getAttribute('href') || '').replace('mailto:', '')
    const jsonld = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => s.textContent)
    let name = '', street = '', locality = '', postal = '', phone = ''
    for (const j of jsonld) {
      try {
        const d = JSON.parse(j)
        const b = d['@graph']?.find(x => x['@type'] === 'LocalBusiness') || d
        if (b.name) name = b.name
        if (b.address) {
          street = b.address.streetAddress || ''
          locality = b.address.addressLocality || ''
          postal = b.address.postalCode || ''
        }
        if (b.telephone) phone = b.telephone
        if (b.email) email = email || b.email
      } catch {}
    }
    // Teléfono visible si no viene en JSON-LD
    if (!phone) {
      const tel = document.querySelector('a[href^="tel:"]')?.getAttribute('href')
      if (tel) phone = tel.replace('tel:', '')
    }
    const direccion = [street, postal, locality].filter(Boolean).join(', ')
    return { name, direccion, phone, email }
  })
}

async function scrapeCiudad(browser, ciudad, url) {
  const page = await browser.newPage()
  const rows = []
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(3500)
    const lista = await parseListado(page)
    let clubes = lista
    if (MAX < 999999) clubes = lista.slice(0, MAX)
    console.log(`[${ciudad}] ${clubes.length} clubes (de ${lista.length})`)
    for (let i = 0; i < clubes.length; i++) {
      const club = clubes[i]
      try {
        await page.goto(club.href, { waitUntil: 'domcontentloaded', timeout: 45000 })
        await page.waitForTimeout(900)
        const f = await parseFicha(page)
        const nombre = f.name || club.text
        rows.push({
          nombre,
          pistas: '',
          direccion: f.direccion,
          telefono: f.phone,
          correo: f.email,
          web: club.href,
        })
        console.log(`  [${i + 1}/${clubes.length}] ${nombre} → ${f.email || 'sin email'}`)
      } catch (e) {
        console.log(`  [${i + 1}/${clubes.length}] ERROR ${club.text}: ${String(e).split('\n')[0]}`)
      }
      await new Promise((r) => setTimeout(r, PAUSA_MS))
    }
  } finally {
    await page.close()
  }
  const archivo = guardarCsv(ciudad, rows)
  const conEmail = rows.filter(r => r.correo && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.correo)).length
  console.log(`[${ciudad}] ${rows.length} guardados en ${archivo.split('\\').pop()} (${conEmail} con email)`)
  return { rows: rows.length, conEmail }
}

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const totales = { rows: 0, conEmail: 0 }
  try {
    if (args.todas !== undefined || args.nuevas !== undefined) {
      const yaExiste = new Set(readdirSync(OUT).filter(f => f.startsWith('leads_')).map(f => f.replace('leads_', '').replace('.csv', '')))
      for (const [ciudad, url] of CIUDADES) {
        const s = slug(ciudad)
        if (args.nuevas !== undefined && yaExiste.has(s)) { console.log(`[${ciudad}] ya existe leads_${s}.csv, salto.`); continue }
        try {
          const res = await scrapeCiudad(browser, ciudad, url)
          totales.rows += res.rows
          totales.conEmail += res.conEmail
        } catch (e) {
          console.error(`[${ciudad}] FALLO ciudad: ${String(e).split('\n')[0]}`)
        }
      }
    } else if (args.ciudades) {
      const nombres = args.ciudades.split(',').map(s => s.trim()).filter(Boolean)
      for (const nombre of nombres) {
        const entrada = CIUDADES.find(c => c[0].toLowerCase() === nombre.toLowerCase())
        if (!entrada) { console.error(`[${nombre}] ciudad no encontrada en CIUDADES`); continue }
        try {
          const res = await scrapeCiudad(browser, entrada[0], entrada[1])
          totales.rows += res.rows
          totales.conEmail += res.conEmail
        } catch (e) {
          console.error(`[${nombre}] FALLO ciudad: ${String(e).split('\n')[0]}`)
        }
      }
    } else {
      const nombre = args.ciudad || 'Madrid'
      const entrada = CIUDADES.find(c => c[0].toLowerCase() === nombre.toLowerCase()) || [nombre, `https://padelizados.es/es-es/z/clubs-de-padel/5593-madrid/`]
      const res = await scrapeCiudad(browser, entrada[0], entrada[1])
      totales.rows += res.rows
      totales.conEmail += res.conEmail
    }
  } finally {
    await browser.close()
  }
  console.log(`\nTOTAL: ${totales.rows} clubes, ${totales.conEmail} con email.`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })