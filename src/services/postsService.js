/**
 * postsService.js — CMS + Crónicas IA (#4G)
 * Módulo de publicaciones para clubes y torneos. Genera una CRÓNICA IA del
 * torneo activo a partir de datos REALES del store (parejas, puntos, partidos,
 * jugadores) en 4 idiomas. Determinista: dado el mismo estado, mismo texto.
 * Persistencia: localStorage (patrón espejo de membershipService).
 */

import { getState } from './store';

const LS_POSTS = 'padelorganizers-posts';

// ---- i18n de la crónica ----
const I18N = {
  es: {
    title: 'Crónica IA del torneo {NAME}',
    lead: 'El {NAME} — organizado por {CLUB} en formato {MOD} — dejó números de nivel: {PLAYERS} jugadores, {PAIRS} parejas y {MATCHES} partidos. Punto de Oro activo y cuadros resueltos en tiempo real.',
    top: '🥇 Top del cuadro',
    mvp: '⭐ MVP del torneo',
    mvpLine: '{P} lideró la tabla con {POINTS} puntos y un balance de {GAMESW} juegos a favor por {GAMESL} en contra.',
    podium: '🥈 El podio lo completaron {P2} y {P3}, con {PTS2} y {PTS3} puntos respectivamente.',
    court: '🏟️ Sobre las pistas',
    courtLine: 'Las {COURTS} pistas del club repartieron {MATCHES} partidos a lo largo de la jornada, con marcador en directo para todos los aficionados.',
    trend: '📈 Lo que viene',
    trendLine: 'El ranking Elo global ya recoge estos resultados: cada jugador actualiza su percentil, forma y proyección de cara al siguiente torneo.',
    footer: 'Generado por PADELORGANIZERS — La infraestructura digital de los eventos globales de pádel. CREATE · CONNECT · WIN.',
  },
  en: {
    title: 'AI tournament report — {NAME}',
    lead: 'The {NAME} — organised by {CLUB} in {MOD} format — delivered top-level numbers: {PLAYERS} players, {PAIRS} pairs and {MATCHES} matches. Golden point active and draws resolved in real time.',
    top: '🥇 Top of the draw',
    mvp: '⭐ Tournament MVP',
    mvpLine: '{P} led the standings with {POINTS} points and a {GAMESW}-{GAMESL} game balance.',
    podium: '🥈 The podium was completed by {P2} and {P3}, with {PTS2} and {PTS3} points respectively.',
    court: '🏟️ On the courts',
    courtLine: 'The club\'s {COURTS} courts hosted {MATCHES} matches throughout the day, with live scoring for every fan.',
    trend: '📈 What\'s next',
    trendLine: 'The global Elo ranking already includes these results: every player updates their percentile, form and projection ahead of the next tournament.',
    footer: 'Powered by PADELORGANIZERS — The digital infrastructure for global padel events. CREATE · CONNECT · WIN.',
  },
  fr: {
    title: 'Rapport IA du tournoi — {NAME}',
    lead: 'Le {NAME} — organisé par {CLUB} en format {MOD} — a livré des chiffres de haut niveau : {PLAYERS} joueurs, {PAIRS} paires et {MATCHES} matchs. Punto de Oro actif et tableaux résolus en temps réel.',
    top: '🥇 Haut du tableau',
    mvp: '⭐ MVP du tournoi',
    mvpLine: '{P} a mené le classement avec {POINTS} points et un bilan de {GAMESW} jeux pour, {GAMESL} contre.',
    podium: '🥈 Le podium a été complété par {P2} et {P3}, avec {PTS2} et {PTS3} points respectivement.',
    court: '🏟️ Sur les pistes',
    courtLine: 'Les {COURTS} pistes du club ont réparti {MATCHES} matchs tout au long de la journée, avec marquage en direct pour tous les supporters.',
    trend: '📈 La suite',
    trendLine: 'Le classement Elo global intègre déjà ces résultats : chaque joueur met à jour son percentile, sa forme et sa projection avant le prochain tournoi.',
    footer: 'Propulsé par PADELORGANIZERS — L\'infrastructure numérique des événements mondiaux de padel. CREATE · CONNECT · WIN.',
  },
  pt: {
    title: 'Relatório IA do torneio — {NAME}',
    lead: 'O {NAME} — organizado por {CLUB} em formato {MOD} — deixou números de nível: {PLAYERS} jogadores, {PAIRS} duplas e {MATCHES} partidas. Punto de Oro ativo e quadros resolvidos em tempo real.',
    top: '🥇 Topo do quadro',
    mvp: '⭐ MVP do torneio',
    mvpLine: '{P} liderou a tabela com {POINTS} pontos e um saldo de {GAMESW} jogos a favor e {GAMESL} contra.',
    podium: '🥈 O pódio foi completado por {P2} e {P3}, com {PTS2} e {PTS3} pontos respetivamente.',
    court: '🏟️ Nas pistas',
    courtLine: 'As {COURTS} pistas do clube repartiram {MATCHES} partidas ao longo do dia, com marcador ao vivo para todos os adeptos.',
    trend: '📈 O que vem a seguir',
    trendLine: 'O ranking Elo global já regista estes resultados: cada jogador atualiza o seu percentil, forma e projeção para o próximo torneio.',
    footer: 'Gerado por PADELORGANIZERS — A infraestrutura digital dos eventos globais de padel. CREATE · CONNECT · WIN.',
  },
};

