import React from 'react';

// Logo PADEL ORGANIZERS: pala dorada minimalista + wordmark blanco/dorado.
export const GOLD = '#eab308';
export const GOLD_LIGHT = '#fde047';
export const GOLD_DARK = '#a16207';

const PaddleIcon = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="paddleGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={GOLD_LIGHT} />
        <stop offset="50%" stopColor={GOLD} />
        <stop offset="100%" stopColor={GOLD_DARK} />
      </linearGradient>
    </defs>
    {/* Paleta / cara de la pala */}
    <path
      d="M32 13c10.5 0 19 7.6 19 17.6 0 14.4-8 23.4-19 28.4-11-5-19-14-19-28.4C13 20.6 21.5 13 32 13z"
      fill="url(#paddleGold)"
    />
    {/* Agujeros de la cara */}
    <circle cx="23" cy="22" r="2" fill="rgba(0,0,0,0.18)" />
    <circle cx="30" cy="19" r="2" fill="rgba(0,0,0,0.18)" />
    <circle cx="37" cy="22" r="2" fill="rgba(0,0,0,0.18)" />
    <circle cx="26" cy="28" r="2" fill="rgba(0,0,0,0.18)" />
    <circle cx="33" cy="28" r="2" fill="rgba(0,0,0,0.18)" />
    <circle cx="40" cy="28" r="2" fill="rgba(0,0,0,0.18)" />
    {/* Cuerpo / mango */}
    <rect x="29.4" y="44" width="5.2" height="12" rx="2.2" fill={`url(#paddleGold)`} />
  </svg>
);

const LogoPadel = ({ size = 30, tagline = 'COURTMANAGER® AI', compact = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{
      width: size + 12,
      height: size + 12,
      borderRadius: '14px',
      background: 'linear-gradient(135deg, rgba(250,204,21,0.14), rgba(161,98,7,0.22))',
      border: '1px solid rgba(250,204,21,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 18px rgba(250,204,21,0.25)',
    }}>
      <PaddleIcon size={size} />
    </div>
    {!compact && (
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--padel-text)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          PADEL <span style={{ background: `linear-gradient(100deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ORGANIZERS</span>
        </div>
        <div style={{ fontSize: 10, color: GOLD_LIGHT, fontWeight: 700, letterSpacing: '1.4px', marginTop: 2, opacity: 0.9 }}>
          {tagline}
        </div>
      </div>
    )}
  </div>
);

export default LogoPadel;