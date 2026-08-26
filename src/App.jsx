import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HeaderPadel from './components/HeaderPadel';
import LandingPadel from './components/LandingPadel';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { useStore } from './services/store';

const TITLES = {
  es: { default: 'PADELORGANIZERS.COM — La Plataforma Pro de Torneos de Pádel', demo: 'Demo — Marcador en vivo', clubes: 'Directorio de Clubes de Pádel', torneo: 'Organiza un torneo', club: 'Reservas de pista', escuela: 'Escuela de pádel', ranking: 'Ranking ELO', tienda: 'Tienda del circuito', lanzamiento: 'Ofertas de lanzamiento', legal: 'Aviso legal', crm: 'CRM del club', panel: 'Panel del dueño', marketing: 'Marketing y planes', comunidad: 'Comunidad', socios: 'Socios y membresías', perfil: 'Mi perfil', match: 'Busco cuarto', calendario: 'Calendario del circuito', league: 'Ranked League', coaches: 'Entrenadores', posts: 'Crónicas IA', control: 'Central de control', analytics: 'Analíticas', alianza: 'Alianza con federaciones', newsletters: 'Newsletters', market: 'Marketplace', iot: 'Luz QR · IoT', importar: 'Importar jugadores', dashboard: 'Dashboard pistas', live: 'Vista en vivo', livepro: 'LiveScore Pro', socio: 'Mi carné', alumno: 'Mi progreso', sponsors: 'Patrocinadores' },
  en: { default: 'PADELORGANIZERS — The Pro Padel Tournament Platform', demo: 'Demo — Live scoreboard', clubes: 'Padel Club Directory', torneo: 'Organize a tournament', club: 'Court bookings', escuela: 'Padel school', ranking: 'ELO ranking', tienda: 'Circuit shop', lanzamiento: 'Launch offers', legal: 'Legal notice', crm: 'Club CRM', panel: 'Owner dashboard', marketing: 'Marketing & plans', comunidad: 'Community', socios: 'Memberships', perfil: 'My profile', match: 'Looking for a fourth', calendario: 'Circuit calendar', league: 'Ranked League', coaches: 'Coaches', posts: 'AI reports', control: 'Tournament control', analytics: 'Analytics', alianza: 'Federation alliance', newsletters: 'Newsletters', market: 'Marketplace', iot: 'QR Light · IoT', importar: 'Import players', dashboard: 'Courts dashboard', live: 'Live view', livepro: 'LiveScore Pro', socio: 'My card', alumno: 'My progress', sponsors: 'Sponsors' },
  fr: { default: 'PADELORGANIZERS — La plateforme pro des tournois de padel', demo: 'Démo — Tableau de bord en direct', clubes: 'Annuaire des clubs de padel', torneo: 'Organiser un tournoi', club: 'Réservations de pistes', escuela: 'École de padel', ranking: 'Classement ELO', tienda: 'Boutique du circuit', lanzamiento: 'Offres de lancement', legal: 'Mentions légales', crm: 'CRM du club', panel: 'Tableau de bord propriétaire', marketing: 'Marketing & forfaits', comunidad: 'Communauté', socios: 'Membres', perfil: 'Mon profil', match: 'Cherche un quatrième', calendario: 'Calendrier du circuit', league: 'Ranked League', coaches: 'Entraîneurs', posts: 'Reportages IA', control: 'Contrôle du tournoi', analytics: 'Analytiques', alianza: 'Alliance des fédérations', newsletters: 'Newsletters', market: 'Marketplace', iot: 'Lumière QR · IoT', importar: 'Importer des joueurs', dashboard: 'Tableau des pistes', live: 'Vue en direct', livepro: 'LiveScore Pro', socio: 'Ma carte', alumno: 'Ma progression', sponsors: 'Sponsors' },
  pt: { default: 'PADELORGANIZERS — A plataforma pro de torneios de padel', demo: 'Demo — Quadro em direto', clubes: 'Diretório de Clubes de Padel', torneo: 'Organize um torneio', club: 'Reservas de pistas', escuela: 'Escola de padel', ranking: 'Ranking ELO', tienda: 'Loja do circuito', lanzamiento: 'Ofertas de lançamento', legal: 'Aviso legal', crm: 'CRM do clube', panel: 'Painel do dono', marketing: 'Marketing e planos', comunidad: 'Comunidade', socios: 'Associados', perfil: 'Meu perfil', match: 'Procuro quarto', calendario: 'Calendário do circuito', league: 'Ranked League', coaches: 'Treinadores', posts: 'Crónicas IA', control: 'Central de controlo', analytics: 'Analíticas', alianza: 'Aliança com federações', newsletters: 'Newsletters', market: 'Marketplace', iot: 'Luz QR · IoT', importar: 'Importar jogadores', dashboard: 'Painel de pistas', live: 'Vista em direto', livepro: 'LiveScore Pro', socio: 'Meu cartão', alumno: 'Meu progresso', sponsors: 'Patrocinadores' },
};

