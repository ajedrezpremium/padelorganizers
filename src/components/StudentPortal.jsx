import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  listStudents, listGroups, listMembers, listClasses, listAttendanceByClass,
  listEvaluations, listDrills, listBonuses, listCoaches, LEVEL_LABELS, CATEGORY_LABELS,
} from '../services/schoolService';

const I18N = {
  es: {
    title: '🎓 Mi progreso como alumno',
    subtitle: 'Tus clases, asistencia, evaluación técnica y ejercicios de tu escuela.',
    signInPrompt: 'Inicia sesión para ver tu progreso como alumno.',
    notFound: 'Tu cuenta no está registrada como alumno de una escuela todavía.',
    myClasses: 'Mis próximas clases', noClasses: 'No tienes clases programadas.',
    doneClasses: 'Últimas clases', attendance: 'Asistencia', rate: 'Tasa de asistencia',
    present: 'Presente', absent: 'Falta', group: 'Grupo', coach: 'Entrenador', court: 'Pista',
    eval: 'Mi última evaluación', noEval: 'Tu entrenador todavía no te ha evaluado.',
    technical: 'Técnica', tactical: 'Táctica', movement: 'Movimiento', mental: 'Mental', avg: 'Media',
    myDrills: 'Ejercicios sugeridos', noDrills: 'Todavía no tienes ejercicios asignados.',
    axis: 'Ámbito', level: 'Nivel', levelOf: 'Nivel', category: 'Categoría',
    bonuses: 'Bonos disponibles', left: 'restantes', of: 'de',
    lastClass: 'Última clase', attended: 'Asistió a', 
  },
  en: {
    title: '🎓 My progress as a student',
    subtitle: 'Your classes, attendance, technical evaluation and drills from your school.',
    signInPrompt: 'Sign in to see your progress as a student.',
    notFound: 'Your account is not yet registered as a student at a school.',
    myClasses: 'My upcoming classes', noClasses: 'You have no scheduled classes.',
    doneClasses: 'Recent classes', attendance: 'Attendance', rate: 'Attendance rate',
    present: 'Present', absent: 'Absent', group: 'Group', coach: 'Coach', court: 'Court',
    eval: 'My last evaluation', noEval: 'Your coach has not evaluated you yet.',
    technical: 'Technical', tactical: 'Tactical', movement: 'Movement', mental: 'Mental', avg: 'Avg',
    myDrills: 'Suggested drills', noDrills: 'No drills assigned yet.',
    axis: 'Focus', level: 'Level', levelOf: 'Level', category: 'Category',
    bonuses: 'Available bonuses', left: 'left', of: 'of',
    lastClass: 'Last class', attended: 'Attended',
  },
  fr: {
    title: '🎓 Ma progression d\'élève',
    subtitle: 'Vos cours, présences, évaluation technique et exercices de votre école.',
    signInPrompt: 'Connectez-vous pour voir votre progression d\'élève.',
    notFound: 'Votre compte n\'est pas encore enregistré comme élève d\'une école.',
    myClasses: 'Mes prochains cours', noClasses: 'Aucun cours programmé.',
    doneClasses: 'Derniers cours', attendance: 'Présence', rate: 'Taux de présence',
    present: 'Présent', absent: 'Absent', group: 'Groupe', coach: 'Entraîneur', court: 'Piste',
    eval: 'Ma dernière évaluation', noEval: 'Votre entraîneur ne vous a pas encore évalué.',
    technical: 'Technique', tactical: 'Tactique', movement: 'Déplacement', mental: 'Mental', avg: 'Moyenne',
    myDrills: 'Exercices suggérés', noDrills: 'Aucun exercice assigné.',
    axis: 'Domaine', level: 'Niveau', levelOf: 'Niveau', category: 'Catégorie',
    bonuses: 'Bons disponibles', left: 'restants', of: 'sur',
    lastClass: 'Dernier cours', attended: 'Présent au',
  },
  pt: {
    title: '🎓 O meu progresso como aluno',
    subtitle: 'As suas aulas, presenças, avaliação técnica e exercícios da sua escola.',
    signInPrompt: 'Inicie sessão para ver o seu progresso como aluno.',
    notFound: 'A sua conta ainda não está registada como aluno de uma escola.',
    myClasses: 'As minhas próximas aulas', noClasses: 'Não tem aulas programadas.',
    doneClasses: 'Últimas aulas', attendance: 'Presenças', rate: 'Taxa de presenças',
    present: 'Presente', absent: 'Falta', group: 'Grupo', coach: 'Treinador', court: 'Pista',
    eval: 'A minha última avaliação', noEval: 'O seu treinador ainda não o avaliou.',
    technical: 'Técnica', tactical: 'Tática', movement: 'Movimento', mental: 'Mental', avg: 'Média',
    myDrills: 'Exercícios sugeridos', noDrills: 'Ainda não tem exercícios atribuídos.',
    axis: 'Âmbito', level: 'Nível', levelOf: 'Nível', category: 'Categoria',
    bonuses: 'Bônus disponíveis', left: 'restantes', of: 'de',
    lastClass: 'Última aula', attended: 'Esteve em',
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const chip = { fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99 };

export default function StudentPortal({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const { user, loading } = useAuth();
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [evals, setEvals] = useState([]);
  const [drills, setDrills] = useState([]);
  const [groups, setGroups] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [members, setMembers] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const isMine = (cls) => {
    if (!student) return false;
    const myGroups = new Set((members || []).filter((m) => m.studentId === student.id).map((m) => m.groupId));
    return myGroups.has(cls.groupId);
  };
  const mine = (classes || []).filter(isMine);
  const now = Date.now();
  const upcoming = mine.filter((c) => c.status === 'planned' && new Date(c.startsOn) > now);
  const done = mine.filter((c) => c.status === 'done').sort((a, b) => new Date(b.startsOn) - new Date(a.startsOn));

  const myAttendance = attendance.filter((a) => a.studentId === student?.id);
  const attendedCount = myAttendance.filter((a) => a.attended).length;
  const rate = myAttendance.length ? Math.round((attendedCount / myAttendance.length) * 100) : 0;

  const lastEval = student ? [...evals].filter((e) => e.studentId === student.id).sort((a, b) => (b.evaluatedOn || '').localeCompare(a.evaluatedOn || ''))[0] : null;
  const axis = [
    ['technical', lastEval?.technicalScore, '#a3e635'],
    ['tactical', lastEval?.tacticalScore, '#38bdf8'],
    ['movement', lastEval?.movementScore, '#fb7185'],
    ['mental', lastEval?.mentalScore, '#a78bfa'],
  ];
  const avg = lastEval ? Math.round(((lastEval.technicalScore || 0) + (lastEval.tacticalScore || 0) + (lastEval.movementScore || 0) + (lastEval.mentalScore || 0)) / 4) : 0;

  useEffect(() => {
    if (!user) { setStudent(null); return; }
    let on = true;
    (async () => {
      try {
        const [students, groupsList, membersList, classesList, attendanceList, evalsList, drillsList, coachesList, bonusesList] = await Promise.all([
          listStudents(), listGroups(), listMembers(), listClasses(), listAttendanceByClass('__all__'),
          listEvaluations(), listDrills(), listCoaches(), listBonuses(),
        ]);
        if (!on) return;
        const email = (user.email || '').toLowerCase();
        const me = (students || []).find((s) => (s.email || '').toLowerCase() === email)
          || (students || []).find((s) => (s.name || '').toLowerCase().includes((user.email || '').split('@')[0].toLowerCase()));
        setStudent(me || null);
        setGroups(groupsList || []); setCoaches(coachesList || []); setMembers(membersList || []);
        setClasses(classesList || []); setAttendance(attendanceList || []);
        setEvals(evalsList || []); setDrills(drillsList || []); setBonuses(bonusesList || []);
      } catch { /* offline-first */ }
      setLoadingData(false);
    })();
    return () => { on = false; };
  }, [user]);

  const groupOf = (cls) => {
    const g = (groups || []).find((gr) => gr.id === cls.groupId);
    return g ? g.name : T.group;
  };
  const coachOf = (cls) => {
    const c = (coaches || []).find((co) => co.id === cls.coachId);
    return c ? c.name : T.coach;
  };

  const size = 170, center = 85, radius = 62;
  const pts = axis.map(([key, val, color], i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / axis.length;
    const v = Math.max(0, Math.min(10, Number(val) || 0)) / 10;
    return { key, color, x: center + radius * v * Math.cos(angle), y: center + radius * v * Math.sin(angle), lx: center + (radius + 22) * Math.cos(angle), ly: center + (radius + 22) * Math.sin(angle), label: T[axis[i][0]] || T[axis[i][0].slice(0, 3)] };
  });

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--padel-text)', margin: 0 }}>{T.title}</h1>
        <p style={{ fontSize: 13, color: 'var(--padel-muted)', margin: '6px 0 18px' }}>{T.subtitle}</p>

        {loading || loadingData ? <p style={{ color: 'var(--padel-muted)' }}>⟳…</p> : !user ? (
          <div style={{ ...card, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40 }}>🎓</div>
            <p style={{ color: 'var(--padel-muted)', fontSize: 14, marginTop: 8 }}>{T.signInPrompt}</p>
          </div>
        ) : !student ? (
          <div style={{ ...card, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40 }}>👤</div>
            <p style={{ color: 'var(--padel-muted)', fontSize: 14, marginTop: 8 }}>{T.notFound}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {/* Radar de evaluación */}
            <div style={{ ...card, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 4px' }}>📊 {T.eval}</h2>
              {lastEval ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width={size} height={size} viewBox="0 0 170 170">
                      {axis.map(([k, v, color], i) => {
                        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / axis.length;
                        const ex = center + radius * Math.cos(angle), ey = center + radius * Math.sin(angle);
                        return <line key={k} x1={center} y1={center} x2={ex} y2={ey} stroke="rgba(148,163,184,0.25)" strokeWidth={1} />;
                      })}
                      <polygon points={axis.map(([k, v], i) => {
                        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / axis.length;
                        const val = Math.max(0, Math.min(10, Number(v) || 0)) / 10;
                        return `${center + radius * val * Math.cos(angle)},${center + radius * val * Math.sin(angle)}`;
                      }).join(' ')} fill="rgba(163,230,53,0.18)" stroke="#a3e635" strokeWidth={1.5} />
                      {pts.map((p) => <circle key={p.key} cx={p.x} cy={p.y} r={3.5} fill={p.color} />)}
                      {pts.map((p) => <text key={p.key + 'l'} x={p.lx} y={p.ly + 3} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={p.color}>{p.label}</text>)}
                    </svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ ...chip, background: 'rgba(132,204,22,0.15)', color: '#a3e635' }}>{T.avg}: {avg}/10</span>
                  </div>
                </>
              ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: '14px 0 0' }}>{T.noEval}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Asistencia */}
              <div style={{ ...card, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: 0 }}>✅ {T.attendance}</h2>
                  <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--padel-lime)' }}>{rate}%</span>
                </div>
                {myAttendance.length ? (
                  <>
                    <div style={{ height: 8, background: 'var(--padel-hover-bg)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${rate}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#84cc16)', borderRadius: 99 }} />
                    </div>
                    <p style={{ fontSize: 11.5, color: 'var(--padel-muted)', margin: '10px 0 0' }}>{T.attended} {attendedCount}/{myAttendance.length} · {T.rate}: {rate}%</p>
                  </>
                ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noClasses}</p>}
              </div>

              {/* Bonos */}
              <div style={{ ...card, padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>🎫 {T.bonuses}</h2>
                {bonuses.filter((b) => b.studentId === student.id).length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {bonuses.filter((b) => b.studentId === student.id).map((b) => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--padel-bg)', borderRadius: 10, padding: '8px 12px' }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--padel-text)' }}>{b.description}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#a3e635' }}>{b.totalClasses - b.usedClasses} {T.left} {T.of} {b.totalClasses}</span>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noDues || T.noClasses}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Próximas clases */}
              <div style={{ ...card, padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>🗓️ {T.myClasses}</h2>
                {upcoming.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {upcoming.map((c) => (
                      <div key={c.id} style={{ background: 'var(--padel-bg)', borderRadius: 10, padding: '8px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--padel-text)' }}>{new Date(c.startsOn).toLocaleString(lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-PT' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          <span style={chip} >{c.status === 'planned' ? '⏳' : '✅'}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--padel-muted)', marginTop: 2 }}>{T.court}: {c.courtName || '—'} · {T.group}: {groupOf(c)} · {T.coach}: {coachOf(c)}</div>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noClasses}</p>}

                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '16px 0 10px' }}>✅ {T.doneClasses}</h2>
                {done.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                    {done.map((c) => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--padel-bg)', borderRadius: 10, padding: '8px 12px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--padel-text)' }}>{new Date(c.startsOn).toLocaleDateString()}</span>
                        <span style={{ fontSize: 11, color: 'var(--padel-muted)' }}>{groupOf(c)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noClasses}</p>}
              </div>

              {/* Drills */}
              <div style={{ ...card, padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>🗂️ {T.myDrills}</h2>
                {drills.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                    {drills.map((d) => (
                      <div key={d.id} style={{ background: 'var(--padel-bg)', borderRadius: 10, padding: '8px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--padel-text)' }}>{d.name}</span>
                          <span style={{ ...chip, background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>{d.level}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--padel-muted)', marginTop: 2 }}>{T.axis}: {d.axis} · {d.durationMin} min</div>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noDrills}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}