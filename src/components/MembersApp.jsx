import React, { useState, useEffect } from 'react';
import {
  listMembers, saveMember, cancelMember, reactivateMember, deleteMember,
  listPlans, savePlan, seedDefaultPlans, deletePlan,
  listDues, addDue, markDuePaid, deleteDue,
  listPromos, savePromo, redeemPromo, deletePromo,
  listLoyalty, addLoyalty,
  membershipStats, memberPoints, STATUS_LABELS, PLAN_BENEFITS, MEMBERSHIPS, PLAN_CYCLES,
} from '../services/membershipService';
import { levelToElo, eloToLevel } from '../services/padelEngine';

const I18N = {
  es: {
    title: '👥 Socios & Membresías',
    subtitle: 'Altas y bajas · cuotas automáticas · carnet digital · promociones · fidelización y ranking interno',
    statsTitle: 'Panel de socios',
    actives: 'Socios activos', pendingMembers: 'Pendientes', collected: 'Recaudado', outstanding: 'Por cobrar',
    loyaltyPoints: 'Puntos', activePromos: 'Promos activas',
    tabMembers: '🪪 Socios', tabPlans: '📦 Planes', tabDues: '💳 Cuotas', tabPromos: '🎟️ Promos', tabLoyalty: '🏅 Fidelización',
    addMember: 'Alta de socio', saveMember: 'Guardar socio', cancelMember: 'Baja', reactivate: 'Reactivar', deleteM: 'Eliminar',
    name: 'Nombre', email: 'Email', phone: 'Teléfono', birthdate: 'Fecha nacimiento', level: 'Nivel',
    plan: 'Plan', status: 'Estado', joinedOn: 'Alta', cardNumber: 'Carnet digital', guardian: 'Tutor legal', notes: 'Notas',
    addPlan: 'Nuevo plan', savePlan: 'Guardar plan', planName: 'Nombre del plan', price: 'Precio (€)', cycle: 'Ciclo',
    benefits: 'Beneficios', addDue: 'Generar cuota', saveDue: 'Registrar cuota', member: 'Socio', amount: 'Importe (€)',
    dueDate: 'Vencimiento', method: 'Método', markPaid: 'Cobrar', deleteDueBtn: '✕', dueStatusPaid: 'Cobrada', dueStatusPending: 'Pendiente',
    addPromo: 'Nueva promoción', savePromo: 'Guardar promo', code: 'Código', promoName: 'Nombre', promoType: 'Tipo',
    value: 'Valor (% o €)', expiresOn: 'Caducidad', maxUses: 'Máx. usos', redeem: 'Usar', deletePromoBtn: '✕',
    typeDiscount: 'Descuento', typeBonus: 'Bono', typeFree: 'Gratis', alert: 'Gamificación: 1 clase = 100 pts, 1 reserva = 50 pts',
    addPoints: 'Sumar puntos', pointsReason: 'Motivo (ej: reserva, clase, tienda)', savePoints: 'Añadir', remove: 'Eliminar',
    ranking: '🏆 Ranking interno', pointsLabel: 'Puntos', clubRank: 'Nivel club', empty: 'Sin datos todavía.',
    noMembers: 'Sin socios. Da de alta el primero.', cardSample: 'Carnet', planBasic: 'Basic', planPremium: 'Premium', planFamily: 'Family', planPro: 'Pro',
    loading: 'Cargando…', online: '🟢 Nube', local: '🟡 Local', memberOf: 'Socio desde', eloOf: 'Elo estimado',
    family: 'FAMILIA', guardianNote: 'Los menores requieren tutor legal.', saveDone: 'Guardado ✓',
  },
  en: {
    title: '👥 Members & Memberships',
    subtitle: 'Registration & cancellations · automatic dues · digital card · promos · loyalty & internal ranking',
    actives: 'Active members', pendingMembers: 'Pending', collected: 'Collected', outstanding: 'Outstanding',
    loyaltyPoints: 'Points', activePromos: 'Active promos',
    tabMembers: '🪪 Members', tabPlans: '📦 Plans', tabDues: '💳 Dues', tabPromos: '🎟️ Promos', tabLoyalty: '🏅 Loyalty',
    addMember: 'Register member', saveMember: 'Save member', cancelMember: 'Cancel', reactivate: 'Reactivate', deleteM: 'Delete',
    name: 'Name', email: 'Email', phone: 'Phone', birthdate: 'Birth date', level: 'Level',
    plan: 'Plan', status: 'Status', joinedOn: 'Joined', cardNumber: 'Digital card', guardian: 'Guardian', notes: 'Notes',
    addPlan: 'New plan', savePlan: 'Save plan', planName: 'Plan name', price: 'Price (€)', cycle: 'Billing cycle',
    benefits: 'Benefits', addDue: 'Generate due', saveDue: 'Record due', member: 'Member', amount: 'Amount (€)',
    dueDate: 'Due date', method: 'Method', markPaid: 'Collect', deleteDueBtn: '✕', dueStatusPaid: 'Collected', dueStatusPending: 'Pending',
    addPromo: 'New promo', savePromo: 'Save promo', code: 'Code', promoName: 'Name', promoType: 'Type',
    value: 'Value (% or €)', expiresOn: 'Expires', maxUses: 'Max uses', redeem: 'Use', deletePromoBtn: '✕',
    typeDiscount: 'Discount', typeBonus: 'Bonus', typeFree: 'Free', alert: 'Gamification: 1 class = 100 pts, 1 booking = 50 pts',
    addPoints: 'Add points', pointsReason: 'Reason (e.g. booking, class, store)', savePoints: 'Add', remove: 'Remove',
    ranking: '🏆 Internal ranking', pointsLabel: 'Points', clubRank: 'Club level', empty: 'No data yet.',
    noMembers: 'No members. Register the first.', cardSample: 'Card', planBasic: 'Basic', planPremium: 'Premium', planFamily: 'Family', planPro: 'Pro',
    loading: 'Loading…', online: '🟢 Cloud', local: '🟡 Local', memberOf: 'Member since', eloOf: 'Est. Elo',
    family: 'FAMILY', guardianNote: 'Minors require a legal guardian.', saveDone: 'Saved ✓',
  },
  fr: {
    title: '👥 Membres & Abonnements',
    subtitle: 'Inscriptions et sorties · cotisations auto · carte numérique · promos · fidélité et classement interne',
    actives: 'Membres actifs', pendingMembers: 'En attente', collected: 'Perçu', outstanding: 'À encaisser',
    loyaltyPoints: 'Points', activePromos: 'Promos actives',
    tabMembers: '🪪 Membres', tabPlans: '📦 Offres', tabDues: '💳 Cotisations', tabPromos: '🎟️ Promos', tabLoyalty: '🏅 Fidélité',
    addMember: 'Inscrire', saveMember: 'Enregistrer', cancelMember: 'Sortie', reactivate: 'Réactiver', deleteM: 'Supprimer',
    name: 'Nom', email: 'Email', phone: 'Téléphone', birthdate: 'Naissance', level: 'Niveau',
    plan: 'Offre', status: 'Statut', joinedOn: 'Inscrit', cardNumber: 'Carte numérique', guardian: 'Tuteur', notes: 'Notes',
    addPlan: 'Nouvelle offre', savePlan: 'Enregistrer', planName: "Nom de l'offre", price: 'Prix (€)', cycle: 'Cycle',
    benefits: 'Avantages', addDue: 'Générer la cotisation', saveDue: 'Enregistrer', member: 'Membre', amount: 'Montant (€)',
    dueDate: 'Échéance', method: 'Méthode', markPaid: 'Encaisser', deleteDueBtn: '✕', dueStatusPaid: 'Encaissée', dueStatusPending: 'En attente',
    addPromo: 'Nouvelle promo', savePromo: 'Enregistrer', code: 'Code', promoName: 'Nom', promoType: 'Type',
    value: 'Valeur (% ou €)', expiresOn: 'Expire', maxUses: 'Max usages', redeem: 'Utiliser', deletePromoBtn: '✕',
    typeDiscount: 'Remise', typeBonus: 'Boni', typeFree: 'Gratuit', alert: 'Gamification : 1 cours = 100 pts, 1 résa = 50 pts',
    addPoints: 'Ajouter des points', pointsReason: 'Motif (ex : résa, cours, boutique)', savePoints: 'Ajouter', remove: 'Retirer',
    ranking: '🏆 Classement interne', pointsLabel: 'Points', clubRank: 'Niveau club', empty: 'Aucune donnée.',
    noMembers: 'Aucun membre. Inscrivez le premier.', cardSample: 'Carte', planBasic: 'Basic', planPremium: 'Premium', planFamily: 'Family', planPro: 'Pro',
    loading: 'Chargement…', online: '🟢 Cloud', local: '🟡 Local', memberOf: 'Membre depuis', eloOf: 'Elo estimé',
    family: 'FAMILLE', guardianNote: 'Les mineurs exigent un tuteur légal.', saveDone: 'Enregistré ✓',
  },
  pt: {
    title: '👥 Sócios & Assinaturas',
    subtitle: 'Entradas e saídas · mensalidades automáticas · cartão digital · promoções · fidelidade e ranking interno',
    actives: 'Sócios ativos', pendingMembers: 'Pendentes', collected: 'Recebido', outstanding: 'A receber',
    loyaltyPoints: 'Pontos', activePromos: 'Promos ativas',
    tabMembers: '🪪 Sócios', tabPlans: '📦 Planos', tabDues: '💳 Mensalidades', tabPromos: '🎟️ Promos', tabLoyalty: '🏅 Fidelidade',
    addMember: 'Cadastro', saveMember: 'Salvar', cancelMember: 'Saída', reactivate: 'Reativar', deleteM: 'Excluir',
    name: 'Nome', email: 'Email', phone: 'Telefone', birthdate: 'Nascimento', level: 'Nível',
    plan: 'Plano', status: 'Status', joinedOn: 'Entrada', cardNumber: 'Cartão digital', guardian: 'Responsável', notes: 'Notas',
    addPlan: 'Novo plano', savePlan: 'Salvar', planName: 'Nome do plano', price: 'Preço (€)', cycle: 'Ciclo',
    benefits: 'Benefícios', addDue: 'Gerar mensalidade', saveDue: 'Registrar', member: 'Sócio', amount: 'Valor (€)',
    dueDate: 'Vencimento', method: 'Método', markPaid: 'Receber', deleteDueBtn: '✕', dueStatusPaid: 'Paga', dueStatusPending: 'Pendente',
    addPromo: 'Nova promo', savePromo: 'Salvar', code: 'Código', promoName: 'Nome', promoType: 'Tipo',
    value: 'Valor (% ou €)', expiresOn: 'Expira', maxUses: 'Máx. usos', redeem: 'Usar', deletePromoBtn: '✕',
    typeDiscount: 'Desconto', typeBonus: 'Bônus', typeFree: 'Grátis', alert: 'Gamificação: 1 aula = 100 pts, 1 reserva = 50 pts',
    addPoints: 'Adicionar pontos', pointsReason: 'Motivo (ex: reserva, aula, loja)', savePoints: 'Adicionar', remove: 'Remover',
    ranking: '🏆 Ranking interno', pointsLabel: 'Pontos', clubRank: 'Nível clube', empty: 'Sem dados.',
    noMembers: 'Sem sócios. Cadastre o primeiro.', cardSample: 'Cartão', planBasic: 'Basic', planPremium: 'Premium', planFamily: 'Family', planPro: 'Pro',
    loading: 'Carregando…', online: '🟢 Nuvem', local: '🟡 Local', memberOf: 'Sócio desde', eloOf: 'Elo estimado',
    family: 'FAMÍLIA', guardianNote: 'Menores exigem responsável legal.', saveDone: 'Salvo ✓',
  },
};

