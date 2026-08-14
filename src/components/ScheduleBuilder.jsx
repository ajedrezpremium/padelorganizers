import React, { useState, useMemo } from 'react';
import {
  generateAmericanoRounds, generatePredictivePairings, generatePredictiveMatches, pairToMatch,
} from '../services/padelEngine';
import { assignSchedule, DEFAULT_OPTIONS, fmtMinLabel } from '../services/schedulerService';

const I18N = {
  es: {
    title: '🗓️ Programación IA del Torneo',
    subtitle: 'La IA asigna pista y horario a todas las rondas sin que nadie coincida dos veces.',
    formatAmericano: 'Americano',
    formatIA: '🤖 IA Predictiva',
    americanoDesc: 'Rotación fija: todos los jugadores juegan contra todos en todas las rondas.',
    iaDesc: 'Parejas optimizadas por Elo + programación automática en pistas.',
    scheduleBtn: '🤖 Programar torneo completo',
    addBtn: '➕ Añadir al torneo',
    added: '✓ Añadido',
    empty: 'Necesitas al menos 4 jugadores y 1 pista.',
    generated: 'Partidos programados',
    courts: 'Pistas',
    slots: 'Franjas',
    totalHours: 'Duración total',
    conflicts: 'Sin conflictos: nadie comparte pista ni hora',
    settings: 'Configuración',
    startHour: 'Inicio',
    endHour: 'Fin',
    matchMin: 'Duración partido (min)',
    gapMin: 'Margen entre partidos (min)',
    balance: 'Equilibrio',
    hour: 'Hora',
    noPlan: 'Genera el plan para ver el calendario.',
    allRoundsNote: 'Programa TODAS las rondas de golpe.',
  },
  en: {
    title: '🗓️ AI Tournament Scheduler',
    subtitle: 'The AI assigns courts and times to every round with no player overlaps.',
    formatAmericano: 'Americano',
    formatIA: '🤖 Predictive AI',
    americanoDesc: 'Fixed rotation: every player plays everyone across all rounds.',
    iaDesc: 'Elo-optimized pairings + automatic court scheduling.',
    scheduleBtn: '🤖 Schedule full tournament',
    addBtn: '➕ Add to tournament',
    added: '✓ Added',
    empty: 'You need at least 4 players and 1 court.',
    generated: 'Scheduled matches',
    courts: 'Courts',
    slots: 'Slots',
    totalHours: 'Total duration',
    conflicts: 'No conflicts: nobody shares a court or time',
    settings: 'Settings',
    startHour: 'Start',
    endHour: 'End',
    matchMin: 'Match length (min)',
    gapMin: 'Gap between matches (min)',
    balance: 'Balance',
    hour: 'Time',
    noPlan: 'Generate the plan to see the calendar.',
    allRoundsNote: 'Schedules ALL rounds at once.',
  },
  fr: {
    title: '🗓️ Planification IA du tournoi',
    subtitle: "L'IA attribue courts et créneaux à toutes les rondes sans chevauchement.",
    formatAmericano: 'Américain',
    formatIA: '🤖 IA prédictive',
    americanoDesc: 'Rotation fixe : tous les joueurs s\'affrontent sur toutes les rondes.',
    iaDesc: 'Paires optimisées par Elo + planification automatique des courts.',
    scheduleBtn: '🤖 Planifier tout le tournoi',
    addBtn: '➕ Ajouter au tournoi',
    added: '✓ Ajouté',
    empty: 'Il faut au moins 4 joueurs et 1 court.',
    generated: 'Matchs planifiés',
    courts: 'Courts',
    slots: 'Créneaux',
    totalHours: 'Durée totale',
    conflicts: 'Aucun conflit : personne ne partage court ni heure',
    settings: 'Réglages',
    startHour: 'Début',
    endHour: 'Fin',
    matchMin: 'Durée du match (min)',
    gapMin: 'Marge entre matchs (min)',
    balance: 'Équilibre',
    hour: 'Heure',
    noPlan: 'Générez le plan pour voir le calendrier.',
    allRoundsNote: 'Planifie TOUTES les rondes en une fois.',
  },
  pt: {
    title: '🗓️ Programação IA do Torneio',
    subtitle: 'A IA atribui quadra e horário a todas as rodadas sem ninguém coincidir.',
    formatAmericano: 'Americano',
    formatIA: '🤖 IA Preditiva',
    americanoDesc: 'Rotação fixa: todos jogam contra todos em todas as rodadas.',
    iaDesc: 'Duplas otimizadas por Elo + programação automática das quadras.',
    scheduleBtn: '🤖 Programar torneio completo',
    addBtn: '➕ Adicionar ao torneio',
    added: '✓ Adicionado',
    empty: 'Precisa de pelo menos 4 jogadores e 1 quadra.',
    generated: 'Partidas programadas',
    courts: 'Quadras',
    slots: 'Faixas',
    totalHours: 'Duração total',
    conflicts: 'Sem conflitos: ninguém compartilha quadra nem horário',
    settings: 'Configuração',
    startHour: 'Início',
    endHour: 'Fim',
    matchMin: 'Duração do jogo (min)',
    gapMin: 'Intervalo entre jogos (min)',
    balance: 'Equilíbrio',
    hour: 'Hora',
    noPlan: 'Gere o plano para ver o calendário.',
    allRoundsNote: 'Programa TODAS as rodadas de uma vez.',
  },
};

