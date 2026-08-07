import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { isOnline, subscribeMode } from '../services/connection';

const I18N = {
  es: { title: '💬 Chat del Torneo', placeholder: 'Escribe un mensaje…', send: 'Enviar', empty: 'Sin mensajes. ¡Anima el torneo!', storage: 'Local (demo)', sync: 'Supabase en vivo' },
  en: { title: '💬 Tournament Chat', placeholder: 'Type a message…', send: 'Send', empty: 'No messages yet. Cheer on the match!', storage: 'Local (demo)', sync: 'Supabase live' },
  fr: { title: '💬 Chat du tournoi', placeholder: 'Écrivez un message…', send: 'Envoyer', empty: 'Aucun message. Encouragez le tournoi !', storage: 'Local (démo)', sync: 'Supabase en direct' },
  pt: { title: '💬 Chat do torneio', placeholder: 'Escreva uma mensagem…', send: 'Enviar', empty: 'Sem mensagens. Anima o torneio!', storage: 'Local (demo)', sync: 'Supabase ao vivo' },
};

const LS_KEY = 'padelorganizers-chat';

export default function TournamentChat({ lang = 'es', tournamentId = 'demo' }) {
  const T = I18N[lang] || I18N.es;
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [nick, setNick] = useState('Jugador');
  const boxRef = useRef(null);
  const [online, setOnline] = useState(isOnline());

  useEffect(() => subscribeMode(setOnline), [])

  // carga inicial
  useEffect(() => {
    if (online) {
      supabase
        .from('messages')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: true })
        .limit(200)
        .then(({ data, error }) => {
          if (!error) setMessages(data || []);
        });
      // suscripción realtime
      const sub = supabase
        .channel(`chat-${tournamentId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();
      return () => supabase.removeChannel(sub);
    }
    try { setMessages(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); } catch { setMessages([]); }
  }, [online, tournamentId]);

  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [messages]);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    const author = nick.trim() || 'Jugador';
    if (online) {
      await supabase.from('messages').insert([{ tournament_id: tournamentId, author, body }]);
    } else {
      const next = [...messages, { author, body, created_at: new Date().toISOString(), id: `l-${Date.now()}` }];
      setMessages(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }
    setDraft('');
  };

  return (
    <div style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 420 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>{T.title}</h3>
        <span style={{ fontSize: '11px', fontWeight: 700, color: online ? '#84cc16' : '#94a3b8', background: online ? 'rgba(132,204,22,0.1)' : 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '12px' }}>
          {online ? `🟢 ${T.sync}` : `⚙️ ${T.storage}`}
        </span>
      </div>

      <div ref={boxRef} style={{ flex: 1, overflowY: 'auto', maxHeight: 260, paddingRight: 4 }}>
        {messages.length === 0 && <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 30 }}>{T.empty}</p>}
        {messages.map((m, i) => (
          <div key={m.id || i} style={{ marginBottom: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <strong style={{ fontSize: 12, color: '#84cc16' }}>{m.author || 'Jugador'}</strong>
              <span style={{ fontSize: 10, color: '#64748b' }}>{formatTime(m.created_at)}</span>
            </div>
            <div style={{ fontSize: 14, color: '#f0fdf4' }}>{m.body}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input value={nick} onChange={e => setNick(e.target.value)} maxLength={20}
          style={{ width: 110, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 13 }}
          placeholder="Nick" />
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} maxLength={500}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 13 }}
          placeholder={T.placeholder} />
        <button onClick={send} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {T.send}
        </button>
      </div>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}