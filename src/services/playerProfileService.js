/**
 * playerProfileService.js — Ficha técnica del jugador (#vector viral)
 * Cada jugador luce en el programa con foto, país/bandera, red social,
 * estilo de juego, edad, altura y empuñadura. La base se construye por
 * nombre (los jugadores del torneo demo) y se fusiona con los datos del
 * store. Las fotos que no existen en el seed se generan como avatar de
 * iniciales (ui-avatars) para que la tarjeta nunca quede vacía.
 */

const FLAGS = {
  es: '🇪🇸', ar: '🇦🇷', br: '🇧🇷', pt: '🇵🇹', it: '🇮🇹', fr: '🇫🇷',
  mx: '🇲🇽', uy: '🇺🇾', ch: '🇨🇭', se: '🇸🇪', ve: '🇻🇪', co: '🇨🇴',
};

const FICHAS = {
  'Ale Galán': { country: 'es', insta: '@alejandrogalan10', style: 'Volcador · golpeo agresivo', age: 28, height: 190, hand: 'Diestro' },
  'Juan Lebrón': { country: 'es', insta: '@juanlebroncerro', style: 'Remate letal · salida de pared', age: 30, height: 186, hand: 'Diestro' },
  'Agustín Tapia': { country: 'ar', insta: '@agustintapiaoficial', style: 'Drive eléctrico · desplazamiento', age: 26, height: 178, hand: 'Diestro' },
  'Arturo Coello': { country: 'es', insta: '@arturocoello', style: 'Volcador · potencia de red', age: 24, height: 190, hand: 'Diestro' },
  'Paquito Navarro': { country: 'es', insta: '@paquitonavarrop', style: 'Estratega · dejadas y carambolas', age: 36, height: 180, hand: 'Diestro' },
  'Sanyo Gutiérrez': { country: 'ar', insta: '@sanyogutierrez', style: 'Inteligencia táctica · control', age: 41, height: 178, hand: 'Zurdo' },
  'Franco Stupaczuk': { country: 'ar', insta: '@francostupa', style: 'Remate de potencia · ataque', age: 29, height: 184, hand: 'Diestro' },
  'Martin Di Nenno': { country: 'ar', insta: '@martindinenno', style: 'Defensa · velocidad en red', age: 28, height: 183, hand: 'Diestro' },
  'Fernando Belasteguín': { country: 'ar', insta: '@belasteguinoficial', style: 'Experiencia · lectura de juego', age: 47, height: 175, hand: 'Zurdo' },
  'Luciano Capra': { country: 'ar', insta: '@luchocapra', style: 'Volcador · versatilidad', age: 29, height: 181, hand: 'Diestro' },
  'Coki Nieto': { country: 'es', insta: '@cokinieto', style: 'Agresivo · golpes fuertes', age: 25, height: 182, hand: 'Diestro' },
  'Jon Sanz': { country: 'es', insta: '@jonsanzzuazo', style: 'Drive sólido · resistencia', age: 24, height: 180, hand: 'Diestro' },
  'Javi Garrido': { country: 'es', insta: '@javigarrido', style: 'Rápido · volea en red', age: 26, height: 184, hand: 'Diestro' },
  'Mike Yanguas': { country: 'es', insta: '@mikeyanguas', style: 'Defensa · contragolpe', age: 23, height: 177, hand: 'Diestro' },
  'Alex Ruiz': { country: 'es', insta: '@alexruizdelolmo', style: 'Volcador · juego aéreo', age: 28, height: 183, hand: 'Diestro' },
  'Juan Tello': { country: 'ar', insta: '@juantello', style: 'Saque potente · ritmo alto', age: 30, height: 182, hand: 'Diestro' },
};

export function getFlag(country) {
  return FLAGS[country] || '';
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

// Avatar de iniciales si el jugador no tiene foto (nunca deja la tarjeta vacía).
export function avatarFor(player) {
  if (player?.photo) return player.photo;
  const name = player?.name || 'Jugador';
  const ini = encodeURIComponent(initials(name));
  return `https://ui-avatars.com/api/?name=${ini}&background=0f766e&color=fff&size=128&bold=true`;
}

// Fusiona la ficha base (por nombre) con los datos del jugador del store.
// El jugador del store gana siempre (puede sobrescribir foto, nombre...).
export function enrichPlayer(player) {
  if (!player) return player;
  const base = FICHAS[player.name] || {};
  return { ...base, ...player };
}

export function enrichPlayers(players = []) {
  return players.map(enrichPlayer);
}

export function playerFicha(player) {
  const p = enrichPlayer(player);
  return {
    name: p.name,
    photo: avatarFor(p),
    flag: getFlag(p.country),
    country: p.country,
    insta: p.insta,
    style: p.style,
    age: p.age,
    height: p.height,
    hand: p.hand,
    elo: p.elo,
    level: p.level,
  };
}

// Resuelve una pareja (por pairId o nombres) a sus 2 jugadores enriquecidos.
// Devuelve array de fichas; si no encuentra, crea fichas mínimas por nombre.
export function pairToFichas(pair, state = {}) {
  const pairs = state.pairs || [];
  const players = state.players || [];
  const pairData = pair?.pairId
    ? pairs.find((p) => String(p.id) === String(pair.pairId))
    : pairs.find((p) => [p.player1, p.player2].join(' / ').toLowerCase().includes((pair?.pair1Names || '').split(' / ')[0]?.toLowerCase()));

  if (pairData) {
    const names = [pairData.player1, pairData.player2];
    const found = names.map((n) => playerFicha(players.find((pl) => pl.name === n) || { name: n }));
    if (found.length === 2) return found;
  }

  // Fallback: partir los nombres de la pareja (formato "Galán / Lebrón" o "Ale Galán · Juan Lebrón")
  const joined = pair?.pair1Names || pair?.pair2Names || pair?.name || 'Jugador';
  const names = joined
    .split(/\s*[\/·]\s*/)
    .filter(Boolean)
    .map((n) => n.trim());
  return names.length ? names.map((n) => playerFicha(players.find((pl) => pl.name === n) || { name: n })) : [playerFicha({ name: joined })];
}