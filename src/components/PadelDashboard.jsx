import React from 'react';
import CourtManager from './CourtManager';
import PairingGenerator from './PairingGenerator';
import TournamentChat from './TournamentChat';
import { useStore, setState, resetState } from '../services/store';
import { COURT_STATUS, finishMatch, applyResultToPlayers } from '../services/padelEngine';
import { exportRankingCSV, exportMatchesCSV, openPrintPDF } from '../services/exportService';

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
    padelLegendsTitle: 'PadelLegends',
    padelLegendsDesc: 'Fotos reales desde Wikimedia Commons para los jugadores del torneo.',
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
    expCSV: 'CSV',
    expPDF: 'PDF',
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
    padelLegendsTitle: 'PadelLegends',
    padelLegendsDesc: 'Real Wikimedia Commons photos for the tournament players.',
    colRank: 'Pos',
    colPair: 'Pair',
    colPoints: 'Points',
    colDiff: 'Diff',
    colPlayed: 'P',
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
    padelLegendsTitle: 'PadelLegends',
    padelLegendsDesc: 'Photos réelles des joueurs depuis Wikimedia Commons.',
    statRank: '#',
    statPair: 'Paire',
    statPoints: 'Points',
    statDiff: 'Diff',
    colPlayed: 'J',
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
    padelLegendsTitle: 'PadelLegends',
    padelLegendsDesc: 'Fotos reais dos jogadores do Wikimedia Commons.',
    statRank: '#',
    statPair: 'Par',
    statPoints: 'Pontos',
    statDiff: 'Diff',
    colPlayed: 'J',
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
const exportBtnStyle = { background: 'rgba(132,204,22,0.1)', color: '#84cc16', border: '1px solid rgba(132,204,22,0.3)', padding: '8px 12px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' };

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
  const legendPlayers = sortedPlayers.filter(p => p.photo).slice(0, 8);
  const placeholderPhoto = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/User_icon_BLACK-01.svg/120px-User_icon_BLACK-01.svg.png';
  
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{T.title}</h2>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>{(data.tournament && data.tournament.name ? `${data.tournament.name} — ${data.tournament.club || ''}` : T.subtitle)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#84cc16', padding: '8px 14px', borderRadius: '12px', fontWeight: 700, fontSize: '13px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            {T.active} · {T.formatAmericano}
          </div>
          <button onClick={resetState} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            {T.reset}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => exportRankingCSV(data)} style={exportBtnStyle}>{T.expCSV} ⬇</button>
            <button onClick={() => openPrintPDF(data)} style={exportBtnStyle}>{T.expPDF} 🖨</button>
          </div>
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
 
      {/* PadelLegends — Fotos reales de Wikimedia */}
      <div style={{ background: '#0a1a17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{T.padelLegendsTitle}</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{T.padelLegendsDesc}</p>
          </div>
          <span style={{ fontSize: '12px', color: '#84cc16', fontWeight: 700 }}>Wikimedia Commons</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {legendPlayers.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '12px' }}>
              <img
                src={p.photo || placeholderPhoto}
                alt={p.name}
                style={{ width: '62px', height: '62px', borderRadius: '18px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <div>
                <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '15px' }}>{p.name}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{p.elo} Elo · Nivel {p.level.toFixed(1)}</div>
              </div>
            </div>
          ))}
        </div>
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

      {/* Chat */}
      <div style={{ marginTop: '24px' }}>
        <TournamentChat lang={lang} tournamentId={data.tournament.id} />
      </div>
    </div>
  );
}