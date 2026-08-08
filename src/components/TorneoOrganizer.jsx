import React from 'react';
import { useNavigate } from 'react-router-dom';

const I18N = {
  es: {
    badge: '+ TORNEO',
    title: 'Organiza un torneo de pádel pro',
    subtitle: 'Convierte cada semana en una experiencia increíble para jugadores, técnicos y patrocinadores con una coordinación impecable, cuadros claros y un día de competición que fluye.',
    ctaPrimary: 'Probar la demo',
    ctaSecondary: 'Solicitar plan club',
    highlights: [
      { value: '5 fases', label: 'desde la planificación hasta la clausura' },
      { value: '1h15m', label: 'por partido para no retrasar el calendario' },
      { value: '2-3 suplentes', label: 'para salvar cualquier imprevisto' },
      { value: '100%', label: 'coordinación para que todo salga sobre ruedas' },
    ],
    phasesTitle: 'El workflow ideal del organizador',
    phases: [
      {
        title: 'Fase 1 · Planificación y definición',
        description: 'Defines el formato, las categorías, la sede, el presupuesto y el reglamento para sentar las bases del torneo.',
        items: [
          'Eliminación directa, grupos + eliminatorias o formato americano/mexicano.',
          'Categorías por nivel, género y modalidad para equilibrar la competición.',
          'Reserva de pistas, negociación con el club y control del presupuesto.',
          'Reglamento claro con punto de oro, muerte súbita o desempates.',
        ],
      },
      {
        title: 'Fase 2 · Inscripciones y difusión',
        description: 'Consigues participantes, gestionas pagos y armas una comunicación fuerte desde el primer día.',
        items: [
          'Flyer y difusión en redes, WhatsApp y recepción del club.',
          'Plataforma de inscripción con datos de contacto, nivel y confirmación por email.',
          'Pago previo para asegurar plazas y evitar sorpresas.',
          'Grupo de difusión para actualizaciones y horarios.',
        ],
      },
      {
        title: 'Fase 3 · Cuadrantes y logística final',
        description: 'Cierras listas, sortea los emparejamientos y preparas la jornada con precisión.',
        items: [
          'Cierre de inscripciones y cabezas de serie para evitar cruces tempranos.',
          'Sorteo en directo, cuadros publicados y horario escalonado por franjas.',
          'Compras de última hora: pelotas, trofeos, agua, fruta y botiquín.',
          'Planifica 1h15m o 1h30m por partido según formato.',
        ],
      },
      {
        title: 'Fase 4 · El día del torneo',
        description: 'Pasas a dirigir la competición con una mesa de control, pista y tiempo perfectamente organizados.',
        items: [
          'Check-in 30 minutos antes con welcome pack y briefing de pista.',
          'Pizarra o app en tiempo real con orden de juego y horarios.',
          'Resolución de conflictos y autoárbitraje cuando no hay árbitro.',
          'Música, fotos, vídeos y hidratación constante para elevar la experiencia.',
        ],
      },
      {
        title: 'Fase 5 · Clausura y post-torneo',
        description: 'Cierra el evento con premios, seguimiento y una devolución que te ayuda a repetir mejor.',
        items: [
          'Finales en pista central, entrega de trofeos y sorteos de regalos.',
          'Pago a proveedores, limpieza y cierre logístico de la instalación.',
          'Fotos, resultados y agradecimientos a jugadores y patrocinadores.',
          'Encuesta rápida para mejorar la siguiente edición.',
        ],
      },
    ],
    tipsTitle: '3 consejos de oro',
    tips: [
      {
        title: 'Punto de oro',
        text: 'Activa el punto de oro y el súper tie-break para acelerar torneos con muchas parejas y evitar retrasos.',
      },
      {
        title: 'Comodines',
        text: 'Mantén 2 o 3 jugadores locales de confianza listos para cubrir ausencias y no descuadrar el cuadro.',
      },
      {
        title: 'Tu app como centro neurálgico',
        text: 'Usa una plataforma con cuadros en tiempo real, horarios en el móvil y resultados actualizados al instante.',
      },
    ],
    finalTitle: 'Haz que el torneo se sienta profesional desde el primer contacto',
    finalText: 'PADEL ORGANIZERS te ayuda a convertir un torneo en un evento premium, con una experiencia que encaja con jugadores, técnicos y sponsors.',
  },
  en: {
    badge: '+ TOURNAMENT',
    title: 'Organize a pro padel tournament',
    subtitle: 'Turn every event into an amazing experience for players, coaches and sponsors with flawless coordination, clear brackets and a competition day that runs smoothly.',
    ctaPrimary: 'Try the demo',
    ctaSecondary: 'Request club plan',
    highlights: [
      { value: '5 phases', label: 'from planning to closing' },
      { value: '1h15m', label: 'per match to keep the schedule on track' },
      { value: '2-3 backups', label: 'ready for last-minute surprises' },
      { value: '100%', label: 'coordination for a flawless event' },
    ],
    phasesTitle: 'The ideal organizer workflow',
    phases: [
      {
        title: 'Phase 1 · Planning and definition',
        description: 'Define the format, categories, venue, budget and rules that will shape your tournament.',
        items: [
          'Knockout, groups + playoffs or American/Mexican format.',
          'Categories by level, gender and modality to keep the draw balanced.',
          'Court reservation, club negotiations and budget control.',
          'Clear rules including golden point, sudden death and tie-breaks.',
        ],
      },
      {
        title: 'Phase 2 · Registrations and promotion',
        description: 'Fill the tournament, collect payments and keep everyone informed from day one.',
        items: [
          'Flyers, socials, WhatsApp and club reception promotion.',
          'Registration with contact details, level and confirmation email.',
          'Advance payment to secure spots and avoid surprises.',
          'Broadcast group for updates and schedules.',
        ],
      },
      {
        title: 'Phase 3 · Brackets and final logistics',
        description: 'Close the lists, draw the matches and prepare the event with precision.',
        items: [
          'Registration closure and seedings to avoid early clashes.',
          'Live draw, published brackets and timed schedule by slot.',
          'Last-minute purchases: balls, trophies, water, fruit and first aid kit.',
          'Plan 1h15m or 1h30m per match depending on the format.',
        ],
      },
      {
        title: 'Phase 4 · Tournament day',
        description: 'Shift from planner to conductor with a tight control desk and on-time matches.',
        items: [
          'Check-in 30 minutes before with welcome pack and pitch briefing.',
          'Real-time board or app showing order of play and court assignments.',
          'Conflict resolution and self-refereeing when no referee is present.',
          'Music, photos, videos and constant hydration to elevate the experience.',
        ],
      },
      {
        title: 'Phase 5 · Closing and post-event',
        description: 'End the event with rewards, follow-up and feedback that makes the next edition even better.',
        items: [
          'Central court finals, trophy handover and prize raffles.',
          'Payments to providers, venue cleanup and final logistics.',
          'Photos, results and messages to players and sponsors.',
          'Fast survey to improve the next edition.',
        ],
      },
    ],
    tipsTitle: '3 golden tips',
    tips: [
      {
        title: 'Golden point',
        text: 'Use golden point and a super tie-break to speed up tournaments with lots of pairs and avoid delays.',
      },
      {
        title: 'Wildcards',
        text: 'Keep 2 or 3 trusted local players on standby to cover absences and keep the draw intact.',
      },
      {
        title: 'Your app as the nerve center',
        text: 'Use a platform with real-time brackets, mobile schedules and instant result updates.',
      },
    ],
    finalTitle: 'Make the tournament feel professional from the first touchpoint',
    finalText: 'PADEL ORGANIZERS helps you turn a tournament into a premium event with an experience that matches players, coaches and sponsors.',
  },
};

