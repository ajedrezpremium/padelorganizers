import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../services/store';
import { listLeague } from '../services/leagueService';
import {
  computeGlobalRanking, saveSnapshot, globalStats, movementIcon,
} from '../services/globalRankingService';

const I18N = {
  es: {
    title: '🏆 Global Padel Ranking',
    subtitle: 'Clasificación mundial amateur · agrega torneos + ranked league · Elo con nivel de torneo',
    players: 'Jugadores',
    avgElo: 'Elo medio',
    topElo: 'Elo máximo',
    clubs: 'Clubes',
    sources: 'Orígenes',
    search: 'Buscar jugador o club…',
    allClubs: 'Todos los clubes',
    allSources: 'Todos los orígenes',
    origin: 'Origen',
    rank: 'Pos',
    player: 'Jugador',
    level: 'Nivel',
    clubLabel: 'Club',
    played: 'PJ',
    wins: 'V',
    elo: 'Elo',
    pct: 'Percentil',
    ranking: 'Clasificación mundial',
    leaders: 'Podio mundial',
    empty: 'Sin jugadores aún. Crea un torneo o únete a la Ranked League.',
    tourn: 'Torneo',
    league: 'Ranked League',
    delta: 'Δ Elo',
    toLeague: 'Puntúa en la Ranked League ↗',
  },
  en: {
    title: '🏆 Global Padel Ranking',
    subtitle: 'World amateur ranking · tournaments + ranked league · Elo with tournament level',
    players: 'Players',
    avgElo: 'Avg Elo',
    topElo: 'Top Elo',
    clubs: 'Clubs',
    sources: 'Sources',
    search: 'Search player or club…',
    allClubs: 'All clubs',
    allSources: 'All sources',
    origin: 'Origin',
    rank: '#',
    player: 'Player',
    level: 'Level',
    clubLabel: 'Club',
    played: 'P',
    wins: 'W',
    elo: 'Elo',
    pct: 'Pct',
    ranking: 'World ranking',
    leaders: 'World podium',
    empty: 'No players yet. Create a tournament or join the Ranked League.',
    tourn: 'Tournament',
    league: 'Ranked League',
    delta: 'Δ Elo',
    toLeague: 'Score in the Ranked League ↗',
  },
  fr: {
    title: '🏆 Classement mondial Padel',
    subtitle: 'Classement amateur mondial · tournois + ranked league · Elo avec niveau',
    players: 'Joueurs',
    avgElo: 'Elo moyen',
    topElo: 'Elo max',
    clubs: 'Clubs',
    sources: 'Origines',
    search: 'Rechercher joueur ou club…',
    allClubs: 'Tous les clubs',
    allSources: 'Toutes les origines',
    origin: 'Origine',
    rank: '#',
    player: 'Joueur',
    level: 'Niveau',
    clubLabel: 'Club',
    played: 'J',
    wins: 'V',
    elo: 'Elo',
    pct: 'Centile',
    ranking: 'Classement mondial',
    leaders: 'Podium mondial',
    empty: 'Aucun joueur. Créez un tournoi ou rejoignez la Ranked League.',
    tourn: 'Tournoi',
    league: 'Ranked League',
    delta: 'Δ Elo',
    toLeague: 'Scorez dans la Ranked League ↗',
  },
  pt: {
    title: '🏆 Ranking Mundial de Padel',
    subtitle: 'Ranking amador mundial · torneios + ranked league · Elo com nível',
    players: 'Jogadores',
    avgElo: 'Elo médio',
    topElo: 'Elo máx',
    clubs: 'Clubes',
    sources: 'Origens',
    search: 'Buscar jogador ou clube…',
    allClubs: 'Todos os clubes',
    allSources: 'Todas as origens',
    origin: 'Origem',
    rank: '#',
    player: 'Jogador',
    level: 'Nível',
    clubLabel: 'Clube',
    played: 'J',
    wins: 'V',
    elo: 'Elo',
    pct: 'Percentil',
    ranking: 'Ranking mundial',
    leaders: 'Pódio mundial',
    empty: 'Sem jogadores ainda. Crie um torneio ou entre na Ranked League.',
    tourn: 'Torneio',
    league: 'Ranked League',
    delta: 'Δ Elo',
    toLeague: 'Some pontos na Ranked League ↗',
  },
};

const card = { background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '18px' };
const medal = ['🥇', '🥈', '🥉'];
const medalColor = ['#fbbf24', '#cbd5e1', '#d6a26a'];

