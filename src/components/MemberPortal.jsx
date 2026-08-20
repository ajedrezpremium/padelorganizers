import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  listMembers, listPlans, listDues, listPromos, listLoyalty,
  memberPoints, redeemPromo, MEMBERSHIPS, STATUS_LABELS, PLAN_BENEFITS,
} from '../services/membershipService';

const I18N = {
  es: {
    title: '🪪 Mi carné de socio',
    subtitle: 'Tu membresía en el club: plan, cuotas, promos y fidelización.',
    signInPrompt: 'Inicia sesión para ver tu carné de socio.',
    notFound: 'Tu cuenta no está registrada como socio del club todavía.',
    card: 'Carné digital', plan: 'Plan', status: 'Estado', memberSince: 'Socio desde', number: 'Nº carné',
    dues: 'Cuotas', noDues: 'Todavía no tienes cuotas registradas.', paid: 'Pagada', pending: 'Pendiente',
    promo: 'Promociones', noPromo: 'No hay promociones activas ahora.', redeem: 'Canjear',
    loyalty: 'Puntos de fidelización', totalPoints: 'Puntos', history: 'Historial', noLoyalty: 'Sin movimientos de puntos aún.',
    benefits: 'Ventajas del plan', amount: 'Importe', due: 'Vencimiento',
    monthly: 'Mensual', trimestral: 'Trimestral', annual: 'Anual',
  },
  en: {
    title: '🪪 My member card',
    subtitle: 'Your club membership: plan, dues, promos and loyalty.',
    signInPrompt: 'Sign in to see your member card.',
    notFound: 'Your account is not yet registered as a club member.',
    card: 'Digital card', plan: 'Plan', status: 'Status', memberSince: 'Member since', number: 'Card Nº',
    dues: 'Dues', noDues: 'No dues registered yet.', paid: 'Paid', pending: 'Pending',
    promo: 'Promotions', noPromo: 'No active promotions right now.', redeem: 'Redeem',
    loyalty: 'Loyalty points', totalPoints: 'Points', history: 'History', noLoyalty: 'No point movements yet.',
    benefits: 'Plan benefits', amount: 'Amount', due: 'Due',
    monthly: 'Monthly', trimestral: 'Quarterly', annual: 'Annual',
  },
  fr: {
    title: '🪪 Ma carte membre',
    subtitle: 'Votre adhésion au club : offre, cotisations, promos et fidélité.',
    signInPrompt: 'Connectez-vous pour voir votre carte membre.',
    notFound: 'Votre compte n\'est pas encore enregistré comme membre du club.',
    card: 'Carte numérique', plan: 'Offre', status: 'Statut', memberSince: 'Membre depuis', number: 'Nº carte',
    dues: 'Cotisations', noDues: 'Aucune cotisation enregistrée.', paid: 'Payée', pending: 'En attente',
    promo: 'Promotions', noPromo: 'Aucune promotion active pour le moment.', redeem: 'Utiliser',
    loyalty: 'Points de fidélité', totalPoints: 'Points', history: 'Historique', noLoyalty: 'Aucun mouvement de points.',
    benefits: 'Avantages de l\'offre', amount: 'Montant', due: 'Échéance',
    monthly: 'Mensuel', trimestral: 'Trimestriel', annual: 'Annuel',
  },
  pt: {
    title: '🪪 Meu cartão de sócio',
    subtitle: 'A sua adesão ao clube: plano, mensalidades, promos e fidelização.',
    signInPrompt: 'Inicie sessão para ver o seu cartão de sócio.',
    notFound: 'A sua conta ainda não está registada como sócia do clube.',
    card: 'Cartão digital', plan: 'Plano', status: 'Estado', memberSince: 'Sócio desde', number: 'Nº cartão',
    dues: 'Mensalidades', noDues: 'Ainda não tem mensalidades registadas.', paid: 'Paga', pending: 'Pendente',
    promo: 'Promoções', noPromo: 'Não há promoções ativas agora.', redeem: 'Usar',
    loyalty: 'Pontos de fidelização', totalPoints: 'Pontos', history: 'Histórico', noLoyalty: 'Sem movimentos de pontos.',
    benefits: 'Vantagens do plano', amount: 'Valor', due: 'Vencimento',
    monthly: 'Mensal', trimestral: 'Trimestral', annual: 'Anual',
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const chip = { fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99 };

export default function MemberPortal({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const { user, loading } = useAuth();
  const [member, setMember] = useState(null);
  const [plan, setPlan] = useState(null);
  const [dues, setDues] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loyalty, setLoyalty] = useState([]);
  const [points, setPoints] = useState(0);
  const [reloading, setReloading] = useState(false);

  const SL = STATUS_LABELS(lang);
  const PB = PLAN_BENEFITS(lang);

  useEffect(() => {
    if (!user) { setMember(null); return; }
    let on = true;
    (async () => {
      const email = (user.email || '').toLowerCase();
      const [members, plans, duesList, promosList, loyaltyList] = await Promise.all([
        listMembers(), listPlans(), listDues(), listPromos(), listLoyalty(),
      ]);
      if (!on) return;
      const me = (members || []).find((m) => (m.email || '').toLowerCase() === email)
        || (members || []).find((m) => (m.name || '').toLowerCase().includes((user.email || '').split('@')[0].toLowerCase()));
      setMember(me || null);
      setPlan((plans || []).find((p) => p.name === me?.plan) || null);
      setDues((duesList || []).filter((d) => d.memberId === me?.id));
      setPromos((promosList || []).filter((p) => p.active));
      setLoyalty((loyaltyList || []).filter((l) => l.memberId === me?.id));
      setPoints(me ? memberPoints(me.id, loyaltyList) : 0);
    })();
    return () => { on = false; };
  }, [user]);

  async function redeem(promo) {
    setReloading(true);
    try {
      await redeemPromo(promo.id);
      const list = await listPromos();
      setPromos((list || []).filter((p) => p.active));
      setReloading(false);
    } catch { setReloading(false); }
  }

  const planIcon = { basic: '🥉', premium: '🥈', family: '👨‍👩‍👧‍👦', pro: '🥇' };

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--padel-text)', margin: 0 }}>{T.title}</h1>
        <p style={{ fontSize: 13, color: 'var(--padel-muted)', margin: '6px 0 18px' }}>{T.subtitle}</p>

        {loading ? <p style={{ color: 'var(--padel-muted)' }}>⟳…</p> : !user ? (
          <div style={{ ...card, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40 }}>🪪</div>
            <p style={{ color: 'var(--padel-muted)', fontSize: 14, marginTop: 8 }}>{T.signInPrompt}</p>
          </div>
        ) : !member ? (
          <div style={{ ...card, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40 }}>👤</div>
            <p style={{ color: 'var(--padel-muted)', fontSize: 14, marginTop: 8 }}>{T.notFound}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {/* Carné digital */}
            <div style={{ ...card, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 12px' }}>💳 {T.card}</h2>
              <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a2f)', borderRadius: 14, padding: 16, border: '1px solid rgba(16,185,129,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: 1.5, color: '#34d399', fontWeight: 800 }}>PADEL ORGANIZERS</div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginTop: 14 }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{member.email}</div>
                  </div>
                  <div style={{ fontSize: 26 }}>{planIcon[member.plan] || '🎾'}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{T.number}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>{member.cardNumber || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{T.memberSince}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{member.joinedOn || '—'}</div>
                  </div>
                  <span style={{ ...chip, background: 'rgba(52,211,153,0.2)', color: '#34d399' }}>{SL[member.status] || member.status}</span>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)' }}>{T.plan}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', textTransform: 'uppercase' }}>{plan?.name || member.plan}</span>
                  {plan?.price ? <span style={{ ...chip, background: 'rgba(132,204,22,0.15)', color: '#a3e635' }}>{plan.price} €/{T[plan.cycle] || plan.cycle}</span> : null}
                </div>
                {PB[member.plan] && <p style={{ fontSize: 12, color: 'var(--padel-muted)', margin: '8px 0 0' }}>✅ {PB[member.plan]}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Cuotas */}
              <div style={{ ...card, padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>🧾 {T.dues}</h2>
                {dues.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {dues.map((d) => (
                      <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--padel-bg)', borderRadius: 10, padding: '8px 12px' }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--padel-text)' }}>{d.amount} €</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10.5, color: 'var(--padel-muted)' }}>{T.due}: {d.dueDate || '—'}</span>
                          <span style={{ ...chip, background: d.status === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.15)', color: d.status === 'paid' ? '#10b981' : '#fbbf24' }}>
                            {d.status === 'paid' ? '✅ ' + T.paid : '⏳ ' + T.pending}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noDues}</p>}
              </div>

              {/* Fidelización */}
              <div style={{ ...card, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: 0 }}>⭐ {T.loyalty}</h2>
                  <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--padel-lime)' }}>{points}</span>
                </div>
                {loyalty.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                    {loyalty.map((l) => (
                      <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--padel-bg)', borderRadius: 10, padding: '6px 12px' }}>
                        <span style={{ fontSize: 12, color: 'var(--padel-text)' }}>{l.reason || '—'}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: l.points >= 0 ? '#a3e635' : '#fb7185' }}>{l.points >= 0 ? '+' : ''}{l.points}</span>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noLoyalty}</p>}
              </div>
            </div>

            {/* Promociones */}
            <div style={{ ...card, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>🎟️ {T.promo}</h2>
              {promos.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {promos.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--padel-bg)', borderRadius: 10, padding: '10px 12px' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--padel-text)' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--padel-muted)' }}>{p.type === 'discount' ? `-${p.value}%` : p.type === 'fixed' ? `-${p.value} €` : `+${p.value}`} · {p.uses}/{p.maxUses || '∞'}</div>
                      </div>
                      <button onClick={() => redeem(p)} disabled={reloading || (p.maxUses && p.uses >= p.maxUses)} style={{ background: 'linear-gradient(135deg,var(--padel-emerald),var(--padel-emerald-dark))', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: 8, fontWeight: 800, fontSize: 11.5, cursor: 'pointer', opacity: reloading ? 0.6 : 1 }}>
                        {T.redeem}
                      </button>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noPromo}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}