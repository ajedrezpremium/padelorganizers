/**
 * leagueService.js — Ranked League persistente (Hito 5).
 * Tabla de honor global por club con badge y rating Elo, reset mensual.
 * Persistencia: Supabase (tablas `leagues` + `league_entries`) si hay modo
 * online; si no, localStorage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LS_LEAGUES = 'padelorganizers-leagues';
const LS_ENTRIES = 'padelorganizers-league-entries';

// ---------- capa local ----------
function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeLocal(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    /* ignore */
  }
}

function addUnique(list) {
  const seen = new Set();
  return list.filter(x => (seen.has(x.id) ? false : (seen.add(x.id), true)));
}

function mapEntry(row) {
  return {
    id: row.id, leagueId: row.league_id, playerName: row.player_name,
    playerId: row.player_id, pairNames: row.pair_names, club: row.club,
    badge: row.badge || 'FRIEND', rating: Number(row.rating) || 1500,
    played: row.played || 0, wins: row.wins || 0, losses: row.losses || 0,
    points: row.points || 0, champion: row.champion || 0,
    createdAt: row.created_at,
  };
}
function mapLeague(row) {
  return {
    id: row.id, name: row.name, club: row.club, season: row.season,
    startsOn: row.starts_on, createdAt: row.created_at,
  };
}

function sortEntries(list) {
  return [...list].sort((a, b) => b.rating - a.rating || b.points - a.points);
}
function mergeNoDup(a, b) {
  return addUnique([...a, ...b]);
}

// Crea la liga de la temporada actual (o devuelve la existente)
export async function ensureCurrentLeague({ name = 'Ranked League', club = 'PadelOrganizers' } = {}) {
  const season = currentSeason();
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('leagues').select('*').eq('season', season).limit(1).maybeSingle();
    if (data) return mapLeague(data);
    const { data: created, error } = await supabase.from('leagues').insert([{ name, club, season }]).select().single();
    if (!error && created) return mapLeague(created);
  } else {
    const local = readLocal(LS_LEAGUES);
    const existing = local.find(l => l.season === season);
    if (existing) return existing;
    const league = { id: `lg-${Date.now()}`, name, club, season, createdAt: new Date().toISOString() };
    writeLocal(LS_LEAGUES, [league, ...local]);
    return league;
  }
}

// Lista la tabla de honor de una liga, ordenada por rating
export async function listLeague(leagueId, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS_ENTRIES).filter(e => e.leagueId === leagueId);
  if (!cloud) return sortEntries(local);
  const { data, error } = await supabase
    .from('league_entries')
    .select('*')
    .eq('league_id', leagueId)
    .order('rating', { ascending: false });
  if (error || !data) return sortEntries(local);
  const rows = data.map(mapEntry);
  return sortEntries(mergeNoDup(local, rows));
}

// Añade o actualiza una entrada (jugador/pareja + club + badge)
export async function upsertEntry(leagueId, { playerName, club, badge = 'FRIEND', pairNames, rating = 1500, playerId = null, cloud = isSupabaseConfigured }) {
  const local = readLocal(LS_ENTRIES);
  const existing = local.find(e => e.leagueId === leagueId && e.playerName === playerName);
  const entry = {
    id: existing ? existing.id : `en-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    leagueId, playerName, playerId, pairNames, club, badge,
    rating, played: existing ? existing.played : 0, wins: existing ? existing.wins : 0,
    losses: existing ? existing.losses : 0, points: existing ? existing.points : 0,
    champion: existing ? existing.champion : 0, createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };
  const next = existing
    ? local.map(x => (x.id === existing.id ? entry : x))
    : [entry, ...local];
  writeLocal(LS_ENTRIES, next);

  if (cloud) {
    await supabase.from('league_entries').upsert({
      league_id: leagueId, player_name: playerName, player_id: playerId,
      pair_names: pairNames, club, badge, rating,
    }, { onConflict: 'league_id,player_name' });
  }
  return entry;
}

// Registra el resultado de una partida en la liga (rating + W/L + puntos)
export async function recordMatch(leagueId, { club, badge }) {
  const season = currentSeason();
  // Esta función se conecta con los datos globales; para simplificar el Hito 5
  // dejamos la lógica de resultados en el componente, que llama a upsertEntry.
  return { season };
}

// Badges disponibles para elegir
export const BADGES = [
  { id: 'FRIEND', icon: '\u{1F60E}', label: 'Friend' },
  { id: 'PRO', icon: '\uD83E\uDD3A', label: 'Pro' },
  { id: 'LEGEND', icon: '🏆', label: 'Legend' },
  { id: 'VIP', icon: '\uD83C\uDF1F', label: 'VIP' },
];

export function currentSeason() {
  return new Date().toISOString().slice(0, 7);
}

export function badgeIcon(id) {
  const b = BADGES.find(x => x.id === id);
  return b ? b.icon : '\u{1F60E}';
}