import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoPadel from './LogoPadel';
import PadelAIAgent from './PadelAIAgent';
import DemoLeadModal from './DemoLeadModal';

import { LANDING_I18N } from './landing/landingI18n';
import {
  UrgentBar,
  HeroSection,
  StatsSection,
  AppShowcaseSection,
} from './landing/LandingCore';
import {
  SocialProofSection,
  FeaturesSection,
} from './landing/LandingSecondBlock';
import {
  RoiSection,
  EcosystemSection,
  AudienceSection,
  ComparisonSection,
  PricingSection,
} from './landing/LandingConversion';
import {
  CtaFinalSection,
  LandingFooter,
} from './landing/LandingClosing';

export default function LandingPadel({ lang = 'es' }) {
  const T = LANDING_I18N[lang] || LANDING_I18N.es;
  const navigate = useNavigate();
  const [roi, setRoi] = useState({ courts: 6, events: 4, price: 15 });
  const [leadOpen, setLeadOpen] = useState(false);

  const heroVariant = (() => {
    try {
      const p = new URLSearchParams(window.location.search).get('hero');
      if (p === 'b') return 'b';
      const v = localStorage.getItem('padel-hero-variant');
      if (v) return v;
      const r = Math.random() < 0.5 ? 'a' : 'b';
      localStorage.setItem('padel-hero-variant', r);
      return r;
    } catch {
      return 'a';
    }
  })();

  const roiTotal = Math.round(
    (roi.events * 4 * 20) +
    (roi.courts * 12 * roi.price * 0.08) +
    (roi.events * roi.courts * 6)
  );

  const openDemo = () => setLeadOpen(true);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--padel-bg)', color: 'var(--padel-text)' }}>
      <UrgentBar />
      <HeroSection T={T} heroVariant={heroVariant} onDemo={openDemo} />
      <StatsSection T={T} />
      <AppShowcaseSection T={T} />
      <SocialProofSection T={T} />
      <FeaturesSection T={T} />
      <RoiSection T={T} roi={roi} setRoi={setRoi} roiTotal={roiTotal} onDemo={openDemo} />
      <EcosystemSection T={T} />
      <AudienceSection T={T} />
      <ComparisonSection T={T} />
      <PricingSection
        T={T}
        onBuyPro={() => navigate('/lanzamiento')}
        onBuyClub={() => navigate('/club')}
        onBuyFree={() => navigate('/torneo/crear')}
      />
      <CtaFinalSection T={T} onDemo={openDemo} />
      <LandingFooter T={T} lang={lang} />

      <PadelAIAgent lang={lang} />
      {leadOpen && (
        <DemoLeadModal
          lang={lang}
          onClose={() => setLeadOpen(false)}
          onSkip={() => { setLeadOpen(false); navigate('/torneo'); }}
        />
      )}
    </div>
  );
}
