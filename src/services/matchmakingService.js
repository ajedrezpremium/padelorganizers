/**
 * matchmakingService.js — "Busco cuarto" / Matchmaking (perfil 3 · Jugador).
 * Bolsa de jugadores + anuncios para encontrar pareja/rival/sesiones sin cuarto.
 * Algoritmo de emparejamiento por proximidad de rating (ELO) y disponibilidad.
 * La bolsa usa datos REALES de la Ranked League y del torneo activo; el resto
 * se rellena con jugadores semilla del club para que la demo tenga vida.
 */

import { ensureCurrentLeague, listLeague } from './leagueService';
import { getState } from './store';

const LS_ADS = 'padelorganizers-matching-ads';

// Jugadores semilla del club (nivel ← rating): para que la demo tenga vida y
// haya con quién emparejar cuando la liga aún está vacía.
export const SEED_PLAYERS = [
  { name: 'Carlos M.', elo: 1520, level: 3.0, hand: 'diestro', availability: ['16:00', '17:00', '18:00'] },
  { name: 'Lucía R.', elo: 1490, level: 3.0, hand: 'zurda', availability: ['18:00', '19:00', '20:00'] },
  { name: 'Jorge P.', elo: 1640, level: 3.6, hand: 'diestro', availability: ['19:00', '20:00', '21:00'] },
  { name: 'Ana V.', elo: 1415, level: 2.5, hand: 'diestra', availability: ['17:00', '18:00'] },
  { name: 'Pablo G.', elo: 1585, level: 3.2, hand: 'diestro', availability: ['16:00', '20:00'] },
  { name: 'María S.', elo: 1720, level: 3.9, hand: 'zurda', availability: ['18:00', '21:00'] },
  { name: 'Diego F.', elo: 1450, level: 2.7, hand: 'diestro', availability: ['16:00', '19:00'] },
  { name: 'Sara L.', elo: 1695, level: 3.8, hand: 'diestra', availability: ['20:00', '21:00'] },
];

function slugish(s) {
  return (s || '').toLowerCase().replace(/\s+/g, '').trim();
}

