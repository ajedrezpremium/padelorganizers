import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSubscriber } from '../services/subscribersService';

const I18N = {
  es: {
    title: '🎾 Entra en la demo gratis',
    sub: 'Déjanos tu email y te damos acceso al torneo de ejemplo con 32 jugadores.',
    email: 'Tu email',
    name: 'Tu nombre o club (opcional)',
    profile: '¿Qué eres?',
    profiles: ['Jugador', 'Club / Organizador', 'Escuela / Técnico', 'Patrocinador'],
    btn: 'Entrar en la demo →',
    loading: 'Preparando tu demo…',
    ok: '✅ ¡Listo! Entras en la demo…',
    err: 'Email no válido.',
    skip: 'Solo probar, sin dejar email',
    privacy: 'Sin spam. Puedes darte de baja cuando quieras.',
  },
  en: {
    title: '🎾 Get into the free demo',
    sub: 'Leave your email and we\'ll give you access to the example tournament with 32 players.',
    email: 'Your email',
    name: 'Your name or club (optional)',
    profile: 'Who are you?',
    profiles: ['Player', 'Club / Organizer', 'School / Coach', 'Sponsor'],
    btn: 'Enter the demo →',
    loading: 'Preparing your demo…',
    ok: '✅ Ready! Entering the demo…',
    err: 'Invalid email.',
    skip: 'Just try it, without email',
    privacy: 'No spam. Unsubscribe anytime.',
  },
  fr: {
    title: '🎾 Entrez dans la démo gratuite',
    sub: 'Laissez-nous votre email et nous vous donnons accès au tournoi d\'exemple avec 32 joueurs.',
    email: 'Votre email',
    name: 'Votre nom ou club (facultatif)',
    profile: 'Qui êtes-vous ?',
    profiles: ['Joueur', 'Club / Organisateur', 'École / Coach', 'Sponsor'],
    btn: 'Entrer dans la démo →',
    loading: 'Préparation de votre démo…',
    ok: '✅ Prêt ! Entrée dans la démo…',
    err: 'Email invalide.',
    skip: 'Juste essayer, sans email',
    privacy: 'Pas de spam. Désinscription à tout moment.',
  },
  pt: {
    title: '🎾 Entre na demo grátis',
    sub: 'Deixa-nos o teu email e damos-te acesso ao torneio de exemplo com 32 jogadores.',
    email: 'O teu email',
    name: 'O teu nome ou clube (opcional)',
    profile: 'O que és?',
    profiles: ['Jogador', 'Clube / Organizador', 'Escola / Treinador', 'Patrocinador'],
    btn: 'Entrar na demo →',
    loading: 'A preparar a tua demo…',
    ok: '✅ Pronto! A entrar na demo…',
    err: 'Email inválido.',
    skip: 'Só experimentar, sem email',
    privacy: 'Sem spam. Podes cancelar quando quiseres.',
  },
};

export default function DemoLeadModal({ lang = 'es', onClose, onSkip }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [profile, setProfile] = useState(0);
  const [status, setStatus] = useState('idle');

  const enterDemo = () => {
    if (email.trim()) {
      addSubscriber({ email, name, lang, city: '' });
      // Intento no bloqueante de sync a la nube (si hay conexión)
      import('../services/subscribersService').then((m) => m.syncSubscribersToCloud?.().catch(() => {}));
    }
    setStatus('ok');
    setTimeout(() => navigate('/torneo'), 400);
  };

  const submit = (e) => {
    e.preventDefault();
    const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    if (!valid) { setStatus('err'); return; }
    setStatus('loading');
    setTimeout(enterDemo, 250);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(2,10,8,0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(160deg,#0b1f1a,#071210)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 22, padding: 30, maxWidth: 430, width: '100%', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -6 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer', lineHeight: 1 }} aria-label="Cerrar">✕</button>
        </div>
        <h3 style={{ fontSize: 21, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>{T.title}</h3>
        <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.55, margin: '0 0 18px' }}>{T.sub}</p>

        {status === 'ok' ? (
          <p style={{ color: '#4ade80', fontWeight: 800, fontSize: 15, padding: '12px 0' }}>{T.ok}</p>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={T.email} required
              style={{ background: 'rgba(255,255,255,0.06)', border: status === 'err' ? '1px solid #f87171' : '1px solid rgba(16,185,129,0.4)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={T.name}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginBottom: 6 }}>{T.profile}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {T.profiles.map((p, i) => (
                  <button key={i} type="button" onClick={() => setProfile(i)} style={{ background: i === profile ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.05)', border: i === profile ? '1px solid var(--padel-lime)' : '1px solid rgba(255,255,255,0.12)', color: i === profile ? '#a3e635' : '#cbd5e1', borderRadius: 20, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {status === 'err' && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{T.err}</p>}
            <button type="submit" disabled={status === 'loading'} className="pulse-glow" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: status === 'loading' ? 0.6 : 1 }}>
              {status === 'loading' ? T.loading : T.btn}
            </button>
            <button type="button" onClick={onSkip} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
              {T.skip}
            </button>
            <p style={{ fontSize: 11, color: '#475569', margin: 0, textAlign: 'center' }}>{T.privacy}</p>
          </form>
        )}
      </div>
    </div>
  );
}