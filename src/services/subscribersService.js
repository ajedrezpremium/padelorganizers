/**
 * subscribersService.js — Panel de suscriptores del newsletter (#comercial).
 * Convierte el newsletter en una lista real: alta, baja (opt-out), listado y
 * exportación a CSV compatible con los scripts de campaña de clientes/.
 *
 * Persistencia: localStorage (demo) + sincronización opcional a Supabase
 * (tabla newsletter_subscribers), consistente con el resto de la app.
 */

const LS = 'padelorganizers-subscribers';

// Seed demo de suscriptores (solo se aplica la primera vez / sin datos)
const SEED = [
  { id: 'sub1', email: 'direccion@padelvigo.com', name: 'Vigo Padel Club', lang: 'es', city: 'Vigo', active: true, joinedAt: '2026-08-01T10:00:00Z' },
  { id: 'sub2', email: 'info@madridpadel.es', name: 'Madrid Padel Center', lang: 'es', city: 'Madrid', active: true, joinedAt: '2026-08-03T09:00:00Z' },
  { id: 'sub3', email: 'contact@barcelonapadel.cat', name: 'Barcelona Padel Club', lang: 'es', city: 'Barcelona', active: true, joinedAt: '2026-08-05T12:00:00Z' },
  { id: 'sub4', email: 'hello@valenciapadel.com', name: 'Valencia Padel Academy', lang: 'en', city: 'Valencia', active: false, joinedAt: '2026-08-06T15:00:00Z' },
];

function load() {
  try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch { return null; }
}
function save(list) { localStorage.setItem(LS, JSON.stringify(list)); }
function seed() { const s = load(); if (!s) { save(SEED); return SEED; } return s; }

export function listSubscribersSync() { return seed(); }

export function subscriberKpisSync() {
  const subs = seed();
  const active = subs.filter(s => s.active).length;
  return {
    total: subs.length,
    active,
    inactive: subs.length - active,
    langs: ['es', 'en', 'fr', 'pt'].map(l => ({ lang: l, n: subs.filter(s => s.lang === l).length })),
  };
}

// Alta de suscriptor (devuelve {ok, exists} si ya estaba)
export async function addSubscriber({ email, name = '', lang = 'es', city = '' }) {
  const emailClean = (email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailClean)) return { ok: false, error: 'email inválido' };
  const subs = seed();
  const existing = subs.find(s => s.email.toLowerCase() === emailClean);
  if (existing) {
    if (!existing.active) {
      const updated = subs.map(s => (s.id === existing.id ? { ...s, active: true } : s));
      save(updated);
      return { ok: true, exists: true, reactivated: true, sub: existing };
    }
    return { ok: true, exists: true, sub: existing };
  }
  const sub = {
    id: `sub${Date.now()}`,
    email: emailClean,
    name: name.trim() || '',
    lang: lang || 'es',
    city: city.trim() || '',
    active: true,
    joinedAt: new Date().toISOString(),
  };
  save([sub, ...subs]);
  return { ok: true, exists: false, sub };
}

// Baja (opt-out): marca inactivo, NO borra el historial
export async function unsubscribe(id) {
  save(seed().map(s => (s.id === id ? { ...s, active: false } : s)));
}

// Reactivar un suscriptor dado de baja
export async function resubscribe(id) {
  save(seed().map(s => (s.id === id ? { ...s, active: true } : s)));
}

export async function removeSubscriber(id) {
  save(seed().filter(s => s.id !== id));
}

export function resetSubscribers() { save(SEED); return SEED; }

// Exporta los suscriptores ACTIVOS a CSV compatible con los scripts de campaña
// (clientes/enviar-campana.mjs espera cabeceras en español).
export function exportSubscribersCsv() {
  const active = seed().filter(s => s.active);
  const header = ['Nombre', 'Correo', 'Dirección', 'Plataforma de Reserva', 'Página Web'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = active.map(s => [s.name, s.email, s.city, 'PADELORGANIZERS', ''].map(esc).join(','));
  return [header.join(','), ...rows].join('\n');
}

// Descarga el CSV de suscriptores activos
export function downloadSubscribersCsv() {
  const csv = exportSubscribersCsv();
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `suscriptores-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Sincronización a Supabase (tabla newsletter_subscribers) si está configurado
export async function syncSubscribersToCloud({ onProgress } = {}) {
  try {
    const { supabase } = await import('../services/connection');
    if (!supabase) return { synced: 0, error: 'cloud no configurado' };
    const subs = seed();
    let synced = 0;
    for (const s of subs) {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email: s.email, name: s.name, lang: s.lang, city: s.city, active: s.active, joined_at: s.joinedAt });
      if (error) {
        if (/PGRST205|PGRST204|relation/i.test(error.message)) return { synced, error: error.message };
        continue;
      }
      synced++;
      if (onProgress) onProgress(synced, subs.length);
    }
    return { synced };
  } catch (e) {
    return { synced: 0, error: String(e && e.message || e) };
  }
}
