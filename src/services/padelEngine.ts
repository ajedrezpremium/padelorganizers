/**
 * padelEngine.js — Motor de Torneos PADELORGANIZERS.COM
 * Formatos: Americano, Mexicano, Suizo por parejas, Cuadro Eliminatorio Directo
 */

export const COURT_STATUS = {
  FREE: 'free',
  IN_GAME: 'in_game',
  FINISHED: 'finished',
  MAINTENANCE: 'maintenance'
};

export function getInitialDemoTournamentData() {
  return {
    tournament: {
      id: 'open-padel-vigo-2026',
      name: 'I Open Pádel Pro Vigo 2026',
      club: 'Club Pádel Bouzas',
      modality: 'americano',
      totalCourts: 4,
      pointsPerMatch: 24,
      goldPoint: true,
      status: 'active'
    },
    courts: [
      { id: 1, name: 'Pista 1 — Central Panorámica', status: COURT_STATUS.IN_GAME, matchId: 'm-1', startTime: Date.now() - 12 * 60000 },
      { id: 2, name: 'Pista 2 — Premium Césped Azul', status: COURT_STATUS.IN_GAME, matchId: 'm-2', startTime: Date.now() - 6 * 60000 },
      { id: 3, name: 'Pista 3 — Cubierta 1', status: COURT_STATUS.FREE, matchId: null, startTime: null },
      { id: 4, name: 'Pista 4 — Cubierta 2', status: COURT_STATUS.FREE, matchId: null, startTime: null }
    ],
    pairs: [
      { id: 'p1', player1: 'Ale Galán', player2: 'Juan Lebrón', ranking: 1, points: 72, gamesWon: 42, gamesLost: 18, diff: 24, matchesPlayed: 3 },
      { id: 'p2', player1: 'Agustín Tapia', player2: 'Arturo Coello', ranking: 2, points: 68, gamesWon: 40, gamesLost: 20, diff: 20, matchesPlayed: 3 },
      { id: 'p3', player1: 'Paquito Navarro', player2: 'Sanyo Gutiérrez', ranking: 3, points: 56, gamesWon: 34, gamesLost: 26, diff: 8, matchesPlayed: 3 },
      { id: 'p4', player1: 'Franco Stupaczuk', player2: 'Martin Di Nenno', ranking: 4, points: 54, gamesWon: 33, gamesLost: 27, diff: 6, matchesPlayed: 3 },
      { id: 'p5', player1: 'Fernando Belasteguín', player2: 'Luciano Capra', ranking: 5, points: 48, gamesWon: 30, gamesLost: 30, diff: 0, matchesPlayed: 3 },
      { id: 'p6', player1: 'Coki Nieto', player2: 'Jon Sanz', ranking: 6, points: 42, gamesWon: 27, gamesLost: 33, diff: -6, matchesPlayed: 3 },
      { id: 'p7', player1: 'Javi Garrido', player2: 'Mike Yanguas', ranking: 7, points: 38, gamesWon: 24, gamesLost: 36, diff: -12, matchesPlayed: 3 },
      { id: 'p8', player1: 'Alex Ruiz', player2: 'Juan Tello', ranking: 8, points: 30, gamesWon: 20, gamesLost: 40, diff: -20, matchesPlayed: 3 }
    ],
    players: [
      {
        id: 'pl-1',
        name: 'Ale Galán',
        elo: 1760,
        level: 3.8,
        pairId: 'p1',
        matchesPlayed: 3,
        wins: 2,
        losses: 1,
        photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Alejandro_Gal%C3%A1n_-_240422_192225_%28cropped%29.jpg/330px-25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Alejandro_Gal%C3%A1n_-_240422_192225_%28cropped%29.jpg'
      },
      {
        id: 'pl-2',
        name: 'Juan Lebrón',
        elo: 1740,
        level: 3.7,
        pairId: 'p1',
        matchesPlayed: 3,
        wins: 2,
        losses: 1,
        photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Vigo_Open_2019_de_World_Padel_Tour_-_34.jpg/330px-Vigo_Open_2019_de_World_Padel_Tour_-_34.jpg'
      },
      {
        id: 'pl-3',
        name: 'Agustín Tapia',
        elo: 1780,
        level: 3.9,
        pairId: 'p2',
        matchesPlayed: 3,
        wins: 2,
        losses: 1,
        photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Augustin_Tapia_%28cropped%29.jpg/330px-Augustin_Tapia_%28cropped%29.jpg'
      },
      {
        id: 'pl-4',
        name: 'Arturo Coello',
        elo: 1755,
        level: 3.78,
        pairId: 'p2',
        matchesPlayed: 3,
        wins: 2,
        losses: 1,
        photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Arturo_Coello_%28cropped%29.jpg/330px-Arturo_Coello_%28cropped%29.jpg'
      },
      {
        id: 'pl-5',
        name: 'Paquito Navarro',
        elo: 1680,
        level: 3.4,
        pairId: 'p3',
        matchesPlayed: 3,
        wins: 1,
        losses: 2,
        photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Vigo_Open_2019_de_World_Padel_Tour_-_34.jpg/330px-Vigo_Open_2019_de_World_Padel_Tour_-_34.jpg'
      },
      {
        id: 'pl-6',
        name: 'Sanyo Gutiérrez',
        elo: 1660,
        level: 3.3,
        pairId: 'p3',
        matchesPlayed: 3,
        wins: 1,
        losses: 2,
        photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Santo_Guti%C3%A9rrez_and_Pato_Paradiso%2C_World_Padel_Championship_Dubai_2022.jpg/330px-Santo_Guti%C3%A9rrez_and_Pato_Paradiso%2C_World_Padel_Championship_Dubai_2022.jpg'
      },
      {
        id: 'pl-7',
        name: 'Franco Stupaczuk',
        elo: 1640,
        level: 3.2,
        pairId: 'p4',
        matchesPlayed: 3,
        wins: 1,
        losses: 2,
        photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Vigo_Open_2019_de_World_Padel_Tour_-_38.jpg/330px-Vigo_Open_2019_de_World_Padel_Tour_-_38.jpg'
      },
      {
        id: 'pl-8',
        name: 'Martín Di Nenno',
        elo: 1630,
        level: 3.15,
        pairId: 'p4',
        matchesPlayed: 3,
        wins: 1,
        losses: 2,
        photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Mart%C3%ADn_Di_Nenno.jpg/330px-Mart%C3%ADn_Di_Nenno.jpg'
      },
      {
        id: 'pl-9',
        name: 'Fernando Belasteguín',
        elo: 1600,
        level: 3.0,
        pairId: 'p5',
        matchesPlayed: 3,
        wins: 1,
        losses: 2,
        photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Bela_Campe%C3%B3n_del_Mundo.jpg/330px-Bela_Campe%C3%B3n_del_Mundo.jpg'
      },
      { id: 'pl-10', name: 'Luciano Capra', elo: 1580, level: 2.9, pairId: 'p5', matchesPlayed: 3, wins: 0, losses: 3 },
      { id: 'pl-11', name: 'Coki Nieto', elo: 1540, level: 2.7, pairId: 'p6', matchesPlayed: 3, wins: 0, losses: 3 },
      { id: 'pl-12', name: 'Jon Sanz', elo: 1560, level: 2.8, pairId: 'p6', matchesPlayed: 3, wins: 0, losses: 3 },
      { id: 'pl-13', name: 'Javi Garrido', elo: 1520, level: 2.6, pairId: 'p7', matchesPlayed: 3, wins: 0, losses: 3 },
      { id: 'pl-14', name: 'Mike Yanguas', elo: 1500, level: 2.5, pairId: 'p7', matchesPlayed: 3, wins: 0, losses: 3 },
      { id: 'pl-15', name: 'Alex Ruiz', elo: 1480, level: 2.4, pairId: 'p8', matchesPlayed: 3, wins: 0, losses: 3 },
      { id: 'pl-16', name: 'Juan Tello', elo: 1470, level: 2.35, pairId: 'p8', matchesPlayed: 3, wins: 0, losses: 3 }
    ],
    matches: [
      {
        id: 'm-1',
        round: 4,
        courtId: 1,
        pair1Id: 'p1',
        pair2Id: 'p2',
        pair1Names: 'Galán / Lebrón',
        pair2Names: 'Tapia / Coello',
        scoreSet1: '6-4',
        scoreSet2: '3-4',
        currentSet: 2,
        goldPointOccurrences: 3,
        status: 'in_progress',
        live: { games: [3, 4], pts: [2, 1], sets: [1, 1] }
      },
      {
        id: 'm-2',
        round: 4,
        courtId: 2,
        pair1Id: 'p3',
        pair2Id: 'p4',
        pair1Names: 'Paquito / Sanyo',
        pair2Names: 'Stupa / Di Nenno',
        scoreSet1: '4-6',
        scoreSet2: '2-1',
        currentSet: 2,
        goldPointOccurrences: 1,
        status: 'in_progress',
        live: { games: [2, 3], pts: [0, 0], sets: [1, 1] }
      },
      {
        id: 'm-3',
        round: 4,
        courtId: null,
        pair1Id: 'p5',
        pair2Id: 'p6',
        pair1Names: 'Bela / Capra',
        pair2Names: 'Nieto / Sanz',
        scoreSet1: '0-0',
        scoreSet2: '0-0',
        currentSet: 1,
        goldPointOccurrences: 0,
        status: 'scheduled'
      },
      {
        id: 'm-4',
        round: 4,
        courtId: null,
        pair1Id: 'p7',
        pair2Id: 'p8',
        pair1Names: 'Garrido / Yanguas',
        pair2Names: 'Ruiz / Tello',
        scoreSet1: '0-0',
        scoreSet2: '0-0',
        currentSet: 1,
        goldPointOccurrences: 0,
        status: 'scheduled'
      }
    ]
  };
}

