import React, { useEffect, useState } from 'react';
import MatchCard from './MatchCard';
import { loadMoments, addMoment, toggleVote } from '../services/momentsService';
import { updateLiveScore } from '../services/store';
import { pairToFichas } from '../services/playerProfileService';

const I18N = {
  es: {
    badge: 'RETRANSMISIÓN · LiveScore Pro',
    featured: 'Partido en directo', live: 'EN DIRECTO', tournament: 'Torneo',
    feed: 'Moments del partido', addMoment: '🔥 Punto de la ronda', vote: '¡Me gusta!',
    noMoments: 'Todavía no hay moments. ¡Captura el primero!', set: 'Set', pts: 'Puntos',
    finish: 'Finalizar partido', share: 'Comparte la tarjeta social', watch: 'espectadores',
    noActive: 'No hay partido en juego. Asigna uno en el Dashboard.',
    gold: 'Punto de Oro', go: '¡Siguiente punto gana el juego!',
  },
  en: {
    badge: 'LIVE · LiveScore Pro', featured: 'Featured match', tournament: 'Tournament',
    feed: 'Match Moments', addMoment: '🔥 Point of the round', vote: 'Like!',
    noMoments: 'No moments yet. Capture the first one!', set: 'Set', pts: 'Points',
    finish: 'Finish match', share: 'Share the social card', watch: 'viewers',
    no: 'No live match. Assign one in the Dashboard.',
    gold: 'Gold Point', go: 'Next point wins the game!',
  },
  fr: {
    badge: 'DIRECT · LiveScore Pro', featured: 'Match en direct', tournament: 'Tournoi',
    feed: 'Moments du match', addMoment: '🔥 Point du tour', vote: 'J\'aime !',
    noMoments: 'Aucun moment. Capturez le premier !', set: 'Set', pts: 'Points',
    finish: 'Terminer le match', share: 'Partagez la carte sociale', watch: 'spectateurs',
    gold: 'Point d\'Or', go: 'Le prochain point gagne le jeu !',
  },
  pt: {
    badge: 'DIRETO · LiveScore Pro', featured: 'Jogo em direto', tournament: 'Torneio',
    feed: 'Moments do jogo', addMoment: '🔥 Ponta da ronda', vote: 'Gosto!',
    noMoments: 'Ainda sem moments. Capture o primeiro!', set: 'Set', pts: 'Pontos',
    finish: 'Terminar jogo', share: 'Partilhe o cartão social', watch: 'espectadores',
    gold: 'Ponto de Ouro', go: 'O próximo ponto ganha o jogo!',
  },
};

const P = ['0', '15', '30', '40'];

