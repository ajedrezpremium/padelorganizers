import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../services/store';
import { pullState } from '../services/cloudService';
import { COURT_STATUS } from '../services/padelEngine';
import AnalyticsBoard from './AnalyticsBoard';

const I18N = {
  es: {
    badge: '🎫 Torneo · Producto digital',
    live: 'EN VIVO',
    liveBadge: '🔴 Sigue el torneo en directo',
    sharedBy: 'Compartido por {club} · PADELORGANIZERS',
    players: '👥 Jugadores (Elo)',
    pairs: '📊 Parejas',
    courts: '🏟️ Pistas',
    matches: '⚔️ Partidos',
    bracket: '🏆 Cuadro por rondas',
    analytics: '📈 Analíticas & datos',
    free: 'Libre',
    inGame: 'En juego',
    completed: 'Finalizado',
    scheduled: 'Programado',
    notFound: 'Torneo no encontrado',
    notFoundSub: 'Este enlace no corresponde a ningún torneo publicado. Verifica la URL o pide el enlace actualizado al organizador.',
    loading: 'Cargando torneo…',
    points: 'pts',
    round: 'R',
  },
  en: {
    badge: '🎫 Tournament · Digital product',
    live: 'LIVE',
    liveBadge: '🔴 Follow the tournament live',
    sharedBy: 'Shared by {club} · PADELORGANIZERS',
    players: '👥 Players (Elo)',
    pairs: '📊 Pairs',
    courts: '🏟️ Courts',
    matches: '⚔️ Matches',
    bracket: '🏆 Bracket by round',
    analytics: '📈 Analytics & data',
    free: 'Free',
    inGame: 'In play',
    completed: 'Finished',
    scheduled: 'Scheduled',
    notFound: 'Tournament not found',
    notFoundSub: 'This link does not match any published tournament. Check the URL or ask the organizer for the updated link.',
    loading: 'Loading tournament…',
    points: 'pts',
    round: 'R',
  },
  fr: {
    badge: '🎫 Tournoi · Produit numérique',
    live: 'EN DIRECT',
    liveBadge: '🔴 Suivez le tournoi en direct',
    sharedBy: 'Partagé par {club} · PADELORGANIZERS',
    players: '👥 Joueurs (Elo)',
    pairs: '📊 Paires',
    courts: '🏟️ Pistes',
    matches: '⚔️ Matchs',
    bracket: '🏆 Tableau par tours',
    analytics: '📈 Analyses & données',
    free: 'Libre',
    inGame: 'En jeu',
    completed: 'Terminé',
    scheduled: 'Programmé',
    notFound: 'Tournoi introuvable',
    notFoundSub: "Ce lien ne correspond à aucun tournoi publié. Vérifiez l'URL ou demandez le lien actualisé à l'organisateur.",
    loading: 'Chargement du tournoi…',
    points: 'pts',
    round: 'T',
  },
  pt: {
    badge: '🎫 Torneio · Produto digital',
    live: 'AO VIVO',
    liveBadge: '🔴 Acompanhe o torneio ao vivo',
    sharedBy: 'Partilhado por {club} · PADELORGANIZERS',
    players: '👥 Jogadores (Elo)',
    pairs: '📊 Pares',
    courts: '🏟️ Pistas',
    matches: '⚔️ Partidas',
    bracket: '🏆 Quadro por rondas',
    analytics: '📈 Análises & dados',
    free: 'Livre',
    inGame: 'Em jogo',
    completed: 'Concluído',
    scheduled: 'Programado',
    notFound: 'Torneio não encontrado',
    notFoundSub: 'Este link não corresponde a nenhum torneio publicado. Verifique o URL ou peça o link atualizado ao organizador.',
    loading: 'A carregar torneio…',
    points: 'pts',
    round: 'R',
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: '16px', padding: '18px' };
const rowCls = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px' };

export default function TournamentPublic({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const { id } = useParams();
  const store = useStore();
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState(false);

  const isLive = store.tournament?.id === id;
  const state = isLive ? store : remote;

  useEffect(() => {
    if (isLive) return;
    let mounted = true;
    setLoading(true);
    setMissing(false);
    pullState(id).then((res) => {
      if (!mounted) return;
      setLoading(false);
      if (res.ok && res.data) setRemote(res.data);
      else setMissing(true);
    });
    return () => { mounted = false; };
  }, [id, isLive]);

  if (missing) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '54px', marginBottom: '12px' }}>🎫</div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: '0 0 10px' }}>{T.notFound}</h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7 }}>{T.notFoundSub}</p>
      </div>
    );
  }

  if (loading || !(state?.tournament && state?.players)) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
        <div style={{ fontSize: '34px', marginBottom: '10px' }}>⏳</div>{T.loading}
      </div>
    );
  }

  const t = state.tournament;
  const isRunning = t.status === 'active' || t.status === 'in_game';
  const sortedPlayers = [...state.players].sort((a, b) => b.elo - a.elo);
  const sortedPairs = [...state.pairs].sort((a, b) => b.points - a.points || b.diff - a.diff);
  const rounds = [...new Set(state.matches.map((m) => m.round))].sort((a, b) => a - b);

  const statusLabel = (s) =>
    s === COURT_STATUS.FREE ? T.free : s === COURT_STATUS.IN_GAME ? T.inGame : s;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* HERO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
        <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.5)', color: '#a3e635', padding: '8px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '12px', display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
          {T.badge}
          {isRunning && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />}
        </span>
        {isRunning && <span className="pulse-glow" style={{ background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.4)', color: '#fb7185', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '12px' }}>{T.liveBadge}</span>}
      </div>
      <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', margin: '14px 0 4px' }}>
        {t.name}
      </h1>
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>🏟️ {t.club}</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>🎾 {t.modality}</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>👥 {state.players.length}</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>🟢 {t.totalCourts}</span>
      </div>
      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px' }}>✨ {T.sharedBy.replace('{club}', t.club)}</p>

      {/* DATOS EN VIVO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>{T.players}</h3>
          {sortedPlayers.map((p, i) => (
            <div key={p.id} style={{ ...rowCls, ...(i === 0 ? { background: 'rgba(132,204,22,0.08)' } : {}) }}>
              <span style={{ fontWeight: 700, color: i === 0 ? '#84cc16' : '#f0fdf4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', width: 18 }}>{i + 1}</span>
                {p.name}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#cbd5e1' }}>
                <span style={{ color: '#10b981' }}>{'⭐'.repeat(Math.max(1, Math.round(p.level)))}</span> {p.level.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>{T.pairs}</h3>
          {sortedPairs.length === 0 && <div style={{ fontSize: '13px', color: '#64748b' }}>—</div>}
          {sortedPairs.map((p) => (
            <div key={p.id} style={rowCls}>
              <span style={{ fontWeight: 700, color: '#f0fdf4' }}>#{p.ranking} {p.player1.split(' ')[0]} / {p.player2.split(' ')[0]}</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#84cc16' }}>{p.points} {T.points}</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>{T.courts}</h3>
          {state.courts.map((c) => (
            <div key={c.id} style={rowCls}>
              <span style={{ color: '#f0fdf4' }}>{c.name}</span>
              <span style={{ color: c.status === COURT_STATUS.FREE ? '#34d399' : '#fb923c', fontWeight: 700, fontSize: '12px' }}>{statusLabel(c.status)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PARTIDOS */}
      <div style={{ ...card, marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>{T.matches}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {state.matches.map((m) => (
            <div key={m.id} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                <span>{T.round}{m.round}</span>
                <span style={{ color: m.status === 'completed' ? '#34d399' : '#fb923c', fontWeight: 700 }}>{m.status}</span>
              </div>
              <div style={{ fontWeight: 700, color: '#f0fdf4' }}>
                {m.status === 'completed' ? `✓ ${m.pair1Names} ${m.scoreSet1}` : `⚔️ ${m.pair1Names} vs ${m.pair2Names}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CUADRO */}
      {rounds.length > 1 && (
        <div style={{ ...card, marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>{T.bracket}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(220px,1fr))`, gap: '14px' }}>
            {rounds.map((r) => (
              <div key={r}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#84cc16', marginBottom: '8px', letterSpacing: 1 }}>{T.round}{r}</div>
                {state.matches.filter((m) => m.round === r).map((m) => (
                  <div key={m.id} style={{ background: 'rgba(0,0,0,0.25)', borderLeft: m.status === 'completed' ? '3px solid #34d399' : '3px solid #10b981', borderRadius: '8px', padding: '10px', marginBottom: '8px', fontSize: '12px' }}>
                    <div style={{ color: '#f0fdf4', fontWeight: 700 }}>{m.pair1Names}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span style={{ fontSize: '11px' }}>vs</span>
                      {m.scoreSet1 && <span style={{ color: '#a3e635', fontWeight: 800 }}>{m.scoreSet1}</span>}
                    </div>
                    <div style={{ color: '#f0fdf4', fontWeight: 700, marginTop: 2 }}>{m.pair2Names}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{T.analytics}</h3>
        <AnalyticsBoard state={state} lang={lang} />
      </div>
    </div>
  );
}