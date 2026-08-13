import React, { useEffect, useState } from 'react';
import { TIERS, listSponsorsSync, addSponsor, removeSponsor, resetSponsors, sponsorKpisSync, roiProjection, tierOf } from '../services/sponsorService';

const I18N = {
  es: {
    title: '💰 Monetization · Sponsors & ROI',
    subtitle: 'Vende y gestiona patrocinios del torneo. Elige tier, añade marcas y mira el ROI estimado del paquete.',
    kpis: 'Ingresos de patrocinio',
    sponsors: 'Sponsors', ingreso: 'Ingreso estimado', impresiones: 'Impresiones est.', cpm: 'CPM (€/1000)',
    tiersLabel: 'Por tier', bySlot: 'slots',
    manager: 'Añadir sponsor', name: 'Nombre', brand: 'Marca (logo)',
    color: 'Color de marca', url: 'URL del sponsor', tier: 'Tier', add: '➕ Añadir',
    list: 'Sponsors activos', slot: 'slot', empty: 'No hay sponsors todavía. Añade el primero.',
    del: 'Quitar', reset: '⟳ Restaurar demo', preview: 'Vista previa',
    price: '€/torneo', roiTitle: 'ROI proyectado del paquete',
    roiSub: 'Coste por mil impresiones asumiendo ${n} jugadores × 40 consultas c/u durante el torneo.',
    tierNames: { oro: 'Oro', plata: 'Plata', bronce: 'Bronce' },
  },
  en: {
    title: '💰 Monetization · Sponsors & ROI',
    subtitle: 'Sell and manage tournament sponsorships. Pick a tier, add brands and check the estimated package ROI.',
    kpis: 'Sponsorship revenue',
    sponsors: 'Sponsors', ingreso: 'Est. revenue', impresiones: 'Est. impressions', cpm: 'CPM (€/1000)',
    tiersLabel: 'By tier', bySlot: 'slots',
    manager: 'Add sponsor', name: 'Name', brand: 'Brand (logo text)',
    color: 'Brand color', url: 'Sponsor URL', tier: 'Tier', add: '➕ Add',
    list: 'Active sponsors', slot: 'slot', empty: 'No sponsors yet. Add the first one.',
    del: 'Remove', reset: '⟳ Reset demo', preview: 'Preview',
    price: '€/tournament', roiTitle: 'Projected package ROI',
    roiSub: 'Cost per mille assuming ${n} players × 40 views each during the tournament.',
    tierNames: { oro: 'Gold', plata: 'Silver', bronce: 'Bronze' },
  },
  fr: {
    title: '💰 Monétisation · Sponsors & ROI',
    subtitle: 'Vendez et gérez les sponsorships du tournoi. Choisissez un tier, ajoutez des marques et vérifiez le ROI.',
    kpis: 'Revenus de sponsors',
    sponsors: 'Sponsors', ingreso: 'Revenu estimé', impresiones: 'Impressions est.', cpm: 'CPM (€/1000)',
    tiersLabel: 'Par tier', bySlot: 'créneaux',
    manager: 'Ajouter un sponsor', name: 'Nom', brand: 'Marque (logo)',
    color: 'Couleur de marque', url: 'URL du sponsor', tier: 'Tier', add: '➕ Ajouter',
    list: 'Sponsors actifs', slot: 'créneau', empty: 'Aucun sponsor pour le moment.',
    del: 'Retirer', reset: '⟳ Réinitialiser la démo', preview: 'Aperçu',
    price: '€/tournoi', roiTitle: 'ROI projeté du pack',
    roiSub: 'Coût pour mille impressions en supposant ${n} joueurs × 40 vues chacun.',
    tierNames: { oro: 'Or', plata: 'Argent', bronce: 'Bronze' },
  },
  pt: {
    title: '💰 Monetização · Sponsors & ROI',
    subtitle: 'Venda e gerencie patrocínios do torneio. Escolha o tier, adicione marcas e veja o ROI estimado.',
    kpis: 'Receita de patrocínio',
    sponsors: 'Patrocinadores', ingreso: 'Receita estimada', impresiones: 'Impressões est.', cpm: 'CPM (€/1000)',
    tiersLabel: 'Por tier', bySlot: 'slots',
    manager: 'Adicionar patrocinador', name: 'Nome', brand: 'Marca (logo)',
    color: 'Cor da marca', url: 'URL do patrocinador', tier: 'Tier', add: '➕ Adicionar',
    list: 'Patrocinadores ativos', slot: 'slot', empty: 'Ainda não há patrocinadores.',
    del: 'Remover', reset: '⟳ Repor demo', preview: 'Pré-visualização',
    price: '€/torneio', roiTitle: 'ROI projetado do pacote',
    roiSub: 'Custo por mil impressões assumindo ${n} jogadores × 40 visitas cada.',
    tierNames: { oro: 'Ouro', plata: 'Prata', bronce: 'Bronze' },
  },
};

