import React from 'react';
import { useNavigate } from 'react-router-dom';

const I18N = {
  es: {
    badge: 'LA PLATAFORMA PRO DE TORNEOS DE PÁDEL',
    title1: 'Organiza torneos de pádel',
    title2: 'como un profesional',
    subtitle:
      'La primera plataforma SaaS con IA para la gestión de torneos, control de pistas CourtManager, marcador digital con Punto de Oro, motor Americano/Mexicano/Suizo/Eliminatorio y analíticas en tiempo real.',
    ctaDemo: 'Probar Demo Gratuita',
    ctaDashboard: 'Ver Dashboard Pistas',
    stats: [
      ['4+', 'Formatos de torneo'],
      ['100%', 'Automático & en vivo'],
      ['4', 'Idiomas (ES · EN · FR · PT)'],
      ['24/7', 'Disponibilidad Cloud'],
    ],
    featuresTitle: 'Todo lo que tu club necesita',
    featuresSubtitle: 'Diseñado con organizadores reales de clubes para eliminar las hojas de cálculo y el caos.',
    features: [
      { icon: '🏟️', title: 'CourtManager', desc: 'Control de pistas en tiempo real con temporizadores, asignación interactiva y estados de juego.' },
      { icon: '🎯', title: 'Marcador Punto de Oro', desc: 'Marcador digital con la regla del Punto de Oro y gestor de sets, juegos y puntos.' },
      { icon: '⚙️', title: 'Motor de Torneos', desc: 'Americano, Mexicano, Suizo por parejas y cuadro Eliminatorio. Generación automática.' },
      { icon: '📊', title: 'Analíticas en vivo', desc: 'Ranking dinámico, puntos, diferencias de juegos y desempates calculados al instante.' },
      { icon: '🌍', title: 'Multi-idioma', desc: 'Interfaz completa en español, inglés, francés y portugués para clubes internacionales.' },
      { icon: '☁️', title: 'SaaS + Reservas', desc: 'Modelo de monetización recurrente por club con reservas de pistas y membresías.' },
    ],
    comparisonTitle: 'Comparativa de mercado',
    comparisonCols: ['Característica', 'PADELORGANIZERS', 'Playtomic', 'Excel/WhatsApp'],
    comparison: [
      ['Formato Americano/Mexicano automático', '✓', '✓', '✗'],
      ['Punto de Oro digital', '✓', '✗', '✗'],
      ['Control de pistas en tiempo real', '✓', 'Parcial', '✗'],
      ['Multi-idioma (ES/EN/FR/PT)', '✓', '✗', '✗'],
      ['Ranking con desempates automáticos', '✓', 'Parcial', '✗'],
      ['Sin instalación, en la nube', '✓', 'App', 'PC'],
    ],
    pricingTitle: 'Modelo de monetización',
    pricingSubtitle: 'Crece con tu club. Empieza gratis y escala cuando lo necesites.',
    pricing: [
      { name: 'Club Starter', price: '0 €', period: '/mes', features: ['1 torneo activo', '4 pistas', 'Marcador digital', 'Modo demo'] },
      { name: 'Club Pro', price: '49 €', period: '/mes', features: ['Torneos ilimitados', 'Pistas ilimitadas', 'CourtManager + IA', 'Multi-idioma', 'Soporte prioritario'] },
      { name: 'Reservas', price: '3%', period: '/reserva', features: ['Cobro integrado', 'Membresías de jugadores', 'Pagos automáticos', 'Pagos directos al club'] },
    ],
    ctaSectionTitle: 'Lanza tu próximo torneo en minutos',
    ctaSectionDesc: 'Sin tarjetas, sin instalación. Configura tu torneo, comparte el enlace y deja que el motor haga el resto.',
    footer: 'PADELORGANIZERS.COM — El mejor software para el deporte de moda.',
  },
  en: {
    badge: 'THE PRO PADEL TOURNAMENT PLATFORM',
    title1: 'Organize padel tournaments',
    title2: 'like a professional',
    subtitle:
      'The first AI SaaS platform for tournament management, CourtManager court control, digital scoreboard with Gold Point, Americano/Mexicano/Swiss/Knockout engine and real-time analytics.',
    ctaDemo: 'Try Free Demo',
    ctaDashboard: 'View Courts Dashboard',
    stats: [
      ['4+', 'Tournament formats'],
      ['100%', 'Automatic & live'],
      ['4', 'Languages (ES · EN · FR · PT)'],
      ['24/7', 'Cloud availability'],
    ],
    featuresTitle: 'Everything your club needs',
    featuresSubtitle: 'Built with real club organizers to eliminate spreadsheets and chaos.',
    features: [
      { icon: '🏟️', title: 'CourtManager', desc: 'Real-time court control with timers, interactive assignment and match states.' },
      { icon: '🎯', title: 'Gold Point Scoreboard', desc: 'Digital scoreboard with the Gold Point rule and set, game and point manager.' },
      { icon: '⚙️', title: 'Tournament Engine', desc: 'Americano, Mexicano, Swiss pairs and Knockout bracket. Automatic generation.' },
      { icon: '📊', title: 'Live Analytics', desc: 'Dynamic rankings, points, game differentials and tiebreakers computed instantly.' },
      { icon: '🌍', title: 'Multi-language', desc: 'Full interface in Spanish, English, French and Portuguese for international clubs.' },
      { icon: '☁️', title: 'SaaS + Bookings', desc: 'Recurring club monetization with court bookings and memberships.' },
    ],
    comparisonTitle: 'Market comparison',
    comparisonCols: ['Feature', 'PADELORGANIZERS', 'Playtomic', 'Excel/WhatsApp'],
    comparison: [
      ['Automatic Americano/Mexicano format', '✓', '✓', '✗'],
      ['Digital Gold Point', '✓', '✗', '✗'],
      ['Real-time court control', '✓', 'Partial', '✗'],
      ['Multi-language (ES/EN/FR/PT)', '✓', '✗', '✗'],
      ['Ranking with automatic tiebreakers', '✓', 'Partial', '✗'],
      ['No installation, cloud-based', '✓', 'App', 'PC'],
    ],
    pricingTitle: 'Monetization model',
    pricingSubtitle: 'Grow with your club. Start free and scale when you need it.',
    pricing: [
      { name: 'Club Starter', price: '0 €', period: '/month', features: ['1 active tournament', '4 courts', 'Digital scoreboard', 'Demo mode'] },
      { name: 'Club Pro', price: '49 €', period: '/month', features: ['Unlimited tournaments', 'Unlimited courts', 'CourtManager + AI', 'Multi-language', 'Priority support'] },
      { name: 'Bookings', price: '3%', period: '/booking', features: ['Integrated payments', 'Player memberships', 'Automatic billing', 'Direct club payouts'] },
    ],
    ctaSectionTitle: 'Launch your next tournament in minutes',
    ctaSectionDesc: 'No cards, no install. Set up your tournament, share the link and let the engine do the rest.',
    footer: 'PADELORGANIZERS.COM — The best software for the sport of the moment.',
  },
  fr: {
    badge: 'LA PLATEFORME PRO DE TOURNOIS DE PADEL',
    title1: 'Organisez des tournois de padel',
    title2: 'comme un professionnel',
    subtitle:
      "La première plateforme SaaS avec IA pour la gestion de tournois, le contrôle des pistes CourtManager, le tableau de score avec Point d'Or, le moteur Américain/Mexicain/Suisse/Élimination et les analyses en temps réel.",
    ctaDemo: 'Essayer la Démo Gratuite',
    ctaDashboard: 'Voir le Tableau des Pistes',
    stats: [
      ['4+', 'Formats de tournoi'],
      ['100%', 'Automatique & en direct'],
      ['4', 'Langues (ES · EN · FR · PT)'],
      ['24/7', 'Disponibilité cloud'],
    ],
    featuresTitle: 'Tout ce qu’il faut à votre club',
    featuresSubtitle: 'Conçu avec de vrais organisateurs de clubs pour éliminer les tableurs et le chaos.',
    features: [
      { icon: '🏟️', title: 'CourtManager', desc: 'Contrôle des pistes en temps réel avec minuteurs, affectation interactive et états de jeu.' },
      { icon: '🎯', title: 'Scoreboard Point d\'Or', desc: 'Tableau de score numérique avec la règle du Point d\'Or et gestion des sets, jeux et points.' },
      { icon: '⚙️', title: 'Moteur de Tournois', desc: 'Américain, Mexicain, Suisse par paires et tableau à élimination directe. Génération automatique.' },
      { icon: '📊', title: 'Analyses en direct', desc: 'Classements dynamiques, points, différences de jeux et égalités calculés instantanément.' },
      { icon: '🌍', title: 'Multilingue', desc: 'Interface complète en espagnol, anglais, français et portugais pour les clubs internationaux.' },
      { icon: '☁️', title: 'SaaS + Réservations', desc: 'Monétisation récurrente par club avec réservations de pistes et adhésions.' },
    ],
    comparisonTitle: 'Comparaison du marché',
    comparisonCols: ['Fonctionnalité', 'PADELORGANIZERS', 'Playtomic', 'Excel/WhatsApp'],
    comparison: [
      ['Format Américain/Mexicain automatique', '✓', '✓', '✗'],
      ['Point d\'Or numérique', '✓', '✗', '✗'],
      ['Contrôle des pistes en temps réel', '✓', 'Partiel', '✗'],
      ['Multilingue (ES/EN/FR/PT)', '✓', '✗', '✗'],
      ['Classement avec égalités automatiques', '✓', 'Partiel', '✗'],
      ['Sans installation, dans le cloud', '✓', 'App', 'PC'],
    ],
    pricingTitle: 'Modèle de monétisation',
    pricingSubtitle: 'Développez votre club. Commencez gratuitement et évoluez si besoin.',
    pricing: [
      { name: 'Club Starter', price: '0 €', period: '/mois', features: ['1 tournoi actif', '4 pistes', 'Tableau de score', 'Mode démo'] },
      { name: 'Club Pro', price: '49 €', period: '/mois', features: ['Tournois illimités', 'Pistes illimitées', 'CourtManager + IA', 'Multilingue', 'Support prioritaire'] },
      { name: 'Réservations', price: '3%', period: '/réservation', features: ['Paiements intégrés', 'Adhésions joueurs', 'Facturation automatique', 'Versements au club'] },
    ],
    ctaSectionTitle: 'Lancez votre prochain tournoi en quelques minutes',
    ctaSectionDesc: 'Sans carte, sans installation. Configurez votre tournoi, partagez le lien et laissez le moteur faire le reste.',
    footer: 'PADELORGANIZERS.COM — Le meilleur logiciel du sport à la mode.',
  },
  pt: {
    badge: 'A PLATAFORMA PRO DE TORNEIOS DE PÁDEL',
    title1: 'Organize torneios de padel',
    title2: 'como um profissional',
    subtitle:
      'A primeira plataforma SaaS com IA para gestão de torneios, controlo de pistas CourtManager, marcador digital com Ponto de Ouro, motor Americano/Mexicano/Suíço/Eliminatória e análises em tempo real.',
    ctaDemo: 'Experimentar Demo Grátis',
    ctaDashboard: 'Ver Painel de Pistas',
    stats: [
      ['4+', 'Formatos de torneio'],
      ['100%', 'Automático & ao vivo'],
      ['4', 'Idiomas (ES · EN · FR · PT)'],
      ['24/7', 'Disponibilidade cloud'],
    ],
    featuresTitle: 'Tudo o que o seu clube precisa',
    featuresSubtitle: 'Desenhado com organizadores reais de clubes para eliminar folhas de cálculo e o caos.',
    features: [
      { icon: '🏟️', title: 'CourtManager', desc: 'Controlo de pistas em tempo real com temporizadores, atribuição interativa e estados de jogo.' },
      { icon: '🎯', title: 'Marcador Ponto de Ouro', desc: 'Marcador digital com a regra do Ponto de Ouro e gestão de sets, jogos e pontos.' },
      { icon: '⚙️', title: 'Motor de Torneios', desc: 'Americano, Mexicano, Suíço por pares e eliminatória. Geração automática.' },
      { icon: '📊', title: 'Análises ao vivo', desc: 'Classificações dinâmicas, pontos, diferenças de jogos e desempates calculados no instante.' },
      { icon: '🌍', title: 'Multi-idioma', desc: 'Interface completa em espanhol, inglês, francês e português para clubes internacionais.' },
      { icon: '☁️', title: 'SaaS + Reservas', desc: 'Modelo de monetização recorrente por clube com reservas de pistas e assinaturas.' },
    ],
    comparisonTitle: 'Comparação de mercado',
    comparisonCols: ['Característica', 'PADELORGANIZERS', 'Playtomic', 'Excel/WhatsApp'],
    comparison: [
      ['Formato Americano/Mexicano automático', '✓', '✓', '✗'],
      ['Ponto de Ouro digital', '✓', '✗', '✗'],
      ['Controlo de pistas em tempo real', '✓', 'Parcial', '✗'],
      ['Multi-idioma (ES/EN/FR/PT)', '✓', '✗', '✗'],
      ['Classificação com desempates automáticos', '✓', 'Parcial', '✗'],
      ['Sem instalação, na nuvem', '✓', 'App', 'PC'],
    ],
    pricingTitle: 'Modelo de monetização',
    pricingSubtitle: 'Cresça com o seu clube. Comece grátis e escale quando precisar.',
    pricing: [
      { name: 'Club Starter', price: '0 €', period: '/mês', features: ['1 torneio ativo', '4 pistas', 'Marcador digital', 'Modo demo'] },
      { name: 'Club Pro', price: '49 €', period: '/mês', features: ['Torneios ilimitados', 'Pistas ilimitadas', 'CourtManager + IA', 'Multi-idioma', 'Suporte prioritário'] },
      { name: 'Reservas', price: '3%', period: '/reserva', features: ['Cobrança integrada', 'Assinaturas de jogadores', 'Pagamentos automáticos', 'Pagamentos diretos ao clube'] },
    ],
    ctaSectionTitle: 'Lance o seu próximo torneio em minutos',
    ctaSectionDesc: 'Sem cartão, sem instalação. Configure o torneio, partilhe o link e deixe o motor fazer o resto.',
    footer: 'PADELORGANIZERS.COM — O melhor software do desporto da moda.',
  },
};

