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

export function getState() {
  return state;
}

export function setState(updater) {
  const next = typeof updater === 'function' ? updater(state) : updater;
  if (next === state) return;
  state = next;
  emit();
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
}

// Estado por defecto para "mi torneo" (además del demo importable).
export function emptyTournamentData(id = 'torneo-organizador') {
  return {
    tournament: { id, name: 'Mi Torneo', club: 'Mi Club', modality: 'americano', totalCourts: 4, pointsPerMatch: 24, goldPoint: true, status: 'active', lang: 'es' },
    courts: [
      { id: 1, name: 'Pista 1', status: 'free', matchId: null, startTime: null },
      { id: 2, name: 'Pista 2', status: 'free', matchId: null, startTime: null },
      { id: 3, name: 'Pista 3', status: 'free', matchId: null, startTime: null },
      { id: 4, name: 'Pista 4', status: 'free', matchId: null, startTime: null },
    ],
    pairs: [],
    players: [],
    matches: [],
  };
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
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        state = JSON.parse(e.newValue);
        listeners.forEach(fn => fn());
      } catch (err) {
        /* ignore */
      }
    }
  });
}