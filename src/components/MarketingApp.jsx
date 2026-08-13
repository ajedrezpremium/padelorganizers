import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPlans, listPromos, PLAN_BENEFITS } from '../services/membershipService';
import { generateMarketingContent, CONTENT_KEYS } from '../services/marketingAiService';
import { getState } from '../services/store';

const I18N = {
  es: {
    title: '📣 Marketing & Negocio',
    subtitle: 'Planes y precios, campañas y promociones, eventos y newsletter de tu club o escuela.',
    tabPlans: '📦 Planes', tabCampaigns: '🎯 Campañas', tabEvents: '🗓️ Eventos', tabNews: '📧 Newsletter',
    plansHint: 'Catálogo de planes activos de membresía (se gestiona en Socios → Planes).',
    plan: 'Plan', price: 'Precio', cycle: 'Ciclo', benefits: 'Ventajas', status: 'Estado',
    active: 'Activo', inactive: 'Inactivo', monthly: 'Mensual', trimestral: 'Trimestral', annual: 'Anual',
    campaigns: 'Promociones activas', noCampaigns: 'No hay promociones. Créalas en Socios → Promos.',
    code: 'Código', name: 'Nombre', value: 'Valor', uses: 'Usos', expires: 'Caduca',
    newEvent: 'Crear evento', eventName: 'Nombre del evento', eventDate: 'Fecha', eventPlace: 'Lugar',
    saveEvent: 'Guardar evento', events: 'Próximos eventos', noEvents: 'Todavía no hay eventos programados.',
    newsletter: 'Newsletter del club', newsletterDesc: 'Crea y guarda boletines para tu comunidad.',
    newsTitle: 'Asunto', newsBody: 'Contenido', saveNews: 'Guardar boletín', news: 'Boletines guardados', noNews: 'Sin boletines todavía.',
    saved: '✓ Guardado', saving: 'Guardando…',
    tabAi: '🤖 AI Marketing',
    aiTitle: '🤖 AI Marketing Assistant',
    aiSub: 'Describe tu torneo y genera al instante todos los contenidos de promoción en el idioma seleccionado.',
    aiTorName: 'Nombre del torneo', aiClub: 'Club', aiFormat: 'Formato', aiDate: 'Fecha', aiPlace: 'Lugar',
    aiFmtAmericano: 'Americano', aiFmtMexicano: 'Mexicano', aiFmtSuizo: 'Suizo', aiFmtKnockout: 'Eliminatorio',
    aiGen: '✨ Generar contenidos', aiLoading: 'Generando…', aiCopy: '📋 Copiar', aiCopied: '✓ Copiado', aiNew: '🔄 Regenerar (variante)',
    openNewsletter: '📰 Newsletter agosto 2026',
  },
  en: {
    title: '📣 Marketing & Business',
    subtitle: 'Plans & pricing, campaigns and promos, events and newsletter for your club or school.',
    tabPlans: '📦 Plans', tabCampaigns: '🎯 Campaigns', tabEvents: '🗓️ Events', tabNews: '📧 Newsletter',
    plansHint: 'Active membership plan catalogue (managed in Members → Plans).',
    plan: 'Plan', price: 'Price', cycle: 'Cycle', benefits: 'Benefits', status: 'Status',
    active: 'Active', inactive: 'Inactive', monthly: 'Monthly', trimestral: 'Quarterly', annual: 'Annual',
    campaigns: 'Active promos', noCampaigns: 'No promotions yet. Create them in Members → Promos.',
    code: 'Code', name: 'Name', value: 'Value', uses: 'Uses', expires: 'Expires',
    newEvent: 'Create event', eventName: 'Event name', eventDate: 'Date', eventPlace: 'Venue',
    saveEvent: 'Save event', events: 'Upcoming events', noEvents: 'No scheduled events yet.',
    newsletter: 'Club newsletter', newsletterDesc: 'Create and save newsletters for your community.',
    newsTitle: 'Subject', newsBody: 'Content', saveNews: 'Save newsletter', news: 'Saved newsletters', noNews: 'No newsletters yet.',
    saved: '✓ Saved', saving: 'Saving…',
    tabAi: '🤖 AI Marketing',
    aiTitle: '🤖 AI Marketing Assistant',
    aiSub: 'Describe your tournament and instantly generate every promotional asset in the selected language.',
    aiTorName: 'Tournament name', aiClub: 'Club', aiFormat: 'Format', aiDate: 'Date', aiPlace: 'Venue',
    aiFmtAmericano: 'Americano', aiFmtMexicano: 'Mexicano', aiFmtSuizo: 'Swiss', aiFmtKnockout: 'Knockout',
    aiGen: '✨ Generate content', aiLoading: 'Generating…', aiCopy: '📋 Copy', aiCopied: '✓ Copied', aiNew: '🔄 Regenerate (variant)',
    openNewsletter: '📰 August 2026 newsletter',
  },
  fr: {
    title: '📣 Marketing & Business',
    subtitle: 'Plans et tarifs, campagnes et promos, événements et newsletter de votre club ou école.',
    tabPlans: '📦 Plans', tabCampaigns: '🎯 Campagnes', tabEvents: '🗓️ Événements', tabNews: '📧 Newsletter',
    plansHint: 'Catalogue de plans d\'adhésion actifs (géré dans Membres → Plans).',
    plan: 'Offre', price: 'Prix', cycle: 'Cycle', benefits: 'Avantages', status: 'Statut',
    active: 'Actif', inactive: 'Inactif', monthly: 'Mensuel', trimestral: 'Trimestriel', annual: 'Annuel',
    campaigns: 'Promos actives', noCampaigns: 'Aucune promo. Créez-les dans Membres → Promos.',
    code: 'Code', name: 'Nom', value: 'Valeur', uses: 'Usages', expires: 'Expire',
    newEvent: 'Créer un événement', eventName: 'Nom de l\'événement', eventDate: 'Date', eventPlace: 'Lieu',
    saveEvent: 'Enregistrer', events: 'Événements à venir', noEvents: 'Aucun événement programmé.',
    newsletter: 'Newsletter du club', newsletterDesc: 'Créez et enregistrez des bulletins pour votre communauté.',
    newsTitle: 'Objet', newsBody: 'Contenu', saveNews: 'Enregistrer', news: 'Bulletins enregistrés', noNews: 'Aucun bulletin.',
    saved: '✓ Enregistré', saving: 'Enregistrement…',
    tabAi: '🤖 AI Marketing',
    aiTitle: '🤖 AI Marketing Assistant',
    aiSub: "Décrivez votre tournoi et générez instantanément tous les contenus promotionnels dans la langue choisie.",
    aiTorName: "Nom du tournoi", aiClub: 'Club', aiFormat: 'Format', aiDate: 'Date', aiPlace: 'Lieu',
    aiFmtAmericano: 'Américain', aiFmtMexicano: 'Mexicain', aiFmtSuizo: 'Suisse', aiFmtKnockout: 'Élimination',
    aiGen: '✨ Générer le contenu', aiLoading: 'Génération…', aiCopy: '📋 Copier', aiCopied: '✓ Copié', aiNew: '🔄 Régénérer (variante)',
    openNewsletter: '📰 Newsletter août 2026',
  },
  pt: {
    title: '📣 Marketing & Negócio',
    subtitle: 'Planos e preços, campanhas e promoções, eventos e newsletter do seu clube ou escola.',
    tabPlans: '📦 Planos', tabCampaigns: '🎯 Campanhas', tabEvents: '🗓️ Eventos', tabNews: '📧 Newsletter',
    plansHint: 'Catálogo de planos ativos de assinatura (gerido em Sócios → Planos).',
    plan: 'Plano', price: 'Preço', cycle: 'Ciclo', benefits: 'Vantagens', status: 'Estado',
    active: 'Ativo', inactive: 'Inativo', monthly: 'Mensal', trimestral: 'Trimestral', annual: 'Anual',
    campaigns: 'Promos ativas', noCampaigns: 'Sem promoções. Crie-as em Sócios → Promos.',
    code: 'Código', name: 'Nome', value: 'Valor', uses: 'Usos', expires: 'Expira',
    newEvent: 'Criar evento', eventName: 'Nome do evento', eventDate: 'Data', eventPlace: 'Local',
    saveEvent: 'Guardar', events: 'Próximos eventos', noEvents: 'Ainda não há eventos programados.',
    newsletter: 'Newsletter do clube', newsletterDesc: 'Crie e guarde boletins para a sua comunidade.',
    newsTitle: 'Assunto', newsBody: 'Conteúdo', saveNews: 'Guardar boletim', news: 'Boletins guardados', noNews: 'Sem boletins ainda.',
    saved: '✓ Guardado', saving: 'Guardando…',
    tabAi: '🤖 AI Marketing',
    aiTitle: '🤖 AI Marketing Assistant',
    aiSub: 'Descreva o seu torneio e gere instantaneamente todos os conteúdos promocionais no idioma selecionado.',
    aiTorName: 'Nome do torneio', aiClub: 'Clube', aiFormat: 'Formato', aiDate: 'Data', aiPlace: 'Local',
    aiFmtAmericano: 'Americano', aiFmtMexicano: 'Mexicano', aiFmtSuizo: 'Suíço', aiFmtKnockout: 'Eliminação',
    aiGen: '✨ Gerar conteúdo', aiLoading: 'A gerar…', aiCopy: '📋 Copiar', aiCopied: '✓ Copiado', aiNew: '🔄 Regenerar (variante)',
    openNewsletter: '📰 Newsletter agosto 2026',
  },
};

