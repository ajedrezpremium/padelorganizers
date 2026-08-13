import React, { useMemo, useState } from 'react';

const I18N = {
  es: {
    badge: '🗓️ CALENDARIO DEL CIRCUITO',
    title: 'Calendario de torneos de pádel',
    subtitle: 'Todos los torneos del Qatar Airways Premier Padel Tour y competiciones oficiales de la FIP: en vivo, próximos y archivo histórico mes a mes. Pulsa un torneo para abrir su web oficial.',
    live: '🔴 En vivo',
    upcoming: '⏭ Próximos',
    finished: '🏆 Finalizados',
    webOfficial: 'Web oficial ↗',
    stars: 'estrellas',
    criteriaTitle: '¿Cómo se puntúa?',
    criteriaOpen: 'Ver los 10 criterios',
    criteriaClose: 'Ocultar los 10 criterios',
    note: 'Calificación de 1 a 5 ★ según 10 criterios objetivos de calidad.',
    noLive: 'No hay torneos en vivo ahora mismo. Vuelve durante un torneo para seguirlo en directo.',
    noUpcoming: 'Sin torneos próximos en esta temporada.',
    monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    criteria: [
      { name: 'Categoría internacional', desc: 'Major / P1 / P2: nivel oficial de la competición.' },
      { name: 'Premios', desc: 'Bolsa y premios económicos del torneo.' },
      { name: 'Jugadores del top mundial', desc: 'Participación de parejas del ranking mundial FIP.' },
      { name: 'Calidad del cuadro', desc: 'Número de parejas cabezas de serie y top 10.' },
      { name: 'Infraestructura', desc: 'Pista central, instalaciones y aforo.' },
      { name: 'Medios y producción', desc: 'Cobertura TV, streaming y producción del evento.' },
      { name: 'Programa de comunicación', desc: 'Campaña, redes sociales y difusión del torneo.' },
      { name: 'Experiencia del aficionado', desc: 'Accesos, fan zone, restauración y experiencia de público.' },
      { name: 'Ciudad y sede', desc: 'Atractivo de la sede y tradición del evento en la ciudad.' },
      { name: 'Internacionalidad', desc: 'Alcance global y difusión internacional del torneo.' },
    ],
  },
  en: {
    badge: '🗓️ CIRCUIT CALENDAR',
    title: 'Padel tournament calendar',
    subtitle: 'Every Qatar Airways Premier Padel Tour event and official FIP competition: live, upcoming and the month-by-month historical archive. Tap a tournament to open its official website.',
    live: '🔴 Live',
    upcoming: '⏭ Upcoming',
    finished: '🏆 Finished',
    webOfficial: 'Official site ↗',
    stars: 'stars',
    criteriaTitle: 'How is it scored?',
    criteriaOpen: 'See the 10 criteria',
    criteriaClose: 'Hide the 10 criteria',
    note: 'Rating from 1 to 5 ★ based on 10 objective quality criteria.',
    noLive: 'No live tournaments right now. Come back during an event to follow it live.',
    noUpcoming: 'No upcoming tournaments this season.',
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    criteria: [
      { name: 'International category', desc: 'Major / P1 / P2: official tier of the competition.' },
      { name: 'Prize money', desc: 'Tournament purse and cash prizes.' },
      { name: 'Top world players', desc: 'FIP world-ranking pairs taking part.' },
      { name: 'Draw quality', desc: 'Number of seeded pairs and top 10.' },
      { name: 'Infrastructure', desc: 'Centre court, facilities and capacity.' },
      { name: 'Media & production', desc: 'TV coverage, streaming and event production.' },
      { name: 'Communication program', desc: 'Campaign, social media and promotion.' },
      { name: 'Fan experience', desc: 'Access, fan zone, hospitality and crowd experience.' },
      { name: 'City & venue', desc: 'Host-city appeal and event tradition.' },
      { name: 'International reach', desc: 'Global scope and international coverage.' },
    ],
  },
  fr: {
    badge: '🗓️ CALENDRIER DU CIRCUIT',
    title: 'Calendrier des tournois de padel',
    subtitle: 'Tous les tournois du Qatar Airways Premier Padel Tour et des compétitions officielles de la FIP : en direct, à venir et l’archive historique mois par mois. Cliquez sur un tournoi pour ouvrir son site officiel.',
    live: '🔴 En direct',
    upcoming: '⏭ À venir',
    finished: '🏆 Terminés',
    webOfficial: 'Site officiel ↗',
    stars: 'étoiles',
    criteriaTitle: 'Comment est-ce noté ?',
    criteriaOpen: 'Voir les 10 critères',
    criteriaClose: 'Masquer les 10 critères',
    note: 'Note de 1 à 5 ★ selon 10 critères objectifs de qualité.',
    noLive: 'Aucun tournoi en direct pour le moment. Revenez pendant un événement pour le suivre en direct.',
    noUpcoming: 'Aucun tournoi à venir cette saison.',
    monthNames: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    criteria: [
      { name: 'Catégorie internationale', desc: 'Major / P1 / P2 : niveau officiel de la compétition.' },
      { name: 'Prix', desc: 'Dotation et prix en argent du tournoi.' },
      { name: 'Joueurs du top mondial', desc: 'Participation des paires du classement mondial FIP.' },
      { name: 'Qualité du tableau', desc: 'Nombre de paires têtes de série et top 10.' },
      { name: 'Infrastructure', desc: 'Court central, installations et capacité.' },
      { name: 'Médias & production', desc: 'Couverture TV, streaming et production.' },
      { name: 'Programme de communication', desc: 'Campagne, réseaux sociaux et diffusion.' },
      { name: 'Expérience du public', desc: 'Accès, fan zone, restauration et expérience.' },
      { name: 'Ville et site', desc: 'Attractivité de la ville et tradition du tournoi.' },
      { name: 'Portée internationale', desc: 'Rayonnement mondial et couverture internationale.' },
    ],
  },
  pt: {
    badge: '🗓️ CALENDÁRIO DO CIRCUITO',
    title: 'Calendário de torneios de padel',
    subtitle: 'Todos os torneios do Qatar Airways Premier Padel Tour e competições oficiais da FIP: ao vivo, próximos e o arquivo histórico mês a mês. Toque num torneio para abrir o site oficial.',
    live: '🔴 Ao vivo',
    upcoming: '⏭ Próximos',
    finished: '🏆 Finalizados',
    webOfficial: 'Site oficial ↗',
    stars: 'estrelas',
    criteriaTitle: 'Como é pontuado?',
    criteriaOpen: 'Ver os 10 critérios',
    criteriaClose: 'Ocultar os 10 critérios',
    note: 'Classificação de 1 a 5 ★ segundo 10 critérios objetivos de qualidade.',
    noLive: 'Sem torneios ao vivo agora. Volte durante um evento para acompanhar ao vivo.',
    noUpcoming: 'Sem torneios próximos nesta temporada.',
    monthNames: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
    criteria: [
      { name: 'Categoria internacional', desc: 'Major / P1 / P2: nível oficial da competição.' },
      { name: 'Prémios', desc: 'Bolsa e prémios em dinheiro do torneio.' },
      { name: 'Jogadores do top mundial', desc: 'Participação de pares do ranking mundial FIP.' },
      { name: 'Qualidade do quadro', desc: 'Número de pares cabeças de série e top 10.' },
      { name: 'Infraestrutura', desc: 'Court central, instalações e capacidade.' },
      { name: 'Meios e produção', desc: 'Cobertura TV, streaming e produção do evento.' },
      { name: 'Programa de comunicação', desc: 'Campanha, redes sociais e divulgação.' },
      { name: 'Experiência do fã', desc: 'Acessos, fan zone, restauração e experiência.' },
      { name: 'Cidade e sede', desc: 'Atratividade da cidade e tradição do evento.' },
      { name: 'Internacionalização', desc: 'Alcance global e cobertura internacional.' },
    ],
  },
};

