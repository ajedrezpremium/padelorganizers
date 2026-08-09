import React, { useEffect, useState } from 'react';
import { listReservations, addReservation, markReservationStatus, SLOTS, clubOnline } from '../services/clubService';
import { addSplit, listSplits, markSplitPaidLocal } from '../services/splitService';
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
    splitToggle: 'Dividir pago entre jugadores', splitHint: 'Cada jugador recibe su propio link de pago (parte igual).',
    player: 'Jugador', addPlayer: 'Añadir jugador', removePlayer: 'Quitar',
    splitPayments: 'Links de pago por jugador', copy: 'Copiar', copied: '✓ Copiado',
    paid: 'Pagado', waiting: 'Pendiente', allPaid: '¡Todos pagaron! Reserva confirmada 🎉',
    simulatePaid: 'Simular pago',
    payWith: 'Método de pago', stripe: 'Tarjeta', paypal: 'PayPal',
  },
  en: {
    title: '🏟️ Club Booking App', sub: 'Book courts and pay online in seconds',
    pickCourt: 'Choose court', pickDay: 'Choose day', pickSlot: 'Choose time',
    courts: ['Court 1 · Centre', 'Court 2 · Premium', 'Court 3 · Covered', 'Court 4 · Covered'],
    myBookings: 'My bookings', empty: 'No bookings yet.', success: 'Payment complete!',
    splitToggle: 'Split the payment between players', splitPlayers: 'Each player gets their own payment link (equal share).',
    playerName: 'Player', addPlayer: 'Add player', removePlayer: 'Remove',
    splitPayments: 'Payment links per player', copy: 'Copy', copied: '✓ Copied',
    paid: 'Paid', waiting: 'Pending', allPaid: 'Everyone paid! Booking complete 🎉',
    simulatePaid: 'Simulate payment',
    payWith: 'Payment method', stripe: 'Card', paypal: 'PayPal',
  },
  fr: {
    title: '🏫️ App Club de réservation', sub: 'Réservez des pistes et payez en ligne en un clin',
    pickCourt: 'Choisir la piste', pickDay: 'Choisir le jour', pickSlot: 'Choisir l\'heure',
    courts: ['Piste 1 · Centre', 'Piste 2 · Premium', 'Piste 3 · Couverte', 'Piste 4 · Couverte'],
    myBookings: 'Mes réservations', empty: 'Aucune réservation.', price: '€ / h',
    splitToggle: 'Diviser le paiement entre joueurs', splitPlayers: 'Chaque joueur reçoit son lien de paiement (part égale).',
    playerName: 'Joueur', addPlayer: 'Ajouter un joueur', removePlayer: 'Retirer',
    splitPayments: 'Liens de paiement par joueur', copy: 'Copier', copied: '✓ Copié',
    paid: 'Payé', waiting: 'En attente', allPaid: 'Tous payés ! Réservation complète 🎉',
    simulatePaid: 'Simuler le paiement',
    payWith: 'Moyen de paiement', stripe: 'Carte', paypal: 'PayPal',
  },
  pt: {
    title: '🏫 App Clube de Reservas', sub: 'Reserve campos e pague online em segundos',
    pickCourt: 'Escolha o campo', pickDay: 'Escolha o dia', pickSlot: 'Escolha a hora',
    courts: ['Campo 1 · Central', 'Campo 2 · Premium', 'Campo 3 · Coberto', 'Campo 4 · Coberto'],
    myBookings: 'As minhas reservas', empty: 'Ainda não tem reservas.', price: '€ / h',
    splitToggle: 'Dividir o pagamento entre jogadores', splitPlayers: 'Cada jogador recebe o seu link de pagamento (parte igual).',
    playerName: 'Jogador', addPlayer: 'Adicionar jogador', removePlayer: 'Remover',
    splitPayments: 'Links de pagamento por jogador', copy: 'Copiar', copied: '✓ Copiado',
    paid: 'Pago', waiting: 'Pendente', allPaid: 'Todos pagaram! Reserva completa 🎉',
    simulatePaid: 'Simular pagamento',
    payWith: 'Método de pagamento', stripe: 'Cartão', paypal: 'PayPal',
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
  const [splitOn, setSplitOn] = useState(false);
  const [players, setPlayers] = useState([{ name, email }]);
  const [splits, setSplits] = useState([]);
  const [gateway, setGateway] = useState('stripe'); // stripe | paypal

  useEffect(() => { listReservations().then(handleReturn).then(setBookings); }, []);
  useEffect(() => { listSplits().then(setSplits); }, []);

  // Al volver de Stripe (?status=success) confirma la reserva pendiente del slot pagado.
  async function handleReturn(list) {
    const params = new URLSearchParams(window.location.search);
    // PayPal: al volver trae ?status=success&token=ORDERID → capturamos y confirmamos.
    const ppToken = params.get('token');
    if (params.get('status') === 'success' && ppToken && params.get('split') !== '1') {
      try {
        await fetch('/api/paypal-capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: ppToken }),
        });
      } catch { /* noop */ }
      const slot = params.get('slot');
      const target = list.find(b => b.status === 'pending' && (!slot || b.time_slot === slot));
      if (target) {
        await markReservationStatus(target.id, 'completed');
        return list.map(b => (b.id === target.id ? { ...b, status: 'completed' } : b));
      }
      return list;
    }
    if (params.get('status') !== 'success') return list;
    // Para pagos divididos NO se auto-completa: el webhook completa la reserva
    // cuando TODOS los jugadores han pagado.
    if (params.get('split') === '1') {
      refreshSplits();
      return list;
    }
    const slot = params.get('slot');
    const target = list.find(b => b.status === 'pending' && (!slot || b.time_slot === slot));
    if (!target) return list;
    await markReservationStatus(target.id, 'completed');
    return list.map(b => (b.id === target.id ? { ...b, status: 'completed' } : b));
  }

  const refreshSplits = async () => setSplits(await listSplits());

  const checkout = async () => {
    setMsg('');
    if (!name.trim() || !email.trim()) { setMsg(T.required); return; }
    if (!slotSel) { setMsg(T.required); return; }
    if (splitOn) {
      const all = [{ name: name.trim(), email: email.trim() }, ...players.slice(1).filter(p => p && p.name.trim() && p.email.trim())];
      if (all.length < 2) { setMsg(T.splitHint); return; }
      setBusy(true);
      setMsg(T.checkout);
      try {
        if (gateway === 'paypal') {
          const r = await fetch('/api/paypal-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ court_name: T.courts[courtSel], day: daySel, slot_time: slotSel, amount: PRICE, players: all, split: true }),
          });
          const pay = await r.json();
          if (pay.error) { setMsg(pay.error); setBusy(false); return; }
          // Reserva única + N splits (uno por jugador), cada uno con su PayPal order.
          const status = pay.demo ? 'confirmed' : 'pending';
          const booking = await addReservation({
            court_name: T.courts[courtSel], day: daySel, time_slot: slotSel,
            player_name: all[0].name, player_email: all[0].email, user_id: user?.id || null,
            price: PRICE, currency: 'eur', status, payment_method: 'paypal',
            paypal_order: pay.demo ? null : pay.payments[0].id,
          });
          for (const p of pay.payments) {
            await addSplit({
              reservation_id: booking.id,
              split_index: p.index,
              total_splits: pay.payments.length,
              player_name: p.name, player_email: p.email,
              amount_eur: p.amount,
              status: pay.demo ? 'paid' : 'pending',
              payment_method: 'paypal',
              paypal_order: p.id,
              payment_url: p.url,
            });
            if (pay.demo) {
              await markSplitPaidLocal({ ...p, id: `pp-${p.index}` });
            }
          }
          setPlayers([{ name: name.trim(), email: email.trim() }]);
          setBookings(await listReservations());
          await refreshSplits();
          if (pay.demo) setMsg(T.allPaid);
          else setMsg(T.splitPayments);
          setBusy(false);
          return;
        }
        const r = await fetch('/api/split', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ court_name: T.courts[courtSel], day: daySel, slot_time: slotSel, amount: PRICE, players: all }),
        });
        const pay = await r.json();
        if (pay.error) { setMsg(pay.error); setBusy(false); return; }
        // Reserva única + N splits (uno por jugador)
        const status = pay.demo ? 'confirmed' : 'pending';
        const booking = await addReservation({
          court_name: T.courts[courtSel], day: daySel, time_slot: slotSel,
          player_name: all[0].name, player_email: all[0].email, user_id: user?.id || null,
          price: PRICE, currency: 'eur', status, stripe_session: pay.demo ? null : pay.payments[0].sessionId,
        });
        for (const p of pay.payments) {
          await addSplit({
            reservation_id: booking.id,
            split_index: p.index,
            total_splits: pay.payments.length,
            player_name: p.name, player_email: p.email,
            amount_eur: p.amount,
            status: pay.demo ? 'paid' : 'pending',
            stripe_session: p.sessionId,
          });
        }
        setPlayers([{ name: name.trim(), email: email.trim() }]);
        setBookings(await listReservations());
        await refreshSplits();
        if (pay.demo) setMsg(T.allPaid);
        else { /* el organizador compartirá los links */ setMsg(T.splitPayments); }
      } catch (e) {
        setMsg(T.required);
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    setMsg(T.checkout);
    try {
      if (gateway === 'paypal') {
        const r = await fetch('/api/paypal-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ court_name: T.courts[courtSel], day: daySel, slot_time: slotSel, amount: PRICE }),
        });
        const pay = await r.json();
        if (pay.error) { setMsg(pay.error); setBusy(false); return; }
        const status = pay.demo ? 'confirmed' : 'pending';
        await addReservation({
          court_name: T.courts[courtSel], day: daySel, time_slot: slotSel,
          player_name: name, player_email: email, user_id: user?.id || null,
          price: PRICE, currency: 'eur', status, payment_method: 'paypal',
          paypal_order: pay.demo ? null : pay.id,
          stripe_session: null,
        });
        setBookings(await listReservations());
        if (pay.demo) {
          setMsg(T.confirmed);
        } else if (pay.url) {
          window.location.href = pay.url;
        }
      } else {
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

          {/* Split payments: toggle + jugadores extra */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={splitOn} onChange={e => setSplitOn(e.target.checked)} />
            <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 700 }}>{T.splitToggle}</span>
          </label>
          {splitOn && (
            <div style={{ color: '#94a3b8', fontSize: 12, margin: '6px 0 0' }}>{T.splitHint}</div>
          )}
          {splitOn && players.slice(1).map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginTop: 8 }} >
              <input value={p.name} onChange={e => { const next = [...players]; next[i + 1] = { ...next[i + 1], name: e.target.value }; setPlayers(next); }} placeholder={`${T.player} ${i + 2} · nombre`} style={miniInput} />
              <input value={p.email} onChange={e => { const next = [...players]; next[i + 1] = { ...next[i + 1], email: e.target.value }; setPlayers(next); }} type="email" placeholder={`${T.player} ${i + 2} · email`} style={{ ...miniInput, flex: 1.4 }} />
              <button onClick={() => setPlayers(players.filter((_, j) => j !== i + 1))} style={ghostBtn} title={T.removePlayer}>✕</button>
            </div>
          ))}
          {splitOn && players.length < 4 && (
            <button onClick={() => setPlayers([...players, { name: '', email: '' }])} style={ghostBtnBig}>
              ➕ {T.addPlayer}
            </button>
          )}

          {msg && <p style={{ fontSize: 13, color: '#84cc16', margin: '4px 0' }}>{msg}</p>}

          {/* Selector de pasarela de pago */}
          <label style={{ ...labelStyle, marginTop: 14 }}>{T.payWith}</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => setGateway('stripe')} style={{ padding: '10px', borderRadius: '10px', border: gateway === 'stripe' ? '2px solid #635bff' : '1px solid rgba(255,255,255,0.15)', background: gateway === 'stripe' ? 'rgba(99,91,255,0.15)' : 'rgba(255,255,255,0.03)', color: gateway === 'stripe' ? '#fff' : '#cbd5e1', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              💳 {T.stripe}
            </button>
            <button onClick={() => setGateway('paypal')} style={{ padding: '10px', borderRadius: '10px', border: gateway === 'paypal' ? '2px solid #ffc439' : '1px solid rgba(255,255,255,0.15)', background: gateway === 'paypal' ? 'rgba(255,196,57,0.12)' : 'rgba(255,255,255,0.03)', color: gateway === 'paypal' ? '#ffc439' : '#cbd5e1', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              🅿️ {T.paypal}
            </button>
          </div>

          <button onClick={checkout} disabled={busy}
            style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', background: busy ? '#64748b' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', marginTop: 8 }}>
            {busy ? '…' : splitOn ? `💳 Reservar · ${PRICE} € (${players.filter(pl => pl.name.trim() && pl.email.trim()).length} jug.)` : `💳 Reservar · ${PRICE} €`}
          </button>

          {/* Panel: links de pago por jugador */}
          {splitOn && splits.length > 0 && (
            <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>🔗 {T.splitPayments}</div>
              {splits.filter(s => s.status !== 'paid' || true).slice(0, 8).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ flex: 1, fontSize: 12, color: '#cbd5e1' }}>
                    <b>{s.player_name}</b>
                    <div style={{ color: s.status === 'paid' ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
                      {s.status === 'paid' ? '✅ ' + T.paid : '⏳ ' + T.waiting} · {Number(s.amount_eur).toFixed(2)} €
                    </div>
                  </div>
                  {(s.payment_url || s.url) && s.status !== 'paid' && (
                    <button onClick={() => navigator.clipboard.writeText(s.payment_url || s.url)} style={ghostBtn}>
                      🔗 {T.copy} {s.payment_method !== 'paypal' ? '' : 'PP'}
                    </button>
                  )}
                  {!s.payment_url && !s.url && s.status !== 'paid' && (
                    <button onClick={async () => { await markSplitPaidLocal(s); await refreshSplits(); }} style={ghostBtn}>
                      {T.simulatePaid}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
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
const miniInput = { flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 12, boxSizing: 'border-box', minWidth: 0 };
const ghostBtn = { padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)', color: '#a3e635', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' };
const ghostBtnBig = { marginTop: 8, padding: '9px 12px', borderRadius: '8px', border: '1px dashed rgba(16,185,129,0.4)', background: 'transparent', color: '#34d399', fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%' };