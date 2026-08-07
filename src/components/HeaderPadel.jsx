import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ModeToggle from './ModeToggle';
import UserMenu from './UserMenu';

const HeaderPadel = ({ lang = 'es', onLanguageChange }) => {
  const navigate = useNavigate();

  return (
    <header style={{
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      background: 'rgba(7, 18, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          boxShadow: '0 0 15px rgba(132, 204, 22, 0.4)'
        }}>
          🎾
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>
            PADEL<span style={{ color: '#84cc16' }}>ORGANIZERS</span>.COM
          </h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '1px' }}>
            COURTMANAGER® AI
          </span>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Inicio</Link>
        <Link to="/demo" style={{ fontSize: '14px', fontWeight: 600, color: '#84cc16' }}>Probar Demo</Link>
        <Link to="/dashboard" style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Dashboard Pistas</Link>
        <Link to="/live" style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>🔵 Live</Link>

        {/* Modo Local ↔ Nube */}
        <ModeToggle lang={lang} />

        {/* Login de jugador */}
        <UserMenu lang={lang} />

        {/* Multi-idioma */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          {['es', 'en', 'fr', 'pt'].map(l => (
            <button
              key={l}
              onClick={() => onLanguageChange && onLanguageChange(l)}
              style={{
                background: lang === l ? '#10b981' : 'transparent',
                color: lang === l ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/demo')}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
