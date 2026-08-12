import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { upsertProfile } from '../services/dataService';
import { getState } from '../services/store';
import { eloSeries } from '../services/analyticsService';

const I18N = {
  es: {
    title: '🏅 Perfil de jugador',
    subtitle: 'Tu pasaporte padelístico: nivel, ELO y estadísticas en la Ranked League.',
    signInPrompt: 'Inicia sesión para ver tu perfil deportivo completo.',
    session: 'Sesión', level: 'Nivel', elo: 'ELO', name: 'Nombre', homeClub: 'Club de casa',
    save: 'Guardar', saved: '✓ Guardado', saving: 'Guardando…',
    stats: 'Estadísticas del torneo activo', noTor: 'Todavía no hay torneo activo.',
    noSelf: 'Tu nombre no aparece entre los jugadores del torneo activo.',
    detail: 'Detalle',
    badges: 'Insignias del jugador', noBadges: 'Juega tu primer torneo para desbloquear insignias.',
    pj: 'PJ', pg: 'PG', pp: 'PP', wl: '% victorias', ptof: 'Puntos a favor', eno: 'Puntos en contra', diff: 'Dif.',
    rank: 'Ranking del club', back: '← Volver',
    noAccountData: 'No hay datos de perfil en la nube (modo demo).',
    levelHint: { n1: 'Principiante', n2: 'Iniciación', n3: 'Intermedio', n4: 'Avanzado', n5: 'Élite' },
    history: 'Historial de partidos', noHistory: 'Todavía no has jugado ningún partido.',
    rivalries: 'Rivalidades', noRivalries: 'Juega tu primer partido para ver rivalidades.',
    eloCurve: 'Progresión de ELO', round: 'Ronda',
    vs: 'vs', win: 'Victoria', loss: 'Derrota', inProg: 'En directo', r0: 'R', total: 'Total',
  },
  en: {
    title: '🏅 Player profile',
    subtitle: 'Your padel passport: level, ELO and Ranked League stats.',
    signInPrompt: 'Sign in to see your full sports profile.',
    session: 'Session', level: 'Level', elo: 'ELO', name: 'Name', homeClub: 'Home club',
    save: 'Save', saved: '✓ Saved', saving: 'Saving…',
    stats: 'Active tournament stats', noTor: 'No active tournament yet.',
    noSelf: 'Your name is not among the players of the active tournament.',
    detail: 'Detail',
    badges: 'Player badges', noBadges: 'Play your first tournament to unlock badges.',
    pj: 'MP', pg: 'W', pp: 'L', wl: 'Win %', ptof: 'For', eno: 'Against', diff: 'Diff.',
    rank: 'Club ranking', back: '← Back',
    noAccountData: 'No profile data in the cloud (demo mode).',
    levelHint: { n1: 'Beginner', n2: 'Initiation', n3: 'Intermediate', n4: 'Advanced', n5: 'Elite' },
    history: 'Match history', noHistory: 'You have not played any match yet.',
    rivalries: 'Rivalries', noRivalries: 'Play your first match to see rivalries.',
    eloCurve: 'ELO progression', round: 'Round',
    vs: 'vs', win: 'Win', loss: 'Loss', inProg: 'Live', r0: 'R', total: 'Total',
  },
  fr: {
    title: '🏅 Profil joueur',
    subtitle: 'Votre passeport padel : niveau, ELO et statistiques de la Ligue classée.',
    signInPrompt: 'Connectez-vous pour voir votre profil sportif complet.',
    session: 'Session', level: 'Niveau', elo: 'ELO', name: 'Nom', homeClub: 'Club de résidence',
    save: 'Enregistrer', saved: '✓ Enregistré', saving: 'Enregistrement…',
    stats: 'Statistiques du tournoi actif', noTor: 'Pas encore de tournoi actif.',
    noSelf: 'Votre nom n\'apparaît pas parmi les joueurs du tournoi actif.',
    detail: 'Détail',
    badges: 'Badges du joueur', noBadges: 'Jouez votre premier tournoi pour débloquer des badges.',
    pj: 'MJ', pg: 'V', pp: 'D', wl: '% victoires', ptof: 'Pour', eno: 'Contre', diff: 'Diff.',
    rank: 'Classement du club', back: '← Retour',
    noAccountData: 'Aucune donnée de profil dans le cloud (mode démo).',
    levelHint: { n1: 'Débutant', n2: 'Initiation', n3: 'Intermédiaire', n4: 'Avancé', n5: 'Élite' },
    history: 'Historique des matchs', noHistory: 'Vous n\'avez pas encore joué de match.',
    rivalries: 'Rivalités', noRivalries: 'Jouez votre premier match pour voir les rivalités.',
    eloCurve: 'Progression ELO', round: 'Tour',
    vs: 'vs', win: 'Victoire', loss: 'Défaite', inProg: 'En direct', r0: 'T', total: 'Total',
  },
  pt: {
    title: '🏅 Perfil do jogador',
    subtitle: 'O seu passaporte de padel: nível, ELO e estatísticas da Liga ranqueada.',
    signInPrompt: 'Inicie sessão para ver o seu perfil desportivo completo.',
    session: 'Sessão', level: 'Nível', elo: 'ELO', name: 'Nome', homeClub: 'Clube de casa',
    save: 'Guardar', saved: '✓ Guardado', saving: 'Guardando…',
    stats: 'Estatísticas do torneio ativo', noTor: 'Ainda não há torneio ativo.',
    noSelf: 'O seu nome não aparece entre os jogadores do torneio ativo.',
    detail: 'Detalhe',
    badges: 'Insígnias do jogador', noBadges: 'Jogue o seu primeiro torneio para desbloquear insígnias.',
    pj: 'JP', pg: 'V', pp: 'D', wl: '% vitórias', ptof: 'A favor', eno: 'Contra', diff: 'Dif.',
    rank: 'Classificação do clube', back: '← Voltar',
    noAccountData: 'Sem dados de perfil na nuvem (modo demo).',
    levelHint: { n1: 'Iniciante', n2: 'Iniciação', n3: 'Intermediário', n4: 'Avançado', n5: 'Elite' },
    history: 'Histórico de partidas', noHistory: 'Ainda não jogou nenhuma partida.',
    rivalries: 'Rivalidades', noRivalries: 'Jogue a sua primeira partida para ver rivalidades.',
    eloCurve: 'Progressão de ELO', round: 'Rodada',
    vs: 'vs', win: 'Vitória', loss: 'Derrota', inProg: 'Ao vivo', r0: 'R', total: 'Total',
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const input = { background: 'var(--padel-bg)', color: 'var(--padel-text)', border: '1px solid var(--padel-border)', padding: '10px 12px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, width: '100%', boxSizing: 'border-box' };
const saveBtn = { background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer', marginTop: 10 };

function levelBadge(level, T) {
  const n = Number(level ?? 3);
  const key = n <= 1.4 ? 'n1' : n <= 2.4 ? 'n2' : n <= 3.4 ? 'n3' : n <= 4.4 ? 'n4' : 'n5';
  return `${n.toFixed(1)} · ${T.levelHint?.[key] || ''}`.trim();
}

export default function UserProfile({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const { user, profile, loading } = useAuth();
  const [form, setForm] = useState({ display_name: '', elo: 1500, level: 3.0, home_club: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Datos reales del store
  const [self, setSelf] = useState(null);
  const [totals, setTotals] = useState({ players: 0, matches: 0, pairs: 0 });
  const [history, setHistory] = useState([]);
  const [rivalries, setRivalries] = useState([]);
  const [curve, setCurve] = useState([]);

  useEffect(() => {
    if (profile) setForm({ display_name: profile.display_name || '', elo: Number(profile.elo || 1500), level: Number(profile.level || 3), home_club: profile.home_club || '' });
  }, [profile]);

  useEffect(() => {
    const st = getState();
    setTotals({ players: (st.players || []).length, matches: (st.matches || []).length, pairs: (st.pairs || []).length });
    const email = user?.email || '';
    const pname = (form.display_name || email?.split('@')[0] || '').toLowerCase();
    const pl = (st.players || []).find((p) => (p.name || '').toLowerCase().includes(pname) || (p.name || '').toLowerCase() === pname);
    setSelf(pl || null);

    const myPairId = pl?.pairId;
    if (myPairId) {
      // Historial de partidos de la pareja del jugador
      const myMatches = (st.matches || [])
        .filter((m) => m.pair1Id === myPairId || m.pair2Id === myPairId)
        .map((m) => {
          const isP1 = m.pair1Id === myPairId;
          const enemy = isP1 ? m.pair2Names || m.pair2Id : m.pair1Names || m.pair1Id;
          const score = `${m.scoreSet1 || '0-0'}${m.scoreSet2 && m.scoreSet2 !== '0-0' ? ' · ' + m.scoreSet2 : ''}`;
          const meGames = isP1 ? m.pair1Games : m.pair2Games;
          const enGames = isP1 ? m.pair2Games : m.pair1Games;
          const winnerIsMe = m.winnerId === myPairId;
          const status = m.status === 'completed' ? (winnerIsMe ? 'win' : 'loss') : m.status === 'in_progress' ? 'inProg' : 'scheduled';
          return { id: m.id, round: m.round, enemy, score, status, meGames, enGames };
        })
        .sort((a, b) => (b.round || 0) - (a.round || 0));
      setHistory(myMatches);

      // Rivalidades: enfrentamientos contra cada pareja contraria
      const agg = {};
      myMatches.forEach((m) => {
        const key = m.enemy || '?';
        if (!agg[key]) agg[key] = { enemy: key, played: 0, wins: 0, losses: 0 };
        agg[key].played += 1;
        if (m.status === 'win') agg[key].wins += 1;
        if (m.status === 'loss') agg[key].losses += 1;
      });
      setRivalries(Object.values(agg).sort((a, b) => b.played - a.played));

      // Curva de ELO estimada
      setCurve(eloSeries(st, myPairId, { points: 8 }));
    } else {
      setHistory([]); setRivalries([]); setCurve([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, form.display_name]);

  async function save() {
    setSaving(true);
    setSaved(false);
    await upsertProfile(user.id, {
      display_name: form.display_name,
      elo: Number(form.elo) || 1500,
      level: Number(form.level) || 3,
      home_club: form.home_club || null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const email = user?.email || '';
  const name = profile?.display_name || email.split('@')[0] || 'Jugador';
  const initial = (name[0] || 'P').toUpperCase();

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--padel-text)', margin: 0 }}>{T.title}</h1>
        <p style={{ fontSize: 13, color: 'var(--padel-muted)', margin: '6px 0 18px' }}>{T.subtitle}</p>

        {loading ? <p style={{ color: 'var(--padel-muted)', fontSize: 13 }}>⟳…</p> : !user ? (
          <div style={{ ...card, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40 }}>🏅</div>
            <p style={{ color: 'var(--padel-muted)', fontSize: 14, marginTop: 8 }}>{T.signInPrompt}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {/* Tarjeta de identidad */}
            <div style={{ ...card, padding: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#84cc16,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#062c24' }}>
                  {initial}
                </div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--padel-text)' }}>{name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--padel-muted)' }}>{email}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: 'rgba(132,204,22,0.15)', color: '#a3e635' }}>Nivel {profile?.level ?? 3}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>ELO {profile?.elo ?? 1500}</span>
                    {profile?.home_club && <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>📍 {profile.home_club}</span>}
                  </div>
                </div>
              </div>

              {/* Edición */}
              <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.name}</label>
                  <input style={input} value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.homeClub}</label>
                  <input style={input} value={form.home_club} onChange={(e) => setForm({ ...form, home_club: e.target.value })} placeholder={profile?.home_club || ''} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.elo}</label>
                  <input style={input} type="number" value={form.elo} onChange={(e) => setForm({ ...form, elo: Number(e.target.value) })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.level} · {levelBadge(form.level, T)}</label>
                  <input style={input} type="range" min="1" max="5" step="0.1" value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} />
                </div>
              </div>
              <button onClick={save} style={saveBtn}>{saving ? T.saving : saved ? T.saved : T.save}</button>
            </div>

            {/* Estadísticas torneo activo */}
            <div style={{ ...card, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 12px' }}>📊 {T.stats}</h2>
              {!self && totals.players > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10 }}>
                  {[
                    ['👥', totals.players, T.session],
                    ['🗓️', totals.matches, T.detail],
                    ['🏆', totals.pairs, T.rank],
                  ].map(([ic, n, l], i) => (
                    <div key={i} style={{ textAlign: 'center', padding: 10, background: 'var(--padel-bg)', borderRadius: 12 }}>
                      <div style={{ fontSize: 16 }}>{ic}</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--padel-lime)' }}>{n}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--padel-muted)', fontWeight: 600 }}>{l}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {self ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(90px,1fr))', gap: 10 }}>
                    {[
                      [T.pj, self.matchesPlayed || 0], [T.pg, self.wins || 0], [T.pp, self.losses || 0],
                    ].map(([l, v], i) => (
                      <div key={i} style={{ textAlign: 'center', padding: 10, background: 'var(--padel-bg)', borderRadius: 12 }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--padel-text)' }}>{v}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--padel-muted)', fontWeight: 600 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, color: 'var(--padel-muted)', marginBottom: 4 }}>
                      <span>{T.wl}</span><span>{Math.round(((self.wins || 0) / Math.max(1, self.matchesPlayed || 0)) * 100)}%</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--padel-hover-bg)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(((self.wins || 0) / Math.max(1, self.matchesPlayed || 0)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#84cc16)', borderRadius: 99 }} />
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{totals.players ? T.noSelf : T.noTor}</p>
              )}

              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '20px 0 10px' }}>🎖️ {T.badges}</h2>
              {totals.matches > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 99, background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>🔥 Primer torneo</span>
                  {totals.matches >= 4 && <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 99, background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>🏗️ 4+ partidos</span>}
                  {self && (self.wins || 0) >= 3 && <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 99, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>👑 Rey de la red</span>}
                </div>
              ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noBadges}</p>}

              {/* Historial de partidos */}
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '20px 0 10px' }}>📜 {T.history}</h2>
              {history.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.map((m) => {
                    const color = m.status === 'win' ? '#10b981' : m.status === 'loss' ? '#fb7185' : m.status === 'inProg' ? '#fbbf24' : '#64748b';
                    const label = m.status === 'win' ? T.win : m.status === 'loss' ? T.loss : m.status === 'inProg' ? T.inProg : `${T.r0}${m.round || '?'}`;
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--padel-bg)', borderRadius: 10, padding: '8px 12px' }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--padel-text)' }}>{T.r0}{m.round} · {m.vs} {m.enemy}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {m.score && m.status === 'completed' && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--padel-muted)' }}>{m.score}</span>}
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: `${color}22`, color }}>{label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noHistory}</p>}

              {/* Rivalidades */}
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '20px 0 10px' }}>⚔️ {T.rivalries}</h2>
              {rivalries.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {rivalries.map((r) => (
                    <div key={r.enemy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--padel-bg)', borderRadius: 10, padding: '8px 12px' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--padel-text)' }}>{r.enemy}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: '#10b981' }}>{r.wins} {T.win}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: '#fb7185' }}>{r.losses} {T.loss}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--padel-muted)' }}>· {r.played} {T.pj}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noRivalries}</p>}

              {/* Progresión de ELO */}
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '20px 0 10px' }}>📈 {T.eloCurve}</h2>
              {curve.length ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 88, paddingTop: 8 }}>
                  {curve.map((pt, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                      <div style={{ width: '100%', maxWidth: 22, borderRadius: '4px 4px 0 0', height: `${Math.max(8, ((pt.elo - 1450) / 400) * 100)}%`, background: 'linear-gradient(180deg,#a3e635,#10b981)' }} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--padel-muted)', marginTop: 2 }}>{pt.elo}</span>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noSelf}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}