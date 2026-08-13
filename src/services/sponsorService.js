/**
 * sponsorService.js — Monetization Engine (#8 novedad): sponsors + banners + ROI.
 * Pool de patrocinadores con tiers (oro/plata/bronce), ingreso por tier y
 * estimación de ROI (coste por impresión). Los sponsors se muestran como
 * banners en la página pública del torneo (TournamentPublic).
 * Persistencia: localStorage (demo), consistente con el resto de la app.
 */

const LS = 'padelorganizers-sponsors';

// Precio de paquete por tier (€ por torneo)
export const TIERS = [
  { key: 'oro', label: { es: 'Oro · Pista central', en: 'Gold · Centre court', fr: 'Or · Piste centrale', pt: 'Ouro · Campo central' }, price: 250, color: '#fbbf24', emoji: '🥇' },
  { key: 'plata', label: { es: 'Plata · Banner principal', en: 'Silver · Main banner', fr: 'Argent · Bannière principale', pt: 'Prata · Banner principal' }, price: 120, color: '#cbd5e1', emoji: '🥈' },
  { key: 'bronce', label: { es: 'Bronce · Banner lateral', en: 'Bronze · Side banner', fr: 'Bronze · Bannière latérale', pt: 'Bronze · Banner lateral' }, price: 50, color: '#d97706', emoji: '🥉' },
];

const SEED = [
  { id: 'sp1', name: 'Padel5.com', brand: 'Padel5', color: '#10b981', tier: 'oro', url: 'https://www.padel5.com' },
  { id: 'sp2', name: 'Bullpadel', brand: 'Bullpadel', color: '#f59e0b', tier: 'plata', url: 'https://www.bullpadel.com' },
  { id: 'sp3', name: 'Vibor-A', brand: 'Vibor-A', color: '#3b82f6', tier: 'bronce', url: 'https://www.vibor-a.com' },
  { id: 'sp4', name: 'Head Padel', brand: 'HEAD', color: '#ef4444', tier: 'plata', url: 'https://www.head.com/padel' },
];

function load() {
  try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch { return null; }
}
function save(s) { localStorage.setItem(LS, JSON.stringify(s)); }
function seed() { const s = load(); if (!s) { save(SEED); return SEED; } return s; }

export function listSponsorsSync() { return seed(); }

// Resolución de tier para un id
export function tierOf(tierKey) { return TIERS.find(t => t.key === tierKey) || TIERS[2]; }

// Ingresos de patrocinio por tiers
export function sponsorKpisSync() {
  const sponsors = seed();
  const byTier = { oro: 0, plata: 0, bronce: 0 };
  sponsors.forEach(s => { byTier[s.tier] = (byTier[s.tier] || 0) + 1; });
  const ingresos = sponsors.reduce((sum, s) => sum + (tierOf(s.tier).price || 0), 0);
  const medicion = TIERS.reduce((acc, t) => {
    acc[t.key] = { n: byTier[t.key] || 0, ingresos: (byTier[t.key] || 0) * t.price };
    return acc;
  }, {});
  return {
    numSponsors: sponsors.length,
    ingresos,
    medicion,
    oro: byTier.oro || 0,
    plata: byTier.plata || 0,
    bronce: byTier.bronce || 0,
  };
}

export async function addSponsor({ name, brand, tier, color, url }) {
  const sponsors = seed();
  const sp = {
    id: `sp${Date.now()}`,
    name: name || brand || 'Sponsor',
    brand: brand || name || 'Sponsor',
    tier: tier || 'bronce',
    color: color || '#10b981',
    url: url || 'https://example.com',
  };
  save([sp, ...sponsors]);
  return sp;
}

export async function removeSponsor(id) {
  save(seed().filter(s => s.id !== id));
}

export function resetSponsors() { save(SEED); return SEED; }

// Impresiones estimadas (proyección ROI): nº jugadores del torneo × visitas esperadas
export function roiProjection(numPlayers = 32) {
  const k = sponsorKpisSync();
  const impresiones = numPlayers * 40; // cada jugador consulta ~×40 la web del torneo (demo)
  const costeTotal = k.ingresos;
  const cpm = costeTotal > 0 ? (costeTotal / (impresiones / 1000)) : 0; // coste por 1000 impresiones
  return { impresiones, cpm: Number(cpm.toFixed(2)), costeTotal, sponsors: k.numSponsors };
}

export function seedSponsorForTest() { return seed(); }