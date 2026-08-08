import React, { useEffect, useRef, useState } from 'react';

const I18N = {
  es: {
    title: 'PadelCoach AI', subtitle: 'Experto en pádel · Wikipedia interactiva',
    placeholder: 'Pregúntame lo que quieras sobre pádel…',
    open: 'Abrir PadelCoach AI', typing: 'PadelCoach está escribiendo…', offline: 'PadelCoach está offline.',
    suggest1: '¿Qué es el Punto de Oro?', suggest2: 'Palas para empezar este año', suggest3: '¿Cómo se organiza un Americano?',
  },
  en: {
    title: 'PadelCoach AI', subtitle: 'Padel expert · Interactive Wikipedia',
    placeholder: 'Ask me anything about padel…',
    open: 'Open PadelCoach AI', typing: 'PadelCoach is typing…', offline: 'PadelCoach is offline.',
    suggest1: 'What is the Golden Point?', suggest2: 'Rackets to start this year', suggest3: 'How do you run an Americano?',
  },
  fr: {
    title: 'PadelCoach AI', subtitle: 'Expert padel · Wikipédia interactive',
    placeholder: 'Posez-moi toutes vos questions padel…',
    open: 'Ouvrir PadelCoach AI', typing: 'PadelCoach écrit…', offline: 'PadelCoach est hors ligne.',
    suggest1: 'Qu’est-ce que le Point d’Or ?', suggest2: 'Palas pour débuter cette année', suggest3: 'Comment organiser un Américain ?',
  },
  pt: {
    title: 'PadelCoach AI', subtitle: 'Especialista em padel · Wikipédia interativa',
    placeholder: 'Pergunte-me o que quiser sobre padel…',
    open: 'Abrir PadelCoach AI', typing: 'PadelCoach está a escrever…', offline: 'PadelCoach está offline.',
    suggest1: 'O que é o Ponto de Ouro?', suggest2: 'Palas para começar este ano', suggest3: 'Como se organiza um Americano?',
  },
};

export default function PadelAIAgent({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, busy]);

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

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={T.open}
        title={T.open}
        style={{
          position: 'fixed', right: '22px', bottom: '22px', zIndex: 1200,
          width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', border: 'none',
          background: open ? 'linear-gradient(135deg,#a16207,#eab308)' : 'linear-gradient(135deg,#16a34a,#eab308)',
          color: '#fff', fontSize: '26px', boxShadow: '0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(250,204,21,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .2s',
        }}
      >
        {open ? '✕' : '🎾'}
      </button>

      {/* Panel de chat */}
      {open && (
        <div style={{
          position: 'fixed', right: '22px', bottom: '92px', zIndex: 1200,
          width: 'min(380px, calc(100vw - 44px))', height: 'min(520px, calc(100vh - 140px))',
          display: 'flex', flexDirection: 'column', borderRadius: '18px', overflow: 'hidden',
          background: 'var(--padel-card-bg, #0e1e1b)', border: '1px solid rgba(250,204,21,0.35)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
        }}>
          {/* Cabecera */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'linear-gradient(135deg,#1a1206,#2a1c06)', borderBottom: '1px solid rgba(250,204,21,0.25)' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#eab308,#a16207)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, color: '#fff' }}>🎾</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--padel-text, #fff)' }}>{T.title}</div>
              <div style={{ fontSize: '11px', color: 'rgba(250,204,21,0.9)', fontWeight: 600 }}>{T.subtitle}</div>
            </div>
          </div>

          {/* Mensajes */}
          <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--padel-text, #eee)' }}>
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
              <div key={i} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '10px 13px', borderRadius: '12px', fontSize: '13.5px', lineHeight: 1.5, whiteSpace: 'pre-wrap', background: m.me ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(255,255,255,0.07)', color: '#fff', borderTopRightRadius: m.me ? '3px' : '12px', borderTopLeftRadius: m.me ? '12px' : '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>
                {m.text}
              </div>
            ))}
            {busy && <div style={{ alignSelf: 'flex-start', padding: '10px 13px', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', fontSize: '13px', color: 'var(--padel-muted, #94a3b8)' }}>{T.typing} <span style={{ color: '#eab308' }}>⚡</span></div>}
          </div>

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); ask(); }} style={{ display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid rgba(250,204,21,0.2)', background: 'rgba(0,0,0,0.2)' }}>
            <input
              value={msg} onChange={e => setMsg(e.target.value)} placeholder={T.placeholder}
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