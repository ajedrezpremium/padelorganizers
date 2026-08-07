/**
 * clubService.js — Reservas de pistas de la App Club.
 * Persistencia: Supabase si hay modo online, si no localStorage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LS_KEY = 'padelorganizers-reservas';
export const CLUB_PRICE = { euro: 8, dollar: 9 } ;
export const SLOTS = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

export function clubOnline() {
  return isSupabaseConfigured;
}

// ---------- Reservas ----------
export async function listReservations() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error && data) return data;
  }
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}

export async function addReservation(payload) {
  const row = {
    court_name: payload.court_name,
    day: payload.day,
    time_slot: payload.time_slot,
    player_name: payload.player_name,
    player_email: payload.player_email,
    user_id: payload.user_id || null,
    price: payload.price,
    currency: 'eur',
    status: payload.status || 'pending',
    stripe_session: payload.stripe_session || null,
  };
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('reservations').insert([row]).select().single();
    if (!error && data) return data;
  }
  // fallback local
  const prev = await listReservations();
  const withId = { ...row, id: `r-${Date.now()}` };
  const next = [withId, ...prev];
  localStorage.setItem(LS_KEY, JSON.stringify(next));
  return withId;
}

// Bloquea/desbloquea un horario (se llama al completar pago demo)
export async function markReservationStatus(id, status) {
  if (isSupabaseConfigured) {
    await supabase.from('reservations').update({ status }).eq('id', id);
    return;
  }
  const prev = await listReservations();
  const next = prev.map(r => (r.id === id ? { ...r, status } : r));
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}