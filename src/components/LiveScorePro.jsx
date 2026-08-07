import React, { useEffect, useState } from 'react';
import MatchCard from './MatchCard';
import { loadMoments, addMoment, toggleVote } from '../services/momentsService';

const I18N = {
  es: {
    badge: 'RETRANSMISIÓN · LiveScore Pro',
    featured: 'Partido destacado', live: 'EN DIRECTO', tournament: 'Torneo',
    feed: 'Moments del partido', addMoment: '🔥 Punto de la ronda', vote: '¡Me gusta!',
    noMoments: 'Todavía no hay moments. ¡Captura el primero!', set: 'Set', pts: 'Puntos',
    finish: 'Partido finalizado', share: 'Comparte la tarjeta social', watch: 'Público en vivo',
  },
  en: {
    badge: 'LIVE · LiveScore Pro', featured: 'Featured match', live: 'LIVE', tournament: 'Tournament',
    feed: 'Match Moments', addMoment: '🔥 Point of the round', vote: 'Like!',
    noMoments: 'No moments yet. Capture the first one!', set: 'Set', pts: 'Points',
    finish: 'Match finished', share: 'Share the social card', watch: 'Live viewers',
  },
  fr: {
    badge: 'DIRECT · LiveScore Pro', featured: 'Match à la une', live: 'EN DIRECT', tournament: 'Tournoi',
    feed: 'Moments du match', addMoment: '🔥 Point définissant', vote: 'J\'aime !',
    noMoments: 'Aucun moment. Capturez le premier !', set: 'Set', pts: 'Points',
    finish: 'Match terminé', share: 'Partagez la carte sociale', watch: 'spectateurs en direct',
  },
  pt: {
    badge: 'DIRETO · LiveScore Pro', featured: 'Jogo em destaque', live: 'AO VIVO', tournament: 'Torneio',
    feed: 'Moments do jogo', addMoment: '🔥 Ponta da ronda', vote: 'Gosto!',
    noMoments: 'Ainda sem moments. Capture o primeiro!', set: 'Set', pts: 'Pontos',
    finish: 'Jogo terminado', share: 'Partilhe o cartão social', watch: 'público ao vivo',
  },
};

// Partido en vivo reutilizando el store del torneo (si hay match activo) o una demo interna.
export default function LiveScorePro({ lang = 'es', state }) {
  const T = I18N[lang] || I18N.es;
  const activeMatch = state?.matches?.find(m => m.status === 'in_progress');
  const primary = activeMatch || { id: 'demo-live', pair1Names: 'Galán / Lebrón', pair2Names: 'Tapia / Coello' };

  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);
  const [finished, setFinished] = useState(false);
  const [winner, setWinner] = useState(0);
  const [moments, setMoments] = useState([]);
  const [viewers, setViewers] = useState(128);

  useEffect(() => {
    setMoments(loadMoments(primary.id));
  }, [primary?.id]);

  const capture = () => {
    const updated = addMoment({
      matchId: primary.id,
      pair1Names: primary.pair1Names, pair2Names: primary.pair2Names,
      score: `${p1}-${p2}`,
    });
    setMoments(updated);
  };

  const vote = (id) => setMoments(toggleVote(primary.id, id));

  const endMatch = () => {
    const w = s1 > s2 ? 0 : 1;
    setWinner(w);
    setFinished(true);
  };

  const vistaPunto = (player) => {
    if (finished) return;
    if (player === 0) {
      const np = p1 + 1;
      setP1(np);
      if (np >= 6) { setS1(a => a + 1); setP1(0); }
    } else {
      const np = p2 + 1;
      setP2(np);
      if (np >= 6) { setS2(a => a + 1); setP2(0); }
    }
    setViewers(v => v + 1);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="pulse-glow" style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.5)', color: '#fb7185', padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} /> {T.live}
          </span>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{T.tournament} · {state?.tournament?.name || 'Open'}</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>👁 {viewers} {T.watch}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>
        {/* Marcador en vivo */}
        <div style={{ background: 'linear-gradient(135deg,#0a1a17,#0e1e1b)', border: '2px solid rgba(244,63,94,0.25)', borderRadius: 20, padding: 22 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>🏟️ {T.featured}</h3>
          {[
            [0, primary.pair1Names, '#38bdf8', p1, s1],
            [1, primary.pair2Names, '#f43f5e', p2, s2],
          ].map(([idx, name, color, pts, st]) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: color, marginRight: 10 }} />
              <span style={{ flex: 1, fontSize: 16, fontWeight: 800, color }}>{name}</span>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginRight: 14 }}>{T.set} {st}</span>
              <span style={{ fontSize: 30, fontWeight: 900, color: '#84cc16', width: 40, textAlign: 'center' }}>{pts}</span>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
            <button onClick={() => vistaPunto(0)} disabled={finished} style={bigBtn('#38bdf8')}>🔵 +1 {T.pts}</button>
            <button onClick={() => vistaPunto(1)} disabled={finished} style={bigBtn('#f43f5e')}>🔴 +1 {T.pts}</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={endMatch} disabled={finished} style={{ width: '100%', background: 'rgba(132,204,22,0.15)', border: '1px solid rgba(132,204,22,0.4)', color: '#84cc16', padding: 10, borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              ⏱ {T.finish}
            </button>
          </div>
          {finished && (
            <div style={{ marginTop: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.55)', padding: 14, borderRadius: 12, textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: 15 }}>
              🏆 {(winner === 0 ? primary.pair1Names : primary.pair2Names)} · {T.finish} {s1}-{s2}
            </div>
          )}
        </div>

        {/* Moments */}
        <div style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>🔥 {T.feed}</h3>
            <button onClick={capture} disabled={finished} style={{ background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: 'pointer', opacity: finished ? 0.5 : 1 }}>
              {T.addMoment}
            </button>
          </div>
          {moments.length === 0 && <p style={{ color: '#64748b', fontSize: 13 }}>{T.noMoments}</p>}
          {moments.slice().reverse().map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 12px', marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>🔥</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0fdf4' }}>{m.title}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{m.pair1Names} vs {m.pair2Names} · {m.score}</div>
              </div>
              <button onClick={() => vote(m.id)} style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185', padding: '6px 10px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer' }} title={T.vote}>
                ❤️ {m.votes}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tarjeta social al terminar */}
      {finished && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 16', textAlign: 'center' }}>📸 {T.share}</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <MatchCard lang={lang} pair1={primary.pair1Names} pair2={primary.pair2Names} score1={s1} score2={s2} sets1={s1} sets2={s2} winner={winner} />
          </div>
        </div>
      )}
    </div>
  );
}

const bigBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '26px 10px', borderRadius: 14, fontWeight: 800, fontSize: 20, cursor: 'pointer' });