const sectionStyle = { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' };

export default function LandingPadel({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* HERO */}
      <section style={{ position: 'relative', padding: '80px 0 70px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(132,204,22,0.12), transparent 40%)' }} />
        <div style={{ ...sectionStyle, position: 'relative' }}>
          <span style={{ display: 'inline-block', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#84cc16', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '12px', letterSpacing: '1.5px' }}>
            🎾 {T.badge}
          </span>
          <h1 style={{ fontSize: '56px', lineHeight: 1.05, fontWeight: 900, color: '#fff', margin: '24px 0 16px', letterSpacing: '-1.5px' }}>
            {T.title1}
            <br />
            <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{T.title2}</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '640px', lineHeight: 1.7, marginBottom: '32px' }}>{T.subtitle}</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
              🚀 {T.ctaDemo}
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
              🏟️ {T.ctaDashboard}
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a1a17' }}>
        <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', paddingTop: '40px', paddingBottom: '40px' }}>
          {T.stats.map(([num, label], i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', fontWeight: 900, color: '#84cc16' }}>{num}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 0' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '34px', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: '8px' }}>{T.featuresTitle}</h2>
          <p style={{ fontSize: '15px', color: '#94a3b8', textAlign: 'center', marginBottom: '44px' }}>{T.featuresSubtitle}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {T.features.map((f, i) => (
              <div key={i} style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '26px' }}>
                <div style={{ fontSize: '30px', marginBottom: '14px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ padding: '70px 0', background: '#0a1a17', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '34px', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: '36px' }}>{T.comparisonTitle}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  {T.comparisonCols.map((c, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '14px', fontSize: '13px', fontWeight: 800, color: '#84cc16', borderBottom: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)' }}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {T.comparison.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '14px', fontSize: '14px', fontWeight: 600, color: '#f0fdf4' }}>{row[0]}</td>
                    {row.slice(1).map((cell, j) => (
                      <td key={j} style={{ padding: '14px', fontSize: '14px', color: cell === '✓' ? '#34d399' : cell === '✗' ? '#f87171' : '#94a3b8', fontWeight: 800, textAlign: 'center' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '80px 0' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '34px', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: '8px' }}>{T.pricingTitle}</h2>
          <p style={{ fontSize: '15px', color: '#94a3b8', textAlign: 'center', marginBottom: '44px' }}>{T.pricingSubtitle}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {T.pricing.map((p, i) => (
              <div key={i} style={{ background: i === 1 ? 'rgba(16,185,129,0.08)' : '#0e1e1b', border: i === 1 ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', position: 'relative' }}>
                {i === 1 && (
                  <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #10b981, #84cc16)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '12px' }}>★</span>
                )}
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>{p.name}</h3>
                <div style={{ marginBottom: '18px' }}>
                  <span style={{ fontSize: '34px', fontWeight: 900, color: '#84cc16' }}>{p.price}</span>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>{p.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ fontSize: '14px', color: '#cbd5e1', padding: '6px 0', borderBottom: '1px dashed rgba(255,255,255,0.06)' }}>✓ {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '70px 0', background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(132,204,22,0.1))', borderTop: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ ...sectionStyle, textAlign: 'center' }}>
          <h2 style={{ fontSize: '34px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>{T.ctaSectionTitle}</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '560px', margin: '0 auto 28px' }}>{T.ctaSectionDesc}</p>
          <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
            🚀 {T.ctaDemo}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © 2026 {T.footer}
      </footer>
    </div>
  );
}