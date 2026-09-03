/**
 * tournamentTasks.js — Central de Control del Torneo (60 tareas programadas).
 * Mapeo 1:1 con padeleventspro.md: F1 Planificación (10) + F2 Inscripciones (10)
 * + F3 Cuadrantes (10) + F4 Día D (10) + F5 Clausura (10) + F6 Cierre & Memoria (10).
 * Cada tarea tiene estado detectado desde el store real (auto) o toggle manual.
 */

import { getState, resetState, buildTournament } from './store';
import { generatePredictivePairings, generatePredictiveMatches, generateKnockout, generateMexicanoPairings, scheduleWithRest, generateGroups, generateCuadroB, generateCuadroC } from './padelEngine';
import { currentSeason } from './leagueService';

function state() { return getState() || {}; }
function hasPlayers(n = 4) { return (state().players || []).length >= n; }
function hasPairs() { return (state().pairs || []).length >= 2; }
function hasMatches() { return (state().matches || []).length >= 1; }
function hasFinishedMatches() { return (state().matches || []).some(m => m.status === 'finished' || m.status === 'done'); }
function inProgressMatches() { return (state().matches || []).some(m => m.status === 'in_progress' || (m.live && m.live.sets)); }
function tournamentName() { const t = state().tournament || {}; return t.name || 'Mi Torneo'; }
function hasTField(k) { const t = state().tournament || {}; return !!(t[k] && String(t[k]).trim()); }
function checkManual(key) { try { return localStorage.getItem(`padelorganizers-${key}`) === '1'; } catch { return false; } }

