import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { COURTS, DEFAULT_MIN, turnOnLight, turnOffLight } from '../services/iotService';

const I18N = {
  es: {
    title: '💡 Control de acceso · Luz de pista',
    scan: 'Escaneando código QR…',
    on: 'Luz encendida',
    court: 'Pista',
    min: 'min restantes', off: 'Apagar ahora',
    autoOff: 'La luz se apagará automáticamente al terminar la reserva. Consumo y ahorro registrados en el panel del dueño.',
    another: 'Escaneando otra pista…', goPanel: '→ Panel del dueño',
    notFound: 'Código QR no válido', back: '← Volver al club',
  },
  en: {
    title: '💡 Access control · Court light',
    scan: 'Scanning QR code…',
    on: 'Light turned on',
    court: 'Court',
    min: 'min remaining', off: 'Turn off now',
    autoOff: 'The light will switch off automatically at the end of the booking. Usage and savings are tracked in the owner panel.',
    another: 'Scanning another court…', goPanel: '→ Owner panel',
    notFound: 'Invalid QR code', back: '← Back to the club',
  },
  fr: {
    title: '💡 Contrôle d\'accès · Éclairage de piste',
    scan: 'Lecture du code QR…',
    on: 'Éclairage allumé',
    court: 'Piste',
    min: 'min restantes', off: 'Éteindre maintenant',
    autoOff: 'La lumière s\'éteindra automatiquement à la fin de la réservation. Consommation et économies enregistrées dans le tableau du propriétaire.',
    another: 'Lecture d\'une autre piste…', goPanel: '→ Tableau du propriétaire',
    notFound: 'Code QR invalide', back: '← Retour au club',
  },
  pt: {
    title: '💡 Controlo de acesso · Luz do campo',
    scan: 'A ler código QR…',
    on: 'Luz ligada',
    court: 'Campo',
    min: 'min restantes', off: 'Desligar agora',
    autoOff: 'A luz será desligada automaticamente no fim da reserva. Consumo e poupança registados no painel do dono.',
    another: 'A ler outro campo…', goPanel: '→ Painel do dono',
    notFound: 'Código QR inválido', back: '← Voltar ao clube',
  },
};

export default function QrLight({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [params] = useSearchParams();
  const nav = useNavigate();
  const courtId = params.get('court');
  const court = useMemo(() => COURTS.find(c => c.id === courtId), [courtId]);

  const [state, setState] = useState(court ? { scanning: true } : { invalid: true });
  const [remaining, setRemaining] = useState(DEFAULT_MIN);

  useEffect(() => {
    if (!court) return;
    let cancelled = false;
    (async () => {
      await turnOnLight(court.id, DEFAULT_MIN);
      if (!cancelled) setState({ on: true });
      setRemaining(DEFAULT_MIN);
    })();
    return () => { cancelled = true; };
  }, [court]);

  useEffect(() => {
    if (!state.on) return;
    const iv = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { setState({ off: true }); return 0; }
        return r - 1;
      });
      // pulsación de vida para que el panel del dueño vea el estado vivo
      try { localStorage.setItem('padelorganizers-iot-pulse', String(Date.now())); localStorage.removeItem('padelorganizers-iot-pulse'); } catch { /* noop */ }
    }, 60000);
    return () => clearInterval(iv);
  }, [state.on]);

  const offNow = async () => {
    if (!court) return;
    await turnOffLight(court.id);
    setState({ off: true });
  };

  const card = { background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '18px', padding: 28, maxWidth: 420, margin: '48px auto', textAlign: 'center' };

  return (
    <div style={{ padding: '24px', minHeight: '70vh' }}>
      <div style={card}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>{T.title}</h2>

        {court && state.scanning && (
          <>
            <div style={{ fontSize: 46, margin: '22px 0 8px', animation: 'pulse 1.2s infinite' }}>🔍</div>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>{T.scan}</p>
          </>
        )}

        {court && state.on && (
          <>
            <div style={{ fontSize: 52, margin: '18px 0 6px' }}>💡</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#a3e635' }}>{T.on} ✓</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: '12px 0 2px' }}>{remaining}<span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}> {T.min}</span></div>
            <div style={{ fontSize: 13, color: '#e2e8f0', margin: '4px 0 16px' }}>{T.court}: <b>{court.name}</b></div>
            <button onClick={offNow} style={{ padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{T.off}</button>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 18, lineHeight: 1.5 }}>{T.autoOff}</p>
          </>
        )}

        {court && state.off && (
          <>
            <div style={{ fontSize: 46, margin: '20px 0 8px' }}>🌑</div>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>💡 …</p>
          </>
        )}

        {!court && (
          <>
            <div style={{ fontSize: 44, margin: '20px 0 8px' }}>⚠️</div>
            <p style={{ color: '#f87171', fontSize: 14 }}>{T.notFound}</p>
            <button onClick={() => nav('/club')} style={{ padding: '11px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{T.back}</button>
          </>
        )}

        {(court && !state.invalid) && (
          <div style={{ marginTop: 18 }}>
            <button onClick={() => nav('/panel')} style={{ fontSize: 12, color: '#a3e635', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>{T.goPanel}</button>
          </div>
        )}
      </div>
    </div>
  );
}