// Calendario oficial Qatar Airways Premier Padel Tour 2026 (FIP).
// state: 'live' | 'upcoming' | 'finished' (se calcula por fechas)
const TORNEOS = [
  { id: 'riyadh', name: 'Riyadh Season Premier Padel', cat: 'P1', city: 'Riad', country: 'Arabia Saudí', flag: '🇸🇦', start: '2026-02-07', end: '2026-02-14', url: 'https://www.padelfip.com/es/eventos/riyadh-season-p1-2026/', stars: 4, reasons: ['Estreno de temporada del circuito mundial', 'Riyadh Season: infraestructura y medios de primer nivel', 'Cuadro repleto del top mundial FIP'] },
  { id: 'gijon', name: 'Gijón Premier Padel', cat: 'P2', city: 'Gijón', country: 'España', flag: '🇪🇸', start: '2026-03-01', end: '2026-03-08', url: 'https://www.padelfip.com/es/eventos/gijon-p2-2026/', stars: 3, reasons: ['Primer torneo en España de 2026', 'Público y tradición del pádel asturiano', 'Cuadro con cabeza de serie del tour'] },
  { id: 'cancun', name: 'Cancún Premier Padel', cat: 'P2', city: 'Cancún', country: 'México', flag: '🇲🇽', start: '2026-03-15', end: '2026-03-22', url: 'https://www.padelfip.com/es/eventos/cancun-p2-2026/', stars: 4, reasons: ['Vuelta del tour a México', 'Sede turística con gran proyección internacional', 'Marca destino y cobertura mediática amplia'] },
  { id: 'miami', name: 'Miami Premier Padel', cat: 'P1', city: 'Miami', country: 'Estados Unidos', flag: '🇺🇸', start: '2026-03-22', end: '2026-03-29', url: 'https://www.padelfip.com/es/eventos/miami-p1-2026/', stars: 4, reasons: ['Segunda edición en EE. UU.: mercado clave del pádel', 'P1 con cuadro completo del ranking', 'Cobertura internacional de medios'] },
  { id: 'qatar', name: 'Qatar Major Premier Padel', cat: 'Major', city: 'Doha', country: 'Qatar', flag: '🇶🇦', start: '2026-04-06', end: '2026-04-11', url: 'https://www.padelfip.com/es/eventos/qatar-major-2026/', stars: 5, reasons: ['Major: máximo nivel del circuito', 'Instalaciones de clase mundial', 'Mayores puntos y premios de la temporada'] },
  { id: 'newgiza', name: 'Newgiza Premier Padel', cat: 'P2', city: 'El Giza', country: 'Egipto', flag: '🇪🇬', start: '2026-04-11', end: '2026-04-18', url: 'https://www.padelfip.com/es/eventos/newgiza-p2-2026/', stars: 3, reasons: ['Primera parada en África del año', 'Nueva plaza del tour', 'Difusión del pádel en el norte de África'] },
  { id: 'brussels', name: 'Brussels Premier Padel', cat: 'P2', city: 'Bruselas', country: 'Bélgica', flag: '🇧🇪', start: '2026-04-19', end: '2026-04-26', url: 'https://www.padelfip.com/es/eventos/brussels-p2-2026/', stars: 3, reasons: ['Página europea consolidada del tour', 'Buena asistencia de público', 'Sede central de la UE con proyección'] },
  { id: 'asuncion', name: 'Asunción Premier Padel', cat: 'P2', city: 'Asunción', country: 'Paraguay', flag: '🇵🇾', start: '2026-05-03', end: '2026-05-10', url: 'https://www.padelfip.com/es/eventos/asuncion-p2-2026/', stars: 3, reasons: ['Paraguay, cuna de grandes jugadores del pádel', 'Afición apasionada', 'Torneo consolidado en Sudamérica'] },
  { id: 'buenosaires', name: 'Buenos Aires Premier Padel', cat: 'P1', city: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', start: '2026-05-10', end: '2026-05-17', url: 'https://www.padelfip.com/es/eventos/buenos-aires-p1-2026/', stars: 4, reasons: ['Argentina, templo mundial del pádel', 'P1 con cuadro completo', 'Afición y pasión por el deporte'] },
  { id: 'italy', name: 'Italy Major Premier Padel', cat: 'Major', city: 'Roma', country: 'Italia', flag: '🇮🇹', start: '2026-05-31', end: '2026-06-07', url: 'https://www.padelfip.com/es/eventos/italy-major-2026/', stars: 5, reasons: ['Major: máximo nivel del circuito', 'Foro Itálico: escenario histórico', 'Mejores parejas del mundo en juego'] },
  { id: 'valencia', name: 'Valencia Premier Padel', cat: 'P1', city: 'Valencia', country: 'España', flag: '🇪🇸', start: '2026-06-06', end: '2026-06-14', url: 'https://www.padelfip.com/es/eventos/valencia-p1-2026/', stars: 4, reasons: ['Ciudad con gran tradición del pádel', 'Nueva sede del P1', 'Ambiente y aforo magníficos'] },
  { id: 'valladolid', name: 'Valladolid Premier Padel', cat: 'P2', city: 'Valladolid', country: 'España', flag: '🇪🇸', start: '2026-06-21', end: '2026-06-28', url: 'https://www.padelfip.com/es/eventos/valladolid-p2-2026/', stars: 3, reasons: ['Público castellanoleonés entregado', 'Formato P2 accesible', 'Sede consolidada del tour'] },
  { id: 'bordeaux', name: 'Bordeaux Premier Padel', cat: 'P2', city: 'Burdeos', country: 'Francia', flag: '🇫🇷', start: '2026-06-28', end: '2026-07-05', url: 'https://www.padelfip.com/es/eventos/bordeaux-p2-2026/', stars: 3, reasons: ['Nueva plaza francesa del tour', 'Pádel en crecimiento en Francia', 'Sede con gran ambiente de público'] },
  { id: 'malaga', name: 'Málaga Premier Padel', cat: 'P1', city: 'Málaga', country: 'España', flag: '🇪🇸', start: '2026-07-11', end: '2026-07-19', url: 'https://www.padelfip.com/es/eventos/malaga-p1-2026/', stars: 4, reasons: ['P1 en la Costa del Sol', 'Gran afición andaluza', 'Palacio de Deportes con gran ambiente'] },
  { id: 'pretoria', name: 'Pretoria Premier Padel', cat: 'P1', city: 'Pretoria', country: 'Sudáfrica', flag: '🇿🇦', start: '2026-07-26', end: '2026-08-02', url: 'https://www.padelfip.com/es/eventos/pretoria-p1-2026/', stars: 4, reasons: ['Debut histórico del tour en África', 'Expansión internacional del pádel', 'Nueva sede con proyección'] },
  { id: 'london', name: 'London Premier Padel', cat: 'P1', city: 'Londres', country: 'Reino Unido', flag: '🇬🇧', start: '2026-08-02', end: '2026-08-09', url: 'https://www.padelfip.com/es/eventos/london-p1-2026/', stars: 5, reasons: ['Debut del tour en Reino Unido', 'Capital mundial del deporte y los negocios', 'Cuadro completo del P1'] },
  { id: 'madrid', name: 'Comunidad de Madrid Premier Padel', cat: 'P1', city: 'Madrid', country: 'España', flag: '🇪🇸', start: '2026-08-29', end: '2026-09-06', url: 'https://www.padelfip.com/es/eventos/comunidad-de-madrid-p1-2026/', stars: 4, reasons: ['P1 en la capital del pádel', 'Caja Mágica o WiZink: gran recinto', 'Afición masiva'] },
  { id: 'paris', name: 'Paris Major Premier Padel', cat: 'Major', city: 'París', country: 'Francia', flag: '🇫🇷', start: '2026-09-07', end: '2026-09-13', url: 'https://www.padelfip.com/es/eventos/paris-major-2026/', stars: 5, reasons: ['Major: máximo nivel del circuito', 'Estadio Philippe-Chatrier en Roland-Garros', 'Mejores parejas del mundo'] },
  { id: 'rotterdam', name: 'Rotterdam Premier Padel', cat: 'P2', city: 'Róterdam', country: 'Países Bajos', flag: '🇳🇱', start: '2026-09-28', end: '2026-10-04', url: 'https://www.padelfip.com/es/eventos/rotterdam-p2-2026/', stars: 4, reasons: ['Pádel en pleno auge en Países Bajos', 'Nueva plaza del tour', 'Ahoy Rotterdam: gran infraestructura'] },
  { id: 'germany', name: 'Germany Premier Padel', cat: 'P2', city: 'Düsseldorf', country: 'Alemania', flag: '🇩🇪', start: '2026-10-05', end: '2026-10-11', url: 'https://www.padelfip.com/es/eventos/germany-p2-2026/', stars: 3, reasons: ['Mercado alemán en expansión', 'Pádel indoor de calidad', 'Sede europea del tour'] },
  { id: 'milano', name: 'Milano Premier Padel', cat: 'P1', city: 'Milán', country: 'Italia', flag: '🇮🇹', start: '2026-10-12', end: '2026-10-18', url: 'https://www.padelfip.com/es/eventos/milano-p1-2026/', stars: 4, reasons: ['Moda y estilo del pádel en Milán', 'P1 con cuadro completo', 'Gran afición italiana'] },
  { id: 'kuwait', name: 'Kuwait Major Premier Padel', cat: 'Major', city: 'Kuwait', country: 'Kuwait', flag: '🇰🇼', start: '2026-10-26', end: '2026-10-31', url: 'https://www.padelfip.com/es/eventos/kuwait-major-2026/', stars: 4, reasons: ['Major fuera de la temporada regular europea', 'Infraestructura de primer nivel', 'Máximos puntos del circuito'] },
  { id: 'dubai', name: 'Dubai Premier Padel', cat: 'P1', city: 'Dubái', country: 'EAU', flag: '🇦🇪', start: '2026-11-08', end: '2026-11-15', url: 'https://www.padelfip.com/es/eventos/dubai-p1-2026/', stars: 4, reasons: ['Lujo y espectáculo en Dubái', 'P1 previo al Major de Acapulco', 'Cobertura mediática global'] },
  { id: 'mexico', name: 'Mexico Major Premier Padel', cat: 'Major', city: 'Acapulco', country: 'México', flag: '🇲🇽', start: '2026-11-23', end: '2026-11-29', url: 'https://www.padelfip.com/es/eventos/mexico-major-2026/', stars: 5, reasons: ['Major de cierre de la temporada regular', 'Sede histórica del deporte', 'Máximo nivel del circuito'] },
  { id: 'finals', name: 'Premier Padel Finals', cat: 'Finals', city: 'Barcelona', country: 'España', flag: '🇪🇸', start: '2026-12-10', end: '2026-12-13', url: 'https://www.padelfip.com/es/eventos/premier-padel-finals-2026/', stars: 5, reasons: ['Final de temporada: lo mejor contra lo mejor', 'Ocho mejores parejas del año', 'Definición del maestro del circuito'] },
];

const Stars = ({ n }) => {
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ color: '#fbbf24', letterSpacing: 2, fontSize: 15, lineHeight: 1 }}>
      {'★'.repeat(full)}
      {half ? '⯨' : ''}
      {'☆'.repeat(empty)}
    </span>
  );
};