export function finishMatch(data, matchId, p1Games, p2Games) {
  const updatedMatches = data.matches.map(m => {
    if (m.id !== matchId) return m;
    return {
      ...m,
      status: 'completed',
      pair1Games: p1Games,
      pair2Games: p2Games,
      winnerId: p1Games > p2Games ? m.pair1Id : m.pair2Id
    };
  });

  const match = data.matches.find(m => m.id === matchId);
  let updatedCourts = data.courts;
  if (match && match.courtId) {
    updatedCourts = data.courts.map(c =>
      c.id === match.courtId ? { ...c, status: COURT_STATUS.FREE, matchId: null, startTime: null } : c
    );
  }

  const updatedPairs = data.pairs.map(p => {
    if (!match) return p;
    if (p.id === match.pair1Id) {
      const gWon = p.gamesWon + p1Games;
      const gLost = p.gamesLost + p2Games;
      return { ...p, points: p.points + p1Games, gamesWon: gWon, gamesLost: gLost, diff: gWon - gLost, matchesPlayed: p.matchesPlayed + 1 };
    }
    if (p.id === match.pair2Id) {
      const gWon = p.gamesWon + p2Games;
      const gLost = p.gamesLost + p1Games;
      return { ...p, points: p.points + p2Games, gamesWon: gWon, gamesLost: gLost, diff: gWon - gLost, matchesPlayed: p.matchesPlayed + 1 };
    }
    return p;
  }).sort((a, b) => b.points - a.points || b.diff - a.diff).map((p, idx) => ({ ...p, ranking: idx + 1 }));

  return { ...data, matches: updatedMatches, courts: updatedCourts, pairs: updatedPairs };
}

