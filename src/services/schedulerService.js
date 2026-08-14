/**
 * schedulerService.js — Smart Scheduling Engine (IA) para torneos.
 *
 * Convierte partidos generados (por ronda) en un calendario completo:
 * asigna pista + franja horaria a cada partido sin colisiones (una pista
 * solo puede tener un partido a la vez y un jugador no puede jugar dos
 * partidos simultáneos), repartiendo la carga entre pistas.
 *
 * Optimización (Smart):
 *  - RESPETA LA DISPONIBILIDAD de cada jugador (ventana [from,to] en minutos).
 *  - Prioriza a los jugadores con disponibilidad más rígida (constraint-first):
 *    se acomodan primero los partidos con menor margen horario.
 *  - Ordena por equilibrio de partido (los más ajustados primero) para repartir
 *    el nivel a lo largo del día y entre pistas.
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

// Normaliza la disponibilidad de un jugador a una ventana [from,to] en minutos.
// Acepta: undefined (todo el día), { from, to } ('HH:MM'|número), [min,max].
export function playerWindow(player, fallbackOpen, fallbackClose) {
  if (!player) return { from: fallbackOpen, to: fallbackClose };
  const a = player.availability;
  if (!a) return { from: fallbackOpen, to: fallbackClose };
  const rawFrom = Array.isArray(a) ? a[0] : a.from;
  const rawTo = Array.isArray(a) ? a[1] : a.to;
  return {
    from: rawFrom != null ? toMinutes(rawFrom) : fallbackOpen,
    to: rawTo != null ? toMinutes(rawTo) : fallbackClose,
  };
}

/**
 * Asigna pista y horario a una lista de partidos.
 * @param {Array} matches  partidos con playerIds1/playerIds2 (ids de jugadores)
 * @param {Array} courts   [{ id, name }]
 * @param {Object} options startHour, endHour, matchMinutes, gapMinutes, players[]
 *   players: [{ id, availability: {from,to} | [min,max] }] — ventana en la que
 *   cada jugador puede jugar; por defecto todo el día dentro de [startHour,endHour].
 * @returns {Array} matches con courtId, courtName, startMin, endMin,
 *                  startLabel, endLabel, scheduled, and reason if not scheduled.
 */
export function assignSchedule(matches, courts, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const open = toMinutes(opts.startHour);
  const close = toMinutes(opts.endHour);
  const slot = opts.matchMinutes + opts.gapMinutes;
  const maxSlotPerCourt = Math.floor((close - open) / slot);
  if (maxSlotPerCourt < 1) return [];

  const playersById = new Map((opts.players || []).map(p => [p.id, p]));

  // Constraint-first: un partido es más rígido cuanto menor es la ventana
  // compartida de sus 4 jugadores. Los más rígidos se programan primero.
  const withWindow = matches.map(m => {
    const ids = [...(m.playerIds1 || []), ...(m.playerIds2 || [])];
    let from = open, to = close;
    ids.forEach(id => {
      const w = playerWindow(playersById.get(id), open, close);
      from = Math.max(from, w.from);
      to = Math.min(to, w.to);
    });
    return { m, ids, from, to };
  });

  const ordered = withWindow.sort((a, b) => {
    // 1) primero los de ventana más rígida (menor margen)
    const marginA = a.to - a.from;
    const marginB = b.to - b.from;
    if (marginA !== marginB) return marginA - marginB;
    // 2) luego los más equilibrados
    const balA = a.m.balance ?? 0.5;
    const balB = b.m.balance ?? 0.5;
    return balB - balA;
  });

  const courtNext = courts.map(() => open);
  const playerNext = new Map();

  const scheduled = ordered.map(({ m, ids, from, to }) => {
    const windowOk = to - from >= opts.matchMinutes;
    const playerReady = ids.reduce((acc, id) => Math.max(acc, playerNext.get(id) || open), open);

    let bestCourt = -1;
    let bestStart = Infinity;
    courts.forEach((court, ci) => {
      const start = Math.max(courtNext[ci], playerReady, from);
      if (start + opts.matchMinutes <= Math.min(to, close) && start < bestStart) {
        bestStart = start;
        bestCourt = ci;
      }
    });

    if (!windowOk || bestCourt === -1) {
      return {
        ...m,
        courtId: null, courtName: null,
        startMin: null, endMin: null, startLabel: null, endLabel: null,
        scheduled: false,
        reason: !windowOk ? 'availability' : 'overlap',
      };
    }

    const start = bestStart;
    const end = start + opts.matchMinutes;
    courtNext[bestCourt] = end + opts.gapMinutes;
    ids.forEach((id) => playerNext.set(id, end));

    return {
      ...m,
      courtId: courts[bestCourt].id,
      courtName: courts[bestCourt].name,
      startMin: start, endMin: end,
      startLabel: minutesToLabel(start), endLabel: minutesToLabel(end),
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