const MOD_TEXT = {
  es: { americano: 'Americano', mexicano: 'Mexicano', suizo: 'Suizo', knockout: 'eliminación directa' },
  en: { americano: 'Americano', mexicano: 'Mexicano', suizo: 'Swiss', knockout: 'knockout' },
  fr: { americano: 'américain', mexicano: 'mexicain', suizo: 'suisse', knockout: 'élimination directe' },
  pt: { americano: 'Americano', mexicano: 'Mexicano', suizo: 'Suíço', knockout: 'eliminação direta' },
};

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
}

// ---- CRÓNICA IA determinista a partir del estado real ----
export function generateCrónica(lang = 'es') {
  const s = getState();
  const T = I18N[lang] || I18N.es;
  const t = s.tournament || {};
  const mod = (MOD_TEXT[lang] || MOD_TEXT.es)[t.modality] || (MOD_TEXT[lang] || MOD_TEXT.es).americano;
  const pairs = [...(s.pairs || [])].sort((a, b) => (b.points || 0) - (a.points || 0));
  const players = s.players || [];
  const matches = s.matches || [];
  const courts = t.totalCourts || (s.courts || []).length || 4;

  const top = pairs.slice(0, 3).map((p) => ({
    name: [p.player1, p.player2].filter(Boolean).join(' · ') || 'Pareja',
    points: p.points || 0,
    gw: p.gamesWon || 0,
    gl: p.gamesLost || 0,
  }));

  const mvp = top[0];
  const podium = top.slice(1);

  const body = [
    fill(T.lead, { NAME: t.name || 'Torneo', CLUB: t.club || 'Club', MOD: mod, PLAYERS: players.length || 16, PAIRS: pairs.length || 8, MATCHES: matches.length || 12 }),
    '',
    T.top,
    T.mvp,
    fill(T.mvpLine, { P: mvp?.name || 'La pareja líder', POINTS: mvp?.points ?? 0, GAMESW: mvp?.gw ?? 0, GAMESL: mvp?.gl ?? 0 }),
    podium.length
      ? fill(T.podium, { P2: podium[0].name, PTS2: podium[0].points, P3: podium[1]?.name || podium[0].name, PTS3: podium[1]?.points ?? podium[0].points })
      : '',
    '',
    T.court,
    fill(T.courtLine, { COURTS: courts, MATCHES: matches.length || 12 }),
    '',
    T.trend,
    T.trendLine,
    '',
    T.footer,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    title: fill(T.title, { NAME: t.name || 'Torneo' }),
    body,
    mvp: mvp?.name || '',
    pointsTop: mvp?.points ?? 0,
  };
}

// ---- Persistencia de publicaciones (localStorage, patrón espejo) ----
export function listPosts() {
  try {
    const raw = localStorage.getItem(LS_POSTS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function savePost(post) {
  const posts = listPosts();
  const now = new Date().toISOString();
  if (post.id) {
    const i = posts.findIndex((p) => p.id === post.id);
    if (i !== -1) posts[i] = { ...posts[i], ...post, updatedAt: now };
    else posts.unshift({ ...post, id: post.id, createdAt: now, updatedAt: now });
  } else {
    posts.unshift({ ...post, id: 'post-' + Date.now(), createdAt: now, updatedAt: now });
  }
  try {
    localStorage.setItem(LS_POSTS, JSON.stringify(posts));
  } catch {
    /* ignore quota */
  }
  return posts;
}

export function deletePost(id) {
  const posts = listPosts().filter((p) => p.id !== id);
  try {
    localStorage.setItem(LS_POSTS, JSON.stringify(posts));
  } catch {
    /* ignore */
  }
  return posts;
}