import { readFileSync, writeFileSync } from 'node:fs';

// Datos extraídos del docx CUADRO PADEL AIRES 2026
// XIII URBANIZACIÓN AIRES — 2 categorías visibles, 4 grupos
const categorias = [
  {
    id: 'cat-padres-hijos',
    name: 'PADRES/HIJOS',
    groups: [
      {
        id: 'g-ph-3',
        name: 'GRUPO 3',
        pairs: [
          { p1: 'IRENE', p2: 'JOSE ANTONIO' },
          { p1: 'JANDRO', p2: 'PEDRO' },
          { p1: 'ANDRE', p2: 'IAGO' },
          { p1: 'NURIA', p2: 'MARTIN' },
        ]
      }
    ]
  },
  {
    id: 'cat-femenino',
    name: 'FEMENINO',
    groups: [
      {
        id: 'g-f-1',
        name: 'GRUPO 1',
        pairs: [
          { p1: 'BEA', p2: 'IRENA' },
          { p1: 'LORENA', p2: 'MONI' },
          { p1: 'MAYKA', p2: 'BEGOÑA' },
          { p1: 'CRIS', p2: 'MERCEDES' },
        ]
      }
    ]
  }
];

// Cartel
const cartel = '/images/PADEL AIRES 2026.jpeg';

// Crear datos para el store
let players = [];
let pairs = [];
let groups = [];
let pid = 1;
let plid = 1;
for (const cat of categorias) {
  for (const g of cat.groups) {
    const groupMemberIds = [];
    for (const pr of g.pairs) {
      const id1 = `pl-${plid++}`;
      const id2 = `pl-${plid++}`;
      players.push({ id: id1, name: pr.p1, elo: 1500, level: 3.0, pairId: `p-${pid}`, matchesPlayed: 0, wins: 0, losses: 0 });
      players.push({ id: id2, name: pr.p2, elo: 1500, level: 3.0, pairId: `p-${pid}`, matchesPlayed: 0, wins: 0, losses: 0 });
      pairs.push({ id: `p-${pid}`, player1: pr.p1, player2: pr.p2, ranking: pid, points: 0, gamesWon: 0, gamesLost: 0, diff: 0, matchesPlayed: 0, category: cat.name, group: g.name });
      groupMemberIds.push(id1, id2);
      pid++;
    }
    groups.push({ id: g.id, name: `${cat.name} — ${g.name}`, category: cat.name, memberIds: groupMemberIds });
  }
}

const data = {
  tournament: {
    id: 'torneo-aires-2026',
    name: 'XIII TORNEO PADEL AIRES 2026',
    club: 'Urbanización Aires',
    city: 'Vigo',
    modality: 'grupos',
    categories: categorias.map(c=>c.name).join(', '),
    categoryList: categorias,
    totalCourts: 4,
    pointsPerMatch: 24,
    goldPoint: true,
    state: 'OPEN',
    status: 'open',
    cartel,
    lang: 'es',
    createdAt: new Date().toISOString(),
  },
  courts: [
    { id: 1, name: 'Pista 1 — Central', status: 'free', matchId: null, startTime: null },
    { id: 2, name: 'Pista 2', status: 'free', matchId: null, startTime: null },
    { id: 3, name: 'Pista 3', status: 'free', matchId: null, startTime: null },
    { id: 4, name: 'Pista 4', status: 'free', matchId: null, startTime: null },
  ],
  players,
  pairs,
  groups,
  matches: [],
};

writeFileSync('clientes/torneo-aires-2026.json', JSON.stringify(data, null, 2));
console.log('Torneo AIRES 2026 configurado:', players.length, 'jugadores,', pairs.length, 'parejas,', groups.length, 'grupos, categorías:', categorias.map(c=>c.name).join(', '));
console.log('Cartel:', cartel);
console.log('JSON guardado en clientes/torneo-aires-2026.json');
console.log('Para cargar en la app: node clientes/cargar-aires.mjs');
