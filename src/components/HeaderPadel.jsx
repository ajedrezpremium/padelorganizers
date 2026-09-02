import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ModeToggle from './ModeToggle';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import LogoPadel from './LogoPadel';
import { useAuth } from '../hooks/useAuth';

const NavIcon = ({ name, size = 22 }) => {
  const icons = {
    raquet: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 18.5 6.5 13A12 12 0 0 1 14.4 3.2h4.4v4.4A12 12 0 0 1 12 18.5z" /><line x1="12" y1="18.5" x2="9.5" y2="21" /><line x1="5.5" y1="14" x2="3.5" y2="16" /><path d="M9 13h.01" /><path d="M12 10h.01" /><path d="M15 7h.01" /></svg>,
    club: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    coach: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M13 7l4-3m0 0 1 2m-1-2-1 1" /><path d="M11 7 7 4m0 0 1 2M7 4l-1 1" /></svg>,
    crm: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8l2 2 4-5" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></svg>,
    marketing: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" /><path d="M15 9.5a4 4 0 0 1 0 5" /><path d="M18 7a8 8 0 0 1 0 10" /></svg>,
    community: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
    shop: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>,
    trophy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" /></svg>,
    rocket: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>,
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>,
    livepro: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg>,
    control: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h3M7 12h6M7 15h2" /><path d="M17 11.5 15.5 13l-1-1" /><path d="M17 14.5 15.5 16l-1-1" /></svg>,
    charts: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>,
    members: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    match: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="12" r="4.5" /><path d="M7 12 3 7.2l3-4.2L9.4 9" /><circle cx="17" cy="12" r="4.5" /><path d="M17 12l4-4.8-3-4.2L14.6 9" /><path d="M8.5 14.5 5 19m1.5 2L5 19m14.5-4.5L19 19" /></svg>,
    live: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2" fill="currentColor" /><path d="M5 5a12.5 12.5 0 0 0 0 14" /><path d="M19 5a12.5 12.5 0 0 1 0 14" /><path d="M8.5 8.5a7.5 7.5 0 0 0 0 7" /><path d="M15.5 8.5a7.5 7.5 0 0 1 0 7" /></svg>,
    membercard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /><path d="M6 15h4" /><path d="M14 15h4" /></svg>,
    student: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 9 12 4 2 9l10 5 10-5z" /><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" /><path d="M22 9v6" /></svg>,
  };
  return icons[name] || icons.raquet;
};

