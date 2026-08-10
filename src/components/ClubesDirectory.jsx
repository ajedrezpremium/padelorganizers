import React, { useState, useEffect, useMemo } from 'react';
import { listClubes, directorioOnline } from '../services/clubDirectoryService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const mapStyles = {
  mapBox: { height: 260, width: '100%', borderRadius: 12, zIndex: 0, position: 'relative' },
  noMap: { color: 'var(--padel-muted)', fontStyle: 'italic' },
};

const I18N = {
  es: {
    title: '🗺️ Directorio de Clubes y Escuelas',
    subtitle: 'Encuentra dónde jugar y recibir clases de pádel en España',
    search: 'Buscar club o ciudad…',
    city: 'Ciudad',
    allCities: 'Todas las ciudades',
    filter: 'Filtrar',
    features: 'Características',
    courts: 'Pistas',
    school: 'Escuela / entrenadores',
    shop: 'Tienda de material',
    indoor: 'Pistas cubiertas',
    outdoor: 'Pistas exteriores',
    booking: 'Reserva',
    phone: 'Teléfono',
    email: 'Correo',
    web: 'Web',
    viewDetails: 'Ver ficha y mapa',
    back: '← Volver al listado',
    opensIn: 'Abrir en Google Maps',
    directory: 'Directorio',
    empty: 'No hay clubes que coincidan con la búsqueda.',
    verified: 'Ficha verificada',
    pending: 'Pendiente de verificación',
    featured: 'Destacado',
    openInMaps: 'Cómo llegar',
    loading: 'Cargando directorio…',
    cloud: '🟢 Nube',
    local: '🟡 Vista previa Vigo',
    sourceNote: 'Vigo · campaña de presentación',
    results: 'clubes',
  },
  en: {
    title: '🗺️ Club & School Directory',
    subtitle: 'Find where to play and take padel lessons in Spain',
    search: 'Search club or city…',
    city: 'City',
    allCities: 'All cities',
    filter: 'Filter',
    features: 'Features',
    courts: 'Courts',
    school: 'School / coaches',
    shop: 'Gear shop',
    indoor: 'Indoor courts',
    outdoor: 'Outdoor courts',
    booking: 'Booking',
    phone: 'Phone',
    email: 'Email',
    web: 'Website',
    viewDetails: 'View details & map',
    back: '← Back to list',
    opensIn: 'Open in Google Maps',
    directory: 'Directory',
    empty: 'No clubs match your search.',
    verified: 'Verified listing',
    pending: 'Pending verification',
    featured: 'Featured',
    openInMaps: 'Get directions',
    loading: 'Loading directory…',
    cloud: '🟢 Cloud',
    local: '🟡 Vigo preview',
    sourceNote: 'Vigo · launch campaign',
    results: 'clubs',
  },
  fr: {
    title: '🗺️ Annuaire des Clubs et Écoles',
    subtitle: 'Trouvez où jouer et prendre des cours de padel en Espagne',
    search: 'Rechercher un club ou une ville…',
    city: 'Ville',
    allCities: 'Toutes les villes',
    filter: 'Filtrer',
    features: 'Caractéristiques',
    courts: 'Terrains',
    school: 'École / entraîneurs',
    shop: 'Boutique',
    indoor: 'Terrains couverts',
    outdoor: 'Terrains extérieurs',
    booking: 'Réservation',
    phone: 'Téléphone',
    email: 'Email',
    web: 'Site web',
    viewDetails: 'Voir la fiche et la carte',
    back: '← Retour à la liste',
    opensIn: 'Ouvrir dans Google Maps',
    directory: 'Annuaire',
    empty: 'Aucun club ne correspond à la recherche.',
    verified: 'Fiche vérifiée',
    pending: 'En attente de vérification',
    featured: 'À la une',
    openInMaps: 'Itinéraire',
    loading: 'Chargement…',
    cloud: '🟢 Cloud',
    local: '🟡 Aperçu Vigo',
    sourceNote: 'Vigo · campagne de lancement',
    results: 'clubs',
  },
  pt: {
    title: '🗺️ Diretório de Clubes e Escolas',
    subtitle: 'Encontre onde jogar e ter aulas de padel em Espanha',
    search: 'Procurar clube ou cidade…',
    city: 'Cidade',
    allCities: 'Todas as cidades',
    filter: 'Filtrar',
    features: 'Características',
    courts: 'Pistas',
    school: 'Escola / treinadores',
    shop: 'Loja',
    indoor: 'Pistas cobertas',
    outdoor: 'Pistas exteriores',
    booking: 'Reserva',
    phone: 'Telefone',
    email: 'E-mail',
    web: 'Site',
    viewDetails: 'Ver ficha e mapa',
    back: '← Voltar à lista',
    opensIn: 'Abrir no Google Maps',
    directory: 'Diretório',
    empty: 'Nenhum clube corresponde à pesquisa.',
    verified: 'Ficha verificada',
    pending: 'Pendente de verificação',
    featured: 'Destaque',
    openInMaps: 'Como chegar',
    loading: 'A carregar…',
    cloud: '🟢 Nuvem',
    local: '🟡 Pré-visualização Vigo',
    sourceNote: 'Vigo · campanha de lançamento',
    results: 'clubes',
  },
};

