/**
 * globalRankingService.js — #7 Global Padel Ranking Engine.
 * Agrega a TODOS los jugadores del ecosistema en una única clasificación
 * mundial amateur:
 *   - Jugadores del torneo activo (store) con su Elo real y nivel de torneo
 *   - Entradas de la Ranked League global (rating manual / liga)
 * Cada jugador obtiene: elo global, nivel (1.0–5.0), percentil, partidas,
 * victorias, racha y movimiento respecto al snapshot previo.
 * Pura: sin I/O, recibe los datos como argumentos.
 */

import { eloToLevel } from './padelEngine';

const DEFAULT_ELO = 1500;

// Snapshot previo en localStorage para calcular el movimiento (▲/▼/—)
const LS_SNAPSHOT = 'padelorganizers-global-ranking-snapshot';

// ---------- helpers ----------

function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function normName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// ---------- agregación ----------

// Jugadores del torneo activo: cada player + su pareja (puntos/diff)
function tournamentPlayers(data) {
  if (!data || !Array.isArray(data.players)) return [];
  return data.players
    .map(p => {
      const pair = (data.pairs || []).find(pair => pair.id === p.pairId);
      return {
        key: normName(p.name),
        name: p.name,
        club: (data.tournament && data.tournament.club) || '—',
        source: 'tournament',
        sourceLabel: data.tournament ? data.tournament.name : 'Torneo',
        elo: Number(p.elo) || DEFAULT_ELO,
        level: Number(p.level) || eloToLevel(Number(p.elo) || DEFAULT_ELO),
        played: Number(p.matchesPlayed) || (pair ? Number(pair.matchesPlayed) || 0 : 0),
        wins: Number(p.wins) || 0,
        losses: Number(p.losses) || 0,
        points: pair ? Number(pair.points) || 0 : 0,
        diff: pair ? Number(pair.diff) || 0 : 0,
        pairName: pair ? `${pair.player1} / ${pair.player2}` : null,
        pairRank: pair ? pair.ranking : null,
        badge: 'PRO',
      };
    })
    .filter(Boolean);
}

// Entradas de la Ranked League global
function leaguePlayers(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map(e => ({
    key: normName(e.playerName),
    name: e.playerName,
    club: e.club || '—',
    source: 'league',
    sourceLabel: 'Ranked League',
    elo: Number(e.rating) || DEFAULT_ELO,
    level: Number.isFinite(e.level) ? e.level : eloToLevel(Number(e.rating) || DEFAULT_ELO),
    played: Number(e.played) || 0,
    wins: Number(e.wins) || 0,
    losses: Number(e.losses) || 0,
    points: Number(e.points) || 0,
    diff: 0,
    pairName: e.pairNames || null,
    pairRank: null,
    badge: e.badge || 'FRIEND',
  }));
}

// Une por nombre normalizado, priorizando el torneo (Elo real) sobre la liga
export function computeGlobalRanking({ tournament, leagueEntries = [] } = {}) {
  const fromTournament = tournamentPlayers(tournament);
  const fromLeague = leaguePlayers(leagueEntries);
  const merged = new Map();

  fromLeague.forEach(l => {
    if (!l.key) return;
    merged.set(l.key, { ...l });
  });
  fromTournament.forEach(t => {
    if (!t.key) return;
    const existing = merged.get(t.key);
    if (existing) {
      merged.set(t.key, {
        ...existing,
        ...t,
        played: Math.max(existing.played, t.played),
        wins: Math.max(existing.wins, t.wins),
        losses: Math.max(existing.losses, t.losses),
        points: Math.max(existing.points, t.points),
      });
    } else {
      merged.set(t.key, { ...t });
    }
  });

  const total = merged.size;
  const prevMap = readSnapshot();
  const ranked = [...merged.values()]
    .sort((a, b) => b.elo - a.elo || b.points - a.points)
    .map((row, idx) => {
      const prev = prevMap.get(row.key);
      return {
        ...row,
        rank: idx + 1,
        percentile: pct(total - idx, total),
        movement: prev == null ? 'new' : prev === row.elo ? 'same' : prev < row.elo ? 'up' : 'down',
        eloDelta: prev == null ? 0 : row.elo - prev,
      };
    });

  return ranked;
}

// ---------- snapshot (persistencia de movimiento) ----------

export function readSnapshot() {
  try {
    const raw = localStorage.getItem(LS_SNAPSHOT);
    return raw ? new Map(Object.entries(JSON.parse(raw))) : new Map();
  } catch {
    return new Map();
  }
}

export function saveSnapshot(ranking) {
  try {
    const map = {};
    ranking.forEach(r => { map[r.key] = r.elo; });
    localStorage.setItem(LS_SNAPSHOT, JSON.stringify(map));
  } catch (e) {
    /* ignore */
  }
}

// ---------- estadísticas globales ----------

export function globalStats(ranking) {
  const list = ranking || [];
  if (!list.length) {
    return { players: 0, avgElo: 0, topElo: 0, clubs: 0, tournaments: 0 };
  }
  const avgElo = Math.round(list.reduce((s, r) => s + r.elo, 0) / list.length);
  return {
    players: list.length,
    avgElo,
    topElo: Math.max(...list.map(r => r.elo)),
    clubs: new Set(list.map(r => r.club).filter(Boolean)).size,
    tournaments: new Set(list.map(r => r.sourceLabel).filter(Boolean)).size,
  };
}

// Niveles disponibles para filtros
export const LEVELS = [3.0, 3.5, 4.0, 4.5, 5.0];

// ---------- movimiento ----------

export function movementIcon(movement) {
  if (movement === 'up') return '▲';
  if (movement === 'down') return '▼';
  if (movement === 'new') return '✨';
  return '—';
}