// Dropdown al hover: icono + menú con sub-servicios
const NavDrop = ({ tooltip, to, icon, color, children = [], active, highlight = false }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => navigate(to)}
        data-tooltip={tooltip}
        aria-label={tooltip}
        className="nav-ico"
        style={
          highlight
            ? { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, border: 'none', padding: 0, color: '#fff', background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)', cursor: 'pointer' }
            : { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, border: 'none', background: active ? 'rgba(16,185,129,0.18)' : 'transparent', color, padding: 0, cursor: 'pointer' }
        }
      >
        <NavIcon name={icon} />
      </button>
      {open && children.length > 0 && (
        <div style={{
          position: 'absolute', top: 44, left: 0, zIndex: 1200, background: 'var(--padel-card-bg)',
          border: '1px solid var(--padel-border)', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
          padding: '6px', minWidth: 200, display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {children.map(([label, href]) => (
            <Link key={href} to={href} style={{ padding: '9px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: 'var(--padel-text)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const HeaderPadel = ({ lang = 'es', onLanguageChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [role, setRole] = useState(null);

  const TOOLTIPS = {
    es: { tournaments: 'Torneos & eventos', calendar: 'Calendario del circuito', club: 'Club & reservas', school: 'Escuela & entrenadores', crm: 'CRM · Gestión de negocio', marketing: 'Marketing · Planes, campañas y newsletter', community: 'Comunidad · Tablón, chat y grupos', shop: 'Tienda', directory: 'Directorio de clubes y escuelas', league: 'Ranked League', launch: 'Lanzamiento y ofertas', dashboard: 'Dashboard pistas', livepro: 'LiveScore Pro', live: 'Vista en vivo', control: 'Central de control', analytics: 'Analíticas', match: 'Busco cuarto', members: 'Socios & membresías', membercard: 'Mi carné de socio', iot: 'Luz QR · IoT', schoolAdmin: 'Gestión de la escuela', studentProgress: 'Mi progreso como alumno', coachDiscovery: 'Entrenadores & lecciones', ownerPanel: 'Panel del dueño · RevPAC', monetization: 'Monetización · Sponsors', posts: 'CMS · Crónicas IA', marketplace: 'Marketplace', globalRanking: 'Global Ranking' },
    en: { tournaments: 'Tournaments & events', calendar: 'Circuit calendar', club: 'Club & bookings', school: 'School & coaches', crm: 'CRM · Business management', marketing: 'Marketing · Plans, campaigns & newsletter', community: 'Community · Board, chat & groups', shop: 'Shop', directory: 'Clubs & schools directory', league: 'Ranked League', launch: 'Launch & offers', dashboard: 'Courts dashboard', livepro: 'LiveScore Pro', live: 'Live view', control: 'Tournament control', analytics: 'Analytics', match: 'Looking for a fourth', members: 'Members & memberships', membercard: 'My member card', iot: 'QR Light · IoT', schoolAdmin: 'School management', studentProgress: 'My student progress', coachDiscovery: 'Coaches & lessons', ownerPanel: 'Owner dashboard · RevPAC', monetization: 'Monetization · Sponsors', posts: 'CMS · AI reports', marketplace: 'Marketplace', globalRanking: 'Global Ranking' },
    fr: { tournaments: 'Tournois & événements', calendar: 'Calendrier du circuit', club: 'Club & réservations', school: 'École & entraîneurs', crm: 'CRM · Gestion d\'affaires', marketing: 'Marketing · Plans, campagnes & newsletter', community: 'Communauté · Tableau, chat & groupes', shop: 'Boutique', directory: 'Annuaire des clubs et écoles', league: 'Ligue classée', launch: 'Lancement et offres', dashboard: 'Tableau des pistes', livepro: 'LiveScore Pro', live: 'Vue en direct', control: 'Contrôle du tournoi', analytics: 'Analytiques', match: 'Cherche un quatrième', members: 'Membres & abonnements', membercard: 'Ma carte de membre', iot: 'Lumière QR · IoT', schoolAdmin: 'Gestion de l\'école', studentProgress: 'Ma progression d\'élève', coachDiscovery: 'Entraîneurs & leçons', ownerPanel: 'Tableau du propriétaire · RevPAC', monetization: 'Monétisation · Sponsors', posts: 'CMS · Reportages IA', marketplace: 'Marketplace', globalRanking: 'Classement mondial' },
    pt: { tournaments: 'Torneios & eventos', calendar: 'Calendário do circuito', club: 'Clube & reservas', school: 'Escola & treinadores', crm: 'CRM · Gestão de negócio', marketing: 'Marketing · Planos, campanhas & newsletter', community: 'Comunidade · Quadro, chat & grupos', shop: 'Loja', directory: 'Diretório de clubes e escolas', league: 'Liga ranqueada', launch: 'Lançamento e ofertas', dashboard: 'Painel de pistas', livepro: 'LiveScore Pro', live: 'Vista em direto', control: 'Central de controlo', analytics: 'Analíticas', match: 'Procuro quarto', members: 'Associados & adesões', membercard: 'Meu cartão de sócio', iot: 'Luz QR · IoT', schoolAdmin: 'Gestão da escola', studentProgress: 'Meu progresso de aluno', coachDiscovery: 'Treinadores & lições', ownerPanel: 'Painel do dono · RevPAC', monetization: 'Monetização · Sponsors', posts: 'CMS · Crónicas IA', marketplace: 'Marketplace', globalRanking: 'Ranking global' },
  };
  const t = TOOLTIPS[lang] || TOOLTIPS.es;
  const MEMBER_TOOLTIPS = { es: { member: 'Mi carné de socio', student: 'Mi progreso como alumno', space: 'Mi espacio' }, en: { member: 'My member card', student: 'My student progress', space: 'My space' }, fr: { member: 'Ma carte de membre', student: 'Ma progression d\'élève', space: 'Mon espace' }, pt: { member: 'Meu cartão de sócio', student: 'Meu progresso de aluno', space: 'Meu espaço' } };
  const mt = MEMBER_TOOLTIPS[lang] || MEMBER_TOOLTIPS.es;

  // Header a medida por perfil: detecta rol del usuario logueado por email
  useEffect(() => {
    if (!user) { setRole(null); return; }
    const email = (user.email || '').toLowerCase();
    let isMember = false, isStudent = false;
    try {
      const members = JSON.parse(localStorage.getItem('padelorganizers-members')) || [];
      isMember = members.some((m) => (m.email || '').toLowerCase() === email);
    } catch { /* ignore */ }
    try {
      const students = JSON.parse(localStorage.getItem('padelorganizers-students')) || [];
      isStudent = students.some((s) => (s.email || '').toLowerCase() === email);
    } catch { /* ignore */ }
    setRole(isMember && isStudent ? 'both' : isMember ? 'member' : isStudent ? 'student' : 'player');
  }, [user]);

  const LANG_LABELS = { es: { label: 'ES', tooltip: 'Cambiar a español' }, en: { label: 'EN', tooltip: 'Switch to English' }, fr: { label: 'FR', tooltip: 'Passer au français' }, pt: { label: 'PT', tooltip: 'Mudar para português' } };
  const [langOpen, setLangOpen] = useState(false);

  const isOn = (path) => {
    if (path === '/torneo') {
      return ['/torneo', '/dashboard', '/control', '/analytics', '/livepro', '/live', '/match']
        .some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));
    }
    return location.pathname === path;
  };

  return (
    <header style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 24px', background: 'var(--padel-header-bg)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--padel-header-border)', position: 'sticky', top: 0, zIndex: 1000,
      gap: '12px', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <LogoPadel size={30} tagline="COURTMANAGER® AI" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 6px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.18)', borderRadius: 12 }}>
          <NavDrop tooltip="Admin PRO" to="/admin" icon="dashboard" color="#38bdf8" active={location.pathname.startsWith('/admin')} highlight children={[
            ['🏢 Panel Admin PRO', '/admin'],
            ['📊 Dashboard CEO', '/admin'],
            ['💶 Finanzas', '/admin'],
          ]} />
          <NavDrop
            tooltip={t.tournaments}
            to="/torneo"
            icon="raquet"
            color="#34d399"
            active={isOn('/torneo')}
            children={[
              ['🏟️ ' + t.tournaments, '/torneo'],
              ['🗓️ ' + t.calendar, '/calendario'],
              ['📊 ' + t.dashboard, '/dashboard'],
              ['🎬 ' + t.livepro, '/livepro'],
              ['📺 ' + t.live, '/live'],
              ['🎛️ ' + t.control, '/control'],
              ['📈 ' + t.analytics, '/analytics'],
              ['🤝 ' + t.match, '/match'],
            ]}
          />
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {/* Mi espacio: header a medida según el perfil logueado (sólo socio/alumno; el jugador usa la medalla 🏅) */}
        {role && role !== 'player' && (
          <Link to={role === 'member' || role === 'both' ? '/socio' : '/alumno'}
            data-tooltip={role === 'member' || role === 'both' ? mt.member : mt.student}
            aria-label={mt.space}
            className="nav-ico"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 13px',
              borderRadius: 10, color: '#84cc16', textDecoration: 'none',
              background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.35)',
            }}>
            <NavIcon name={role === 'member' || role === 'both' ? 'membercard' : 'student'} size={20} />
          </Link>
        )}

        {/* 2 · Club (reservas, socios, mi carné) */}
        <NavDrop tooltip={t.club} to="/club" icon="club" color="#10b981" active={location.pathname.startsWith('/club') || location.pathname.startsWith('/iot')} children={[
          ['🏠 ' + t.club, '/club'],
          ['🪪 ' + t.members, '/socios'],
          ['💳 ' + t.membercard, '/socio'],
          ['💡 ' + t.iot, '/iot'],
        ]} />

        {/* 3 · Escuela (gestión + alumno) */}
        <NavDrop tooltip={t.school} to="/escuela" icon="coach" color="#34d399" active={location.pathname.startsWith('/escuela') || location.pathname.startsWith('/alumno') || location.pathname.startsWith('/coaches')} children={[
          ['🏫 ' + t.schoolAdmin, '/escuela'],
          ['🎓 ' + t.studentProgress, '/alumno'],
          ['👨‍🏫 ' + t.coachDiscovery, '/coaches'],
        ]} />





        {/* 7 · Tienda */}
        <NavDrop tooltip={t.shop} to="/tienda" icon="shop" color="#fbbf24" active={location.pathname.startsWith('/tienda')} children={[]} />

        {/* 8 · Directorio */}
        <NavDrop tooltip={t.directory} to="/clubes" icon="map" color="#2dd4bf" active={location.pathname.startsWith('/clubes') || location.pathname.startsWith('/market')} children={[
          ['🗺️ ' + t.directory, '/clubes'],
          ['🛒 ' + t.marketplace, '/market'],
        ]} />

        {/* 9 · Ranked League */}
        <NavDrop tooltip={t.league} to="/league" icon="trophy" color="#a3e635" active={location.pathname.startsWith('/league') || location.pathname.startsWith('/ranking')} children={[
          ['🏆 ' + t.league, '/league'],
          ['🌍 ' + t.globalRanking, '/ranking'],
        ]} />

        {/* 10 · Lanzamiento */}
        <NavDrop tooltip={t.launch} to="/lanzamiento" icon="rocket" color="#fb7185" active={location.pathname.startsWith('/lanzamiento')} children={[]} />

        <ModeToggle lang={lang} />
        <UserMenu lang={lang} />
        <ThemeToggle lang={lang} />

        <div style={{ position: 'relative' }} onMouseLeave={() => setLangOpen(false)}>
          <button onClick={() => setLangOpen(o=>!o)} title={LANG_LABELS[lang]?.tooltip} aria-label={LANG_LABELS[lang]?.tooltip} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--padel-hover-bg)', color:'var(--padel-text)', border:'1px solid var(--padel-border)', padding:'6px 10px', borderRadius:8, fontSize:12, fontWeight:800, cursor:'pointer' }}>
            {LANG_LABELS[lang]?.label} <span style={{ fontSize:10, opacity:0.6 }}>▼</span>
          </button>
          {langOpen && (
            <div style={{ position:'absolute', top:36, right:0, zIndex:1200, background:'var(--padel-card-bg)', border:'1px solid var(--padel-border)', borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,0.35)', padding:4, minWidth:120, display:'flex', flexDirection:'column', gap:2 }}>
              {['es','en','fr','pt'].map(l=>(
                <button key={l} onClick={()=>{ onLanguageChange && onLanguageChange(l); setLangOpen(false); }} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, border:'none', background: lang===l?'rgba(16,185,129,0.15)':'transparent', color: lang===l?'#10b981':'var(--padel-text)', fontWeight:700, fontSize:13, cursor:'pointer', textAlign:'left' }}>
                  {LANG_LABELS[l].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default HeaderPadel;