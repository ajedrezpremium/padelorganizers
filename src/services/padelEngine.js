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
        status: 'in_progress'
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
        status: 'in_progress'
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