function MapaClub({ club, t }) {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  useEffect(() => {
    if (!ref.current || !club.latitude || !club.longitude || mapRef.current) return;
    const map = L.map(ref.current).setView([club.latitude, club.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);
    L.marker([club.latitude, club.longitude], { icon: markerIcon }).addTo(map).bindPopup(club.name).openPopup();
    mapRef.current = map;
    return () => {
      try { map.remove(); } catch {}
      mapRef.current = null;
    };
  }, [club, club.name]);
  if (!club.latitude || !club.longitude) {
return <p style={mapStyles.noMap}>{t.sourceNote}</p>;
  }
  return <div ref={ref} style={mapStyles.mapBox} />;
}

export default function ClubesDirectory({ lang = 'es' }) {
  const t = I18N[lang] || I18N.es;
  const [clubes, setClubes] = useState([]);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const online = directorioOnline();

  useEffect(() => {
    let mounted = true;
    listClubes().then((data) => {
      if (!mounted) return;
      setClubes(data);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const ciudades = useMemo(() => [...new Set(clubes.map((c) => c.city))].sort(), [clubes]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return clubes.filter((c) => {
      if (city && c.city !== city) return false;
      if (needle) {
        const hay = `${c.name} ${c.city || ''} ${c.province || ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [clubes, q, city]);

  const openSelected = (club) => {
    setSelected(club);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const close = () => setSelected(null);

  const badge = (c) => {
    if (c.is_featured) return { label: t.featured, color: '#a16207', bg: '#fef3c7' };
    if (c.is_verified) return { label: t.verified, color: '#065f46', bg: '#d1fae5' };
    return { label: t.pending, color: '#64748b', bg: '#e2e8f0' };
  };

  const cardStyles = {
    container: {
      minHeight: '100vh', background: 'var(--padel-bg)', padding: '24px 16px 80px',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: 'var(--padel-text)',
    },
    wrap: { maxWidth: 1120, margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: 22 },
    h1: { fontSize: 28, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.5px' },
    sub: { color: 'var(--padel-muted)', margin: 0, maxWidth: 620, marginInline: 'auto' },
    chip: { display: 'inline-block', marginTop: 10, padding: '4px 12px', borderRadius: 999,
      background: 'var(--padel-hover-bg)', color: 'var(--padel-muted)', fontSize: 13 },
    toolbar: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 },
    input: { flex: '1 1 240px', padding: '10px 14px', borderRadius: 10,
      border: '1px solid var(--padel-input-border)', background: 'var(--padel-input-bg)',
      color: 'var(--padel-text)', fontSize: 15 },
    select: { padding: '10px 14px', borderRadius: 10, border: '1px solid var(--padel-input-border)',
      background: 'var(--padel-input-bg)', color: 'var(--padel-text)', fontSize: 15 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
    card: { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)',
      borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'transform .15s, box-shadow .15s', cursor: 'pointer' },
    cardName: { fontSize: 17, fontWeight: 700, margin: 0, lineHeight: 1.25 },
    city: { color: 'var(--padel-muted)', fontSize: 14, margin: 0 },
    featureRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
    feat: { fontSize: 12, padding: '3px 9px', borderRadius: 999,
      background: 'var(--padel-hover-bg)', color: 'var(--padel-text)' },
    btn: { marginTop: 'auto', padding: '9px 14px', borderRadius: 10, border: 'none',
      background: 'var(--padel-emerald)', color: '#fff', fontSize: 14, fontWeight: 700,
      cursor: 'pointer', width: '100%' },
    detailCard: { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)',
      borderRadius: 16, padding: 24, maxWidth: 860, margin: '0 auto' },
    backBtn: { background: 'transparent', border: '1px solid var(--padel-border)',
      color: 'var(--padel-text)', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 14 },
    dName: { fontSize: 24, fontWeight: 800, margin: '14px 0 4px' },
    dCity: { color: 'var(--padel-muted)', margin: '0 0 16px' },
    dGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 16 },
    dItem: { background: 'var(--padel-hover-bg)', borderRadius: 10, padding: '12px 14px' },
    dLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--padel-muted)', margin: '0 0 4px' },
    dVal: { fontSize: 14, margin: 0, wordBreak: 'break-word' },
    link: { color: 'var(--padel-emerald-dark)', textDecoration: 'none' },
    mapsBtn: { display: 'inline-block', marginTop: 18, padding: '11px 18px', borderRadius: 10,
      background: 'var(--padel-emerald)', color: '#fff', textDecoration: 'none', fontWeight: 700 },
  };

  const mapsUrl = (c) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address || `${c.name} ${c.city}`)}`;

  return (
    <div style={cardStyles.container}>
      <div style={cardStyles.wrap}>
        {loading ? (
          <p style={cardStyles.sub}>{t.loading}</p>
        ) : selected ? (
          <div style={cardStyles.detailCard}>
            <button onClick={close} style={cardStyles.backBtn}>{t.back}</button>
            {(() => { const b = badge(selected); return (
              <span style={{ display: 'inline-block', marginLeft: 10, padding: '3px 10px', borderRadius: 999,
                fontSize: 12, fontWeight: 700, color: b.color, background: b.bg }}>{b.label}</span> ); })()}
            <h2 style={cardStyles.dName}>{selected.name}</h2>
            <p style={cardStyles.dCity}>{selected.address}{selected.city ? ` · ${selected.city}` : ''}{selected.province ? `, ${selected.province}` : ''}</p>
            <MapaClub club={selected} t={t} />
            <div style={cardStyles.dGrid}>
              {selected.courts ? (
                <div style={cardStyles.dItem}>
                  <p style={cardStyles.dLabel}>{t.courts}</p>
                  <p style={cardStyles.dVal}>{selected.courts}</p>
                </div>
              ) : null}
              {selected.booking_platform ? (
                <div style={cardStyles.dItem}>
                  <p style={cardStyles.dLabel}>{t.booking}</p>
                  <p style={cardStyles.dVal}>{selected.booking_platform}</p>
                </div>
              ) : null}
              {selected.phone ? (
                <div style={cardStyles.dItem}>
                  <p style={cardStyles.dLabel}>{t.phone}</p>
                  <p style={cardStyles.dVal}>{selected.phone}</p>
                </div>
              ) : null}
              {selected.email ? (
                <div style={cardStyles.dItem}>
                  <p style={cardStyles.dLabel}>{t.email}</p>
                  <p style={cardStyles.dVal}><a style={cardStyles.link} href={`mailto:${selected.email}`}>{selected.email}</a></p>
                </div>
              ) : null}
              {selected.website && !/^N\/?A/i.test(selected.website) ? (
                <div style={cardStyles.dItem}>
                  <p style={cardStyles.dLabel}>{t.web}</p>
                  <p style={cardStyles.dVal}><a style={cardStyles.link} href={selected.website} target="_blank" rel="noreferrer">{selected.website}</a></p>
                </div>
              ) : null}
            </div>
            <div style={{ marginTop: 16 }}>
              {selected.has_school ? <span style={{ ...cardStyles.feat, ...{ marginRight: 6 } }}>{t.school}</span> : null}
              {selected.has_shop ? <span style={{ ...cardStyles.feat, ...{ marginRight: 6 } }}>{t.shop}</span> : null}
              {selected.indoor ? <span style={{ ...cardStyles.feat, ...{ marginRight: 6 } }}>{t.indoor}</span> : <span style={{ ...cardStyles.feat, ...{ marginRight: 6 } }}>{t.outdoor}</span>}
            </div>
            <a href={mapsUrl(selected)} target="_blank" rel="noreferrer" style={cardStyles.mapsBtn}>{t.openInMaps} ↗</a>
          </div>
        ) : (
          <>
            <header style={cardStyles.header}>
              <h1 style={cardStyles.h1}>{t.title}</h1>
              <p style={cardStyles.sub}>{t.subtitle}</p>
              <span style={cardStyles.chip}>{online ? t.cloud : t.local} · {clubes.length} {t.results}</span>
            </header>
            <div style={cardStyles.toolbar}>
              <input
                style={cardStyles.input}
                placeholder={t.search}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label={t.search}
              />
              <select style={cardStyles.select} value={city} onChange={(e) => setCity(e.target.value)} aria-label={t.city}>
                <option value="">{t.allCities}</option>
                {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {filtered.length === 0 ? (
              <p style={cardStyles.sub}>{t.empty}</p>
            ) : (
              <div style={cardStyles.grid}>
                {filtered.map((c) => {
                  const b = badge(c);
                  return (
                    <article key={c.id} style={cardStyles.card}
                      onClick={() => openSelected(c)}
                      role="button" tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') openSelected(c); }}
                      aria-label={c.name}>
                      <span style={{ alignSelf: 'flex-start', padding: '3px 10px', borderRadius: 999,
                        fontSize: 11, fontWeight: 700, color: b.color, background: b.bg }}>{b.label}</span>
                      <h3 style={cardStyles.cardName}>{c.name}</h3>
                      <p style={cardStyles.city}>{c.address}</p>
                      <div style={cardStyles.featureRow}>
                        {c.courts ? <span style={cardStyles.feat}>{c.courts}</span> : null}
                        {c.has_school ? <span style={cardStyles.feat}>{t.school}</span> : null}
                        <span style={cardStyles.feat}>{c.indoor ? t.indoor : t.outdoor}</span>
                      </div>
                      <button style={cardStyles.btn}>{t.viewDetails}</button>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}