// ============================================================
// MOTOR DE RE-PAREO (Pairing Engine) + Rating Elo
// Formatos: Americano (rotación fija) y Mexicano (re-emparejo dinámico)
// ============================================================

// --- Rating Elo (nivel visible 1.0 a 5.0) ---
const ELO_K = 32;

export function computeElo(playerElo, opponentElo, score = 1) {
  const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  return Math.round(playerElo + ELO_K * (score - expected));
}

export function eloToLevel(elo) {
  const level = 1 + (elo - 1200) / 200;
  return Math.round(Math.max(1, Math.min(5, level)) * 100) / 100;
}

export function levelToElo(level) {
  return Math.round(1200 + (Math.max(1, Math.min(5, level)) - 1) * 200);
}

function getPlayerName(data, id) {
  const p = data.players.find(pl => pl.id === id);
  return p ? p.name : id;
}

function shortName(name) {
  return name.split(' ')[0];
}

// --- Americano: rotación fija (círculo de parejas) ---
// Empareja N jugadores en rondas donde todos se enfrentan/comparten.
export function generateAmericanoRounds(playerIds) {
  const n = playerIds.length;
  if (n < 4 || n % 2 !== 0) return [];
  const fixed = playerIds[0];
  const rotating = playerIds.slice(1);
  const rounds = [];
  const r = rotating.length;
  for (let round = 0; round < r; round++) {
    const order = [fixed, ...rotating];
    const pairs = [];
    for (let i = 0; i < n / 2; i++) {
      pairs.push([order[i], order[n - 1 - i]]);
    }
    rounds.push(pairs);
    rotating.unshift(rotating.pop());
  }
  return rounds;
}

