import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildClubFeed, clubKpis, listClubOptions, fmtEuros } from '../services/clubCrmService';

const I18N = {
  es: {
    title: '👔 CRM del club · Feed de negocio',
    subtitle: 'Toda la actividad real de tu club en un solo panel: reservas, socios, cuotas, bonos, fidelización y torneos.',
    club: 'Club', allClubs: '🌐 Todos los clubes',
    feed: 'Feed de actividad', kpis: 'Indicadores de negocio',
    events: 'eventos', empty: 'Todavía no hay actividad. Reserva una pista, alta un socio o lanza un torneo.',
    refresh: '⟳ Actualizar',
    go: '→',
    kpiLabels: {
      reservas: 'Reservas de pista', ingresosReservas: 'Ingresos por reservas', sociosActivos: 'Socios activos',
      mrr: 'MRR (cuotas/mes)', cuotasCobradas: 'Cobrado en cuotas', puntosTotal: 'Puntos de fidelización',
      jugadoresFeed: 'Jugadores en el feed', torneos: 'Torneos activos',
    },
    topMember: 'Top fidelización', topMemberNone: '—',
    kind: {
      reservation: 'Reserva', member: 'Soci@', due: 'Cuota', promo: 'Promo',
      loyalty: 'Fidelización', tournament: 'Torneo', moment: 'Momento',
    },
    status: { paid: 'Pagada', pending: 'Pendiente', active: 'Activo', inactive: 'Inactivo', cancelled: 'Baja', suspended: 'Suspendido' },
  },
  en: {
    title: '👔 Club CRM · Business feed',
    subtitle: 'All of your club\'s real activity in one panel: bookings, members, dues, vouchers, loyalty and tournaments.',
    club: 'Club', allClubs: '🌐 All clubs',
    feed: 'Activity feed', kpis: 'Business KPIs',
    events: 'events', empty: 'No activity yet. Book a court, add a member or launch a tournament.',
    refresh: '⟳ Refresh',
    go: '→',
    kpiLabels: {
      reservas: 'Court bookings', ingresosReservas: 'Booking revenue', sociosActivos: 'Active members',
      mrr: 'MRR (monthly fees)', cuotasCobradas: 'Collected dues', puntosTotal: 'Loyalty points',
      jugadoresFeed: 'Players in feed', torneos: 'Active tournaments',
    },
    topMember: 'Top loyalty', topMemberNone: '—',
    kind: {
      reservation: 'Booking', member: 'Member', due: 'Due', promo: 'Voucher',
      loyalty: 'Loyalty', tournament: 'Tournament', moment: 'Moment',
    },
    status: { paid: 'Paid', pending: 'Pending', active: 'Active', inactive: 'Inactive', cancelled: 'Cancelled', suspended: 'Suspended' },
  },
  fr: {
    title: '👔 CRM du club · Flux d\'activité',
    subtitle: 'Toute l\'activité réelle de votre club en un seul panneau : réservations, membres, cotisations, bons, fidélité et tournois.',
    club: 'Club', allClubs: '🌐 Tous les clubs',
    feed: 'Flux d\'activité', kpis: 'Indicateurs',
    events: 'événements', empty: 'Aucune activité pour le moment.',
    refresh: '⟳ Actualiser',
    go: '→',
    kpiLabels: {
      reservas: 'Réservations de pistes', ingresosReservas: 'Revenus réservations', sociosActivos: 'Membres actifs',
      mrr: 'MRR (cotisations/mois)', cuotasCobradas: 'Cotisations encaissées', puntosTotal: 'Points de fidélité',
      jugadoresFeed: 'Joueurs dans le flux', torneos: 'Tournois actifs',
    },
    topMember: 'Top fidélité', topMemberNone: '—',
    kind: {
      reservation: 'Réservation', member: 'Membre', due: 'Cotisation', promo: 'Bond',
      loyalty: 'Fidélité', tournament: 'Tournoi', moment: 'Moment',
    },
    status: { paid: 'Payé', pending: 'En attente', active: 'Actif', inactive: 'Inactif', cancelled: 'Annulé', suspended: 'Suspendu' },
  },
  pt: {
    title: '👔 CRM do clube · Feed de negócio',
    subtitle: 'Toda a atividade real do seu clube num só painel: reservas, sócios, cotas, vouchers, fidelização e torneios.',
    club: 'Clube', allClubs: '🌐 Todos os clubes',
    feed: 'Feed de atividade', kpis: 'Indicadores de negócio',
    events: 'eventos', empty: 'Ainda não há atividade.',
    refresh: '⟳ Atualizar',
    go: '→',
    kpiLabels: {
      reservas: 'Reservas de pista', ingresosReservas: 'Receita de reservas', sociosActivos: 'Sócios ativos',
      mrr: 'MRR (cotas/mês)', cuotasCobradas: 'Cobrado em cotas', puntosTotal: 'Pontos de fidelização',
      jugadoresFeed: 'Jogadores no feed', torneos: 'Torneios ativos',
    },
    topMember: 'Top fidelização', topMemberNone: '—',
    kind: {
      reservation: 'Reserva', member: 'Sócio', due: 'Cota', promo: 'Voucher',
      loyalty: 'Fidelização', tournament: 'Torneio', moment: 'Momento',
    },
    status: { paid: 'Paga', pending: 'Pendente', active: 'Ativo', inactive: 'Inativo', cancelled: 'Cancelado', suspended: 'Suspenso' },
  },
};

