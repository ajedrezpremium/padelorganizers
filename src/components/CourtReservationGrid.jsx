import React from 'react';

const I18N = {
  es: {
    gridTitle: 'Reservas de pista',
    gridSub: 'Elige pista y hora en el cuadrante, como en Playtomic',
    avail: 'Disponible', occ: 'Ocupado', mine: 'Tu reserva',
    day: 'Día', opening: 'Horario de apertura', until: 'hasta',
    amenities: 'Servicios', price: '€ / hora',
    offer: 'Oferta de prepago', offerBody: 'Recarga 50 € y recibe 5 € de bono (válido de 9:00 a 16:00)',
    offerCta: 'Apuntarme', offerDone: '✓ Bono registrado',
    night: 'Noche', prime: 'Prime', valley: 'Valle',
    indoor: 'Cubierta', glass: 'Cristal', panorama: 'Panorámica',
    weekday: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
  },
  en: {
    gridTitle: 'Court booking',
    gridSub: 'Pick a court and time on the grid, just like Playtomic',
    avail: 'Available', occ: 'Booked', mine: 'Your booking',
    day: 'Day', opening: 'Opening hours', until: 'to',
    amenities: 'Amenities', price: '€ / hour',
    offer: 'Prepaid offer', offerBody: 'Top up 50 € and get 5 € bonus (valid 9am–4pm)',
    offerCta: 'Sign me up', offerDone: '✓ Bonus registered',
    night: 'Night', prime: 'Prime', valley: 'Valley',
    indoor: 'Indoor', glass: 'Glass', panorama: 'Panoramic',
    weekday: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  },
  fr: {
    gridTitle: 'Réservation de pistes',
    gridSub: 'Choisissez piste et heure sur la grille, comme Playtomic',
    avail: 'Disponible', occ: 'Occupé', mine: 'Votre réservation',
    day: 'Jour', opening: 'Horaires d\'ouverture', until: 'à',
    amenities: 'Services', price: '€ / heure',
    offer: 'Offre prépayée', offerBody: 'Rechargez 50 € et recevez 5 € de bonus (valable 9h–16h)',
    offerCta: 'M\'inscrire', offerDone: '✓ Bonus enregistré',
    night: 'Nuit', prime: 'Prime', valley: 'Creux',
    indoor: 'Couverte', glass: 'Verre', panorama: 'Panoramique',
    weekday: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
  },
  pt: {
    gridTitle: 'Reserva de campos',
    gridSub: 'Escolha campo e hora no quadrante, como no Playtomic',
    avail: 'Disponível', occ: 'Ocupado', mine: 'A sua reserva',
    day: 'Dia', opening: 'Horário de abertura', until: 'até',
    amenities: 'Comodidades', price: '€ / hora',
    offer: 'Oferta pré-paga', offerBody: 'Carregue 50 € e receba 5 € de bónus (válido 9h–16h)',
    offerCta: 'Registar', offerDone: '✓ Bónus registado',
    night: 'Noite', prime: 'Prime', valley: 'Vazio',
    indoor: 'Coberto', glass: 'Vidro', panorama: 'Panorâmica',
    weekday: ['Do', 'Se', 'Te', 'Qu', 'Qi', 'Se', 'Sá'],
  },
};

const BASE_PRICE = 8;
const COURT_MULT = [1.25, 0.75, 1, 1];
const COURT_META = [
  { indoor: true, glass: false, panorama: true },
  { indoor: false, glass: true, panorama: false },
  { indoor: true, glass: false, panorama: false },
  { indoor: true, glass: true, panorama: false },
];
const AMENITIES = [
  { icon: '📶', key: 'wifi' }, { icon: '🅿️', key: 'parking' },
  { icon: '🚿', key: 'locker' }, { icon: '☕', key: 'cafe' },
  { icon: '🏓', key: 'gear' }, { icon: '♿', key: 'ada' },
];
const AMEN_LABEL = {
  wifi: { es: 'WiFi', en: 'WiFi', fr: 'WiFi', pt: 'WiFi' },
  parking: { es: 'Parking', en: 'Parking', fr: 'Parking', pt: 'Parque' },
  locker: { es: 'Vestuarios', en: 'Changing rooms', fr: 'Vestiaires', pt: 'Balneários' },
  cafe: { es: 'Cafetería', en: 'Café', fr: 'Café', pt: 'Cafetaria' },
  gear: { es: 'Alquiler de material', en: 'Equipment rental', fr: 'Location de matériel', pt: 'Aluguer de material' },
  ada: { es: 'Acceso adaptado', en: 'Accessible access', fr: 'Accès adapté', pt: 'Acesso adaptado' },
};

function slotPrice(hour, courtIdx) {
  const h = parseInt(hour, 10);
  const courtMult = COURT_MULT[courtIdx] || 1;
  let timeMult = 1;
  if (h < 18) timeMult = 0.85;
  else if (h >= 20) timeMult = 1.3;
  return Math.round(BASE_PRICE * courtMult * timeMult);
}

export { slotPrice };

function nextDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function CourtReservationGrid({ lang = 'es', courts = [], bookings = [], selectedCourt = 0, selectedDay = '', selectedSlot = '', onPick }) {
  const T = I18N[lang] || I18N.es;
  const days = nextDays(7);
  const hours = [];
  for (let h = 9; h <= 22; h++) hours.push(String(h).padStart(2, '0') + ':00');

  const occupied = (courtIdx, slot) =>
    bookings.some(b =>
      b.court_name === courts[courtIdx] &&
      b.day === selectedDay &&
      b.time_slot === slot &&
      b.status !== 'cancelled' &&
      b.status !== 'cancelled '
    );

  const premiumTag = (h) => {
    const hh = parseInt(h, 10);
    if (hh >= 20) return { label: T.night, color: '#fbbf24' };
    if (hh >= 18) return { label: T.prime, color: '#a3e635' };
    return { label: T.valley, color: '#38bdf8' };
  };

  return (
    <div style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '18px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>🗓️ {T.gridTitle}</h3>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{T.gridSub}</span>
        </div>
        <span style={{ fontSize: 12, color: '#84cc16', fontWeight: 700 }}>🕘 {T.opening}: 09:00 {T.until} 23:00</span>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '10px 0', fontSize: 11, color: '#94a3b8' }}>
        <span><b style={{ color: '#34d399' }}>▦</b> {T.avail}</span>
        <span><b style={{ color: '#f87171' }}>▦</b> {T.occ}</span>
        <span><b style={{ color: '#fbbf24' }}>▦</b> {T.mine}</span>
        <span style={{ marginLeft: 'auto' }}>
          {T.valley} <b style={{ color: '#38bdf8' }}>×0.85</b> · {T.prime} <b style={{ color: '#a3e635' }}>×1</b> · {T.night} <b style={{ color: '#fbbf24' }}>×1.3</b>
        </span>
      </div>

      {/* Selector de día */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
        {days.map(d => {
          const date = new Date(d + 'T12:00:00');
          const active = d === selectedDay;
          return (
            <button key={d} onClick={() => onPick && onPick(selectedCourt, selectedSlot, d)}
              style={{ flexShrink: 0, padding: '8px 12px', borderRadius: 10, border: active ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)', background: active ? 'rgba(16,185,129,0.14)' : 'rgba(255,255,255,0.03)', color: active ? '#a3e635' : '#cbd5e1', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              {T.weekday[date.getDay()]} {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Grid pistas × horas */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 720 }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: '#0e1e1b', padding: '6px 10px', textAlign: 'left', fontSize: 11, color: '#94a3b8', minWidth: 56 }}>{T.day}</th>
              {courts.slice(0, 4).map((c, i) => (
                <th key={i} style={{ padding: '6px 10px', textAlign: 'center', fontSize: 12, color: selectedCourt === i ? '#a3e635' : '#e2e8f0', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>{c.split('·')[0].trim()}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b' }}>
                    {COURT_META[i]?.indoor && `🏠 ${T.indoor}`} {COURT_META[i]?.glass && `🪟 ${T.glass}`} {COURT_META[i]?.panorama && `👁 ${T.panorama}`}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(h => {
              const tag = premiumTag(h);
              return (
                <tr key={h}>
                  <td style={{ position: 'sticky', left: 0, background: '#0e1e1b', padding: '6px 10px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 800, color: '#e2e8f0', fontSize: 12 }}>{h}</span>
                    <div style={{ fontSize: 9, fontWeight: 700, color: tag.color }}>{tag.label}</div>
                  </td>
                  {courts.slice(0, 4).map((c, i) => {
                    const occ = occupied(i, h);
                    const mine = selectedCourt === i && selectedSlot === h;
                    const price = slotPrice(h, i);
                    const cell = {
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.02)',
                      color: '#94a3b8',
                      textAlign: 'center',
                      padding: '8px 4px',
                      fontSize: 11,
                      cursor: 'not-allowed',
                      fontWeight: 700,
                    };
                    if (occ) {
                      cell.background = 'rgba(244,63,94,0.10)';
                      cell.color = '#f87171';
                      cell.border = '1px solid rgba(244,63,94,0.25)';
                    } else {
                      cell.background = 'rgba(16,185,129,0.06)';
                      cell.color = '#34d399';
                      cell.cursor = 'pointer';
                    }
                    if (mine) {
                      cell.background = 'rgba(251,191,36,0.18)';
                      cell.border = '2px solid #fbbf24';
                      cell.color = '#fbbf24';
                      cell.cursor = 'pointer';
                    }
                    return (
                      <td key={i} style={{ padding: 4 }}>
                        <button
                          onClick={() => { if (!occ && onPick) onPick(i, h); }}
                          disabled={occ}
                          title={`${c} · ${h} · ${price} €`}
                          style={cell}>
                          {mine ? `⭐ ${T.mine}` : occ ? '✕' : `${price} €`}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Amenities */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 12, paddingTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>🛎️ {T.amenities}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {AMENITIES.map(a => (
            <span key={a.key} style={{ fontSize: 11, color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 10px' }}>
              {a.icon} {AMEN_LABEL[a.key][lang] || AMEN_LABEL[a.key].es}
            </span>
          ))}
        </div>
      </div>

      {/* Oferta prepago */}
      <div style={{ marginTop: 12, background: 'linear-gradient(135deg, rgba(251,191,36,0.10), rgba(251,191,36,0.03))', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 24 }}>🎁</div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>{T.offer}</div>
          <div style={{ fontSize: 12, color: '#cbd5e1' }}>{T.offerBody}</div>
        </div>
        <button style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#fbbf24', color: '#0f172a', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
          {T.offerCta}
        </button>
      </div>
    </div>
  );
}