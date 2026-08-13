import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ownerDashboard, fmtEuros, slotPriceFor } from '../services/clubCrmService';

const I18N = {
  es: {
    title: '📈 Panel del dueño · RevPAC',
    subtitle: 'Ocupación, facturación por pista y el impacto del precio dinámico (yield management) en tu club.',
    refresh: '⟳ Actualizar',
    kpis: 'Indicadores',
    cap: 'Capacidad diaria (slots)', occ: 'Ocupación', rev: 'Facturación total', revpac: 'RevPAC (€/slot disponible)',
    perCourt: 'Ocupación y facturación por pista', perCourtSub: 'Slots ocupados y € ingresados por pista',
    court: 'Pista', slots: 'Slots', empty: 'Todavía no hay reservas. Reserva una pista para ver el panel.',
    yieldTitle: 'Precio fijo vs. yield management', yieldSub: 'Mismo volumen de reservas, diferente ingreso: lo que gana el club con precios dinámicos por hora y pista.',
    fixed: 'Precio fijo (8 €)', dynamic: 'Precio dinámico (yield)', gain: 'Beneficio del yield', gainPct: 'incremento',
    topHours: 'Top horas de facturación', topHoursSub: 'Dónde se concentra el dinero del club',
    hour: 'Hora', goClub: '→ Ir a reservas', goCrm: '→ CRM completo',
    noData: '—', valle: 'valle', prime: 'prime', noche: 'noche',
  },
  en: {
    title: '📈 Owner dashboard · RevPAC',
    subtitle: 'Occupancy, revenue per court and the impact of dynamic pricing (yield management) on your club.',
    refresh: '⟳ Refresh',
    kpis: 'KPIs',
    cap: 'Daily capacity (slots)', occ: 'Occupancy', rev: 'Total revenue', revpac: 'RevPAC (€/available slot)',
    perCourt: 'Occupancy & revenue per court', perCourtSub: 'Occupied slots and € earned per court',
    court: 'Court', slots: 'Slots', empty: 'No bookings yet. Book a court to see the panel.',
    yieldTitle: 'Fixed price vs. yield management', yieldSub: 'Same booking volume, different revenue: what dynamic per-hour/per-court pricing earns the club.',
    fixed: 'Fixed price (€8)', dynamic: 'Dynamic price (yield)', gain: 'Yield gain', gainPct: 'increase',
    topHours: 'Top revenue hours', topHoursSub: 'Where your club\'s money concentrates',
    hour: 'Hour', goClub: '→ Go to bookings', goCrm: '→ Full CRM',
    noData: '—', valle: 'valley', prime: 'prime', noche: 'night',
  },
  fr: {
    title: '📈 Tableau du propriétaire · RevPAC',
    subtitle: 'Occupation, facturation par piste et impact de la tarification dynamique (yield) sur votre club.',
    refresh: '⟳ Actualiser',
    kpis: 'Indicateurs',
    cap: 'Capacité journalière (créneaux)', occ: 'Occupation', rev: 'Facturation totale', revpac: 'RevPAC (€/créneau dispo)',
    perCourt: 'Occupation & facturation par piste', perCourtSub: 'Créneaux occupés et € encaissés par piste',
    court: 'Piste', slots: 'Créneaux', empty: 'Aucune réservation pour le moment. Réservez une piste pour voir le tableau.',
    yieldTitle: 'Prix fixe vs. yield management', yieldSub: 'Même volume de réservations, revenu différent : ce que gagne le club avec des prix dynamiques par heure et piste.',
    fixed: 'Prix fixe (8 €)', dynamic: 'Prix dynamique (yield)', gain: 'Gain du yield', gainPct: 'augmentation',
    topHours: 'Heures les plus rentables', topHoursSub: 'Où se concentre l\'argent du club',
    hour: 'Heure', goClub: '→ Aller aux réservations', goCrm: '→ CRM complet',
    noData: '—', valle: 'creux', prime: 'prime', noche: 'nuit',
  },
  pt: {
    title: '📈 Painel do dono · RevPAC',
    subtitle: 'Ocupação, faturação por campo e o impacto do preço dinâmico (yield management) no seu clube.',
    refresh: '⟳ Atualizar',
    kpis: 'Indicadores',
    cap: 'Capacidade diária (slots)', occ: 'Ocupação', rev: 'Faturação total', revpac: 'RevPAC (€/slot disponível)',
    perCourt: 'Ocupação e faturação por campo', perCourtSub: 'Slots ocupados e € ganhos por campo',
    court: 'Campo', slots: 'Slots', empty: 'Ainda não há reservas. Reserve um campo para ver o painel.',
    yieldTitle: 'Preço fixo vs. yield management', yieldSub: 'Mesmo volume de reservas, receita diferente: o que ganha o clube com preços dinâmicos por hora e campo.',
    fixed: 'Preço fixo (8 €)', dynamic: 'Preço dinâmico (yield)', gain: 'Ganho do yield', gainPct: 'aumento',
    topHours: 'Horas com mais faturação', topHoursSub: 'Onde se concentra o dinheiro do clube',
    hour: 'Hora', goClub: '→ Ir para reservas', goCrm: '→ CRM completo',
    noData: '—', valle: 'vazio', prime: 'prime', noche: 'noite',
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const ghostBtn = { background: 'transparent', color: 'var(--padel-muted)', border: '1px solid var(--padel-border)', padding: '8px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' };

function Bar({ pct, color }) {
  return (
    <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(4, Math.min(100, pct))}%`, height: '100%', background: color, borderRadius: 6 }} />
    </div>
  );
}

export default function OwnerDashboard({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setData(await ownerDashboard());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--padel-text)', margin: 0 }}>{T.title}</h1>
            <p style={{ fontSize: 13, color: 'var(--padel-muted)', margin: '6px 0 0', maxWidth: 680 }}>{T.subtitle}</p>
          </div>
          <button onClick={load} style={ghostBtn}>{T.refresh}</button>
        </div>

        {loading && <p style={{ color: 'var(--padel-muted)', fontSize: 13 }}>⟳…</p>}

        {data && data.numReservas === 0 && (
          <div style={{ ...card, textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>📈</div>
            <p style={{ color: 'var(--padel-muted)', fontSize: 13, margin: 0 }}>{T.empty}</p>
          </div>
        )}

        {data && data.numReservas > 0 && (
          <>
            {/* KPIs */}
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>📊 {T.kpis}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 10 }}>
              {[
                ['🎯', `${data.ocupacion}%`, T.occ],
                ['🕐', data.capacidad, T.cap],
                ['💶', fmtEuros(data.facturacionTotal), T.rev],
                ['📈', `${data.revpac} €`, T.revpac],
              ].map(([ic, n, l], i) => (
                <div key={i} style={{ ...card, textAlign: 'center', padding: 14 }}>
                  <div style={{ fontSize: 18 }}>{ic}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--padel-lime)', margin: '2px 0' }}>{n}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--padel-muted)', fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Ocupación y facturación por pista */}
            <div style={{ ...card, marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 2px' }}>🗓️ {T.perCourt}</h3>
              <p style={{ fontSize: 12, color: 'var(--padel-muted)', margin: '0 0 12px' }}>{T.perCourtSub}</p>
              {data.courts.map((c, i) => {
                const pct = data.capacidad > 0 ? Math.round((c.ocupadas / (data.capacidad / 4)) * 100) : 0;
                const priceNow = slotPriceFor('20:00', i);
                return (
                  <div key={i} style={{ padding: '9px 0', borderBottom: i === data.courts.length - 1 ? 'none' : '1px solid var(--padel-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--padel-text)' }}>{c.court}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--padel-lime)' }}>{fmtEuros(c.ingresos)} · {c.slots} {T.slots.toLowerCase()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}><Bar pct={pct} color={pct > 60 ? '#10b981' : pct > 30 ? '#84cc16' : '#38bdf8'} /></div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--padel-muted)', minWidth: 64, textAlign: 'right' }}>20:00 · {priceNow} €</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Yield management: fijo vs dinámico */}
            <div style={{ ...card, marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 2px' }}>⚡ {T.yieldTitle}</h3>
              <p style={{ fontSize: 12, color: 'var(--padel-muted)', margin: '0 0 12px' }}>{T.yieldSub}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>{T.fixed}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#e2e8f0' }}>{fmtEuros(data.fijo8)}</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>{T.dynamic}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#a3e635' }}>{fmtEuros(data.conYield)}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, fontWeight: 800, color: 'var(--padel-lime)' }}>
                +{fmtEuros(data.yieldGain)} · +{data.yieldPct}% {T.gainPct} 🎯
              </div>
            </div>

            {/* Top horas de facturación */}
            <div style={{ ...card }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 2px' }}>🕘 {T.topHours}</h3>
              <p style={{ fontSize: 12, color: 'var(--padel-muted)', margin: '0 0 12px' }}>{T.topHoursSub}</p>
              {data.topHoras.length === 0 && <p style={{ color: 'var(--padel-muted)', fontSize: 13, margin: 0 }}>{T.noData}</p>}
              {data.topHoras.map(([h, amt], i) => {
                const hh = parseInt(h, 10);
                const tag = hh >= 20 ? T.noche : hh >= 18 ? T.prime : T.valle;
                const color = hh >= 20 ? '#fbbf24' : hh >= 18 ? '#a3e635' : '#38bdf8';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i === data.topHoras.length - 1 ? 'none' : '1px solid var(--padel-border)' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--padel-text)', minWidth: 46 }}>{h}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 8px', borderRadius: 99, background: `${color}22`, color }}>{tag}</span>
                    <div style={{ flex: 1 }}><Bar pct={Math.min(100, (amt / data.topHoras[0][1]) * 100)} color={color} /></div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--padel-lime)' }}>{fmtEuros(amt)}</span>
                  </div>
                );
              })}
            </div>

            {/* Atajos */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              <button onClick={() => nav('/club')} style={{ ...ghostBtn, color: 'var(--padel-lime)', borderColor: 'rgba(163,230,53,0.3)' }}>{T.goClub}</button>
              <button onClick={() => nav('/crm')} style={ghostBtn}>{T.goCrm}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}