import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../services/store';
import { pullState } from '../services/cloudService';
import { eloSeries } from '../services/analyticsService';

const I18N = {
  es: {
    playerId: 'PADELORGANIZERS ID',
    idSub: 'Digital identity · el historial acompaña al jugador',
    level: 'Nivel', elo: 'ELO', club: 'Club', points: 'pts',
    stats: '📊 Torneo activo', matches: 'Partidos', wins: 'Victorias', losses: 'Derrotas',
    winRate: '% victorias', history: '📜 Historial de partidos', rivalries: '⚔️ Rivalidades',
    curve: '📈 Progresión ELO', noHistory: 'Sin partidos todavía.',
    back: '← Volver al torneo', copy: 'Copiar ID', copied: '✓ Copiado',
    notFound: 'Jugador no encontrado', notFoundSub: 'Este perfil no aparece en el torneo activo.',
    sharedBy: 'PADELORGANIZERS · THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
    win: 'Victoria', loss: 'Derrota', live: 'En directo', r: 'R',
  },
  en: {
    playerId: 'PADELORGANIZERS ID',
    idSub: 'Digital identity · the record follows the player',
    level: 'Level', elo: 'ELO', club: 'Club', points: 'pts',
    stats: '📊 Active tournament', matches: 'Matches', wins: 'Wins', losses: 'Losses',
    winRate: 'Win rate', history: '📜 Match history', rivalries: '⚔️ Rivalries',
    curve: '📈 ELO progression', noHistory: 'No matches yet.',
    back: '← Back to tournament', copy: 'Copy ID', copied: '✓ Copied',
    notFound: 'Player not found', notFoundSub: 'This profile is not in the active tournament.',
    sharedBy: 'PADELORGANIZERS · THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
    win: 'Win', loss: 'Loss', live: 'Live', r: 'R',
  },
  fr: {
    playerId: 'PADELORGANIZERS ID',
    idSub: 'Identité numérique · le palmarès suit le joueur',
    level: 'Niveau', elo: 'ELO', club: 'Club', points: 'pts',
    stats: '📊 Tournoi actif', matches: 'Matchs', wins: 'Victoires', losses: 'Défaites',
    winRate: '% victoires', history: '📜 Historique', rivalries: '⚔️ Rivalités',
    curve: '📈 Progression ELO', noHistory: 'Aucun match pour l’instant.',
    back: '← Retour au tournoi', copy: 'Copier l’ID', copied: '✓ Copié',
    notFound: 'Joueur introuvable', notFoundSub: 'Ce profil n’est pas dans le tournoi actif.',
    sharedBy: 'PADELORGANIZERS · THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
    win: 'Victoire', loss: 'Défaite', live: 'En direct', r: 'T',
  },
  pt: {
    playerId: 'PADELORGANIZERS ID',
    idSub: 'Identidade digital · o histórico acompanha o jogador',
    level: 'Nível', elo: 'ELO', club: 'Clube', points: 'pts',
    stats: '📊 Torneio ativo', matches: 'Partidas', wins: 'Vitórias', losses: 'Derrotas',
    winRate: '% vitórias', history: '📜 Histórico', rivalries: '⚔️ Rivalidades',
    curve: '📈 Progressão ELO', noHistory: 'Sem partidas ainda.',
    back: '← Voltar ao torneio', copy: 'Copiar ID', copied: '✓ Copiado',
    notFound: 'Jogador não encontrado', notFoundSub: 'Este perfil não está no torneio ativo.',
    sharedBy: 'PADELORGANIZERS · THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
    win: 'Vitória', loss: 'Derrota', live: 'Ao vivo', r: 'R',
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const rowCls = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '12.5px' };

export default function PlayerPublic({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const { name } = useParams();
  const [params] = useSearchParams();
  const store = useStore();
  const [remote, setRemote] = useState(null);
  const [copied, setCopied] = useState(false);

  const qty = decodeURIComponent(name || '').toLowerCase();
  const tId = params.get('t');
  const isLive = !tId || store.tournament?.id === tId;
  const state = isLive ? store : remote;

  useEffect(() => {
    if (isLive) return;
    let mounted = true;
    pullState(tId).then((res) => { if (mounted && res.ok) setRemote(res.data); });
    return () => { mounted = false; };
  }, [tId, isLive]);

  const players = state?.players || [];
  const self = players.find((p) => (p.name || '').toLowerCase() === qty) || players.find((p) => (p.name || '').toLowerCase().includes(qty));
  const myPairId = self?.pairId;
  const t = state?.tournament;

  const history = myPairId
    ? (state.matches || [])
        .filter((m) => m.pair1Id === myPairId || m.pair2Id === myPairId)
        .map((m) => {
          const isP1 = m.pair1Id === myPairId;
          const enemy = isP1 ? m.pair2Names || m.pair2Id : m.pair1Names || m.pair1Id;
          const score = `${m.scoreSet1 || '0-0'}${m.scoreSet2 && m.scoreSet2 !== '0-0' ? ' · ' + m.scoreSet2 : ''}`;
          const winnerIsMe = m.winnerId === myPairId;
          const status = m.status === 'completed' ? (winnerIsMe ? 'win' : 'loss') : m.status === 'in_progress' ? 'live' : 'sched';
          return { id: m.id, round: m.round, enemy, score, status };
        })
        .sort((a, b) => (b.round || 0) - (a.round || 0))
    : [];

  const agg = {};
  history.forEach((m) => {
    if (m.status === 'win' || m.status === 'loss') {
      const key = m.enemy || '?';
      if (!agg[key]) agg[key] = { enemy: key, played: 0, wins: 0, losses: 0 };
      agg[key].played += 1;
      if (m.status === 'win') agg[key].wins += 1;
      if (m.status === 'loss') agg[key].losses += 1;
    }
  });
  const rivalries = Object.values(agg).sort((a, b) => b.played - a.played);
  const curve = myPairId ? eloSeries(state, myPairId, { points: 8 }) : [];
  const winRate = Math.round(((self?.wins || 0) / Math.max(1, self?.matchesPlayed || 0)) * 100);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  if (!self) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🏅</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--padel-text)', margin: '0 0 8px' }}>{T.notFound}</h1>
        <p style={{ fontSize: 13.5, color: 'var(--padel-muted)' }}>{T.notFoundSub}</p>
      </div>
    );
  }

  const statusLabel = (m) => m.status === 'win' ? T.win : m.status === 'loss' ? T.loss : m.status === 'live' ? T.live : `${T.r}${m.round || ''}`;

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px' }}>
        {/* Identidad */}
        <div style={{ ...card, padding: 22, background: 'linear-gradient(135deg,#0c1f1a,#0e241f)', borderColor: 'rgba(132,204,22,0.35)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 74, height: 74, borderRadius: 22, background: 'linear-gradient(135deg,#84cc16,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#062c24' }}>
              {(self.name || 'P')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: 'var(--padel-text)' }}>{self.name}</h1>
                <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: 'rgba(132,204,22,0.15)', color: '#a3e635', letterSpacing: 1 }}>{T.playerId}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--padel-muted)', marginTop: 3 }}>{T.idSub}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, padding: '4px 12px', borderRadius: 99, background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>{T.elo}: {self.elo ?? 1500}</span>
                <span style={{ fontSize: 11.5, fontWeight: 800, padding: '4px 12px', borderRadius: 99, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>{T.level}: {Number(self.level ?? 3).toFixed(1)}</span>
                {t?.club && <span style={{ fontSize: 11.5, fontWeight: 800, padding: '4px 12px', borderRadius: 99, background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>📍 {t.club}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={copyId} style={{ background: 'rgba(16,185,129,0.14)', color: copied ? '#86efac' : '#a3e635', border: '1px solid rgba(16,185,129,0.4)', padding: '9px 16px', borderRadius: 10, fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>
                {copied ? T.copied : `🆔 ${T.copy}`}
              </button>
            </div>
          </div>
        </div>

        {/* Stats torneo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginTop: 16 }}>
          {[
            [T.matches, self.matchesPlayed || 0], [T.wins, self.wins || 0], [T.losses, self.losses || 0],
          ].map(([l, v], i) => (
            <div key={i} style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--padel-lime)' }}>{v}</div>
              <div style={{ fontSize: 11.5, color: 'var(--padel-muted)', fontWeight: 700 }}>{l}</div>
            </div>
          ))}
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>{winRate}%</div>
            <div style={{ fontSize: 11.5, color: 'var(--padel-muted)', fontWeight: 700 }}>{T.winRate}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16, marginTop: 16 }}>
          {/* Historial */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>{T.history}</h2>
            {history.length ? (
              <div>
                {history.map((m) => {
                  const color = m.status === 'win' ? '#10b981' : m.status === 'loss' ? '#fb7185' : m.status === 'live' ? '#fbbf24' : '#64748b';
                  return (
                    <div key={m.id} style={rowCls}>
                      <span style={{ fontWeight: 700, color: 'var(--padel-text)' }}>{T.r}{m.round} · {m.enemy}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {m.score && m.status !== 'live' && <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--padel-muted)' }}>{m.score}</span>}
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: `${color}22`, color }}>{statusLabel(m)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noHistory}</p>}
          </div>

          {/* Rivalidades */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>{T.rivalries}</h2>
            {rivalries.length ? (
              <div>
                {rivalries.map((r) => (
                  <div key={r.enemy} style={rowCls}>
                    <span style={{ fontWeight: 700, color: 'var(--padel-text)' }}>{r.enemy}</span>
                    <div style={{ display: 'flex', gap: 6, fontSize: 11 }}>
                      <span style={{ fontWeight: 800, color: '#10b981' }}>{r.wins}</span>
                      <span style={{ fontWeight: 800, color: '#fb7185' }}>{r.losses}</span>
                      <span style={{ fontWeight: 800, color: 'var(--padel-muted)' }}>· {r.played}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noHistory}</p>}
          </div>

          {/* Curva ELO */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>{T.curve}</h2>
            {curve.length ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 92 }}>
                {curve.map((pt, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <div style={{ width: '100%', maxWidth: 22, borderRadius: '4px 4px 0 0', height: `${Math.max(8, ((pt.elo - 1450) / 400) * 100)}%`, background: 'linear-gradient(180deg,#a3e635,#10b981)' }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--padel-muted)', marginTop: 2 }}>{pt.elo}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noHistory}</p>}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10.5, color: '#475569', letterSpacing: 1.5, marginTop: 26 }}>CREATE · CONNECT · WIN — {T.sharedBy}</p>
      </div>
    </div>
  );
}