export function regenerateBracket() {
  const data = state();
  const format = (data.tournament || {}).modality || 'americano';
  const pls = data.players || [];
  const mk = (idsA, idsB, round) => ({
    id: `ctl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    round: round || 1, courtId: null, pair1Id: null, pair2Id: null,
    pair1Names: idsA.map(id => (pls.find(p => p.id === id) || {}).name || '').map(n => (n || '').split(' ')[0]).join(' / '),
    pair2Names: idsB.map(id => (pls.find(p => p.id === id) || {}).name || '').map(n => (n || '').split(' ')[0]).join(' / '),
    playerIds1: idsA, playerIds2: idsB, scoreSet1: '0-0', scoreSet2: '0-0', currentSet: 1, goldPointOccurrences: 0, status: 'scheduled',
  });
  const pairTeams = () => { const teams = []; for (let i = 0; i + 1 < pls.length; i += 2) teams.push([pls[i].id, pls[i + 1].id]); return teams; };
  let matches = [];
  try {
    if (format === 'suizo') { const teams = generatePredictivePairings(data); matches = generatePredictiveMatches(data, teams).map(m => ({ ...m, id: `ctl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })); }
    else if (format === 'knockout') { const ko = generateKnockout(data); matches = (ko.matches || []).map(m => ({ ...m, id: `ctl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })); }
    else if (format === 'mexicano') { const teams = generateMexicanoPairings(data); for (let i = 0; i + 1 < teams.length; i += 2) matches.push(mk(teams[i], teams[i + 1], 1)); }
    else { const teams = pairTeams(); for (let i = 0; i + 1 < teams.length; i += 2) matches.push(mk(teams[i], teams[i + 1], 1)); if (pls.length >= 6) { const rev = pairTeams().reverse(); for (let i = 0; i + 1 < rev.length; i += 2) matches.push(mk(rev[i], rev[i + 1], 2)); } }
  } catch (e) { console.error('regenerateBracket', e); }
  buildTournament({ ...data, matches });
  return matches.length;
}

export function clearBracket() {
  const data = state();
  buildTournament({ ...data, matches: [], pairs: data.pairs || [], schedule: [] });
  return 0;
}
export function generateSchedule() {
  const data = state();
  if (!data.matches?.length || !data.courts?.length) return 0;
  const slot = parseInt(String(data.tournament?.slot || '75').replace(/\D/g,''),10) || 75;
  const sched = scheduleWithRest(data.matches, data.courts, 9, slot, 30);
  buildTournament({ ...data, schedule: sched, tournament: { ...data.tournament, state: 'SCHEDULED', status: 'scheduled', auditLog: [...(data.tournament.auditLog||[]), { at: new Date().toISOString(), action: 'schedule', count: sched.length }] } });
  return sched.length;
}
export function generateGroupsForControl() {
  const data = state();
  if (!data.players?.length) return 0;
  const groups = generateGroups(data, 4);
  buildTournament({ ...data, groups, tournament: { ...data.tournament, auditLog: [...(data.tournament.auditLog||[]), { at: new Date().toISOString(), action: 'groups', count: groups.length }] } });
  return groups.length;
}
export function generateCuadroBForControl() {
  const data = state();
  const b = generateCuadroB(data);
  if (!b.length) return 0;
  buildTournament({ ...data, matches: [...data.matches, ...b], tournament: { ...data.tournament, auditLog: [...(data.tournament.auditLog||[]), { at: new Date().toISOString(), action: 'cuadroB', count: b.length }] } });
  return b.length;
}
export function generateCuadroCForControl() {
  const data = state();
  const bMatches = data.matches.filter(m=>m.bracket==='B');
  const c = generateCuadroC(data, bMatches.length? bMatches : null);
  if (!c.length) return 0;
  buildTournament({ ...data, matches: [...data.matches, ...c], tournament: { ...data.tournament, auditLog: [...(data.tournament.auditLog||[]), { at: new Date().toISOString(), action: 'cuadroC', count: c.length }] } });
  return c.length;
}
export function recordWO(matchId, reason='W.O.') {
  const data = state();
  const upd = data.matches.map(m=> m.id===matchId ? { ...m, status: 'wo', woReason: reason, audit: [...(m.audit||[]), { at: new Date().toISOString(), by: 'árbitro', change: reason }] } : m);
  buildTournament({ ...data, matches: upd, tournament: { ...data.tournament, auditLog: [...(data.tournament.auditLog||[]), { at: new Date().toISOString(), action: 'wo', matchId, reason }] } });
  return upd.length;
}
export function loadDemoTournament() { resetState(); return getState(); }

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
    // ── Fase 1 · Planificación y definición (10) ──
    { phase: 1, auto: true, key: 't-name', title: 'Nombre y formato del torneo definidos', done: () => hasTField('name'), action: { kind: 'navigate', href: '/torneo/crear', label: 'Configurar' } },
    { phase: 1, auto: true, key: 't-club', title: 'Sede y club asignados', done: () => hasTField('club'), action: { kind: 'navigate', href: '/torneo/crear', label: 'Configurar' } },
    { phase: 1, auto: true, key: 't-city', title: 'Ciudad y fecha definidas', done: () => hasTField('city') || hasTField('date'), action: { kind: 'navigate', href: '/torneo/crear', label: 'Configurar' } },
    { phase: 1, auto: true, key: 't-format', title: 'Formato elegido (Americano/Mexicano/Suizo/Eliminatorio)', done: () => hasTField('modality'), action: { kind: 'navigate', href: '/torneo/crear', label: 'Elegir' } },
    { phase: 1, auto: true, key: 't-courts', title: 'Nº de pistas y puntos por partido configurados', done: () => (state().courts || []).length >= 2, action: { kind: 'navigate', href: '/torneo/crear', label: 'Configurar' } },
    { phase: 1, auto: true, key: 't-categories', title: 'Categorías por nivel/género/modalidad', done: () => hasTField('categories'), action: { kind: 'navigate', href: '/torneo/crear', label: 'Definir' } },
    { phase: 1, auto: true, key: 't-gold', title: 'Reglamento: punto de oro / muerte súbita definido', done: () => typeof (state().tournament || {}).goldPoint === 'boolean', action: { kind: 'navigate', href: '/torneo/crear', label: 'Reglas' } },
    { phase: 1, auto: false, key: 't-budget', title: 'Presupuesto y reserva de pistas cerrados', done: () => hasTField('budget') || checkManual('t-budget'), action: { kind: 'none', label: 'Manual' } },
    { phase: 1, auto: false, key: 'p-whitelist', title: 'Lista blanca / comodines (2-3 suplentes)', done: () => checkManual('p-whitelist'), action: { kind: 'none', label: 'Manual' } },
    { phase: 1, auto: false, key: 'p-price', title: 'Precio inscripción y cupo máximo definidos', done: () => hasTField('price') || checkManual('p-price'), action: { kind: 'none', label: 'Manual' } },

    // ── Fase 2 · Inscripciones y difusión (10) ──
    { phase: 2, auto: true, key: 's-players', title: 'Jugadores inscritos (mínimo 4)', done: () => hasPlayers(4), action: { kind: 'navigate', href: '/importar', label: 'Añadir' } },
    { phase: 2, auto: true, key: 's-nivels', title: 'Nivel / Elo asignado a cada jugador', done: () => (state().players || []).length >= 4 && (state().players || []).every(p => (p.elo || 0) > 0), action: { kind: 'navigate', href: '/importar', label: 'Ajustar' } },
    { phase: 2, auto: true, key: 's-groups', title: 'Grupos Round Robin generados (4×4)', done: () => (state().groups||[]).length>0, action: { kind: 'groups', label: 'Generar grupos' } },
    { phase: 2, auto: false, key: 's-pay', title: 'Pago previo verificado (Stripe/PayPal)', done: () => checkManual('s-pay'), action: { kind: 'none', label: 'Manual' } },
    { phase: 2, auto: false, key: 's-flyer', title: 'Flyer digital generado y difundido', done: () => checkManual('s-flyer'), action: { kind: 'none', label: 'Manual' } },
    { phase: 2, auto: false, key: 's-social', title: 'Difusión en redes / WhatsApp / recepción', done: () => checkManual('s-social'), action: { kind: 'none', label: 'Manual' } },
    { phase: 2, auto: false, key: 's-group', title: 'Grupo de difusión creado (WhatsApp/Telegram)', done: () => hasTField('group') || checkManual('s-group'), action: { kind: 'none', label: 'Manual' } },
    { phase: 2, auto: false, key: 's-waitlist', title: 'Lista de espera configurada (si cupo completo)', done: () => checkManual('s-waitlist'), action: { kind: 'none', label: 'Manual' } },
    { phase: 2, auto: false, key: 's-sponsors', title: 'Patrocinadores dados de alta', done: () => checkManual('s-sponsors'), action: { kind: 'none', label: 'Manual' } },
    { phase: 2, auto: false, key: 's-close', title: 'Corte de inscripciones comunicado (deadline)', done: () => checkManual('s-close'), action: { kind: 'none', label: 'Manual' } },

    // ── Fase 3 · Cuadrantes y logística final (10) ──
    { phase: 3, auto: true, key: 'd-pairs', title: 'Parejas formadas automáticamente', done: () => hasPairs(), action: { kind: 'build', label: 'Regenerar' } },
    { phase: 3, auto: true, key: 'd-draw', title: 'Cuadro / rondas generadas (motor)', done: () => hasMatches(), action: { kind: 'build', label: 'Generar cuadro' } },
    { phase: 3, auto: true, key: 'd-seeds', title: 'Cabezas de serie asignadas (evitar cruces tempranos)', done: () => hasTField('seed') || checkManual('d-seeds'), action: { kind: 'none', label: 'Manual' } },
    { phase: 3, auto: true, key: 'd-courts', title: 'Pistas asignadas (CourtManager)', done: () => (state().courts || []).length >= 2, action: { kind: 'navigate', href: '/dashboard', label: 'Abrir' } },
    { phase: 3, auto: true, key: 'd-livepro', title: 'LiveScore Pro preparado', done: () => hasMatches(), action: { kind: 'navigate', href: '/livepro', label: 'Abrir' } },
    { phase: 3, auto: true, key: 'd-schedule', title: 'Horarios con descanso (anti 10:30→10:35) generados', done: () => (state().schedule||[]).length >0, action: { kind: 'schedule', label: 'Generar horarios' } },
    { phase: 3, auto: false, key: 'd-shopping', title: 'Compras: pelotas, trofeos, agua, fruta, botiquín', done: () => checkManual('d-shopping'), action: { kind: 'none', label: 'Manual' } },
    { phase: 3, auto: false, key: 'd-notify', title: 'Notificaciones enviadas (horarios + pistas)', done: () => checkManual('d-notify'), action: { kind: 'none', label: 'Manual' } },
    { phase: 3, auto: false, key: 'd-referee', title: 'Árbitros asignados (si aplica)', done: () => checkManual('d-referee'), action: { kind: 'none', label: 'Manual' } },
    { phase: 3, auto: false, key: 'd-pdf', title: 'Cuadros impresos (PDF para el club)', done: () => checkManual('d-pdf'), action: { kind: 'none', label: 'Manual' } },

    // ── Fase 4 · El día del torneo (10) ──
    { phase: 4, auto: false, key: 'c-checkin', title: 'Check-in 30 min antes (welcome pack)', done: () => checkManual('c-checkin'), action: { kind: 'none', label: 'Manual' } },
    { phase: 4, auto: false, key: 'c-welcome', title: 'Welcome pack y briefing de pista entregados', done: () => checkManual('c-welcome'), action: { kind: 'none', label: 'Manual' } },
    { phase: 4, auto: true, key: 'c-go', title: 'Primer partido en juego (competición en marcha)', done: () => inProgressMatches(), action: { kind: 'navigate', href: '/dashboard', label: 'CourtManager' } },
    { phase: 4, auto: true, key: 'c-live', title: 'Marcador en vivo para público', done: () => inProgressMatches(), action: { kind: 'navigate', href: '/live', label: 'Live' } },
    { phase: 4, auto: false, key: 'c-board', title: 'Pizarra / app tiempo real con orden de juego', done: () => checkManual('c-board'), action: { kind: 'none', label: 'Manual' } },
    { phase: 4, auto: false, key: 'c-conflict', title: 'Conflictos / autoárbitraje resueltos', done: () => checkManual('c-conflict'), action: { kind: 'none', label: 'Manual' } },
    { phase: 4, auto: false, key: 'c-photo', title: 'Fotos / momentos destacados capturados', done: () => checkManual('c-photo'), action: { kind: 'none', label: 'Manual' } },
    { phase: 4, auto: false, key: 'c-music', title: 'Música, vídeos e hidratación', done: () => checkManual('c-music'), action: { kind: 'none', label: 'Manual' } },
    { phase: 4, auto: false, key: 'c-control', title: 'Mesa de control operativa (tiempos)', done: () => checkManual('c-control'), action: { kind: 'none', label: 'Manual' } },
    { phase: 4, auto: false, key: 'c-no-show', title: 'No-shows gestionados (sustituciones)', done: () => checkManual('c-no-show'), action: { kind: 'none', label: 'Manual' } },

    // ── Fase 5 · Clausura y post-torneo (10) ──
    { phase: 5, auto: true, key: 'r-finished', title: 'Partidos finalizados registrados', done: () => hasFinishedMatches(), action: { kind: 'navigate', href: '/dashboard', label: 'Cerrar partidos' } },
    { phase: 5, auto: true, key: 'r-rating', title: 'Rating Elo actualizado tras cada partido', done: () => hasFinishedMatches(), action: { kind: 'navigate', href: '/analytics', label: 'Ver' } },
    { phase: 5, auto: true, key: 'r-league', title: 'Resultados publicados en la Ranked League', done: () => hasFinishedMatches(), action: { kind: 'navigate', href: '/league', label: 'Publicar' } },
    { phase: 5, auto: true, key: 'r-cuadroB', title: 'Cuadro B (consolación) generado', done: () => (state().matches||[]).some(m=>m.bracket==='B'), action: { kind: 'cuadroB', label: 'Generar B' } },
    { phase: 5, auto: true, key: 'r-cuadroC', title: 'Cuadro C (tercer cuadro) generado', done: () => (state().matches||[]).some(m=>m.bracket==='C'), action: { kind: 'cuadroC', label: 'Generar C' } },
    { phase: 5, auto: false, key: 'r-central', title: 'Finales en pista central disputadas', done: () => checkManual('r-central'), action: { kind: 'none', label: 'Manual' } },
    { phase: 5, auto: false, key: 'r-podium', title: 'Podio y premios / sorteos entregados', done: () => checkManual('r-podium'), action: { kind: 'none', label: 'Manual' } },
    { phase: 5, auto: false, key: 'r-gallery', title: 'Fotos, resultados y agradecimientos publicados', done: () => checkManual('r-gallery'), action: { kind: 'none', label: 'Manual' } },
    { phase: 5, auto: false, key: 'r-thanks', title: 'Agradecimiento a jugadores y patrocinadores', done: () => checkManual('r-thanks'), action: { kind: 'none', label: 'Manual' } },
    { phase: 5, auto: false, key: 'r-survey', title: 'Encuesta rápida enviada', done: () => checkManual('r-survey'), action: { kind: 'none', label: 'Manual' } },
    { phase: 5, auto: false, key: 'r-financial', title: 'Informe financiero (ingresos/gastos)', done: () => checkManual('r-financial'), action: { kind: 'none', label: 'Manual' } },
    { phase: 5, auto: false, key: 'r-export', title: 'Datos exportados (CSV jugadores/resultados)', done: () => checkManual('r-export'), action: { kind: 'none', label: 'Manual' } },

    // ── Fase 6 · Cierre & memoria (10) ──
    { phase: 6, auto: true, key: 'x-summary', title: 'Resumen final de la jornada generado', done: () => hasFinishedMatches(), action: { kind: 'navigate', href: '/analytics', label: 'Ver resumen' } },
    { phase: 6, auto: false, key: 'x-cleanup', title: 'Pago a proveedores, limpieza y cierre logístico', done: () => checkManual('x-cleanup'), action: { kind: 'none', label: 'Manual' } },
    { phase: 6, auto: false, key: 'x-email', title: 'Resultados enviados a los jugadores', done: () => checkManual('x-email'), action: { kind: 'none', label: 'Manual' } },
    { phase: 6, auto: false, key: 'x-photo', title: 'Galería final publicada', done: () => checkManual('x-photo'), action: { kind: 'none', label: 'Manual' } },
    { phase: 6, auto: false, key: 'x-social', title: 'Post en redes con fotos y resultados', done: () => checkManual('x-social'), action: { kind: 'none', label: 'Manual' } },
    { phase: 6, auto: false, key: 'x-next', title: 'Fecha del próximo torneo programada', done: () => checkManual('x-next'), action: { kind: 'none', label: 'Manual' } },
    { phase: 6, auto: false, key: 'x-fip', title: 'Datos exportados para ranking FIP', done: () => checkManual('x-fip'), action: { kind: 'none', label: 'Manual' } },
    { phase: 6, auto: false, key: 'x-retro', title: 'Retrospectiva: lecciones aprendidas', done: () => checkManual('x-retro'), action: { kind: 'none', label: 'Manual' } },
    { phase: 6, auto: false, key: 'x-report', title: 'Memoria final del torneo redactada', done: () => checkManual('x-report'), action: { kind: 'none', label: 'Manual' } },
    { phase: 6, auto: false, key: 'x-sign', title: 'Firma de la siguiente edición (roadmap v2)', done: () => checkManual('x-sign'), action: { kind: 'none', label: 'Manual' } },
  ];
}

const MANUAL_KEY = 'padelorganizers-manual-tasks';
export function readManualTasks() { try { return JSON.parse(localStorage.getItem(MANUAL_KEY)) || {}; } catch { return {}; } }
export function toggleManualTask(key) {
  const cur = readManualTasks();
  const next = { ...cur, [key]: !cur[key] };
  localStorage.setItem(MANUAL_KEY, JSON.stringify(next));
  // also set legacy key for Fase 1 quick checks
  try { if (next[key]) localStorage.setItem(`padelorganizers-${key}`, '1'); else localStorage.removeItem(`padelorganizers-${key}`); } catch {}
  return next;
}
export function taskStats(list, manual) {
  const total = list.length;
  const done = list.filter(t => t.done() || manual[t.key]).length;
  const autoTotal = list.filter(t => t.auto).length;
  const autoDone = list.filter(t => t.auto && t.done()).length;
  return { total, done, autoTotal, autoDone, manualTotal: total - autoTotal, autoPct: autoTotal ? Math.round((autoDone / autoTotal) * 100) : 0, pct: total ? Math.round((done / total) * 100) : 0 };
}
export { tournamentName, currentSeason };
