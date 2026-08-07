import React, { useState } from 'react';

const I18N = {
  es: {
    title: 'PadelScoreBoard',
    subtitle: 'Demo en vivo · Regla del Punto de Oro',
    set: 'Set', tiebreak: 'TIE-BREAK',
    goldPoint: 'PUNTO DE ORO — ¡El próximo punto gana el juego!',
    deuce: 'DEUCE', winner: 'gana el PARTIDO 🎉',
    reset: 'Reiniciar Partido', goldPointCount: 'Puntos de Oro jugados',
    sets: ['Set 1', 'Set 2', 'Set 3'], point: 'PUNTO', goldUsed: 'Usados',
  },
  en: {
    title: 'PadelScoreBoard',
    subtitle: 'Live demo · Gold Point rule',
    set: 'Set', tiebreak: 'TIE-BREAK',
    goldPoint: 'GOLD POINT — The next point wins the game!',
    deuce: 'DEUCE', winner: 'wins the MATCH 🎉',
    reset: 'Reset Match', goldPointCount: 'Gold Points played',
    sets: ['Set 1', 'Set 2', 'Set 3'], point: 'POINT', goldUsed: 'Used',
  },
  fr: {
    title: 'PadelScoreBoard',
    subtitle: 'Démo en direct · Règle du Point d\'Or',
    set: 'Set', tiebreak: 'TIE-BREAK',
    goldPoint: 'POINT D\'OR — Le prochain point gagne le jeu !',
    deuce: 'ÉGALITÉ', winner: 'remporte le MATCH 🎉',
    reset: 'Réinitialiser', goldPointCount: 'Points d\'or joués',
    sets: ['Set 1', 'Set 2', 'Set 3'], point: 'POINT', goldUsed: 'Joués',
  },
  pt: {
    title: 'PadelScoreBoard',
    subtitle: 'Demo · Regra do Ponto de Ouro',
    set: 'Set', tiebreak: 'TIE-BREAK',
    goldPoint: 'PONTO DE OURO — O próximo ponto ganha o jogo!',
    deuce: 'IGUALDADE', winner: 'vence o JOGO 🎉',
    reset: 'Reiniciar', goldPointCount: 'Pontos de Ouro jogados',
    sets: ['Set 1', 'Set 2', 'Set 3'], point: 'PONTO', goldUsed: 'Jogados',
  },
};

const P = ['0', '15', '30', '40'];

function emptyGames() { return [[0, 0], [0, 0], [0, 0]]; }

// Reglas de pádel: gana juego el primero en 4 puntos con 2 de ventaja, salvo deuce->Punto de Oro
// Gana set el primero en 6 juegos con 2 de ventaja, o tie-break a 6-6.
// Gana partido el primero en 2 sets (best of 3).