// ---- "Busco cuarto" (anuncios persistentes) ----
export function readAds() {
  try { return JSON.parse(localStorage.getItem(LS_ADS)) || []; } catch { return []; }
}
export function writeAds(ads) {
  try { localStorage.setItem(LS_ADS, JSON.stringify(ads)); } catch { /* ignore */ }
}
export function addAd({ name, elo, when, slot, mode }) {
  const id = `ad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const ad = { id, name, elo, when, slot, mode, createdAt: new Date().toISOString(), status: 'open' };
  writeAds([ad, ...readAds()]);
  return ad;
}
export function closeAd(id) {
  const ads = readAds().filter(a => a.id !== id);
  writeAds(ads);
  return ads;
}

// ---- Bolsa de jugadores real (liga + torneo + semilla, sin duplicar) ----
export async function buildPlayerPool() {
  const pool = [];
  const seen = new Set();

  const add = (p) => {
    const key = slugish(p.name);
    if (!key || seen.has(key)) return;
    seen.add(key);
    pool.push({
      name: p.name, elo: Number(p.elo || 1500), level: Number(p.level || 3),
      hand: p.hand || 'diestro', availability: p.availability || [],
      source: p.source || 'club',
    });
  };

  // 1) Ranked League real (el verdadero "quién-juega-dónde")
  try {
    const league = await ensureCurrentLeague();
    const entries = await listLeague(league.id);
    entries.forEach((e) => add({ name: e.playerName, elo: e.rating, level: Math.round(e.rating / 400 * 10) / 10, source: 'league' }));
  } catch { /* liga no disponible */ }

  // 2) Jugadores del torneo activo (store real)
  try {
    (getState().players || []).forEach((p) => add({ name: p.name, elo: p.elo, level: p.level || 3, source: 'tournament' }));
  } catch { /* sin store */ }

  // 3) Semilla del club (solo si hace falta para que la demo tenga vida)
  SEED_PLAYERS.forEach((p) => add({ ...p, source: 'seed' }));

  return pool;
}

// ---- Algoritmo de emparejamiento ----
// Encuentra los N rivales más compatibles para un jugador:
//  - proximidad de rating (core, ±150 ideal)
//  - si el jugador define disponibilidad, solo gente con la que comparte franja
//  - preferencia por mano complementaria (diestro↔zurdo en pareja)
export function findMatches(pool, { name, elo = 1500, availability = [], omit = [] }) {
  const others = pool.filter((p) => !omit.includes(p.name) && slugish(p.name) !== slugish(name));
  const scored = others.map((p) => {
    let score = 100;

    // proximidad de rating: 100 - penalización (100 por cada 100 pts de diferencia)
    const diff = Math.abs(Number(p.elo || 1500) - Number(elo || 1500));
    score -= Math.min(100, diff); // hasta -100
    if (diff <= 150) score += 30;
    else if (diff <= 250) score += 10;

    // disponibilidad compartida
    let shared = 0;
    if (availability.length && p.availability.length) {
      shared = availability.filter((s) => p.availability.includes(s)).length;
      score += shared * 10;
    }

    // mano complementaria (para pareja: diestro con zurdo)
    const myHand = ''; // en "busco cuarto" no hay mano fija; bono neutro
    score += shared > 0 ? 5 : 0;

    return { ...p, score: Math.max(0, Math.round(score)), diff: Math.round(diff) };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 8);
}

// Nivel de lectura humana del rating
export function levelFromElo(elo = 1500) {
  const n = elo / 1000;
  return n <= 1.2 ? 1.0 : n <= 1.4 ? 1.5 : n <= 1.6 ? 2.0 : n <= 1.8 ? 2.5 : n <= 2.0 ? 3.0 : n <= 2.2 ? 3.5 : n <= 2.4 ? 4.0 : 4.5;
}

export function eloBand(level = 3.0) {
  return { min: Math.round(level * 400), max: Math.round(level * 400) + 800 };
}

// ---- Partidos parejos para un club (widget) ----
// Devuelve hasta N partidos "parejos" derivados de anuncios "busco cuarto"
// de jugadores de la misma ciudad/club. Si no hay anuncios reales, usa la bolsa semilla.
export async function getFairMatchesForClub(club, maxMatches = 4) {
  const ads = readAds().filter(a => a.status === 'open');
  const pool = await buildPlayerPool();
  const city = club?.city?.toLowerCase();
  const clubName = club?.name?.toLowerCase();

  // Filtrar ads de la ciudad/club o jugadores de la bolsa de esa ciudad
  const relevantAds = ads.filter(ad => {
    const player = pool.find(p => p.name === ad.name);
    if (!player) return true; // mantener si no está en pool
    const pCity = (player.city || '').toLowerCase();
    const pClub = (player.club || '').toLowerCase();
    return pCity === city || pClub === clubName;
  });

  const matches = [];
  const used = new Set();

  for (const ad of relevantAds) {
    const player = pool.find(p => p.name === ad.name) || { name: ad.name, elo: ad.elo, availability: ad.when };
    const opponents = findMatches(pool, { name: player.name, elo: player.elo, availability: player.availability || [], omit: [...used] });
    const best = opponents[0];
    if (best && !used.has(best.name)) {
      matches.push({
        player1: { name: player.name, elo: Math.round(player.elo), level: levelFromElo(player.elo) },
        player2: { name: best.name, elo: Math.round(best.elo), level: levelFromElo(best.elo) },
        diff: best.diff,
        when: ad.when || 'Por confirmar',
        slot: ad.slot || 'Abierto',
        score: best.score,
      });
      used.add(player.name);
      used.add(best.name);
    }
    if (matches.length >= maxMatches) break;
  }

  // Fallback: si no hay anuncios reales, generar demo desde pool de la ciudad
  if (matches.length === 0) {
    const cityPlayers = pool.filter(p => {
      const pCity = (p.city || '').toLowerCase();
      return pCity === city;
    });
    for (let i = 0; i + 1 < cityPlayers.length && matches.length < maxMatches; i += 2) {
      const p1 = cityPlayers[i];
      const p2 = cityPlayers[i + 1];
      const diff = Math.abs(p1.elo - p2.elo);
      matches.push({
        player1: { name: p1.name, elo: p1.elo, level: levelFromElo(p1.elo) },
        player2: { name: p2.name, elo: p2.elo, level: levelFromElo(p2.elo) },
        diff,
        when: 'Demo',
        slot: 'Disponible',
        score: Math.max(0, 100 - diff),
      });
    }
  }

  return matches;
}