const ROUTE_KEY = {
  '/demo': 'demo', '/clubes': 'clubes', '/torneo': 'torneo', '/calendario': 'calendario',
  '/club': 'club', '/escuela': 'escuela', '/ranking': 'ranking', '/tienda': 'tienda',
  '/lanzamiento': 'lanzamiento', '/legal': 'legal', '/crm': 'crm', '/panel': 'panel',
  '/marketing': 'marketing', '/comunidad': 'comunidad', '/socios': 'socios',
  '/perfil': 'perfil', '/match': 'match', '/league': 'league', '/coaches': 'coaches',
  '/posts': 'posts', '/control': 'control', '/analytics': 'analytics',
  '/alianza': 'alianza', '/newsletters': 'newsletters', '/market': 'market',
  '/iot': 'iot', '/importar': 'importar', '/dashboard': 'dashboard',
  '/live': 'live', '/livepro': 'livepro', '/socio': 'socio', '/alumno': 'alumno',
  '/sponsors': 'sponsors',
};

function usePageTitle(lang) {
  const location = useLocation();
  useEffect(() => {
    const map = TITLES[lang] || TITLES.es;
    const key = ROUTE_KEY[location.pathname] || 'default';
    document.title = map[key] || map.default;
  }, [location.pathname, lang]);
}

// Widgets no críticos: se descargan cuando el resto ya está pintado.
const PadelAIAgent = lazy(() => import('./components/PadelAIAgent'));
const CookieBanner = lazy(() => import('./components/CookieBanner'));