export default function PadelScoreBoard({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const pair1Name = 'Galán / Lebrón';
  const pair2Name = 'Tapia / Coello';

  const [sets, setSets] = useState([0, 0]);
  const [games, setGames] = useState(emptyGames());
  const [currentSet, setCurrentSet] = useState(0);
  const [pts, setPts] = useState([0, 0]);
  const [goldPoint, setGoldPoint] = useState(false);
  const [goldCount, setGoldCount] = useState(0);
  const [tiebreak, setTiebreak] = useState(false);
  const [winner, setWinner] = useState(null);
  const [serve, setServe] = useState(0);

  const resetMatch = () => {
    setSets([0, 0]);
    setGames(emptyGames());
    setCurrentSet(0);
    setPts([0, 0]);
    setGoldPoint(false);
    setGoldCount(0);
    setTiebreak(false);
    setWinner(null);
    setServe(0);
  };

  const scoreSet = (setIdx, player, newGames) => {
    const ns = [...sets];
    ns[player] += 1;
    setSets(ns);
    setPts([0, 0]);
    setGoldPoint(false);
    setTiebreak(false);

    if (ns[player] >= 2) {
      setWinner(player);
      return;
    }
    // pasa al siguiente set (o tercer set decisivo)
    const nextIdx = Math.min(setIdx + 1, 2);
    const ng = newGames.map(r => [...r]);
    ng[nextIdx] = [0, 0];
    setGames(ng);
    setCurrentSet(nextIdx);
    setServe(s => (s + 1) % 2);
  };

  // Handler cuando un jugador gana un JUEGo completo
  const winGame = (player, newGames) => {
    const g0 = newGames[currentSet][0];
    const g1 = newGames[currentSet][1];
    // ¿set acabado?
    if ((g0 >= 6 && g1 <= 4) || (g1 >= 6 && g0 <= 4)) {
      scoreSet(currentSet, player, newGames);
      return;
    }
    if (g0 === 6 && g1 === 6) {
      // tie-break: el 7º juego del set se disputa con puntos directos
      setGames(newGames);
      setTiebreak(true);
      setPts([0, 0]);
      return;
    }
    setGames(newGames);
    setPts([0, 0]);
    setGoldPoint(false);
    setServe(s => (s + 1) % 2);
  };

  const handleTiebreakPoint = (player) => {
    const np = [...pts];
    np[player] += 1;
    setPts(np);
    if (np[player] >= 7 && Math.abs(np[0] - np[1]) >= 2) {
      // se gana el set por tie-break (el set cuenta como 7-6 en juegos)
      const ng = games.map(r => [...r]);
      ng[currentSet][player] += 1;
      scoreSet(currentSet, player, ng);
    }
  };

  const handlePoint = (player) => {
    if (winner !== null) return;

    if (tiebreak) { handleTiebreakPoint(player); return; }

    if (goldPoint) {
      // Punto de Oro: el punto siguiente decide el juego
      setGoldCount(c => c + 1);
      setGoldPoint(false);
      const ng = games.map(r => [...r]);
      ng[currentSet][player] += 1;
      winGame(player, ng);
      return;
    }

    const np = [...pts];
    np[player] += 1;

    // ¿llega a 40-40 (deuce)? -> se activa el Punto de Oro
    if (np[0] >= 3 && np[1] >= 3 && np[0] === np[1]) {
      setPts(np);
      setGoldPoint(true);
      return;
    }

    // gana juego con 4 puntos y 2 de ventaja (4-x con x<=2) o desde AD (4-3)
    if (np[player] === 4 && np[player ^ 1] <= 2) {
      const ng = games.map(r => [...r]);
      ng[currentSet][player] += 1;
      setPts([0, 0]);
      winGame(player, ng);
      return;
    }
    // jugador va a 40 y el rival estaba a AD -> vuelven a 40-40 -> Punto de Oro
    if (np[player] === 3 && np[player ^ 1] === 4) {
      setPts([3, 3]);
      setGoldPoint(true);
      return;
    }
    // AD (4-3)
    setPts(np);
  };

  const displayLabel = (player) => {
    if (tiebreak) return tiePtsLabel(player);
    if (goldPoint) return pts[0] === pts[1] ? '40' : (pts[player] === 4 ? 'AD' : P[pts[player]]);
    const p = pts[player];
    const o = pts[player ^ 1];
    if (p >= 4 && p - o === 1) return 'AD';
    return P[p] || '0';
  };

  const tiePtsLabel = (player) => (tiebreak ? pts[player] : 0);

  return (
    <div style={{ padding: '24px', maxWidth: '920px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>🎾 {T.title}</h2>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>🏟️ {T.subtitle}</span>
        </div>
        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>{lang}</span>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #0a1a17 0%, #0e1e1b 100%)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', paddingBottom: '6px' }}>
          {T.sets.map((s, i) => (
            <span key={s} style={{ width: 34, textAlign: 'center' }}>
              {i === currentSet && winner === null ? `▶ ${s}` : s}
            </span>
          ))}
        </div>

        {[0, 1].map(player => (
          <div key={player} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: player === 0 ? '#38bdf8' : '#f43f5e', display: 'inline-block' }} />
              <span style={{ fontSize: 17, fontWeight: 800, color: player === 0 ? '#38bdf8' : '#f43f5e' }}>
                {player === 0 ? pair1Name : pair2Name}
              </span>
              {serve === player && winner === null && <span title="Servicio">🎾</span>}
            </div>
            <div style={{ display: 'flex', gap: 20, width: 180, fontSize: 22, fontWeight: 900, color: '#fff' }}>
              {[0, 1, 2].map(sIdx => (
                <span key={sIdx} style={{ width: 40, textAlign: 'center' }}>
                  {sIdx === currentSet && winner === null
                    ? <b style={{ color: '#84cc16' }}>{games[sIdx][player]}</b>
                    : games[sIdx][player]}
                </span>
              ))}
            </div>
            <div style={{ width: 110, textAlign: 'right', fontSize: 24, fontWeight: 900, color: '#84cc16' }}>
              {displayLabel(player)}
            </div>
          </div>
        ))}

        {goldPoint && (
          <div className="pulse-glow" style={{ marginTop: 14, background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.55)', color: '#a3e635', textAlign: 'center', padding: 12, borderRadius: 12, fontWeight: 800, fontSize: 15 }}>
            💛 {T.goldPoint}
          </div>
        )}
        {tiebreak && !goldPoint && winner === null && (
          <div style={{ marginTop: 14, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.4)', color: '#7dd3fc', textAlign: 'center', padding: 10, borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
            ⚡ {T.tiebreak} — {pts[0]} : {pts[1]}
          </div>
        )}
        {winner !== null && (
          <div style={{ marginTop: 14, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.55)', color: '#fff', textAlign: 'center', padding: 16, borderRadius: 12, fontWeight: 900, fontSize: 18 }}>
            🏆 {(winner === 0 ? pair1Name : pair2Name)} {T.winner}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        {[0, 1].map(player => (
          <button key={player} onClick={() => handlePoint(player)} disabled={winner !== null}
            style={{
              padding: '40px', fontSize: 20, fontWeight: 800, color: '#fff', cursor: 'pointer',
              border: 'none', borderRadius: 16,
              background: player === 0 ? 'linear-gradient(135deg, #38bdf8, #2563eb)' : 'linear-gradient(135deg, #f43f5e, #be123c)',
              opacity: winner !== null ? 0.5 : 1,
            }}>
            {player === 0 ? '🔵' : '🔴'} +1 {T.point}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>
          ⭐ {T.goldPointCount}: <b style={{ color: '#fff' }}>{goldCount}</b>
        </span>
        <button onClick={resetMatch}
          style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          🔄 {T.reset}
        </button>
      </div>
    </div>
  );
}