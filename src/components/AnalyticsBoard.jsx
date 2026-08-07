import React, { useMemo } from 'react';
import {
  forecastFinalStandings, eloSeries, matchupHeatmap, tournamentKpis,
} from '../services/analyticsService';

const I18N = {
  es: {
    title: '📊 Analíticas & Pronósticos',
    subtitle: 'Datos del torneo convertidos en decisiones: proyección final, evolución Elo y nivel de rivalidad.',
    kpiLeader: 'Líder actual',
    kpiBest: 'Mejor jugador',
    kpiAvg: 'Elo medio',
    kpiPairs: 'Parejas',
    forecast: 'Pronóstico de clasificación final',
    forecastSub: 'Proyección de la tabla final según puntos y partidos restantes',
    chanceTop: 'Opto podio',
    form: 'Curva de Elo (forma)',
    formSub: 'Evolución estimada del rating',
    heatTitle: 'Heatmap de nivel (rivalidad)',
    heatSub: 'Probabilidad de victoria de fila frente a columna',
  },
  en: {
    title: '📊 Analytics & Forecasts',
    subtitle: 'Tournament data turned into decisions: projection, Elo trend and rivalry.',
    kpiLeader: 'Current leader',
    kpiBest: 'Best player',
    kpiAvg: 'Avg Elo',
    kpiPairs: 'Pairs',
    forecast: 'Final standing forecast',
    forecastSub: 'Projected final table based on points and remaining matches',
    chanceTop: 'Podium',
    form: 'Elo curve (form)',
    formSub: 'Estimated rating evolution',
    heatTitle: 'Matchup heatmap (rivalry)',
    heatSub: 'Win probability of row vs column',
  },
  fr: {
    title: '📊 Analyses & Pronostics',
    subtitle: 'Les données du tournoi en décisions : projection, Elo et rivalité.',
    kpiLeader: 'Leader actuel',
    kpiBest: 'Meilleur joueur',
    kpiAvg: 'Elo moyen',
    kpiPairs: 'Paires',
    forecast: 'Pronostic du classement final',
    forecastSub: 'Classement final projeté selon les points et matchs restants',
    chanceTop: 'Podium',
    form: 'Courbe d\u2019Elo (forme)',
    formSub: 'Évolution estimée du classement',
    heatTitle: 'Heatmap des confrontations',
    heatSub: 'Probabilité de victoire ligne contre colonne',
  },
  pt: {
    title: '📊 Análises & Prognósticos',
    subtitle: 'Dados do torneio em decisões: projeção, Elo e rivalidade.',
    kpiLeader: 'Líder atual',
    kpiBest: 'Melhor jogador',
    kpiAvg: 'Elo médio',
    kpiPairs: 'Pares',
    forecast: 'Prognóstico da classificação final',
    forecastSub: 'Classificação final projetada segundo pontos e partidas restantes',
    chanceTop: 'Pódio',
    form: 'Curva de Elo (forma)',
    formSub: 'Evolução estimada do rating',
    heatTitle: 'Heatmap de confrontos',
    heatSub: 'Probabilidade de vitória da linha contra a coluna',
  },
};

const card = { background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '22px' };

function Bar({ pct, color }) {
  return (
    <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(4, Math.min(100, pct))}%`, height: '100%', background: color, borderRadius: 6 }} />
    </div>
  );
}

export default function AnalyticsBoard({ state, lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const data = state || {};
  const kpis = useMemo(() => tournamentKpis(data), [data]);
  const forecast = useMemo(() => forecastFinalStandings(data), [data]);
  const heatmap = useMemo(() => matchupHeatmap(data), [data]);

  const leaderPair = [...(data.pairs || [])].sort((a, b) => b.points - a.points)[0];
  const series = useMemo(() => leaderPair ? eloSeries(data, leaderPair.id) : [], [data, leaderPair]);

  const eloMin = series.length ? Math.min(...series.map(s => s.elo)) : 0;
  const eloMax = series.length ? Math.max(...series.map(s => s.elo)) : 1;
  const span = Math.max(1, eloMax - eloMin);

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{T.title}</h2>
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px' }}>{T.subtitle}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 14, marginBottom: 20 }}>
        {[
          ['\U0001F3C6', T.kpiLeader, kpis.leader],
          ['\u2605', T.kpiBest, kpis.bestPlayer],
          ['\U0001F3C6', T.kpiAvg, kpis.avgElo],
          ['\u2697', T.kpiPairs, kpis.pairs],
        ].map(([icon, label, val], i) => (
          <div key={i} style={card}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 6 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f0fdf4' }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, marginBottom: 20 }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.forecast}</h3>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px' }}>{T.forecastSub}</p>
        {forecast.map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: i < 3 ? 'linear-gradient(135deg,#10b981,#84cc16)' : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13,
              color: i < 3 ? '#fff' : '#94a3b8',
            }}>
              {row.projectedRank}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0fdf4' }}>{pairLabel(data, row)}</div>
              <div style={{ marginTop: 6 }}>
                <Bar pct={row.chanceTop} color={row.chanceTop > 60 ? '#10b981' : '#84cc16'} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#84cc16' }}>{row.projectedPoints} pts</div>
              <div style={{ fontSize: 11, color: '#38bdf8' }}>{T.chanceTop} {row.chanceTop}%</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.form}</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px' }}>{T.formSub}</p>
          {series.length ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {series.map(pt => (
                <div key={pt.round} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                  <div style={{
                    width: '100%',
                    height: `${Math.max(8, ((pt.elo - eloMin) / span) * 100)}%`,
                    background: 'linear-gradient(180deg,#10b981,#059669)',
                    borderRadius: '4px 4px 0 0',
                  }} />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.heatTitle}</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px' }}>{T.heatSub}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 6, color: '#94a3b8', fontWeight: 700 }}>#</th>
                {heatmap.map(h => (
                  <th key={h.pairId} style={{ padding: 6, color: '#84cc16', fontWeight: 700 }} title={h.name}>{shortPair(h.name)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmap.map(h => (
                <tr key={h.pairId}>
                  <td style={{ padding: 6, color: '#f0fdf4', fontWeight: 700 }}>{shortPair(h.name)}</td>
                  {h.matchups.map((c, ci) => (
                    <td key={ci} style={{
                      padding: 6, textAlign: 'center', fontWeight: 700,
                      color: c.label === '—' ? '#64748b' : 'rgba(255,255,255,0.9)',
                      background: c.label === '—' ? 'transparent' : heatColor((1 - Math.abs(c.pA - 0.5) * 2) * 100),
                      borderRadius: 4,
                    }}>
                      {c.label}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function pairLabel(data, row) {
  const players = (data.players || []).filter(x => x.pairId === row.pairId);
  return players.length ? players.map(x => (x.name || '').split(' ')[0]).join(' / ') : (row.pair1Names || row.pairId || 'Equipo');
}
function shortPair(name) {
  const n = (name || '') === '—' ? '—' : (name || '').split('/')[0];
  return n && n.length > 6 ? n.slice(0, 5) + '…' : n;
}
function heatColor(v) {
  return `rgba(16,185,129,${0.2 + v * 0.6})`;
}