import React from 'react';

/**
 * landing/LandingCore.jsx — bloques del top de LandingPadel:
 *   barra de urgencia, hero, stats y showcase de la app.
 */

export const FeatureIcon = ({ name, size = 28, color = 'var(--padel-lime)' }) => {
  const icons = {
    court: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <circle cx="7" cy="7" r="2" fill={color} />
        <circle cx="17" cy="17" r="2" fill={color} />
      </svg>
    ),
    scoreboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="12" y2="16" />
        <path d="M12 4v4M12 20v-4" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    ),
    engine: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v4M12 16v4M4 12h4M16 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" fill={color} />
      </svg>
    ),
    analytics: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <path d="M18 20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
      </svg>
    ),
    lang: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    cloud: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        <polyline points="16 14 12 18 8 14" />
      </svg>
    ),
  };
  return icons[name] || icons.court;
};

export const UrgentBar = () => {
  const urgencyLeft = Math.max(3, 20 - (new Date().getDate() % 13) - 3);
  const urgencyDays = Math.max(2, 7 - (new Date().getDate() % 5));
  return (
    <div style={{ background: 'linear-gradient(90deg,#f59e0b,#ef4444)', color: '#fff', textAlign: 'center', padding: '8px 12px', fontSize: 13, fontWeight: 800, letterSpacing: 0.3 }}>
      🔥 Oferta fundadores — 20 plazas Pro gratis 90 días — quedan {urgencyLeft} — termina en {urgencyDays} días → <a href="/lanzamiento" style={{ color: '#fff', textDecoration: 'underline' }}>Activar ahora</a>
    </div>
  );
};

export const HeroSection = ({ T, heroVariant = 'a', onDemo }) => (
  <section className="padel-landing-hero" style={{ position: 'relative', padding: '28px 0 48px', minHeight: 'calc(100vh - 92px)', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(132,204,22,0.12), transparent 40%)' }} />
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <span style={{ display: 'inline-block', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: 'var(--padel-lime)', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '12px', letterSpacing: '1.5px' }}>
        {T.badge}
      </span>
      <h1 style={{ fontSize: '56px', lineHeight: 1.05, fontWeight: 900, color: 'var(--padel-text)', margin: '14px 0 12px', letterSpacing: '-1.5px', maxWidth: '760px' }}>
        {heroVariant === 'b' ? 'Tu club, en piloto automático' : T.title1}
        <br />
        <span style={{ background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-lime) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{heroVariant === 'b' ? 'menos Excel, más pádel' : T.title2}</span>
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--padel-muted)', maxWidth: '700px', lineHeight: 1.7, marginBottom: '22px' }}>{T.subtitle}</p>
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '14px' }}>
        <button onClick={onDemo} className="pulse-glow" style={{ background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
          {T.ctaDemoStrong}
        </button>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--padel-muted)', marginTop: '10px', fontWeight: 600 }}>{T.ctaDemoSub}</p>
    </div>
  </section>
);

export const StatsSection = ({ T }) => (
  <section style={{ borderTop: '1px solid var(--padel-border)', borderBottom: '1px solid var(--padel-border)', background: 'var(--padel-card-bg)' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', paddingTop: '40px', paddingBottom: '40px' }}>
      {T.stats.map(([num, label], i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', fontWeight: 900, color: 'var(--padel-lime)' }}>{num}</div>
          <div style={{ fontSize: '13px', color: 'var(--padel-muted)', fontWeight: 600 }}>{label}</div>
        </div>
      ))}
    </div>
  </section>
);

export const AppShowcaseSection = ({ T }) => (
  <section style={{ padding: '56px 0 70px' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ display: 'inline-block', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--padel-lime)', padding: '5px 12px', borderRadius: '16px', fontWeight: 700, fontSize: '11px', letterSpacing: '1px' }}>👁️ {T.showBadge}</span>
        <h2 style={{ fontSize: '30px', fontWeight: 900, color: 'var(--padel-text)', margin: '16px 0 6px' }}>{T.showTitle}</h2>
        <p style={{ fontSize: '15px', color: 'var(--padel-muted)', maxWidth: '560px', margin: '0 auto' }}>{T.showDesc}</p>
      </div>
      <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', maxWidth: '980px', margin: '0 auto' }}>
        <img src="/images/padelorganizers.com.png" alt="PADELORGANIZERS.COM" style={{ width: '100%', display: 'block' }} loading="lazy" />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  </section>
);
