import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, setState, getTournamentById, saveTournamentById } from '../services/store';
import { pullState } from '../services/cloudService';
import { COURT_STATUS } from '../services/padelEngine';
import TournamentInscriptions from './TournamentInscriptions';
import { recordWO } from '../services/tournamentTasks';
import AnalyticsBoard from './AnalyticsBoard';
import TournamentChat from './TournamentChat';
import { listSponsorsSync, tierOf } from '../services/sponsorService';

const I18N = {
  es: {
    badge: '🎫 Torneo · Producto digital',
    liveBadge: '🔴 En directo',
    sharedBy: 'Compartido por {club} · PADELORGANIZERS',
    players: '👥 Jugadores (Elo)',
    pairs: '📊 Parejas',
    courts: '🏟️ Pistas',
    matches: '⚔️ Partidos',
    bracket: '🏆 Cuadro por rondas',
    analytics: '📈 Analíticas & datos',
    signupTitle: '📝 Inscripción',
    signupCount: '{n} jugadores inscritos · {p} parejas',
    signupOpen: '🟢 Inscripciones abiertas',
    signupClosed: '🔒 Inscripción cerrada',
    signupBtn: '‘Inscríbete en el torneo’',
    signupBtnDone: '✅ Solicitud enviada. {club} te confirmará plazas.',
    scheduleTitle: '🕐 Horarios & calendario',
    scheduleSub: 'Pistas, jornadas y estado de cada partido.',
    scheduleRound: 'Jornada {r}',
    scheduledTime: '{time} · Pista {court}',
    streamingTitle: '📺 Transmisión en directo',
    streamingSub: 'Sigue el marcador en tiempo real, sin instalar nada.',
    streamBtn: '▶ Ver live del torneo',
    sponsorsTitle: '🤝 Patrocinadores',
    sponsorsSub: 'El torneo está abierto a patrocinadores: contacta con {club}.',
    sponsorSlot: 'Tu marca aquí',
    sponsorContact: 'Contactar como patrocinador',
    photosTitle: '📸 Fotografías',
    photosSub: 'Jugadores y momentos del torneo.',
    newsTitle: '💬 Noticias & comunidad',
    newsSub: 'Comentarios, animación y actualizaciones en directo.',
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
    liveBadge: '🔴 Live',
    sharedBy: 'Shared by {club} · PADELORGANIZERS',
    players: '👥 Players (Elo)',
    pairs: '📊 Pairs',
    courts: '🏟️ Courts',
    matches: '⚔️ Matches',
    bracket: '🏆 Bracket by round',
    analytics: '📈 Analytics & data',
    signupTitle: '📝 Registration',
    signupCount: '{n} players registered · {p} pairs',
    signupOpen: '🟢 Registration open',
    signupClosed: '🔒 Registration closed',
    signupBtn: 'Sign up for the tournament',
    signupBtnDone: '✅ Request sent. {club} will confirm your place.',
    scheduleTitle: '🕐 Schedule & calendar',
    scheduleSub: 'Courts, rounds and match status.',
    scheduleRound: 'Round {r}',
    scheduledTime: '{time} · Court {court}',
    streamingTitle: '📺 Live streaming',
    streamingSub: 'Follow the live scoreboard — no install needed.',
    streamBtn: '▶ Watch tournament live',
    sponsorsTitle: '🤝 Sponsors',
    sponsorsSub: 'The tournament is open to sponsors: contact {club}.',
    sponsorSlot: 'Your brand here',
    sponsorContact: 'Contact as sponsor',
    photosTitle: '📸 Photos',
    photosSub: 'Players and moments of the tournament.',
    newsTitle: '💬 News & community',
    newsSub: 'Comments, cheering and live updates.',
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
    liveBadge: '🔴 En direct',
    sharedBy: 'Partagé par {club} · PADELORGANIZERS',
    players: '👥 Joueurs (Elo)',
    pairs: '📊 Paires',
    courts: '🏟️ Pistes',
    matches: '⚔️ Matchs',
    bracket: '🏆 Tableau par tours',
    analytics: '📈 Analyses & données',
    signupTitle: '📝 Inscription',
    signupCount: '{n} joueurs inscrits · {p} paires',
    signupOpen: '🟢 Inscriptions ouvertes',
    signupClosed: '🔒 Inscription fermée',
    signupBtn: 'Inscrivez-vous au tournoi',
    signupBtnDone: '✅ Demande envoyée. {club} confirmera votre place.',
    scheduleTitle: '🕐 Horaires & calendrier',
    scheduleSub: 'Pistes, tours et état de chaque match.',
    scheduleRound: 'Tour {r}',
    scheduledTime: '{time} · Piste {court}',
    streamingTitle: '📺 Diffusion en direct',
    streamingSub: 'Suivez le score en temps réel, sans rien installer.',
    streamBtn: '▶ Voir le live du tournoi',
    sponsorsTitle: '🤝 Sponsors',
    sponsorsSub: 'Le tournoi est ouvert aux sponsors : contactez {club}.',
    sponsorSlot: 'Votre marque ici',
    sponsorContact: 'Contacter comme sponsor',
    photosTitle: '📸 Photos',
    photosSub: 'Joueurs et moments du tournoi.',
    newsTitle: '💬 Infos & communauté',
    newsSub: 'Commentaires, encouragements et mises à jour en direct.',
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
    liveBadge: '🔴 Ao vivo',
    sharedBy: 'Partilhado por {club} · PADELORGANIZERS',
    players: '👥 Jogadores (Elo)',
    pairs: '📊 Pares',
    courts: '🏟️ Pistas',
    matches: '⚔️ Partidas',
    bracket: '🏆 Quadro por rondas',
    analytics: '📈 Análises & dados',
    signupTitle: '📝 Inscrição',
    signupCount: '{n} jogadores inscritos · {p} pares',
    signupOpen: '🟢 Inscrições abertas',
    signupClosed: '🔒 Inscrição encerrada',
    signupBtn: 'Inscreva-se no torneio',
    signupBtnDone: '✅ Pedido enviado. {club} confirmará a sua vaga.',
    scheduleTitle: '🕐 Horários & calendário',
    scheduleSub: 'Pistas, rondas e estado de cada partida.',
    scheduleRound: 'Ronda {r}',
    scheduledTime: '{time} · Pista {court}',
    streamingTitle: '📺 Transmissão ao vivo',
    streamingSub: 'Acompanhe o marcador em tempo real, sem instalar nada.',
    streamBtn: '▶ Ver o live do torneio',
    sponsorsTitle: '🤝 Patrocinadores',
    sponsorsSub: 'O torneio está aberto a patrocinadores: contacte {club}.',
    sponsorSlot: 'A sua marca aqui',
    sponsorContact: 'Contactar como patrocinador',
    photosTitle: '📸 Fotografias',
    photosSub: 'Jogadores e momentos do torneio.',
    newsTitle: '💬 Notícias & comunidade',
    newsSub: 'Comentários, incentivos e atualizações ao vivo.',
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
const placeholderPhoto = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/User_icon_BLACK-01.svg/120px-User_icon_BLACK-01.svg.png';

export default function TournamentPublic({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState(false);
  const [joined, setJoined] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerElo, setEditPlayerElo] = useState(1500);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerElo, setNewPlayerElo] = useState(1500);
  const [showAddPair, setShowAddPair] = useState(false);
  const [pairP1, setPairP1] = useState('');
  const [pairP2, setPairP2] = useState('');

  const isLive = store.tournament?.id === id;
  const canEdit = true;
  const localMap = (()=>{ try{ const m=JSON.parse(localStorage.getItem('padelorganizers-tournaments')||'{}'); return m[id]||null; }catch{ return null; }})();
  const state = localMap || (isLive ? store : remote) || store;

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
  const photos = state.players.filter((p) => p.photo).slice(0, 12);
  const currentMatch = state.matches.find((m) => m.status === 'in_progress');

  const statusLabel = (s) =>
    s === COURT_STATUS.FREE ? T.free : s === COURT_STATUS.IN_GAME ? T.inGame : s;

  const fmtCourtTime = (m) => {
    const court = state.courts.find((c) => c.id === m.courtId);
    const start = court?.startTime;
    const time = start
      ? new Date(start).toLocaleTimeString(lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-PT' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      : '';
    return T.scheduledTime.replace('{time}', time || '—').replace('{court}', court?.name || '—');
  };

  const signup = () => {
    setJoined(true);
    setTimeout(() => setJoined(false), 4000);
  };

  const startEditPlayer = (p) => { setEditingPlayerId(p.id); setEditPlayerName(p.name); setEditPlayerElo(p.elo); };
  const saveEditPlayer = () => {
    if (!editingPlayerId) return;
    const updFn = (st) => {
      const upd = st.players.map(pl => pl.id===editingPlayerId ? { ...pl, name: editPlayerName.trim()||pl.name, elo: Number(editPlayerElo)||pl.elo, level: Math.round((1 + (Number(editPlayerElo)-1200)/200)*10)/10 } : pl);
      return { ...st, players: upd };
    };
    saveTournamentById(id, updFn);
    if (getState().tournament?.id === id) setState(updFn(getState()));
    setEditingPlayerId(null);
  };
  const deletePlayer = (pid) => {
    const updFn = (st) => {
      const target = st.players.find(x=>x.id===pid);
      if (!target) return st;
      const name = (target.name||'').toLowerCase().trim();
      const nextPlayers = st.players.filter(p=>p.id!==pid);
      const nextPairs = st.pairs.filter(pr=> {
        const a=(pr.player1||'').toLowerCase().trim();
        const b=(pr.player2||'').toLowerCase().trim();
        return a!==name && b!==name;
      });
      const nextMatches = (st.matches||[]).filter(m=> {
        const ids=[...(m.playerIds1||[]), ...(m.playerIds2||[])];
        return !ids.includes(pid);
      });
      return { ...st, players: nextPlayers, pairs: nextPairs, matches: nextMatches };
    };
    saveTournamentById(id, updFn);
    if (getState().tournament?.id === id) setState(updFn(getState()));
  };
  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const updFn = (st) => {
      const np = { id:`pl-${Date.now()}`, name: newPlayerName.trim(), elo: Number(newPlayerElo)||1500, level: Math.round((1 + (Number(newPlayerElo)-1200)/200)*10)/10, matchesPlayed:0, wins:0, losses:0 };
      return { ...st, players: [...st.players, np] };
    };
    saveTournamentById(id, updFn);
    if (getState().tournament?.id === id) setState(updFn(getState()));
    setNewPlayerName(''); setShowAddPlayer(false);
  };
  const deletePair = (pairId) => {
    const updFn = (st) => {
      let nextPairs = st.pairs.filter(p=>p.id!==pairId);
      if (nextPairs.length===st.pairs.length) {
        const target = st.pairs.find(p=>String(p.ranking)===String(pairId) || p.id===pairId);
        if (target) nextPairs = st.pairs.filter(p=>p.id!==target.id);
      }
      const nextMatches = (st.matches||[]).filter(m=> m.pair1Id!==pairId && m.pair2Id!==pairId);
      return { ...st, pairs: nextPairs, matches: nextMatches };
    };
    saveTournamentById(id, updFn);
    if (getState().tournament?.id === id) setState(updFn(getState()));
  };
  const addPair = () => {
    if (!pairP1 || !pairP2 || pairP1===pairP2) return alert('Elige dos jugadores distintos');
    const updFn = (st) => {
      const p1 = st.players.find(p=>p.id===pairP1);
      const p2 = st.players.find(p=>p.id===pairP2);
      if (!p1 || !p2) return st;
      const np = { id:`p-${Date.now()}`, player1: p1.name, player2: p2.name, ranking: st.pairs.length+1, points:0, gamesWon:0, gamesLost:0, diff:0, matchesPlayed:0 };
      return { ...st, pairs: [...st.pairs, np] };
    };
    saveTournamentById(id, updFn);
    if (getState().tournament?.id === id) setState(updFn(getState()));
    setShowAddPair(false); setPairP1(''); setPairP2('');
  };

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
      <TournamentInscriptions tournamentId={id} lang={lang} />

      {/* INSCRIPCIÓN */}
      <div style={{ ...card, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.signupTitle}</h3>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>{T.signupCount.replace('{n}', state.players.length).replace('{p}', state.pairs.length)}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: isRunning ? '#34d399' : '#fb923c', marginTop: 4 }}>
            {isRunning ? T.signupOpen : T.signupClosed}
          </div>
        </div>
        {isRunning && (
          <button onClick={signup} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>
            {joined ? T.signupBtnDone.replace('{club}', t.club) : T.signupBtn}
          </button>
        )}
      </div>

      {/* STREAMING */}
      {currentMatch && (
        <div style={{ ...card, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderColor: 'rgba(251,113,133,0.4)' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.streamingTitle}</h3>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{T.streamingSub}</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fb7185', marginTop: 6 }}>
              ⚔️ {currentMatch.pair1Names} vs {currentMatch.pair2Names} · 🔴 {T.round}{currentMatch.round}
            </div>
          </div>
          <button onClick={() => navigate('/live')} className="pulse-glow" style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.5)', padding: '12px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>
            {T.streamBtn}
          </button>
        </div>
      )}

      {/* DATOS EN VIVO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>{T.players}</h3>
            {canEdit && <button onClick={()=>setShowAddPlayer(v=>!v)} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid var(--padel-border)', background:'rgba(16,185,129,0.12)', color:'#a3e635', fontWeight:700, fontSize:11, cursor:'pointer' }}>+ Jugador</button>}
          </div>
          {canEdit && showAddPlayer && (
            <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <input value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)} placeholder="Nombre" style={{ flex:'1 1 120px', padding:'8px 10px', borderRadius:8, border:'1px solid var(--padel-border)', background:'var(--padel-hover-bg)', color:'#fff', fontSize:12 }} />
              <input type="number" value={newPlayerElo} onChange={e=>setNewPlayerElo(e.target.value)} placeholder="Elo" style={{ width:90, padding:'8px 10px', borderRadius:8, border:'1px solid var(--padel-border)', background:'var(--padel-hover-bg)', color:'#fff', fontSize:12 }} />
              <button onClick={addPlayer} style={{ padding:'8px 12px', borderRadius:8, border:'none', background:'#10b981', color:'#fff', fontWeight:800, fontSize:12, cursor:'pointer' }}>Añadir</button>
            </div>
          )}
          {sortedPlayers.map((p, i) => (
            <div key={p.id} style={{ ...rowCls, ...(i === 0 ? { background: 'rgba(132,204,22,0.08)' } : {}) }}>
              {editingPlayerId===p.id ? (
                <>
                  <span style={{ display:'flex', gap:6, alignItems:'center', flex:1 }}>
                    <input value={editPlayerName} onChange={e=>setEditPlayerName(e.target.value)} style={{ flex:1, padding:'6px 8px', borderRadius:6, border:'1px solid var(--padel-border)', background:'var(--padel-hover-bg)', color:'#fff', fontSize:12 }} />
                    <input type="number" value={editPlayerElo} onChange={e=>setEditPlayerElo(e.target.value)} style={{ width:80, padding:'6px 8px', borderRadius:6, border:'1px solid var(--padel-border)', background:'var(--padel-hover-bg)', color:'#fff', fontSize:12 }} />
                  </span>
                  <span style={{ display:'flex', gap:4 }}>
                    <button onClick={saveEditPlayer} style={{ padding:'4px 8px', borderRadius:6, border:'none', background:'#10b981', color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer' }}>✓</button>
                    <button onClick={()=>setEditingPlayerId(null)} style={{ padding:'4px 8px', borderRadius:6, border:'1px solid var(--padel-border)', background:'transparent', color:'#94a3b8', fontSize:11, cursor:'pointer' }}>✕</button>
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontWeight: 700, color: i === 0 ? '#84cc16' : '#f0fdf4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', width: 18 }}>{i + 1}</span>
                    <button onClick={() => navigate(`/player/${encodeURIComponent(p.name)}?t=${encodeURIComponent(id)}`)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', textAlign: 'left', textDecoration: 'underline', textDecorationColor: 'rgba(16,185,129,0.4)', textUnderlineOffset: '3px' }}>{p.name}</button>
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#cbd5e1' }}><span style={{ color: '#10b981' }}>{'⭐'.repeat(Math.max(1, Math.round(p.level)))}</span> {p.level.toFixed(1)}</span>
                    {canEdit && (
                      <>
                        <button onClick={()=>startEditPlayer(p)} style={{ background:'none', border:'1px solid var(--padel-border)', color:'#94a3b8', borderRadius:6, padding:'2px 6px', fontSize:10, cursor:'pointer' }}>✎</button>
                        <button onClick={()=>deletePlayer(p.id)} style={{ background:'none', border:'1px solid rgba(251,113,133,0.3)', color:'#fb7185', borderRadius:6, padding:'2px 6px', fontSize:10, cursor:'pointer' }}>🗑</button>
                      </>
                    )}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>{T.pairs}</h3>
            {canEdit && <button onClick={()=>setShowAddPair(v=>!v)} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid var(--padel-border)', background:'rgba(251,191,36,0.12)', color:'#fbbf24', fontWeight:700, fontSize:11, cursor:'pointer' }}>+ Pareja</button>}
          </div>
          {canEdit && showAddPair && (
            <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <select value={pairP1} onChange={e=>setPairP1(e.target.value)} style={{ flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--padel-border)', background:'var(--padel-hover-bg)', color:'#fff', fontSize:12 }}>
                <option value="">Jugador 1</option>
                {sortedPlayers.map(pl=><option key={pl.id} value={pl.id}>{pl.name}</option>)}
              </select>
              <select value={pairP2} onChange={e=>setPairP2(e.target.value)} style={{ flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--padel-border)', background:'var(--padel-hover-bg)', color:'#fff', fontSize:12 }}>
                <option value="">Jugador 2</option>
                {sortedPlayers.map(pl=><option key={pl.id} value={pl.id}>{pl.name}</option>)}
              </select>
              <button onClick={addPair} style={{ padding:'8px 12px', borderRadius:8, border:'none', background:'#fbbf24', color:'#1f2937', fontWeight:800, fontSize:12, cursor:'pointer' }}>Añadir</button>
            </div>
          )}
          {sortedPairs.length === 0 && <div style={{ fontSize: '13px', color: '#64748b' }}>—</div>}
          {sortedPairs.map((p) => (
            <div key={p.id} style={rowCls}>
              <span style={{ fontWeight: 700, color: '#f0fdf4' }}>#{p.ranking} {p.player1.split(' ')[0]} / {p.player2.split(' ')[0]}</span>
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#84cc16' }}>{p.points} {T.points}</span>
                {canEdit && <button onClick={()=>deletePair(p.id)} style={{ background:'none', border:'1px solid rgba(251,113,133,0.3)', color:'#fb7185', borderRadius:6, padding:'2px 6px', fontSize:10, cursor:'pointer' }}>🗑</button>}
              </span>
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

      {/* HORARIOS */}
      <div style={{ ...card, marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.scheduleTitle}</h3>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px' }}>{T.scheduleSub}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {rounds.map((r) => (
            <div key={r} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#84cc16', marginBottom: '8px', letterSpacing: 1 }}>{T.scheduleRound.replace('{r}', r)}</div>
              {state.matches.filter((m) => m.round === r).map((m) => (
                <div key={m.id} style={{ fontSize: '12px', color: '#cbd5e1', padding: '4px 0', borderBottom: '1px dashed rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight: 700, color: m.status === 'completed' ? '#34d399' : m.status==='wo'?'#fbbf24':'#f0fdf4' }}>
                    {m.status === 'completed' ? `✓ ${m.pair1Names} ${m.scoreSet1}` : m.status==='wo' ? `⚠️ ${m.pair1Names} vs ${m.pair2Names} · W.O.` : `${m.pair1Names} vs ${m.pair2Names}`}
                    <span style={{ fontSize: '10px', color: '#64748b', marginLeft:6 }}>{fmtCourtTime(m)}</span>
                  </span>
                  {canEdit && m.status!=='completed' && m.status!=='wo' && (
                    <button onClick={()=>{ recordWO(m.id,'W.O.'); }} style={{ padding:'2px 6px', borderRadius:6, border:'1px solid rgba(251,191,36,0.3)', background:'rgba(251,191,36,0.1)', color:'#fbbf24', fontSize:10, cursor:'pointer' }}>W.O.</button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FOTOS */}
      {photos.length > 0 && (
        <div style={{ ...card, marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.photosTitle}</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px' }}>{T.photosSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
            {photos.map((p) => (
              <div key={p.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={p.photo || placeholderPhoto} alt={p.name} loading="lazy" style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PATROCINIOS */}
      <div style={{ ...card, marginBottom: '16px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{T.sponsorsTitle}</h3>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 auto 14px', maxWidth: 520 }}>{T.sponsorsSub.replace('{club}', t.club)}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          {(() => {
            const sp = listSponsorsSync();
            return sp.length ? sp.map((s) => {
              const tt = tierOf(s.tier);
              return (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                  border: `1px solid ${s.color}33`, borderRadius: '12px', padding: '18px 10px',
                  background: `linear-gradient(135deg, ${s.color}22, rgba(0,0,0,0.25))`,
                  color: s.color, textDecoration: 'none', fontSize: '13px', fontWeight: 900, letterSpacing: 0.5,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                  <span>{s.brand}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.7 }}>{tt.emoji} {tt.label[lang] || tt.label.es} ↗</span>
                </a>
              );
            }) : [0, 1, 2].map((i) => (
              <div key={i} style={{ border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '12px', padding: '18px', fontSize: '13px', fontWeight: 800, color: '#475569' }}>
                {T.sponsorSlot}
              </div>
            ));
          })()}
        </div>
        <button onClick={() => navigate('/sponsors')} style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginRight: 8 }}>
          💰 {T.sponsorContact}
        </button>
        <button onClick={() => navigate('/club')} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          {T.sponsorSlot}
        </button>
      </div>

      {/* AUDIT LOG + EXPORT ACTA */}
      {(t.auditLog||[]).length>0 && (
        <div style={{ ...card, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:'#fff', margin:0 }}>📜 Auditoría</h3>
            <button onClick={()=>{ const blob=new Blob([JSON.stringify(t,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`acta-${t.name.replace(/\s+/g,'-')}.json`; a.click(); URL.revokeObjectURL(url); }} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid var(--padel-border)', background:'var(--padel-hover-bg)', color:'var(--padel-text)', fontWeight:700, fontSize:11, cursor:'pointer' }}>⬇️ Exportar acta</button>
          </div>
          {(t.auditLog||[]).slice(-8).reverse().map((a,i)=>(
            <div key={i} style={{ fontSize:11, color:'var(--padel-muted)', padding:'4px 0', borderBottom:'1px solid var(--padel-border)' }}>
              {new Date(a.at).toLocaleString()} · <b style={{ color:'var(--padel-text)' }}>{a.action||a.from+'→'+a.to}</b> {a.matchId?`· ${a.matchId}`:''} {a.reason?`· ${a.reason}`:''}
            </div>
          ))}
        </div>
      )}
      {/* NOTICIAS / CHAT */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{T.newsTitle}</h3>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px' }}>{T.newsSub}</p>
        <TournamentChat lang={lang} tournamentId={t.id || id} />
      </div>

      {/* ANALYTICS */}
      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{T.analytics}</h3>
        <AnalyticsBoard state={state} lang={lang} />
      </div>
    </div>
  );
}