const sectionStyle = { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' };
const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const input = { background: 'var(--padel-input-bg)', border: '1px solid var(--padel-input-border)', color: 'var(--padel-text)', borderRadius: 10, padding: '9px 12px', fontSize: 14, width: '100%', outline: 'none' };
const btnPrimary = { background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnGhost = { background: 'transparent', color: 'var(--padel-muted)', border: '1px solid var(--padel-border)', padding: '8px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' };

const Field = ({ label, value, onChange, type = 'text', options, placeholder }) => (
  <label style={{ display: 'block', marginBottom: 10 }}>
    <span style={{ fontSize: 12, color: 'var(--padel-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>{label}</span>
    <input type={type} value={value || ''} onChange={onChange} style={input} placeholder={placeholder} list={options ? `dl-${label}` : undefined} />
    {options && (
      <datalist id={`dl-${label}`}>
        {options.map(o => <option key={o} value={o} />)}
      </datalist>
    )}
  </label>
);

export default function MembersApp({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const S = STATUS_LABELS(lang);
  const PB = PLAN_BENEFITS(lang);
  const [tab, setTab] = useState('members');

  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [dues, setDues] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loyalty, setLoyalty] = useState([]);

  const emptyMember = () => ({ id: null, name: '', email: '', phone: '', birthdate: '', level: 'INTERMEDIATE', plan: 'basic', status: 'active', guardianName: '', guardianPhone: '', notes: '' });
  const emptyPlan = () => ({ id: null, name: '', price: 15, cycle: 'monthly', benefits: '', active: true });
  const emptyDue = () => ({ memberId: '', amount: '', dueDate: '', method: 'stripe' });
  const emptyPromo = () => ({ id: null, code: '', name: '', type: 'discount', value: 10, expiresOn: '', maxUses: 0, active: true });

  const [memberForm, setMemberForm] = useState(emptyMember());
  const [planForm, setPlanForm] = useState(emptyPlan());
  const [dueForm, setDueForm] = useState(emptyDue());
  const [promoForm, setPromoForm] = useState(emptyPromo());
  const [loading, setLoading] = useState(true);
  const [cloudOk, setCloudOk] = useState(false);
  const [pointsTarget, setPointsTarget] = useState('');
  const [pointsReason, setPointsReason] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [m, p, d, pr, l] = await Promise.all([listMembers(), listPlans(), listDues(), listPromos(), listLoyalty()]);
      setMembers(m); setPlans(p); setDues(d); setPromos(pr); setLoyalty(l);
      setCloudOk(m.length > 0 || p.length > 0 || d.length > 0);
      if (!p.length) {
        const seeded = await seedDefaultPlans();
        setPlans(seeded);
      }
    } catch (err) {
      console.error('Members load', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const stats = membershipStats({ members, dues, promos, loyalty });
  const nameOf = (id, list) => (list.find(x => x.id === id) || {}).name || '—';
  const planOf = (mem) => (plans.find(p => p.name === mem.plan) || {});
  const dueStatusColor = (s) => s === 'paid' ? 'var(--padel-lime)' : '#fbbf24';

  const submitMember = async () => { await saveMember(memberForm); setMemberForm(emptyMember()); loadAll(); };
  const submitPlan = async () => { await savePlan(planForm); setPlanForm(emptyPlan()); loadAll(); };
  const submitDue = async () => {
    const rec = { ...dueForm, amount: Number(dueForm.amount || 0) };
    if (!rec.memberId || rec.amount <= 0) return;
    await addDue(rec);
    setDueForm(emptyDue());
    loadAll();
  };
  const submitPromo = async () => { await savePromo(promoForm); setPromoForm(emptyPromo()); loadAll(); };
  const doRedeem = async (id) => { await redeemPromo(id); loadAll(); };
  const doLoyalty = async (memberId) => {
    const pts = Number(pointsTarget || 0);
    if (!memberId || !pts) return;
    await addLoyalty(memberId, pts, pointsReason || 'points');
    setPointsTarget(''); setPointsReason('');
    loadAll();
  };
  const memberMax = (mem) => (planOf(mem).price || 0);
  const sortedRanking = [...members]
    .filter(m => m.status === 'active')
    .sort((a, b) => memberPoints(b.id, loyalty) - memberPoints(a.id, loyalty));

  return (
    <div style={{ padding: '30px 0 60px', minHeight: '80vh' }}>
      <div style={sectionStyle}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--padel-text)', margin: '0 0 6px' }}>{T.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--padel-muted)', margin: '0 0 24px' }}>{T.subtitle} · {cloudOk ? T.online : T.local}</p>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            ['🪪', stats.actives, T.actives],
            ['⏳', stats.pending, T.pendingMembers],
            ['💶', `€${stats.collected.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')}`, T.collected],
            ['🧾', `€${stats.outstanding.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US')}`, T.outstanding],
            ['🎖️', stats.points, T.loyaltyPoints],
            ['🎟️', stats.activePromos, T.activePromos],
          ].map(([ic, n, l], i) => (
            <div key={i} style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 22 }}>{ic}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--padel-lime)' }}>{n}</div>
              <div style={{ fontSize: 12, color: 'var(--padel-muted)', fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[['members', T.tabMembers], ['plans', T.tabPlans], ['dues', T.tabDues], ['promos', T.tabPromos], ['loyalty', T.tabLoyalty]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ ...(tab === k ? btnPrimary : btnGhost) }}>{l}</button>
          ))}
        </div>

        {loading ? <p style={{ color: 'var(--padel-muted)' }}>{T.loading}</p> : (
          <div>
            {/* ===== SOCIOS ===== */}
            {tab === 'members' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                <div style={card}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 14 }}>{T.addMember}</h3>
                  <Field label={T.name} value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
                  <Field label={T.email} type="email" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
                  <Field label={T.phone} value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} />
                  <Field label={T.birthdate} type="date" value={memberForm.birthdate} onChange={e => setMemberForm({ ...memberForm, birthdate: e.target.value })} />
                  <Field label={T.level} value={memberForm.level} onChange={e => setMemberForm({ ...memberForm, level: e.target.value })} />
                  <Field label={T.plan} value={memberForm.plan} options={plans.length ? plans.map(p => p.name) : MEMBERSHIPS.map(m => m.key)} onChange={e => setMemberForm({ ...memberForm, plan: e.target.value })} />
                  <Field label={T.guardian} value={memberForm.guardianName} onChange={e => setMemberForm({ ...memberForm, guardianName: e.target.value })} />
                  <button onClick={submitMember} style={{ ...btnPrimary, width: '100%' }}>{T.saveMember}</button>
                </div>

                <div style={{ ...card, maxHeight: 560, overflowY: 'auto' }}>
                  {members.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--padel-muted)' }}>{T.noMembers}</p>
                  ) : members.map(m => {
                    const pts = memberPoints(m.id, loyalty);
                    const price = memberMax(m) || MEMBERSHIPS.find(x => x.key === m.plan)?.price || 0;
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--padel-border)' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--padel-text)', fontSize: 14 }}>
                            {m.name} <span style={{ color: 'var(--padel-muted)', fontWeight: 500, fontSize: 12 }}>· {T.cardSample} {m.cardNumber}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>
                            {S[m.status]} · {PB[m.plan] || m.plan} {m.plan === 'family' && `· ${T.family}`}
                            {price ? ` · €${price}` : ''}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>
                            {T.eloOf}: {eloToLevel(levelToElo(m.level))} · {levelToElo(m.level)} · ⭐ {pts} {T.loyaltyPoints}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                            {m.status !== 'active' && <button onClick={() => { reactivateMember(m.id); loadAll(); }} style={btnGhost}>{T.reactivate}</button>}
                            {m.status === 'active' && <button onClick={() => { cancelMember(m.id); loadAll(); }} style={{ ...btnGhost, color: '#f87171' }}>{T.cancelMember}</button>}
                          </div>
                        </div>
                        <button onClick={() => deleteMember(m.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== PLANES ===== */}
            {tab === 'plans' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                <div style={card}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 14 }}>{T.addPlan}</h3>
                  <Field label={T.planName} value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} />
                  <Field label={T.price} type="number" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })} />
                  <Field label={T.cycle} value={planForm.cycle} options={PLAN_CYCLES} onChange={e => setPlanForm({ ...planForm, cycle: e.target.value })} />
                  <Field label={T.benefits} value={planForm.benefits} onChange={e => setPlanForm({ ...planForm, benefits: e.target.value })} />
                  <button onClick={submitPlan} style={{ ...btnPrimary, width: '100%' }}>{T.savePlan}</button>
                </div>

                <div style={card}>
                  {plans.length === 0 && <p style={{ fontSize: 13, color: 'var(--padel-muted)' }}>{T.empty}</p>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                    {plans.map(p => (
                      <div key={p.id} style={{ ...card, padding: 14, border: '1px solid var(--padel-border)' }}>
                        <div style={{ fontWeight: 800, color: 'var(--padel-text)', fontSize: 15, textTransform: 'capitalize' }}>{p.name}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--padel-lime)' }}>€{p.price}</div>
                        <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>{S[p.cycle] || p.cycle}</div>
                        <div style={{ fontSize: 12, color: 'var(--padel-muted)', marginTop: 6 }}>{p.benefits}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== CUOTAS ===== */}
            {tab === 'dues' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                <div style={card}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 14 }}>{T.addDue}</h3>
                  <Field label={T.member} value={dueForm.memberId} options={members.map(m => m.id)} onChange={e => setDueForm({ ...dueForm, memberId: e.target.value })} />
                  <Field label={T.amount} type="number" value={dueForm.amount} onChange={e => setDueForm({ ...dueForm, amount: e.target.value })} />
                  <Field label={T.dueDate} type="date" value={dueForm.dueDate} onChange={e => setDueForm({ ...dueForm, dueDate: e.target.value })} />
                  <Field label={T.method} value={dueForm.method} options={['stripe', 'paypal', 'cash', 'transfer']} onChange={e => setDueForm({ ...dueForm, method: e.target.value })} />
                  <button onClick={submitDue} style={{ ...btnPrimary, width: '100%' }}>{T.saveDue}</button>
                </div>

                <div style={{ ...card, maxHeight: 560, overflowY: 'auto' }}>
                  {dues.length === 0 && <p style={{ fontSize: 13, color: 'var(--padel-muted)' }}>{T.empty}</p>}
                  {dues.slice().sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0)).map(d => (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--padel-border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--padel-text)', fontSize: 14 }}>{nameOf(d.memberId, members)}</div>
                        <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>
                          💶 €{d.amount} · {d.dueDate || '—'} · {d.method}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: dueStatusColor(d.status) }}>{d.status === 'paid' ? T.dueStatusPaid : T.dueStatusPending}</span>
                        {d.status !== 'paid' && <button onClick={() => { markDuePaid(d.id); loadAll(); }} style={{ ...btnGhost, color: 'var(--padel-lime)' }}>{T.markPaid}</button>}
                        <button onClick={() => deleteDue(d.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== PROMOCIONES ===== */}
            {tab === 'promos' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                <div style={card}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 14 }}>{T.addPromo}</h3>
                  <Field label={T.promoName} value={promoForm.name} onChange={e => setPromoForm({ ...promoForm, name: e.target.value })} />
                  <Field label={T.code} value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value })} />
                  <Field label={T.promoType} value={promoForm.type} options={['discount', 'bonus', 'free']} onChange={e => setPromoForm({ ...promoForm, type: e.target.value })} />
                  <Field label={T.value} type="number" value={promoForm.value} onChange={e => setPromoForm({ ...promoForm, value: Number(e.target.value) })} />
                  <Field label={T.maxUses} type="number" value={promoForm.maxUses} onChange={e => setPromoForm({ ...promoForm, maxUses: Number(e.target.value) })} />
                  <Field label={T.expiresOn} type="date" value={promoForm.expiresOn} onChange={e => setPromoForm({ ...promoForm, expiresOn: e.target.value })} />
                  <button onClick={submitPromo} style={{ ...btnPrimary, width: '100%' }}>{T.savePromo}</button>
                </div>

                <div style={{ ...card, maxHeight: 560, overflowY: 'auto' }}>
                  {promos.length === 0 && <p style={{ fontSize: 13, color: 'var(--padel-muted)' }}>{T.empty}</p>}
                  {promos.map(p => {
                    const expired = p.expiresOn && new Date(p.expiresOn) < new Date();
                    const exhausted = p.maxUses && p.uses >= p.maxUses;
                    return (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--padel-border)' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--padel-text)', fontSize: 14 }}>
                            {p.code} <span style={{ color: 'var(--padel-lime)', fontSize: 12 }}>{p.type === 'discount' ? T.typeDiscount : p.type === 'bonus' ? T.typeBonus : T.typeFree} {p.value}{p.type === 'discount' ? '%' : ''}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>
                            {p.name} · {p.uses}{p.maxUses ? `/${p.maxUses}` : ''} {p.expiresOn ? `· ${T.expiresOn}: ${p.expiresOn}` : ''}
                            {(!p.active || expired || exhausted) && <span style={{ color: '#f87171' }}> · {T.dueStatusPending}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(p.active && !expired && !exhausted) && <button onClick={() => doRedeem(p.id)} style={btnGhost}>{T.redeem}</button>}
                          <button onClick={() => deletePromo(p.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== FIDELIZACIÓN ===== */}
            {tab === 'loyalty' && (
              <div>
                <p style={{ fontSize: 12, color: '#fbbf24', margin: '0 0 16px' }}>🎯 {T.alert}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                  <div style={card}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 14 }}>{T.addPoints}</h3>
                    <Field label={T.member} value={pointsTarget} options={members.filter(m => m.status === 'active').map(m => m.id)} onChange={e => setPointsTarget(e.target.value)} />
                    <Field label={T.pointsReason} value={pointsReason} onChange={e => setPointsReason(e.target.value)} />
                    <button onClick={() => { const ids = pointsTarget.split(',').map(s => s.trim()).filter(Boolean); ids.forEach(id => doLoyalty(id)); }} style={{ ...btnPrimary, width: '100%' }}>{T.savePoints}</button>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 12px' }}>{T.ranking}</h3>
                    <div style={{ ...card, maxHeight: 520, overflowY: 'auto', padding: 8 }}>
                      {sortedRanking.length === 0 && <p style={{ fontSize: 13, color: 'var(--padel-muted)', padding: 8 }}>{T.empty}</p>}
                      {sortedRanking.map((m, idx) => {
                        const pts = memberPoints(m.id, loyalty);
                        return (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', borderBottom: '1px solid var(--padel-border)' }}>
                            <span style={{ fontSize: 16, width: 26, textAlign: 'center' }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: 'var(--padel-text)', fontSize: 14 }}>{m.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>{eloToLevel(levelToElo(m.level))}</div>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--padel-lime)' }}>⭐ {pts}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}