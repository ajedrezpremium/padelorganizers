/**
 * leadMagnets.js — Generación de lead magnets dinámicos (PDF, calculadoras, templates).
 * Se usan en modales, landing y widgets para capturar emails a cambio de valor real.
 */

// ---- 1. Calculadora ROI Club (devuelve HTML para PDF o widget) ----
export function calculateClubROI({ courts = 4, pricePerHour = 20, occupancy = 0.45, hoursPerDay = 12, daysPerMonth = 28, proPlanCost = 99 }) {
  const monthlyRevenue = courts * pricePerHour * occupancy * hoursPerDay * daysPerMonth;
  const yearlyRevenue = monthlyRevenue * 12;
  const yieldGain = yearlyRevenue * 0.18; // 18% uplift típico con yield management
  const timeSavedHours = 15 * 4.33; // 15h/semana gestión manual
  const timeValue = timeSavedHours * 25 * 12; // 25€/h valor hora dueño
  const totalGain = yieldGain + timeValue;
  const roi = ((totalGain - proPlanCost * 12) / (proPlanCost * 12)) * 100;
  const paybackMonths = (proPlanCost * 12) / (totalGain / 12);

  return {
    monthlyRevenue: Math.round(monthlyRevenue),
    yearlyRevenue: Math.round(yearlyRevenue),
    yieldGain: Math.round(yieldGain),
    timeSavedHours: Math.round(timeSavedHours * 12),
    timeValue: Math.round(timeValue),
    totalGain: Math.round(totalGain),
    roi: Math.round(roi),
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    inputs: { courts, pricePerHour, occupancy, hoursPerDay, daysPerMonth, proPlanCost },
  };
}

