/**
 * cloudService.js — Sincronización del estado completo del torneo
 * entre localStorage (modo local) y Supabase (modo nube).
 *
 * Usa la tabla `tournament_state` que guarda el JSON completo,
 * evitando idas y venidas por pares/partidos/parejas individuales.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const cloudReady = isSupabaseConfigured;

// Sube el estado completo a la nube (upsert por tournament_key)
export async function pushState(state) {
  if (!isSupabaseConfigured) return { ok: false, error: 'not_configured' };
  const key = String(state.tournament?.id || 'demo');
  const { error } = await supabase
    .from('tournament_state')
    .upsert({ tournament_key: key, data: state, updated_at: new Date().toISOString() })
    .eq('tournament_key', key);
  return { ok: !error, error };
}

// Descarga el estado completo desde la nube
export async function pullState(tournamentKey) {
  if (!isSupabaseConfigured) return { ok: false, data: null };
  const { data, error } = await supabase
    .from('tournament_state')
    .select('data')
    .eq('tournament_key', tournamentKey)
    .limit(1)
    .single();
  if (error) return { ok: false, data: null };
  return { ok: true, data: data?.data || null };
}

// Lista los torneos guardados en la nube (útil en el landing/dashboard)
export async function listCloudStates() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('tournament_state')
    .select('tournament_key, updated_at')
    .order('updated_at', { ascending: false });
  if (error) return [];
  return data || [];
}

// Elimina un torneo de la nube
export async function removeCloudState(tournamentKey) {
  if (!isSupabaseConfigured) return;
  await supabase.from('tournament_state').delete().eq('tournament_key', tournamentKey);
}