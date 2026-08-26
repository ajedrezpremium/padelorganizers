import React, { useEffect, useState, useCallback } from 'react';

const I18N = {
  es: { title: 'Instalar PADELORGANIZERS', body: 'Añade la app a tu pantalla de inicio para acceso rápido, offline y notificaciones.', install: 'Instalar', later: 'Luego', dismiss: 'No, gracias' },
  en: { title: 'Install PADELORGANIZERS', body: 'Add to home screen for quick access, offline support & notifications.', install: 'Install', later: 'Later', dismiss: 'No thanks' },
  fr: { title: 'Installer PADELORGANIZERS', body: 'Ajoutez l\'app à l\'écran d\'accès pour un accès rapide, hors ligne et notifications.', install: 'Installer', later: 'Plus tard', dismiss: 'Non, merci' },
  pt: { title: 'Instalar PADELORGANIZERS', body: 'Adicione ao ecrã inicial para acesso rápido, offline e notificações.', install: 'Instalar', later: 'Depois', dismiss: 'Não, obrigado' },
};

export default function PWAInstallPrompt({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedKey = 'pwa-install-dismissed';
    if (localStorage.getItem(dismissedKey)) { setDismissed(true); return; }
    if (window.matchMedia('(display-mode: standalone)').match || window.navigator.standalone) { return; }

    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { setShow(false); setDeferredPrompt(null); }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShow(false);
    setDismissed(true);
  }, []);

  const handleLater = useCallback(() => { setShow(false); }, []);

  if (!show || dismissed || !deferredPrompt) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
      maxWidth: 360, width: 'calc(100% - 32px)',
      background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)',
      borderRadius: 16, padding: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      fontFamily: "'Inter', system-ui, sans-serif", animation: 'slideUp 0.3s ease',
    }}>
      <style jsx>{`
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🎾</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 4 }}>{T.title}</div>
          <div style={{ fontSize: 13, color: 'var(--padel-muted)', lineHeight: 1.4 }}>{T.body}</div>
        </div>
        <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', color: 'var(--padel-muted)', fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={handleLater} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--padel-border)', background: 'transparent', color: 'var(--padel-text)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{T.later}</button>
        <button onClick={handleDismiss} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--padel-border)', background: 'var(--padel-hover-bg)', color: 'var(--padel-muted)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{T.dismiss}</button>
        <button onClick={handleInstall} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{T.install}</button>
      </div>
    </div>
  );
}