const statusOf = (t, today) => {
  const s = new Date(t.start + 'T00:00:00');
  const e = new Date(t.end + 'T23:59:59');
  if (today >= s && today <= e) return 'live';
  if (today > e) return 'finished';
  return 'upcoming';
};

export default function TorneoCalendario({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [tab, setTab] = useState('live');
  const [showCriteria, setShowCriteria] = useState(false);
  const today = new Date();

  const { live, upcoming, finished } = useMemo(() => {
    const l = [], u = [], f = [];
    TORNEOS.forEach((t) => {
      const st = statusOf(t, today);
      if (st === 'live') l.push(t);
      else if (st === 'upcoming') u.push(t);
      else f.push(t);
    });
    const byMonth = (list) => list.slice().sort((a, b) => new Date(b.start) - new Date(a.start));
    return { live: byMonth(l), upcoming: byMonth(u), finished: byMonth(f) };
  }, [today]);

  const monthLabel = (isoDate) => {
    const d = new Date(isoDate + 'T00:00:00');
    return `${T.monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };
  const prettyDate = (isoDate) => {
    const d = new Date(isoDate + 'T00:00:00');
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const catColor = (cat) => {
    if (cat === 'Major') return { bg: 'rgba(251,191,36,0.15)', fg: '#fbbf24', border: 'rgba(251,191,36,0.4)' };
    if (cat === 'Finals') return { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6', border: 'rgba(244,114,182,0.4)' };
    if (cat === 'P1') return { bg: 'rgba(52,211,153,0.15)', fg: '#34d399', border: 'rgba(52,211,153,0.4)' };
    return { bg: 'rgba(56,189,248,0.15)', fg: '#38bdf8', border: 'rgba(56,189,248,0.4)' };
  };

  const renderList = (list, emptyMsg) => {
    if (!list.length) {
      return <p style={{ color: 'var(--padel-muted)', fontSize: 14, margin: '24px 0' }}>{emptyMsg}</p>;
    }
    const groups = [];
    let lastMonth = '';
    list.forEach((t) => {
      const m = monthLabel(t.start);
      if (m !== lastMonth) { groups.push({ month: m, items: [] }); lastMonth = m; }
      groups[groups.length - 1].items.push(t);
    });
    return groups.map((g) => (
      <div key={g.month} style={{ marginBottom: 18 }}>
        <h4 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--padel-muted)', marginBottom: 10 }}>
          {g.month}
        </h4>
        <div style={{ display: 'grid', gap: 10 }}>
          {g.items.map((t) => {
            const cc = catColor(t.cat);
            return (
              <a
                key={t.id}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14,
                  background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', textDecoration: 'none',
                  transition: 'border-color 0.2s, transform 0.2s', boxShadow: '0 6px 18px var(--padel-shadow)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = cc.fg; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--padel-border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <span style={{ fontSize: 26, flexShrink: 0 }}>{t.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)' }}>{t.name}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: cc.bg, color: cc.fg, border: `1px solid ${cc.border}` }}>{t.cat}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--padel-muted)' }}>
                    {prettyDate(t.start)} – {prettyDate(t.end)} · {t.city}, {t.country}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: 13 }}>{t.stars}<span style={{ color: 'var(--padel-muted)', fontWeight: 600, fontSize: 11 }}>★</span></div>
                  <div style={{ fontSize: 11, color: 'var(--padel-muted)', marginTop: 2 }}>{T.webOfficial}</div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    ));
  };

  const tabs = [
    { key: 'live', label: `${T.live} (${live.length})`, color: '#ef4444' },
    { key: 'upcoming', label: `${T.upcoming} (${upcoming.length})`, color: '#34d399' },
    { key: 'finished', label: `${T.finished} (${finished.length})`, color: '#38bdf8' },
  ];

  return (
    <section style={{ padding: '72px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 15%, rgba(56,189,248,0.12), transparent 40%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <div style={{ display: 'inline-block', padding: '8px 14px', borderRadius: 999, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#7dd3fc', fontWeight: 800, fontSize: 12, letterSpacing: 1.2, marginBottom: 16 }}>
          {T.badge}
        </div>
        <h2 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.4rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>{T.title}</h2>
        <p style={{ fontSize: 15.5, lineHeight: 1.7, color: '#cbd5e1', maxWidth: 860, marginBottom: 24 }}>{T.subtitle}</p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 18px', borderRadius: 12, border: '1px solid',
                borderColor: tab === t.key ? t.color : 'var(--padel-border)',
                background: tab === t.key ? 'rgba(16,185,129,0.12)' : 'var(--padel-card-bg)',
                color: tab === t.key ? t.color : 'var(--padel-muted)',
                fontWeight: 800, fontSize: 13.5, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <button
            onClick={() => setShowCriteria(!showCriteria)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px dashed rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.06)', color: '#fbbf24', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
          >
            {showCriteria ? T.criteriaClose : T.criteriaOpen}
          </button>
          <span style={{ fontSize: 12, color: 'var(--padel-muted)' }}>{T.note}</span>
        </div>

        {showCriteria && (
          <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 16, padding: '18px 20px', marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24', marginBottom: 10 }}>{T.criteriaTitle}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {T.criteria.map((c, i) => (
                <div key={i} style={{ background: 'rgba(7,18,16,0.5)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--padel-text)' }}>{i + 1}. {c.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--padel-muted)', lineHeight: 1.5, marginTop: 3 }}>{c.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.6 }}>
              <strong style={{ color: '#fbbf24' }}>
                {lang === 'es' ? '⭐ 5★' : lang === 'en' ? '⭐ 5★' : '⭐ 5★'}
              </strong>{' '}
              {lang === 'es' ? 'El número de estrellas que muestra cada torneo resume su nivel global: el grueso del top mundial, los Majors y las Finals alcanzan las máximas; los P1 son torneos premium; los P2, paradas dinámicas del circuito.' : lang === 'en' ? 'The star count shown on each tournament sums up its overall level: the bulk of the world top, Majors and Finals reach the maximum; P1 tournaments are premium; P2 are dynamic circuit stops.' : lang === 'fr' ? 'Le nombre d’étoiles affiché sur chaque tournoi résume son niveau global : le gros du top mondial, les Majors et les Finals atteignent le maximum ; les P1 sont premium ; les P2 sont des étapes dynamiques du circuit.' : 'O número de estrelas exibido em cada torneio resume o seu nível global: o grosso do topo mundial, os Majors e as Finals atingem o máximo; os P1 são premium; os P2 são paragens dinâmicas do circuito.'}
            </div>
          </div>
        )}

        {tab === 'live' && renderList(live, T.noLive)}
        {tab === 'upcoming' && renderList(upcoming, T.noUpcoming)}
        {tab === 'finished' && renderList(finished)}
      </div>
    </section>
  );
}