/**
 * coachDiscoveryService.js — Coach Discovery & Private Lesson Booking (#Playtomic).
 * Directorio público de entrenadores del club con reserva de lecciones
 * privadas. Reutiliza los datos de `schoolService` (coaches + classes):
 *  - Seed demo de entrenadores si el club aún no tiene ninguno.
 *  - `bookPrivateLesson` registra la sesión como una clase privada (sin grupo)
 *    con coach, pista, fecha y precio.
 */

import { listCoaches, saveCoach, addClass } from './schoolService';

const LS_BOOKINGS = 'padelorganizers-private-bookings';

// Seed demo de entrenadores (solo se aplica si el club no tiene ninguno)
const COACH_SEED = [
  { name: 'Marcelo Granda', email: 'marcelo@padelorganizers.com', phone: '+34 600 101 202', specialty: 'Técnica y remate', bio: 'Ex jugador FIP Top 60. Especialista en golpe de remate y bandeja.', avatarUrl: '', level: 'PRO', hourlyRate: 45, active: true },
  { name: 'Lucía Fontán', email: 'lucia@padelorganizers.com', phone: '+34 600 303 404', specialty: 'Iniciación y niños', bio: 'Coordinadora de escuela infantil. Más de 300 alumnos formados.', avatarUrl: '', level: 'INTERMEDIATE', hourlyRate: 32, active: true },
  { name: 'Andrés Cachavera', email: 'andres@padelorganizers.com', phone: '+34 600 505 606', specialty: 'Táctica y dobles', bio: 'Analista de juego. Monta los cuadros del circuito amateur de Vigo.', avatarUrl: '', level: 'ADVANCED', hourlyRate: 38, active: true },
];

// Siembra los entrenadores del seed que falten (por nombre), sin duplicar
export async function ensureCoachSeed({ cloud = false } = {}) {
  const existing = await listCoaches({ cloud });
  const names = new Set((existing || []).map(c => (c.name || '').toLowerCase()));
  const seeded = [...(existing || [])];
  for (const c of COACH_SEED) {
    if (names.has((c.name || '').toLowerCase())) continue;
    const rec = await saveCoach({ ...c }, { cloud });
    seeded.push(rec);
  }
  return seeded;
}

// Reserva una lección privada: la guarda como clase privada (groupId null)
export async function bookPrivateLesson({ coach, coachId, courtName = 'Pista 1', startsOn, durationMin = 60, price = 40, notes = '' }, { cloud = false } = {}) {
  const rec = await addClass({
    groupId: null,
    coachId: coachId || (coach && coach.id),
    courtName,
    startsOn: new Date(startsOn).toISOString(),
    durationMin,
    location: courtName,
    status: 'planned',
    price: Number(price) || 0,
  }, { cloud });

  const bookings = readBookings();
  bookings.push({ id: rec.id, coachId: coachId || (coach && coach.id), coachName: coach ? coach.name : '', courtName, startsOn, durationMin, price: Number(price) || 0, notes, bookedAt: new Date().toISOString() });
  writeBookings(bookings);
  return rec;
}

function readBookings() {
  try { return JSON.parse(localStorage.getItem(LS_BOOKINGS)) || []; } catch { return []; }
}
function writeBookings(list) {
  try { localStorage.setItem(LS_BOOKINGS, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

export function listBookings() {
  return readBookings();
}

// Niveles de entrenador para filtros
export const COACH_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO'];

export function levelIcon(level) {
  return level === 'PRO' ? '👑' : level === 'ADVANCED' ? '🔥' : level === 'INTERMEDIATE' ? '⚡' : '🌱';
}