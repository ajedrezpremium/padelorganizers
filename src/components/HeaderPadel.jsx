import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ModeToggle from './ModeToggle';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';

const NavIcon = ({ name }) => {
  const icons = {
    home: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    rocket: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>,
    scoreboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg>,
    dashboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>,
    live: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2" fill="currentColor" /><path d="M5 5a12.5 12.5 0 0 0 0 14" /><path d="M19 5a12.5 12.5 0 0 1 0 14" /><path d="M8.5 8.5a7.5 7.5 0 0 0 0 7" /><path d="M15.5 8.5a7.5 7.5 0 0 1 0 7" /></svg>,
    club: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    chart: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>,
    trophy: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" /></svg>,
  };
  return icons[name] || icons.home;
};

const HeaderPadel = ({ lang = 'es', onLanguageChange }) => {
  const navigate = useNavigate();

  const TOOLTIPS = {
    es: { home: 'Inicio', launch: 'Lanzamiento y ofertas', demo: 'Probar la demo gratuita', dashboard: 'Dashboard de pistas', live: 'Vista en vivo', livepro: 'LiveScore Pro', club: 'Reservar pista en el club', analytics: 'AnalÃ­ticas del torneo', league: 'Ranked League' },
    en: { home: 'Home', launch: 'Launch & offers', demo: 'Try the free demo', dashboard: 'Courts dashboard', live: 'Live view', livepro: 'LiveScore Pro', club: 'Book a court at the club', analytics: 'Tournament analytics', league: 'Ranked League' },
    fr: { home: 'Accueil', launch: 'Lancement et offres', demo: 'Essayer la dÃ©mo gratuite', dashboard: 'Tableau des pistes', live: 'Vue en direct', livepro: 'LiveScore Pro', club: 'RÃ©server une piste', analytics: 'Analyses du tournoi', league: 'Ligue classÃ©e' },
    pt: { home: 'InÃ­cio', launch: 'LanÃ§amento e ofertas', demo: 'Experimentar a demo grÃ¡tis', dashboard: 'Dashboard de pistas', live: 'Vista ao vivo', livepro: 'LiveScore Pro', club: 'Reservar pista no clube', analytics: 'AnÃ¡lises do torneio', league: 'Liga ranqueada' },
  };

  const t = TOOLTIPS[lang] || TOOLTIPS.es;

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
          ðŸŽ¾
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--padel-text)', letterSpacing: '-0.5px' }}>
            PADEL<span style={{ color: 'var(--padel-lime)' }}>ORGANIZERS</span>.COM
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--padel-muted)', fontWeight: 600, letterSpacing: '1px' }}>
            COURTMANAGERÂ® AI
          </span>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" data-tooltip={t.home} className="nav-ico" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', fontSize: '14px', fontWeight: 600, color: 'var(--padel-muted)', textDecoration: 'none' }}>
          <NavIcon name="home" /> Inicio
        </Link>
        <Link to="/lanzamiento" data-tooltip={t.launch} className="nav-ico" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', fontSize: '14px', fontWeight: 700, color: '#fb7185', textDecoration: 'none' }}>
          <NavIcon name="rocket" /> Lanzamiento
        </Link>
        <Link to="/demo" data-tooltip={t.demo} className="nav-ico" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', fontSize: '14px', fontWeight: 600, color: 'var(--padel-lime)', textDecoration: 'none' }}>
          <NavIcon name="scoreboard" /> Probar Demo
        </Link>
        <Link to="/dashboard" data-tooltip={t.dashboard} className="nav-ico" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', fontSize: '14px', fontWeight: 600, color: 'var(--padel-muted)', textDecoration: 'none' }}>
          <NavIcon name="dashboard" /> Dashboard Pistas
        </Link>
        <Link to="/live" data-tooltip={t.live} className="nav-ico" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', fontSize: '14px', fontWeight: 600, color: 'var(--padel-muted)', textDecoration: 'none' }}>
          <NavIcon name="live" /> Live
        </Link>
        <Link to="/livepro" data-tooltip={t.livepro} className="nav-ico" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', fontSize: '14px', fontWeight: 800, color: '#fb7185', textDecoration: 'none' }}>
          <NavIcon name="scoreboard" /> LiveScore Pro
        </Link>
        <Link to="/club" data-tooltip={t.club} className="nav-ico" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', fontSize: '14px', fontWeight: 700, color: '#fbbf24', textDecoration: 'none' }}>
          <NavIcon name="club" /> Reservar Club
        </Link>
        <Link to="/analytics" data-tooltip={t.analytics} className="nav-ico" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', fontSize: '14px', fontWeight: 700, color: '#38bdf8', textDecoration: 'none' }}>
          <NavIcon name="chart" /> AnalÃ­ticas
        </Link>
        <Link to="/league" data-tooltip={t.league} className="nav-ico" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', fontSize: '14px', fontWeight: 700, color: '#a3e635', textDecoration: 'none' }}>
          <NavIcon name="trophy" /> Liga
        </Link>

        {/* Modo Local â†” Nube */}
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
          ðŸš€ Demo Gratuita
        </button>
      </nav>
    </header>
  );
};

export default HeaderPadel;
