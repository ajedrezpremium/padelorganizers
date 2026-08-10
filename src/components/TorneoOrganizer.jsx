import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  generateKnockout, generateMexicanoPairings,
  generatePredictivePairings, generatePredictiveMatches,
  levelToElo,
} from '../services/padelEngine';
import { buildTournament } from '../services/store';

const I18N = {
  es: {
    badge: 'TORNEO',
    title: 'Organiza un torneo de pádel pro',
    subtitle: 'Convierte cada semana en una experiencia increíble para jugadores, técnicos y patrocinadores con una coordinación impecable, cuadros claros y un día de competición que fluye.',
    ctaPrimary: 'Probar la demo',
    wizardTitle: '✍️ Crea tu torneo ahora',
    wizardSubtitle: 'Rellena los 3 pasos y al finalizar aterrizamos en el Dashboard con tu cuadro generado.',
    step1: '1 · Configuración',
    step2: '2 · Inscripciones',
    step3: '3 · Cuadro y lanzar',
    formName: 'Nombre del torneo',
    formNamePh: 'Ej. I Open Pádel Vigo',
    formClub: 'Club / Sede',
    formClubPh: 'Ej. Club Pádel Bouzas',
    formFormat: 'Formato',
    fmtAmericano: 'Americano',
    fmtMexicano: 'Mexicano',
    fmtSuizo: 'Suizo (IA)',
    fmtKnockout: 'Eliminatorio',
    formGold: 'Punto de Oro',
    next: 'Siguiente →',
    prev: '← Volver',
    plName: 'Nombre',
    plLevel: 'Nivel (1.0–5.0)',
    plAdd: '➕ Añadir',
    plList: 'Inscritos',
    plRemove: '✕',
    plHint: 'Los jugadores se ordenan por nivel para sembrar el cuadro.',
    seedExample: '🎲 Rellenar con ejemplos pro',
    genTitle: 'Resumen del torneo',
    genRows: 'Jugadores',
    genPairs: 'Parejas',
    genCups: 'Cuadro / Rondas',
    genBtn: '🚀 Crear torneo y abrir Dashboard',
    tipstitle: '3 consejos de oro',
    tip1T: 'Punto de oro',
    tip1D: 'Activa el punto de oro y el súper tie-break para acelerar torneos con muchas parejas y evitar retrasos.',
    tip2T: 'Comodines',
    tip2D: 'Mantén 2 o 3 jugadores locales de confianza listos para cubrir ausencias y no descuadrar el cuadro.',
    tip3T: 'App como centro neurálgico',
    tip3D: 'Con PADEL ORGANIZERS el cuadro se genera, se juega en CourtManager y el rating Elo se actualiza solo.',
    finalTitle: 'Haz que el torneo se sienta profesional desde el primer contacto',
    finalText: 'Rellena el asistente de arriba y en 1 minuto tendrás tu torneo con cuadro, pistas y rating listo para dirigir.',
    navbtn: 'Probar la demo',
  },
  en: {
    badge: 'TOURNAMENT',
    title: 'Organize a pro padel tournament',
    subtitle: 'Turn every event into an amazing experience for players, coaches and sponsors with flawless coordination, clear brackets and a smooth competition day.',
    wizardTitle: '✍️ Create your tournament now',
    wizardSubtitle: 'Complete the 3 steps and we build your Dashboard with the generated bracket.',
    step1: '1 · Setup',
    step2: '2 · Sign-ups',
    step3: '3 · Bracket & launch',
    formName: 'Tournament name',
    formNamePh: 'e.g. Vigo Padel Open',
    formClub: 'Club / Venue',
    formClubPh: 'e.g. Bouzas Padel Club',
    formFormat: 'Format',
    fmtAmericano: 'Americano',
    fmtMexicano: 'Mexicano',
    fmtSuizo: 'Swiss (AI)',
    fmtKnockout: 'Knockout',
    formGold: 'Gold Point',
    next: 'Next →',
    prev: '← Back',
    plName: 'Name',
    plLevel: 'Level (1.0–5.0)',
    plAdd: '➕ Add',
    plList: 'Registered',
    plRemove: '✕',
    plHint: 'Players are sorted by Elo to seed the draw.',
    seedExample: '🎲 Fill with pro examples',
    genTitle: 'Tournament summary',
    genRows: 'Players',
    genPairs: 'Pairs',
    genCups: 'Bracket / Rounds',
    genBtn: '🚀 Create tournament & open Dashboard',
    tipstitle: 'Golden tips',
    tip1T: 'Gold point',
    tip1D: 'Enable gold point and super tie-break to speed up big tournaments and avoid delays.',
    tip2T: 'Wildcards',
    tip2D: 'Keep 2-3 trusted local players on standby to cover absences and keep the draw intact.',
    tip3T: 'App as the hub',
    tip3D: 'With PADELORGANIZERS the bracket is played in CourtManager and rating updates itself.',
    finalTitle: 'Make the tournament feel professional from the first touchpoint',
    finalText: 'Fill in the wizard above and in 1 minute your tournament with bracket, courts and ranking is ready to run.',
    navbtn: 'Try the demo',
  },
  fr: {
    badge: 'TOURNOI',
    title: 'Organisez un tournoi de padel pro',
    subtitle: 'Transformez chaque événement en une expérience incroyable pour les joueurs, les coachs et les sponsors.',
    wizardTitle: '✍️ Créez votre tournoi',
    wizardSubtitle: 'Suivez les 3 étapes et nous générons votre tableau.',
    step1: '1 · Configuration',
    step2: '2 · Inscriptions',
    step3: '3 · Tableau & lancement',
    formName: 'Nom du tournoi',
    formNamePh: 'ex. Open de Padel Vigo',
    formClub: 'Club / Lieu',
    formClubPh: 'ex. Club de Padel Bouzas',
    formFormat: 'Format',
    fmtAmericano: 'Américain',
    fmtMexicano: 'Mexicain',
    fmtSuizo: 'Suisse (IA)',
    fmtKnockout: 'Élimination',
    formGold: "Point d'or",
    next: 'Suivant →',
    prev: '← Retour',
    plName: 'Nom',
    plLevel: 'Niveau (1.0–5.0)',
    plAdd: '➕ Ajouter',
    plList: 'Inscrits',
    plRemove: '✕',
    plHint: 'Les joueurs sont triés par Elo pour le tableau.',
    seedExample: '🎲 Exemples pro',
    genTitle: 'Résumé du tournoi',
    genRows: 'Joueurs',
    genPairs: 'Équipes',
    genCups: 'Tableau / Tours',
    genBtn: '🚀 Créer et ouvrir le tableau de bord',
    tipstitle: '3 conseils en or',
    tip1T: "Point d'or",
    tip1D: 'Activez le point d\'or pour accélérer les tournois à beaucoup d\'équipes.',
    tip2T: 'Jokers',
    tip2D: 'Gardez 2-3 joueurs locaux de confiance pour couvrir les absences.',
    tip3T: 'L\'app comme centre névralgique',
    tip3D: 'Le tableau se génère, se joue dans CourtManager et le rating Elo se met à jour seul.',
    finalTitle: 'Rendez le tournoi professionnel dès le premier contact',
    finalText: 'Remplissez l\'assistant ci-dessus et en 1 minute votre tournoi est prêt.',
    navbtn: 'Essayer la démo',
  },
  pt: {
    badge: 'TORNEIO',
    title: 'Organize um torneio de padel pro',
    subtitle: 'Transforme cada evento numa experiência incrível para jogadores, técnicos e patrocinadores.',
    wizardTitle: '✍️ Crie o seu torneio agora',
    wizardSubtitle: 'Siga os 3 passos e geramos o seu quadro com Dashboard.',
    step1: '1 · Configuração',
    step2: '2 · Inscrições',
    step3: '3 · Quadro e lançar',
    formName: 'Nome do torneio',
    formNamePh: 'ex. Open de Padel Vigo',
    formClub: 'Clube / Sede',
    formClubPh: 'ex. Clube de Padel Bouzas',
    formFormat: 'Formato',
    fmtAmericano: 'Americano',
    fmtMexicano: 'Mexicano',
    fmtSuizo: 'Suíço (IA)',
    fmtKnockout: 'Eliminatório',
    formGold: 'Ponto de Ouro',
    next: 'Seguinte →',
    prev: '← Voltar',
    plName: 'Nome',
    plLevel: 'Nível (1.0–5.0)',
    plAdd: '➕ Adicionar',
    plList: 'Inscritos',
    plRemove: '✕',
    plHint: 'Os jogadores são ordenados por nível para o sorteio.',
    seedExample: '🎲 Exemplos pro',
    genTitle: 'Resumo do torneio',
    genRows: 'Jogadores',
    genPairs: 'Pares',
    genCups: 'Quadro / Rondas',
    genBtn: '🚀 Criar torneio e abrir Dashboard',
    tipstitle: '3 dicas de ouro',
    tip1T: 'Ponto de Ouro',
    tip1D: 'Ative o ponto de ouro para acelerar torneios com muitas equipas.',
    tip2T: 'Coringas',
    tip2D: 'Mantenha 2-3 jogadores locais de confiança para cobrir ausências.',
    tip3T: 'A app como centro nevrálgico',
    tip3D: 'O quadro gera-se, joga-se no CourtManager e o rating Elo atualiza-se sozinho.',
    finalTitle: 'Torne o torneio profissional desde o primeiro contacto',
    finalText: 'Preencha o assistente acima e em 1 minuto o seu torneio está pronto.',
    navbtn: 'Experimentar a demo',
  },
};

