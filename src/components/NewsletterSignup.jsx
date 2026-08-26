import React, { useState, useCallback } from 'react';
import { addSubscriber } from '../services/subscribersService';

const I18N = {
  es: { title: 'Newsletter semanal', sub: 'Recibe torneos, trucos y ofertas para tu club. Sin spam.', email: 'Tu email', btn: 'Suscribirme', success: '¡Suscrito! Revisa tu bandeja.', error: 'Email inválido', privacy: 'RGPD compliant. Baja en 1 clic.' },
  en: { title: 'Weekly newsletter', sub: 'Get tournaments, tips & club offers. No spam.', email: 'Your email', btn: 'Subscribe', success: 'Subscribed! Check your inbox.', error: 'Invalid email', privacy: 'GDPR compliant. 1-click unsubscribe.' },
  fr: { title: 'Newsletter hebdo', sub: 'Tournois, astuces et offres pour votre club. Pas de spam.', email: 'Votre email', btn: 'M\'abonner', success: 'Abonné ! Vérifiez votre boîte.', error: 'Email invalide', privacy: 'Conforme RGPD. Désinscription 1 clic.' },
  pt: { title: 'Newsletter semanal', sub: 'Torneios, dicas e ofertas para o teu clube. Sem spam.', email: 'O teu email', btn: 'Subscrever', success: 'Inscrito! Verifica o teu email.', error: 'Email inválido', privacy: 'RGPD compliant. Cancelar em 1 clique.' },
};

export default function NewsletterSignup({ lang = 'es', variant = 'inline', onSuccess }) {
  const T = I18N[lang] || I18N.es;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const submit = useCallback(async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setStatus('error'); return; }
    setStatus('loading');
    await addSubscriber({ email: email.trim(), name: '', lang, city: '' });
    try { require('../services/subscribersService').syncSubscribersToCloud?.().catch(() => {}); } catch {}
    setStatus('success');
    setEmail('');
    if (onSuccess) onSuccess();
    setTimeout(() => setStatus('idle'), 4000);
  }, [email, lang, onSuccess]);

  const styles = {
    inline: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', maxWidth: 500 },
    card: { display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center', padding: 20, background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16 },
    footer: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' },
  }[variant];

  const inputStyle = { flex: '1 1 200px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', minWidth: 200 };
  const btnStyle = { background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', opacity: status === 'loading' ? 0.6 : 1 };

  return (
    <div style={styles}>
      {(variant === 'card' || variant === 'footer') && (
        <div>
          <div style={{ fontSize: variant === 'card' ? 18 : 14, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 4 }}>{T.title}</div>
          <div style={{ fontSize: variant === 'card' ? 13 : 11, color: 'var(--padel-muted)', marginBottom: variant === 'card' ? 8 : 0 }}>{T.sub}</div>
        </div>
      )}
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={T.email} required autoComplete="email" style={inputStyle} />
        <button type="submit" disabled={status === 'loading'} style={btnStyle}>{status === 'loading' ? '…' : T.btn}</button>
      </form>
      {status === 'success' && <p style={{ color: '#84cc16', fontSize: 12, fontWeight: 700, margin: '8px 0 0', textAlign: variant === 'card' ? 'center' : 'left' }}>{T.success}</p>}
      {status === 'error' && <p style={{ color: '#f87171', fontSize: 12, margin: '8px 0 0' }}>{T.error}</p>}
      <p style={{ fontSize: 10, color: '#64748b', margin: '8px 0 0', maxWidth: 300 }}>{T.privacy}</p>
    </div>
  );
}