// LiveScore Pro es un espejo real del estado del torneo (store global).
export default function LiveScorePro({ lang = 'es', state }) {
  const T = I18N[lang] || I18N.es;
  const activeMatch = state?.matches?.find(m => m.status === 'in_progress');

  const [moments, setMoments] = useState([]);
  const [viewers, setViewers] = useState(128);
  const [finished, setFinished] = useState(false);
  const [winner, setWinner] = useState(0);

  const live = activeMatch?.live || { games: [0, 0], pts: [0, 0], sets: [0, 0] };
  const goldPoint = activeMatch?.goldPointOccurrences > 0;

  const mKey = activeMatch?.id || 'cerrado';
  const tournKey = state?.tournament?.id || 'demo';

  useEffect(() => {
    loadMoments(activeMatch?.id || 'demo', { tournamentKey: state?.tournament?.id || 'demo' }).then(m => {
      setMoments(m);
    });
    setFinished(false);
  }, [activeMatch?.id]);

  const scorePoint = (player) => {
    if (!activeMatch) return;
    setFinished(false);
    let games = [...live.games];
    let pts = [...live.pts];
    let sets = [...live.sets];

    pts[player] += 1;
    // juego ganado (4 puntos con 2 de ventaja) — demo simplificada
    if (pts[player] === 4 && pts[player ^ 1] <= 2) {
      games[player] += 1;
      pts = [0, 0];
      // set ganado (6 juegos) / partido a 2 sets (best of 3)
      if (games[player] >= 6) {
        sets[player] += 1;
        games = [0, 0];
        if (sets[player] >= 2) {
          setWinner(player);
          setFinished(true);
          updateLiveScore(activeMatch.id, { games, pts, sets });
          return;
        }
      }
    }
    updateLiveScore(activeMatch.id, { games, pts, sets });
    setViewers(v => v + 1);
  };

  const captureMoment = async () => {
    const updated = await addMoment({
      matchKey: mKey, tournamentKey: tournKey,
      pair1Names: activeMatch.pair1Names, pair2Names: activeMatch.pair2Names,
      score: `${live.sets[0]}-${live.sets[1]} (${[0, 1].map(i => live.games[i]).join('-')})`,
    });
    setMoments(updated);
  };

  const vote = async (id) => setMoments(await toggleVote(mKey, id));

  const finishMatchNow = () => {
    if (finished) return;
    const w = live.sets[0] > live.sets[1] ? 0 : 1;
    setWinner(w);
    setFinished(true);
  };

  const displayLabel = (player) => {
    if (finished) return '✓';
    const my = live.pts[player];
    const opp = live.pts[player ^ 1];
    if (my >= 4 && my - opp === 1) return 'AD';
    return [4].includes(my) && my - opp >= 2 ? '0' : (live.pts[player] >= 3 && live.pts[player] === opp ? '40' : (P[live.pts[player]] || '0'));
  };

  if (!activeMatch) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 15 }}>
        🎾 {T.noMatch || T.noActive}
      </div>
    );
  }

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
        {/* Marcador en vivo (espejo del dashboard) */}
        <div style={{ background: 'linear-gradient(135deg,#0a1a17,#0e1e1b)', border: '2px solid rgba(244,63,94,0.25)', borderRadius: 20, padding: 22 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>🏟️ {T.featured}</h3>
          {[
            [0, activeMatch, '#38bdf8'],
            [1, activeMatch, '#f43f5e'],
          ].map(([idx, match, color]) => {
            const fichas = pairToFichas({ pairId: idx === 0 ? match.pair1Id : match.pair2Id, pair1Names: idx === 0 ? match.pair1Names : match.pair2Names }, state);
            const label = idx === 0 ? match.pair1Names : match.pair2Names;
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 10 }}>
                <div style={{ display: 'flex', flexShrink: 0 }}>
                  {fichas.map((f, fi) => (
                    <span key={fi} style={{ position: 'relative', marginRight: fi === 0 ? -8 : 0 }}>
                      <img
                        src={f.photo}
                        alt={f.name}
                        style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}`, background: '#0f766e' }}
                      />
                      {f.flag && <span style={{ position: 'absolute', bottom: -3, right: -3, fontSize: 13, lineHeight: 1 }}>{f.flag}</span>}
                    </span>
                  ))}
                </div>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 800, color, minWidth: 0 }}>
                  <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                  <span style={{ display: 'block', fontSize: 10.5, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                    {fichas.map((f) => f.name).join(' · ')}
                  </span>
                </span>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginRight: 14 }}>{T.set} {live.sets[idx]}</span>
                <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 800, marginRight: 14, width: 30, textAlign: 'center' }}>{live.games[idx]}</span>
                <span style={{ fontSize: 30, fontWeight: 900, color: '#84cc16', width: 52, textAlign: 'center' }}>{displayLabel(idx)}</span>
              </div>
            );
          })}

          {goldPoint && (
            <div className="pulse-glow" style={{ marginTop: 12, background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.55)', color: '#a3e635', textAlign: 'center', padding: 10, borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
              💛 {T.gold} — {T.go}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            <button onClick={() => scorePoint(0)} disabled={finished} style={bigBtn('#38bdf8')}>🔵 +1 {T.pts}</button>
            <button onClick={() => scorePoint(1)} disabled={finished} style={bigBtn('#f43f5e')}>🔴 +1 {T.pts}</button>
          </div>
          <button onClick={finishMatchNow} disabled={finished} style={{ width: '100%', marginTop: 10, background: 'rgba(132,204,22,0.15)', border: '1px solid rgba(132,204,22,0.4)', color: '#84cc16', padding: 10, borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            ⏱ {T.finish}
          </button>
          {finished && (
            <div style={{ marginTop: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.55)', padding: 14, borderRadius: 12, textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: 15 }}>
              🏆 {(winner === 0 ? activeMatch.pair1Names : activeMatch.pair2Names)} · {live.sets[0]}-{live.sets[1]}
            </div>
          )}
        </div>

        {/* Moments */}
        <div style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>🔥 {T.feed}</h3>
            <button onClick={captureMoment} disabled={finished} style={{ background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: 'pointer', opacity: finished ? 0.5 : 1 }}>
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
            <MatchCard lang={lang} pair1={activeMatch.pair1Names} pair2={activeMatch.pair2Names} score1={live.sets[0]} score2={live.sets[1]} sets1={live.sets[0]} sets2={live.sets[1]} winner={winner} players1={pairToFichas({ pairId: activeMatch.pair1Id, pair1Names: activeMatch.pair1Names }, state)} players2={pairToFichas({ pairId: activeMatch.pair2Id, pair1Names: activeMatch.pair2Names }, state)} />
          </div>
        </div>
      )}
    </div>
  );
}

const bigBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '26px 10px', borderRadius: 14, fontWeight: 800, fontSize: 20, cursor: 'pointer' });