// --- Mexicano: tras cada ronda re-empareja según Elo/ranking ---
// Ordena de mayor a menor nivel y empareja top-vs-top.
export function generateMexicanoPairings(data) {
  const sorted = [...data.players].sort((a, b) => b.elo - a.elo);
  const pairs = [];
  for (let i = 0; i + 1 < sorted.length; i += 2) {
    pairs.push([sorted[i].id, sorted[i + 1].id]);
  }
  return pairs;
}

// Convierte pares de jugadores individuales a partidos de parejas (2v2)
export function pairToMatch(data, pairA, pairB) {
  return {
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    round: 1,
    courtId: null,
    pair1Id: null,
    pair2Id: null,
    pair1Names: `${shortName(getPlayerName(data, pairA[0]))} / ${shortName(getPlayerName(data, pairA[1]))}`,
    pair2Names: `${shortName(getPlayerName(data, pairB[0]))} / ${shortName(getPlayerName(data, pairB[1]))}`,
    playerIds1: pairA,
    playerIds2: pairB,
    scoreSet1: '0-0',
    scoreSet2: '0-0',
    currentSet: 1,
    goldPointOccurrences: 0,
    status: 'scheduled'
  };
}

// Genera partidos a partir de parejas individuales (agrupa en 2v2)
export function generateRoundMatches(data, playerPairs) {
  const matches = [];
  for (let i = 0; i + 1 < playerPairs.length; i += 2) {
    matches.push(pairToMatch(data, playerPairs[i], playerPairs[i + 1]));
  }
  return matches;
}

// Promedio de Elo de una lista de ids de jugadores
function avgElo(data, ids) {
  const players = ids.map(id => getPlayer(data, id)).filter(Boolean);
  if (!players.length) return 1500;
  return Math.round(players.reduce((sum, p) => sum + p.elo, 0) / players.length);
}

function getPlayer(data, id) {
  return data.players.find(pl => pl.id === id);
}

