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