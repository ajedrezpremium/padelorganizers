/**
 * membershipService.js — Socios & Membresías (módulo de negocio del club).
 * Gestión de socios, planes/membresías, cuotas automáticas, carnets digitales,
 * bonos/promociones y programa de fidelización con ranking interno.
 * Persistencia: Supabase si hay tablas disponibles, si no localStorage.
 * Sigue el mismo patrón que schoolService.js (local espejo + upsert en nube).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LS = {
  members: 'padelorganizers-members',
  plans: 'padelorganizers-plans',
  dues: 'padelorganizers-dues',
  promos: 'padelorganizers-promos',
  loyalty: 'padelorganizers-loyalty',
};

export const MEMBER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
};
export const MEMBERSHIPS = [
  { key: 'basic', price: 15 },
  { key: 'premium', price: 25 },
  { key: 'family', price: 35 },
  { key: 'pro', price: 50 },
];
export const PLAN_CYCLES = ['monthly', 'trimestral', 'annual'];

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function writeLocal(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

// ---------- helpers ----------
export const STATUS_LABELS = (lang = 'es') => ({
  active: lang === 'es' ? 'Activo' : lang === 'fr' ? 'Actif' : lang === 'pt' ? 'Ativo' : 'Active',
  pending: lang === 'es' ? 'Pendiente' : lang === 'fr' ? 'En attente' : lang === 'pt' ? 'Pendente' : 'Pending',
  suspended: lang === 'es' ? 'Suspendido' : lang === 'fr' ? 'Suspendu' : lang === 'pt' ? 'Suspenso' : 'Suspended',
  cancelled: lang === 'es' ? 'Baja' : lang === 'fr' ? 'Annulé' : lang === 'pt' ? 'Cancelado' : 'Cancelled',
  monthly: lang === 'es' ? 'Mensual' : lang === 'fr' ? 'Mensuel' : lang === 'pt' ? 'Mensal' : 'Monthly',
  trimestral: lang === 'es' ? 'Trimestral' : lang === 'fr' ? 'Trimestriel' : lang === 'pt' ? 'Trimestral' : 'Quarterly',
  annual: lang === 'es' ? 'Anual' : lang === 'fr' ? 'Annuel' : lang === 'pt' ? 'Anual' : 'Annual',
});

export const PLAN_BENEFITS = (lang = 'es') => ({
  basic: lang === 'es' ? 'Reservas con descuento' : lang === 'fr' ? 'Réservations à prix réduit' : lang === 'pt' ? 'Reservas com desconto' : 'Discounted bookings',
  premium: lang === 'es' ? 'Reservas + clases + tienda 10%' : lang === 'fr' ? 'Réservations + cours + boutique 10%' : lang === 'pt' ? 'Reservas + aulas + loja 10%' : 'Bookings + classes + store 10%',
  family: lang === 'es' ? 'Hasta 4 personas' : lang === 'fr' ? "Jusqu'à 4 personnes" : lang === 'pt' ? 'Até 4 pessoas' : 'Up to 4 people',
  pro: lang === 'es' ? 'Torneos + material + prioridad' : lang === 'fr' ? 'Tournois + matériel + priorité' : lang === 'pt' ? 'Torneios + material + prioridade' : 'Tournaments + gear + priority',
});

// ---------- mappers ----------
function mapRow(table, row) {
  if (table === 'members') return {
    id: row.id, name: row.name, email: row.email, phone: row.phone, birthdate: row.birthdate,
    level: row.level || 'BEGINNER', plan: row.plan || 'basic', status: row.status || 'active',
    joinedOn: row.joined_on, cardNumber: row.card_number, guardianName: row.guardian_name,
    guardianPhone: row.guardian_phone, notes: row.notes, createdAt: row.created_at,
  };
  if (table === 'plans') return {
    id: row.id, name: row.name, price: Number(row.price || 0), cycle: row.cycle || 'monthly',
    benefits: row.benefits || '', active: row.active !== false, createdAt: row.created_at,
  };
  if (table === 'dues') return {
    id: row.id, memberId: row.member_id, amount: Number(row.amount || 0), currency: row.currency || 'eur',
    status: row.status || 'pending', paidOn: row.paid_on, dueDate: row.due_date, method: row.method || 'stripe',
    createdAt: row.created_at,
  };
  if (table === 'promos') return {
    id: row.id, code: row.code, name: row.name, type: row.type || 'discount', value: Number(row.value || 0),
    expiresOn: row.expires_on, active: row.active !== false, uses: row.uses || 0, maxUses: row.max_uses || 0,
    createdAt: row.created_at,
  };
  if (table === 'loyalty') return {
    id: row.id, memberId: row.member_id, points: Number(row.points || 0), reason: row.reason || '',
    createdAt: row.created_at,
  };
  return row;
}

function localId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

let cloudTables = new Set();
async function tableExists(table) {
  if (cloudTables.has(table)) return true;
  try {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error) return false;
    cloudTables.add(table);
    return true;
  } catch {
    return false;
  }
}

async function cloudQuery(table, columns = '*') {
  try {
    const { data, error } = await supabase.from(table).select(columns);
    if (error || !data) return null;
    return data.map(r => mapRow(table, r));
  } catch {
    return null;
  }
}

// ---------- SOCIOS ----------
export async function listMembers({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.members);
  if (!cloud) return local;
  const ok = await tableExists('members');
  if (!ok) return local;
  const rows = await cloudQuery('members');
  return rows && rows.length ? rows : local;
}

export async function saveMember(member, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.members);
  const existing = member.id ? local.find(m => m.id === member.id) : null;
  const rec = {
    id: member.id || localId(),
    name: member.name || 'Socio',
    email: member.email || '',
    phone: member.phone || '',
    birthdate: member.birthdate || '',
    level: member.level || 'BEGINNER',
    plan: member.plan || 'basic',
    status: member.status || 'active',
    joinedOn: member.joinedOn || new Date().toISOString().slice(0, 10),
    cardNumber: member.cardNumber || `S-${Math.floor(1000 + Math.random() * 9000)}`,
    guardianName: member.guardianName || '',
    guardianPhone: member.guardianPhone || '',
    notes: member.notes || '',
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };
  const next = existing ? local.map(m => (m.id === existing.id ? rec : m)) : [rec, ...local];
  writeLocal(LS.members, next);
  if (cloud) {
    await supabase.from('members').upsert({
      id: rec.id, name: rec.name, email: rec.email, phone: rec.phone, birthdate: rec.birthdate,
      level: rec.level, plan: rec.plan, status: rec.status, joined_on: rec.joinedOn,
      card_number: rec.cardNumber, guardian_name: rec.guardianName, guardian_phone: rec.guardianPhone,
      notes: rec.notes,
    }, { onConflict: 'id' });
  }
  return rec;
}

export async function cancelMember(id, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.members);
  writeLocal(LS.members, local.map(m => (m.id === id ? { ...m, status: 'cancelled' } : m)));
  if (cloud) await supabase.from('members').update({ status: 'cancelled' }).eq('id', id);
}

export async function reactivateMember(id, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.members);
  writeLocal(LS.members, local.map(m => (m.id === id ? { ...m, status: 'active' } : m)));
  if (cloud) await supabase.from('members').update({ status: 'active' }).eq('id', id);
}

export async function deleteMember(id, { cloud = isSupabaseConfigured } = {}) {
  writeLocal(LS.members, readLocal(LS.members).filter(m => m.id !== id));
  writeLocal(LS.dues, readLocal(LS.dues).filter(d => d.memberId !== id));
  if (cloud) {
    await supabase.from('members').delete().eq('id', id);
    await supabase.from('dues').delete().eq('member_id', id);
  }
}

// ---------- PLANES / MEMBRESÍAS ----------
export async function listPlans({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.plans);
  if (!cloud) return local;
  const ok = await tableExists('plans');
  if (!ok) return local;
  const rows = await cloudQuery('plans');
  return rows && rows.length ? rows : local;
}

export async function savePlan(plan, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.plans);
  const existing = plan.id ? local.find(p => p.id === plan.id) : null;
  const rec = {
    id: plan.id || localId(),
    name: plan.name || 'Plan',
    price: Number(plan.price || 0),
    cycle: plan.cycle || 'monthly',
    benefits: plan.benefits || '',
    active: plan.active !== false,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };
  const next = existing ? local.map(p => (p.id === existing.id ? rec : p)) : [rec, ...local];
  writeLocal(LS.plans, next);
  if (cloud) {
    await supabase.from('plans').upsert({
      id: rec.id, name: rec.name, price: rec.price, cycle: rec.cycle,
      benefits: rec.benefits, active: rec.active,
    }, { onConflict: 'id' });
  }
  return rec;
}

export async function seedDefaultPlans({ cloud = isSupabaseConfigured } = {}) {
  const plans = await listPlans({ cloud });
  if (plans.length) return plans;
  const seeded = [];
  for (const m of MEMBERSHIPS) {
    const rec = await savePlan({
      name: m.key, price: m.price, cycle: 'monthly',
      benefits: PLAN_BENEFITS('es')[m.key] || '', active: true,
    }, { cloud });
    seeded.push(rec);
  }
  return seeded;
}

export async function deletePlan(id, { cloud = isSupabaseConfigured } = {}) {
  writeLocal(LS.plans, readLocal(LS.plans).filter(p => p.id !== id));
  if (cloud) await supabase.from('plans').delete().eq('id', id);
}

// ---------- CUOTAS ----------
export async function listDues({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.dues);
  if (!cloud) return local;
  const ok = await tableExists('dues');
  if (!ok) return local;
  const rows = await cloudQuery('dues');
  return rows && rows.length ? rows : local;
}

export async function addDue(due, { cloud = isSupabaseConfigured } = {}) {
  const rec = {
    id: due.id || localId(),
    memberId: due.memberId,
    amount: Number(due.amount || 0),
    currency: due.currency || 'eur',
    status: due.status || 'pending',
    paidOn: null,
    dueDate: due.dueDate || new Date().toISOString().slice(0, 10),
    method: due.method || 'stripe',
    createdAt: new Date().toISOString(),
  };
  writeLocal(LS.dues, [rec, ...readLocal(LS.dues)]);
  if (cloud) {
    await supabase.from('dues').insert({
      member_id: rec.memberId, amount: rec.amount, currency: rec.currency, status: rec.status,
      paid_on: rec.paidOn, due_date: rec.dueDate, method: rec.method,
    });
  }
  return rec;
}

export async function markDuePaid(id, { cloud = isSupabaseConfigured } = {}) {
  const now = new Date().toISOString();
  writeLocal(LS.dues, readLocal(LS.dues).map(d => (d.id === id ? { ...d, status: 'paid', paidOn: now } : d)));
  if (cloud) await supabase.from('dues').update({ status: 'paid', paid_on: now }).eq('id', id);
}

export async function deleteDue(id, { cloud = isSupabaseConfigured } = {}) {
  writeLocal(LS.dues, readLocal(LS.dues).filter(d => d.id !== id));
  if (cloud) await supabase.from('dues').delete().eq('id', id);
}

// ---------- PROMOCIONES / BONOS ----------
export async function listPromos({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.promos);
  if (!cloud) return local;
  const ok = await tableExists('promos');
  if (!ok) return local;
  const rows = await cloudQuery('promos');
  return rows && rows.length ? rows : local;
}

export async function savePromo(promo, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.promos);
  const existing = promo.id ? local.find(p => p.id === promo.id) : null;
  const rec = {
    id: promo.id || localId(),
    code: (promo.code || 'PROMO' + Math.floor(1000 + Math.random() * 9999)).toUpperCase(),
    name: promo.name || 'Promoción',
    type: promo.type || 'discount',
    value: Number(promo.value || 0),
    expiresOn: promo.expiresOn || '',
    active: promo.active !== false,
    uses: Math.min(promo.uses || 0, promo.maxUses || 0),
    maxUses: Number(promo.maxUses || 0),
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };
  const next = existing ? local.map(p => (p.id === existing.id ? rec : p)) : [rec, ...local];
  writeLocal(LS.promos, next);
  if (cloud) {
    await supabase.from('promos').upsert({
      id: rec.id, code: rec.code, name: rec.name, type: rec.type, value: rec.value,
      expires_on: rec.expiresOn, active: rec.active, uses: rec.uses, max_uses: rec.maxUses,
    }, { onConflict: 'id' });
  }
  return rec;
}

export async function redeemPromo(id, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.promos);
  const next = local.map(p => (p.id === id ? { ...p, uses: (p.uses || 0) + 1 } : p));
  writeLocal(LS.promos, next);
  const rec = next.find(p => p.id === id);
  if (cloud) await supabase.from('promos').update({ uses: rec.uses }).eq('id', id);
  return rec;
}

export async function deletePromo(id, { cloud = isSupabaseConfigured } = {}) {
  writeLocal(LS.promos, readLocal(LS.promos).filter(p => p.id !== id));
  if (cloud) await supabase.from('promos').delete().eq('id', id);
}

// ---------- FIDELIZACIÓN ----------
export async function listLoyalty({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.loyalty);
  if (!cloud) return local;
  const ok = await tableExists('loyalty');
  if (!ok) return local;
  const rows = await cloudQuery('loyalty');
  return rows && rows.length ? rows : local;
}

export async function addLoyalty(memberId, points, reason, { cloud = isSupabaseConfigured } = {}) {
  const rec = {
    id: localId(), memberId, points: Number(points), reason: reason || '',
    createdAt: new Date().toISOString(),
  };
  writeLocal(LS.loyalty, [rec, ...readLocal(LS.loyalty)]);
  if (cloud) {
    await supabase.from('loyalty').insert({
      member_id: memberId, points: rec.points, reason: reason || '',
    });
  }
  return rec;
}

// ---------- KPIs ----------
export function membershipStats({ members, dues, promos, loyalty }) {
  const actives = (members || []).filter(m => m.status === 'active').length;
  const pending = (members || []).filter(m => m.status === 'pending').length;
  const collected = (dues || []).filter(d => d.status === 'paid').reduce((s, d) => s + Number(d.amount || 0), 0);
  const outstanding = (dues || []).filter(d => d.status === 'pending').reduce((s, d) => s + Number(d.amount || 0), 0);
  const points = (loyalty || []).reduce((s, l) => s + Number(l.points || 0), 0);
  const activePromos = (promos || []).filter(p => p.active).length;
  return { actives, pending, collected, outstanding, points, activePromos };
}

export function memberPoints(memberId, loyalty) {
  return (loyalty || []).filter(l => l.memberId === memberId).reduce((s, l) => s + Number(l.points || 0), 0);
}