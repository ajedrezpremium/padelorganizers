import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProPaywall({ lang = 'es', feature = 'esta función', cta = 'Activar Pro' }) {
  const nav = useNavigate();
  const T = {
    es: { title: `🔒 ${feature} es Pro`, body: 'Activa Pro con 3 meses gratis y desbloquea torneos ilimitados, CourtManager + IA, reservas con Stripe y Ranked League.', btn: cta, later: 'Seguir en Starter' },
    en: { title: `🔒 ${feature} is Pro`, body: 'Activate Pro with 3 months free: unlimited tournaments, CourtManager + AI, Stripe bookings and Ranked League.', btn: cta, later: 'Stay on Starter' },
    fr: { title: `🔒 ${feature} est Pro`, body: 'Activez Pro avec 3 mois gratuits : tournois illimités, CourtManager + IA, Stripe et Ligue.', btn: cta, later: 'Rester en Starter' },
    pt: { title: `🔒 ${feature} é Pro`, body: 'Ative Pro com 3 meses grátis: torneios ilimitados, CourtManager + IA, Stripe e Liga.', btn: cta, later: 'Ficar no Starter' },
  }[lang] || { title: `🔒 ${feature} es Pro`, body: '', btn: cta, later: 'Seguir' };
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      const r = await fetch('/api/checkout-subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'pro' }) });
      const j = await r.json();
      if (j.url) window.location.href = j.url; else { alert(j.message || j.error || 'demo'); setBusy(false); }
    } catch { setBusy(false); }
  };
  return (
    <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontWeight: 800, color: 'var(--padel-text)', fontSize: 14 }}>{T.title}</div>
        <div style={{ fontSize: 13, color: 'var(--padel-muted)', maxWidth: 520 }}>{T.body}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => nav('/lanzamiento')} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--padel-border)', background: 'transparent', color: 'var(--padel-muted)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{T.later}</button>
        <button onClick={go} disabled={busy} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? '…' : T.btn}</button>
      </div>
    </div>
  );
}