const sectionStyle = { maxWidth: '1180px', margin: '0 auto', padding: '0 24px' };

export default function TorneoOrganizer({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();

  return (
    <div style={{ paddingBottom: 80 }}>
      <section style={{ padding: '72px 0 56px', background: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.22), transparent 35%), radial-gradient(circle at 80% 0%, rgba(251,113,133,0.14), transparent 38%)' }}>
        <div style={sectionStyle}>
          <div style={{ display: 'inline-block', padding: '8px 14px', borderRadius: '999px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#86efac', fontWeight: 800, fontSize: 12, letterSpacing: '1.2px', marginBottom: 20 }}>
            {T.badge}
          </div>
          <h1 style={{ fontSize: 'clamp(2.1rem, 4.6vw, 3.3rem)', lineHeight: 1.1, fontWeight: 900, color: '#fff', marginBottom: 16, maxWidth: 780 }}>
            {T.title}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: '#cbd5e1', maxWidth: 760, marginBottom: 24 }}>
            {T.subtitle}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
              🚀 {T.ctaPrimary}
            </button>
            <button onClick={() => navigate('/club')} style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              🏟️ {T.ctaSecondary}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 28 }}>
            {T.highlights.map((h, i) => (
              <div key={i} style={{ background: 'rgba(7, 18, 16, 0.7)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#84cc16', marginBottom: 6 }}>{h.value}</div>
                <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 0 72px' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 24 }}>{T.phasesTitle}</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {T.phases.map((phase, index) => (
              <div key={phase.title} style={{ background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 18, padding: 22, boxShadow: '0 12px 30px var(--padel-shadow)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#84cc16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--padel-text)', marginBottom: 6 }}>{phase.title}</h3>
                    <p style={{ color: 'var(--padel-muted)', lineHeight: 1.7, marginBottom: 10 }}>{phase.description}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                      {phase.items.map((item) => (
                        <li key={item} style={{ color: 'var(--padel-text)', paddingLeft: '18px', position: 'relative', lineHeight: 1.6 }}>
                          <span style={{ position: 'absolute', left: 0, top: 10, width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 72px' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 24 }}>{T.tipsTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {T.tips.map((tip) => (
              <div key={tip.title} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#84cc16', marginBottom: 8 }}>{tip.title}</h3>
                <p style={{ color: '#e2e8f0', lineHeight: 1.7 }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 24 }}>
        <div style={{ ...sectionStyle, background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(251,113,133,0.12))', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '32px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 10 }}>{T.finalTitle}</h2>
          <p style={{ color: '#cbd5e1', maxWidth: 720, margin: '0 auto 18px', lineHeight: 1.7 }}>{T.finalText}</p>
          <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            {T.ctaPrimary}
          </button>
        </div>
      </section>
    </div>
  );
}
