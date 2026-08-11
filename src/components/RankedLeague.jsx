import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  ensureCurrentLeague, listLeague, upsertEntry, BADGES, badgeIcon, currentSeason,
} from '../services/leagueService';

const I18N = {
  es: {
    title: '🏆 Ranked League',
    subtitle: 'Tabla de honor global por club · rating Elo con badge · reset mensual',
    season: 'Temporada',
    club: 'Tu club',
    player: 'Jugador o pareja',
    pickBadge: 'Tu badge',
    join: 'Unirme a la liga',
    adding: 'Añadiendo…',
    list: 'Tabla de honor',
    empty: 'Todavía no hay competidores. ¡Sé el primero en subir!',
    playerH: 'Jugador',
    clubLabel: 'Club',
    rating: 'Rating',
    online: '🟢 Nube',
    local: '🟡 Local',
    loggedAs: 'Registrado como',
    resetNote: 'Se reinicia cada mes automáticamente.',
    fip: 'Ranking mundial FIP', 
    fipHint: 'Ranking oficial de la Federación Internacional de Pádel (fuente)',
  },
  en: {
    title: '🏆 Ranked League',
    subtitle: 'Global leaderboard · Elo rating with badge · monthly reset',
    season: 'Season',
    club: 'Your club',
    player: 'Player or pair',
    pickBadge: 'Your badge',
    join: 'Join the league',
    adding: 'Adding…',
    list: 'Leaderboard',
    empty: 'No competitors yet. Be the first to climb!',
    playerH: 'Player',
    clubLabel: 'Club',
    rating: 'Rating',
    online: '🟢 Cloud',
    local: '🟡 Local',
    loggedAs: 'Signed in as',
    extra: 'Resets automatically every month.',
    fip: 'FIP World Ranking',
    fipHint: 'Official ranking of the International Padel Federation (source)',
  },
  fr: {
    title: '🏆 Ranked League',
    subtitle: 'Tableau d\u2019honneur global · Elo avec badge · reset mensuel',
    season: 'Saison',
    club: 'Ton club',
    join: 'Rejoindre la ligue',
    adding: 'Ajout…',
    list: 'Tableau d\u2019honneur',
    empty: 'Aucun compétiteur encore. Soyez le premier !',
    playerH: 'Joueur',
    clubLabel: 'Club',
    rating: 'Rating',
    online: '🟢 Cloud',
    local: '🟡 Local',
    loggedAs: 'Connecté en tant que',
    extra: 'Réinitialisation automatique chaque mois.',
    fip: 'Classement mondial FIP',
    fipHint: 'Classement officiel de la Fédération Internationale de Padel (source)',
  },
  pt: {
    title: '🏆 Ranked League',
    subtitle: 'Tabela de honra global · Elo com badge · reset mensal',
    season: 'Temporada',
    club: 'Seu clube',
    join: 'Entrar na liga',
    adding: 'Adicionando…',
    list: 'Tabela de honra',
    empty: 'Ainda sem competidores. Seja o primeiro!',
    playerH: 'Jogador',
    clubLabel: 'Clube',
    rating: 'Rating',
    online: '🟢 Nuvem',
    local: '🟡 Local',
    loggedAs: 'Conectado como',
    extra: 'Reinicia automaticamente todos os meses.',
    fip: 'Ranking mundial FIP',
    fipHint: 'Ranking oficial da Federação Internacional de Pádel (fonte)',
  },
};

const card = { background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '22px' };
const inputStyle = { width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14, fontWeight: 600, boxSizing: 'border-box' };