// Aplica el resultado de un partido generado a los jugadores (Elo 1.0–5.0)
// Devuelve nuevo estado con players actualizados.
export function applyResultToPlayers(data, match, p1Games, p2Games) {
  if (!match || !match.playerIds1 || !match.playerIds2) return data;
  const p1Wins = p1Games > p2Games;

  const winners = match.playerIds1;
  const losers = match.playerIds2;
  const winnerAvg = avgElo(data, winners);
  const loserAvg = avgElo(data, losers);

  const newWinnerElo = computeElo(winnerAvg, loserAvg, p1Wins ? 1 : 0);
  const newLoserElo = computeElo(loserAvg, winnerAvg, p1Wins ? 0 : 1);

  const winDelta = newWinnerElo - winnerAvg;
  const loseDelta = newLoserElo - loserAvg;

  const updatedPlayers = data.players.map(p => {
    if (winners.includes(p.id)) {
      const elo = p.elo + winDelta;
      return { ...p, elo, level: eloToLevel(elo), matchesPlayed: p.matchesPlayed + 1, wins: p.wins + (p1Wins ? 1 : 0), losses: p.losses + (p1Wins ? 0 : 1) };
    }
    if (losers.includes(p.id)) {
      const elo = p.elo + loseDelta;
      return { ...p, elo, level: eloToLevel(elo), matchesPlayed: p.matchesPlayed + 1, wins: p.losses + (p1Wins ? 0 : 1) };
    }
    return p;
  });

  return { ...data, players: updatedPlayers };
}

// Resuelve el ranking individual (y su nivel) ordenado por Elo
export function getPlayerRanking(data) {
  return [...data.players]
    .sort((a, b) => b.elo - a.elo)
    .map((p, idx) => ({ ...p, ranking: idx + 1 }));
}

// ============================================================
// MOTOR PREDICTIVO (IA) — probabilidades, balance y re-pareo óptimo
// ============================================================

// Probabilidad de que A gane a B según Elo (función logística, misma base que Elo)
export function winProbability(eloA, eloB) {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

// Elo promedio de una pareja de jugadores
export function avgEloOf(data, ids) {
  const players = (ids || []).map(id => getPlayer(data, id)).filter(Boolean);
  if (!players.length) return 1500;
  return Math.round(players.reduce((s, p) => s + p.elo, 0) / players.length);
}

// Probabilidad de que la pareja A gane el partido a la pareja B
export function predictMatch(data, pairAIds, pairBIds) {
  const a = avgEloOf(data, pairAIds);
  const b = avgEloOf(data, pairBIds);
  const p = winProbability(a, b);
  return {
    pairAElo: a, pairBElo: b,
    pA: Math.round(p * 100) / 100,
    pB: Math.round((1 - p) * 100) / 100,
  };
}

// Balance de un emparejamiento: 1 = perfecto, 0 = total desequilibrio
export function matchBalance(data, pairAIds, pairBIds) {
  const { pA, pB } = predictMatch(data, pairAIds, pairBIds);
  return Math.round((1 - Math.abs(pA - pB)) * 100) / 100;
}

// "Peso" de desemparejar a un jugador en cada ronda: evita repetir rivales/parejas
function buildSeenPenalty(state, data) {
  const seen = {};
  const lastRounds = 4;
  const recent = [...data.matches].filter(m => m.status !== 'scheduled').slice(-lastRounds * 4);
  recent.forEach(m => {
    const ids1 = m.playerIds1 || [];
    const ids2 = m.playerIds2 || [];
    ids1.forEach(a => ids2.forEach(b => {
      seen[`${a}|${b}`] = (seen[`${a}|${b}`] || 0) + 1;
    }));
  });
  return seen;
}

function alreadyPlayed(state, a, b) {
  const key = `${a}|${b}`;
  return (state._seen || {})[key] || 0;
}

/**
 * Re-pareo óptimo con IA: empareja a los jugadores en parejas equilibradas
 * maximizando el balance medio y penalizando repetir rivales.
 * Devuelve parejas de ids: [[a,b],[c,d],...]
 */
export function generatePredictivePairings(data, { target = 4 } = {}) {
  const players = [...data.players].sort((a, b) => b.elo - a.elo);
  const seen = buildSeenPenalty(null, data);
  const n = players.length;
  if (n < 4) return [];

  const useSeen = Object.keys(seen).length > 0;

  // 1) Todos los posibles pares con su desbalance
  const pairScores = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = players[i], b = players[j];
      const balance = 1 - Math.abs(winProbability(a.elo, b.elo) - 0.5) * 2;
      const penalty = useSeen ? (seen[`${a.id}|${b.id}`] || seen[`${b.id}|${a.id}`] || 0) : 0;
      const score = balance * 100 - penalty * 25;
      pairScores.push({ i, j, a, b, score });
    }
  }

  // 2) Greedy ponderado: elige el mejor par disponible, evita que se repitan jugadores
  pairScores.sort((x, y) => y.score - x.score);
  const used = new Set();
  const chosen = [];
  for (const { i, j, a, b } of pairScores) {
    if (used.has(i) || used.has(j)) continue;
    used.add(i);
    used.add(j);
    chosen.push([a.id, b.id]);
    if (chosen.length >= target) break;
  }
  return chosen;
}

