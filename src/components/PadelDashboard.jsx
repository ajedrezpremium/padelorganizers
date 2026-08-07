import React from 'react';
import CourtManager from './CourtManager';
import PairingGenerator from './PairingGenerator';
import { useStore, setState, resetState } from '../services/store';
import { COURT_STATUS, finishMatch, applyResultToPlayers } from '../services/padelEngine';

const I18N = {
  es: {
    title: 'Panel de Control · Dashboard del Torneo',
    subtitle: 'I Open Pádel Pro Vigo 2026 — Club Pádel Bouzas',
    statCourts: 'Pistas',
    statMatches: 'Partidos',
    statFree: 'Pistas libres',
    statPlayers: 'Parejas',
    ranking: 'Ranking en Vivo',
    playerRanking: 'Rating Elo · Jugadores',
    colRank: '#',
    colPair: 'Pareja',
    colPoints: 'Puntos',
    colDiff: 'Diff',
    colPlayed: 'J',
    active: 'Activo',
    formatAmericano: 'Formato Americano · Punto de Oro activo',
    pairEngine: 'Motor de Re-Pareo (IA)',
    reset: '🔄 Reiniciar Demo',
    level: 'Nivel',
  },
  en: {
    title: 'Control Panel — Tournament Dashboard',
    subtitle: '2026 Vigo Pro Padel Open — Bouzas Padel Club',
    statCourts: 'Courts',
    statMatches: 'Matches',
    statFree: 'Free courts',
    statPlayers: 'Pairs',
    ranking: 'Live rankings',
    playerRanking: 'Player Rating · Elo',
    colRank: 'Pos',
    colPair: 'Pair',
    colPoints: 'Points',
    colDiff: 'Diff',
    colWon: 'P',
    active: 'Active',
    formatAmericano: 'Americano format · Gold Point enabled',
    pairEngine: 'AI Re-pairing Engine',
    reset: 'Reset match',
    level: 'Level',
  },
  fr: {
    title: 'Panneau de contrôle — Tableau de bord du tournoi',
    subtitle: '2026 Vigo Open Pro — Club Vigo Bouzas',
    statCourts: 'Pistes',
    statMatches: 'Matchs',
    statFree: 'Pistes libres',
    statPlayers: 'Paires',
    ranking: 'Classements en direct',
    playerRanking: 'Rating joueurs · Elo',
    statRank: '#',
    statPair: 'Paire',
    statPoints: 'Points',
    statDiff: 'Diff',
    statWon: 'J',
    active: 'Actif',
    formatAmericano: 'Format américain · Point d\'or',
    pair: 'Moteur d\'appariement IA',
    reset: 'Réinitialiser',
    level: 'Niveau',
  },
  pt: {
    title: 'Painel de controlo — Torneio Dashboard',
    subtitle: 'Open Vigo Pro 2026 — Clube Vigo Bouaz',
    statCourts: 'Pistas',
    statMatches: 'Jogos',
    statFree: 'Pistas livres',
    statPlayers: 'Pares',
    ranking: 'Classificações ao vivo',
    playerRanking: 'Rating de Jogadores · Elo',
    statRank: '#',
    statPair: 'Par',
    statPoints: 'Pontos',
    statDiff: 'Diff',
    statWon: 'J',
    active: 'Ativo',
    formatAmericano: 'Formato Americano · Ponto de Ouro ativado',
    pair: 'Motor de Re-Pareamento IA',
    reset: 'Reiniciar',
    level: 'Nível',
  },
};

const statCardStyle = { background: '#0f221e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px 24px' };
const statValue = { fontSize: '28px', fontWeight: 900, color: '#84cc16' };
const statLabel = { fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' };
const rankRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };

