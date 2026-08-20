import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from './AuthModal';
import { useAuth } from '../hooks/useAuth';

const I18N = {
  es: { login: 'Iniciar sesión', logout: 'Cerrar sesión', director: 'Mi club', level: 'Nivel', player: 'Jugador' },
  en: { login: 'Sign in', logout: 'Sign out', director: 'My club', level: 'Level', player: 'Player' },
  fr: { login: 'Se connecter', logout: 'Se déconnecter', director: 'Mon club', level: 'Niveau', player: 'Joueur' },
  pt: { login: 'Entrar', logout: 'Sair', director: 'Meu clube', level: 'Nível', player: 'Jogador' },
};

export default function UserMenu({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const { user, profile, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          style={{
            background: 'rgba(16,185,129,0.15)', color: '#84cc16', border: '1px solid rgba(16,185,129,0.4)',
            padding: '8px 16px', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer',
          }}
        >
          👤 {T.login}
        </button>
        {showAuth && <AuthModal lang={lang} onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  const display = profile?.display_name || user.email?.split('@')[0] || T.player;
  const levelText = profile?.level ? `${display} · ${T.level} ${profile.level} · ELO ${profile.elo || 1500}` : `${display} · ELO ${profile?.elo || 1500}`;
  const isDirector = profile?.role === 'director';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {isDirector ? (
        <Link
          to="/clubes/alta"
          data-tooltip={T.director}
          aria-label={T.director}
          className="nav-ico"
          style={{ display: 'flex', alignItems: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '6px 10px', textDecoration: 'none', color: 'inherit' }}
        >
          <span style={{ fontSize: 18 }}>👔</span>
        </Link>
      ) : null}
      <Link
        to="/perfil"
        data-tooltip={levelText}
        aria-label={levelText}
        className="nav-ico"
        style={{ display: 'flex', alignItems: 'center', background: 'rgba(132,204,22,0.1)', border: '1px solid rgba(132,204,22,0.3)', borderRadius: 12, padding: '6px 10px', textDecoration: 'none', color: 'inherit' }}
      >
        <span style={{ fontSize: 18 }}>🏅</span>
      </Link>
      <button
        onClick={signOut}
        data-tooltip={T.logout}
        aria-label={T.logout}
        className="nav-ico"
        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 2v5" />
          <path d="M15 2v5" />
          <path d="M6 7h12v3a6 6 0 0 1-12 0V7Z" />
          <path d="M12 16v6" />
          <path d="M9 22h6" />
        </svg>
      </button>
    </div>
  );
}