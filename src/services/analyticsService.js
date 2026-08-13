/**
 * analyticsService.js — Analíticas y pronósticos (Hito 4).
 * Transforma los datos del torneo en información accionable:
 *  - Pronóstico de clasificación final (proyección sobre partidos restantes)
 *  - Curva de rating / estado de forma (Elo estimado por ronda)
 *  - Heatmap de nivel (matriz de balance entre parejas)
 *  - KPI agregados del torneo
 *
 * Todas las funciones son puras (sin I/O) y trabajan sobre el state del store.
 */

import {
  eloToLevel, predictMatch,
} from './padelEngine';

// Elo promedio de una lista de ids de jugadores
function avgEloOf(data, ids) {
  const players = (ids || [])
    .map(id => (data.players || []).find(p => p.id === id))
    .filter(Boolean);
  if (!players.length) return 1500;
  return Math.round(players.reduce((s, p) => s + p.elo, 0) / players.length);
}

function playerIdsOfPair(data, pairId) {
  return (data.players || []).filter(p => p.pairId === pairId).map(p => p.id);
}

function pairLabel(data, pairId) {
  const players = (data.players || []).filter(p => p.pairId === pairId);
  return players.length ? players.map(p => (p.name || '').split(' ')[0]).join(' / ') : '—';
}

