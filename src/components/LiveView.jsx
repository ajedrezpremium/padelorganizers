import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../services/store';
import { COURT_STATUS } from '../services/padelEngine';
import { playerFicha } from '../services/playerProfileService';

const I18N = {
  es: {
    badge: '🌐 Vista Pública · En vivo',
    copyLink: '🔗 Copiar enlace público',
    copied: '✅ Enlace copiado',
    rankings: '🏆 Ranking Jugadores (nivel Elo)',
    players: '🏆 Ranking Jugadores (nivel Elo)',
    standings: '📊 Clasificación Parejas',
    courts: '🏟️ Estado de Pistas',
    matches: '⚔️ Partidos',
    live: 'EN VIVO',
    free: 'Libre',
    inGame: 'En juego',
    scheduled: 'Programado',
    completed: 'Finalizado',
    viewersTip: 'Este es el enlace que compartes con los jugadores: siguen el torneo sin instalar nada.',
    profile: 'Ver perfil', style: 'Estilo', age: 'Edad', height: 'Altura', hand: 'Empuñadura',
    ageVal: (a) => `${a} años`, heightVal: (h) => `${h} cm`,
  },
  en: {
    badge: '🌾 Public View · Live',
    copyLink: '🔗 Copy public link',
    copied: '✅ Link copied',
    players: 'Player Rankings (Elo)',
    pairs: 'Pairs standings',
    courts: '🟢 Court Status',
    matches: '⚔️ Matches',
    live: 'LIVE',
    free: 'Free',
    inGame: 'In play',
    scheduled: 'Scheduled',
    completed: 'Finished',
    playerTip: 'This is the public link players follow — no install needed.',
    profile: 'View profile', style: 'Style', age: 'Age', height: 'Height', hand: 'Handedness',
    ageVal: (a) => `${a} years`, heightVal: (h) => `${h} cm`,
  },
  fr: {
    badge: '🌾 Vue publique · En direct',
    copyLink: '🔗 Copier le lien public',
    copied: '✅ Lien copié',
    players: 'Classement (niveau Elo)',
    pairs: 'Classement des paires',
    courts: '🏟️ État des pistes',
    live: 'EN DIRECT',
    free: 'Libre',
    inGame: 'En jeu',
    scheduled: 'Programmé',
    completed: 'Terminé',
  },
  pt: {
    badge: '🌾 Vista Pública · Ao vivo',
    copyLink: '🔗 Copiar link público',
    copied: '✅ Link copiado',
    players: 'Classificação (nível Elo)',
    pairs: 'Classificação de Pares',
    courts: '🏟️ Estado das Pistas',
    live: 'AO VIVO',
    free: 'Livre',
    inGame: 'Em jogo',
    scheduled: 'Programado',
    completed: 'Concluído',
  },
};

const rowCls = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px' };
const card = { background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '18px' };
const badge = { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.5)', color: '#a3e635', padding: '8px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '13px', display: 'inline-flex', gap: '8px', alignItems: 'center' };

export default function LiveView({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const state = useStore();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const url = decodeURIComponent(window.location.href.split('?')[0]) + '?view=public';
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const sortedPlayers = [...state.players].sort((a, b) => b.elo - a.elo);
  const sortedPairs = [...state.pairs].sort((a, b) => b.points - a.points || b.diff - a.diff);

  const statusLabel = (s) =>
    s === COURT_STATUS.FREE ? T.free : s === COURT_STATUS.IN_GAME ? T.inGame : s;

  function matchLabel(m) {
    if (m.status === 'completed') return `✓ ${m.pair1Names} ${m.scoreSet1}`;
    if (m.status === 'in_progress') return `🔴 ${m.pair1Names} vs ${m.pair2Names}`;
    return `⏳ ${m.pair1Names} vs ${m.pair2Names}`;
  }

  function presentLabel(m) {
    const l = matchLabel(m);
    return <span style={{ fontWeight: 700, color: '#f0fdf4' }}>{l}</span>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pulse-glow" style={badge}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            {T.live}
          </span>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>{state.tournament.name} · {state.tournament.club}</span>
        </div>
        <button onClick={copy}
          style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          {copied ? T.copied : T.copyLink}
        </button>
        <button onClick={() => { const id = state.tournament?.id; if (id) navigate(`/tournament/${id}`); }}
          style={{ background: 'rgba(16,185,129,0.18)', color: '#a3e635', border: '1px solid rgba(16,185,129,0.4)', padding: '10px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
          🌐 Web pública
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px' }}>💡 {T.playerTip}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Ranking jugadores por Elo */}
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>🏆 {T.players}</h3>
          {sortedPlayers.map((p, i) => {
            const f = playerFicha(p);
            const hasData = !!(f.flag || f.insta || f.style || f.age || f.height || f.hand);
            return (
              <div key={p.id} style={{ ...rowCls, ...(i === 0 ? { background: 'rgba(132,204,22,0.08)', borderRadius: 10 } : {}), gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', width: 16, fontWeight: 800 }}>{p.wins + p.losses > 0 ? i + 1 : '—'}</span>
                <Link to={`/player/${encodeURIComponent(f.name)}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 0, flex: 1 }}>
                  <span style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={f.photo} alt={f.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(16,185,129,0.5)', background: '#0f766e' }} />
                    {f.flag && <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 14, lineHeight: 1 }}>{f.flag}</span>}
                  </span>
                  <span style={{ overflow: 'hidden' }}>
                    <span style={{ fontWeight: 700, color: i === 0 ? '#84cc16' : '#f0fdf4', fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.name}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8' }}>
                      <span style={{ color: '#10b981' }}>{'⭐'.repeat(Math.max(1, Math.round(f.level)))}</span> {f.level.toFixed(1)}
                      {f.insta && <span style={{ color: '#38bdf8' }}>{f.insta}</span>}
                    </span>
                  </span>
                </Link>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#cbd5e1', flexShrink: 0 }}>
                  <span style={{ color: '#10b981' }}>{f.elo}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Clasificación parejas */}
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>📊 {T.pairs}</h3>
          {sortedPairs.map((p) => (
            <div key={p.id} style={rowCls}>
              <span style={{ fontWeight: 700, color: '#f0fdf4' }}>#{p.ranking} {p.player1.split(' ')[0]} / {p.player2.split(' ')[0]}</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#84cc16' }}>{p.points} pts</span>
            </div>
          ))}
        </div>

        {/* Pistas */}
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>🟢 {T.courts}</h3>
          {state.courts.map(c => (
            <div key={c.id} style={rowCls}>
              <span style={{ color: '#f0fdf4' }}>{c.name}</span>
              <span style={{ color: c.status === COURT_STATUS.FREE ? '#34d399' : '#fb923c', fontWeight: 700, fontSize: '12px' }}>{statusLabel(c.status)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Partidos */}
      <div style={{ ...card, marginTop: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>⚔️ {T.matches}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {state.matches.map(m => (
            <div key={m.id} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                <span>R{m.round}</span>
                <span style={{ color: m.status === 'completed' ? '#34d399' : '#fb923c', fontWeight: 700 }}>{m.status}</span>
              </div>
              {presentLabel(m)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}