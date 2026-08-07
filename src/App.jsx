import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HeaderPadel from './components/HeaderPadel';
import LandingPadel from './components/LandingPadel';
import PadelDashboard from './components/PadelDashboard';
import PadelScoreBoard from './components/PadelScoreBoard';
import LiveView from './components/LiveView';
import LiveScorePro from './components/LiveScorePro';
import ClubApp from './components/ClubApp';
import AnalyticsBoard from './components/AnalyticsBoard';
import RankedLeague from './components/RankedLeague';
import { useStore } from './services/store';

export default function App() {
  const [lang, setLang] = useState('es');
  const store = useStore();

  return (
    <div style={{ minHeight: '100vh', background: '#071210' }}>
      <HeaderPadel lang={lang} onLanguageChange={setLang} />
      <Routes>
        <Route path="/" element={<LandingPadel lang={lang} />} />
        <Route path="/demo" element={<PadelScoreBoard lang={lang} />} />
        <Route path="/dashboard" element={<PadelDashboard lang={lang} />} />
        <Route path="/live" element={<LiveView lang={lang} />} />
        <Route path="/livepro" element={<LiveScorePro lang={lang} state={store} />} />
        <Route path="/club" element={<ClubApp lang={lang} />} />
        <Route path="/analytics" element={<AnalyticsBoard lang={lang} state={store} />} />
        <Route path="/league" element={<RankedLeague lang={lang} />} />
        <Route path="*" element={<LandingPadel lang={lang} />} />
      </Routes>
    </div>
  );
}