import React, { useState, useEffect } from 'react';
import {
  listCoaches, saveCoach, deleteCoach,
  listStudents, addStudent, deleteStudent,
  listGroups, addGroup, deleteGroup,
  listMembers, addMember, removeMember,
  listClasses, addClass, updateClassStatus,
  recordAttendance,
  listEvaluations, addEvaluation,
  listBonuses, addBonus, useBonus,
  schoolStats, LEVEL_LABELS, CATEGORY_LABELS, LEVELS, CATEGORIES,
} from '../services/schoolService';

const I18N = {
  es: {
    title: '🏫 Escuela & Entrenadores',
    subtitle: 'Grupos por nivel y edad · clases · asistencia · evaluación técnica · bonos de clases',
    statsTitle: 'Panel de la escuela',
    students: 'Alumnos', groups: 'Grupos activos', planned: 'Próximas', done: 'Realizadas',
    attendanceRate: 'Asistencia', minors: 'Menores', bonusAvailable: 'Bonos disponibles',
    tabStudents: '👥 Alumnos', tabGroups: '👨‍🏫 Grupos', tabClasses: '🗓️ Clases', tabCoaches: '📈 Progresión',
    coachName: 'Nombre', coachEmail: 'Email', coachPhone: 'Teléfono', coachSpecialty: 'Especialidad',
    addCoach: 'Añadir entrenador', saveCoach: 'Guardar entrenador',
    addStudent: 'Añadir alumno', saveStudent: 'Guardar alumno',
    name: 'Nombre', email: 'Email', phone: 'Teléfono', level: 'Nivel', category: 'Categoría',
    guardian: 'Tutor legal', minorWarning: 'Los menores requieren tutor legal autorizado.',
    addGroup: 'Nuevo grupo', saveGroup: 'Guardar grupo', groupName: 'Nombre del grupo',
    capacity: 'Capacidad', schedule: 'Horario', members: 'Componentes', addToGroup: 'Añadir al grupo',
    addClass: 'Nueva clase', saveClass: 'Guardar clase', groupByClass: 'Grupo', coachForClass: 'Entrenador',
    court: 'Pista', dateTime: 'Fecha y hora',
    duration: 'Duración (min)', price: 'Precio (€)', attendance: 'Asistencia', present: 'Presente',
    statusDone: 'Marcar realizada', statusCancelled: 'Cancelar', statusPlanned: 'Reabrir',
    addEval: 'Evaluar', saveEval: 'Guardar evaluación', technical: 'Técnica', tactical: 'Táctica',
    movement: 'Movimiento', mental: 'Mental', notes: 'Notas', score: 'Media',
    addBonus: 'Añadir bono', saveBonus: 'Guardar bono', totalClasses: 'Nº de clases', useBonus: 'Usar clase',
    online: '🟢 Nube', local: '🟡 Local', empty: 'Sin datos todavía.', noStudents: 'Sin alumnos. Añade el primero.',
    loading: 'Cargando…', members: 'miembros', coachForGroup: 'Selecciona entrenador',
    groupForClass: 'Grupo', coachForClass: 'Entrenador', assigned: 'grupos', active: 'Activo', inactive: 'Inactivo',
    noGroups: 'Sin grupos creados.', bonusLeft: 'restantes', bonusTotal: 'clases',
  },
  en: {
    title: '🏫 School & Coaches',
    subtitle: 'Groups by level and age · classes · attendance · technical evaluation · class bonuses',
    students: 'Students', groups: 'Active groups', planned: 'Upcoming', done: 'Completed',
    attendanceRate: 'Attendance', minors: 'Minors', bonusAvailable: 'Bonuses available',
    tabStudents: '👥 Students', tabGroups: '👨‍🏫 Groups', tabClasses: '🗓️ Classes', tabCoaches: '📚 Progress',
    coachName: 'Name', coachEmail: 'Email', coachPhone: 'Phone', coachSpecialty: 'Specialty',
    addCoach: 'Add coach', saveCoach: 'Save coach',
    addStudent: 'Add student', saveStudent: 'Save student',
    name: 'Name', email: 'Email', phone: 'Phone', level: 'Level', category: 'Category',
    guardian: 'Guardian', minorNote: 'Minors require an authorized legal guardian.',
    addGroup: 'New group', saveGroup: 'Save group', groupName: 'Group name',
    capacity: 'Capacity', schedule: 'Schedule', members: 'Members', addToGroup: 'Add to group',
    addClass: 'New class', saveClass: 'Save class', groupByClass: 'Group', coachForClass: 'Coach',
    court: 'Court', dateTime: 'Date & time',
    duration: 'Duration (min)', price: 'Price (€)', attendance: 'Attendance', present: 'Present',
    statusDone: 'Mark completed', statusCancelled: 'Cancel', statusPlanned: 'Reopen',
    addScore: 'Rate', saveEval: 'Save evaluation', technical: 'Technical', tactical: 'Tactical',
    movement: 'Movement', mental: 'Mental', notes: 'Notes', scoreBonus: 'Avg',
    addBonus: 'Add bonus', saveBonus: 'Save bonus', totalClasses: 'Class count', useBonus: 'Use class',
    online: '🟢 Cloud', local: '🟡 Local', empty: 'No data yet.', noStudents: 'No students. Add the first.',
    loading: 'Loading…', coach: 'Coach',
    coachByClass: 'Coach', attrCoach: 'Assigned coach', membersCount: 'members',
    active: 'Active', inactive: 'Inactive', bonusLeft: 'left', totalCls: 'classes',
  },
  fr: {
    title: '🏫 École & Entraîneurs',
    subtitle: 'Groupes par niveau et âge · cours · présence · évaluation · bons de cours',
    students: 'Élèves', groups: 'Groupes actifs', planned: 'À venir', done: 'Réalisés',
    attendanceRate: 'Présence', minors: 'Mineurs', bonusAvailable: 'Bons dispo',
    tabStudents: '👥 Élèves', tabGroups: '👨‍🏫 Groupes', tabClasses: '🗓️ Cours', tabCoaches: '📚 Progression',
    coachName: 'Nom', coachEmail: 'Email', coachPhone: 'Téléphone', coachSpecialty: 'Spécialité',
    addCoach: 'Ajouter entraîneur', saveCoach: 'Enregistrer',
    addStudent: 'Ajouter élève', saveStudent: 'Enregistrer',
    name: 'Nom', email: 'Email', phone: 'Téléphone', level: 'Niveau', category: 'Catégorie',
    guardian: 'Tuteur', minorNote: 'Les mineurs nécessitent un tuteur légal autorisé.',
    addGroup: 'Nouveau groupe', saveGroup: 'Enregistrer', groupName: 'Nom du groupe',
    capacity: 'Capacité', schedule: 'Horaire', members: 'Composants', addToGroup: 'Ajouter au groupe',
    addClass: 'Ajouter cours', saveClass: 'Enregistrer', groupByClass: 'Groupe', coachForClass: 'Entraîneur', court: 'Piste', dateTime: 'Date et heure',
    duration: 'Durée (min)', price: 'Prix (€)', attendance: 'Présence', present: 'Présent',
    statusDone: 'Terminé', statusCancelled: 'Annuler', statusPlanned: 'Rouvrir',
    addScore: 'Évaluer', saveEval: 'Enregistrer', technical: 'Technique', tactical: 'Tactique',
    movement: 'Déplacement', mental: 'Mental', notes: 'Notes', scoreBonus: 'Moyenne',
    addBonus: 'Ajouter bon', saveBonus: 'Enregistrer', totalClasses: 'N séances', useBonus: 'Utiliser',
    online: '🟢 Cloud', local: '🟡 Local', empty: 'Aucune donnée.', noStudents: 'Aucun élève. Ajoutez le premier.',
    loading: 'Chargement…', coach: 'Entraîneur', noGroups: 'Aucun groupe.',
  },
  pt: {
    title: '🏓 Escola & Treinadores',
    subtitle: 'Grupos por nível e idade · aulas · presenças · avaliação · bônus de aulas',
    students: 'Alunos', groups: 'Grupos ativos', planned: 'Próximas', done: 'Realizadas',
    attendanceRate: 'Presenças', minors: 'Menores', bonusAvailable: 'Bônus disp.',
    tabStudents: '👥 Alunos', tabGroups: '👨‍🏫 Grupos', tabClasses: '🗓️ Aulas', tabCoaches: '📚 Progresso',
    coachName: 'Nome', coachEmail: 'Email', coachPhone: 'Telefone', coachSpecialty: 'Especialidade',
    addCoach: 'Adicionar treinador', saveCoach: 'Salvar',
    addStudent: 'Adicionar aluno', saveStudent: 'Salvar',
    name: 'Nome', email: 'Email', phone: 'Telefone', level: 'Nível', category: 'Categoria',
    guardian: 'Responsável', minorNote: 'Menores exigem responsável legal autorizado.',
    addGroup: 'Novo grupo', saveGroup: 'Salvar', groupName: 'Nome do grupo',
    capacity: 'Capacidade', schedule: 'Horário', members: 'Componentes', addToGroup: 'Adicionar ao grupo',
    addClass: 'Nova aula', saveClass: 'Salvar', groupByClass: 'Grupo', coachForClass: 'Treinador', court: 'Pista', dateTime: 'Data e hora',
    duration: 'Duração (min)', price: 'Preço (€)', attendance: 'Presenças', present: 'Presente',
    statusDone: 'Marcar realizada', statusCancelled: 'Cancelar', statusPlanned: 'Reabrir',
    addScore: 'Avaliar', saveEval: 'Salvar avaliação', technical: 'Técnica', tactical: 'Tática',
    movement: 'Movimento', mental: 'Mental', notes: 'Notas', scoreBonus: 'Média',
    addBonus: 'Adicionar bônus', saveBonus: 'Salvar', totalClasses: 'N aulas', useBonus: 'Usar aula',
    online: '🟢 Nuvem', local: '🟡 Local', empty: 'Sem dados.', noStudents: 'Sem alunos. Adicione o primeiro.',
    loading: 'Carregando…', noGroups: 'Sem grupos.',
  },
};

