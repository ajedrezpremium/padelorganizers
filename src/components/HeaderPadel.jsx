import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ModeToggle from './ModeToggle';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import LogoPadel from './LogoPadel';

const NavIcon = ({ name, size = 22 }) => {
  const icons = {
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    rocket: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>,
    scoreboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg>,
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>,
    live: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2" fill="currentColor" /><path d="M5 5a12.5 12.5 0 0 0 0 14" /><path d="M19 5a12.5 12.5 0 0 1 0 14" /><path d="M8.5 8.5a7.5 7.5 0 0 0 0 7" /><path d="M15.5 8.5a7.5 7.5 0 0 1 0 7" /></svg>,
    club: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    members: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    control: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h3M7 12h6M7 15h2" /><path d="M17 11.5 15.5 13l-1-1" /><path d="M17 14.5 15.5 16l-1-1" /></svg>,
    match: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="12" r="4.5" /><path d="M7 12 3 7.2l3-4.2L9.4 9" /><circle cx="17" cy="12" r="4.5" /><path d="M17 12l4-4.8-3-4.2L14.6 9" /><path d="M8.5 14.5 5 19m1.5 2L5 19m14.5-4.5L19 19" /></svg>,
    coach: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M13 7l4-3m0 0 1 2m-1-2-1 1" /><path d="M11 7 7 4m0 0 1 2M7 4l-1 1" /></svg>,
    crm: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8l2 2 4-5" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>,
    trophy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" /></svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>,
    shop: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
    raquet: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 18.5 6.5 13A12 12 0 0 1 14.4 3.2h4.4v4.4A12 12 0 0 1 12 18.5z" /><line x1="12" y1="18.5" x2="9.5" y2="21" /><line x1="5.5" y1="14" x2="3.5" y2="16" /><path d="M9 13h.01" /><path d="M12 10h.01" /><path d="M15 7h.01" /></svg>,
  };
  return icons[name] || icons.home;
};

