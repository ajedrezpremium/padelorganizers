import React from 'react';
import { useNavigate } from 'react-router-dom';

const I18N = {
  es: {
    title: 'Aviso legal · Privacidad · Cookies',
    updated: 'Última actualización: agosto 2026',
    back: '← Volver',
    toc: 'Contenido',
    s1: '1. Responsable del tratamiento',
    s1b: 'Responsable: PADELORGANIZERS.COM. Contacto: hola@padelorganizers.com',
    s2: '2. Datos que tratamos',
    s2b: 'Recogemos los datos que introduces voluntariamente (nombre, email, club) junto con datos de uso técnico y de preferencia de idioma.',
    s3: '3. Finalidad y base legal',
    s3b: 'Gestión de torneos, reservas de pista, puntuaciones y ranking. Base: ejecución de la relación que inicias (art. 6.1.b RGPD) y tu consentimiento (art. 6.1.a).',
    s4: '4. Cookies',
    s4b: 'Usamos cookies funcionales para guardar tu torneo y preferencias (idioma), y una cookie de decisión para recordar si aceptaste este aviso. No usamos cookies de publicidad de terceros sin tu consentimiento.',
    s5: '5. Destinatarios',
    s5b: 'Los datos de pago se procesan por Stripe (procesador). Solo se comparten proveedores imprescindibles para el funcionamiento del servicio.',
    s6: '6. Conservación',
    s6b: 'Los datos se conservan mientras tengas la cuenta activa. Puedes solicitar su borrado en cualquier momento.',
    s7: '7. Responsabilidad',
    s7b: 'El soporte de datos se proporciona «en su estado», sin garantías de disponibilidad permanente. Hacemos lo posible por la continuidad del servicio.',
    s8: '8. Contacto y reclamaciones',
    s8b: 'Para ejercer tus derechos (acceso, rectificación, supresión, oposición) escríbenos a hola@padelorganizers.com. Puedes reclamar ante la autoridad de control de tu país.',
    accept: 'Aceptar y seguir',
    decline: 'Solo lo necesario',
    bannerTitle: 'Usamos cookies',
    bannerText: 'Para que la plataforma funcione (idioma, sesión y tu torneo). No hay publicidad de terceros. Puedes aceptarlas o seguir solo con las necesarias.',
    bannerMore: 'Más información',
  },
  en: {
    title: 'Legal notice · Privacy · Cookies',
    updated: 'Last updated: August 2026',
    back: '← Back',
    toc: 'Contents',
    s1: '1. Data controller',
    s1b: 'Controller: PADELORGANIZERS.COM. Contact: hola@padelorganizers.com',
    s2: '2. Data we process',
    s2b: 'We collect what you enter voluntarily (name, email, club), plus technical data and language preference.',
    s3: '3. Purpose and legal basis',
    s3b: 'Tournament management, court bookings, scores and notifications. Basis: contract (Art. 6.1.b GDPR) and consent (Art. 6.1.a).',
    s4: '4. Cookies',
    s4b: 'We use functional cookies (tournament state, language) and one decision cookie to remember this choice. No third-party advertising cookies without consent.',
    s5: '5. Recipients',
    s5b: 'Payment data is processed by Stripe. Only essential providers are used.',
    s6: '6. Retention',
    s6b: 'Data is kept while your account is active. You may request deletion anytime.',
    s7: '7. Liability',
    s7b: 'The service is provided "as is". We make best efforts to keep it available but do not guarantee uninterrupted operation.',
    s8: '8. Rights and complaints',
    s8b: 'To exercise your rights: hola@padelorganizers.com. You can also complain to your national authority.',
    accept: 'Accept',
    decline: 'Only necessary',
    bannerTitle: 'We use cookies',
    privTxt: 'To run the platform (language, session, your tournament). No third-party ads. You can accept or keep only essentials.',
    brand: 'PADELORGANIZERS.COM',
  },
  fr: {
    title: 'Mentions légales · Confidentialité · Cookies',
    updated: 'Dernière mise à jour : août 2026',
    back: '← Retour',
    s1: '1. Responsable du traitement',
    s2: '2. Données traitées',
    s3: '3. Finalité et base légale',
    s4: '4. Cookies',
    s5: '5. Destinataires',
    s6: '6. Conservation',
    s7: '7. Responsabilité',
    s8: '8. Droits et réclamations',
    accept: 'Accepter',
    decline: 'Nécessaire uniquement',
    bannerTitle: 'Nous utilisons des cookies',
    brand: 'PADELORGANIZERS.COM',
  },
  pt: {
    title: 'Aviso legal · Privacidade · Cookies',
    updated: 'Última atualização: agosto 2026',
    back: '← Voltar',
    s1: '1. Responsável pelo tratamento',
    s2: '2. Dados que tratamos',
    s3: '3. Finalidade e base legal',
    s4: '4. Cookies',
    s5: '5. Destinatários',
    s6: '6. Conservação',
    s7: '7. Responsabilidade',
    s8: '8. Direitos e reclamações',
    accept: 'Aceitar',
    decline: 'Apenas o necessário',
    bannerTitle: 'Usamos cookies',
    brand: 'PADELORGANIZERS.COM',
  },
};

const sectionStyle = { maxWidth: '820px', margin: '0 auto', padding: '0 24px' };

export default function LegalNotice({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();

  const sections = [
    ['s1', 's1b', '👤'],
    ['s2', 's2b', '📋'],
    ['s3', 's3b', '🎯'],
    ['s4', 's4b', '🍪'],
    ['s5', 's5b', '🔐'],
    ['s6', 's6b', '⏳'],
    ['s7', 's7b', '⚖️'],
    ['s8', 's8b', '✉️'],
  ];

  return (
    <div style={{ padding: '40px 0 60px', minHeight: '80vh' }}>
      <div style={sectionStyle}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', color: '#84cc16', border: '1px solid rgba(16,185,129,0.3)', padding: '9px 16px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 20 }}>
          {T.back}
        </button>

        <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>{T.title}</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 30px' }}>{T.updated}</p>

        {sections.map(([t, b, icon], i) => (
          <section key={i} style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 14, padding: '18px 20px', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#84cc16', margin: '0 0 8px' }}>{icon} {T[t]}</h2>
            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>{T[b]}</p>
          </section>
        ))}
      </div>
    </div>
  );
}