/**
 * tournamentTasks.js — Central de Control del Torneo (Hito B).
 * Checklist de tareas pre-programadas que el sistema ejecuta SOLO durante
 * el ciclo de vida de un torneo. Cada tarea tiene un estado que se detecta
 * desde el store real (no promesas vacías) y una acción asociada.
 *
 * Fases:
 *   1. Preparación  2. Inscripciones  3. Cuadro & pistas
 *   4. Día de competición  5. Resultados & ranking  6. Cierre & publicación
 */

import { getState, resetState, buildTournament } from './store';
import { generatePredictivePairings, generatePredictiveMatches, generateKnockout, generateMexicanoPairings } from './padelEngine';
import { currentSeason } from './leagueService';

// ---- utilidades de estado desde el store real ----
function state() {
  return getState() || {};
}
function hasPlayers(n = 4) {
  return (state().players || []).length >= n;
}
function hasPairs() {
  return (state().pairs || []).length >= 2;
}
function hasMatches() {
  return (state().matches || []).length >= 1;
}
function hasFinishedMatches() {
  return (state().matches || []).some(m => m.status === 'finished' || m.status === 'done');
}
function inProgressMatches() {
  return (state().matches || []).some(m => m.status === 'in_progress' || (m.live && m.live.sets));
}
function tournamentName() {
  const t = state().tournament || {};
  return t.name || 'Mi Torneo';
}

/**
 * Regenera el cuadro sobre el torneo actual y lo persiste en el store
 * (mismo motor que /torneo). Devuelve nº de partidos generados.
 */
