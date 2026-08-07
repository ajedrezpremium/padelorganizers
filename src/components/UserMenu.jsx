import React, { useState } from 'react';
import AuthModal from './AuthModal';
import { useAuth } from '../hooks/useAuth';

const I18N = {
  es: { login: 'Iniciar sesión', logout: 'Cerrar sesión' },
  en: { login: 'Sign in', logout: 'Sign out' },
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

  const display = profile?.display_name || user.email?.split('@')[0] || 'Jugador';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(132,204,22,0.1)', border: '1px solid rgba(132,204,22,0.3)', borderRadius: 12, padding: '6px 14px' }}>
        <span style={{ fontSize: 18 }}>🏅</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{display}</div>
          <div style={{ fontSize: 11, color: '#84cc16', fontWeight: 700 }}>{profile?.level ? `Nivel ${profile.level}` : '🔥 Elo ' + (profile?.elo || 1500)}</div>
        </div>
      </div>
      <button onClick={signOut} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
        {T.logout}
      </button>
    </div>
  );
}