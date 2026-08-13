import React, { useState, useEffect, useMemo } from 'react';
import { LEVEL_LABELS, listCoaches } from '../services/schoolService';
import { ensureCoachSeed, bookPrivateLesson, listBookings, levelIcon } from '../services/coachDiscoveryService';

const I18N = {
  es: {
    title: '👨‍🏫 Entrenadores del club',
    subtitle: 'Descubre a tu entrenador ideal y reserva una lección privada en segundos.',
    book: 'Reservar lección',
    bookingTitle: 'Reserva de lección privada',
    coach: 'Entrenador',
    specialty: 'Especialidad',
    level: 'Nivel',
    rate: 'Tarifa/h',
    date: 'Fecha y hora',
    court: 'Pista',
    price: 'Precio (€)',
    notes: 'Notas (opcional)',
    confirm: 'Confirmar reserva',
    cancel: 'Cancelar',
    booked: 'Lección reservada ✅',
    seeHere: 'Se verá en la agenda de la escuela y en el portal del alumno.',
    noCoaches: 'Aún no hay entrenadores. Añade el primero desde la escuela.',
    slotTaken: 'El entrenador ya tiene una lección a esa hora. Elige otra franja.',
    hourly: '€/h',
    search: 'Buscar entrenador…',
    allLevels: 'Todos los niveles',
    progDay: 'Volver al directorio',
    myBookings: 'Mis reservas',
    empty: 'Tu lección quedará registrada aquí.',
    lessonAt: 'el',
    withCoach: 'con',
  },
  en: {
    title: '👨‍🏫 Club coaches',
    subtitle: 'Find your ideal coach and book a private lesson in seconds.',
    book: 'Book lesson',
    bookingTitle: 'Private lesson booking',
    coach: 'Coach',
    specialty: 'Specialty',
    level: 'Level',
    rate: 'Rate/h',
    date: 'Date & time',
    court: 'Court',
    price: 'Price (€)',
    notes: 'Notes (optional)',
    confirm: 'Confirm booking',
    cancel: 'Cancel',
    booked: 'Lesson booked ✅',
    seeHere: 'It will appear in the school schedule and in the student portal.',
    noCoaches: 'No coaches yet. Add the first one from the school.',
    slotTaken: 'The coach already has a lesson at that time. Pick another slot.',
    hourly: '€/h',
    search: 'Search coach…',
    allLevels: 'All levels',
    progDay: 'Back to directory',
    myBookings: 'My bookings',
    empty: 'Your lesson will be recorded here.',
    lessonAt: 'on',
    withCoach: 'with',
  },
  fr: {
    title: '👨‍🏧 Entraîneurs du club',
    subtitle: 'Trouvez votre entraîneur idéal et réservez une leçon privée en quelques secondes.',
    book: 'Réserver leçon',
    bookingTitle: 'Leçon privée',
    coach: 'Entraîneur',
    specialty: 'Spécialité',
    level: 'Niveau',
    rate: 'Tarif/h',
    date: 'Date et heure',
    court: 'Piste',
    price: 'Prix (€)',
    notes: 'Notes (optionnel)',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    booked: 'Leçon réservée ✅',
    seeHere: 'Elle apparaîtra dans l\u2019agenda de l\u2019école et le portail élève.',
    noCoaches: 'Aucun entraîneur. Ajoutez le premier depuis l\u2019école.',
    slotTaken: 'L\u2019entraîneur a déjà une leçon à cette heure. Choisissez une autre plage.',
    hourly: '€/h',
    search: 'Rechercher entraîneur…',
    allLevels: 'Tous les niveaux',
    progDay: 'Retour au répertoire',
    myBookings: 'Mes réservations',
    empty: 'Votre leçon sera enregistrée ici.',
    lessonAt: 'le',
    withCoach: 'avec',
  },
  pt: {
    title: '👨‍🏫 Treinadores do clube',
    subtitle: 'Encontre o seu treinador ideal e reserve uma aula privada em segundos.',
    book: 'Reservar aula',
    bookingTitle: 'Reserva de aula privada',
    coach: 'Treinador',
    specialty: 'Especialidade',
    level: 'Nível',
    rate: 'Tarifa/h',
    date: 'Data e hora',
    court: 'Pista',
    price: 'Preço (€)',
    notes: 'Notas (opcional)',
    confirm: 'Confirmar reserva',
    cancel: 'Cancelar',
    booked: 'Aula reservada ✅',
    seeHere: 'Aparecerá na agenda da escola e no portal do aluno.',
    noCoaches: 'Ainda sem treinadores. Adicione o primeiro a partir da escola.',
    slotTaken: 'O treinador já tem uma aula nessa hora. Escolha outro horário.',
    hourly: '€/h',
    search: 'Pesquisar treinador…',
    allLevels: 'Todos os níveis',
    progDay: 'Voltar ao diretório',
    myBookings: 'As minhas reservas',
    empty: 'A sua aula será registada aqui.',
    lessonAt: 'em',
    withCoach: 'com',
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const inputStyle = { width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14, fontWeight: 600, boxSizing: 'border-box' };

export default function CoachDiscovery({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const LBL = LEVEL_LABELS(lang);

  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [selected, setSelected] = useState(null); // coach seleccionado para reservar
  const [form, setForm] = useState({ startsOn: '', courtName: 'Pista 1', price: '', notes: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [bookings, setBookings] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const seeded = await ensureCoachSeed();
      setCoaches(seeded.filter(c => c.active !== false));
      setBookings(listBookings());
    } catch { /* offline-first */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => coaches.filter(c => {
    const q = search.trim().toLowerCase();
    if (q && !`${c.name} ${c.specialty}`.toLowerCase().includes(q)) return false;
    if (levelFilter && c.level !== levelFilter) return false;
    return true;
  }), [coaches, search, levelFilter]);

  const openBooking = (coach) => {
    setSelected(coach);
    setForm({ startsOn: '', courtName: 'Pista 1', price: coach.hourlyRate || '', notes: '' });
    setMsg('');
  };

  const confirm = async () => {
    if (!form.startsOn) return;
    setBusy(true);
    try {
      await bookPrivateLesson({
        coach: selected,
        courtName: form.courtName,
        startsOn: form.startsOn,
        durationMin: 60,
        price: Number(form.price) || selected.hourlyRate || 40,
        notes: form.notes,
      });
      setMsg(T.booked + ' · ' + T.seeHere);
      setBookings(listBookings());
    } catch (e) {
      setMsg(T.slotTaken);
    }
    setBusy(false);
  };

  const levelColor = (lv) =>
    lv === 'PRO' ? '#fbbf24' : lv === 'ADVANCED' ? '#fb7185' : lv === 'INTERMEDIATE' ? '#38bdf8' : '#a3e635';

  return (
    <div style={{ padding: '26px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{T.title}</h2>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>{T.subtitle}</span>
        </div>
        <span style={{ fontSize: '12px', color: '#84cc16', fontWeight: 700 }}>{coaches.length} {T.withCoach} · {levelIcon('PRO')} Pro</span>
      </div>

      {/* Filtros */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10, marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={T.search} style={inputStyle} />
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={inputStyle}>
          <option value="">{T.allLevels}</option>
          {['PRO', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER'].map(lv => (
            <option key={lv} value={lv}>{LBL[lv]}</option>
          ))}
        </select>
      </div>

      {loading ? <p style={{ color: '#64748b' }}>⟳…</p> : coaches.length === 0 ? (
        <p style={{ color: '#64748b' }}>{T.noCoaches}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {filtered.map(c => (
            <div key={c.id} style={card}>
              <div style={{ fontSize: 34 }}>{levelIcon(c.level)}</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginTop: 6 }}>{c.name}</div>
              <div style={{ fontSize: '12px', color: '#a3e635', fontWeight: 700 }}>{LBL[c.level] || c.level}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: 4 }}>{c.specialty}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4, minHeight: 28 }}>{c.bio}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#84cc16' }}>
                  {c.hourlyRate ? `${c.hourlyRate}${T.hourly}` : '—'}
                </span>
                <button onClick={() => openBooking(c)} style={{
                  padding: '8px 14px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: 13,
                  background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', cursor: 'pointer',
                }}>
                  {T.book}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de reserva */}
      {selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ ...card, width: 'min(460px, 92vw)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>{T.bookingTitle}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '13px', color: '#a3e635', fontWeight: 700 }}>{T.coach}: {selected.name}</p>

            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginBottom: 6 }}>{T.date}</label>
            <input type="datetime-local" value={form.startsOn} onChange={e => setForm({ ...form, startsOn: e.target.value })} style={inputStyle} />

            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 700, margin: '12px 0 6px' }}>{T.court}</label>
            <select value={form.courtName} onChange={e => setForm({ ...form, courtName: e.target.value })} style={inputStyle}>
              {['Pista 1', 'Pista 2', 'Pista 3', 'Pista 4'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 700, margin: '12px 0 6px' }}>{T.price}</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder={String(selected.hourlyRate || 40)} style={inputStyle} />

            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: 700, margin: '12px 0 6px' }}>{T.notes}</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />

            <button onClick={confirm} disabled={busy || !form.startsOn} style={{
              width: '100%', marginTop: 16, padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: 14,
              background: busy ? '#64748b' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', cursor: 'pointer',
            }}>
              {busy ? '…' : `✅ ${T.confirm}`}
            </button>
            {msg && <p style={{ fontSize: '12.5px', color: msg.includes(T.booked) ? '#84cc16' : '#f87171', marginTop: 12 }}>{msg}</p>}
          </div>
        </div>
      )}

      {/* Mis reservas */}
      <div style={{ ...card, marginTop: 18 }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>🎫 {T.myBookings}</h3>
        {bookings.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13 }}>{T.empty}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bookings.slice().reverse().map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--padel-bg)', borderRadius: 10, padding: '8px 12px', flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#f0fdf4' }}>
                  {new Date(b.startsOn).toLocaleString(lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-PT' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{T.withCoach} {b.coachName} · {b.courtName}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#84cc16' }}>{b.price}€</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}