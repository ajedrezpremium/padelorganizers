import React, { useState } from 'react';
import { generateAmericanoRounds, generateMexicanoPairings } from '../services/padelEngine';

const I18N = {
  es: {
    title: '⚙️ Motor de Re-Pareo (IA)',
    subtitle: 'Genera emparejamientos automáticos para la próxima ronda',
    formatAmericano: 'Americano',
    formatMexicano: 'Mexicano',
    americanoDesc: 'Rotación fija: todos juegan contra todos en orden.',
    mexicanoDesc: 'Dinámico: top vs top según nivel Elo.',
    nextRound: 'Siguiente ronda',
    rounds: '➕ Generar y añadir esta ronda',
    generated: 'Partidos generados',
    empty: 'Sin jugadores suficientes. Necesitas al menos 4.',
    note: 'Al finalizar en CourtManager, los partidos generados actualizan el rating Elo.',
  },
  en: {
    title: '⚙️ Re-pairing Engine (AI)',
    subtitle: 'Generates automatic pairings for the next round',
    formatAmericano: 'Americano',
    formatMexicano: 'Mexicano',
    americanoDesc: 'Fixed rotation: everyone plays everyone in order.',
    mexicanoDesc: 'Dynamic: top vs top by Elo level.',
    round: 'Next round',
    rounds: '➕ Generate & add this round',
    generated: 'Generated matches',
    empty: 'Not enough players. Need at least 4.',
    note: 'When finished in CourtManager, generated matches update Elo.',
  },
  fr: {
    title: '⚙️ Moteur de ré-appariement (IA)',
    subtitle: 'Génère automatiquement les appariements de la prochaine ronde',
    formatAmericano: 'Américain',
    formatMexicano: 'Mexicain',
    americanoDesc: 'Rotation fixe: chacun contre tous.',
    mexicanoDesc: 'Dynamique: meilleur contre meilleur selon Elo.',
    round: 'Prochaine ronde',
    rounds: '➕ Générer et ajouter cette ronde',
    generated: 'Matchs générés',
    empty: 'Pas assez de joueurs. Il en faut au moins 4.',
    note: 'En finissant dans CourtManager, les matchs générés mettent à jour le Elo.',
  },
  pt: {
    title: '⚙️ Motor de Re-Pareamento (IA)',
    subtitle: 'Gera emparelhamentos automáticos para a próxima ronda',
    formatAmericano: 'Americano',
    formatMexicano: 'Mexicano',
    americanoDesc: 'Rotação fixa: todos jogam contra todos.',
    mexicanoDesc: 'Dinâmico: melhor contra melhor por Elo.',
    round: 'Próxima ronda',
    rounds: '➕ Gerar e adicionar esta ronda',
    generated: 'Partidas geradas',
    empty: 'Sem jogadores suficientes. Precisa de pelo menos 4.',
    note: 'Ao terminar no CourtManager, as partidas geradas atualizam o Elo.',
  },
};

const rowCls = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px' };

export default function PairingGenerator({ state, onAddRound }) {
  const lang = state?.tournament?.lang || 'es';
  const T = I18N[lang] || I18N.es;
  const [format, setFormat] = useState('americano');
  const [roundIndex, setRoundIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const playerIds = state.players.map(p => p.id);
  const americanoRounds = generateAmericanoRounds(playerIds);
  const pairs = format === 'americano' ? (americanoRounds[roundIndex] || []) : generateMexicanoPairings(state);
  // agrupar pares de jugadores en enfrentamientos 2v2
  const matches = [];
  for (let i = 0; i + 1 < pairs.length; i += 2) {
    matches.push([pairs[i], pairs[i + 1]]);
  }

  const name = (id) => (state.players.find(p => p.id === id)?.name || id).split(' ')[0];

  const handleAdd = () => {
    if (!matches.length) return;
    onAddRound({ matches, format });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '20px' }}>
      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.title}</h3>
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px' }}>{T.subtitle}</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        {['americano', 'mexicano'].map(f => (
          <button key={f} onClick={() => { setFormat(f); setRoundIndex(0); }}
            style={{
              flex: 1, padding: '11px', borderRadius: '10px', border: format === f ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
              background: format === f ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)', color: format === f ? '#a3e635' : '#cbd5e1',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            }}>
            {f === 'americano' ? T.formatAmericano : T.formatMexicano}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>{format === 'americano' ? T.americanoDesc : T.mexicanoDesc}</p>

      {format === 'americano' && americanoRounds.length > 1 && (
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>{T.round}</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {americanoRounds.map((_, i) => (
              <button key={i} onClick={() => setRoundIndex(i)}
                style={{
                  padding: '6px 10px', borderRadius: '6px', border: roundIndex === i ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                  background: roundIndex === i ? 'rgba(16,185,129,0.15)' : 'transparent', color: roundIndex === i ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
                }}>
                R{i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {matches.length > 0 ? (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '13px', color: '#84cc16', fontWeight: 700, marginBottom: '8px' }}>{T.generated} ({matches.length})</div>
          {matches.map(([A, B], i) => (
            <div key={i} style={rowCls}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f0fdf4' }}>{A.map(name).join(' / ')}</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#84cc16' }}>VS</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f0fdf4' }}>{B.map(name).join(' / ')}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '13px', color: '#f87171', margin: '16px 0' }}>{T.empty}</p>
      )}

      <button onClick={handleAdd} disabled={matches.length === 0}
        style={{
          width: '100%', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
          background: added ? '#84cc16' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
          opacity: matches.length === 0 ? 0.4 : 1,
        }}>
        {added ? '✓' : T.rounds}
      </button>

      <p style={{ fontSize: '11px', color: '#64748b', margin: '12px 0 0' }}>ℹ️ {T.note}</p>
    </div>
  );
}