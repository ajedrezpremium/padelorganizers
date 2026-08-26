import React, { useEffect, useState, useCallback } from 'react';
import { addSubscriber } from '../services/subscribersService';

const I18N = {
  es: {
    title: '¿Te vas sin probar la demo?',
    sub: 'Accede gratis al torneo de ejemplo con 32 jugadores y marcador en vivo.',
    email: 'Tu email',
    btn: 'Entrar gratis →',
    skip: 'No, gracias',
    privacy: 'Sin spam. Baja cuando quieras.',
    success: '¡Listo! Redirigiendo a la demo…',
  },
  en: {
    title: 'Leaving without trying the demo?',
    sub: 'Get free access to the example tournament with 32 players and live scoring.',
    email: 'Your email',
    btn: 'Enter free →',
    skip: 'No thanks',
    privacy: 'No spam. Unsubscribe anytime.',
    success: 'Ready! Redirecting to demo…',
  },
  fr: {
    title: 'Vous partez sans tester la démo ?',
    sub: 'Accédez gratuitement au tournoi d\'exemple avec 32 joueurs et score en direct.',
    email: 'Votre email',
    btn: 'Accéder gratuitement →',
    skip: 'Non, merci',
    privacy: 'Pas de spam. Désinscription à tout moment.',
    success: 'Prêt ! Redirection vers la démo…',
  },
  pt: {
    title: 'Saindo sem testar a demo?',
    sub: 'Acesso grátis ao torneio de exemplo com 32 jogadores e placar ao vivo.',
    email: 'O teu email',
    btn: 'Entrar grátis →',
    skip: 'Não, obrigado',
    privacy: 'Sem spam. Cancela quando quiseres.',
    success: 'Pronto! A redirecionar para a demo…',
  },
};

export default function ExitIntentPopup({ lang = 'es', enabled = true, delayMs = 15000 }) {
  const T = I18N[lang] || I18N.es;
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const key = 'exit-intent-dismissed';
    if (localStorage.getItem(key)) { setDismissed(true); return; }
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return;

    const timer = setTimeout(() => { setShow(true); }, delayMs);
    let mouseY = 0;

    const onMouseMove = (e) => { mouseY = e.clientY; };
    const onMouseLeave = (e) => {
      if (mouseY <= 0 && e.clientY <= 0 && !show) { setShow(true); }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    return () => { clearTimeout(timer); window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseleave', onMouseLeave); };
  }, [enabled, delayMs, lang, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return;
    setStatus('loading');
    addSubscriber({ email: email.trim(), name: '', lang, city: '' });
    try { require('../services/subscribersService').syncSubscribersToCloud?.().catch(() => {}); } catch {}
    setStatus('success');
    setTimeout(() => { window.location.href = '/torneo'; }, 600);
  };

  const handleDismiss = () => {
    localStorage.setItem('exit-intent-dismissed', 'true');
    setShow(false);
    setDismissed(true);
  };

  const handleSkip = () => { handleDismiss(); };

  if (!show || dismissed || status === 'success') return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(2,10,8,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      animation: 'fadeIn 0.2s ease'
    }} onClick={handleDismiss}>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg,#0b1f1a,#071210)', border: '1px solid rgba(16,185,129,0.4)',
        borderRadius: 20, padding: 28, maxWidth: 420, width: '100%',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)', animation: 'slideUp 0.3s ease'
      }}>
        <button onClick={handleDismiss} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer', lineHeight: 1 }} aria-label="Cerrar">✕</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎁</div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>{T.title}</h3>
          <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.5, margin: '0 0 20px' }}>{T.sub}</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={T.email} required autoComplete="email"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
            <button type="submit" disabled={status === 'loading'} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: status === 'loading' ? 0.6 : 1 }}>
              {status === 'loading' ? '…' : T.btn}
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
              <button type="button" onClick={handleSkip} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer' }}>{T.skip}</button>
            </div>
            <p style={{ fontSize: 11, color: '#475569', margin: 0, textAlign: 'center' }}>{T.privacy}</p>
          </form>
        </div>
      </div>
    </div>
  );
}