// Distribuye las parejas formadas en enfrentamientos 2v2 equilibrados
export function generatePredictiveMatches(data, pairTeams) {
  const teams = pairTeams.map(ids => ({ ids, elo: avgEloOf(data, ids) }));
  const sorted = [...teams].sort((a, b) => b.elo - a.elo);
  const matches = [];
  for (let i = 0; i + 1 < sorted.length; i += 2) {
    const A = sorted[i], B = sorted[i + 1];
    matches.push({
      ...pairToMatch(data, A.ids, B.ids),
      predict: predictMatch(data, A.ids, B.ids),
      balance: matchBalance(data, A.ids, B.ids),
    });
  }
  return matches;
}

// ============================================================
// CUADRO ELIMINATORIO DIRECTO (knockout)
// Ordena por Elo, forma parejas (1º con 2º, 3º con 4º…) y las
// enfrenta por semilla: top vs bottom, minimizando cruces tempranos.
// ============================================================
export function generateKnockout(data) {
  const ids = [...data.players].sort((a, b) => b.elo - a.elo).map(p => p.id);
  const n = Math.floor(ids.length / 2) * 2; // número par de jugadores
  if (n < 4) return { teams: [], matches: [] };

  const teams = [];
  for (let i = 0; i < n; i += 2) teams.push([ids[i], ids[i + 1]]);

  const matches = [];
  const t = teams.length;
  for (let i = 0; i + 1 < t; i += 2) {
    const A = teams[i], B = teams[t - 1 - i];
    matches.push({
      ...pairToMatch(data, A, B),
      round: 1,
      predict: predictMatch(data, A, B),
      balance: matchBalance(data, A, B),
    });
  }
  return { teams, matches };
}

// --- Cuadro B / Consolación (perdedores R1) ---
export function generateCuadroB(data, mainMatches) {
  const losers = (mainMatches || data.matches || []).filter(m => m.status === 'completed' && m.loserIds).map(m => m.loserIds).flat();
  if (losers.length < 2) return [];
  const teams = [];
  for (let i=0;i+1<losers.length;i+=2) teams.push([losers[i], losers[i+1]]);
  return teams.map((t,i)=>({ ...pairToMatch(data, t, teams[(i+1)%teams.length]||t), round: 900+i, bracket: 'B' }));
}
export function generateCuadroC(data, bMatches) {
  const losers = (bMatches || []).filter(m => m.status === 'completed' && m.loserIds).map(m => m.loserIds).flat();
  if (losers.length < 2) {
    const mainLosers = (data.matches||[]).filter(m=>m.status==='completed'&&m.loserIds).map(m=>m.loserIds).flat();
    if (mainLosers.length >= 8) {
      const extra = mainLosers.slice(4);
      const teams=[];
      for(let i=0;i+1<extra.length;i+=2) teams.push([extra[i], extra[i+1]]);
      return teams.map((t,i)=>({ ...pairToMatch(data, t, teams[(i+1)%teams.length]||t), round: 800+i, bracket: 'C' }));
    }
    return [];
  }
  const teams=[];
  for(let i=0;i+1<losers.length;i+=2) teams.push([losers[i], losers[i+1]]);
  return teams.map((t,i)=>({ ...pairToMatch(data, t, teams[(i+1)%teams.length]||t), round: 800+i, bracket: 'C' }));
}