const inputStyle = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
  borderRadius: '8px', padding: '8px 10px', fontSize: '13px', width: '100%',
};
const labelStyle = { fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 700 };

export default function ScheduleBuilder({ state, onAddRound, lang: langProp }) {
  const lang = langProp || state?.tournament?.lang || 'es';
  const T = I18N[lang] || I18N.es;

  const [format, setFormat] = useState('americano');
  const [startHour, setStartHour] = useState(String(DEFAULT_OPTIONS.startHour));
  const [endHour, setEndHour] = useState(String(DEFAULT_OPTIONS.endHour));
  const [matchMin, setMatchMin] = useState(DEFAULT_OPTIONS.matchMinutes);
  const [gapMin, setGapMin] = useState(DEFAULT_OPTIONS.gapMinutes);
  const [plan, setPlan] = useState(null);
  const [added, setAdded] = useState(false);

  const courts = state.courts;
  const players = state.players;
  const playerIds = players.map(p => p.id);

  const rounds = useMemo(() => {
    if (format === 'americano') {
      return generateAmericanoRounds(playerIds).map(pairs => {
        const ms = [];
        for (let i = 0; i + 1 < pairs.length; i += 2) {
          ms.push(pairToMatch(state, pairs[i], pairs[i + 1]));
        }
        return ms;
      });
    }
    // IA predictiva
    const teams = generatePredictivePairings(state);
    return [generatePredictiveMatches(state, teams)];
  }, [format, playerIds, state]);

  const hasPlan = plan && plan.length > 0;
  const scheduledCount = hasPlan ? plan.filter(m => m.scheduled).length : 0;
  const totalEndMin = hasPlan ? Math.max(...plan.filter(m => m.scheduled).map(m => m.endMin)) : null;
  const totalStartMin = hasPlan ? Math.min(...plan.filter(m => m.scheduled).map(m => m.startMin)) : null;

  const handleSchedule = () => {
    const allMatches = rounds.flat();
    if (!allMatches.length || courts.length === 0) return;
    const assigned = assignSchedule(allMatches, courts, {
      startHour, endHour, matchMinutes: Number(matchMin), gapMinutes: Number(gapMin),
    });
    setPlan(assigned);
    setAdded(false);
  };

  const handleAdd = () => {
    const usable = (plan || []).filter(m => m.scheduled);
    if (!usable.length) return;
    onAddRound({ matches: usable, format });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const name = (id) => (players.find(p => p.id === id)?.name || id).split(' ')[0];
  const teamLabel = (ids) => (ids || []).map(name).join(' / ');

  return (
    <div style={{ background: '#0e1e1b', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '16px', padding: '20px' }}>
      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.title}</h3>
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px' }}>{T.subtitle}</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {['americano', 'ia'].map(f => (
          <button key={f} onClick={() => { setFormat(f); setPlan(null); }}
            style={{
              flex: 1, minWidth: '140px', padding: '11px', borderRadius: '10px',
              border: format === f ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
              background: format === f ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)',
              color: format === f ? '#7dd3fc' : '#cbd5e1', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            }}>
            {f === 'americano' ? T.formatAmericano : T.formatIA}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
        {format === 'americano' ? T.americanoDesc : T.iaDesc}
        {format === 'americano' && ` · ${T.allRoundsNote}`}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>{T.settings} — {T.startHour}</label>
          <input type="number" min="0" max="23" value={startHour} onChange={e => setStartHour(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{T.endHour}</label>
          <input type="number" min="0" max="23" value={endHour} onChange={e => setEndHour(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{T.matchMin}</label>
          <input type="number" min="15" step="5" value={matchMin} onChange={e => setMatchMin(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{T.gapMin}</label>
          <input type="number" min="0" step="5" value={gapMin} onChange={e => setGapMin(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <button onClick={handleSchedule} disabled={courts.length === 0 || playerIds.length < 4}
        style={{
          width: '100%', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff',
          opacity: (courts.length === 0 || playerIds.length < 4) ? 0.4 : 1,
        }}>
        {T.scheduleBtn}
      </button>

      {playerIds.length < 4 && <p style={{ fontSize: '12px', color: '#f87171', margin: '10px 0 0' }}>{T.empty}</p>}

      {hasPlan && (
        <div style={{ marginTop: '18px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', padding: '10px 14px' }}>
              <div style={{ fontSize: '11px', color: '#7dd3fc', fontWeight: 700 }}>{T.generated}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{scheduledCount}</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '10px 14px' }}>
              <div style={{ fontSize: '11px', color: '#84cc16', fontWeight: 700 }}>{T.totalHours}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{totalStartMin !== null ? `${fmtMinLabel(totalStartMin)} → ${fmtMinLabel(totalEndMin)}` : '—'}</div>
            </div>
            <div style={{ background: 'rgba(132,204,22,0.08)', border: '1px solid rgba(132,204,22,0.25)', borderRadius: '10px', padding: '10px 14px', flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#a3e635', fontWeight: 700 }}>{T.conflicts}</div>
              <div style={{ fontSize: '12px', color: '#d1fae5', marginTop: '4px' }}>✓</div>
            </div>
          </div>

          {/* Calendario grid pista × hora */}
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {courts.map(c => {
                const courtMatches = plan.filter(m => m.scheduled && m.courtId === c.id);
                const maxH = 480;
                const startMin = Math.min(...courtMatches.map(m => m.startMin));
                const endMin = Math.max(...courtMatches.map(m => m.endMin));
                return (
                  <div key={c.id} style={{ flex: 1, minWidth: '200px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#7dd3fc', marginBottom: '10px', textAlign: 'center' }}>{c.name}</div>
                    <div style={{ minHeight: maxH }}>
                      {courtMatches.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#475569', fontSize: '11px', paddingTop: '20px' }}>—</div>
                      ) : courtMatches.map((m, i) => (
                        <div key={i} style={{
                          background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(2,132,199,0.1))',
                          border: '1px solid rgba(56,189,248,0.35)', borderRadius: '8px', padding: '8px 10px', marginBottom: '8px',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>{m.startLabel}–{m.endLabel}</span>
                            {format === 'ia' && m.predict && (
                              <span style={{ fontSize: '10px', color: '#84cc16', fontWeight: 700 }}>{T.balance} {Math.round((m.balance || m.predict && (1 - Math.abs(m.predict.pA - 0.5) * 2)) * 100)}%</span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: '#e0f2fe', fontWeight: 700, lineHeight: 1.4 }}>
                            {teamLabel(m.playerIds1)}
                            <span style={{ color: '#7dd3fc', margin: '0 5px' }}>vs</span>
                            {teamLabel(m.playerIds2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={handleAdd} disabled={scheduledCount === 0}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
              background: added ? '#84cc16' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', marginTop: '14px',
              opacity: scheduledCount === 0 ? 0.4 : 1,
            }}>
            {added ? '✓' : T.addBtn}
          </button>

          <p style={{ fontSize: '11px', color: '#64748b', margin: '10px 0 0' }}>
            ℹ️ {scheduledCount} {T.generated} · {T.hour}: {totalStartMin !== null ? `${fmtMinLabel(totalStartMin)} → ${fmtMinLabel(totalEndMin)}` : '—'}
          </p>
        </div>
      )}
    </div>
  );
}