export function regenerateBracket() {
  const data = state();
  const format = (data.tournament || {}).modality || 'americano';
  const pls = data.players || [];
  const mk = (idsA, idsB, round) => ({
    id: `ctl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    round: round || 1,
    courtId: null, pair1Id: null, pair2Id: null,
    pair1Names: idsA.map(id => (pls.find(p => p.id === id) || {}).name || '').map(n => (n || '').split(' ')[0]).join(' / '),
    pair2Names: idsB.map(id => (pls.find(p => p.id === id) || {}).name || '').map(n => (n || '').split(' ')[0]).join(' / '),
    playerIds1: idsA, playerIds2: idsB,
    scoreSet1: '0-0', scoreSet2: '0-0', currentSet: 1, goldPointOccurrences: 0, status: 'scheduled',
  });
  const pairTeams = () => {
    const teams = [];
    for (let i = 0; i + 1 < pls.length; i += 2) teams.push([pls[i].id, pls[i + 1].id]);
    return teams;
  };
  let matches = [];
  try {
    if (format === 'suizo') {
      const teams = generatePredictivePairings(data);
      matches = generatePredictiveMatches(data, teams).map(m => ({ ...m, id: `ctl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }));
    } else if (format === 'knockout') {
      const ko = generateKnockout(data);
      matches = (ko.matches || []).map(m => ({ ...m, id: `ctl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }));
    } else if (format === 'mexicano') {
      const teams = generateMexicanoPairings(data);
      for (let i = 0; i + 1 < teams.length; i += 2) matches.push(mk(teams[i], teams[i + 1], 1));
    } else {
      const teams = pairTeams();
      for (let i = 0; i + 1 < teams.length; i += 2) matches.push(mk(teams[i], teams[i + 1], 1));
      if (pls.length >= 6) {
        const rev = pairTeams().reverse();
        for (let i = 0; i + 1 < rev.length; i += 2) matches.push(mk(rev[i], rev[i + 1], 2));
      }
    }
  } catch (e) {
    console.error('regenerateBracket', e);
  }
  buildTournament({ ...data, matches });
  return matches.length;
}

/**
 * Resetea a un torneo demo jugable (equivalente a "probar demo").
 */
export function loadDemoTournament() {
  resetState();
  return getState();
}

/**
 * Estructura de tareas pre-programadas. Cada item:
 *  - phase: índice de fase
 *  - auto: true si el sistema la ejecuta sola (estado se detecta del store)
 *  - done(state): función que devuelve true si la tarea está completada
 *  - action: { label, kind } kind puede ser 'navigate'|'build'|'demo'|'none'
 *  - href: ruta destino si action es navigate
 */
export const TASK_PHASES = [
  { id: 1, icon: '📋', key: 'prep' },
  { id: 2, icon: '🎯', key: 'signups' },
  { id: 3, icon: '🧮', key: 'draw' },
  { id: 4, icon: '🏟️', key: 'day' },
  { id: 5, icon: '🏅', key: 'results' },
  { id: 6, icon: '📣', key: 'close' },
];

export function buildTaskList() {
  return [
    // 1 · Preparación
    { phase: 1, auto: true, key: 't-name', title: 'Nombre y formato del torneo definidos', done: () => !!(state().tournament && state().tournament.name), action: { kind: 'navigate', href: '/torneo', label: 'Configurar' } },
    { phase: 1, auto: true, key: 't-club', title: 'Sede y club asignados', done: () => !!(state().tournament && state().tournament.club), action: { kind: 'navigate', href: '/torneo', label: 'Configurar' } },
    { phase: 1, auto: true, key: 't-format', title: 'Formato de competición elegido (Americano/Mexicano/Suizo/Eliminatorio)', done: () => !!(state().tournament && state().tournament.modality), action: { kind: 'navigate', href: '/torneo', label: 'Elegir' } },
    { phase: 1, auto: false, key: 'p-whitelist', title: 'Lista blanca de invitados / comodines', done: () => localStorage.getItem('padelorganizers-wildcards') === '1', action: { kind: 'none', label: 'Manual' } },
    { phase: 1, auto: false, key: 'p-price', title: 'Precio de inscripción y cupo máximo definidos', done: () => localStorage.getItem('padelorganizers-cap') === '1', action: { kind: 'none', label: 'Manual' } },

    // 2 · Inscripciones
    { phase: 2, auto: true, key: 's-players', title: 'Jugadores inscritos (mínimo 4)', done: () => hasPlayers(4), action: { kind: 'navigate', href: '/torneo', label: 'Añadir' } },
    { phase: 2, auto: true, key: 's-nivels', title: 'Nivel / Elo asignado a cada jugador', done: () => (state().players || []).every(p => (p.elo || 0) > 0), action: { kind: 'navigate', href: '/torneo', label: 'Ajustar' } },
    { phase: 2, auto: false, key: 's-groups', title: 'Categorías o grupos por nivel creados', done: () => localStorage.getItem('padelorganizers-groups') === '1', action: { kind: 'none', label: 'Manual' } },
    { phase: 2, auto: false, key: 's-close', title: 'Corte de inscripciones (deadline) comunicado', done: () => localStorage.getItem('padelorganizers-deadline') === '1', action: { kind: 'none', label: 'Manual' } },

    // 3 · Cuadro & pistas
    { phase: 3, auto: true, key: 'd-pairs', title: 'Parejas formadas automáticamente', done: () => hasPairs(), action: { kind: 'build', label: 'Regenerar' } },
    { phase: 3, auto: true, key: 'd-draw', title: 'Cuadro / rondas generadas (motor del sistema)', done: () => hasMatches(), action: { kind: 'build', label: 'Generar cuadro' } },
    { phase: 3, auto: true, key: 'd-courts', title: 'Pistas asignadas (CourtManager)', done: () => (state().courts || []).length >= 2, action: { kind: 'navigate', href: '/dashboard', label: 'Abrir' } },
    { phase: 3, auto: true, key: 'd-livepro', title: 'LiveScore Pro preparado para el directo', done: () => hasMatches(), action: { kind: 'navigate', href: '/livepro', label: 'Abrir' } },
    { phase: 3, auto: false, key: 'd-schedule', title: 'Horarios de partidos publicados', done: () => localStorage.getItem('padelorganizers-sched') === '1', action: { kind: 'none', label: 'Manual' } },

    // 4 · Día de competición
    { phase: 4, auto: true, key: 'c-go', title: 'Primer partido en juego (competición en marcha)', done: () => inProgressMatches(), action: { kind: 'navigate', href: '/dashboard', label: 'CourtManager' } },
    { phase: 4, auto: true, key: 'c-live', title: 'Marcador en vivo para público', done: () => inProgressMatches(), action: { kind: 'navigate', href: '/live', label: 'Live' } },
    { phase: 4, auto: false, key: 'c-no-show', title: 'No-shows gestionados (sustituciones aplicadas)', done: () => localStorage.getItem('padelorganizers-noshow') === '1', action: { kind: 'none', label: 'Manual' } },
    { phase: 4, auto: false, key: 'c-photo', title: 'Fotos / momentos destacados capturados', done: () => localStorage.getItem('padelorganizers-photo') === '1', action: { kind: 'none', label: 'Manual' } },

    // 5 · Resultados & ranking
    { phase: 5, auto: true, key: 'r-finished', title: 'Partidos finalizados registrados', done: () => hasFinishedMatches(), action: { kind: 'navigate', href: '/dashboard', label: 'Cerrar partidos' } },
    { phase: 5, auto: true, key: 'r-rating', title: 'Rating Elo actualizado tras cada partido', done: () => hasFinishedMatches(), action: { kind: 'navigate', href: '/analytics', label: 'Ver' } },
    { phase: 5, auto: true, key: 'r-league', title: 'Resultados publicados en la Ranked League', done: () => hasFinishedMatches(), action: { kind: 'navigate', href: '/league', label: 'Publicar' } },
    { phase: 5, auto: false, key: 'r-podium', title: 'Podio y premios de la jornada definidos', done: () => localStorage.getItem('padelorganizers-podium') === '1', action: { kind: 'none', label: 'Manual' } },

    // 6 · Cierre & publicación
    { phase: 6, auto: true, key: 'x-summary', title: 'Resumen final de la jornada generado', done: () => hasFinishedMatches(), action: { kind: 'navigate', href: '/analytics', label: 'Ver resumen' } },
    { phase: 6, auto: false, key: 'x-email', title: 'Resultados enviados a los jugadores', done: () => localStorage.getItem('padelorganizers-email') === '1', action: { kind: 'none', label: 'Manual' } },
    { phase: 6, auto: false, key: 'x-next', title: 'Fecha del próximo torneo programada', done: () => localStorage.getItem('padelorganizers-next') === '1', action: { kind: 'none', label: 'Manual' } },
    { phase: 6, auto: false, key: 'x-fip', title: 'Datos exportados para ranking FIP', done: () => localStorage.getItem('padelorganizers-fip') === '1', action: { kind: 'none', label: 'Manual' } },
  ];
}

// Ayuda a marcar tareas manuales (persistencia local simple)
const MANUAL_KEY = 'padelorganizers-manual-tasks';
export function readManualTasks() {
  try { return JSON.parse(localStorage.getItem(MANUAL_KEY)) || {}; } catch { return {}; }
}
export function toggleManualTask(key) {
  const cur = readManualTasks();
  const next = { ...cur, [key]: !cur[key] };
  localStorage.setItem(MANUAL_KEY, JSON.stringify(next));
  return next;
}

export function taskStats(list, manual) {
  const total = list.length;
  const done = list.filter(t => t.done() || manual[t.key]).length;
  const autoTotal = list.filter(t => t.auto).length;
  const autoDone = list.filter(t => t.auto && t.done()).length;
  return {
    total,
    done,
    autoTotal,
    autoDone,
    manualTotal: total - autoTotal,
    autoPct: autoTotal ? Math.round((autoDone / autoTotal) * 100) : 0,
    pct: total ? Math.round((done / total) * 100) : 0,
  };
}

export { tournamentName, currentSeason };