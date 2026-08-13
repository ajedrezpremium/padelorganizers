import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HeaderPadel from './components/HeaderPadel';
import PadelAIAgent from './components/PadelAIAgent';
import LandingPadel from './components/LandingPadel';
import LaunchPage from './components/LandingPro';
import PadelDashboard from './components/PadelDashboard';
import PadelScoreBoard from './components/PadelScoreBoard';
import LiveView from './components/LiveView';
import LiveScorePro from './components/LiveScorePro';
import ClubApp from './components/ClubApp';
import MembersApp from './components/MembersApp';
import MemberPortal from './components/MemberPortal';
import StudentPortal from './components/StudentPortal';
import MarketingApp from './components/MarketingApp';
import CommunityApp from './components/CommunityApp';
import ClubCrm from './components/ClubCrm';
import UserProfile from './components/UserProfile';
import MatchmakingApp from './components/MatchmakingApp';
import SchoolApp from './components/SchoolApp';
import AnalyticsBoard from './components/AnalyticsBoard';
import TournamentControl from './components/TournamentControl';
import RankedLeague from './components/RankedLeague';
import TorneoOrganizer from './components/TorneoOrganizer';
import TorneoCalendario from './components/TorneoCalendario';
import TournamentPublic from './components/TournamentPublic';
import PlayerPublic from './components/PlayerPublic';
import FederationsAlliance from './components/FederationsAlliance';
import NewsletterPublic from './components/NewsletterPublic';
import ClubesDirectory from './components/ClubesDirectory';
import VerificarFicha from './components/VerificarFicha';
import AltaClub from './components/AltaClub';
import Tienda from './components/Tienda';
import LegalNotice from './components/LegalNotice';
import CookieBanner from './components/CookieBanner';
import { useStore } from './services/store';

export default function App() {
  const [lang, setLang] = useState('es');
  const store = useStore();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--padel-bg)' }}>
      <HeaderPadel lang={lang} onLanguageChange={setLang} />
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
        <Route path="/control" element={<TournamentControl lang={lang} />} />
        <Route path="/analytics" element={<AnalyticsBoard lang={lang} state={store} />} />
        <Route path="/league" element={<RankedLeague lang={lang} />} />
        <Route path="/clubes" element={<ClubesDirectory lang={lang} />} />
        <Route path="/clubes/alta" element={<AltaClub lang={lang} />} />
        <Route path="/tienda" element={<Tienda lang={lang} />} />
        <Route path="/verificar" element={<VerificarFicha lang={lang} />} />
        <Route path="/legal" element={<LegalNotice lang={lang} />} />
        <Route path="*" element={<LandingPadel lang={lang} />} />
      </Routes>
      <CookieBanner lang={lang} />
      <PadelAIAgent lang={lang} />
    </div>
  );
}
