import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeatureIcon = ({ name, size = 28, color = 'var(--padel-lime)' }) => {
  const icons = {
    court: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <circle cx="7" cy="7" r="2" fill={color} />
        <circle cx="17" cy="17" r="2" fill={color} />
      </svg>
    ),
    scoreboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="12" y2="16" />
        <path d="M12 4v4M12 20v-4" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    ),
    engine: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v4M12 16v4M4 12h4M16 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" fill={color} />
      </svg>
    ),
    analytics: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <path d="M18 20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
      </svg>
    ),
    lang: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    cloud: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        <polyline points="16 14 12 18 8 14" />
      </svg>
    ),
  };
  return icons[name] || icons.court;
};

const I18N = {
  es: {
    badge: 'LA PLATAFORMA PRO DE TORNEOS DE PÁDEL',
    title1: 'Organiza torneos de pádel',
    title2: 'como un profesional',
    subtitle:
      'La primera plataforma SaaS con IA para la gestión de torneos, control de pistas CourtManager, marcador digital con Punto de Oro, motor Americano/Mexicano/Suizo/Eliminatorio y analíticas en tiempo real.',
    ctaDemo: 'Probar Demo Gratuita',
    ctaDashboard: 'Ver Dashboard Pistas',
    ctaLivePro: '📺 LiveScore Pro',
    stats: [
      ['4+', 'Formatos de torneo'],
      ['100%', 'Automático & en vivo'],
      ['4', 'Idiomas (ES · EN · FR · PT)'],
      ['24/7', 'Disponibilidad Cloud'],
    ],
    featuresTitle: 'Todo lo que tu club necesita',
    featuresSubtitle: 'Diseñado con organizadores reales de clubes para eliminar las hojas de cálculo y el caos.',
    features: [
      { icon: 'court', title: 'CourtManager', desc: 'Control de pistas en tiempo real con temporizadores, asignación interactiva y estados de juego.', tooltip: 'Control de pistas en tiempo real con temporizadores e IA' },
      { icon: 'scoreboard', title: 'Marcador Punto de Oro', desc: 'Marcador digital con la regla del Punto de Oro y gestor de sets, juegos y puntos.', tooltip: 'Marcador digital con regla del Punto de Oro' },
      { icon: 'engine', title: 'Motor de Torneos', desc: 'Americano, Mexicano, Suizo por parejas y cuadro Eliminatorio. Generación automática.', tooltip: 'Generación automática de torneos Americano, Mexicano, Suizo y Eliminatorio' },
      { icon: 'analytics', title: 'Analíticas en vivo', desc: 'Ranking dinámico, puntos, diferencias de juegos y desempates calculados al instante.', tooltip: 'Rankings y analíticas en tiempo real con desempates automáticos' },
      { icon: 'lang', title: 'Multi-idioma', desc: 'Interfaz completa en español, inglés, francés y portugués para clubes internacionales.', tooltip: 'Interfaz en 4 idiomas: ES, EN, FR, PT' },
      { icon: 'cloud', title: 'SaaS + Reservas', desc: 'Modelo de monetización recurrente por club con reservas de pistas y membresías.', tooltip: 'Modelo SaaS con reservas y pagos integrados (Stripe)' },
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
    ctaLivePro: '📺 LiveScore Pro',
    stats: [
      ['4+', 'Tournament formats'],
      ['100%', 'Automatic & live'],
      ['4', 'Languages (ES · EN · FR · PT)'],
      ['24/7', 'Cloud availability'],
    ],
    featuresTitle: 'Everything your club needs',
    featuresSubtitle: 'Built with real club organizers to eliminate spreadsheets and chaos.',
    features: [
      { icon: 'court', title: 'CourtManager', desc: 'Real-time court control with timers, interactive assignment and match states.', tooltip: 'Real-time court control with timers and AI' },
      { icon: 'scoreboard', title: 'Gold Point Scoreboard', desc: 'Digital scoreboard with the Gold Point rule and set, game and point manager.', tooltip: 'Digital scoreboard with Gold Point rule' },
      { icon: 'engine', title: 'Tournament Engine', desc: 'Americano, Mexicano, Swiss pairs and Knockout bracket. Automatic generation.', tooltip: 'Auto-generation of Americano, Mexicano, Swiss and Knockout tournaments' },
      { icon: 'analytics', title: 'Live Analytics', desc: 'Dynamic rankings, points, game differentials and tiebreakers computed instantly.', tooltip: 'Real-time rankings and analytics with automatic tiebreakers' },
      { icon: 'lang', title: 'Multi-language', desc: 'Full interface in Spanish, English, French and Portuguese for international clubs.', tooltip: 'Interface in 4 languages: ES, EN, FR, PT' },
      { icon: 'cloud', title: 'SaaS + Bookings', desc: 'Recurring club monetization with court bookings and memberships.', tooltip: 'SaaS model with integrated bookings and payments (Stripe)' },
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
    ctaLivePro: '📺 LiveScore Pro',
    stats: [
      ['4+', 'Formats de tournoi'],
      ['100%', 'Automatique & en direct'],
      ['4', 'Langues (ES · EN · FR · PT)'],
      ['24/7', 'Disponibilité cloud'],
    ],
    featuresTitle: 'Tout ce qu\'il faut à votre club',
    featuresSubtitle: 'Conçu avec de vrais organisateurs de clubs pour éliminer les tableurs et le chaos.',
    features: [
      { icon: 'court', title: 'CourtManager', desc: 'Contrôle des pistes en temps réel avec minuteurs, affectation interactive et états de jeu.', tooltip: 'Contrôle des pistes en temps réel avec minuteurs et IA' },
      { icon: 'scoreboard', title: 'Scoreboard Point d\'Or', desc: 'Tableau de score numérique avec la règle du Point d\'Or et gestion des sets, jeux et points.', tooltip: 'Tableau de score numérique avec règle du Point d\'Or' },
      { icon: 'engine', title: 'Moteur de Tournois', desc: 'Américain, Mexicain, Suisse par paires et tableau à élimination directe. Génération automatique.', tooltip: 'Génération auto de tournois Américain, Mexicain, Suisse et Élimination' },
      { icon: 'analytics', title: 'Analyses en direct', desc: 'Classements dynamiques, points, différences de jeux et égalités calculés instantanément.', tooltip: 'Classements et analyses en temps réel avec égalités auto' },
      { icon: 'lang', title: 'Multilingue', desc: 'Interface complète en espagnol, anglais, français et portugais pour les clubs internationaux.', tooltip: 'Interface en 4 langues: ES, EN, FR, PT' },
      { icon: 'cloud', title: 'SaaS + Réservations', desc: 'Monétisation récurrente par club avec réservations de pistes et adhésions.', tooltip: 'Modèle SaaS avec réservations et paiements intégrés (Stripe)' },
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
    ctaLivePro: '📺 LiveScore Pro',
    stats: [
      ['4+', 'Formatos de torneio'],
      ['100%', 'Automático & ao vivo'],
      ['4', 'Idiomas (ES · EN · FR · PT)'],
      ['24/7', 'Disponibilidade cloud'],
    ],
    featuresTitle: 'Tudo o que o seu clube precisa',
    featuresSubtitle: 'Desenhado com organizadores reais de clubes para eliminar folhas de cálculo e o caos.',
    features: [
      { icon: 'court', title: 'CourtManager', desc: 'Controlo de pistas em tempo real com temporizadores, atribuição interativa e estados de jogo.', tooltip: 'Controlo de pistas em tempo real com temporizadores e IA' },
      { icon: 'scoreboard', title: 'Marcador Ponto de Ouro', desc: 'Marcador digital com a regra do Ponto de Ouro e gestão de sets, jogos e pontos.', tooltip: 'Marcador digital com regra do Ponto de Ouro' },
      { icon: 'engine', title: 'Motor de Torneios', desc: 'Americano, Mexicano, Suíço por pares e eliminatória. Geração automática.', tooltip: 'Geração automática de torneios Americano, Mexicano, Suíço e Eliminatória' },
      { icon: 'analytics', title: 'Análises ao vivo', desc: 'Classificações dinâmicas, pontos, diferenças de jogos e desempates calculados no instante.', tooltip: 'Classificações e análises em tempo real com desempates automáticos' },
      { icon: 'lang', title: 'Multi-idioma', desc: 'Interface completa em espanhol, inglês, francês e português para clubes internacionais.', tooltip: 'Interface em 4 idiomas: ES, EN, FR, PT' },
      { icon: 'cloud', title: 'SaaS + Reservas', desc: 'Modelo de monetização recorrente por clube com reservas de pistas e assinaturas.', tooltip: 'Modelo SaaS com reservas e pagamentos integrados (Stripe)' },
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
    <div style={{ minHeight: '100vh', background: 'var(--padel-bg)', color: 'var(--padel-text)' }}>
      {/* HERO */}
      <section style={{ position: 'relative', padding: '80px 0 70px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(132,204,22,0.12), transparent 40%)' }} />
        <div style={{ ...sectionStyle, position: 'relative' }}>
          <span style={{ display: 'inline-block', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: 'var(--padel-lime)', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '12px', letterSpacing: '1.5px' }}>
            🎾 {T.badge}
          </span>
          <h1 style={{ fontSize: '56px', lineHeight: 1.05, fontWeight: 900, color: 'var(--padel-text)', margin: '24px 0 16px', letterSpacing: '-1.5px' }}>
            {T.title1}
            <br />
            <span style={{ background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-lime) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{T.title2}</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--padel-muted)', maxWidth: '640px', lineHeight: 1.7, marginBottom: '32px' }}>{T.subtitle}</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
              🚀 {T.ctaDemo}
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'var(--padel-hover-bg)', color: 'var(--padel-text)', border: '1px solid var(--padel-border)', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
              🏟️ {T.ctaDashboard}
            </button>
            <button onClick={() => navigate('/livepro')} style={{ background: 'rgba(244,63,94,0.15)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.4)', padding: '14px 28px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
              📺 {T.ctaLivePro}
            </button>
            <button onClick={() => navigate('/analytics')} style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', padding: '14px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
              📊 Analíticas
            </button>
            <button onClick={() => navigate('/league')} style={{ background: 'rgba(163,230,53,0.12)', color: '#a3e635', border: '1px solid rgba(163,230,53,0.4)', padding: '14px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
              🏆 Ranked League
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: '1px solid var(--padel-border)', borderBottom: '1px solid var(--padel-border)', background: 'var(--padel-card-bg)' }}>
        <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', paddingTop: '40px', paddingBottom: '40px' }}>
          {T.stats.map(([num, label], i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', fontWeight: 900, color: 'var(--padel-lime)' }}>{num}</div>
              <div style={{ fontSize: '13px', color: 'var(--padel-muted)', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 0' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '34px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '8px' }}>{T.featuresTitle}</h2>
          <p style={{ fontSize: '15px', color: 'var(--padel-muted)', textAlign: 'center', marginBottom: '44px' }}>{T.featuresSubtitle}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {T.features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--padel-card-bg)',
                  border: '1px solid var(--padel-border)',
                  borderRadius: '16px',
                  padding: '26px',
                  position: 'relative',
                  cursor: 'help',
                }}
                title={f.tooltip}
              >
                <div style={{ fontSize: '32px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {FeatureIcon({ name: f.icon, size: 36, color: 'var(--padel-lime)' })}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--padel-text)', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--padel-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ padding: '70px 0', background: 'var(--padel-card-bg)', borderTop: '1px solid var(--padel-border)', borderBottom: '1px solid var(--padel-border)' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '34px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '36px' }}>{T.comparisonTitle}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  {T.comparisonCols.map((c, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '14px', fontSize: '13px', fontWeight: 800, color: 'var(--padel-lime)', borderBottom: '1px solid var(--padel-border)', background: 'rgba(16,185,129,0.06)' }}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {T.comparison.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--padel-border)' }}>
                    <td style={{ padding: '14px', fontSize: '14px', fontWeight: 600, color: 'var(--padel-text)' }}>{row[0]}</td>
                    {row.slice(1).map((cell, j) => (
                      <td key={j} style={{ padding: '14px', fontSize: '14px', color: cell === '✓' ? '#34d399' : cell === '✗' ? '#f87171' : 'var(--padel-muted)', fontWeight: 800, textAlign: 'center' }}>{cell}</td>
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
          <h2 style={{ fontSize: '34px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '8px' }}>{T.pricingTitle}</h2>
          <p style={{ fontSize: '15px', color: 'var(--padel-muted)', textAlign: 'center', marginBottom: '44px' }}>{T.pricingSubtitle}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {T.pricing.map((p, i) => (
              <div key={i} style={{ background: i === 1 ? 'rgba(16,185,129,0.08)' : 'var(--padel-card-bg)', border: i === 1 ? '2px solid var(--padel-emerald)' : '1px solid var(--padel-border)', borderRadius: '16px', padding: '28px', position: 'relative' }}>
                {i === 1 && (
                  <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--padel-emerald), var(--padel-lime))', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '12px' }}>★</span>
                )}
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--padel-text)', marginBottom: '10px' }}>{p.name}</h3>
                <div style={{ marginBottom: '18px' }}>
                  <span style={{ fontSize: '34px', fontWeight: 900, color: 'var(--padel-lime)' }}>{p.price}</span>
                  <span style={{ fontSize: '14px', color: 'var(--padel-muted)' }}>{p.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ fontSize: '14px', color: 'var(--padel-muted)', padding: '6px 0', borderBottom: '1px dashed var(--padel-border)' }}>✓ {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '70px 0', background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(132,204,22,0.1))', borderTop: '1px solid var(--padel-border)' }}>
        <div style={{ ...sectionStyle, textAlign: 'center' }}>
          <h2 style={{ fontSize: '34px', fontWeight: 900, color: 'var(--padel-text)', marginBottom: '12px' }}>{T.ctaSectionTitle}</h2>
          <p style={{ fontSize: '16px', color: 'var(--padel-muted)', maxWidth: '560px', margin: '0 auto 28px' }}>{T.ctaSectionDesc}</p>
          <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
            🚀 {T.ctaDemo}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--padel-muted)', borderTop: '1px solid var(--padel-border)' }}>
        © 2026 {T.footer} ·{' '}
        <a href="/legal" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Aviso legal / Cookies</a>
      </footer>
    </div>
  );
}