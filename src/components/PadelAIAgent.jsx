import React, { useEffect, useRef, useState } from 'react';

const I18N = {
  es: {
    title: 'PadelCoach AI', subtitle: 'Experto en pádel · Wikipedia interactiva',
    placeholder: 'Pregúntame lo que quieras sobre pádel…',
    open: 'Abrir PadelCoach AI', typing: 'PadelCoach está escribiendo…', offline: 'PadelCoach está offline.',
    suggest1: '¿Qué es el Punto de Oro?', suggest2: 'Palas para empezar este año', suggest3: '¿Cómo se organiza un Americano?',
    listen: 'Dictar con el micrófono', listening: 'Escuchando…',
    speak: 'Leer en voz alta', stopSpeak: 'Detener la lectura',
    expand: 'Pantalla completa', collapse: 'Salir de pantalla completa',
    share: 'Compartir', whatsapp: 'WhatsApp', telegram: 'Telegram', x: 'X (Twitter)', copy: 'Copiar', copied: '¡Copiado!',
  },
  en: {
    title: 'PadelCoach AI', subtitle: 'Padel expert · Interactive Wikipedia',
    placeholder: 'Ask me anything about padel…',
    open: 'Open PadelCoach AI', typing: 'PadelCoach is typing…', offline: 'PadelCoach is offline.',
    suggest1: 'What is the Golden Point?', suggest2: 'Rackets to start this year', suggest3: 'How do you run an Americano?',
    listen: 'Dictate with the mic', listening: 'Listening…',
    speak: 'Read aloud', stopSpeak: 'Stop reading',
    expand: 'Full screen', collapse: 'Exit full screen',
    share: 'Share', whatsapp: 'WhatsApp', telegram: 'Telegram', x: 'X (Twitter)', copy: 'Copy', copied: 'Copied!',
  },
  fr: {
    title: 'PadelCoach AI', subtitle: 'Expert padel · Wikipédia interactive',
    placeholder: 'Posez-moi toutes vos questions padel…',
    open: 'Ouvrir PadelCoach AI', typing: 'PadelCoach écrit…', offline: 'PadelCoach est hors ligne.',
    suggest1: 'Qu’est-ce que le Point d’Or ?', suggest2: 'Palas pour débuter cette année', suggest3: 'Comment organiser un Américain ?',
    listen: 'Dicter avec le micro', listening: 'À l’écoute…',
    speak: 'Lire à voix haute', stopSpeak: 'Arrêter la lecture',
    expand: 'Plein écran', collapse: 'Quitter le plein écran',
    share: 'Partager', whatsapp: 'WhatsApp', telegram: 'Telegram', x: 'X (Twitter)', copy: 'Copier', copied: 'Copié !',
  },
  pt: {
    title: 'PadelCoach AI', subtitle: 'Especialista em padel · Wikipédia interativa',
    placeholder: 'Pergunte-me o que quiser sobre padel…',
    open: 'Abrir PadelCoach AI', typing: 'PadelCoach está a escrever…', offline: 'PadelCoach está offline.',
    suggest1: 'O que é o Ponto de Ouro?', suggest2: 'Palas para começar este ano', suggest3: 'Como se organiza um Americano?',
    listen: 'Ditar com o microfone', listening: 'A ouvir…',
    speak: 'Ler em voz alta', stopSpeak: 'Parar a leitura',
    expand: 'Ecrã inteiro', collapse: 'Sair do ecrã inteiro',
    share: 'Partilhar', whatsapp: 'WhatsApp', telegram: 'Telegram', x: 'X (Twitter)', copy: 'Copiar', copied: 'Copiado!',
  },
};

const LANG_BCP47 = { es: 'es', en: 'en-US', fr: 'fr-FR', pt: 'pt-PT' };

const miniBtn = {
  border: '1px solid rgba(250,204,21,0.4)', background: 'rgba(250,204,21,0.14)',
  color: '#fde68a', borderRadius: '999px', fontSize: '11px', padding: '4px 9px', cursor: 'pointer',
};

