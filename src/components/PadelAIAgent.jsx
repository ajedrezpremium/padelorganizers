import React, { useEffect, useRef, useState } from 'react';

const I18N = {
  es: {
    title: 'PadelCoach AI', subtitle: 'Experto en pádel · Wikipedia interactiva',
    placeholder: 'Pregúntame lo que quieras sobre pádel…',
    open: 'Abrir PadelCoach AI', typing: 'PadelCoach está escribiendo…', offline: 'PadelCoach está offline.',
    suggest1: '¿Qué es el Punto de Oro?', suggest2: 'Palas para empezar este año', suggest3: '¿Cómo se organiza un Americano?',
    listen: 'Dictar con el micrófono', listening: 'Escuchando…',
    speak: 'Leer', stopSpeak: 'Detener la lectura',
    expand: 'Pantalla completa', collapse: 'Salir de pantalla completa',
    share: 'Compartir', whatsapp: 'WhatsApp', telegram: 'Telegram', x: 'X (Twitter)', fb: 'Facebook', copy: 'Copiar', copied: '¡Copiado!',
    clear: 'Limpiar', exportChat: 'Exportar', regenerate: 'Regenerar',
    autoSpeak: 'Leer respuestas automáticamente', autoSend: 'Enviar al terminar de dictar',
    voice: 'Voz', voiceMale: 'Voces masculinas', voiceFemale: 'Voces femeninas', voiceOther: 'Otras voces',
    noVoices: 'El navegador no ofrece voces filtrables. Usando las predeterminadas.',
  },
  en: {
    title: 'PadelCoach AI', subtitle: 'Padel expert · Interactive Wikipedia',
    placeholder: 'Ask me anything about padel…',
    open: 'Open PadelCoach AI', typing: 'PadelCoach is typing…', offline: 'PadelCoach is offline.',
    suggest1: 'What is the Golden Point?', suggest2: 'Rackets to start this year', suggest3: 'How do you run an Americano?',
    listen: 'Dictate with the mic', listening: 'Listening…',
    speak: 'Read aloud', stopSpeak: 'Stop reading',
    expand: 'Full screen', collapse: 'Exit full screen',
    share: 'Share', whatsapp: 'WhatsApp', telegram: 'Telegram', x: 'X (Twitter)', fb: 'Facebook', copy: 'Copy', copied: 'Copied!',
    clear: 'Clear', exportChat: 'Export', regenerate: 'Regenerate',
    autoSpeak: 'Read replies automatically', autoSend: 'Send when dictation ends',
    voice: 'Voice', voiceMale: 'Male voices', voiceFemale: 'Female voices', voiceOther: 'Other voices',
    noVoices: 'Browser exposes no filterable voices. Using defaults.',
  },
  fr: {
    title: 'PadelCoach AI', subtitle: 'Expert padel · Wikipédia interactive',
    placeholder: 'Posez-moi toutes vos questions padel…',
    open: 'Ouvrir PadelCoach AI', typing: 'PadelCoach écrit…', offline: 'PadelCoach est hors ligne.',
    suggest1: 'Qu’est-ce que le Point d’Or ?', suggest2: 'Palas pour débuter cette année', suggest3: 'Comment organiser un Américain ?',
    listen: 'Dicter avec le micro', listening: 'À l’écoute…',
    speak: 'Lire à voix haute', stopSpeak: 'Arrêter la lecture',
    expand: 'Plein écran', collapse: 'Quitter le plein écran',
    share: 'Partager', whatsapp: 'WhatsApp', telegram: 'Telegram', x: 'X (Twitter)', fb: 'Facebook', copy: 'Copier', copied: 'Copié !',
    clear: 'Effacer', exportChat: 'Exporter', regenerate: 'Régénérer',
    autoSpeak: 'Lire automatiquement les réponses', autoSend: 'Envoyer à la fin de la dictée',
    voice: 'Voix', voiceMale: 'Voix masculines', voiceFemale: 'Voix féminines', voiceOther: 'Autres voix',
    noVoices: 'Le navigateur n’expose pas de voix filtrable. Voix par défaut utilisées.',
  },
  pt: {
    title: 'PadelCoach AI', subtitle: 'Especialista em padel · Wikipédia interativa',
    placeholder: 'Pergunte-me o que quiser sobre padel…',
    open: 'Abrir PadelCoach AI', typing: 'PadelCoach está a escrever…', offline: 'PadelCoach está offline.',
    suggest1: 'O que é o Ponto de Ouro?', suggest2: 'Palas para começar este ano', suggest3: 'Como se organiza um Americano?',
    listen: 'Ditar com o microfone', listening: 'A ouvir…',
    speak: 'Ler em voz alta', stopSpeak: 'Parar a leitura',
    expand: 'Ecrã inteiro', collapse: 'Sair do ecrã inteiro',
    share: 'Partilhar', whatsapp: 'WhatsApp', telegram: 'Telegram', x: 'X (Twitter)', fb: 'Facebook', copy: 'Copiar', copied: 'Copiado!',
    clear: 'Limpar', exportChat: 'Exportar', regenerate: 'Regenerar',
    autoSpeak: 'Ler respostas automaticamente', autoSend: 'Enviar ao fim da dictação',
    voice: 'Voz', voiceMale: 'Vozes masculinas', voiceFemale: 'Vozes femininas', voiceOther: 'Outras vozes',
    noVoices: 'O navegador não expõe vozes filtráveis. Usando as predefinidas.',
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

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderMd(text) {
  let out = escapeHtml(text || '');
  // bold **x** y __x__
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // italics *x* y _x_
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  out = out.replace(/_(.+?)_/g, '<em>$1</em>');
  // code inline `x`
  out = out.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.15);padding:1px 4px;border-radius:4px">$1</code>');
  // saltos de línea → br
  out = out.replace(/\n/g, '<br />');
  return out;
}

function fmtTime(lang) {
  try {
    return new Date().toLocaleTimeString(LANG_BCP47[lang] || 'es', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function guessVoiceBucket(v) {
  const t = `${v.name} ${v.lang}`.toLowerCase();
  // voces que el navegador etiqueta como femeninas
  if (/female|mujer|femme|dona|woman|signals?\s*female/i.test(t) && !/male/i.test(t)) return 'female';
  // voces masculinas
  if (/male|hombre|homme|varon|masculino|man\b/i.test(t) && !/female/i.test(t)) return 'male';
  return 'other';
}

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
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [autoSendVoice, setAutoSendVoice] = useState(true);
  const bodyRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, busy]);

  // cargar voces del navegador y agruparlas
  useEffect(() => {
    const load = () => {
      const vs = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      setVoices(vs);
      if (!selectedVoice && vs.length) {
        // elige una voz del idioma actual si la hay
        const base = (LANG_BCP47[lang] || 'es').split('-')[0];
        const pick = vs.find((v) => v.lang && v.lang.toLowerCase().startsWith(base)) || vs[0];
        if (pick) setSelectedVoice(pick.name);
      }
    };
    if (window.speechSynthesis) {
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
    return () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // auto-lectura de la última respuesta del asistente si está activada
  useEffect(() => {
    if (!autoSpeak) return;
    if (msgs.length === 0) return;
    const lastIdx = msgs.length - 1;
    const last = msgs[lastIdx];
    if (last.me) return;
    speakText(last.text, lastIdx, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgs]);

  const ask = async (text, opts = {}) => {
    const q = (text || msg).trim();
    if (!q || busy) return;
    const history = msgs.map((m) => ({ role: m.me ? 'user' : 'assistant', content: m.text }));
    const next = opts.omitUser ? msgs : [...msgs, { me: true, text: q, at: new Date().toISOString() }];
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
        setMsgs([...next, { me: false, text: json.reply, at: new Date().toISOString() }]);
      } else if (json && json.error) {
        setMsgs([...next, { me: false, text: `⚠️ ${json.error}`, at: new Date().toISOString() }]);
      }
    } catch {
      setMsgs([...next, { me: false, text: `⚠️ ${T.offline}`, at: new Date().toISOString() }]);
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
          if (autoSendVoice) ask(t);
        }
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const speakText = (text, i, forced = false) => {
    if (!window.speechSynthesis) return;
    if (speakingIdx === i && !forced) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_BCP47[lang] || 'es';
    const voice = voices.find((v) => v.name === selectedVoice);
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

  const exportChat = () => {
    if (msgs.length === 0) return;
    const lines = msgs.map((m) => `[${m.me ? 'TÚ' : 'PadelCoach'} ${m.at ? new Date(m.at).toLocaleString() : ''}]\n${m.text}`);
    const blob = new Blob([lines.join('\n\n---\n\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `padelcoach-conversacion-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingIdx(null);
    setMsgs([]);
  };

  const regenerateLast = () => {
    if (msgs.length === 0) return;
    const lastUser = [...msgs].reverse().find((m) => m.me);
    if (!lastUser) return;
    // quita la última respuesta del asistente (si la hay) y relanza
    const trimmed = msgs[msgs.length - 1] && !msgs[msgs.length - 1].me ? msgs.slice(0, -1) : msgs;
    setMsgs(trimmed);
    ask(lastUser.text, { omitUser: true });
  };

  const groupedVoices = {
    male: voices.filter((v) => guessVoiceBucket(v) === 'male'),
    female: voices.filter((v) => guessVoiceBucket(v) === 'female'),
    other: voices.filter((v) => guessVoiceBucket(v) === 'other'),
  };
  const hasGrouped = groupedVoices.male.length || groupedVoices.female.length || groupedVoices.other.length;

  const openShare = (url) => { window.open(url, '_blank', 'noopener'); setShareIdx(null); };

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
            <button onClick={() => setMaximized(!maximized)} title={maximized ? T.collapse : T.expand} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fde68a', borderRadius: 8, padding: '6px 10px', fontSize: 15, cursor: 'pointer' }}>
              {maximized ? '⤡' : '⤢'}
            </button>
            <button onClick={clearChat} title={T.clear} style={{ ...miniBtn, marginLeft: 4 }}>🧹 {T.clear}</button>
            <button onClick={exportChat} title={T.exportChat} disabled={msgs.length === 0} style={{ ...miniBtn, marginLeft: 4, opacity: msgs.length === 0 ? 0.4 : 1 }}>⬇️ {T.exportChat}</button>
          </div>

          {/* Ajustes avanzados */}
          <div style={{ padding: '6px 12px', background: 'rgba(250,204,21,0.05)', borderBottom: '1px solid rgba(250,204,21,0.18)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: 12 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#fde68a', cursor: 'pointer' }}>
              <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
              {T.autoSpeak}
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#fde68a', cursor: 'pointer' }}>
              <input type="checkbox" checked={autoSendVoice} onChange={(e) => setAutoSendVoice(e.target.checked)} />
              {T.autoSend}
            </label>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#fde68a' }}>
              {T.voice}:
              <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', color: '#fde68a', border: '1px solid rgba(250,204,21,0.4)', borderRadius: 6, fontSize: 11, padding: 2 }}>
                {hasGrouped ? (
                  <>
                    {groupedVoices.female.length > 0 && (
                      <optgroup label={T.voiceFemale}>
                        {groupedVoices.female.map((v) => (<option key={v.name} value={v.name}>{v.name}</option>))}
                      </optgroup>
                    )}
                    {groupedVoices.male.length > 0 && (
                      <optgroup label={T.voiceMale}>
                        {groupedVoices.male.map((v) => (<option key={v.name} value={v.name}>{v.name}</option>))}
                      </optgroup>
                    )}
                    {groupedVoices.other.length > 0 && (
                      <optgroup label={T.voiceOther}>
                        {groupedVoices.other.map((v) => (<option key={v.name} value={v.name}>{v.name}</option>))}
                      </optgroup>
                    )}
                  </>
                ) : (
                  voices.map((v) => (<option key={v.name} value={v.name}>{v.name}</option>))
                )}
              </select>
            </div>
            {voices.length === 0 && <span style={{ fontSize: 11, color: 'var(--padel-muted, #94a3b8)' }}>{T.noVoices}</span>}
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
                {m.me ? m.text : (<span dangerouslySetInnerHTML={{ __html: renderMd(m.text) }} />)}
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 4, textAlign: m.me ? 'right' : 'left' }}>
                  {m.at ? new Date(m.at).toLocaleTimeString() : ''}
                </div>
                {!m.me && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button onClick={() => speakText(m.text, i)} title={speakingIdx === i ? T.stopSpeak : T.speak} style={miniBtn}>
                      {speakingIdx === i ? '⏹' : '🔊'} {T.speak}
                    </button>
                    <button onClick={() => setShareIdx(shareIdx === i ? null : i)} title={T.share} style={miniBtn}>📤 {T.share}</button>
                    <button onClick={regenerateLast} title={T.regenerate} style={miniBtn}>🔄 {T.regenerate}</button>
                    {shareIdx === i && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 30, background: '#0f1f1b', border: '1px solid rgba(250,204,21,0.4)', borderRadius: 12, padding: 8, display: 'flex', gap: 6, flexWrap: 'wrap', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
                        {[
                          { label: T.whatsapp, url: `https://wa.me/?text=${encodeURIComponent(`${T.title}: ${m.text}`)}` },
                          { label: T.telegram, url: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`${T.title}: ${m.text}`)}` },
                          { label: T.x, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${T.title}: ${m.text}`)}&url=${encodeURIComponent(window.location.href)}` },
                          { label: T.fb, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`${T.title}: ${m.text}`)}` },
                        ].map((n, k) => (
                          <button key={k} onClick={() => openShare(n.url)} style={miniBtn}>{n.label}</button>
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

          <form onSubmit={(e) => { e.preventDefault(); ask(); }} style={{ display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid rgba(250,204,21,0.2)', background: 'rgba(0,0,0,0.2)' }}>
            <button type="button" onClick={startListening} title={T.listen} disabled={busy || listening}
              style={{ padding: '0 12px', borderRadius: '10px', border: listening ? '1px solid #f87171' : '1px solid rgba(250,204,21,0.4)', background: listening ? 'rgba(248,113,113,0.2)' : 'rgba(250,204,21,0.12)', color: listening ? '#fca5a5' : '#fde68a', fontSize: '17px', cursor: 'pointer' }}>
              🎙️
            </button>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={listening ? T.listening : T.placeholder}
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
