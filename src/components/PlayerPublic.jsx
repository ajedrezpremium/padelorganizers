import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../services/store';
import { pullState } from '../services/cloudService';
import { eloSeries, formTrend, streakStats, eloPercentile, playerProjection, qualityOfWins, eloDistribution } from '../services/analyticsService';
import { playerFicha } from '../services/playerProfileService';

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
    diTitle: '🧠 Padel Data Intelligence',
    diSub: 'Analíticas del jugador generadas a partir de los datos del torneo.',
    form: 'Estado de forma', bestStreak: 'Mejor racha', curStreak: 'Racha actual',
    percentile: 'Percentil ELO', projection: 'Proyección final', podium: 'Podio',
    qualityTitle: 'Calidad de victorias', qualityTough: 'vs rivales superiores', qualityEasy: 'vs rivales inferiores',
    distribution: 'Nivel del torneo', yourBand: 'Tu franja',
    ficha: '📋 Ficha técnica', style: 'Estilo', age: 'Edad', height: 'Altura', hand: 'Empuñadura', country: 'País',
    ageVal: (a) => `${a} años`, heightVal: (h) => `${h} cm`, insta: 'Instagram',
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
    diTitle: '🧠 Padel Data Intelligence',
    diSub: 'Player analytics generated from tournament data.',
    form: 'Form', bestStreak: 'Best streak', curStreak: 'Current streak',
    percentile: 'ELO percentile', projection: 'Final projection', podium: 'Podium',
    qualityTitle: 'Quality of wins', qualityTough: 'vs higher-ranked', qualityEasy: 'vs lower-ranked',
    distribution: 'Tournament level', yourBand: 'Your band',
    ficha: '📋 Player profile', style: 'Style', age: 'Age', height: 'Height', hand: 'Handedness', country: 'Country',
    ageVal: (a) => `${a} years`, heightVal: (h) => `${h} cm`, insta: 'Instagram',
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
    diTitle: '🧠 Padel Data Intelligence',
    diSub: 'Analyses du joueur générées à partir des données du tournoi.',
    form: 'Forme', bestStreak: 'Meilleure série', curStreak: 'Série en cours',
    percentile: 'Percentile ELO', projection: 'Projection finale', podium: 'Podium',
    qualityTitle: 'Qualité des victoires', qualityTough: 'vs adversaires supérieurs', qualityEasy: 'vs adversaires inférieurs',
    distribution: 'Niveau du tournoi', yourBand: 'Votre tranche',
    ficha: '📋 Fiche joueur', style: 'Style', age: 'Âge', height: 'Taille', hand: 'Prise de raquette', country: 'Pays',
    ageVal: (a) => `${a} ans`, heightVal: (h) => `${h} cm`, insta: 'Instagram',
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
    diTitle: '🧠 Padel Data Intelligence',
    diSub: 'Análises do jogador geradas a partir dos dados do torneio.',
    form: 'Forma', bestStreak: 'Melhor sequência', curStreak: 'Sequência atual',
    percentile: 'Percentil ELO', projection: 'Projeção final', podium: 'Pódio',
    qualityTitle: 'Qualidade das vitórias', qualityTough: 'vs adversários superiores', qualityEasy: 'vs adversários inferiores',
    distribution: 'Nível do torneio', yourBand: 'Sua faixa',
    ficha: '📋 Ficha do jogador', style: 'Estilo', age: 'Idade', height: 'Altura', hand: 'Empunhadura', country: 'País',
    ageVal: (a) => `${a} anos`, heightVal: (h) => `${h} cm`, insta: 'Instagram',
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

  const trend = myPairId ? formTrend(state, myPairId) : [];
  const streaks = streakStats(trend);
  const pct = self?.id ? eloPercentile(state, self.id) : 50;
  const projection = self?.id ? playerProjection(state, self.id) : null;
  const qWins = self?.id ? qualityOfWins(state, self.id) : null;
  const dist = eloDistribution(state);
  const myElo = self?.elo ?? 1500;

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
            <div style={{ position: 'relative' }}>
              <img
                src={playerFicha(self).photo}
                alt={self.name}
                style={{ width: 78, height: 78, borderRadius: 22, objectFit: 'cover', border: '2px solid rgba(132,204,22,0.5)', background: '#0f766e' }}
              />
              {playerFicha(self).flag && (
                <span style={{ position: 'absolute', bottom: -4, right: -4, fontSize: 22, lineHeight: 1 }}>{playerFicha(self).flag}</span>
              )}
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

        {/* Ficha técnica */}
        {(() => {
          const f = playerFicha(self);
          const items = [
            f.style && [T.style, f.style],
            f.age && [T.age, T.ageVal(f.age)],
            f.height && [T.height, T.heightVal(f.height)],
            f.hand && [T.hand, f.hand],
            f.country && [T.country, f.flag ? `${f.flag} ${f.country.toUpperCase()}` : f.country.toUpperCase()],
            f.insta && [T.insta, f.insta],
          ].filter(Boolean);
          if (!items.length) return null;
          return (
            <div style={{ ...card, marginTop: 16, borderColor: 'rgba(251,191,36,0.3)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 12px' }}>{T.ficha}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
                {items.map(([l, v]) => (
                  <div key={l} style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--padel-muted)', letterSpacing: 0.5 }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--padel-text)', marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

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

        {/* 🧠 Padel Data Intelligence */}
        <div style={{ ...card, marginTop: 16, borderColor: 'rgba(56,189,248,0.3)', background: 'linear-gradient(135deg,#0c1c23,#0e1e1b)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: 0 }}>{T.diTitle}</h2>
            <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, color: '#38bdf8', padding: '3px 10px', borderRadius: 99, background: 'rgba(56,189,248,0.12)' }}>DATA LAYER</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--padel-muted)', margin: '6px 0 14px' }}>{T.diSub}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
            {/* Forma (W/L chips) */}
            <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)', letterSpacing: 0.5 }}>{T.form}</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
                {trend.length ? trend.slice().reverse().map((m) => (
                  <span key={m.id} title={m.round ? `${T.r}${m.round}` : ''} style={{
                    width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900, color: m.status === 'win' ? '#062c24' : '#fff',
                    background: m.status === 'win' ? '#84cc16' : m.status === 'loss' ? 'rgba(251,113,133,0.85)' : m.status === 'live' ? '#fbbf24' : 'rgba(255,255,255,0.15)',
                  }}>{m.status === 'win' ? 'W' : m.status === 'loss' ? 'L' : m.status === 'live' ? '•' : '–'}</span>
                )) : <span style={{ fontSize: 12, color: 'var(--padel-muted)' }}>—</span>}
              </div>
            </div>

            {/* Rachas */}
            <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)', letterSpacing: 0.5 }}>{T.bestStreak}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#a3e635', marginTop: 4 }}>{streaks.bestWinStreak}<span style={{ fontSize: 13, color: 'var(--padel-muted)', fontWeight: 700 }}>W</span></div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)', letterSpacing: 0.5, marginTop: 8 }}>{T.curStreak}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: streaks.currentWinStreak > 0 ? '#84cc16' : '#fb7185', marginTop: 2 }}>
                {streaks.currentWinStreak}<span style={{ fontSize: 12, color: 'var(--padel-muted)', fontWeight: 700 }}>{streaks.currentWinStreak > 0 ? 'W' : 'L'}</span>
              </div>
            </div>

            {/* Percentil */}
            <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)', letterSpacing: 0.5 }}>{T.percentile}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#38bdf8', marginTop: 4 }}>P{pct}</div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#38bdf8,#84cc16)', borderRadius: 99 }} />
              </div>
            </div>

            {/* Proyección */}
            {projection && (
              <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)', letterSpacing: 0.5 }}>{T.projection}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fbbf24', marginTop: 4 }}>#{projection.projectedRank}<span style={{ fontSize: 13, color: 'var(--padel-muted)', fontWeight: 700 }}>/{projection.total}</span></div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#10b981', marginTop: 6 }}>{T.podium} {projection.chanceTop}%</div>
              </div>
            )}
          </div>

          {/* Calidad de victorias + distribución */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 12 }}>
            {qWins ? (
              <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)', letterSpacing: 0.5 }}>{T.qualityTitle}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#84cc16' }}>{qWins.tough}<span style={{ fontSize: 11, color: 'var(--padel-muted)', fontWeight: 700 }}> {T.qualityTough}</span></div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(4, qWins.pct)}%`, height: '100%', background: '#84cc16', borderRadius: 99 }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#94a3b8' }}>{qWins.easy}<span style={{ fontSize: 11, color: 'var(--padel-muted)', fontWeight: 700 }}> {T.qualityEasy}</span></div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(4, 100 - qWins.pct)}%`, height: '100%', background: '#64748b', borderRadius: 99 }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)', letterSpacing: 0.5 }}>{T.qualityTitle}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--padel-muted)', marginTop: 12 }}>
                  {T.qualityTough} 0 · {T.qualityEasy} 0
                </div>
              </div>
            )}
            {dist.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)', letterSpacing: 0.5 }}>{T.distribution}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 64, marginTop: 8 }}>
                  {dist.map((b, i) => {
                    const mine = myElo >= Number(b.label.split('–')[0]) && myElo <= Number(b.label.split('–')[1]);
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: '100%', maxWidth: 34, height: `${Math.max(8, b.pct)}%`, borderRadius: '4px 4px 0 0', background: mine ? 'linear-gradient(180deg,#38bdf8,#10b981)' : 'rgba(16,185,129,0.35)' }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: mine ? '#38bdf8' : 'var(--padel-muted)', letterSpacing: 0 }}>{b.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 10, color: 'var(--padel-muted)', marginTop: 6 }}>{T.yourBand}: <b style={{ color: '#38bdf8' }}>{myElo} ELO</b></div>
              </div>
            )}
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