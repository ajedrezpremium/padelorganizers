/**
 * schedulerService.js — Scheduling IA de torneos.
 *
 * Convierte partidos generados (por ronda) en un calendario completo:
 * asigna pista + franja horaria a cada partido sin colisiones (una pista
 * solo puede tener un partido a la vez y un jugador no puede jugar dos
 * partidos simultáneos), repartiendo la carga entre pistas.
 *
 * Estrategia greedy por prioridad: los partidos se ordenan (por defecto por
 * nivel de equilibrio, más equilibrados primero) y se colocan en la pista con
 * la hora de inicio disponible más temprana que respete la disponibilidad de
 * sus 4 jugadores.
 */

export const DEFAULT_OPTIONS = {
  startHour: 9,        // 09:00
  endHour: 22,         // 22:00
  matchMinutes: 60,    // duración de cada partido
  gapMinutes: 15,      // margen entre partidos en la misma pista
};

function toMinutes(hour) {
  if (typeof hour === 'string' && hour.includes(':')) {
    const [h, m] = hour.split(':').map(Number);
    return h * 60 + (m || 0);
  }
  return hour * 60;
}

function minutesToLabel(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Asigna pista y horario a una lista de partidos.
 * @param {Array} matches  partidos con playerIds1/playerIds2 (ids de jugadores)
 * @param {Array} courts   [{ id, name }]
 * @param {Object} options startHour, endHour, matchMinutes, gapMinutes
 * @returns {Array} matches con courtId, courtName, startMin, endMin, startLabel, endLabel
 */
export function assignSchedule(matches, courts, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const open = toMinutes(opts.startHour);
  const close = toMinutes(opts.endHour);
  const slot = opts.matchMinutes + opts.gapMinutes;
  const maxSlotPerCourt = Math.floor((close - open) / slot);
  if (maxSlotPerCourt < 1) return [];

  const ordered = [...matches].sort((a, b) => {
    const balA = a.balance ?? 0.5;
    const balB = b.balance ?? 0.5;
    return balB - balA;
  });

  // pista -> next free minute
  const courtNext = courts.map(() => open);
  // playerId -> minute hasta el que está ocupado
  const playerNext = new Map();

  const scheduled = ordered.map((m) => {
    const ids = [...(m.playerIds1 || []), ...(m.playerIds2 || [])];
    // earlyest minute at which this match could start given the players
    const playerReady = ids.reduce((acc, id) => Math.max(acc, playerNext.get(id) || open), open);
    // find court with earliest free slot that respects window
    let bestCourt = -1;
    let bestStart = Infinity;
    courts.forEach((court, ci) => {
      const start = Math.max(courtNext[ci], playerReady);
      if (start + opts.matchMinutes <= close && start < bestStart) {
        bestStart = start;
        bestCourt = ci;
      }
    });
    if (bestCourt === -1) {
      return { ...m, courtId: null, courtName: null, startMin: null, endMin: null, startLabel: null, endLabel: null, scheduled: false };
    }
    const start = bestStart;
    const end = start + opts.matchMinutes;
    courtNext[bestCourt] = end + opts.gapMinutes;
    ids.forEach((id) => playerNext.set(id, end));

    return {
      ...m,
      courtId: courts[bestCourt].id,
      courtName: courts[bestCourt].name,
      startMin: start,
      endMin: end,
      startLabel: minutesToLabel(start),
      endLabel: minutesToLabel(end),
      scheduled: true,
    };
  });

  return scheduled;
}

/**
 * Construye un "plan" de torneo: todas las rondas (americano/predictivo)
 * generadas y programadas sobre las pistas. Devuelve partidos planificados.
 */
export function planTournament(rounds, courts, options = {}) {
  const allMatches = rounds.flat();
  return assignSchedule(allMatches, courts, options);
}

export function fmtMinLabel(min) {
  return minutesToLabel(min);
}
