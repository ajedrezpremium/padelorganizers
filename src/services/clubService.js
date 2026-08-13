/**
 * clubService.js — Reservas de pistas de la App Club.
 * Persistencia: Supabase si hay modo online, si no localStorage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LS_KEY = 'padelorganizers-reservas';
const LS_WAIT = 'padelorganizers-waitlist';
export const CLUB_PRICE = { euro: 8, dollar: 9 } ;
export const SLOTS = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
export const NOSHOW_DEPOSIT = 2; // fianza anti no-show en €

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
    payment_method: payload.payment_method || 'stripe',
    stripe_session: payload.stripe_session || null,
    paypal_order: payload.paypal_order || null,
    deposit_eur: payload.deposit_eur || 0,
    refundable: !!payload.refundable,
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

// Cancela una reserva: libera el slot y promueve al primer jugador de la espera
export async function cancelReservation(id) {
  const booking = (await listReservations()).find(r => r.id === id);
  if (!booking) return;
  await markReservationStatus(id, 'cancelled');
  const wait = await listWaitlist();
  const promo = wait.find(w => w.status === 'waiting' && w.court_name === booking.court_name && w.day === booking.day && w.time_slot === booking.time_slot);
  if (promo) {
    await addReservation({
      court_name: promo.court_name, day: promo.day, time_slot: promo.time_slot,
      player_name: promo.name, player_email: promo.email, user_id: null,
      price: CLUB_PRICE.euro, currency: 'eur', status: 'pending',
    });
    await markWaitStatus(promo.id, 'promoted');
  }
}

// ---------- Lista de espera (anti no-show) ----------
export async function listWaitlist() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reservation_waitlist')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);
    if (!error && data) {
      return data.map(r => ({
        id: r.id, courtName: r.court_name, day: r.day, timeSlot: r.time_slot,
        name: r.name, email: r.email, status: r.status, createdAt: r.created_at,
      }));
    }
  }
  try { return JSON.parse(localStorage.getItem(LS_WAIT) || '[]'); } catch { return []; }
}

export async function addWaitlist({ courtName, day, timeSlot, name, email }) {
  const rec = {
    id: `w-${Date.now()}`,
    courtName, day, timeSlot, name, email, status: 'waiting',
    createdAt: new Date().toISOString(),
  };
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('reservation_waitlist').insert({
      court_name: courtName, day, time_slot: timeSlot, name, email, status: 'waiting',
    }).select().single();
    if (!error && data) {
      return { id: data.id, courtName, day, timeSlot, name, email, status: 'waiting', createdAt: data.created_at };
    }
  }
  const prev = await listWaitlist();
  localStorage.setItem(LS_WAIT, JSON.stringify([...prev, rec]));
  return rec;
}

export async function markWaitStatus(id, status) {
  if (isSupabaseConfigured) {
    await supabase.from('reservation_waitlist').update({ status }).eq('id', id);
    return;
  }
  const prev = await listWaitlist();
  localStorage.setItem(LS_WAIT, JSON.stringify(prev.map(w => (w.id === id ? { ...w, status } : w))));
}