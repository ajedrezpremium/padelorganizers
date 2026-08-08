/**
 * splitService.js — Pagos divididos de una reserva (ruta 4).
 * Cada jugador tiene su propio stripe_session en reservation_splits.
 * Persistencia: Supabase si hay modo online, si no localStorage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LS_KEY = 'padelorganizers-splits';

// ---------- Splits de pago ----------
export async function listSplits() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reservation_splits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error && data) return data;
  }
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}

export async function addSplit(row) {
  const payload = {
    reservation_id: row.reservation_id,
    split_index: row.split_index ?? row.index ?? 0,
    total_splits: row.total_splits ?? row.total ?? 1,
    player_name: row.player_name,
    player_email: row.player_email,
    amount_eur: row.amount_eur,
    status: row.status || 'pending',
    stripe_session: row.stripe_session || null,
    paid_at: row.paid_at || null,
  };
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('reservation_splits').insert([payload]).select().single();
    if (!error && data) return data;
  }
  const prev = await listSplits();
  const withId = { ...payload, id: `s-${Date.now()}-${Math.floor(Math.random() * 1e4)}` };
  const next = [withId, ...prev];
  localStorage.setItem(LS_KEY, JSON.stringify(next));
  return withId;
}

// Sincroniza un split con su estado real en Stripe (si el endpoint existe).
export async function syncSplit(split) {
  if (!split || !split.stripe_session) return split;
  try {
    const r = await fetch(`/api/check-status?id=${encodeURIComponent(split.stripe_session)}`);
    const json = await r.json();
    if (json && json.paid && split.status !== 'paid') return { ...split, status: 'paid' };
  } catch { /* modo local/demo: sin endpoint */ }
  return split;
}

// Modo demo (sin Stripe): marcar un split pagado; si nadie queda pendiente
// de la reserva, marcarla completada. Devuelve { paid, completed }.
export async function markSplitPaidLocal(split) {
  if (!split) return { paid: false, completed: false };
  const prev = await listSplits();
  const idx = prev.findIndex(s => s.id === split.id);
  if (idx === -1) return { paid: false, completed: false };
  const paid = { ...prev[idx], status: 'paid' };
  prev[idx] = paid;
  localStorage.setItem(LS_KEY, JSON.stringify(prev));

  const remaining = prev.filter(s => s.reservation_id === split.reservation_id && s.status === 'pending');
  let completed = false;
  if (remaining.length === 0) {
    try {
      const lsRes = 'padelorganizers-reservas';
      const res = JSON.parse(localStorage.getItem(lsRes) || '[]');
      const nextRes = res.map(r => (r.id === split.reservation_id ? { ...r, status: 'completed' } : r));
      localStorage.setItem(lsRes, JSON.stringify(nextRes));
      completed = true;
    } catch { /* noop */ }
  }
  return { paid, completed };
}