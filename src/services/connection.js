/**
 * connection.js — Modo de conexión global (Local ↔ Nube).
 * Persistido en localStorage para que sobreviva recargas.
 *  - 'online': datos sincronizados con Supabase.
 *  - 'offline': todo en localStorage (modo demo sin internet).
 */

import { isSupabaseConfigured } from '../lib/supabaseClient';

const KEY = 'padelorganizers-mode';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === 'offline') return 'offline';
    return isSupabaseConfigured ? 'online' : 'offline';
  } catch {
    return isSupabaseConfigured ? 'online' : 'offline';
  }
}

let mode = typeof localStorage !== 'undefined' ? read() : (isSupabaseConfigured ? 'online' : 'offline');
const listeners = new Set();

export const isOnline = () => mode === 'online';

export function getMode() {
  return mode;
}

export function setMode(next) {
  mode = next === 'online' ? 'online' : 'offline';
  try {
    localStorage.setItem(KEY, mode);
  } catch (e) {
    /* ignore */
  }
  listeners.forEach(fn => fn(mode));
}

export function subscribeMode(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}