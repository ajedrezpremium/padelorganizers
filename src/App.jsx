import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import HeaderPadel from './components/HeaderPadel';
import PadelAIAgent from './components/PadelAIAgent';
import LandingPadel from './components/LandingPadel';
import { useStore } from './services/store';

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
const CookieBanner = lazy(() => import('./components/CookieBanner'));

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

  const handleLanguageChange = useCallback((next) => {
    if (['es', 'en', 'fr', 'pt'].includes(next)) setLang(next);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--padel-bg)' }}>
      <HeaderPadel lang={lang} onLanguageChange={handleLanguageChange} />
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
      <CookieBanner lang={lang} />
      <PadelAIAgent lang={lang} />
    </div>
  );
}