const HeaderPadel = ({ lang = 'es', onLanguageChange }) => {
  const navigate = useNavigate();

const TOOLTIPS = {
    es: { home: 'Inicio', launch: 'Lanzamiento y ofertas', demo: 'Probar la demo gratuita', dashboard: 'Dashboard de pistas', live: 'Vista en vivo', livepro: 'LiveScore Pro', club: 'Reservar pista en el club', tournament: 'Torneo', analytics: 'Analíticas del torneo', league: 'Ranked League', directory: 'Directorio de clubes y escuelas', shop: 'Tienda', members: 'Socios & membresías', control: 'Central de control del torneo', crm: 'CRM · Feed de negocio del club', match: 'Busco cuarto · Matchmaking', coach: 'Escuela & Entrenadores' },
    en: { home: 'Home', launch: 'Launch & offers', demo: 'Try the free demo', dashboard: 'Courts dashboard', live: 'Live view', livepro: 'LiveScore Pro', club: 'Book a court at the club', tournament: 'Tournament', analytics: 'Tournament analytics', league: 'Ranked League', directory: 'Clubs & schools directory', shop: 'Shop', members: 'Members & memberships', control: 'Tournament command center', crm: 'Club CRM · Business feed', match: 'Fourth player · Matchmaking', coach: 'School & Coaches' },
    fr: { home: 'Accueil', launch: 'Lancement et offres', demo: 'Essayer la démo gratuite', dashboard: 'Tableau des pistes', live: 'Vue en direct', livepro: 'LiveScore Pro', club: 'Réserver une piste', tournament: 'Tournoi', analytics: 'Analyses du tournoi', league: 'Ligue classée', directory: 'Annuaire des clubs et écoles', shop: 'Boutique', members: 'Membres & abonnements', control: 'Centre de contrôle du tournoi', crm: 'CRM du club · Flux d\'activité', match: 'Je cherche un 4e · Matchmaking', coach: 'École & Entraîneurs' },
    pt: { home: 'Início', launch: 'Lançamento e ofertas', demo: 'Experimentar a demo grátis', dashboard: 'Dashboard de pistas', live: 'Vista ao vivo', livepro: 'LiveScore Pro', club: 'Reservar pista no clube', tournament: 'Torneio', analytics: 'Análises do torneio', league: 'Liga ranqueada', directory: 'Diretório de clubes e escolas', shop: 'Loja', members: 'Sócios & assinaturas', control: 'Central de controle do torneio', crm: 'CRM do clube · Feed de negócio', match: 'Procuro o 4º · Matchmaking', coach: 'Escola & Treinadores' },
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
      padding: '14px 24px',
      background: 'var(--padel-header-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--padel-header-border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      gap: '16px',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <LogoPadel size={30} tagline="COURTMANAGER® AI" />
      </div>

<nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Link to="/" data-tooltip={t.home} aria-label={t.home} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: 'var(--padel-muted)', textDecoration: 'none' }}>
          <NavIcon name="home" />
        </Link>
        <Link to="/torneo" data-tooltip={t.tournament} aria-label={t.tournament} className="nav-ico" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
          textDecoration: 'none',
        }}>
          <NavIcon name="raquet" size={20} />
        </Link>
        <Link to="/lanzamiento" data-tooltip={t.launch} aria-label={t.launch} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#fb7185', textDecoration: 'none' }}>
          <NavIcon name="rocket" />
        </Link>
        <Link to="/dashboard" data-tooltip={t.dashboard} aria-label={t.dashboard} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#10b981', textDecoration: 'none' }}>
          <NavIcon name="dashboard" />
        </Link>
        <Link to="/club" data-tooltip={t.club} aria-label={t.club} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#10b981', textDecoration: 'none' }}>
          <NavIcon name="club" />
        </Link>
        <Link to="/socios" data-tooltip={t.members} aria-label={t.members} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#10b981', textDecoration: 'none' }}>
          <NavIcon name="members" />
        </Link>
        <Link to="/crm" data-tooltip={t.crm} aria-label={t.crm} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#2dd4bf', textDecoration: 'none' }}>
          <NavIcon name="crm" />
        </Link>
        <Link to="/match" data-tooltip={t.match} aria-label={t.match} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#f472b6', textDecoration: 'none' }}>
          <NavIcon name="match" />
        </Link>
        <Link to="/escuela" data-tooltip={t.coach} aria-label={t.coach} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#34d399', textDecoration: 'none' }}>
          <NavIcon name="coach" />
        </Link>
        <Link to="/control" data-tooltip={t.control} aria-label={t.control} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#fbbf24', textDecoration: 'none' }}>
          <NavIcon name="control" />
        </Link>
        <Link to="/analytics" data-tooltip={t.analytics} aria-label={t.analytics} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#38bdf8', textDecoration: 'none' }}>
          <NavIcon name="chart" />
        </Link>
        <Link to="/livepro" data-tooltip={t.livepro} aria-label={t.livepro} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#fb7185', textDecoration: 'none' }}>
          <NavIcon name="scoreboard" />
        </Link>
        <Link to="/live" data-tooltip={t.live} aria-label={t.live} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: 'var(--padel-muted)', textDecoration: 'none' }}>
          <NavIcon name="live" />
        </Link>
        <Link to="/league" data-tooltip={t.league} aria-label={t.league} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#a3e635', textDecoration: 'none' }}>
          <NavIcon name="trophy" />
        </Link>
        <Link to="/clubes" data-tooltip={t.directory} aria-label={t.directory} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#2dd4bf', textDecoration: 'none' }}>
          <NavIcon name="map" />
        </Link>
        <Link to="/tienda" data-tooltip={t.shop} aria-label={t.shop} className="nav-ico" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', color: '#fbbf24', textDecoration: 'none' }}>
          <NavIcon name="shop" />
        </Link>
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

        </nav>
    </header>
  );
};

export default HeaderPadel;
