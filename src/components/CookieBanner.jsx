import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KEY = 'padel-cookie-consent';

const I18N = {
  es: { title: '🍪 Usamos cookies', text: 'Para que la plataforma funcione (idioma, sesión y tu torneo). No hay publicidad de terceros.', accept: 'Aceptar', decline: 'Solo lo necesario', more: 'Más información' },
  en: { title: '🍪 We use cookies', text: 'To run the platform (language, session, your tournament). No third-party ads.', accept: 'Accept', decline: 'Only necessary', more: 'More info' },
  fr: { title: '🍪 Nous utilisons des cookies', text: 'Pour faire fonctionner la plateforme (langue, session, tournoi). Pas de publicité.', accept: 'Accepter', decline: 'Nécessaire uniquement', more: 'Plus d\u2019infos' },
  pt: { title: '🍪 Usamos cookies', text: 'Para o funcionamento da plataforma (idioma, sessão, torneio). Sem publicidade.', accept: 'Aceitar', decline: 'Apenas o necessário', more: 'Mais info' },
};

export default function CookieBanner({ lang = 'es' }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const T = I18N[lang] || I18N.es;

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch (e) { /* ignore */ }
  }, []);

  const decide = (mode) => {
    try { localStorage.setItem(KEY, mode); } catch (e) { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 2000,
      maxWidth: 640, width: 'calc(100% - 32px)', background: '#0e1e1b',
      border: '1px solid rgba(16,185,129,0.35)', borderRadius: 16, padding: '18px 20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#84cc16', marginBottom: 6 }}>{T.title}</div>
      <p style={{ fontSize: 13, color: '#cbd5e1', margin: '0 0 14px', lineHeight: 1.5 }}>{T.text}</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => decide('all')} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
          {T.accept}
        </button>
        <button onClick={() => decide('essential')} style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          {T.decline}
        </button>
        <button onClick={() => navigate('/legal')} style={{ background: 'transparent', color: '#38bdf8', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>
          {T.more} →
        </button>
      </div>
    </div>
  );
}