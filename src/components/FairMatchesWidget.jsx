import React, { useEffect, useState } from 'react';
import { getFairMatchesForClub, levelFromElo } from '../services/matchmakingService';

const I18N = {
  es: { title: '🎯 Partidos parejos esta semana', subtitle: 'Emparejamientos equilibrados por nivel (ELO) para socios del club', when: 'Cuándo', level: 'Nivel', diff: 'ΔELO', demo: 'Demo', viewAll: 'Ver todos en Matchmaking →', noMatches: 'Aún no hay emparejamientos. Los socios crean anuncios en "Busco cuarto".' },
  en: { title: '🎯 Fair matches this week', subtitle: 'Balanced pairings by level (ELO) for club members', when: 'When', level: 'Level', diff: 'ΔELO', demo: 'Demo', viewAll: 'View all in Matchmaking →', noMatches: 'No matches yet. Members create ads in "Looking for a fourth".' },
  fr: { title: '🎯 Matchs équilibrés cette semaine', subtitle: 'Paires équilibrées par niveau (ELO) pour les membres du club', when: 'Quand', level: 'Niveau', diff: 'ΔELO', demo: 'Demo', viewAll: 'Voir tout dans Matchmaking →', noMatches: 'Pas encore de matchs. Les membres créent des annonces dans "Cherche un quatrième".' },
  pt: { title: '🎯 Jogos equilibrados esta semana', subtitle: 'Emparelhamentos equilibrados por nível (ELO) para sócios do clube', when: 'Quando', level: 'Nível', diff: 'ΔELO', demo: 'Demo', viewAll: 'Ver todos em Matchmaking →', noMatches: 'Ainda não há jogos. Sócios criam anúncios em "Procuro quarto".' },
};

const cardStyle = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 14, padding: 18 };
const rowStyle = { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--padel-border)' };
const lastRow = { ...rowStyle, borderBottom: 'none' };

function EloBadge({ elo, level, size = 'small' }) {
  const colors = { 1.0: '#fbbf24', 1.5: '#f97316', 2.0: '#fb923c', 2.5: '#38bdf8', 3.0: '#a3e635', 3.5: '#10b981', 4.0: '#22d3ee', 4.5: '#f472b6' };
  const c = colors[level] || '#a3e635';
  if (size === 'small') {
    return <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: `${c}22`, color: c }}>{elo} · {level}</span>;
  }
  return <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: `${c}22`, color: c }}>{elo} ({level})</span>;
}

export default function FairMatchesWidget({ club, lang = 'es', maxMatches = 4 }) {
  const T = I18N[lang] || I18N.es;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!club) { setLoading(false); return; }
    let mounted = true;
    getFairMatchesForClub(club, maxMatches).then(data => { if (mounted) { setMatches(data); setLoading(false); } });
    return () => { mounted = false; };
  }, [club, maxMatches]);

  if (loading) return <div style={{ ...cardStyle, opacity: 0.6, pointerEvents: 'none' }}>{T.title}…</div>;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)' }}>{T.title}</div>
          <div style={{ fontSize: 11, color: 'var(--padel-muted)', marginTop: 2 }}>{T.subtitle}</div>
        </div>
        <a href="/match" style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-emerald)', textDecoration: 'none' }}>{T.viewAll}</a>
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 16, color: 'var(--padel-muted)', fontSize: 13 }}>
          {T.noMatches}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {matches.map((m, i) => (
            <div key={i} style={i === matches.length - 1 ? lastRow : rowStyle}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--padel-text)' }}>{m.player1.name}</span>
                  <EloBadge elo={m.player1.elo} level={m.player1.level} />
                  <span style={{ color: 'var(--padel-muted)', fontWeight: 700, fontSize: 13 }}>vs</span>
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--padel-text)' }}>{m.player2.name}</span>
                  <EloBadge elo={m.player2.elo} level={m.player2.level} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap', fontSize: 11, color: 'var(--padel-muted)' }}>
                  <span>{T.when}: <b style={{ color: 'var(--padel-text)' }}>{m.when}</b></span>
                  <span>{T.slot}: <b style={{ color: 'var(--padel-text)' }}>{m.slot}</b></span>
                  <span>{T.diff}: <b style={{ color: m.diff <= 150 ? '#a3e635' : m.diff <= 250 ? '#fbbf24' : '#fb7185' }}>{m.diff}</b></span>
                  {m.when === 'Demo' && <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 999, background: '#fbbf2422', color: '#fbbf24' }}>{T.demo}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}