const sectionStyle = { maxWidth: '1180px', margin: '0 auto', padding: '0 24px' };
const inputStyle = { background: '#0f221e', border: '1px solid #1f3a34', color: '#f0fdf4', padding: '11px 14px', borderRadius: 10, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle = { fontSize: 12, color: '#94a3b8', fontWeight: 700, marginBottom: 6, display: 'block' };
const ghostBtn = { background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.18)', padding: '11px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' };
const shortN = name => (name || '').split(' ')[0];

export default function TorneoOrganizer({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [club, setClub] = useState('');
  const [format, setFormat] = useState('americano');
  const [goldPoint, setGoldPoint] = useState(true);
  const [plName, setPlName] = useState('');
  const [plLevel, setPlLevel] = useState(3);
  const [players, setPlayers] = useState([]);

  const seed = () => {
    if (!name.trim()) setName('🏆 Campeonato del Mundo 2026');
    if (!club.trim()) setClub('Madrid Arena · FIP');
    setPlayers([
    { name: 'Arturo Coello', level: 5.0 }, { name: 'Juan Tello', level: 4.8 },
    { name: 'Alejandro Galán', level: 4.9 }, { name: 'Jon Sanz', level: 4.7 },
    { name: 'Franco Stupaczuk', level: 4.6 }, { name: 'Martín Di Nenno', level: 4.7 },
    { name: 'Sanyo Gutiérrez', level: 4.4 }, { name: 'Paquito Navarro', level: 4.5 },
    { name: 'Fernando Belasteguín', level: 4.3 }, { name: 'Agustín Tapia', level: 4.6 },
    { name: 'Jorge Nieto', level: 4.4 }, { name: 'Coki Nieto', level: 4.3 },
    { name: 'Miguel Yanguas', level: 4.5 }, { name: 'Javi Garrido', level: 4.2 },
    { name: 'Momo González', level: 4.4 }, { name: 'Álex Ruiz', level: 4.3 },
    { name: 'Pablo Lima', level: 4.1 }, { name: 'Jerónimo González', level: 4.0 },
    { name: 'Franco Galeano', level: 4.0 }, { name: 'Daniel Cukierman', level: 4.1 },
    { name: 'Agustín Sánchez', level: 3.9 }, { name: 'Ramiro Moyano', level: 4.0 },
    { name: 'Chingotto', level: 4.4 }, { name: 'Valentín Franco', level: 4.1 },
    { name: 'Tolito Aguirre', level: 4.2 }, { name: 'Martín Molina', level: 4.0 },
    { name: 'Marcos Gil', level: 3.9 }, { name: 'González Sem, Carlos', level: 3.8 },
    { name: 'Lucas Campagnolo', level: 4.1 }, { name: 'Manu Alfonso', level: 3.9 },
    { name: 'Antonio Ledesma', level: 3.8 }, { name: 'Rubén Santos', level: 3.7 },
    ]);
  };
  const addPlayer = () => {
    const nm = plName.trim();
    if (!nm) return;
    setPlayers([...players, { name: nm, level: Number(plLevel) || 3 }]);
    setPlName('');
  };
const removePlayer = i => setPlayers(players.filter((_, idx) => idx !== i));
  const clean = players.filter(p => p.name.trim());
  const ready = clean.length >= 4 && name.trim() && step === 3;

  function build() {
    try {
    const id = `torneo-${Date.now()}`;
    const pls = clean.map((p, i) => ({
      id: `pl-${id}-${i}`, name: p.name.trim(),
      elo: levelToElo(Number(p.level) || 3), level: Number(p.level) || 3,
      pairId: null, matchesPlayed: 0, wins: 0, losses: 0,
    }));
    const pairs = [];
    const pairRefs = {};
    for (let i = 0; i + 1 < pls.length; i += 2) {
      const a = pls[i], b = pls[i + 1];
      const pid = `pa-${id}-${pairs.length}`;
      a.pairId = pid; b.pairId = pid;
      pairRefs[pid] = [a.id, b.id];
      pairs.push({ id: pid, player1: a.name, player2: b.name, ranking: pairs.length + 1, points: 0, gamesWon: 0, gamesLost: 0, diff: 0, matchesPlayed: 0 });
    }
    const data = {
      tournament: { id, name: name.trim(), club: club.trim() || 'Mi Club', modality: format, totalCourts: 4, pointsPerMatch: 24, goldPoint, status: 'active', lang },
      courts: [1, 2, 3, 4].map(n => ({ id: n, name: `Pista ${n}`, status: 'free', matchId: null, startTime: null })),
      players: pls, pairs, matches: [],
    };
    const mk = (idsA, idsB, round) => ({
      id: `ml-${id}-${Math.random().toString(36).slice(2, 7)}`, round: round || 1,
      courtId: null, pair1Id: null, pair2Id: null,
      pair1Names: idsA.map(x => shortN(pls.find(p => p.id === x)?.name)).join(' / '),
      pair2Names: idsB.map(x => shortN(pls.find(p => p.id === x)?.name)).join(' / '),
      playerIds1: idsA, playerIds2: idsB,
      scoreSet1: '0-0', scoreSet2: '0-0', currentSet: 1, goldPointOccurrences: 0, status: 'scheduled',
    });
    const pairTeams = () => {
      const teams = [];
      for (let i = 0; i + 1 < pls.length; i += 2) teams.push([pls[i].id, pls[i + 1].id]);
      return teams;
    };
    let matches = [];
    if (format === 'americano' || format === 'mexicano') {
      const teams = format === 'mexicano' ? generateMexicanoPairings(data) : pairTeams();
      for (let i = 0; i + 1 < teams.length; i += 2) matches.push(mk(teams[i], teams[i + 1], 1));
      if (clean.length >= 6) {
        const revTeams = pairTeams().reverse();
        for (let i = 0; i + 1 < revTeams.length; i += 2) matches.push(mk(revTeams[i], revTeams[i + 1], 2));
      }
    } else if (format === 'suizo') {
      const teams = generatePredictivePairings(data);
      if (teams.length >= 2) {
        const gen = generatePredictiveMatches(data, teams);
        matches = gen.map(m => ({ ...m, id: `m-${id}-${Math.random().toString(36).slice(2, 7)}` }));
      }
    } else {
      const ko = generateKnockout(data);
      if (ko.matches.length) matches = ko.matches.map(m => ({ ...m, id: `m-${id}-${Math.random().toString(36).slice(2, 7)}` }));
      else {
        const teams = pairTeams();
        for (let i = 0; i + 1 < teams.length; i += 2) matches.push(mk(teams[i], teams[i + 1], 1));
      }
    }
    data.matches = matches;
    buildTournament(data);
    navigate('/dashboard');
    } catch (e) { console.error('Error al crear torneo', e); }
  }

  const fmtLabel = { americano: T.fmtAmericano, mexicano: T.fmtMexicano, suizo: T.fmtSuizo, knockout: T.fmtKnockout }[format];

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* HERO + WIZARD */}
      <section style={{ padding: '60px 0 40px', background: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.22), transparent 35%), radial-gradient(circle at 80% 0%, rgba(251,113,133,0.14), transparent 38%)' }}>
        <div style={sectionStyle}>
          <div style={{ display: 'inline-block', padding: '8px 14px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#86efac', fontWeight: 800, fontSize: 12, letterSpacing: '1.2px', marginBottom: 20 }}>🎾 {T.badge}</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)', lineHeight: 1.1, fontWeight: 900, color: '#fff', marginBottom: 12, maxWidth: 780 }}>{T.title}</h1>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: '#cbd5e1', maxWidth: 720, marginBottom: 20 }}>{T.subtitle}</p>

          <div style={{ background: 'rgba(7, 18, 16, 0.85)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 22, padding: '26px 24px', marginTop: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{T.wizardTitle}</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 18 }}>{T.wizardSubtitle}</p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {[T.step1, T.step2, T.step3].map((s, i) => (
                <div key={s} style={{ flex: 1, minWidth: 120, padding: '10px 12px', borderRadius: 10, border: step === i + 1 ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.12)', background: step === i + 1 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', color: step === i + 1 ? '#a3e635' : '#94a3b8', fontWeight: 800, fontSize: 12 }}>{s}</div>
              ))}
            </div>

            {step === 1 && (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{T.formName}</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder={T.formNamePh} style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{T.formClub}</label>
                  <input value={club} onChange={e => setClub(e.target.value)} placeholder={T.formClubPh} style={inputStyle} />
                </div>
                <label style={labelStyle}>{T.formFormat}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 8, marginBottom: 14 }}>
                  {[['americano', T.fmtAmericano], ['mexicano', T.fmtMexicano], ['suizo', T.fmtSuizo], ['knockout', T.fmtKnockout]].map(([v, l]) => (
                    <button key={v} onClick={() => setFormat(v)} style={{ padding: 10, borderRadius: 10, border: format === v ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)', background: format === v ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)', color: format === v ? '#a3e635' : '#cbd5e1', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{l}</button>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e2e8f0', fontWeight: 700, marginBottom: 16 }}>
                  <input type="checkbox" checked={goldPoint} onChange={e => setGoldPoint(e.target.checked)} style={{ accentColor: '#10b981', width: 17, height: 17 }} /> {T.formGold}
                </label>
                <button onClick={seed} style={{ ...ghostBtn, width: '100%', marginBottom: 8 }}>{T.seedExample}</button>
                <button onClick={() => setStep(2)} disabled={!name.trim()} style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', fontWeight: 800, fontSize: 14, cursor: name.trim() ? 'pointer' : 'not-allowed', background: name.trim() ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(128,128,128,0.3)', color: '#fff' }}>{T.next}</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
                  <div style={{ flex: 2, minWidth: 150 }}>
                    <label style={labelStyle}>{T.plName}</label>
                    <input value={plName} onChange={e => setPlName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addPlayer(); }} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1, minWidth: 110 }}>
                    <label style={labelStyle}>{T.plLevel}</label>
                    <input value={plLevel} onChange={e => setPlLevel(Number(e.target.value) || 3)} type="number" step="0.1" min="1" max="5" style={inputStyle} />
                  </div>
                  <button onClick={addPlayer} style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#a3e635', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{T.plAdd}</button>
                </div>
                <button onClick={seed} style={{ ...ghostBtn, marginBottom: 12 }}>{T.seedExample}</button>
                <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 8, marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: '#84cc16', fontWeight: 800, padding: '6px 8px' }}>{T.plList} ({clean.length})</div>
                  {clean.length === 0 && <div style={{ fontSize: 13, color: '#64748b', padding: '8px' }}>—</div>}
                  {clean.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontWeight: 700, color: '#f0fdf4', fontSize: 14 }}>{i + 1}. {p.name}</span>
                      <span style={{ fontSize: 12, color: '#10b981', fontWeight: 800 }}>
                        ⭐ {Number(p.level).toFixed(1)}
                        <button onClick={() => removePlayer(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14, marginLeft: 8 }}>{T.plRemove}</button>
                      </span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 14 }}>ℹ️ {T.plHint}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setStep(1)} style={ghostBtn}>{T.prev}</button>
                  <button onClick={() => setStep(3)} disabled={clean.length < 4} style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', fontWeight: 800, fontSize: 14, cursor: clean.length >= 4 ? 'pointer' : 'not-allowed', background: clean.length >= 4 ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(128,128,128,0.3)', color: '#fff' }}>{T.next}</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#a3e635', marginBottom: 8 }}>{T.genTitle}</h3>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginBottom: 6 }}>🏆 {name.trim()}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{club.trim() || 'Mi Club'} · {fmtLabel} · {T.formGold} {goldPoint ? '✓' : '✗'}</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[[T.genRows, clean.length], [T.genPairs, Math.floor(clean.length / 2)], [T.genCups, '2+']].map(([l, v], i) => (
                      <div key={i} style={{ flex: 1, minWidth: 100, background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: 10 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#84cc16' }}>{v}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={build} disabled={!ready} style={{ width: '100%', padding: 15, borderRadius: 12, border: 'none', fontWeight: 900, fontSize: 15, cursor: ready ? 'pointer' : 'not-allowed', background: ready ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(128,128,128,0.3)', color: '#fff' }}>{T.genBtn}</button>
                <button onClick={() => setStep(2)} style={{ ...ghostBtn, width: '100%', marginTop: 8 }}>{T.prev}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* GUÍA */}
      <section style={{ padding: '20px 0 48px' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 18 }}>📋 {T.tipstitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { t: T.tip1T, d: T.tip1D },
              { t: T.tip2T, d: T.tip2D },
              { t: T.tip3T, d: T.tip3D },
            ].map((tip, i) => (
              <div key={i} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 16, padding: 18 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#84cc16', marginBottom: 8 }}>{tip.t}</h3>
                <p style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.7 }}>{tip.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingBottom: 16 }}>
        <div style={{ ...sectionStyle, background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(251,113,133,0.12))', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '32px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 23, fontWeight: 900, color: '#fff', marginBottom: 10 }}>{T.finalTitle}</h2>
          <p style={{ color: '#cbd5e1', maxWidth: 700, margin: '0 auto 18px', lineHeight: 1.7 }}>{T.finalText}</p>
          <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>🚀 {T.navbtn}</button>
        </div>
      </section>
    </div>
  );
}