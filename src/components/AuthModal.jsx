import React, { useState } from 'react';

const I18N = {
  es: {
    login: 'Iniciar sesión', signup: 'Crear cuenta', email: 'Email', password: 'Contraseña',
    name: 'Nombre (opcional)', submit: 'Entrar', register: 'Registrarse',
    haveAccount: '¿Ya tienes cuenta? Inicia sesión', noAccount: '¿No tienes cuenta? Regístrate',
    error: 'Error', close: 'Cerrar', title: 'Accede a tu perfil de jugador',
    desc: 'Guarda tu nivel, tu Elo y tus torneos en la nube.',
  },
  en: {
    login: 'Sign in', signup: 'Create account', username: 'Email', password: 'Password',
    name: 'Name (optional)', submit: 'Sign in', register: 'Sign up',
    haveAccount: 'Already have an account? Sign in', noAccount: 'No account? Sign up',
    error: 'Error', close: 'Close', title: 'Access your player profile',
    desc: 'Save your level, your Elo and your tournaments to the cloud.',
  },
};

export default function AuthModal({ lang = 'es', onClose, onAuthed }) {
  const T = I18N[lang] || I18N.es;
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const { supabase } = await import('../lib/supabaseClient');
    let res;
    if (mode === 'login') {
      res = await supabase.auth.signInWithPassword({ email, password });
    } else {
      res = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
    }
    setBusy(false);
    if (res.error) {
      setErr(res.error.message);
      return;
    }
    if (onAuthed) onAuthed(res);
    if (res.data.session) onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: 30, width: 380, maxWidth: '100%', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>

        <div style={{ fontSize: 30, marginBottom: 6 }}>👤</div>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{T.title}</h3>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>{T.desc}</p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder={T.name}
              style={inputStyle} />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder={T.username}
            style={inputStyle} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder={T.password}
            style={inputStyle} />

          {err && <p style={{ fontSize: 13, color: '#f87171', margin: '4px 0' }}>{err}</p>}

          <button type="submit" disabled={busy} style={{ width: '100%', padding: '13px', borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
            {busy ? '…' : (mode === 'login' ? T.submit : T.register)}
          </button>
        </form>

        <p style={{ fontSize: 13, color: '#84cc16', cursor: 'pointer', textAlign: 'center', marginTop: 16 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? T.noAccount : T.login}
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14, marginBottom: 12, boxSizing: 'border-box',
};