const bubble = (isUser, maximized) => ({
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  maxWidth: maximized ? 'min(720px, 88%)' : '88%',
  padding: '10px 13px', borderRadius: '12px', fontSize: '13.5px', lineHeight: 1.5,
  whiteSpace: 'pre-wrap', color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)', position: 'relative',
  background: isUser ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(255,255,255,0.07)',
  borderTopRightRadius: isUser ? '3px' : '12px',
  borderTopLeftRadius: isUser ? '12px' : '3px',
});

export default function PadelAIAgent({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [listening, setListening] = useState(false);
  const [shareIdx, setShareIdx] = useState(null);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, busy]);

  useEffect(() => {
    if (window.speechSynthesis) {
      const load = () => window.speechSynthesis.getVoices();
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
    return () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); };
  }, []);

  const ask = async (text) => {
    const q = (text || msg).trim();
    if (!q || busy) return;
    const history = msgs.map(m => ({ role: m.me ? 'user' : 'assistant', content: m.text }));
    const next = [...msgs, { me: true, text: q }];
    setMsgs(next);
    setMsg('');
    setBusy(true);
    try {
      const r = await fetch('/api/padel-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history, lang }),
      });
      const json = await r.json();
      if (json && json.reply) {
        setMsgs([...next, { me: false, text: json.reply }]);
      } else if (json && json.error) {
        setMsgs([...next, { me: false, text: `⚠️ ${json.error}` }]);
      }
    } catch {
      setMsgs([...next, { me: false, text: `⚠️ ${T.offline}` }]);
    } finally {
      setBusy(false);
    }
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      setListening(true);
      const rec = new SR();
      recRef.current = rec;
      const base = (LANG_BCP47[lang] || 'es').split('-')[0];
      rec.lang = base === 'en' ? 'en-US' : base === 'fr' ? 'fr-FR' : base === 'pt' ? 'pt-BR' : 'es-ES';
      rec.interimResults = false;
      rec.continuous = false;
      rec.onresult = (e) => {
        const t = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : '';
        if (t) {
          setMsg(t);
          ask(t);
        }
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const speakText = (text, i) => {
    if (!window.speechSynthesis) return;
    if (speakingIdx === i) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_BCP47[lang] || 'es';
    const base = (LANG_BCP47[lang] || 'es').split('-')[0];
    const voice = (window.speechSynthesis.getVoices() || []).find(v => v.lang && v.lang.toLowerCase().startsWith(base));
    if (voice) u.voice = voice;
    u.onend = () => setSpeakingIdx(null);
    u.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(i);
    window.speechSynthesis.speak(u);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(!open); setMaximized(false); }}
        aria-label={T.open}
        title={T.open}
        style={{
          position: 'fixed', right: '22px', bottom: '22px', zIndex: maximized ? 900 : 1200,
          width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', border: 'none',
          background: open ? 'linear-gradient(135deg,#a16207,#eab308)' : 'linear-gradient(135deg,#16a34a,#eab308)',
          color: '#fff', fontSize: '26px', boxShadow: '0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(250,204,21,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .2s',
        }}
      >
        {open ? '✕' : '🎾'}
      </button>

      {open && (
        <div style={maximized ? {
          position: 'fixed', inset: 0, zIndex: 1250, borderRadius: 0, display: 'flex', flexDirection: 'column',
          background: 'var(--padel-card-bg, #0a1613)',
        } : {
          position: 'fixed', right: '22px', bottom: '92px', zIndex: 1200,
          width: 'min(380px, calc(100vw - 44px))', height: 'min(560px, calc(100vh - 140px))',
          display: 'flex', flexDirection: 'column', borderRadius: '18px', overflow: 'hidden',
          background: 'var(--padel-card-bg, #0e1e1b)', border: '1px solid rgba(250,204,21,0.35)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: maximized ? '18px 7vw' : '14px 16px', background: 'linear-gradient(135deg,#1a1206,#2a1c06)', borderBottom: '1px solid rgba(250,204,21,0.25)' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#eab308,#a16207)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, color: '#fff' }}>🎾</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: maximized ? '18px' : '15px', fontWeight: 800, color: 'var(--padel-text, #fff)' }}>{T.title}</div>
              <div style={{ fontSize: '11px', color: 'rgba(250,204,21,0.9)', fontWeight: 600 }}>{T.subtitle}</div>
            </div>
            <button
              onClick={() => setMaximized(!maximized)}
              title={maximized ? T.collapse : T.expand}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fde68a', borderRadius: 8, padding: '6px 10px', fontSize: 15, cursor: 'pointer' }}
            >
              {maximized ? '⤡' : '⤢'}
            </button>
          </div>

          <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: maximized ? '22px 7vw' : '14px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--padel-text, #eee)' }}>
            {msgs.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--padel-muted, #94a3b8)', marginBottom: '4px' }}>💡 {T.subtitle}</div>
                {[T.suggest1, T.suggest2, T.suggest3].map((s, i) => (
                  <button key={i} onClick={() => ask(s)} disabled={busy}
                    style={{ textAlign: 'left', padding: '9px 12px', borderRadius: '10px', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', color: 'var(--padel-text, #fff)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={bubble(m.me, maximized)}>
                {m.text}
                {!m.me && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button onClick={() => speakText(m.text, i)} title={speakingIdx === i ? T.stopSpeak : T.speak} style={miniBtn}>
                      {speakingIdx === i ? '⏹' : '🔊'} {T.speak}
                    </button>
                    <button onClick={() => setShareIdx(shareIdx === i ? null : i)} title={T.share} style={miniBtn}>📤 {T.share}</button>
                    {shareIdx === i && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 30, background: '#0f1f1b', border: '1px solid rgba(250,204,21,0.4)', borderRadius: 12, padding: 8, display: 'flex', gap: 6, flexWrap: 'wrap', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
                        {[
                          { label: T.whatsapp, url: `https://wa.me/?text=${encodeURIComponent(`${T.title}: ${m.text}`)}` },
                          { label: T.telegram, url: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`${T.title}: ${m.text}`)}` },
                          { label: T.x, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${T.title}: ${m.text}`)}&url=${encodeURIComponent(window.location.href)}` },
                        ].map((n, k) => (
                          <button key={k} onClick={() => { window.open(n.url, '_blank', 'noopener'); setShareIdx(null); }} style={miniBtn}>{n.label}</button>
                        ))}
                        <button
                          onClick={() => copyText(m.text)}
                          title={T.copy}
                          style={{ ...miniBtn, background: copied ? 'rgba(52,211,153,0.25)' : 'rgba(250,204,21,0.14)', color: copied ? '#86efac' : '#fde68a' }}
                        >
                          {copied ? `${T.copied} ✓` : T.copy}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {busy && <div style={{ alignSelf: 'flex-start', padding: '10px 13px', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', fontSize: '13px', color: 'var(--padel-muted, #94a3b8)' }}>{T.typing} <span style={{ color: '#eab308' }}>⚡</span></div>}
          </div>

          <form onSubmit={e => { e.preventDefault(); ask(); }} style={{ display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid rgba(250,204,21,0.2)', background: 'rgba(0,0,0,0.2)' }}>
            <button type="button" onClick={startListening} title={T.listen} disabled={busy || listening}
              style={{ padding: '0 12px', borderRadius: '10px', border: listening ? '1px solid #f87171' : '1px solid rgba(250,204,21,0.4)', background: listening ? 'rgba(248,113,113,0.2)' : 'rgba(250,204,21,0.12)', color: listening ? '#fca5a5' : '#fde68a', fontSize: '17px', cursor: 'pointer' }}>
              🎙️
            </button>
            <input
              value={msg} onChange={e => setMsg(e.target.value)} placeholder={listening ? T.listening : T.placeholder}
              disabled={busy}
              style={{ flex: 1, padding: '11px 13px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.35)', color: 'var(--padel-text, #fff)', fontSize: '13.5px', outline: 'none' }}
            />
            <button type="submit" disabled={busy || !msg.trim()} style={{ padding: '0 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#eab308,#a16207)', color: '#fff', fontWeight: 800, fontSize: '16px', cursor: busy || !msg.trim() ? 'not-allowed' : 'pointer', opacity: busy || !msg.trim() ? 0.5 : 1 }}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}