const card = { background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: 20 };
const input = { width: '100%', padding: '9px 11px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 13, boxSizing: 'border-box' };
const ghostBtn = { padding: '8px 12px', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1' };

export default function SponsorsManager({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [sponsors, setSponsors] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [roi, setRoi] = useState(null);
  const [form, setForm] = useState({ name: '', brand: '', color: '#10b981', url: 'https://', tier: 'plata' });
  const [seed, setSeed] = useState(8);

  const refresh = () => {
    setSponsors(listSponsorsSync());
    setKpis(sponsorKpisSync());
    setRoi(roiProjection(seed));
  };
  useEffect(() => { refresh(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const doAdd = async () => {
    if (!form.name.trim() && !form.brand.trim()) return;
    await addSponsor({ name: form.name, brand: form.brand, tier: form.tier, color: form.color, url: form.url });
    setForm({ name: '', brand: '', color: '#10b981', url: 'https://', tier: 'plata' });
    refresh();
  };

  const doRemove = async (id) => { await removeSponsor(id); refresh(); };
  const doReset = async () => { setSponsors(resetSponsors()); refresh(); };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{T.title}</h2>
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px', maxWidth: 720 }}>{T.subtitle}</p>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
        {[
          ['🤝', kpis?.numSponsors ?? 0, T.sponsors],
          ['🤑', kpis ? `${kpis.ingresos} €` : '0 €', T.ingreso],
          ['👁️', roi ? roi.impresiones.toLocaleString('es-ES') : 0, T.impresiones],
          ['📊', roi ? `${roi.cpm} €` : '0 €', T.cpm],
        ].map(([ic, n, l], i) => (
          <div key={i} style={card}>
            <div style={{ fontSize: 22 }}>{ic}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#a3e635', marginTop: 4 }}>{n}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{l}</div>
          </div>
        ))}
        {[['🥇', kpis?.oro ?? 0, T.tierNames.oro], ['🥈', kpis?.plata ?? 0, T.tierNames.plata], ['🥉', kpis?.bronce ?? 0, T.tierNames.bronce]].map(([ic, n, l], i) => (
          <div key={i + 4} style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>{ic}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 2 }}>{n} <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{T.bySlot}</span></div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{T.tiersLabel}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start', marginBottom: 20 }}>
        {/* Añadir sponsor */}
        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>✨ {T.manager}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={T.name} style={input} />
            <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder={T.brand} style={input} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} type="color" style={{ ...input, height: 42, padding: 4 }} aria-label={T.color} />
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder={T.url} style={input} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 8 }}>
            {TIERS.map(t => (
              <button key={t.key} onClick={() => setForm({ ...form, tier: t.key })}
                style={{ padding: '9px', borderRadius: 9, border: form.tier === t.key ? `2px solid ${t.color}` : '1px solid rgba(255,255,255,0.15)', background: form.tier === t.key ? `${t.color}22` : 'rgba(255,255,255,0.03)', color: '#e2e8f0', fontWeight: 700, fontSize: 11.5, cursor: 'pointer' }}>
                {t.emoji} {T.tierNames[t.key]} · {t.price} €
              </button>
            ))}
          </div>
          <button onClick={doAdd} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 12 }}>{T.add}</button>
        </div>

        {/* ROI */}
        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>🎯 {T.roiTitle}</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 12px' }}>{T.roiSub.replace('${n}', String(seed))}</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>👥 </span>
            <input type="number" min={2} max={256} value={seed} onChange={e => setSeed(parseInt(e.target.value, 10) || 8)} style={{ ...input, width: 80 }} />
          </div>
          {roi && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24' }}>{T.ingreso}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{roi.costeTotal} €</div>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#34d399' }}>{T.cpm}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#a3e635' }}>{roi.cpm} €</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista + previews */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0 }}>{T.list} · {sponsors.length}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={doReset} style={ghostBtn}>{T.reset}</button>
          </div>
        </div>
        {sponsors.length === 0 ? <p style={{ color: '#64748b', fontSize: 13 }}>{T.empty}</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
            {sponsors.map(s => {
              const t = tierOf(s.tier);
              return (
                <div key={s.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0' }}>{t.emoji} {s.name}</div>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 99, background: `${s.color}22`, color: s.color }}>{T.tierNames[s.tier] || s.tier}</span>
                    <button onClick={() => doRemove(s.id)} style={{ fontSize: 11, color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>{T.del}</button>
                  </div>
                  <div style={{ borderRadius: 10, padding: '14px', textAlign: 'center', background: `linear-gradient(135deg, ${s.color}26, rgba(0,0,0,0.3))`, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: s.color, letterSpacing: 1 }}>{s.brand}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{s.url} · {t.price} €</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}