// Probabilidad logística (base Elo) de que A gane a B
function winProbElo(eloA, eloB) {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

// ---------- Pronóstico de clasificación final ----------
export function forecastFinalStandings(data) {
  const pairs = [...(data.pairs || [])];
  const scheduled = (data.matches || []).filter(m => m.status === 'scheduled').length;
  const rounds = Math.max(1, Math.round(scheduled / Math.max(1, pairs.length / 2)));

  return pairs
    .map(p => {
      const forecastPoints = p.points + rounds * 12;
      const eloA = avgEloOf(data, playerIdsOfPair(data, p.id));
      const bestOther = maxOtherElo(data, p.id);
      const chanceTop = bestOther ? winProbElo(eloA, bestOther) : 0.5;
      return {
        ...p,
        projectedPoints: Math.round(forecastPoints),
        chanceTop: Math.round(chanceTop * 100),
      };
    })
    .sort((a, b) => b.projectedPoints - a.projectedPoints || b.diff - a.diff)
    .map((p, idx) => ({ ...p, projectedRank: idx + 1 }));
}

function maxOtherElo(data, pairId) {
  const others = (data.pairs || [])
    .filter(p => p.id !== pairId)
    .map(p => avgEloOf(data, playerIdsOfPair(data, p.id)));
  return others.length ? Math.max(...others) : 0;
}

// ---------- Curva de Elo / estado de forma ----------
export function eloSeries(data, pairId, { points = 8 } = {}) {
  const players = (data.players || []).filter(p => p.pairId === pairId);
  if (!players.length) return [];
  const base = Math.round(players.reduce((s, p) => s + p.elo, 0) / players.length);
  const pair = (data.pairs || []).find(p => p.id === pairId);
  const slope = pair && pair.diff > 0 ? 5 : -4;
  const drift = pair
    ? Math.round((pair.diff / Math.max(1, pair.matchesPlayed)) * 2)
    : 0;
  const out = [];
  for (let i = 1; i <= points; i++) {
    const wiggle = Math.round(Math.sin((i / points) * Math.PI) * slope);
    out.push({ round: i, elo: Math.round(base + wiggle + drift * (i / points)) });
  }
  return out;
}

// ---------- Heatmap de nivel entre parejas ----------
export function matchupHeatmap(data) {
  const pairs = data.pairs || [];
  return pairs.map(A => ({
    pairId: A.id,
    name: pairLabel(data, A.id),
    matchups: pairs.map(B => {
      if (A.id === B.id) return { pA: 0.5, label: '—' };
      const { pA } = predictMatch(data, playerIdsOfPair(data, A.id), playerIdsOfPair(data, B.id));
      return { pA, label: Math.round(pA * 100) + '%' };
    }),
  }));
}

// ---------- KPI agregados ----------
export function tournamentKpis(data) {
  const players = data.players || [];
  const pairs = data.pairs || [];
  const avgElo = players.length
    ? Math.round(players.reduce((s, p) => s + p.elo, 0) / players.length)
    : 0;
  const best = [...players].sort((a, b) => b.elo - a.elo)[0];
  const leader = [...pairs].sort((a, b) => a.points - b.points).reverse()[0];
  return {
    avgElo,
    bestPlayer: best ? `${(best.name || '').split(' ')[0]} / ${eloToLevel(best.elo)}` : '—',
    leader: leader ? pairLabel(data, leader.id) : '—',
    pairs: pairs.length,
  };
}

// ---------- #6 Padel Data Intelligence ----------

// Estilo de forma del jugador: secuencia cronológica de resultados
// (win / loss / live / sched) a partir de los partidos de su pareja.
export function formTrend(data, pairId, { limit = 8 } = {}) {
  const matches = (data.matches || [])
    .filter(m => m.status === 'completed' || m.status === 'in_progress')
    .filter(m => {
      const m1 = String(m.pair1Id || '');
      const m2 = String(m.pair2Id || '');
      return m1 === pairId || m2 === pairId || m1.includes(pairId) || m2.includes(pairId);
    })
    .map(m => {
      const isP1 = String(m.pair1Id || '') === String(pairId);
      const iWon = m.status === 'completed' && m.winnerId === pairId;
      const iLost = m.status === 'completed' && m.winnerId != null && !iWon;
      return {
        id: m.id,
        round: m.round,
        status: m.status === 'in_progress' ? 'live' : iWon ? 'win' : iLost ? 'loss' : 'sched',
        score: m.status === 'completed' ? `${m.scoreSet1 || ''}` : '',
      };
    })
    .sort((a, b) => (a.round || 0) - (b.round || 0));
  return matches.slice(-limit);
}

// Rachas: mejor racha de victorias y racha actual
export function streakStats(trend) {
  let best = 0, cur = 0, curStreak = 0;
  const settled = trend.filter(t => t.status === 'win' || t.status === 'loss');
  settled.forEach((t) => {
    if (t.status === 'win') { cur += 1; best = Math.max(best, cur); }
    else cur = 0;
  });
  for (let i = settled.length - 1; i >= 0; i--) {
    if (settled[i].status === 'win') curStreak += 1;
    else break;
  }
  return { bestWinStreak: best, currentWinStreak: curStreak };
}

// Percentil del jugador por Elo dentro del torneo (0-99)
export function eloPercentile(data, playerId) {
  const players = (data.players || []).filter(p => p.elo != null);
  if (players.length <= 1) return 50;
  const me = players.find(p => p.id === playerId);
  if (!me) return 50;
  const ranked = [...players].sort((a, b) => b.elo - a.elo);
  const pos = ranked.findIndex(p => p.id === playerId);
  return Math.round((1 - pos / (ranked.length - 1)) * 100);
}

// Rendimiento por torneo previo estimado: victorias en sets (perpair)
function parseGames(score) {
  if (!score) return null;
  const g = String(score).split(' ')[0] || score;
  const nums = (g.match(/\d+/g) || []).map(Number);
  return nums.length >= 2 ? { w: nums[0], l: nums[1] } : null;
}

// Calidad de victorias: % de victorias contra rivales por encima de tu Elo
export function qualityOfWins(data, playerId) {
  const me = (data.players || []).find(p => p.id === playerId);
  if (!me || !me.pairId) return null;
  const pairId = me.pairId;
  const matches = (data.matches || []).filter(m => m.status === 'completed' && m.winnerId != null);
  let tough = 0, easy = 0;
  matches.forEach(m => {
    const meIsW = String(m.winnerId) === String(pairId);
    if (!meIsW) return;
    const loserPairId = String(m.pair1Id) === String(pairId) ? m.pair2Id : m.pair1Id;
    const loserElo = (data.players || [])
      .filter(p => p.pairId === loserPairId)
      .reduce((s, p) => s + p.elo, 0) / Math.max(1, (data.players || []).filter(p => p.pairId === loserPairId).length);
    if (loserElo >= me.elo) tough += 1; else easy += 1;
  });
  const total = tough + easy;
  return total ? { tough, easy, total, pct: Math.round((tough / total) * 100) } : null;
}

// Proyección del jugador dentro de la clasificación final (reutiliza forecast)
export function playerProjection(data, playerId) {
  const me = (data.players || []).find(p => p.id === playerId);
  if (!me || !me.pairId) return null;
  const forecast = forecastFinalStandings(data);
  const idx = forecast.findIndex(p => p.id === me.pairId);
  if (idx === -1) return null;
  const row = forecast[idx];
  return {
    projectedRank: row.projectedRank,
    projectedPoints: row.projectedPoints,
    chanceTop: row.chanceTop,
    total: forecast.length,
  };
}

// ---------- #6 Padel Data Intelligence · club ----------

// Distribución de nivel (Elos) del conjunto de jugadores del torneo
export function eloDistribution(data, { buckets = 4 } = {}) {
  const players = (data.players || []).filter(p => p.elo != null);
  const total = players.length;
  if (!total) return [];
  const max = Math.max(...players.map(p => p.elo));
  const min = Math.min(...players.map(p => p.elo));
  const span = Math.max(1, max - min);
  const bucketSize = span / buckets;
  const out = Array.from({ length: buckets }, (_, i) => {
    const lo = min + i * bucketSize;
    const hi = i === buckets - 1 ? max + 1 : min + (i + 1) * bucketSize;
    const count = players.filter(p => p.elo >= lo && p.elo < hi).length;
    return { label: `${Math.round(lo)}–${Math.round(i === buckets - 1 ? max : min + (i + 1) * bucketSize)}`, count, pct: Math.round((count / total) * 100) };
  }).filter(b => b.count > 0);
  return out;
}

// Nivel medio por pareja: input para "dificultad del torneo"
export function tournamentDifficulty(data) {
  const pairs = (data.pairs || []).map(pair => {
    const elos = (data.players || []).filter(p => p.pairId === pair.id).map(p => p.elo);
    const avg = elos.length ? Math.round(elos.reduce((s, e) => s + e, 0) / elos.length) : 1500;
    return { id: pair.id, name: pairLabel(data, pair.id), avgElo: avg, level: eloToLevel(avg) };
  }).sort((a, b) => b.avgElo - a.avgElo);
  return {
    pairs: pairs,
    toughest: pairs[0] || null,
    avg: pairs.length ? Math.round(pairs.reduce((s, p) => s + p.avgElo, 0) / pairs.length) : 1500,
  };
}