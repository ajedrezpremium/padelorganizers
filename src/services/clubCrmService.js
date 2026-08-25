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
import { listClubes, loadSemilla } from './clubDirectoryService';
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
  try { return await listClubes(); } catch { return loadSemilla(); }
}

// ---- PANEL DEL DUEÑO (#10): ocupación y facturación por pista + RevPAC ----
const SLOTS_FULL = [];
for (let h = 9; h <= 22; h++) SLOTS_FULL.push(String(h).padStart(2, '0') + ':00');

// Precio dinámico de un slot (mismo yield que el grid Playtomic).
// Valle (<18h) ×0.85 · Prime (18-19h) ×1 · Noche (>=20h) ×1.3
const COURT_MULT = [1.25, 0.75, 1, 1];
export function slotPriceFor(hour, courtIdx = 0) {
  const h = parseInt(hour, 10);
  const courtMult = COURT_MULT[courtIdx] || 1;
  let timeMult = 1;
  if (h < 18) timeMult = 0.85;
  else if (h >= 20) timeMult = 1.3;
  return Math.round((CLUB_PRICE.euro || 8) * courtMult * timeMult);
}

// Panel del dueño: RevPAC por pista/día, ocupación, comparativa precio fijo vs yield.
export async function ownerDashboard() {
  const res = await listReservations();
  const courts = ['Pista 1 · Central', 'Pista 2 · Promo', 'Pista 3 · Cubierta', 'Pista 4 · Cubierta 2'];

  const perCourt = courts.map((name, idx) => {
    const rows = res.filter(r => r.court_name === name && r.status !== 'cancelled');
    const slots = rows.length;
    const ingresos = rows.reduce((s, r) => s + Number(r.price || slotPriceFor(r.time_slot, idx)), 0);
    // horas ocupadas únicas (para ocupación) y cuál es la más cara/hora valle
    const horas = rows.map(r => r.time_slot).filter(Boolean);
    const uniqueHours = new Set(horas);
    return { court: name, slots, ingresos, ocupadas: uniqueHours.size, idx };
  });

  const totalSlots = SLOTS_FULL.length; // slots por pista y día
  const capacidad = courts.length * totalSlots;
  const ocupacion = Math.round((perCourt.reduce((s, c) => s + c.ocupadas, 0) / capacidad) * 100);
  const facturacionTotal = perCourt.reduce((s, c) => s + c.ingresos, 0);

  // Simulación yield: mismo nº de reservas al precio fijo de 8€ vs precio dinámico.
  const totalRes = res.filter(r => r.status !== 'cancelled');
  const fijo8 = totalRes.reduce((s) => s + (CLUB_PRICE.euro || 8), 0);
  const conYield = perCourt.reduce((s, c) => s + c.ingresos, 0);

  // Facturación por hora (top horas): para ver picos de saturación
  const porHora = {};
  totalRes.forEach((r) => {
    const h = r.time_slot || '—';
    porHora[h] = (porHora[h] || 0) + Number(r.price || slotPriceFor(h, courts.indexOf(r.court_name) >= 0 ? courts.indexOf(r.court_name) : 0));
  });
  const topHoras = Object.entries(porHora).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    courts: perCourt,
    capacidad,
    ocupacion,
    facturacionTotal,
    fijo8,
    conYield,
    yieldGain: conYield - fijo8,
    yieldPct: fijo8 > 0 ? Math.round(((conYield - fijo8) / fijo8) * 100) : 0,
    topHoras,
    revpac: totalSlots > 0 ? Math.round((facturacionTotal / totalSlots) * 100) / 100 : 0, // € por slot disponible
    numReservas: totalRes.length,
  };
}

export { fmtEuros };