/**
 * store.js — Estado global compartido del torneo con persistencia
 * en localStorage y sincronización en tiempo real entre pestañas.
 * Permite el "Live View" público: el organizador y los espectadores
 * ven los mismos datos en vivo sin servidor.
 */

import { useSyncExternalStore } from 'react';
import { getInitialDemoTournamentData } from '../services/padelEngine';

const STORAGE_KEY = 'padelorganizers-store-v1';

function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // sobreescribe startTime para que los temporizadores arranquen frescos si estaba vacío en courts en juego sin matchId
      return parsed;
    }
  } catch (e) {
    /* ignore */
  }
  return getInitialDemoTournamentData();
}

let state = readInitial();

const listeners = new Set();

function persist() {
  try {
    const raw = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, raw);
  } catch (e) {
    /* ignore quota errors */
  }
}

function emit() {
  persist();
  listeners.forEach(fn => fn());
}

function syncStoreFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const next = raw ? JSON.parse(raw) : getInitialDemoTournamentData();
    const currentState = JSON.stringify(state);
    const nextState = JSON.stringify(next);
    if (currentState !== nextState) {
      state = next;
      listeners.forEach(fn => fn());
    }
  } catch (e) {
    /* ignore invalid storage content */
  }
}

export function getState() {
  return state;
}

export function setState(updater) {
  const next = typeof updater === 'function' ? updater(state) : updater;
  if (next === state) return;
  state = next;
  emit();
  persistTournamentMap(next);
}

export function resetState() {
  state = getInitialDemoTournamentData();
  emit();
}

// Crea (o reemplaza) el torneo activo con los datos del organizador.
// Se usa al finalizar el wizard de /torneo para que el dashboard, el live
// y el chat reflejen el torneo recién creado en lugar del demo.
export function buildTournament(data) {
  if (!data || !data.tournament) return;
  state = data;
  emit();
  persistTournamentMap(data);
}

export const TOURNAMENT_STATES = ['DRAFT','OPEN','REGISTRATION_CLOSED','DRAW_CREATED','SCHEDULED','LIVE','FINAL','CLOSED','ARCHIVED'];
export const CATEGORIES = ['masculino','femenino','mixto'];
export const LEVELS = ['iniciacion','intermedio','avanzado','open'];

export function nextState(current) {
  const idx = TOURNAMENT_STATES.indexOf(current);
  return idx >= 0 && idx < TOURNAMENT_STATES.length - 1 ? TOURNAMENT_STATES[idx+1] : current;
}

// Estado por defecto para "mi torneo" (además del demo importable).
export function emptyTournamentData(id = 'torneo-organizador') {
  return {
    tournament: {
      id, name: 'Mi Torneo', club: 'Mi Club', city: '', modality: 'americano',
      category: 'masculino', level: 'open', gender: 'masculino',
      categories: [{ gender: 'masculino', level: 'open', maxPairs: 16 }],
      totalCourts: 4, pointsPerMatch: 24, goldPoint: true,
      status: 'DRAFT', state: 'DRAFT', lang: 'es',
      maxPairs: 32, sets: 3, gamesPerSet: 6, tieBreak: true, superTieBreak: true,
      pointsSystem: { '1': 1000, '2': 700, '3-4': 500, '5-8': 350, '9-16': 200, '17-32': 100 },
      auditLog: [], createdAt: new Date().toISOString()
    },
    courts: [
      { id: 1, name: 'Pista 1', status: 'free', matchId: null, startTime: null },
      { id: 2, name: 'Pista 2', status: 'free', matchId: null, startTime: null },
      { id: 3, name: 'Pista 3', status: 'free', matchId: null, startTime: null },
      { id: 4, name: 'Pista 4', status: 'free', matchId: null, startTime: null },
    ],
    pairs: [],
    players: [],
    matches: [],
    groups: [],
    schedule: [],
  };
}

export function transitionState(newState) {
  const cur = getState();
  if (!TOURNAMENT_STATES.includes(newState)) return cur;
  const next = { ...cur, tournament: { ...cur.tournament, state: newState, status: newState.toLowerCase(), auditLog: [...(cur.tournament.auditLog||[]), { at: new Date().toISOString(), from: cur.tournament.state, to: newState }] } };
  setState(next);
  persistTournamentMap(next);
  return next;
}

const MAP_KEY = 'padelorganizers-tournaments';
export function persistTournamentMap(data) {
  try {
    const raw = localStorage.getItem(MAP_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const id = data?.tournament?.id;
    if (id) { map[id] = data; localStorage.setItem(MAP_KEY, JSON.stringify(map)); }
  } catch {}
}
export function getTournamentById(id) {
  try {
    const raw = localStorage.getItem(MAP_KEY);
    if (raw) { const map = JSON.parse(raw); if (map[id]) return map[id]; }
  } catch {}
  const cur = getState();
  if (cur?.tournament?.id === id) return cur;
  return null;
}
export function saveTournamentById(id, updater) {
  const existing = getTournamentById(id) || getState();
  const next = typeof updater === 'function' ? updater(existing) : updater;
  if (existing.tournament?.id === getState().tournament?.id) setState(next);
  persistTournamentMap(next);
  return next;
}

// Actualiza el marcador EN VIVO de un partido (juegos/puntos/sets del set actual).
// Escribe en el store global -> se refleja en live pública, chat y dashboard.
export function updateLiveScore(matchId, live) {
  setState(prev => ({
    ...prev,
    matches: prev.matches.map(m =>
      m.id === matchId ? { ...m, live } : m
    ),
  }));
}

// Helper: puntaje vivo normalizado de un partido (con fallback)
export function getLiveScore(match) {
  if (!match) return { games: [0, 0], pts: [0, 0], sets: [0, 0] };
  if (match.live) return match.live;
  // compat: deriva de scoreSet1/2 y currentSet si no hay live
  const games =
    (match.scoreSet1 && match.scoreSet1 !== '0-0' && match.scoreSet1.split('-')[match.currentSet - 1])
      ? [1, 0]
      : [0, 0];
  return { games, pts: [0, 0], sets: [0, 0] };
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Hook para componentes React (re-render en cada cambio, incluido cross-tab)
export function useStore() {
  return useSyncExternalStore(subscribe, getState);
}

// Escucha cambios desde otras pestañas (storage event) y los publica
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      syncStoreFromStorage();
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      syncStoreFromStorage();
    }
  });
}
