import React, { useState } from 'react';
import { getMode, setMode, isOnline } from '../services/connection';
import { pushState, pullState, cloudReady } from '../services/cloudService';
import { getState, setState } from '../services/store';

const I18N = {
  es: {
    online: 'Nube', offline: 'Local', switchToOnline: 'Cambiar a Nube (guardar en Supabase)',
    switchToOffline: 'Cambiar a Local (solo este navegador)', syncing: 'Sincronizando…',
    synced: 'Sincronizado', error: 'No se pudo sincronizar', offDesc: 'Offline',
  },
  en: {
    online: 'Cloud', offline: 'Local', switchToOnline: 'Switch to Cloud (save in Supabase)',
    switchToOffline: 'Switch to Local (this browser only)', syncing: 'Syncing…',
    synced: 'Synced', error: 'Sync failed', offDesc: 'Offline',
  },
};

export default function ModeToggle({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [online, setOnlineState] = useState(isOnline());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const toggle = async () => {
    if (!cloudReady) return;
    setBusy(true);
    setStatus(T.syncing);
    try {
      const next = !online;
      if (next) {
        // Local -> Nube: sube el estado actual
        const { ok } = await pushState(getState());
        if (ok) {
          setMode('online');
          setOnlineState(true);
          setStatus(T.synced);
        } else {
          setStatus(T.error);
        }
      } else {
        // Nube -> Local: baja el estado guardado
        const current = getState();
        const key = String(current.tournament?.id || 'demo');
        const { ok, data } = await pullState(key);
        if (ok && data) {
          setState(data);
          setMode('offline');
          setOnlineState(false);
          setStatus(T.synced);
        } else {
          // sin copia en nube -> igualmente pasamos a local con lo actual
          setMode('offline');
          setOnlineState(false);
          setStatus(T.synced);
        }
      }
    } finally {
      setBusy(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <button
      onClick={toggle}
      title={online ? T.switchToOffline : T.switchToOnline}
      disabled={busy || !cloudReady}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: online ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${online ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.2)'}`,
        color: online ? '#84cc16' : '#cbd5e1',
        padding: '8px 14px', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer',
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: online ? '#84cc16' : '#fbbf24', boxShadow: online ? '0 0 8px #84cc16' : '0 0 8px #fbbf24' }} />
      {busy ? T.syncing : (status || (online ? T.online : T.offline))}
    </button>
  );
}