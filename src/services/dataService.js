/**
 * dataService.js — Capa de persistencia con Supabase (cuando está configurado)
 * con fallback local transparente. Usa la clave anon pública (segura en frontend).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const dataOnline = isSupabaseConfigured;

// ---------- Torneos ----------
export async function loadTournaments() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createTournament(values) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from('tournaments').insert([values]).select().single();
  if (error) throw error;
  return data;
}

export async function saveTournament(id, values) {
  if (!isSupabaseConfigured) return;
  await supabase.from('tournaments').update(values).eq('id', id);
}

// ---------- Jugadores / Parejas / Partidos / Pistas ----------
export async function seedTournamentData(tournamentId, demoData) {
  if (!isSupabaseConfigured) return;
  const { players, pairs, courts, matches } = demoData;

  // Jugadores
  const playerMap = {};
  for (const p of players) {
    const { data } = await supabase.from('players').insert([{
      tournament_id: tournamentId, name: p.name, elo: p.elo, level: p.level,
      matches_played: p.matchesPlayed || 0, wins: p.wins || 0, losses: p.losses || 0,
    }]).select().single();
    if (data) playerMap[p.id] = data.id;
  }

  // Parejas
  const pairMap = {};
  for (const p of pairs) {
    const { data } = await supabase.from('pairs').insert([{
      tournament_id: tournamentId,
      player1: playerMap[p.player1Id] || null,
      player2: playerMap[p.player2Id] || null,
      name: `${p.player1} / ${p.player2}`,
      ranking: p.ranking, points: p.points, games_won: p.gamesWon,
      games_lost: p.gamesLost, diff: p.diff,
    }]).select().single();
    if (data) pairMap[p.id] = data.id;
  }

  // Pistas
  const courtMap = {};
  for (const c of courts) {
    const { data } = await supabase.from('courts').insert([{ tournament_id: tournamentId, name: c.name, status: c.status }]).select().single();
    if (data) courtMap[c.id] = data.id;
  }

  // Partidos
  for (const m of matches) {
    await supabase.from('matches').insert([{
      tournament_id: tournamentId, round: m.round, score_set1: m.scoreSet1, score_set2: m.scoreSet2,
      current_set: m.currentSet, gold_point_occurrences: m.goldPointOccurrences, status: m.status,
    }]);
  }
}

export async function pushChat(tournamentId, author, body) {
  if (!isSupabaseConfigured) return;
  await supabase.from('messages').insert([{ tournament_id: tournamentId, author, body }]);
}

// ---------- Perfiles de jugadores (login por email) ----------
export async function getProfile(userId) {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function upsertProfile(userId, values) {
  if (!isSupabaseConfigured || !userId) return;
  await supabase.from('profiles').upsert({ id: userId, ...values, updated_at: new Date().toISOString() });
}

export async function listTournamentsInCloud(userId, email) {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase.from('tournament_state').select('tournament_key, data, updated_at').order('updated_at', { ascending: false }).limit(50);
  const list = (data || []).map(s => {
    const tournament = s.data?.tournament || {};
    return {
      key: s.tournament_key,
      name: tournament.name || s.tournament_key,
      club: tournament.club || '',
      status: tournament.status || 'active',
      updatedAt: s.updated_at,
      pairs: (s.data?.pairs || []).length,
    };
  });
  // filtro opcional por email del organizador (si incluimos dueño)
  return list;
}