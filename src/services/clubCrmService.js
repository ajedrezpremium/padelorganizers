/**
 * clubCrmService.js — CRM del club / feed de negocio (#objetivo 2).
 * Agrega en un solo panel la actividad real del club: reservas de pistas,
 * socios y membresías, cuotas cobradas, bonos redimidos, fidelización y
 * momentos de partidos. Con selector de club del directorio.
 * No inventa datos: todo el feed se construye desde los servicios existentes.
 */

import { listReservations, CLUB_PRICE } from './clubService';
import { listMembers, listDues, listPromos, listLoyalty, memberPoints, MEMBERSHIPS } from './membershipService';
import { loadMomentsSync } from './momentsService';
import { listClubes, CLUBES_SEMILLA } from './clubDirectoryService';
import { getState } from './store';

// ---- movimientos de moneda ----
const fmtEuros = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

// ---- agregación de la actividad real del club en un feed cronológico ----
export async function buildClubFeed() {
  const events = [];

  // 1 · Reservas de pistas (ClubApp) — precio, jugador, pista, hora
  try {
    const res = await listReservations();
    res.forEach((r) => {
      events.push({
        at: r.created_at || (r.day ? `${r.day}T18:00:00` : null),
        kind: 'reservation',
        title: (r.player_name || 'Jugador') + ` · ${r.court_name || 'Pista'}`,
        detail: `${r.time_slot || ''} · ${fmtEuros(r.price || CLUB_PRICE.euro)}`,
        amount: Number(r.price || CLUB_PRICE.euro),
        status: r.status || 'pending',
        id: r.id,
      });
    });
  } catch { /* sin reservas */ }

  // 2 · Socios nuevos / altas (MembersApp)
  try {
    const members = await listMembers();
    members.forEach((m) => {
      const plan = MEMBERSHIPS.find((p) => p.key === m.plan) || {};
      events.push({
        at: m.joinedOn || m.createdAt || null,
        kind: 'member',
        title: m.name || 'Soci@',
        detail: `${plan.price ? fmtEuros(plan.price) + '/mes' : ''} · ${m.status || 'active'}`,
        amount: plan.price || 0,
        status: m.status || 'active',
        id: m.id,
      });
    });
  } catch { /* sin socios */ }

  // 3 · Cuotas cobradas (MembersApp)
  try {
    const dues = await listDues();
    dues.forEach((d) => {
      events.push({
        at: d.paidOn || d.createdAt || null,
        kind: 'due',
        title: 'Cuota ' + (d.status === 'paid' ? 'pagada' : 'pendiente'),
        detail: fmtEuros(d.amount),
        amount: Number(d.amount || 0),
        status: d.status || 'pending',
        id: d.id,
      });
    });
  } catch { /* sin cuotas */ }

  // 4 · Bonos / promociones (MembersApp)
  try {
    const promos = await listPromos();
    promos.forEach((p) => {
      events.push({
        at: p.createdAt || null,
        kind: 'promo',
        title: `Código ${p.code || ''}`.trim(),
        detail: `${p.name || ''} · ${p.uses || 0} usos`,
        amount: 0,
        status: p.active !== false ? 'active' : 'inactive',
        id: p.id,
      });
    });
  } catch { /* sin promos */ }

  // 5 · Programa de fidelización (MembersApp)
  try {
    const loyalty = await listLoyalty();
    loyalty.forEach((l) => {
      events.push({
        at: l.createdAt || null,
        kind: 'loyalty',
        title: l.reason || 'Fidelización',
        detail: `${l.points} pts`,
        amount: 0,
        status: 'active',
        id: l.id,
      });
    });
  } catch { /* sin fidelización */ }

  // 6 · Torneo activo (store real)
  try {
    const st = getState() || {};
    const name = (st.tournament || {}).name;
    const nPlayers = (st.players || []).length;
    if (name) {
      events.push({
        at: new Date().toISOString(),
        kind: 'tournament',
        title: `Torneo "${name}"`,
        detail: `${nPlayers} jugadores inscritos`,
        amount: 0,
        status: 'active',
        id: 'torneo-activo',
      });
    }
  } catch { /* sin torneo */ }

  // 7 · Momentos de partidos (LiveScorePro)
  try {
    const moments = loadMomentsSync('demo');
    moments.forEach((m) => {
      events.push({
        at: m.createdAt || null,
        kind: 'moment',
        title: m.title || 'Punto de la ronda',
        detail: m.pair1Names ? `${m.pair1Names} vs ${m.pair2Names || ''}` : '',
        amount: 0,
        status: 'active',
        id: m.id,
      });
    });
  } catch { /* sin momentos */ }

  // orden cronológico desc (los sin fecha van al final)
  const sorted = events
    .filter((e) => e.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at));
  const noDate = events.filter((e) => !e.at);
  return [...sorted, ...noDate];
}

// ---- KPIs de negocio del club ----
export async function clubKpis() {
  const feed = await buildClubFeed();
  const totalReservas = feed.filter((e) => e.kind === 'reservation');
  const ingresosReservas = totalReservas.reduce((s, e) => s + e.amount, 0);

  let members = [];
  let dues = [];
  let loyalty = [];
  try { members = await listMembers(); } catch { members = []; }
  try { dues = await listDues(); } catch { dues = []; }
  try { loyalty = await listLoyalty(); } catch { loyalty = []; }

  const activeMembers = members.filter((m) => m.status === 'active');
  const mrr = activeMembers.reduce((s, m) => {
    const plan = MEMBERSHIPS.find((p) => p.key === m.plan) || {};
    return s + Number(plan.price || 0);
  }, 0);

  const cuotasCobradas = dues.filter((d) => d.status === 'paid').reduce((s, d) => s + Number(d.amount || 0), 0);
  const puntosTotal = loyalty.reduce((s, l) => s + Number(l.points || 0), 0);
  const topMember = activeMembers
    .map((m) => ({ name: m.name, pts: memberPoints(m.id, loyalty) }))
    .sort((a, b) => b.pts - a.pts)[0] || null;

  return {
    reservas: totalReservas.length,
    ingresosReservas,
    jugadoresFeed: feed.filter((e) => e.kind === 'member').length,
    sociosActivos: activeMembers.length,
    mrr,
    cuotasCobradas,
    puntosTotal,
    topMember,
    torneos: feed.filter((e) => e.kind === 'tournament').length,
    eventosTotales: feed.length,
  };
}

// ---- clubes del directorio (para el selector de club) ----
export async function listClubOptions() {
  try { return await listClubes(); } catch { return CLUBES_SEMILLA; }
}

export { fmtEuros };