export default function PadelDashboard({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const data = useStore();

  const courts = data.courts;
  const matches = data.matches;
  const freeCount = courts.filter(c => c.status === COURT_STATUS.FREE).length;
  const active = matches.filter(m => m.status === 'in_progress').length;

  const handleAssignCourt = (courtId, matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    setState(prev => ({
      ...prev,
      courts: prev.courts.map(c =>
        c.id === courtId
          ? { ...c, status: COURT_STATUS.IN_GAME, matchId, startTime: Date.now() }
          : c
      ),
      matches: prev.matches.map(m =>
        m.id === matchId ? { ...m, courtId, status: 'in_progress' } : m
      ),
    }));
  };

  const handleFinishMatch = (matchId, g1, g2) => {
    setState(prev => {
      const match = prev.matches.find(m => m.id === matchId);
      // Partido generado por el motor de re-pareo -> actualiza Elo de jugadores
      if (match && match.playerIds1 && match.playerIds2) {
        return applyResultToPlayers(finishMatch(prev, matchId, g1, g2), match, g1, g2);
      }
      return finishMatch(prev, matchId, g1, g2);
    });
  };

  const handleAddRound = ({ matches: newMatches }) => {
    setState(prev => ({ ...prev, matches: [...prev.matches, ...newMatches] }));
  };

  const sortedPlayers = [...data.players].sort((a, b) => b.elo - a.elo);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{T.title}</h2>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>{T.subtitle}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#84cc16', padding: '8px 14px', borderRadius: '12px', fontWeight: 700, fontSize: '13px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            {T.active} · {T.formatAmericano}
          </div>
          <button onClick={resetState} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            {T.reset}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={statCardStyle}>
          <div style={statValue}>{courts.length}</div>
          <div style={statLabel}>🏟️ {T.statCourts}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValue}>{active} / {matches.length}</div>
          <div style={statLabel}>⚔️ {T.statMatches}</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ ...statValue, color: freeCount > 0 ? '#34d399' : '#f87171' }}>{freeCount} / {courts.length}</div>
          <div style={statLabel}>✅ {T.statFree}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValue}>{data.pairs.length}</div>
          <div style={statLabel}>👥 {T.statPlayers}</div>
        </div>
      </div>

      {/* CourtManager */}
      <div style={{ background: '#0a1a17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', marginBottom: '24px', overflow: 'hidden' }}>
        <CourtManager
          courts={courts}
          matches={matches}
          onFinishMatch={handleFinishMatch}
          onAssignCourt={handleAssignCourt}
        />
      </div>

      {/* Pairing Engine */}
      <div style={{ marginBottom: '24px' }}>
        <PairingGenerator state={data} onAddRound={handleAddRound} />
      </div>

      {/* Player rating (Elo) */}
      <div style={{ background: '#0a1a17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>⭐ {T.playerRanking}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
          {sortedPlayers.slice(0, 8).map((p, i) => (
            <div key={p.id} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#f0fdf4', fontSize: '14px' }}>
                <span style={{ color: '#64748b', fontSize: '12px', width: 16 }}>{i + 1}</span>
                {p.name}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>{'⭐'.repeat(Math.max(1, Math.round(p.level)))} {p.level.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div style={{ background: '#0a1a17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>🏆 {T.ranking}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
          <span>{T.colRank}</span>
          <span style={{ flex: 2, paddingLeft: '8px' }}>{T.colPair}</span>
          <span style={{ flex: 1, textAlign: 'center' }}>🎯 {T.colPoints}</span>
          <span style={{ flex: 1, textAlign: 'center' }}>📈 {T.colDiff}</span>
          <span style={{ width: '40px', textAlign: 'center' }}>{T.colPlayed}</span>
        </div>
        {data.pairs.map((p, i) => (
          <div key={p.id} style={{ ...rankRow, ...(i === 0 ? { background: 'rgba(132,204,22,0.06)' } : {}) }}>
            <span style={{ width: '40px', fontSize: '14px', fontWeight: 800, color: i === 0 ? '#84cc16' : '#cbd5e1' }}>{p.ranking}</span>
            <span style={{ flex: 2, paddingLeft: '8px', fontSize: '14px', fontWeight: 700, color: '#f0fdf4' }}>{p.player1} / {p.player2}</span>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: 800, color: '#84cc16' }}>{p.points}</span>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: 700, color: p.diff >= 0 ? '#34d399' : '#f87171' }}>{p.diff >= 0 ? '+' : ''}{p.diff}</span>
            <span style={{ width: '40px', textAlign: 'center', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{p.matchesPlayed}</span>
          </div>
        ))}
      </div>
    </div>
  );
}