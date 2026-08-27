import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProPaywall from './ProPaywall';
import {
  buildTaskList, TASK_PHASES, taskStats, readManualTasks, toggleManualTask,
  regenerateBracket, loadDemoTournament, tournamentName, currentSeason,
} from '../services/tournamentTasks';

const I18N = {
  es: {
    title: '🎛️ Central de control del torneo',
    subtitle: 'Tareas pre-programadas: el sistema ejecuta cada paso del ciclo del torneo automáticamente y tú solo supervisas.',
    tour: 'Torneo',
    season: 'Temporada',
    pct: 'Completado',
    autoPct: 'Automatización',
    tasks: 'tareas',
    autoLabel: 'auto',
    manualLabel: 'manual',
    group: 'Grupo',
    reset: '↺ Torneo demo',
    build: 'Generar cuadro',
    go: '← Ir',
    importPlayers: '📥 Importar jugadores',
    phaseNames: {
      prep: 'Preparación', signups: 'Inscripciones', draw: 'Cuadro & pistas',
      day: 'Día de competición', results: 'Resultados & ranking', close: 'Cierre & publicación',
    },
    doneTag: '✓', pendingTag: '·',
    empty: 'Sin tareas.',
    modal: 'Hecho',
    demoNote: 'El checklist se evalúa sobre tu torneo activo. Usa "Generar cuadro" para autocompletar las fases de cuadro y resultados.',
  },
  en: {
    title: '🎛️ Tournament command center',
    subtitle: 'Pre-programmed tasks: the system runs every step of the tournament lifecycle automatically, you just supervise.',
    tour: 'Tournament',
    season: 'Season',
    pct: 'Completed',
    autoPct: 'Automation',
    tasks: 'tasks',
    autoLabel: 'auto',
    manualLabel: 'manual',
    group: 'Group',
    reset: '↺ Demo tournament',
    build: 'Generate bracket',
    go: 'Go →',
    importPlayers: '📥 Import players',
    phaseNames: {
      prep: 'Setup', signups: 'Sign-ups', draw: 'Bracket & courts',
      day: 'Match day', results: 'Results & ranking', close: 'Wrap-up & publish',
    },
    doneTag: '✓', pendingTag: '·',
    empty: 'No tasks.',
    demoNote: 'The checklist evaluates your active tournament. Click "Generate bracket" to autocomplete the draw and results phases.',
  },
  fr: {
    title: '🎛️ Centre de contrôle du tournoi',
    subtitle: 'Tâches pré-programmées : le système exécute chaque étape du cycle automatiquement, vous supervisez.',
    tour: 'Tournoi',
    season: 'Saison',
    pct: 'Terminé',
    autoPct: 'Automatisation',
    tasks: 'tâches',
    autoLabel: 'auto',
    manualLabel: 'manuel',
    group: 'Groupe',
    reset: '↺ Tournoi démo',
    build: 'Générer le tableau',
    go: '← Aller',
    importPlayers: '📥 Importer les joueurs',
    phaseNames: {
      prep: 'Préparation', signups: 'Inscriptions', draw: 'Tableau & pistes',
      day: 'Jour de compétition', results: 'Résultats & classement', close: 'Clôture & publication',
    },
    doneTag: '✓', pendingTag: '·',
    empty: 'Aucune tâche.',
    demoNote: 'La checklist évalue votre tournoi actif. Cliquez sur "Générer le tableau" pour compléter les phases.',
  },
  pt: {
    title: '🎛️ Central de controle do torneio',
    subtitle: 'Tarefas pré-programadas: o sistema executa cada etapa do ciclo do torneio automaticamente, você só supervisiona.',
    tour: 'Torneio',
    season: 'Temporada',
    pct: 'Concluído',
    autoPct: 'Automação',
    tasks: 'tarefas',
    autoLabel: 'auto',
    manualLabel: 'manual',
    group: 'Grupo',
    reset: '↺ Torneio demo',
    build: 'Gerar quadro',
    go: '← Ir',
    importPlayers: '📥 Importar jogadores',
    phaseNames: {
      prep: 'Preparação', signups: 'Inscrições', draw: 'Quadro & pistas',
      day: 'Dia de competição', results: 'Resultados & ranking', close: 'Encerramento & publicação',
    },
    doneTag: '✓', pendingTag: '·',
    empty: 'Sem tarefas.',
    demoNote: 'A checklist avalia o seu torneio ativo. Use "Gerar quadro" para completar as fases.',
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const ghostBtn = { background: 'transparent', color: 'var(--padel-muted)', border: '1px solid var(--padel-border)', padding: '8px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' };
const primaryBtn = { background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: 10, fontWeight: 800, fontSize: 12.5, cursor: 'pointer' };

export default function TournamentControl({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const nav = useNavigate();
  const [tasks, setTasks] = useState(() => buildTaskList());
  const [manual, setManual] = useState(() => readManualTasks());
  const [tick, setTick] = useState(0);

  const refresh = () => { setTasks(buildTaskList()); setTick(t => t + 1); };

  useEffect(() => {
    const id = setInterval(refresh, 4000);
    refresh();
    return () => clearInterval(id);
  }, []);

  const doAction = async (t) => {
    if (t.action.kind === 'navigate') nav(t.action.href);
    if (t.action.kind === 'build') { regenerateBracket(); refresh(); }
    if (t.action.kind === 'none') { setManual(toggleManualTask(t.key)); refresh(); }
  };

  const stats = taskStats(tasks, manual);
  const phases = TASK_PHASES.map(ph => {
    const items = tasks.filter(t => t.phase === ph.id);
    const done = items.filter(t => t.done() || manual[t.key]).length;
    return { ...ph, items, done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
  });

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--padel-text)', margin: 0 }}>{T.title}</h1>
            <p style={{ fontSize: 13, color: 'var(--padel-muted)', margin: '6px 0 0' }}>{T.subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--padel-muted)', fontWeight: 700 }}>
              {T.tour}: <b style={{ color: 'var(--padel-lime)' }}>{tournamentName()}</b> · {T.season} {currentSeason()}
            </span>
            <button onClick={() => nav('/importar')} style={{ ...ghostBtn, color: 'var(--padel-lime)', borderColor: 'rgba(163,230,53,0.3)' }}>{T.importPlayers}</button>
            <button onClick={() => { loadDemoTournament(); refresh(); }} style={ghostBtn}>{T.reset}</button>
          </div>
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--padel-muted)', margin: '0 0 18px' }}>ℹ️ {T.demoNote}</p>
        <div style={{ marginBottom: 18 }}><ProPaywall lang={lang} feature="Central de Control" cta="Desbloquear Pro" /></div>

        {/* KPI bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
          {[
            ['🎯', `${stats.done}/${stats.total}`, T.tasks + ` (${T.pct})`],
            ['⚙️', `${stats.autoDone}/${stats.autoTotal}`, T.autoPct],
            ['🧍', `${stats.manualTotal}`, T.manualLabel],
            ['📊', `${stats.pct}%`, T.pct],
          ].map(([ic, n, l], i) => (
            <div key={i} style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>{ic}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: stats.pct === 100 && i === 3 ? 'var(--padel-lime)' : i === 1 ? 'var(--padel-lime)' : 'var(--padel-text)' }}>{n}</div>
              <div style={{ fontSize: 11, color: 'var(--padel-muted)', fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Overall bar */}
        <div style={{ ...card, padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--padel-text)' }}>{T.pct} · {stats.pct}%</span>
            <span style={{ fontSize: 12, color: 'var(--padel-muted)' }}>{T.autoPct} {stats.autoPct}%</span>
          </div>
          <div style={{ height: 10, background: 'var(--padel-hover-bg)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${stats.pct}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#84cc16)', borderRadius: 99, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* checkbox de traducibilidad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {phases.map(ph => (
            <div key={ph.id} style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--padel-text)' }}>
                  {ph.icon} {ph.id}. {T.phaseNames[ph.key] || ph.key}
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: ph.pct === 100 ? 'var(--padel-lime)' : 'var(--padel-muted)' }}>
                  {ph.done}/{ph.total}
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--padel-hover-bg)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ width: `${ph.pct}%`, height: '100%', background: '#10b981', borderRadius: 99 }} />
              </div>
              {ph.items.map(t => {
                const done = t.done() || manual[t.key];
                const clickable = t.action.kind !== 'none' || !done;
                return (
                  <div key={t.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--padel-border)', borderBottomStyle: ph.items[ph.items.length - 1].key === t.key ? 'none' : 'solid' }}>
                    <span style={{ fontSize: 13, marginTop: 2, color: done ? 'var(--padel-lime)' : '#64748b', fontWeight: 900 }}>{done ? T.doneTag : T.pendingTag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, color: 'var(--padel-text)', lineHeight: 1.45, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>
                        {t.title}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: t.auto ? 'rgba(16,185,129,0.14)' : 'rgba(251,191,36,0.12)', color: t.auto ? '#10b981' : '#fbbf24' }}>
                          {t.auto ? T.autoLabel : T.manualLabel}
                        </span>
                        {clickable && (
                          <button onClick={() => doAction(t)} style={t.action.kind === 'build' ? primaryBtn : t.action.kind === 'none' ? { ...ghostBtn, color: '#fbbf24', borderColor: 'rgba(251,191,36,0.4)' } : ghostBtn}>
                            {t.action.label} {t.action.href ? T.go : ''}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}