/**
 * momentsService.js — "Moments" del partido (puntos destacados).
 * Cada moment guarda quién, contra quién, el resultado y votos (❤️).
 * Persistencia: Supabase (tabla `moments`) si hay modo online, si no localStorage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LS_PREFIX = 'padelorganizers-moments-';

// ---------- capa local ----------
function readLocal(matchKey) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + matchKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeLocal(matchKey, list) {
  try {
    localStorage.setItem(LS_PREFIX + matchKey, JSON.stringify(list));
  } catch (e) {
    /* ignore */
  }
}

// ---------- carga (nube si está configurada, con merge local) ----------
export async function loadMoments(matchKey, { tournamentKey = 'demo', cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(matchKey);
  if (!cloud) return local;
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .eq('match_key', matchKey)
    .order('created_at', { ascending: true })
    .limit(100);
  if (error || !data) return local;
  // mezcla: si el local tiene momentos que la nube no, los deja (demo local primero)
  const merged = [...local, ...data.map(mapRow)];
  const seen = new Set();
  return merged.filter(m => (seen.has(m.id) ? false : (seen.add(m.id), true)));
}

// añade un momento (nube + local espejo)
export async function addMoment({ matchKey = 'demo', tournamentKey = 'demo', title = '🔥 Punto de la ronda', pair1Names, pair2Names, score, combo = 1, cloud = isSupabaseConfigured }) {
  const moment = {
    id: `mom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title, pair1Names, pair2Names, score, combo, votes: 0,
    createdAt: new Date().toISOString(),
  };
  const local = readLocal(matchKey);
  local.push(moment);
  writeLocal(matchKey, local);

  if (cloud) {
    await supabase.from('moments').insert([{
      match_key: matchKey, tournament_key: tournamentKey,
      title, pair1_names: pair1Names, pair2_names: pair2Names, score,
      combo, votes: 0,
    }]);
  }
  return local;
}

// vota en un momento (nube + local)
export async function toggleVote(matchKey, momentId, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(matchKey).map(m => (m.id === momentId ? { ...m, votes: m.votes + 1 } : m));
  writeLocal(matchKey, local);
  if (cloud) {
    const { data } = await supabase.from('moments').select('votes').eq('id', momentId).maybeSingle();
    const votes = ((data && data.votes) || 0) + 1;
    await supabase.from('moments').update({ votes }).eq('id', momentId);
  }
  return local;
}

function mapRow(row) {
  return {
    id: row.id, title: row.title, pair1Names: row.pair1_names, pair2Names: row.pair2_names,
    score: row.score, combo: row.combo, votes: row.votes, createdAt: row.created_at,
  };
}

// Compatibilidad: versión síncrona para uso sencillo en componentes (usa local)
export function loadMomentsSync(matchKey) {
  return readLocal(matchKey);
}

export async function persistMomentsToCloud(state, moments) {
  const key = String(state.tournament?.id || 'demo');
  const cloudState = { ...state, liveMoments: moments };
  const { pushState } = await import('./cloudService');
  return pushState(cloudState);
}