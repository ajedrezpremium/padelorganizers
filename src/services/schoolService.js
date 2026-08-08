/**
 * schoolService.js — Escuela / Entrenadores (módulo 4C, sprint 2).
 * Gestión de escuela de pádel: entrenadores, alumnos, grupos por nivel y
 * edad, clases, asistencia, evaluación técnica, bonos de clases.
 * Persistencia: Supabase si hay tablas disponibles, si no localStorage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LS = {
  coaches: 'padelorganizers-coaches',
  students: 'padelorganizers-students',
  groups: 'padelorganizers-groups',
  members: 'padelorganizers-group-members',
  classes: 'padelorganizers-classes',
  attendance: 'padelorganizers-attendance',
  evals: 'padelorganizers-evals',
  bonuses: 'padelorganizers-bonuses',
};

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function writeLocal(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

// ---------- helpers ----------
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO'];
const CATEGORIES = ['kids', 'teens', 'adults', 'seniors'];

export const LEVEL_LABELS = (lang = 'es') => ({
  BEGINNER: lang === 'es' ? 'Iniciación' : lang === 'fr' ? 'Débutant' : lang === 'pt' ? 'Iniciante' : 'Beginner',
  INTERMEDIATE: lang === 'es' ? 'Intermedio' : lang === 'fr' ? 'Intermédiaire' : lang === 'pt' ? 'Intermediário' : 'Intermediate',
  ADVANCED: lang === 'es' ? 'Avanzado' : lang === 'fr' ? 'Avancé' : lang === 'pt' ? 'Avançado' : 'Advanced',
  PRO: 'PRO',
});

export const CATEGORY_LABELS = (lang = 'es') => ({
  kids: lang === 'es' ? 'Niños' : lang === 'fr' ? 'Enfants' : lang === 'pt' ? 'Crianças' : 'Kids',
  teens: lang === 'es' ? 'Jóvenes' : lang === 'fr' ? 'Ados' : lang === 'pt' ? 'Jovens' : 'Teens',
  adults: lang === 'es' ? 'Adultos' : lang === 'fr' ? 'Adultes' : lang === 'pt' ? 'Adultos' : 'Adults',
  seniors: lang === 'es' ? 'Sénior' : lang === 'fr' ? 'Séniors' : lang === 'pt' ? 'Sênior' : 'Seniors',
});

export { LEVELS, CATEGORIES };

// ---------- mappers ----------
function mapRow(table, row) {
  if (table === 'coaches') return { id: row.id, name: row.name, email: row.email, phone: row.phone, specialty: row.specialty, bio: row.bio, avatarUrl: row.avatar_url, active: row.active, createdAt: row.created_at };
  if (table === 'students') return { id: row.id, name: row.name, email: row.email, phone: row.phone, birthdate: row.birthdate, level: row.level || 'BEGINNER', ageGroup: row.age_group || 'adults', guardianName: row.guardian_name, guardianEmail: row.guardian_email, guardianPhone: row.guardian_phone, guardianAuthorized: row.guardian_authorized, notes: row.notes, createdAt: row.created_at };
  if (table === 'groups') return { id: row.id, name: row.name, category: row.category || 'adults', level: row.level || 'BEGINNER', capacity: row.capacity || 8, coachId: row.coach_id, schedule: row.schedule, active: row.active, createdAt: row.created_at };
  if (table === 'members') return { id: row.id, groupId: row.group_id, studentId: row.student_id, joinedOn: row.joined_on };
  if (table === 'classes') return { id: row.id, groupId: row.group_id, coachId: row.coach_id, courtName: row.court_name, startsOn: row.starts_on, durationMin: row.duration_min || 60, location: row.location, status: row.status || 'planned', price: row.price, createdAt: row.created_at };
  if (table === 'attendance') return { id: row.id, classId: row.class_id, studentId: row.student_id, attended: row.attended, recovered: row.recovered, notes: row.notes };
  if (table === 'evals') return { id: row.id, studentId: row.student_id, coachId: row.coach_id, evaluatedOn: row.evaluated_on, technical: row.technical_score || 0, tactical: row.tactical_score || 0, movement: row.movement_score || 0, mental: row.mental_score || 0, level: row.level, notes: row.notes };
  if (table === 'bonuses') return { id: row.id, studentId: row.student_id, description: row.description, total: row.total_classes || 0, used: row.used_classes || 0, expiresOn: row.expires_on };
  return row;
}

function localId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

async function cloudQuery(table, columns = '*') {
  try {
    const { data, error } = await supabase.from(table).select(columns);
    if (error || !data) return null;
    return data.map(r => mapRow(table, r));
  } catch {
    return null;
  }
}

// ---------- entrenadores ----------
export async function listCoaches({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.coaches);
  if (!cloud) return local;
  const ok = await tableExists('coaches');
  if (!ok) return local;
  const rows = await cloudQuery('coaches');
  return rows && rows.length ? rows : local;
}
export async function saveCoach(coach, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.coaches);
  const existing = coach.id ? local.find(c => c.id === coach.id) : null;
  const rec = {
    id: coach.id || localId(),
    name: coach.name || 'Entrenador',
    email: coach.email || '',
    phone: coach.phone || '',
    specialty: coach.specialty || '',
    bio: coach.bio || '',
    avatarUrl: coach.avatarUrl || '',
    active: coach.active !== false,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };
  const next = existing ? local.map(c => (c.id === existing.id ? rec : c)) : [rec, ...local];
  writeLocal(LS.coaches, next);
  if (cloud) {
    await supabase.from('coaches').upsert({
      id: rec.id, name: rec.name, email: rec.email, phone: rec.phone,
      specialty: rec.specialty, bio: rec.bio, avatar_url: rec.avatarUrl, active: rec.active,
    }, { onConflict: 'id' });
  }
  return rec;
}

export async function deleteCoach(id, { cloud = isSupabaseConfigured } = {}) {
  writeLocal(LS.coaches, readLocal(LS.coaches).filter(c => c.id !== id));
  if (cloud) await supabase.from('coaches').delete().eq('id', id);
}

// ---------- alumnos ----------
export async function listStudents({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.students);
  if (!cloud) return local;
  const ok = await tableExists('students');
  if (!ok) return local;
  const rows = await cloudQuery('students');
  return rows && rows.length ? rows : local;
}

export async function addStudent(student, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.students);
  const existing = student.id ? local.find(s => s.id === student.id) : null;
  const rec = {
    id: student.id || localId(),
    name: student.name || 'Alumno',
    email: student.email || '',
    phone: student.phone || '',
    birthdate: student.birthdate || null,
    level: student.level || 'BEGINNER',
    ageGroup: student.ageGroup || 'adults',
    guardianName: student.guardianName || '',
    guardianEmail: student.guardianEmail || '',
    guardianPhone: student.guardianPhone || '',
    guardianAuthorized: !!student.guardianAuthorized || student.ageGroup === 'adults',
    notes: student.notes || '',
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };
  const next = existing ? local.map(s => (s.id === existing.id ? rec : s)) : [rec, ...local];
  writeLocal(LS.students, next);
  if (cloud) {
    await supabase.from('students').upsert({
      id: rec.id, name: rec.name, email: rec.email, phone: rec.phone, birthdate: rec.birthdate,
      level: rec.level, age_group: rec.ageGroup, guardian_name: rec.guardianName,
      guardian_email: rec.guardianEmail, guardian_phone: rec.guardianPhone,
      guardian_authorized: rec.guardianAuthorized, notes: rec.notes,
    }, { onConflict: 'id' });
  }
  return rec;
}

export async function deleteStudent(id, { cloud = isSupabaseConfigured } = {}) {
  writeLocal(LS.students, readLocal(LS.students).filter(s => s.id !== id));
  writeLocal(LS.members, readLocal(LS.members).filter(m => m.studentId !== id));
  if (cloud) {
    await supabase.from('students').delete().eq('id', id);
    await supabase.from('group_members').delete().eq('student_id', id);
  }
}

// ---------- grupos ----------
export async function listGroups({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.groups);
  if (!cloud) return local;
  const ok = await tableExists('groups');
  if (!ok) return local;
  const rows = await cloudQuery('groups');
  return rows && rows.length ? rows : local;
}

export async function addGroup(group, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.groups);
  const existing = group.id ? local.find(g => g.id === group.id) : null;
  const rec = {
    id: group.id || localId(),
    name: group.name || 'Grupo nuevo',
    category: group.category || 'adults',
    level: group.level || 'BEGINNER',
    capacity: group.capacity || 8,
    coachId: group.coachId || null,
    schedule: group.schedule || '',
    active: group.active !== false,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };
  const next = [rec, ...local.filter(g => g.id !== existing?.id)];
  writeLocal(LS.groups, next);
  if (cloud) {
    await supabase.from('groups').upsert({
      id: rec.id, name: rec.name, category: rec.category, level: rec.level,
      capacity: rec.capacity, coach_id: rec.coachId, schedule: rec.schedule, active: rec.active,
    }, { onConflict: 'id' });
  }
  return rec;
}

export async function deleteGroup(id, { cloud = isSupabaseConfigured } = {}) {
  writeLocal(LS.groups, readLocal(LS.groups).filter(g => g.id !== id));
  writeLocal(LS.members, readLocal(LS.members).filter(m => m.groupId !== id));
  if (cloud) {
    await supabase.from('groups').delete().eq('id', id);
    await supabase.from('group_members').delete().eq('group_id', id);
  }
}

// ---------- miembros de grupo ----------
export async function listMembers({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.members);
  if (!cloud) return local;
  const ok = await tableExists('group_members');
  if (!ok) return local;
  const rows = await cloudQuery('group_members');
  return rows && rows.length ? rows : local;
}

export async function addMember(groupId, studentId, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.members);
  if (local.some(m => m.groupId === groupId && m.studentId === studentId)) return;
  const rec = { id: localId(), groupId, studentId, joinedOn: new Date().toISOString().slice(0, 10) };
  writeLocal(LS.members, [rec, ...local]);
  if (cloud) await supabase.from('group_members').insert({ group_id: groupId, student_id: studentId });
}

export async function removeMember(groupId, studentId, { cloud = isSupabaseConfigured } = {}) {
  writeLocal(LS.members, readLocal(LS.members).filter(m => !(m.groupId === groupId && m.studentId === studentId)));
  if (cloud) await supabase.from('group_members').delete().eq('group_id', groupId).eq('student_id', studentId);
}

// ---------- clases ----------
export async function listClasses({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.classes);
  if (!cloud) return local;
  const ok = await tableExists('classes');
  if (!ok) return local;
  const rows = await cloudQuery('classes');
  return rows && rows.length ? rows : local;
}

export async function addClass(cls, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.classes);
  const existing = cls.id ? local.find(c => c.id === cls.id) : null;
  const rec = {
    id: cls.id || localId(),
    groupId: cls.groupId || null,
    coachId: cls.coachId || null,
    courtName: cls.courtName || '',
    startsOn: cls.startsOn || new Date().toISOString(),
    durationMin: cls.durationMin || 60,
    location: cls.location || '',
    status: cls.status || 'planned',
    price: cls.price == null ? null : Number(cls.price),
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
  };
  const next = [rec, ...local.filter(c => c.id !== rec.id)];
  writeLocal(LS.classes, next);
  if (cloud) {
    await supabase.from('classes').upsert({
      id: rec.id, group_id: rec.groupId, coach_id: rec.coachId, court_name: rec.courtName,
      starts_on: rec.startsOn, duration_min: rec.durationMin, location: rec.location,
      status: rec.status, price: rec.price,
    }, { onConflict: 'id' });
  }
  return rec;
}

export async function updateClassStatus(id, status, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.classes);
  writeLocal(LS.classes, local.map(c => (c.id === id ? { ...c, status } : c)));
  if (cloud) await supabase.from('classes').update({ status }).eq('id', id);
}

// ---------- asistencia ----------
export async function recordAttendance(classId, studentId, attended, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.attendance);
  const existing = local.find(a => a.classId === classId && a.studentId === studentId);
  const rec = { id: existing ? existing.id : localId(), classId, studentId, attended, recovered: existing ? existing.recovered : false, notes: existing ? existing.notes : '' };
  const next = existing ? local.map(a => (a.id === existing.id ? rec : a)) : [rec, ...local];
  writeLocal(LS.attendance, next);
  if (cloud) {
    await supabase.from('class_attendance').upsert({
      class_id: classId, student_id: studentId, attended, recovered: rec.recovered, notes: rec.notes,
    }, { onConflict: 'class_id,student_id' });
  }
  return rec;
}

export async function listAttendanceByClass(classId, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.attendance).filter(a => !classId || classId === '__all__' || a.classId === classId);
  if (!cloud) return local;
  const ok = await tableExists('class_attendance');
  if (!ok) return local;
  const rows = await cloudQuery('class_attendance');
  return rows && rows.length ? rows.filter(a => !classId || classId === '__all__' || a.classId === classId) : local;
}

// ---------- evaluaciones ----------
export async function listEvaluations({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.evals);
  if (!cloud) return local;
  const ok = await tableExists('student_evaluations');
  if (!ok) return local;
  const rows = await cloudQuery('student_evaluations');
  return rows && rows.length ? rows : local;
}

export async function addEvaluation(ev, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.evals);
  const rec = {
    id: ev.id || localId(),
    studentId: ev.studentId, coachId: ev.coachId || null, evaluatedOn: ev.evaluatedOn || new Date().toISOString().slice(0, 10),
    technical: ev.technical || 0, tactical: ev.tactical || 0, movement: ev.movement || 0, mental: ev.mental || 0,
    level: ev.level || '', notes: ev.notes || '',
  };
  writeLocal(LS.evals, [rec, ...local]);
  if (cloud) {
    await supabase.from('student_evaluations').insert({
      student_id: rec.studentId, coach_id: rec.coachId, evaluated_on: rec.evaluatedOn,
      technical_score: rec.technical, tactical_score: rec.tactical, movement_score: rec.movement,
      mental_score: rec.mental, level: rec.level, notes: rec.notes,
    });
  }
  return rec;
}

// ---------- bonos de clases ----------
export async function listBonuses({ cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.bonuses);
  if (!cloud) return local;
  const ok = await tableExists('class_bonuses');
  if (!ok) return local;
  const rows = await cloudQuery('class_bonuses');
  return rows && rows.length ? rows : local;
}

export async function addBonus(bonus, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.bonuses);
  const rec = {
    id: localId(),
    studentId: bonus.studentId, description: bonus.description || 'Bono de clases',
    total: bonus.total || 0, used: 0, expiresOn: bonus.expiresOn || null,
  };
  writeLocal(LS.bonuses, [rec, ...local]);
  if (cloud) {
    await supabase.from('class_bonuses').insert({
      student_id: rec.studentId, description: rec.description,
      total_classes: rec.total, used_classes: rec.used, expires_on: rec.expiresOn,
    });
  }
  return rec;
}

export async function useBonus(id, { cloud = isSupabaseConfigured } = {}) {
  const local = readLocal(LS.bonuses);
  const next = local.map(b => (b.id === id ? { ...b, used: (b.used || 0) + 1 } : b));
  writeLocal(LS.bonuses, next);
  const rec = next.find(b => b.id === id);
  if (cloud) await supabase.from('class_bonuses').update({ used_classes: rec.used, total_classes: rec.total }).eq('id', id);
  return rec;
}

// Detecta si la tabla existe en la nube (para no depender solo de RLS)
let cloudTables = new Set();
async function tableExists(table) {
  if (cloudTables.has(table)) return true;
  try {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error) return false;
    cloudTables.add(table);
    return true;
  } catch {
    return false;
  }
}

// ---------- estadísticas de la escuela ----------
export function schoolStats({ students, groups, classes, attendance, bonuses }) {
  const activeGroups = (groups || []).filter(g => g.active).length;
  const planned = (classes || []).filter(c => c.status === 'planned' && new Date(c.startsOn) > new Date()).length;
  const done = (classes || []).filter(c => c.status === 'done').length;
  const attendedCount = (attendance || []).filter(a => a.attended).length;
  const attendanceRate = (attendance || []).length
    ? Math.round((attendedCount / (attendance || []).length) * 100)
    : 0;
  const minors = (students || []).filter(s => s.ageGroup === 'kids' || s.ageGroup === 'teens').length;
  const available = (bonuses || []).reduce((acc, b) => acc + ((b.total || 0) - (b.used || 0)), 0);
  return {
    students: (students || []).length,
    activeGroups,
    classes: (classes || []).length,
    planned,
    done,
    attendanceRate,
    minors,
    bonusAvailable: available,
  };
}