// Lazy loading por ruta: cada página se descarga solo cuando se visita.
const LaunchPage = lazy(() => import('./components/LandingPro'));
const PadelDashboard = lazy(() => import('./components/PadelDashboard'));
const PadelScoreBoard = lazy(() => import('./components/PadelScoreBoard'));
const LiveView = lazy(() => import('./components/LiveView'));
const LiveScorePro = lazy(() => import('./components/LiveScorePro'));
const ClubApp = lazy(() => import('./components/ClubApp'));
const MembersApp = lazy(() => import('./components/MembersApp'));
const MemberPortal = lazy(() => import('./components/MemberPortal'));
const StudentPortal = lazy(() => import('./components/StudentPortal'));
const MarketingApp = lazy(() => import('./components/MarketingApp'));
const CommunityApp = lazy(() => import('./components/CommunityApp'));
const ClubCrm = lazy(() => import('./components/ClubCrm'));
const OwnerDashboard = lazy(() => import('./components/OwnerDashboard'));
const IotAccess = lazy(() => import('./components/IotAccess'));
const QrLight = lazy(() => import('./components/QrLight'));
const SponsorsManager = lazy(() => import('./components/SponsorsManager'));
const PlayerImporter = lazy(() => import('./components/PlayerImporter'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const MatchmakingApp = lazy(() => import('./components/MatchmakingApp'));
const SchoolApp = lazy(() => import('./components/SchoolApp'));
const AnalyticsBoard = lazy(() => import('./components/AnalyticsBoard'));
const TournamentControl = lazy(() => import('./components/TournamentControl'));
const RankedLeague = lazy(() => import('./components/RankedLeague'));
const GlobalRanking = lazy(() => import('./components/GlobalRanking'));
const CoachDiscovery = lazy(() => import('./components/CoachDiscovery'));
const TorneoOrganizer = lazy(() => import('./components/TorneoOrganizer'));
const TorneoCalendario = lazy(() => import('./components/TorneoCalendario'));
const TournamentPublic = lazy(() => import('./components/TournamentPublic'));
const PlayerPublic = lazy(() => import('./components/PlayerPublic'));
const FederationsAlliance = lazy(() => import('./components/FederationsAlliance'));
const NewsletterPublic = lazy(() => import('./components/NewsletterPublic'));
const NewsletterStudio = lazy(() => import('./components/NewsletterStudio'));
const SubscribersPanel = lazy(() => import('./components/SubscribersPanel'));
const ClubesDirectory = lazy(() => import('./components/ClubesDirectory'));
const MarketplaceApp = lazy(() => import('./components/MarketplaceApp'));
const VerificarFicha = lazy(() => import('./components/VerificarFicha'));
const AltaClub = lazy(() => import('./components/AltaClub'));
const Tienda = lazy(() => import('./components/Tienda'));
const PostsApp = lazy(() => import('./components/PostsApp'));
const LegalNotice = lazy(() => import('./components/LegalNotice'));

const fallbackStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  color: 'var(--padel-muted)',
  fontSize: 14,
  letterSpacing: '.5px',
};

function PageFallback() {
  return <div style={fallbackStyle}>Cargando…</div>;
}

export default function App() {
  const [lang, setLang] = useState(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('lang');
      if (['es', 'en', 'fr', 'pt'].includes(fromUrl)) return fromUrl;
      const saved = localStorage.getItem('padelorganizers_lang');
      if (['es', 'en', 'fr', 'pt'].includes(saved)) return saved;
    } catch (e) { /* noop */ }
    return 'es';
  });
  const store = useStore();

  useEffect(() => {
    try { localStorage.setItem('padelorganizers_lang', lang); } catch (e) { /* noop */ }
    document.documentElement.lang = lang;
  }, [lang]);

  usePageTitle(lang);

  const handleLanguageChange = useCallback((next) => {
    if (['es', 'en', 'fr', 'pt'].includes(next)) setLang(next);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--padel-bg)' }}>
      <HeaderPadel lang={lang} onLanguageChange={handleLanguageChange} />
      <ErrorBoundary lang={lang}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
          <Route path="/" element={<LandingPadel lang={lang} />} />
          <Route path="/lanzamiento" element={<LaunchPage lang={lang} />} />
          <Route path="/demo" element={<PadelScoreBoard lang={lang} />} />
          <Route path="/dashboard" element={<PadelDashboard lang={lang} />} />
          <Route path="/live" element={<LiveView lang={lang} />} />
          <Route path="/livepro" element={<LiveScorePro lang={lang} state={store} />} />
          <Route path="/club" element={<ClubApp lang={lang} />} />
          <Route path="/socios" element={<MembersApp lang={lang} />} />
          <Route path="/crm" element={<ClubCrm lang={lang} />} />
          <Route path="/panel" element={<OwnerDashboard lang={lang} />} />
          <Route path="/iot" element={<IotAccess lang={lang} />} />
          <Route path="/luces" element={<QrLight lang={lang} />} />
          <Route path="/sponsors" element={<SponsorsManager lang={lang} />} />
          <Route path="/importar" element={<PlayerImporter lang={lang} />} />
          <Route path="/perfil" element={<UserProfile lang={lang} />} />
          <Route path="/match" element={<MatchmakingApp lang={lang} />} />
          <Route path="/socio" element={<MemberPortal lang={lang} />} />
          <Route path="/alumno" element={<StudentPortal lang={lang} />} />
          <Route path="/marketing" element={<MarketingApp lang={lang} />} />
          <Route path="/comunidad" element={<CommunityApp lang={lang} />} />
          <Route path="/escuela" element={<SchoolApp lang={lang} />} />
          <Route path="/torneo" element={<TorneoOrganizer lang={lang} />} />
          <Route path="/calendario" element={<TorneoCalendario lang={lang} />} />
          <Route path="/tournament/:id" element={<TournamentPublic lang={lang} />} />
          <Route path="/player/:name" element={<PlayerPublic lang={lang} />} />
          <Route path="/alianza" element={<FederationsAlliance lang={lang} />} />
          <Route path="/newsletters" element={<NewsletterPublic lang={lang} />} />
          <Route path="/newsletters/studio" element={<NewsletterStudio lang={lang} />} />
          <Route path="/newsletters/suscripciones" element={<SubscribersPanel lang={lang} />} />
          <Route path="/control" element={<TournamentControl lang={lang} />} />
          <Route path="/analytics" element={<AnalyticsBoard lang={lang} state={store} />} />
          <Route path="/league" element={<RankedLeague lang={lang} />} />
          <Route path="/ranking" element={<GlobalRanking lang={lang} />} />
          <Route path="/coaches" element={<CoachDiscovery lang={lang} />} />
          <Route path="/clubes" element={<ClubesDirectory lang={lang} />} />
          <Route path="/clubes/alta" element={<AltaClub lang={lang} />} />
          <Route path="/market" element={<MarketplaceApp lang={lang} />} />
          <Route path="/posts" element={<PostsApp lang={lang} />} />
          <Route path="/tienda" element={<Tienda lang={lang} />} />
          <Route path="/verificar" element={<VerificarFicha lang={lang} />} />
          <Route path="/legal" element={<LegalNotice lang={lang} />} />
          <Route path="*" element={<LandingPadel lang={lang} />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Suspense fallback={null}>
        <ErrorBoundary lang={lang}>
          <CookieBanner lang={lang} />
          <PadelAIAgent lang={lang} />
        </ErrorBoundary>
      </Suspense>
      <PWAInstallPrompt lang={lang} />
    </div>
  );
}