import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ModeToggle from './ModeToggle';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';

const HeaderPadel = ({ lang = 'es', onLanguageChange }) => {
  const navigate = useNavigate();

  const LANG_LABELS = {
    es: { label: 'Español', tooltip: 'Cambiar a español' },
    en: { label: 'English', tooltip: 'Switch to English' },
    fr: { label: 'Français', tooltip: 'Passer au français' },
    pt: { label: 'Português', tooltip: 'Mudar para português' },
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      background: 'var(--padel-header-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--padel-header-border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          boxShadow: '0 0 15px var(--padel-accent-glow)'
        }}>
          🎾
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--padel-text)', letterSpacing: '-0.5px' }}>
            PADEL<span style={{ color: 'var(--padel-lime)' }}>ORGANIZERS</span>.COM
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--padel-muted)', fontWeight: 600, letterSpacing: '1px' }}>
            COURTMANAGER® AI
          </span>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--padel-muted)' }}>Inicio</Link>
        <Link to="/lanzamiento" style={{ fontSize: '14px', fontWeight: 700, color: '#fb7185' }}>🔥 Lanzamiento</Link>
        <Link to="/demo" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--padel-lime)' }}>Probar Demo</Link>
        <Link to="/dashboard" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--padel-muted)' }}>Dashboard Pistas</Link>
        <Link to="/live" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--padel-muted)' }}>🔵 Live</Link>
        <Link to="/livepro" style={{ fontSize: '14px', fontWeight: 800, color: '#fb7185' }}>📺 LiveScore Pro</Link>
        <Link to="/club" style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>🏟️ Reservar Club</Link>
        <Link to="/analytics" style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>📊 Analíticas</Link>
        <Link to="/league" style={{ fontSize: '14px', fontWeight: 700, color: '#a3e635' }}>🏆 Liga</Link>

        {/* Modo Local ↔ Nube */}
        <ModeToggle lang={lang} />

        {/* Login de jugador */}
        <UserMenu lang={lang} />

        {/* Tema claro/oscuro */}
        <ThemeToggle lang={lang} />

        {/* Multi-idioma */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--padel-hover-bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--padel-border)' }}>
          {['es', 'en', 'fr', 'pt'].map(l => (
            <button
              key={l}
              onClick={() => onLanguageChange && onLanguageChange(l)}
              title={LANG_LABELS[l]?.tooltip || l.toUpperCase()}
              aria-label={LANG_LABELS[l]?.tooltip || l.toUpperCase()}
              style={{
                background: lang === l ? 'var(--padel-emerald)' : 'transparent',
                color: lang === l ? '#fff' : 'var(--padel-muted)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/demo')}
          style={{
            background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          🚀 Demo Gratuita
        </button>
      </nav>
    </header>
  );
};

export default HeaderPadel;
