import React, { useEffect, useState } from 'react';
import { listReservations, addReservation, SLOTS, clubOnline } from '../services/clubService';
import { useAuth } from '../hooks/useAuth';

const I18N = {
  es: {
    title: '🏟️ App Club de Pádel',
    subtitle: 'Reserva pistas y paga online en segundos',
    pickCourt: 'Elige pista', pickDay: 'Elige día', pickSlot: 'Elige hora',
    courts: ['Pista 1 · Central', 'Pista 2 · Promo', 'Pista 3 · Cubierta', 'Pista 4 · Cubierta 2'],
    price: 'Precio', book: 'Reservar y pagar', name: 'Tu nombre', email: 'Tu email',
    required: 'Completa nombre, email, pista, día y hora.', checkout: 'Procesando pago…',
    confirmed: 'Reserva confirmada 🎉', successTitle: '¡Pago completado!',
    pending: 'Confirmando…', myBookings: 'Mis reservas', empty: 'Todavía no tienes reservas.',
    slotTaken: 'Ocupado', slotFree: 'Disponible',
  },
  en: {
    title: '🏟️ Club Booking App', sub: 'Book courts and pay online in seconds',
    pickCourt: 'Choose court', pickDay: 'Choose day', pickSlot: 'Choose time',
    courts: ['Court 1 · Centre', 'Court 2 · Premium', 'Court 3 · Covered', 'Court 4 · Covered'],
    myBookings: 'My bookings', empty: 'No bookings yet.', success: 'Payment complete!',
  },
  fr: {
    title: '🏟️ App Club de réservation', sub: 'Réservez des pistes et payez en ligne en un clin',
    pickCourt: 'Choisir la piste', pickDay: 'Choisir le jour', pickSlot: 'Choisir l\'heure',
    courts: ['Piste 1 · Centre', 'Piste 2 · Premium', 'Piste 3 · Couverte', 'Piste 4 · Couverte'],
    myBookings: 'Mes réservations', empty: 'Aucune réservation.', price: '€ / h',
  },
  pt: {
    title: '🏟️ App Clube de Reservas', sub: 'Reserve campos e pague online em segundos',
    pickCourt: 'Escolha o campo', pickDay: 'Escolha o dia', pickSlot: 'Escolha a hora',
    courts: ['Campo 1 · Central', 'Campo 2 · Premium', 'Campo 3 · Coberto', 'Campo 4 · Coberto'],
    myBookings: 'As minhas reservas', empty: 'Ainda não tem reservas.', price: '€ / h',
  },
};

const UTC_DAY = 8; // fecha de demostración (fija para demo)

export default function ClubApp({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const { user } = useAuth();
  const [courtSel, setCourtSel] = useState(0);
  const [daySel, setDaySel] = useState(demoDate());
  const [slotSel, setSlotSel] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [online] = useState(clubOnline());
  const PRICE = 8;

  useEffect(() => { listReservations().then(setBookings); }, []);

  const checkout = async () => {
    setMsg('');
    if (!name.trim() || !email.trim()) { setMsg(T.required); return; }
    if (!slotSel) { setMsg(T.required); return; }
    setBusy(true);
    setMsg(T.checkout);
    try {
      // Intenta pasarela Stripe (o demo)
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ court_name: T.courts[courtSel], day: daySel, slot_time: slotSel, amount: PRICE }),
      });
      const pay = await r.json();
      // Guardamos la reserva (status según demo/real)
      const status = pay.demo ? 'confirmed' : 'pending';
      await addReservation({
        court_name: T.courts[courtSel], day: daySel, time_slot: slotSel,
        player_name: name, player_email: email, user_id: user?.id || null,
        price: PRICE, currency: 'eur', status, stripe_session: pay.sessionId || null,
      });
      setBookings(await listReservations());
      if (pay.demo) {
        setMsg(T.confirmed);
      } else if (pay.url) {
        window.location.href = pay.url;
      }
    } catch (e) {
      setMsg(T.required);
    } finally {
      setBusy(false);
    }
  };

  const bookingStatus = (b) =>
    b.status === 'confirmed' ? '✅ ' + (T.confirmed) : b.status === 'completed' ? '💳 ' + T.successTitle : '⏳ ' + T.pending;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{T.title}</h2>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>{T.sub}</span>
        </div>
        <span style={{ fontSize: '12px', color: online ? '#84cc16' : '#fbbf24', fontWeight: 700 }}>
          {online ? '🟢 Nube' : '🟡 Local'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Form de reserva */}
        <div style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '22px' }}>
          <label style={labelStyle}>{T.pickCourt}</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {T.courts.slice(0, 4).map((c, i) => (
              <button key={i} onClick={() => setCourtSel(i)} style={{ padding: '10px', borderRadius: '10px', border: courtSel === i ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)', background: courtSel === i ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)', color: courtSel === i ? '#a3e635' : '#cbd5e1', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>

          <label style={{ ...labelStyle, marginTop: 16 }}>{T.pickDay}</label>
          <button onClick={() => setDaySel(demoDate())} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            📅 {daySel}
          </button>

          <label style={{ ...labelStyle, marginTop: 16 }}>{T.pickSlot} · <b style={{ color: '#84cc16' }}>{PRICE} €</b></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {SLOTS.map(s => {
              const occ = occupiedByOther(s);
              return (
                <button key={s} disabled={occ} onClick={() => setSlotSel(s)}
                  style={{ padding: '10px', borderRadius: '10px', border: slotSel === s ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)', background: slotSel === s ? 'rgba(16,185,129,0.15)' : occ ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.03)', color: slotSel === s ? '#a3e635' : occ ? '#f87171' : '#cbd5e1', fontWeight: 700, fontSize: 13, cursor: occ ? 'not-allowed' : 'pointer' }}>
                  {s} {occ ? '· Ocupado' : ''}
                </button>
              );
            })}
          </div>

          <input value={name} onChange={e => setName(e.target.value)} placeholder={T.name}
            style={inputStyle} />
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder={T.email}
            style={inputStyle} />

          {msg && <p style={{ fontSize: 13, color: '#84cc16', margin: '4px 0' }}>{msg}</p>}

          <button onClick={checkout} disabled={busy}
            style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', background: busy ? '#64748b' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', marginTop: 8 }}>
            {busy ? '…' : `💳 Reservar · ${PRICE} €`}
          </button>
        </div>

        {/* Mis reservas */}
        <div style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '22px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 14px' }}>📅 {T.myBookings}</h3>
          {bookings.length === 0 && <p style={{ color: '#64748b', fontSize: 13 }}>{T.empty}</p>}
          {bookings.map(b => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0fdf4' }}>{b.court_name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{b.day} · {b.time_slot} · {b.player_name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#84cc16' }}>{b.price} €</div>
                <div style={{ fontSize: 11, color: b.status === 'confirmed' ? '#34d399' : '#fbbf24' }}>{bookingStatus(b)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  function occupiedByOther(slot) {
    const mine = bookings.find(b => b.court_name === T.courts[courtSel] && b.day === daySel && b.time_slot === slot && b.status !== 'cancelled');
    return !!mine;
  }
}

function demoDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

const labelStyle = { display: 'block', fontSize: '13px', color: '#94a3b8', fontWeight: 600, margin: '0 0 8px' };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14, marginTop: 10, boxSizing: 'border-box' };