export default function GlobalRanking({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const data = useStore();
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [clubFilter, setClubFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  useEffect(() => {
    listLeague('', { cloud: false })
      .then(list => setEntries(list))
      .catch(() => setEntries([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ranking = useMemo(() => computeGlobalRanking({ tournament: data, leagueEntries: entries }), [data, entries]);

  useEffect(() => {
    if (ranking.length) saveSnapshot(ranking);
  }, [ranking]);

  const stats = useMemo(() => globalStats(ranking), [ranking]);

  const clubs = useMemo(() => [...new Set(ranking.map(r => r.club).filter(Boolean))].sort(), [ranking]);
  const sources = useMemo(() => [...new Set(ranking.map(r => r.sourceLabel).filter(Boolean))].sort(), [ranking]);

  const filtered = ranking.filter(r => {
    const q = search.trim().toLowerCase();
    if (q && !(`${r.name} ${r.club}`.toLowerCase().includes(q))) return false;
    if (clubFilter && r.club !== clubFilter) return false;
    if (sourceFilter && r.sourceLabel !== sourceFilter) return false;
    return true;
  });

  const podium = ranking.slice(0, 3);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{T.title}</h2>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>{T.subtitle}</span>
        </div>
        <Link to="/league" style={{
          fontSize: '12px', fontWeight: 700, color: '#a3e635', textDecoration: 'none',
          border: '1px solid rgba(163,230,53,0.35)', borderRadius: '8px', padding: '5px 12px', background: 'rgba(163,230,53,0.08)',
        }}>
          {T.toLeague}
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 18 }}>
        {[
          [T.players, String(stats.players)],
          [T.avgElo, String(stats.avgElo)],
          [T.topElo, String(stats.topElo)],
          [T.clubs, String(stats.clubs)],
          [T.sources, String(stats.tournaments)],
        ].map(([label, value]) => (
          <div key={label} style={card}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#a3e635' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Podio mundial */}
      {podium.length > 0 && (
        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>{T.leaders}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {podium.map((r, i) => (
              <div key={r.key} style={{
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px',
                padding: '12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '26px' }}>{medal[i]}</div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: 14, marginTop: 4 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.level} · {r.elo}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{r.club}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 10, margin: '16px 0' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={T.search} style={{
          padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 13, boxSizing: 'border-box',
        }} />
        <select value={clubFilter} onChange={e => setClubFilter(e.target.value)} style={{
          padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
          background: '#0e1e1b', color: '#fff', fontSize: 13,
        }}>
          <option value="">{T.allClubs}</option>
          {clubs.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{
          padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
          background: '#0e1e1b', color: '#fff', fontSize: 13,
        }}>
          <option value="">{T.allSources}</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>{T.ranking} · {filtered.length}</h3>
        {filtered.length === 0 && <p style={{ color: '#64748b', fontSize: 14 }}>{T.empty}</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(16,185,129,0.3)' }}>
              <th style={{ textAlign: 'left', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.rank}</th>
              <th style={{ textAlign: 'left', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.player}</th>
              <th style={{ textAlign: 'left', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.level}</th>
              <th style={{ textAlign: 'left', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.clubLabel}</th>
              <th style={{ textAlign: 'center', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.origin}</th>
              <th style={{ textAlign: 'center', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.played}</th>
              <th style={{ textAlign: 'center', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.wins}</th>
              <th style={{ textAlign: 'right', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.elo}</th>
              <th style={{ textAlign: 'right', padding: '10px 6px', color: '#84cc16', fontWeight: 800 }}>{T.pct}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '10px 6px', fontWeight: 800, color: r.rank <= 3 ? medalColor[r.rank - 1] : '#94a3b8' }}>
                  {r.rank <= 3 ? medal[r.rank - 1] : `#${r.rank}`}
                </td>
                <td style={{ padding: '10px 6px', fontWeight: 700, color: '#f0fdf4' }}>
                  {r.name}
                  <span style={{ color: r.movement === 'up' ? '#4ade80' : r.movement === 'down' ? '#f87171' : '#64748b', marginLeft: 6, fontSize: 11 }}>
                    {movementIcon(r.movement)}{r.eloDelta !== 0 && r.movement !== 'new' ? ` ${r.eloDelta > 0 ? '+' : ''}${r.eloDelta}` : ''}
                  </span>
                </td>
                <td style={{ padding: '10px 6px', color: '#a3e635', fontWeight: 700 }}>{r.level.toFixed(2)}</td>
                <td style={{ padding: '10px 6px', color: '#94a3b8' }}>{r.club}</td>
                <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                    background: r.source === 'tournament' ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.15)',
                    color: r.source === 'tournament' ? '#6ee7b7' : '#fbbf24',
                  }}>
                    {r.source === 'tournament' ? T.tourn : T.league}
                  </span>
                </td>
                <td style={{ padding: '10px 6px', textAlign: 'center', color: '#cbd5e1' }}>{r.played}</td>
                <td style={{ padding: '10px 6px', textAlign: 'center', color: '#84cc16' }}>{r.wins}</td>
                <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 800, color: '#84cc16' }}>{r.elo}</td>
                <td style={{ padding: '10px 6px', textAlign: 'right', color: '#94a3b8' }}>{r.percentile}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}