import React, { useState } from 'react';

const I18N = {
  es: {
    login: 'Iniciar sesión', signup: 'Crear cuenta', email: 'Email', password: 'Contraseña',
    name: 'Nombre (opcional)', submit: 'Entrar', register: 'Registrarse',
    haveAccount: '¿Ya tienes cuenta? Inicia sesión', noAccount: '¿No tienes cuenta? Regístrate',
    error: 'Error', close: 'Cerrar', title: 'Accede a tu perfil de jugador',
    desc: 'Guarda tu nivel, tu Elo y tus torneos en la nube.',
    showPass: 'Mostrar contraseña', hidePass: 'Ocultar contraseña',
forgot: '¿Olvidaste tu contraseña?', recoverTitle: 'Recuperar contraseña',
    recoverDesc: 'Introduce tu email y te enviaremos un enlace para restablecerla.',
    emailBtn: 'Enviar enlace', recoverSent: 'Revisa tu bandeja de entrada: te hemos enviado el enlace de recuperación.',
    backToLogin: 'Volver al inicio de sesión',
    google: 'Continuar con Google', orSeparator: 'o con tu email',
  },
  en: {
    login: 'Sign in', signup: 'Create account', email: 'Email', password: 'Password',
    name: 'Name (optional)', submit: 'Sign in', register: 'Sign up',
    haveAccount: 'Already have an account? Sign in', noAccount: 'No account? Sign up',
    error: 'Error', close: 'Close', title: 'Access your player profile',
    desc: 'Save your level, your Elo and your tournaments to the cloud.',
    showPass: 'Show password', hidePass: 'Hide password',
    forgot: 'Forgot your password?', recoverTitle: 'Reset password',
    recoverDesc: 'Enter your email and we will send you a reset link.',
    emailBtn: 'Send link', recoverSent: 'Check your inbox: we have sent you the reset link.',
    backToLogin: 'Back to sign in',
    google: 'Continue with Google', orContinue: 'or with your email',
  },
  fr: {
    login: 'Se connecter', signup: 'Créer un compte', email: 'Email', password: 'Mot de passe',
    name: 'Nom (optionnel)', submit: 'Se connecter', register: "S'inscrire",
    haveAccount: 'Déjà un compte ? Connectez-vous', noAccount: 'Pas de compte ? Inscrivez-vous',
    error: 'Erreur', close: 'Fermer', title: 'Accédez à votre profil de joueur',
    desc: 'Sauvegardez votre niveau, votre Elo et vos tournois dans le cloud.',
    showPass: 'Afficher le mot de passe', hidePass: 'Masquer le mot de passe',
    forgot: 'Mot de passe oublié ?', recoverTitle: 'Réinitialiser le mot de passe',
    recoverDesc: 'Entrez votre email et nous vous enverrons un lien.',
    emailBtn: "Envoyer le lien", recoverSent: 'Vérifiez votre boîte mail : le lien a été envoyé.',
    backToLogin: 'Retour au connexion',
    google: 'Continuer avec Google', orContinue: 'ou avec votre email',
  },
  pt: {
    login: 'Entrar', signup: 'Criar conta', email: 'Email', password: 'Senha',
    name: 'Nome (opcional)', submit: 'Entrar', register: 'Registrar',
    haveAccount: 'Já tem conta? Entre', noAccount: 'Não tem conta? Registre-se',
    error: 'Erro', close: 'Fechar', title: 'Aceda ao seu perfil de jogador',
    desc: 'Guarde o seu nível, o seu Elo e os seus torneios na nuvem.',
    showPass: 'Mostrar senha', hidePass: 'Ocultar senha',
    forgot: 'Esqueceu a senha?', recoverTitle: 'Recuperar senha',
    recoverDesc: 'Digite o seu email e enviaremos um link para recuperar.',
    emailBtn: 'Enviar link', recoverSent: 'Verifique a sua caixa de entrada: o link foi enviado.',
    backToLogin: 'Voltar ao login',
    google: 'Continuar com Google', orContinue: 'ou com o seu email',
  },
};

export default function AuthModal({ lang = 'es', onClose, onAuthed }) {
  const T = I18N[lang] || I18N.es;
  const [mode, setMode] = useState('login'); // login | signup | recover
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const setModeAndClear = (m) => { setMode(m); setErr(''); setOk(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    setBusy(true);
    const { supabase } = await import('../lib/supabaseClient');
    let res;
    if (mode === 'recover') {
      res = await supabase.auth.resetPasswordForEmail(email);
      setBusy(false);
      if (res.error) { setErr(res.error.message); return; }
      setOk(T.recoveredSent);
      return;
    }
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

  const handleGoogle = async () => {
    setErr('');
    setBusy(true);
    const { supabase } = await import('../lib/supabaseClient');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin, queryParams: { access_type: 'offline', prompt: 'consent' } },
    });
    setBusy(false);
    if (error) setErr(error.message);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: 30, width: 400, maxWidth: '100%', margin: 'auto', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>

        <div style={{ fontSize: 30, marginBottom: 6 }}>{mode === 'recover' ? '🔑' : '👤'}</div>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>
          {mode === 'recover' ? T.recoverTitle : T.title}
        </h3>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>
          {mode === 'recover' ? T.recoverDesc : T.desc}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder={T.name}
              style={inputStyle} />
          )}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder={T.email}
              style={{ ...inputStyle, marginBottom: 0, paddingRight: 40 }} />
          </div>
          {mode !== 'recover' && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} required placeholder={T.password}
                style={{ ...inputStyle, marginBottom: 0, paddingRight: 44 }} />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                title={showPass ? T.hidePass : T.showPass}
                aria-label={showPass ? T.hidePass : T.showPass}
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer', padding: '6px' }}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          )}

          {mode === 'login' && (
            <p style={{ fontSize: 13, color: '#84cc16', cursor: 'pointer', textAlign: 'right', margin: '-4px 0 8px' }}
              onClick={() => setModeAndClear('recover')}>
              {T.forgot}
            </p>
          )}

          {err && <p style={{ fontSize: 13, color: '#f87171', margin: '4px 0' }}>⚠️ {err}</p>}
          {ok && <p style={{ fontSize: 13, color: '#86efac', margin: '4px 0' }}>✅ {ok}</p>}

          {mode === 'recover' ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => setModeAndClear('login')} style={{ flex: 1, padding: '13px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {T.backToLogin}
              </button>
              <button type="submit" disabled={busy} style={{ flex: 1, padding: '13px', borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                {busy ? '…' : T.emailBtn}
              </button>
            </div>
          ) : (
            <>
              <button type="submit" disabled={busy} style={{ width: '100%', padding: '13px', borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
                {busy ? '…' : (mode === 'login' ? T.submit : T.register)}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 12px' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{T.orContinue}</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
              </div>

              <button type="button" onClick={handleGoogle} disabled={busy} style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#fff', color: '#111', border: '1px solid #e5e7eb', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>G</span> {T.google}
              </button>
            </>
          )}
        </form>

        {mode !== 'recover' && (
          <p style={{ fontSize: 13, color: '#84cc16', cursor: 'pointer', textAlign: 'center', marginTop: 16 }} onClick={() => setModeAndClear(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? T.noAccount : T.haveAccount}
          </p>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14, marginBottom: 12, boxSizing: 'border-box',
};