const section = { maxWidth: 1080, margin: '0 auto', padding: '0 24px' };
const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const input = { background: 'var(--padel-bg)', color: 'var(--padel-text)', border: '1px solid var(--padel-border)', padding: '10px 12px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, width: '100%', boxSizing: 'border-box' };
const btn = { background: 'linear-gradient(135deg,var(--padel-emerald),var(--padel-emerald-dark))', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer', marginTop: 10 };

export default function MarketingApp({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();
  const [tab, setTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [promos, setPromos] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [eventForm, setEventForm] = useState({ name: '', date: '', place: '' });
  const [newsForm, setNewsForm] = useState({ title: '', body: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiForm, setAiForm] = useState(() => {
    const st = getState();
    const t = st?.tournament;
    return { name: t?.name || 'Open Pádel Pro 2026', club: t?.club || 'Mi Club', modality: t?.modality || 'americano', date: '', place: '' };
  });
  const [aiOut, setAiOut] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);

  const LS_EVENTS = 'padelorganizers-marketing-events';
  const LS_NEWS = 'padelorganizers-marketing-news';

  useEffect(() => {
    (async () => {
      try {
        const [p, pr] = await Promise.all([listPlans(), listPromos()]);
        setPlans(p); setPromos(pr);
      } catch { /* offline */ }
      try { setEvents(JSON.parse(localStorage.getItem(LS_EVENTS)) || []); } catch { setEvents([]); }
      try { setNews(JSON.parse(localStorage.getItem(LS_NEWS)) || []); } catch { setNews([]); }
    })();
  }, []);

const PB = PLAN_BENEFITS(lang);

  const saveEvent = () => {
    const rec = { id: `ev-${Date.now()}`, ...eventForm, createdAt: new Date().toISOString() };
    if (!rec.name) return;
    const next = [rec, ...events].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    setEvents(next);
    localStorage.setItem(LS_EVENTS, JSON.stringify(next));
    setEventForm({ name: '', date: '', place: '' });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  const saveNews = () => {
    const rec = { id: `ns-${Date.now()}`, ...newsForm, createdAt: new Date().toISOString() };
    if (!rec.title) return;
    setSaving(true);
    setTimeout(() => {
      const next = [rec, ...news];
      setNews(next);
      localStorage.setItem(LS_NEWS, JSON.stringify(next));
      setNewsForm({ title: '', body: '' });
      setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 1500);
    }, 200);
  };

  const planName = (key) => PLANS && (PLANS.find?.(x => x.key === key)?.key || key);

  const genAi = async (regenerate) => {
    setAiBusy(true);
    await new Promise(r => setTimeout(r, 350));
    setAiOut(generateMarketingContent({ lang, ...aiForm, seed: Date.now() + (regenerate ? 1 : 0) }));
    setAiBusy(false);
  };

  const copyAi = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setAiCopied(true);
      setTimeout(() => setAiCopied(false), 1600);
    } catch { /* ignore */ }
  };

  const fmtLabel = (k) => T['aiFmt' + k[0].toUpperCase() + k.slice(1)] || k;

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={section}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--padel-text)', margin: 0 }}>{T.title}</h1>
        <p style={{ fontSize: 13, color: 'var(--padel-muted)', margin: '6px 0 18px' }}>{T.subtitle}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {[['plans', T.tabPlans], ['campaigns', T.tabCampaigns], ['events', T.tabEvents], ['news', T.tabNews], ['ai', T.tabAi]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                padding: '9px 16px', borderRadius: 10, border: '1px solid var(--padel-border)', background: tab === k ? 'var(--padel-emerald)' : 'var(--padel-card-bg)', color: tab === k ? '#fff' : 'var(--padel-muted)', fontWeight: 800, fontSize: 13, cursor: 'pointer',
              }}>{l}</button>
            ))}
          </div>
          <button onClick={() => navigate('/newsletters')} style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            {T.openNewsletter}
          </button>
        </div>

        {tab === 'plans' && (
          <div style={{ ...card }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>{T.plansHint}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
              {plans.length ? plans.map((p) => (
                <div key={p.id} style={{ background: 'var(--padel-bg)', borderRadius: 14, padding: 16, border: p.active ? '1px solid rgba(16,185,129,0.3)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--padel-text)', textTransform: 'uppercase' }}>{p.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 99, background: p.active ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)', color: p.active ? '#10b981' : '#94a3b8' }}>{p.active ? T.active : T.inactive}</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--padel-lime)', margin: '8px 0 2px' }}>{p.price} €<span style={{ fontSize: 12, color: 'var(--padel-muted)' }}> / {T[p.cycle] || p.cycle}</span></div>
                  <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>{p.benefits ? '✅ ' + p.benefits : '—'}</div>
                </div>
              )) : <p style={{ color: 'var(--padel-muted)', fontSize: 13 }}>{T.noEvents}</p>}
            </div>
          </div>
        )}

        {tab === 'campaigns' && (
          <div style={{ ...card }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>{T.campaigns}</h2>
            {promos.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {promos.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--padel-bg)', borderRadius: 10, padding: '10px 14px' }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--padel-text)' }}><span style={{ color: '#a3e635' }}>{p.code}</span> · {p.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--padel-muted)' }}>{p.type === 'discount' ? `-${p.value}%` : p.type === 'fixed' ? `-${p.value} €` : `+${p.value}`} · {T.uses}: {p.uses}/{p.maxUses || '∞'} {p.expiresOn ? `· ${T.expires}: ${p.expiresOn}` : ''}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 99, background: p.active ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)', color: p.active ? '#10b981' : '#94a3b8' }}>{p.active ? T.active : T.inactive}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--padel-muted)', fontSize: 13, margin: 0 }}>{T.noCampaigns}</p>}
          </div>
        )}

        {tab === 'events' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>{T.newEvent}</h2>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.eventName}</label>
              <input style={input} value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.eventDate}</label>
                  <input style={input} type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.eventPlace}</label>
                  <input style={input} value={eventForm.place} onChange={(e) => setEventForm({ ...eventForm, place: e.target.value })} />
                </div>
              </div>
              <button onClick={saveEvent} style={btn}>{saved ? T.saved : T.saveEvent}</button>
            </div>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>🗓️ {T.events}</h2>
              {events.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {events.map((ev) => (
                    <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--padel-bg)', borderRadius: 10, padding: '10px 14px' }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--padel-text)' }}>{ev.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--padel-muted)' }}>{ev.date || '—'} · {ev.place || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--padel-muted)', fontSize: 13, margin: 0 }}>{T.noEvents}</p>}
            </div>
          </div>
        )}

        {tab === 'news' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 4px' }}>📧 {T.newsletter}</h2>
              <p style={{ fontSize: 12, color: 'var(--padel-muted)', margin: '0 0 12px' }}>{T.newsletterDesc}</p>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.newsTitle}</label>
              <input style={input} value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} />
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', margin: '10px 0 4px' }}>{T.newsBody}</label>
              <textarea style={{ ...input, minHeight: 110, resize: 'vertical', fontFamily: 'inherit' }} value={newsForm.body} onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })} />
              <button onClick={saveNews} style={btn}>{saving ? T.saving : saved ? T.saved : T.saveNews}</button>
            </div>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>{T.news}</h2>
              {news.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                  {news.map((n) => (
                    <div key={n.id} style={{ background: 'var(--padel-bg)', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--padel-text)' }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--padel-muted)', marginTop: 2 }}>{n.body}</div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--padel-muted)', fontSize: 13, margin: 0 }}>{T.noNews}</p>}
            </div>
          </div>
        )}

        {tab === 'ai' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 4px' }}>{T.aiTitle}</h2>
              <p style={{ fontSize: 12, color: 'var(--padel-muted)', margin: '0 0 14px' }}>{T.aiSub}</p>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.aiTorName}</label>
              <input style={input} value={aiForm.name} onChange={(e) => setAiForm({ ...aiForm, name: e.target.value })} />
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', margin: '10px 0 4px' }}>{T.aiClub}</label>
              <input style={input} value={aiForm.club} onChange={(e) => setAiForm({ ...aiForm, club: e.target.value })} />
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', margin: '10px 0 4px' }}>{T.aiFormat}</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[['americano', T.aiFmtAmericano], ['mexicano', T.aiFmtMexicano], ['suizo', T.aiFmtSuizo], ['knockout', T.aiFmtKnockout]].map(([k, l]) => (
                  <button key={k} onClick={() => setAiForm({ ...aiForm, modality: k })} style={{
                    padding: '7px 12px', borderRadius: 10, border: '1px solid var(--padel-border)', background: aiForm.modality === k ? 'var(--padel-emerald)' : 'var(--padel-bg)', color: aiForm.modality === k ? '#fff' : 'var(--padel-muted)', fontWeight: 800, fontSize: 12, cursor: 'pointer',
                  }}>{l}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.aiDate}</label>
                  <input style={input} type="date" value={aiForm.date} onChange={(e) => setAiForm({ ...aiForm, date: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.aiPlace}</label>
                  <input style={input} value={aiForm.place} onChange={(e) => setAiForm({ ...aiForm, place: e.target.value })} />
                </div>
              </div>
              <button onClick={() => genAi(false)} style={{ ...btn, width: '100%' }}>{aiBusy ? T.aiLoading : T.aiGen}</button>
            </div>

            <div style={{ ...card, minHeight: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: 0 }}>📦 {T.tabAi}</h2>
                {aiOut && (
                  <button onClick={() => genAi(true)} style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--padel-lime)', border: '1px solid rgba(16,185,129,0.3)', padding: '7px 12px', borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                    {T.aiNew}
                  </button>
                )}
              </div>
              {aiOut ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
                  {(CONTENT_KEYS[lang] || CONTENT_KEYS.es).map(([key, label]) => (
                    <div key={key} style={{ background: 'var(--padel-bg)', borderRadius: 12, padding: 12, border: '1px solid rgba(16,185,129,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--padel-text)' }}>{label}</span>
                        <button onClick={() => copyAi(aiOut[key])} style={{ background: 'rgba(255,255,255,0.08)', color: aiCopied ? '#86efac' : 'var(--padel-muted)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                          {aiCopied ? T.aiCopied : T.aiCopy}
                        </button>
                      </div>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: 12.5, lineHeight: 1.55, color: 'var(--padel-muted)', margin: 0 }}>{aiOut[key]}</pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--padel-muted)', fontSize: 13 }}>
                  {T.aiGen}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}