import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buildMarketplaceFeed, marketplaceCiudades } from '../services/marketplaceService';

const I18N = {
  es: {
    title: '🛒 Marketplace del Pádel',
    subtitle: 'Todas las oportunidades de juego: torneos abiertos, buscando cuarto y clases privadas.',
    all: 'Todo',
    torneo: 'Torneos',
    cuarto: 'Busco cuarto',
    clase: 'Clases',
    city: 'Ciudad',
    allCities: 'Todas las ciudades',
    results: 'oportunidades',
    live: 'EN DIRECTO',
    slotsLeft: 'plazas libres',
    level: 'Nivel',
    price: 'Inscripción',
    free: 'Gratis',
    loading: 'Cargando oportunidades…',
    empty: 'No hay oportunidades que coincidan con el filtro.',
    onMarket: 'En el marketplace de PADELORGANIZERS',
  },
  en: {
    title: '🛒 Padel Marketplace',
    subtitle: 'Every chance to play: open tournaments, find-a-player and private lessons.',
    all: 'All',
    torneo: 'Tournaments',
    cuarto: 'Find a player',
    clase: 'Lessons',
    city: 'City',
    allCities: 'All cities',
    results: 'opportunities',
    live: 'LIVE',
    slotsLeft: 'spots left',
    level: 'Level',
    price: 'Entry fee',
    free: 'Free',
    loading: 'Loading opportunities…',
    empty: 'No opportunities match your filters.',
    onMarket: 'On the PADELORGANIZERS marketplace',
  },
  fr: {
    title: '🛒 Marketplace du Padel',
    subtitle: 'Toutes les occasions de jouer : tournois ouverts, recherche de partenaire et cours privés.',
    all: 'Tout',
    torneo: 'Tournois',
    cuarto: 'Cherche un partenaire',
    clase: 'Cours',
    city: 'Ville',
    allCities: 'Toutes les villes',
    results: 'opportunités',
    live: 'EN DIRECT',
    slotsLeft: 'places libres',
    level: 'Niveau',
    price: 'Inscription',
    free: 'Gratuit',
    loading: 'Chargement des opportunités…',
    empty: 'Aucune opportunité ne correspond aux filtres.',
    onMarket: 'Sur le marketplace PADELORGANIZERS',
  },
  pt: {
    title: '🛒 Marketplace do Pádel',
    subtitle: 'Todas as oportunidades de jogo: torneios abertos, procurando parceiro e aulas particulares.',
    all: 'Tudo',
    torneo: 'Torneios',
    cuarto: 'Procurar parceiro',
    clase: 'Aulas',
    city: 'Cidade',
    allCities: 'Todas as cidades',
    results: 'oportunidades',
    live: 'AO VIVO',
    slotsLeft: 'vagas livres',
    level: 'Nível',
    price: 'Inscrição',
    free: 'Grátis',
    loading: 'Carregando oportunidades…',
    empty: 'Nenhuma oportunidade corresponde aos filtros.',
    onMarket: 'No marketplace da PADELORGANIZERS',
  },
};

const TYPE_ICON = { torneo: '🏆', cuarto: '👥', clase: '🎾' };
const TYPE_COLOR = { torneo: '#a3e635', cuarto: '#38bdf8', clase: '#c084fc' };

const pillStyle = (active) => ({
  padding: '9px 16px', borderRadius: '999px', border: active ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
  background: active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', color: active ? '#a3e635' : '#cbd5e1',
  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
});

export default function MarketplaceApp({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [type, setType] = useState('all');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceCiudades().then(setCities).catch(()=>setCities([]));
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    buildMarketplaceFeed({ type, city }).then(list => {
      if (!alive) return;
      setItems(list);
      setLoading(false);
    }).catch(() => {
      if (!alive) return;
      setItems([]);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [type, city]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{T.title}</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0 0' }}>{T.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={city} onChange={e => setCity(e.target.value)} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0',
            padding: '9px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
          }}>
            <option value="">{T.allCities}</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {['all', 'torneo', 'cuarto', 'clase'].map(t => (
          <button key={t} onClick={() => setType(t)} style={pillStyle(type === t)}>
            {t === 'all' ? T.all : `${TYPE_ICON[t]} ${T[t]}`}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>{T.loading}</p>
      ) : items.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          {T.empty}
        </div>
      ) : (
        <>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px' }}>{items.length} {T.results}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {items.map((item, i) => (
              <Link key={`${item.type}-${item.id}-${i}`} to={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: item.live ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                  border: item.live ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '16px', padding: '18px', height: '100%', display: 'flex', flexDirection: 'column',
                  transition: 'transform .15s, border-color .15s', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '26px' }}>{TYPE_ICON[item.type]}</span>
                    {item.live ? (
                      <span style={{ background: '#10b981', color: '#03150f', fontWeight: 800, fontSize: '11px', padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.05em' }}>
                        {T.live}
                      </span>
                    ) : item.featured ? (
                      <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 800 }}>★</span>
                    ) : null}
                  </div>

                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>{item.subtitle}</div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '4px 9px', fontSize: '11px', color: '#e2e8f0', fontWeight: 600 }}>
                      📍 {item.city}
                    </span>
                    <span style={{ background: `${TYPE_COLOR[item.type]}18`, borderRadius: '8px', padding: '4px 9px', fontSize: '11px', color: TYPE_COLOR[item.type], fontWeight: 700 }}>
                      {T.level}: {item.level}
                    </span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>🗓 {item.when}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: item.price === null ? '#a3e635' : '#fff' }}>
                      {item.price === null ? '—' : `${item.price} €`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: item.slotsLeft === null ? '#64748b' : '#84cc16', fontWeight: 700 }}>
                      {item.slotsLeft === null ? '' : `${item.slotsLeft} ${T.slotsLeft}`}
                    </span>
                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#a3e635', border: '1px solid rgba(16,185,129,0.35)', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '12px' }}>
                      {item.cta} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