const sectionStyle = { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' };
const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const input = { background: 'var(--padel-input-bg)', border: '1px solid var(--padel-input-border)', color: 'var(--padel-text)', borderRadius: 10, padding: '9px 12px', fontSize: 14, width: '100%', outline: 'none' };
const btnPrimary = { background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnGhost = { background: 'transparent', color: 'var(--padel-muted)', border: '1px solid var(--padel-border)', padding: '8px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' };

const Field = ({ label, value, onChange, type = 'text', options, placeholder }) => (
  <label style={{ display: 'block', marginBottom: 10 }}>
    <span style={{ fontSize: 12, color: 'var(--padel-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>{label}</span>
    <input type={type} value={value || ''} onChange={onChange} style={input} placeholder={placeholder} list={options ? `dl-${label}` : undefined} />
    {options && (
      <datalist id={`dl-${label}`}>
        {options.map(o => <option key={o} value={o} />)}
      </datalist>
    )}
  </label>
);

export default function SchoolApp({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const L = LEVEL_LABELS(lang);
  const C = CATEGORY_LABELS(lang);
  const [tab, setTab] = useState('students');

  const [coaches, setCoaches] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [evals, setEvals] = useState([]);
  const [bonuses, setBonuses] = useState([]);

  const emptyStudent = () => ({ id: null, name: '', email: '', phone: '', birthdate: '', ageGroup: 'adults', level: 'BEGINNER', guardianName: '', guardianEmail: '', guardianPhone: '', notes: '' });
  const emptyGroup = () => ({ id: null, name: '', category: 'adults', level: 'BEGINNER', capacity: 8, coachId: '', schedule: '', active: true });
  const emptyCoach = () => ({ id: null, name: '', email: '', phone: '', specialty: '', bio: '', active: true });
  const emptyClass = () => ({ id: null, groupId: '', coachId: '', courtName: '', startsOn: '', durationMin: 60, location: '', price: '' });
  const emptyBonus = () => ({ studentId: '', description: 'Bono de clases', total: 4, expiresOn: '' });

  const [studentForm, setStudentForm] = useState(emptyStudentForm());
  const [groupForm, setGroupForm] = useState(emptyGroup());
  const [coachForm, setCoachForm] = useState(emptyCoach());
  const [classForm, setClassForm] = useState(emptyClass());
  const [evalForm, setEvalForm] = useState(null);
  const [bonusForm, setBonusForm] = useState(emptyBonus());
  const [loading, setLoading] = useState(true);
  const [cloudOk, setCloudOk] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [c, s, g, m, cl, a, e, b] = await Promise.all([
        listCoaches(), listStudents(), listGroups(), listMembers(),
        listClasses(), listAttendanceByClass('__all__'), listEvaluations(), listBonuses(),
      ]);
      setCoaches(c); setStudents(s); setGroups(g); setMembers(m);
      setClasses(cl); setAttendance(a); setEvals(e); setBonuses(b);
      setCloudOk(c.length > 0 || s.length > 0 || g.length > 0 || a.length > 0);
    } catch (err) {
      console.error('School load', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const stats = schoolStats({ students, groups, classes, attendance, bonuses });
  const nameOf = (id, list) => (list.find(x => x.id === id) || {}).name || '—';
  const membersOf = (groupId) => members.filter(m => m.groupId === groupId);
  const studentsOfGroup = (groupId) => {
    const ids = membersOf(groupId).map(m => m.studentId);
    return students.filter(s => ids.includes(s.id));
  };
  const classMembers = (cls) => studentsOfGroup(cls.groupId);
  const bonusLeft = (b) => (b.total || 0) - (b.used || 0);
  const studentAvg = (sid) => {
    const list = evals.filter(ev => ev.studentId === sid);
    if (!list.length) return null;
    const sum = list.reduce((acc, ev) => acc + (+ev.technical) + (+ev.tactical) + (+ev.movement) + (+ev.mental), 0);
    return (sum / (list.length * 4)).toFixed(1);
  };

  const submitStudent = async () => { await addStudent(studentForm); setStudentForm(emptyStudentForm()); loadAll(); };
  const submitGroup = async () => { await addGroup(groupForm); setGroupForm(emptyGroup()); loadAll(); };
  const submitCoach = async () => { await saveCoach(coachForm); setCoachForm(emptyCoach()); loadAll(); };
  const submitClass = async () => {
    const cls = { ...classForm, startsOn: classForm.startsOn ? new Date(classForm.startsOn).toISOString() : new Date().toISOString() };
    await addClass(cls);
    setClassForm(emptyClass());
    loadAll();
  };
  const toggleAttend = async (cls, sid, attended) => {
    await recordAttendance(cls.id, sid, attended);
    loadAll();
  };
  const submitEval = async () => { await addEvaluation(evalForm); setEvalForm(null); loadAll(); };
  const submitBonus = async () => { await addBonus({ ...bonusForm, studentId: evalForm ? evalForm.studentId : bonusForm.studentId }); loadAll(); };

  return (
    <div style={{ padding: '30px 0 60px', minHeight: '80vh' }}>
      <div style={sectionStyle}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--padel-text)', margin: '0 0 6px' }}>{T.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--padel-muted)', margin: '0 0 24px' }}>{T.subtitle} · {cloudOk ? T.online : T.local}</p>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            ['👥', stats.students, T.students],
            ['👨‍🏫', stats.activeGroups, T.groups],
            ['🗓️', stats.planned, T.planned],
            ['✅', stats.done, T.done],
            ['📈', `${stats.attendanceRate}%`, T.attendanceRate],
            ['🧒', stats.minors, T.minors],
            ['🎟️', stats.bonusAvailable, T.bonusAvailable],
          ].map(([ic, n, l], i) => (
            <div key={i} style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 22 }}>{ic}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--padel-lime)' }}>{n}</div>
              <div style={{ fontSize: 12, color: 'var(--padel-muted)', fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[['students', T.tabStudents], ['groups', T.tabGroups], ['classes', T.tabClasses], ['coaches', T.tabCoaches]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ ...(tab === k ? btnPrimary : btnGhost) }}>{l}</button>
          ))}
        </div>

        {loading ? <p style={{ color: 'var(--padel-muted)' }}>{T.loading}</p> : (
          <div>
            {/* ===== ALUMNOS ===== */}
            {tab === 'students' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                <div style={card}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 14 }}>{T.addStudent}</h3>
                  <Field label={T.name} value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} />
                  <Field label={T.email} type="email" value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} />
                  <Field label={T.phone} value={studentForm.phone} onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })} />
                  <Field label={T.category} value={studentForm.ageGroup} options={CATEGORIES} onChange={e => setStudentForm({ ...studentForm, ageGroup: e.target.value })} />
                  <Field label={T.level} value={studentForm.level} options={LEVELS} onChange={e => setStudentForm({ ...studentForm, level: e.target.value })} />
                  {(studentForm.ageGroup === 'kids' || studentForm.ageGroup === 'teens') && (
                    <>
                      <Field label={T.guardian} value={studentForm.guardianName} onChange={e => setStudentForm({ ...studentForm, guardianName: e.target.value })} />
                      <p style={{ fontSize: 11, color: '#fbbf24', margin: '0 0 8px' }}>⚠️ {T.minorNote}</p>
                    </>
                  )}
                  <button onClick={submitStudent} style={{ ...btnPrimary, width: '100%' }}>{T.saveStudent}</button>
                </div>

                <div style={{ ...card, maxHeight: 520, overflowY: 'auto' }}>
                  {students.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--padel-muted)' }}>{T.noStudents}</p>
                  ) : students.map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--padel-border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--padel-text)', fontSize: 14 }}>{s.name} {studentAvg(s.id) !== null && <span style={{ color: 'var(--padel-lime)' }}>⭐ {studentAvg(s.id)}</span>}</div>
                        <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>{L[s.level] || s.level} · {C[s.ageGroup] || s.ageGroup} {s.guardianName ? `· ${s.guardianName}` : ''}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <button onClick={() => setEvalForm({ id: null, studentId: s.id, coachId: '', evaluatedOn: new Date().toISOString().slice(0, 10), technical: 0, tactical: 0, movement: 0, mental: 0, level: '', notes: '' })} style={btnGhost}>{T.addScore}</button>
                          <button onClick={() => setBonusForm({ ...emptyBonus(), studentId: s.id })} style={btnGhost}>{T.addBonus}</button>
                        </div>
                      </div>
                      <button onClick={() => deleteStudent(s.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== GRUPOS ===== */}
            {tab === 'groups' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                <div style={card}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 14 }}>{T.addGroup}</h3>
                  <Field label={T.groupName} value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} />
                  <Field label={T.category} value={groupForm.category} options={CATEGORIES} onChange={e => setGroupForm({ ...groupForm, category: e.target.value })} />
                  <Field label={T.level} value={groupForm.level} options={LEVELS} onChange={e => setGroupForm({ ...groupForm, level: e.target.value })} />
                  <Field label={T.capacity} type="number" value={groupForm.capacity} onChange={e => setGroupForm({ ...groupForm, capacity: Number(e.target.value) })} />
                  <button onClick={submitGroup} style={{ ...btnPrimary, width: '100%' }}>{T.saveGroup}</button>
                </div>

                <div style={{ ...card, maxHeight: 560, overflowY: 'auto' }}>
                  {groups.length === 0 && <p style={{ fontSize: 13, color: 'var(--padel-muted)' }}>{T.empty} · {T.noGroups || ''}</p>}
                  {groups.map(g => (
                    <div key={g.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--padel-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, color: 'var(--padel-text)', fontSize: 15 }}>{g.name} <span style={{ color: 'var(--padel-lime)', fontWeight: 900 }}>{L[g.level]}</span></div>
                        <button onClick={() => deleteGroup(g.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--padel-muted)', margin: '4px 0 8px' }}>
                        {C[g.category] || g.category} · {membersOf(g.id).length}/{g.capacity} {T.members}
                        {g.schedule ? ` · ${g.schedule}` : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {studentsOfGroup(g.id).map(s => (
                          <span key={s.id} style={{ background: 'var(--padel-hover-bg)', padding: '4px 8px', borderRadius: 8, fontSize: 12 }}>
                            {s.name}{' '}
                            <button onClick={() => removeMember(g.id, s.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>✕</button>
                          </span>
                        ))}
                        <select value="" onChange={e => { if (e.target.value) { addMember(g.id, e.target.value); loadAll(); } }} style={{ ...input, width: 'auto', maxWidth: 140 }}>
                          <option value="">+ {T.addToGroup}</option>
                          {students.filter(s => !membersOf(g.id).some(m => m.studentId === s.id)).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== CLASES ===== */}
            {tab === 'classes' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                <div style={card}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 14 }}>{T.addClass}</h3>
                  <Field label={T.groupByClass} value={classForm.groupId} options={groups.map(g => g.id)} onChange={e => setClassForm({ ...classForm, groupId: e.target.value })} />
                  <Field label={T.coachForClass} value={classForm.coachId} options={coaches.map(c => c.id)} onChange={e => setClassForm({ ...classForm, coachId: e.target.value })} />
                  <Field label={T.court} value={classForm.courtName} onChange={e => setClassForm({ ...classForm, courtName: e.target.value })} />
                  <Field label={T.dateTime} type="datetime-local" value={classForm.startsOn} onChange={e => setClassForm({ ...classForm, startsOn: e.target.value })} />
                  <Field label={T.duration} type="number" value={classForm.durationMin} onChange={e => setClassForm({ ...classForm, durationMin: Number(e.target.value) })} />
                  <Field label={T.price} type="number" value={classForm.price} onChange={e => setClassForm({ ...classForm, price: e.target.value })} />
                  <button onClick={submitClass} style={{ ...btnPrimary, width: '100%' }}>{T.saveClass}</button>
                </div>

                <div style={{ maxHeight: 560, overflowY: 'auto' }}>
                  {classes.length === 0 && <p style={{ color: 'var(--padel-muted)' }}>{T.empty}</p>}
                  {classes.slice().sort((a, b) => new Date(a.startsOn) - new Date(b.startsOn)).map(cl => (
                    <div key={cl.id} style={{ ...card, marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, color: 'var(--padel-text)' }}>
                          {nameOf(cl.groupId, groups) || cl.courtName || '—'}
                          <span style={{ fontSize: 12, color: 'var(--padel-muted)', fontWeight: 500, marginLeft: 8 }}>
                            {new Date(cl.startsOn).toLocaleString(lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-PT' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {cl.status !== 'done' && <button onClick={() => { updateClassStatus(cl.id, 'done'); loadAll(); }} style={{ ...btnGhost, color: 'var(--padel-lime)' }}>{T.statusDone}</button>}
                          {cl.status === 'planned' && <button onClick={() => { updateClassStatus(cl.id, 'cancelled'); loadAll(); }} style={{ ...btnGhost, color: '#f87171' }}>{T.statusCancelled}</button>}
                          {(cl.status === 'done' || cl.status === 'cancelled') && <button onClick={() => { updateClassStatus(cl.id, 'planned'); loadAll(); }} style={btnGhost}>{T.statusPlanned}</button>}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--padel-muted)', margin: '4px 0 8px' }}>
                        {cl.courtName && `🏸 ${cl.courtName} · `}{cl.coachId ? nameOf(cl.coachId, coaches) : ''}
                        {cl.price != null && ` · 💶 ${cl.price} €`}
                      </div>
                      {cl.status === 'planned' && (
                        <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>
                          {T.attendance}:
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                            {studentAvg(cl.id) === undefined && null}
                            {studentListFor(cl, students, members).map(s => {
                              const rec = attendance.find(a => a.classId === cl.id && a.studentId === s.id);
                              return (
                                <span key={s.id}
                                  onClick={() => toggleAttend(cl, s.id, !(rec && rec.attended))}
                                  style={{ padding: '4px 10px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', background: rec && rec.attended ? 'var(--padel-emerald)' : 'var(--padel-hover-bg)', color: rec && rec.attended ? '#fff' : 'var(--padel-muted)', border: '1px solid var(--padel-border)' }}>
                                  {s.name} {rec && rec.attended ? '✓' : ''}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== PROGRESO / ENTRENADORES ===== */}
            {tab === 'coaches' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                <div style={card}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 14 }}>{T.addCoach}</h3>
                  <Field label={T.coachName} value={coachForm.name} onChange={e => setCoachForm({ ...coachForm, name: e.target.value })} />
                  <Field label={T.coachEmail} type="email" value={coachForm.email} onChange={e => setCoachForm({ ...coachForm, email: e.target.value })} />
                  <Field label={T.coachPhone} value={coachForm.phone} onChange={e => setCoachForm({ ...coachForm, phone: e.target.value })} />
                  <Field label={T.coachSpecialty} value={coachForm.specialty} onChange={e => setCoachForm({ ...coachForm, specialty: e.target.value })} />
                  <button onClick={submitCoach} style={{ ...btnPrimary, width: '100%' }}>{T.saveCoach}</button>

                  {evalForm && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--padel-border)', paddingTop: 14 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>
                        {T.addScore}: {nameOf(evalForm.studentId, students)}
                      </h4>
                      {['technical', 'tactical', 'movement', 'mental'].map(k => (
                        <Field key={k} label={`${T[k]} (0-10)`} type="number" min="0" max="10" value={evalForm[k]} onChange={e => setEvalForm({ ...evalForm, [k]: Number(e.target.value) })} />
                      ))}
                      <Field label={T.notes} value={evalForm.notes} onChange={e => setEvalForm({ ...evalForm, notes: e.target.value })} />
                      <button onClick={submitEval} style={{ ...btnPrimary, width: '100%' }}>{T.saveEval}</button>
                    </div>
                  )}

                  {bonusForm && bonusForm.studentId && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--padel-border)', paddingTop: 14 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>
                        {T.addBonus}: {nameOf(bonusForm.studentId, students)}
                      </h4>
                      <Field label={T.totalClasses} type="number" value={bonusForm.total} onChange={e => setBonusForm({ ...bonusForm, total: Number(e.target.value) })} />
                      <button onClick={() => { submitBonus(); }} style={{ ...btnPrimary, width: '100%' }}>{T.saveBonus}</button>
                    </div>
                  )}
                </div>

                <div style={{ ...card, maxHeight: 560, overflowY: 'auto' }}>
                  {coaches.length === 0 && <p style={{ fontSize: 13, color: 'var(--padel-muted)' }}>{T.empty}</p>}
                  {coaches.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--padel-border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--padel-text)' }}>{c.name} {c.active ? '' : `(${T.inactive})`}</div>
                        <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>{c.specialty} · {c.email || c.phone}</div>
                        <div style={{ fontSize: 12, color: 'var(--padel-muted)' }}>
                          {groups.filter(g => g.coachId === c.id).length} {T.groups}
                        </div>
                      </div>
                      <button onClick={() => deleteCoach(c.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// helpers para listar alumnos de una clase mediante sus miembros del grupo
function studentListFor(cls, students, members) {
  const ids = members.filter(m => m.groupId === cls.groupId).map(x => x.studentId);
  return students.filter(s => ids.includes(s.id));
}