// ---- 2. HTML para PDF "Guía 20 funciones vs competencia" ----
export function generateComparisonGuideHTML(lang = 'es') {
  const T = {
    es: {
      title: 'Guía: 20 funciones clave — PADELORGANIZERS vs Competencia',
      subtitle: 'Por qué 20 de 20 gana a Playtomic (11), MATCHi (11), Padel Mates (10) y Padel Manager (6)',
      features: [
        { cat: 'Reservas', items: ['Pista + split payments', 'Lista de espera automática', 'App socios nativa', 'Widget web embebible'] },
        { cat: 'Torneos', items: ['Motor Americano/Mexicano/Suizo', 'Cuadro eliminatorio + Punto de Oro', 'Live scoring público', 'Inscripciones + pagos'] },
        { cat: 'Escuela', items: ['Grupos por nivel/edad', 'Asistencia + evaluación técnica', 'Bonos de clases', 'Portal alumno/progreso'] },
        { cat: 'Club', items: ['CRM socios + fidelización', 'Dashboard RevPAC + yield', 'Control luces IoT (QR)', 'Pagos Stripe/PayPal'] },
        { cat: 'IA & Marketing', items: ['Coach IA voz 4 idiomas', 'Newsletter Studio + IA', 'Ranking ELO global', 'Marketplace oportunidades'] },
      ],
      cta: 'Descarga la guía completa y la calculadora ROI → padelorganizers.vercel.app'
    },
    en: {
      title: 'Guide: 20 Key Features — PADELORGANIZERS vs Competition',
      subtitle: 'Why 20 of 20 beats Playtomic (11), MATCHi (11), Padel Mates (10) and Padel Manager (6)',
      features: [
        { cat: 'Bookings', items: ['Court + split payments', 'Auto waitlist', 'Native member app', 'Embeddable web widget'] },
        { cat: 'Tournaments', items: ['Americano/Mexicano/Swiss engine', 'Elimination bracket + Golden Point', 'Public live scoring', 'Registrations + payments'] },
        { cat: 'School', items: ['Groups by level/age', 'Attendance + technical eval', 'Class packs', 'Student/progress portal'] },
        { cat: 'Club', items: ['Member CRM + loyalty', 'RevPAC dashboard + yield', 'IoT light control (QR)', 'Stripe/PayPal payments'] },
        { cat: 'AI & Marketing', items: ['Voice AI Coach 4 langs', 'Newsletter Studio + AI', 'Global ELO ranking', 'Opportunities marketplace'] },
      ],
      cta: 'Download full guide & ROI calculator → padelorganizers.vercel.app'
    }
  }[lang];

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><title>${T.title}</title><style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;line-height:1.6;color:#1a1a1a}
h1{font-size:28px;color:#064e3b;border-bottom:3px solid #10b981;padding-bottom:12px;margin-bottom:8px}
.subtitle{color:#64748b;font-size:16px;margin-bottom:32px}
.table{width:100%;border-collapse:collapse;margin:24px 0;font-size:14px}
.table th,.table td{border:1px solid #e2e8f0;padding:10px 12px;text-align:left}
.table th{background:#f0fdf4;color:#065f46;font-weight:700}
.table tr:nth-child(even) td{background:#f8fafc}
.cat{font-weight:700;color:#065f46;background:#f0fdf4}
.check{color:#10b981;font-weight:700}
.cross{color:#94a3b8}
.cta{margin-top:40px;padding:24px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:12px;text-align:center}
.cta a{color:#fff;text-decoration:underline;font-weight:700}
</style></head><body>
<h1>${T.title}</h1>
<p class="subtitle">${T.subtitle}</p>
<table class="table">
  <thead><tr><th>Categoría</th><th>Función</th><th>PADELORGANIZERS</th><th>Playtomic</th><th>MATCHi</th><th>Padel Mates</th><th>Padel Manager</th></tr></thead>
  <tbody>
    ${T.features.map((cat, ci) => cat.items.map((item, ii) => `
      <tr>
        <td${ii===0?' class="cat" rowspan="'+cat.items.length+'"':''}>${ii===0?cat.cat:''}</td>
        <td>${item}</td>
        <td class="check">✅</td>
        <td class="${ci<2||(ci===2&&ii<2)||(ci===3&&ii<1)?'check':'cross'}">${ci<2||(ci===2&&ii<2)||(ci===3&&ii<1)?'✅':'❌'}</td>
        <td class="${ci<2||(ci===2&&ii<2)?'check':'cross'}">${ci<2||(ci===2&&ii<2)?'✅':'❌'}</td>
        <td class="${ci<1||(ci===2&&ii<1)?'check':'cross'}">${ci<1||(ci===2&&ii<1)?'✅':'❌'}</td>
        <td class="cross">❌</td>
      </tr>
    `).join('')).join('')}
    <tr><td colspan="6" style="font-weight:700;background:#f0fdf4;color:#065f46">TOTAL</td><td class="check">20</td><td class="check">11</td><td class="check">11</td><td class="cross">10</td><td class="cross">6</td></tr>
  </tbody>
</table>
<div class="cta">${T.cta}</div>
</body></html>`;
}

// ---- 3. HTML para PDF "Checklist apertura club" ----
export function generateClubOpeningChecklistHTML(lang = 'es') {
  const T = {
    es: {
      title: 'Checklist: Apertura y digitalización de tu club de pádel',
      sections: [
        { title: 'Legal y permisos', items: ['Licencia actividad + obra', 'Seguro RC deportiva', 'Estatutos/reglamento interno', 'Protección datos (RGPD)'] },
        { title: 'Instalación', items: ['Pistas (medidas 10x20, cristal/malla)', 'Iluminación LED 300-500 lux', 'Vestuarios + accesibilidad', 'Zona social/bar'] },
        { title: 'Software (día 1)', items: ['Reservas online + split payments', 'App socios (iOS/Android/PWA)', 'Motor torneos + live scoring', 'Escuela: grupos + bonos'] },
        { title: 'Marketing lanzamiento', items: ['Ficha en directorio +700 clubes', 'Campaña email + WhatsApp', 'Redes sociales (IG/LinkedIn)', 'Oferta early-bird 3 meses gratis'] },
        { title: 'Operativa', items: ['Horarios valle/prime/noche', 'Precios dinámicos (yield)', 'Mantenimiento pistas', 'Formación personal'] },
      ],
      cta: 'Empieza gratis en padelorganizers.vercel.app'
    },
    en: {
      title: 'Checklist: Opening & digitising your padel club',
      sections: [
        { title: 'Legal & permits', items: ['Activity license', 'Sports liability insurance', 'Internal rules', 'GDPR compliance'] },
        { title: 'Facility', items: ['Courts (10x20, glass/mesh)', 'LED lighting 300-500 lux', 'Changing rooms + accessibility', 'Social area/bar'] },
        { title: 'Software (day 1)', items: ['Online bookings + split pay', 'Member app (iOS/Android/PWA)', 'Tournament engine + live score', 'School: groups + packs'] },
        { title: 'Launch marketing', items: ['Directory listing +700 clubs', 'Email + WhatsApp campaign', 'Social media (IG/LinkedIn)', 'Early-bird 3 months free'] },
        { title: 'Operations', items: ['Valley/prime/night slots', 'Dynamic pricing (yield)', 'Court maintenance', 'Staff training'] },
      ],
      cta: 'Start free at padelorganizers.vercel.app'
    }
  }[lang];

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><title>${T.title}</title><style>
body{font-family:system-ui,sans-serif;max-width:700px;margin:0 auto;padding:40px 20px;line-height:1.7;color:#1a1a1a}
h1{font-size:26px;color:#064e3b;border-bottom:3px solid #10b981;padding-bottom:10px}
.section{margin:28px 0}.section h2{font-size:16px;color:#065f46;border-left:4px solid #10b981;padding-left:12px;margin-bottom:12px}
ul{margin:0;padding-left:20px}li{margin:8px 0}
.cta{margin-top:40px;padding:20px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:12px;text-align:center}
</style></head><body>
<h1>${T.title}</h1>
${T.sections.map(s => `<div class="section"><h2>${s.title}</h2><ul>${s.items.map(i => `<li>${i}</li>`).join('')}</ul></div>`).join('')}
<div class="cta">${T.cta}</div>
</body></html>`;
}

// ---- 4. Widget embebible "Comprueba disponibilidad" ----
export function generateAvailabilityWidgetHTML(clubId, lang = 'es') {
  return `<div id="padelorg-availability-${clubId}" style="max-width:100%;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;font-family:system-ui,sans-serif">
  <div style="background:#064e3b;color:#fff;padding:16px 20px;font-weight:700">🎾 Disponibilidad en tiempo real</div>
  <div style="padding:20px">
    <p style="margin:0 0 16px;color:#64748b">Consulta pistas libres y reserva en segundos.</p>
    <a href="https://padelorganizers.vercel.app/club?club=${clubId}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;border-radius:8px;font-weight:700;text-decoration:none">Ver disponibilidad →</a>
  </div>
  <div style="background:#f8fafc;padding:12px 20px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center">Potenciado por <a href="https://padelorganizers.vercel.app" style="color:#10b981">PADELORGANIZERS</a></div>
</div>`;
}