// --- Grupos Round Robin ---
export function generateGroups(data, groupSize=4) {
  const sorted = [...data.players].sort((a,b)=>b.elo-a.elo);
  const n = sorted.length;
  const numGroups = Math.ceil(n/2 / groupSize);
  const groups=[];
  for(let g=0; g<numGroups; g++){
    const members=[];
    for(let i=g; i < n/2; i+=numGroups){
      const idx=i*2;
      if(sorted[idx]) members.push(sorted[idx].id);
      if(sorted[idx+1]) members.push(sorted[idx+1].id);
    }
    if(members.length) groups.push({ id:`g${g+1}`, name:`Grupo ${String.fromCharCode(65+g)}`, memberIds: members.slice(0, groupSize*2) });
  }
  return groups;
}

// --- Scheduler con descanso mínimo (evita 10:30→10:35) ---
export function scheduleWithRest(matches, courts, startHour=9, slotMin=75, restMin=30) {
  const schedule=[];
  const lastPlayed={};
  let current = startHour*60;
  const courtQueue=[...courts];
  for(const m of matches){
    const pIds=[...(m.playerIds1||[]), ...(m.playerIds2||[])];
    const needRest = pIds.some(id=> lastPlayed[id] && current - lastPlayed[id] < restMin);
    if(needRest) current += restMin;
    const court = courtQueue.shift(); courtQueue.push(court);
    const hour = String(Math.floor(current/60)).padStart(2,'0');
    const min = String(current%60).padStart(2,'0');
    schedule.push({ matchId: m.id, courtId: court.id, time: `${hour}:${min}`, slotMin });
    pIds.forEach(id=> lastPlayed[id]=current);
    if(schedule.length % courts.length === 0) current += slotMin;
  }
  return schedule;
}

export function explainSeeding(data) {
  const sorted=[...data.players].sort((a,b)=>b.elo-a.elo);
  if(!sorted.length) return 'Sin jugadores para explicar seeding.';
  const top=sorted.slice(0,4).map(p=>`${p.name} (${p.elo})`).join(', ');
  const fmt=data.tournament?.modality||'americano';
  return `IA: Ordené por ELO (${top}) — cabezas 1-4. Formato ${fmt}: evito cruce 1vs2 hasta final (1vs16, 8vs9 en octavos). Balance medio ${(sorted.length>1? Math.round((1-Math.abs(sorted[0].elo-sorted[1].elo)/400)*100):0)}%. Si cambias nivel, recalcula.`;
}

// --- Points Engine ---
export const POINTS_TABLE = { '1':1000, '2':700, '3-4':500, '5-8':350, '9-16':200, '17-32':100, '33-64':50 };
export function pointsForPosition(pos, table=POINTS_TABLE){
  if(table[String(pos)]) return table[String(pos)];
  for(const k of Object.keys(table)){ if(k.includes('-')){ const [a,b]=k.split('-').map(Number); if(pos>=a && pos<=b) return table[k]; } }
  return 0;
}
export function rankingFromTournament(data){
  const finished=[...data.matches].filter(m=>m.status==='completed').sort((a,b)=>b.round-a.round);
  const seen=new Set();
  const order=[];
  for(const m of finished){
    const w=m.winnerIds||m.playerIds1||[];
    const l=m.loserIds||m.playerIds2||[];
    if(w.length && !seen.has(w.join(','))){ order.push(w); w.forEach(id=>seen.add(id)); }
    if(l.length && !seen.has(l.join(','))){ order.push(l); l.forEach(id=>seen.add(id)); }
  }
  return order.map((ids,idx)=>({ ids, pos: idx+1, points: pointsForPosition(idx+1) }));
}
