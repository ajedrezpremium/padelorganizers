/**
 * momentsService.js — "Moments" del partido (puntos destacados).
 * Cada moment guarda quién, contra quién, el resultado y votos (❤️).
 * Persistencia: localStorage por partido (demo), con push opcional a nube.
 */

const LS_PREFIX = 'padelorganizers-moments-';

export function loadMoments(matchId) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + matchId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(matchId, moments) {
  try {
    localStorage.setItem(LS_PREFIX + matchId, JSON.stringify(moments));
  } catch (e) {
    /* ignore */
  }
}

// Añade un momento (por defecto el "punto de la ronda")
export function addMoment({ matchId, title = '🔥 Punto de la ronda', pair1Names, pair2Names, score, combo = 1 }) {
  const moments = loadMoments(matchId);
  moments.push({
    id: `mom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    pair1Names,
    pair2Names,
    score,
    combo,
    votes: 0,
    createdAt: new Date().toISOString(),
  });
  saveLocal(matchId, moments);
  return moments;
}

export function toggleVote(matchId, momentId) {
  const moments = loadMoments(matchId).map(m => (m.id === momentId ? { ...m, votes: m.votes + 1 } : m));
  saveLocal(matchId, moments);
  return moments;
}

// Persiste los moments del torneo en la nube (para que el live público los vea)
export async function persistMomentsToCloud(state, moments) {
  const key = String(state.tournament?.id || 'demo');
  const cloudState = { ...state, liveMoments: moments };
  return pushState(cloudState);
}