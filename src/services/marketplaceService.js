/**
 * marketplaceService.js — Marketplace / Feed global de oportunidades (#Capa 5).
 *
 * Agrega en un solo feed las oportunidades de juego de toda la plataforma:
 *   - torneos   : próximos torneos de los clubes del directorio + torneo activo
 *   - cuarto    : anuncios "busco cuarto" (matchmaking) + bolsa de jugadores
 *   - clases    : lecciones privadas con entrenadores (coach discovery)
 *
 * Cada oportunidad es un objeto { type, id, title, subtitle, city, level,
 * elo, price, when, slotsLeft, cta, href } listo para renderizar en una
 * tarjeta con enlace al producto correspondiente.
 */

import { loadSemilla, listClubes } from './clubDirectoryService';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { readAds, buildPlayerPool, SEED_PLAYERS } from './matchmakingService';
import { listCoaches } from './schoolService';
import { getState } from './store';

// Torneos próximos derivados del directorio de clubes (uno por ciudad distinta).
async function seedTournaments() {
  const clubes = isSupabaseConfigured ? await listClubes() : await loadSemilla();
  const seen = new Set();
  const tournaments = [];
  for (const c of clubes) {
    if (seen.has(c.city)) continue;
    seen.add(c.city);
    const courtCount = parseInt(String(c.courts || '').match(/\d+/)?.[0] || '4', 10);
    tournaments.push({
      type: 'torneo',
      id: `torneo-${c.id}`,
      title: `Americano ${c.city}`,
      subtitle: c.name,
      city: c.city,
      club: c.name,
      level: 'Todos los niveles',
      price: 25,
      when: 'Sábado próximo · 09:00',
      slotsLeft: 6 + (tournaments.length % 5),
      cta: 'Ver torneo',
      href: `/tournament/open-padel-vigo-2026?club=${encodeURIComponent(c.name)}`,
      courts: courtCount,
      featured: c.is_featured,
    });
  }
  return tournaments;
}

// Torneo activo real del store (el que está en marcha ahora mismo).
function activeTournament() {
  try {
    const st = getState();
    if (!st || !st.tournament) return null;
    return {
      type: 'torneo',
      id: 'activo',
      title: st.tournament.name || 'Torneo activo',
      subtitle: st.tournament.club || 'En directo ahora',
      city: 'Vigo',
      club: st.tournament.club || '',
      level: 'En directo',
      price: null,
      when: 'AHORA',
      slotsLeft: null,
      cta: 'Ver en directo',
      href: '/live',
      live: true,
    };
  } catch {
    return null;
  }
}

// Anuncios "busco cuarto" reales + semilla con demanda para que el feed tenga vida.
function seedCuarto() {
  const ads = (readAds() || [])
    .filter(a => a.status === 'open')
    .map(a => ({
      type: 'cuarto',
      id: a.id,
      title: `${a.name} busca cuarto`,
      subtitle: a.mode ? `Modalidad: ${a.mode}` : 'Partido',
      city: a.city || 'Vigo',
      level: (a.elo ? Math.round((a.elo / 1000) * 10) / 10 : 3.0).toFixed(1),
      elo: a.elo || 1500,
      price: null,
      when: a.when ? `${a.when} · ${a.slot || ''}` : a.slot || 'Hoy',
      slotsLeft: 1,
      cta: 'Contactar',
      href: '/match',
    }));
  const seed = SEED_PLAYERS.slice(0, 4).map((p, i) => ({
    type: 'cuarto',
    id: `cuarto-seed-${i}`,
    title: `${p.name} busca cuarto`,
    subtitle: 'Busco 1 jugador · nivel intermedio',
    city: 'Vigo',
    level: (p.level || 3.0).toFixed(1),
    elo: p.elo,
    price: null,
    when: `Hoy · ${(p.availability || [])[0] || '20:00'}`,
    slotsLeft: 1,
    cta: 'Contactar',
    href: '/match',
  }));
  return [...seed, ...ads];
}

// Entrenadores disponibles para lección privada.
async function seedClases() {
  const coaches = await listCoaches({ cloud: false });
  return (coaches || []).filter(c => c.active !== false).map(c => ({
    type: 'clase',
    id: `clase-${c.id || c.name}`,
    title: `Lección privada · ${c.name}`,
    subtitle: c.specialty || c.level || 'Entrenador',
    city: 'Vigo',
    level: c.level || 'AVANZADO',
    price: c.hourlyRate || 40,
    when: 'Agenda libre esta semana',
    slotsLeft: null,
    cta: 'Reservar clase',
    href: '/coaches',
  }));
}

// Feed global unificado, ordenado: en directo → torneos → cuarto → clases.
export async function buildMarketplaceFeed({ type = 'all', city = '' } = {}) {
  const act = activeTournament();
  const torneos = act ? [act, ...seedTournaments()] : seedTournaments();
  const cuarto = seedCuarto();
  const clases = await seedClases();

  let items = [...torneos, ...cuarto, ...clases];
  if (type !== 'all') items = items.filter(i => i.type === type);
  if (city) items = items.filter(i => (i.city || '').toLowerCase() === city.toLowerCase());

  const order = { torneo: 0, cuarto: 1, clase: 2 };
  items.sort((a, b) => (a.live ? -1 : b.live ? 1 : (order[a.type] ?? 9) - (order[b.type] ?? 9)));
  return items;
}

export async function marketplaceCiudades() {
  const clubes = isSupabaseConfigured ? await listClubes() : await loadSemilla();
  const set = new Set();
  clubes.forEach(c => set.add(c.city));
  return [...set];
}