const KIND_ICON = {
  reservation: '🗓️', member: '👤', due: '💳', promo: '🎟️',
  loyalty: '⭐', tournament: '🏆', moment: '🔥',
};
const KIND_COLOR = {
  reservation: '#38bdf8', member: '#10b981', due: '#fbbf24', promo: '#a78bfa',
  loyalty: '#f472b6', tournament: '#fb7185', moment: '#fb923c',
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const ghostBtn = { background: 'transparent', color: 'var(--padel-muted)', border: '1px solid var(--padel-border)', padding: '8px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' };
const select = { background: 'var(--padel-card-bg)', color: 'var(--padel-text)', border: '1px solid var(--padel-border)', padding: '9px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' };

function timeAgo(iso, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Math.max(0, Date.now() - d.getTime());
  const min = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return days === 1 ? (lang === 'es' ? 'hace 1 día' : lang === 'fr' ? 'il y a 1 jour' : lang === 'pt' ? 'há 1 dia' : '1 day ago') : `${days}${lang === 'es' ? 'd' : lang === 'fr' ? 'j' : lang === 'pt' ? 'd' : 'd'}`;
  if (h > 0) return `${h}h`;
  if (min > 0) return `${min}m`;
  return lang === 'es' ? 'ahora' : lang === 'fr' ? 'maintenant' : lang === 'pt' ? 'agora' : 'now';
}

export default function ClubCrm({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const nav = useNavigate();
  const [feed, setFeed] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [clubId, setClubId] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async (cid) => {
    setLoading(true);
    const [f, k, opts] = await Promise.all([buildClubFeed(), clubKpis(), listClubOptions()]);
    setFeed(f);
    setKpis(k);
    setClubs(opts);
    // cuando hay selector de club activo, solo un subconjunto ilustrativo (demo)
    // el feed real es del club del usuario; en la demo mostramos todo.
    setLoading(false);
  };

  useEffect(() => { load(clubId); }, [clubId]);

  const kpiItems = kpis ? [
    ['🗓️', kpis.reservas, T.kpiLabels.reservas],
    ['💶', kpis.ingresosReservas ? fmtEuros(kpis.ingresosReservas) : '0 €', T.kpiLabels.ingresosReservas],
    ['👥', kpis.sociosActivos, T.kpiLabels.sociosActivos],
    ['📈', kpis.mrr ? fmtEuros(kpis.mrr) : '0 €', T.kpiLabels.mrr],
    ['🪙', kpis.cuotasCobradas ? fmtEuros(kpis.cuotasCobradas) : '0 €', T.kpiLabels.cuotasCobradas],
    ['⭐', kpis.puntosTotal, T.kpiLabels.puntosTotal],
  ] : [];

  const topMember = kpis && kpis.topMember
    ? `${kpis.topMember.name} · ${kpis.topMember.pts} pts`
    : T.topMemberNone;

  const byKind = {};
  feed.forEach((e) => { byKind[e.kind] = (byKind[e.kind] || 0) + 1; });
  const kindFilters = Object.keys(byKind).sort();

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--padel-text)', margin: 0 }}>{T.title}</h1>
            <p style={{ fontSize: 13, color: 'var(--padel-muted)', margin: '6px 0 0', maxWidth: 680 }}>{T.subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={clubId} onChange={(e) => setClubId(e.target.value)} style={select}>
              <option value="all">{T.allClubs}</option>
              {clubs.map((c) => <option key={c.id} value={c.id}>{`📍 ${c.name} · ${c.city}`}</option>)}
            </select>
            <button onClick={() => load(clubId)} style={ghostBtn}>{T.refresh}</button>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--padel-muted)', fontSize: 13 }}>⟳…</p>}

        {kpis && (
          <>
            {/* KPIs de negocio */}
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>📊 {T.kpis}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 10 }}>
              {kpiItems.map(([ic, n, l], i) => (
                <div key={i} style={{ ...card, textAlign: 'center', padding: 14 }}>
                  <div style={{ fontSize: 18 }}>{ic}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--padel-lime)', margin: '2px 0' }}>{n}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--padel-muted)', fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--padel-text)' }}>🏅 {T.topMember}: <b style={{ color: 'var(--padel-lime)' }}>{topMember}</b></span>
              <span style={{ fontSize: 12, color: 'var(--padel-muted)' }}>{feed.length} {T.events} · {kpis.torneos} {T.kpiLabels.torneos.toLowerCase()}</span>
            </div>

            {/* Feed de actividad */}
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>🕒 {T.feed}</h2>
            <div style={{ ...card, padding: 8 }}>
              {kindFilters.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '6px 8px 10px', borderBottom: '1px solid var(--padel-border)', marginBottom: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--padel-muted)', paddingTop: 4 }}>{T.kpis}:</span>
                  {kindFilters.map((k) => (
                    <span key={k} style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: `${KIND_COLOR[k]}22`, color: KIND_COLOR[k] }}>
                      {KIND_ICON[k]} {T.kind[k] || k} · {byKind[k]}
                    </span>
                  ))}
                </div>
              )}
              {feed.length === 0 ? (
                <p style={{ color: 'var(--padel-muted)', fontSize: 13, padding: '16px 8px', margin: 0 }}>{T.empty}</p>
              ) : feed.map((e, i) => (
                <div key={e.id || i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 8px', borderBottom: i === feed.length - 1 ? 'none' : '1px solid var(--padel-border)' }}>
                  <span style={{ fontSize: 16, marginTop: 1 }}>{KIND_ICON[e.kind] || '•'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--padel-text)' }}>{e.title}</span>
                      <span style={{ fontSize: 11, color: 'var(--padel-muted)', fontWeight: 600, flexShrink: 0 }}>{timeAgo(e.at, lang)}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--padel-muted)', marginTop: 2 }}>
                      {e.detail}
                      <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 99, background: `${KIND_COLOR[e.kind] || '#888'}22`, color: KIND_COLOR[e.kind] || '#888' }}>
                        {T.kind[e.kind] || e.kind}
                      </span>
                      {e.status && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: 'var(--padel-muted)' }}>({(T.status[e.status] || e.status)})</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Atajos */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {[
                { to: '/club', label: '🏟️ ' + T.kind.reservation + 's' },
                { to: '/socios', label: '👥 ' + T.kind.member + 's' },
                { to: '/control', label: '🎛️ ' + T.kind.tournament },
                { to: '/panel', label: '📈 Panel del dueño · RevPAC' },
              ].map((b) => (
                <button key={b.to} onClick={() => nav(b.to)} style={{ ...ghostBtn, color: 'var(--padel-lime)', borderColor: 'rgba(163,230,53,0.3)' }}>
                  {b.label} {T.go}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}