export default function RankedLeague({ lang = 'es', online }) {
  const T = I18N[lang] || I18N.es;
  const { user } = useAuth();

  const [league, setLeague] = useState(null);
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState('');
  const [club, setClub] = useState('');
  const [badge, setBadge] = useState('FRIEND');
  const [busy, setBusy] = useState(false);

  const isCloud = online !== undefined ? online : true;
  const refresh = (lg) => lg && listLeague(lg.id, { cloud: isCloud }).then(setEntries);

  useEffect(() => {
    (async () => {
      const lg = await ensureCurrentLeague({ club: club || 'PadelOrganizers' });
      setLeague(lg);
      refresh(lg);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const join = async () => {
    if (!league) return;
    const displayName = (user?.email || name).trim();
    if (!displayName) return;
    setBusy(true);
    try {
      await upsertEntry(league.id, {
        playerName: displayName, club: club.trim() || league.club || 'PadelOrganizers',
        badge, pairNames: displayName, playerId: user?.id || null, rating: 1500,
        cloud: isCloud,
      });
      refresh(league);
    } finally {
      setBusy(false);
    }
  };

  const me = user?.email || name;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{T.title}</h2>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>{T.subtitle}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: isCloud ? '#84cc16' : '#fbbf24', fontWeight: 700 }}>
            {isCloud ? T.online : T.local} · {T.season} {currentSeason()}
          </span>
          <a
            href="https://www.padelfip.com/es/fip-rankings/"
            target="_blank"
            rel="noopener noreferrer"
            title={T.fipHint}
            style={{ fontSize: '12px', fontWeight: 700, color: '#a3e635', textDecoration: 'none', border: '1px solid rgba(163,230,53,0.35)', borderRadius: '8px', padding: '4px 10px', background: 'rgba(163,230,53,0.08)' }}
          >
            🌍 {T.fip} ↗
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,0.9fr) 1.3fr', gap: 20, alignItems: 'start' }}>
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.club}</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px' }}>{T.extra}</p>

          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginBottom: 6 }}>{T.club}</label>
          <input value={club} onChange={e => setClub(e.target.value)} placeholder="Club Pádel Bouzas" style={inputStyle} />

          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 700, margin: '12px 0 6px' }}>{T.pickBadge}</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BADGES.map(b => (
              <button key={b.id} onClick={() => setBadge(b.id)} style={{
                padding: '8px 12px', borderRadius: '10px', border: badge === b.id ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                background: badge === b.id ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', color: badge === b.id ? '#a3e635' : '#cbd5e1',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>
                {b.icon} {b.label}
              </button>
            ))}
          </div>

          {!user && (
            <>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 700, margin: '12px 0 6px' }}>{T.playerH}</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={T.playerH} style={inputStyle} />
            </>
          )}

          {user && <p style={{ fontSize: '12px', color: '#64748b', margin: '12px 0 0' }}>{T.loggedAs}: {user.email || user.id}</p>}

          <button onClick={join} disabled={busy || !(name.trim() || user)}
            style={{
              width: '100%', marginTop: 16, padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              background: busy ? '#64748b' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
            }}>
            {busy ? '…' : `🏅 ${T.join}`}
          </button>
        </div>

        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 14px' }}>{T.list}</h3>
          {entries.length === 0 && <p style={{ color: '#64748b', fontSize: 14 }}>{T.empty}</p>}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.3)' }}>
                <th style={{ textAlign: 'left', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>#</th>
                <th style={{ textAlign: 'left', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.playerH}</th>
                <th style={{ textAlign: 'left', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.clubLabel}</th>
                <th style={{ textAlign: 'right', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.rating}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: e.playerName === me ? 'rgba(16,185,129,0.12)' : 'transparent' }}>
                  <td style={{ padding: '10px 6px', fontWeight: 800, color: i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#d6a26a' : '#94a3b8' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                  <td style={{ padding: '10px 6px', fontWeight: 700, color: e.playerName === me ? '#a3e635' : '#f0fdf4' }}>
                    {badgeIcon(e.badge)} {e.playerName}
                  </td>
                  <td style={{ padding: '10px 6px', color: '#94a3b8' }}>{e.club || '—'}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 800, color: '#84cc16' }}>{Math.round(e.rating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}