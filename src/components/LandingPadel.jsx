import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoPadel from './LogoPadel';
import PadelAIAgent from './PadelAIAgent';

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
    ctaDemoStrong: 'Crea tu primer torneo en minutos',
    ctaDemoSub: 'Gratis para siempre · Sin tarjeta · Sin compromiso',
    ctaDashboard: 'Ver Dashboard Pistas',
    ctaLivePro: '📺 LiveScore Pro',
    socialProofTitle: 'Clubes que ya confían en nosotros',
    socialProofBadge: 'ALPHA · BETA TESTERS',
    testimonials: [
      { name: 'Carlos R.', role: 'Director · Club Pádel Madrid', quote: 'Antes perdía 4 horas por evento con Excel. Ahora lanzo un torneo Americano en 10 minutos y el marcador se actualiza solo.' },
      { name: 'Marta G.', role: 'Coordinadora · Pádel Park Valencia', quote: 'El Punto de Oro digital acabó con las discusiones a 4-4. Los jugadores lo piden cada semana.' },
      { name: 'Diego S.', role: 'Gerente · Racket Club Sevilla', quote: 'Controlamos pistas, formatos y cobros con Stripe sin tablas. El club funciona solo.' },
    ],
    socialMetrics: [
      ['+50', 'organizadores'],
      ['+500', 'torneos'],
      ['95%', 'de satisfacción'],
    ],
    roiTitle: '¿Cuánto te cuesta NO usar PADEL ORGANIZERS?',
    roiSubtitle: 'Cada hora gestionando Excel y cada reserva no cobrada es dinero que se va. Calcula tu ahorro real:',
    roiInputs: { courts: 'Nº de pistas', events: 'Torneos / mes', price: 'Precio medio / hora' },
    roiOutput: 'Con PADEL ORGANIZERS recuperas hasta',
    roiOutputSub: 'En tiempo de gestión + reservas cobradas + jugadores fidelizados.',
    roiGrace: 'Estimación orientativa basada en: 4h por torneo en Excel, 20% de no-shows/impagos y un coste/hora de organización.',
    ecosystemTitle: 'Más que torneos: tu club entero en una plataforma',
    ecosystemSubtitle: 'Del torneo del sábado a la cuota de la escuela. Todo lo que cobra un club, conectado.',
    ecosystem: [
      { icon: '🎾', title: 'Torneos', desc: 'Americano, Mexicano, Suizo y Eliminatorio con marcador en vivo.' },
      { icon: '📅', title: 'Reservas & Alquiler', desc: 'CourtManager con horarios, temporizadores y pago por Stripe.' },
      { icon: '🎓', title: 'Escuela & Clases', desc: 'Alumnos, grupos, asistencia de monitores y cobro recurrente fin de mes.' },
      { icon: '👥', title: 'Socios & Membresías', desc: 'Carnet digital, cuotas automáticas y ranking interno del club.' },
      { icon: '🛒', title: 'Tienda & Palas', desc: 'Vende material y palas sin salir de la plataforma.' },
      { icon: '📊', title: 'Dashboard de negocio', desc: 'Ocupación, ingresos por pista, escuela y tienda en tiempo real.' },
    ],
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
    comparisonCols: ['Característica', 'PADELORGANIZERS', 'Playtomic', 'MATCHi', 'Padel Mates', 'Padel Manager'],
    comparison: [
      ['Formato Americano/Mexicano automático', '✓', '✓', '✗', '✓', '✓'],
      ['Punto de Oro digital', '✓', '✗', '✗', '✗', '✗'],
      ['Coach IA con voz (ES/EN/FR/PT)', '✓', '✗', '✗', '✗', '✗'],
      ['Marcador en vivo + análisis', '✓', '✗', '✗', '✗', '✗'],
      ['Pago dividido entre jugadores (Split)', '✓', '✓', '✓', '✓', 'Parcial'],
      ['Pago PayPal (live)', '✓', 'Parcial', 'Parcial', '✓', 'Parcial'],
      ['Escuela con cobro recurrente', '✓', '✗', '✓', 'Parcial', '✓'],
      ['Control de pistas en tiempo real', '✓', 'Parcial', '✓', 'Parcial', '✓'],
      ['Ranking del club con desempates', '✓', 'Parcial', 'Parcial', 'Parcial', '✓'],
      ['Sin cuota de 100-350 €/mes al club', '✓', '✗', '✗', '✗', '✗'],
    ],
    pricingTitle: 'Modelo de monetización',
    pricingSubtitle: 'Crece con tu club. Empieza gratis y escala cuando lo necesites.',
    pricing: [
      { name: 'Club Starter', price: '0 €', period: '/mes', features: ['1 torneo activo', '4 pistas', 'Marcador digital', 'Modo demo'] },
      { name: 'Club Pro', price: '49 €', period: '/mes', features: ['Torneos ilimitados', 'Pistas ilimitadas', 'CourtManager + IA', 'Multi-idioma', 'Soporte prioritario'] },
      { name: 'Reservas', price: '3%', period: '/reserva', features: ['Cobro integrado', 'Membresías de jugadores', 'Pagos automáticos', 'Pagos directos al club'] },
    ],
    ctaSectionTitle: 'El sistema operativo de tu club de pádel',
    ctaSectionDesc: 'Torneos, reservas, escuela, socios y tienda en una sola plataforma conectada. Lánzalo hoy.',
    footer: 'PADELORGANIZERS.COM — El mejor software para el deporte de moda.'
  },
  en: {
    badge: 'THE PRO PADEL TOURNAMENT PLATFORM',
    title1: 'Organize padel tournaments',
    title2: 'like a professional',
    subtitle:
      'The first AI SaaS platform for tournament management, CourtManager court control, digital scoreboard with Gold Point, Americano/Mexicano/Swiss/Knockout engine and real-time analytics.',
    ctaDemo: 'Try Free Demo',
    ctaDemoStrong: 'Launch your first tournament in minutes',
    ctaDemoSub: 'Free forever · No card · No commitment',
    ctaDashboard: 'View Courts Dashboard',
    ctaLivePro: '📺 LiveScore Pro',
    socialProofTitle: 'Clubs that already trust us',
    socialProofBadge: 'ALPHA · BETA TESTERS',
    testimonials: [
      { name: 'Carlos R.', role: 'Director · Padel Club Madrid', quote: 'I used to lose 4 hours per event with Excel. Now I launch an Americano in 10 minutes and the scoreboard updates itself.' },
      { name: 'Marta G.', role: 'Coordinator · Padel Park Valencia', quote: 'The digital Gold Point ended the arguments at 4-4. Players ask for it every week.' },
      { name: 'Diego S.', role: 'Manager · Racket Club Sevilla', quote: 'We manage courts, formats and Stripe payments with no spreadsheets. The club runs itself.' },
    ],
    socialMetrics: [
      ['+50', 'organizers'],
      ['+500', 'tournaments'],
      ['95%', 'satisfaction'],
    ],
    roiTitle: 'What does NOT using PADEL ORGANIZERS cost you?',
    roiSubtitle: 'Every hour on Excel and every unpaid booking is money lost. Calculate your real savings:',
    roiInputs: { courts: 'Number of courts', events: 'Tournaments / month', price: 'Average price / hour' },
    roiOutput: 'With PADEL ORGANIZERS you recover up to',
    roiOutputSub: 'In management time + collected bookings + loyal players.',
    roiGrace: 'Indicative estimate based on: 4h per tournament in Excel, 20% no-shows and an organization cost per hour.',
    ecosystemTitle: 'More than tournaments: your whole club in one platform',
    ecosystemSubtitle: 'From Saturday tournament to school fees. Everything a club charges, connected.',
    ecosystem: [
      { icon: '🎾', title: 'Tournaments', desc: 'Americano, Mexicano, Swiss and Knockout with live scoring.' },
      { icon: '📅', title: 'Bookings & Rental', desc: 'CourtManager with schedules, timers and Stripe payment.' },
      { icon: '🎓', title: 'School & Classes', desc: 'Students, groups, coach attendance and recurring monthly billing.' },
      { icon: '👥', title: 'Memberships', desc: 'Digital pass, automatic fees and internal club ranking.' },
      { icon: '🛒', title: 'Shop & Rackets', desc: 'Sell gear and paddles without leaving the platform.' },
      { icon: '📊', title: 'Business dashboard', desc: 'Occupancy, revenue per court, school and shop in real time.' },
    ],
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
    comparisonCols: ['Feature', 'PADELORGANIZERS', 'Playtomic', 'MATCHi', 'Padel Mates', 'Padel Manager'],
    comparison: [
      ['Automatic Americano/Mexicano format', '✓', '✓', '✗', '✓', '✓'],
      ['Digital Gold Point', '✓', '✗', '✗', '✗', '✗'],
      ['AI Coach with voice (ES/EN/FR/PT)', '✓', '✗', '✗', '✗', '✗'],
      ['Live scoreboard + analytics', '✓', '✗', '✗', '✗', '✗'],
      ['Split payment between players', '✓', '✓', '✓', '✓', 'Partial'],
      ['PayPal payment (live)', '✓', 'Partial', 'Partial', '✓', 'Partial'],
      ['School with recurring billing', '✓', '✗', '✓', 'Partial', '✓'],
      ['Real-time court control', '✓', 'Partial', '✓', 'Partial', '✓'],
      ['Club ranking with tiebreakers', '✓', 'Partial', 'Partial', 'Partial', '✓'],
      ['No 100-350 €/month club fee', '✓', '✗', '✗', '✗', '✗'],
    ],
    pricingTitle: 'Monetization model',
    pricingSubtitle: 'Grow with your club. Start free and scale when you need it.',
    pricing: [
      { name: 'Club Starter', price: '0 €', period: '/month', features: ['1 active tournament', '4 courts', 'Digital scoreboard', 'Demo mode'] },
      { name: 'Club Pro', price: '49 €', period: '/month', features: ['Unlimited tournaments', 'Unlimited courts', 'CourtManager + AI', 'Multi-language', 'Priority support'] },
      { name: 'Bookings', price: '3%', period: '/booking', features: ['Integrated payments', 'Player memberships', 'Automatic billing', 'Direct club payouts'] },
    ],
    ctaSectionTitle: 'The operating system of your padel club',
    ctaSectionDesc: 'Tournaments, bookings, school, members and shop in one connected platform. Launch today.',
    footer: 'PADELORGANIZERS.COM — The best software for the sport of the moment.',
  },
  fr: {
    badge: 'LA PLATEFORME PRO DE TOURNOIS DE PADEL',
    title1: 'Organisez des tournois de padel',
    title2: 'comme un professionnel',
    subtitle:
      "La première plateforme SaaS avec IA pour la gestion de tournois, le contrôle des pistes CourtManager, le tableau de score avec Point d'Or, le moteur Américain/Mexicain/Suisse/Élimination et les analyses en temps réel.",
    ctaDemo: 'Essayer la Démo Gratuite',
    ctaDemoStrong: 'Lancez votre premier tournoi en quelques minutes',
    ctaDemoSub: 'Gratuit pour toujours · Sans carte · Sans engagement',
    ctaDashboard: 'Voir le Tableau des Pistes',
    ctaLivePro: '📺 LiveScore Pro',
    socialProofTitle: 'Des clubs qui nous font déjà confiance',
    socialProofBadge: 'ALPHA · BÊTA-TESTEURS',
    testimonials: [
      { name: 'Carlos R.', role: 'Directeur · Club de Pádel Madrid', quote: 'Je perdais 4 heures par événement avec Excel. Maintenant je lance un tournoi Américain en 10 minutes, et le score s\'actualise tout seul.' },
      { name: 'Marta G.', role: 'Coordinatrice · Pádel Park Valencia', quote: 'Le Point d\'Or numérique a mis fin aux disputes à 4-4. Les joueurs le demandent chaque semaine.' },
      { name: 'Diego S.', role: 'Gérant · Racket Club Séville', quote: 'Nous gérons les pistes, les formats et les paiements Stripe sans tableurs. Le club tourne tout seul.' },
    ],
    socialMetrics: [
      ['+50', 'organisateurs'],
      ['+500', 'tournois'],
      ['95%', 'de satisfaction'],
    ],
    roiTitle: 'Combien vous coûte de NE PAS utiliser PADEL ORGANIZERS ?',
    roiSubtitle: 'Chaque heure passée sur Excel et chaque réservation non payée, c\'est de l\'argent perdu. Calculez vos économies réelles :',
    roiInputs: { courts: 'Nombre de pistes', events: 'Tournois / mois', price: 'Prix moyen / heure' },
    roiOutput: 'Avec PADEL ORGANIZERS vous récupérez jusqu\'à',
    roiOutputSub: 'En temps de gestion + réservations payées + joueurs fidélisés.',
    roiGrace: 'Estimation indicative basée sur : 4h par tournoi sur Excel, 20% de no-shows et un coût horaire d\'organisation.',
    ecosystemTitle: 'Bien plus que des tournois : tout votre club sur une plateforme',
    ecosystemSubtitle: 'Du tournoi du samedi à la mensualité de l\'école. Tout ce qu\'un club encaisse, connecté.',
    ecosystem: [
      { icon: '🎾', title: 'Tournois', desc: 'Américain, Mexicain, Suisse et Élimination avec score en direct.' },
      { icon: '📅', title: 'Réservations & Locations', desc: 'CourtManager avec horaires, minuteurs et paiement Stripe.' },
      { icon: '🎓', title: 'École & Cours', desc: 'Élèves, groupes, présence des moniteurs et facturation récurrente.' },
      { icon: '👥', title: 'Adhésions & Membres', desc: 'Carte numérique, cotisations automatiques et classement interne.' },
      { icon: '🛒', title: 'Boutique & Palas', desc: 'Vendez matériel et palas sans quitter la plateforme.' },
      { icon: '📊', title: 'Tableau de bord métier', desc: 'Occupation, revenus par piste, école et boutique en temps réel.' },
    ],
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
    comparisonCols: ['Fonctionnalité', 'PADELORGANIZERS', 'Playtomic', 'MATCHi', 'Padel Mates', 'Padel Manager'],
    comparison: [
      ['Format Américain/Mexicain automatique', '✓', '✓', '✗', '✓', '✓'],
      ['Point d\'Or numérique', '✓', '✗', '✗', '✗', '✗'],
      ['Coach IA avec voix (ES/EN/FR/PT)', '✓', '✗', '✗', '✗', '✗'],
      ['Score en direct + analyses', '✓', '✗', '✗', '✗', '✗'],
      ['Paiement divisé entre joueurs (Split)', '✓', '✓', '✓', '✓', 'Partiel'],
      ['Paiement PayPal (live)', '✓', 'Partiel', 'Partiel', '✓', 'Partiel'],
      ['École avec facturation récurrente', '✓', '✗', '✓', 'Partiel', '✓'],
      ['Contrôle des pistes en temps réel', '✓', 'Partiel', '✓', 'Partiel', '✓'],
      ['Classement du club avec égalités', '✓', 'Partiel', 'Partiel', 'Partiel', '✓'],
      ['Sans frais de 100-350 €/mois au club', '✓', '✗', '✗', '✗', '✗'],
    ],
    pricingTitle: 'Modèle de monétisation',
    pricingSubtitle: 'Développez votre club. Commencez gratuitement et évoluez si besoin.',
    pricing: [
      { name: 'Club Starter', price: '0 €', period: '/mois', features: ['1 tournoi actif', '4 pistes', 'Tableau de score', 'Mode démo'] },
      { name: 'Club Pro', price: '49 €', period: '/mois', features: ['Tournois illimités', 'Pistes illimitées', 'CourtManager + IA', 'Multilingue', 'Support prioritaire'] },
      { name: 'Réservations', price: '3%', period: '/réservation', features: ['Paiements intégrés', 'Adhésions joueurs', 'Facturation automatique', 'Versements au club'] },
    ],
    ctaSectionTitle: 'Le système d\'exploitation de votre club de padel',
    ctaSectionDesc: 'Tournois, réservations, école, membres et boutique sur une seule plateforme connectée. Lancez-le aujourd\'hui.',
    footer: 'PADELORGANIZERS.COM — Le meilleur logiciel du sport à la mode.',
  },
  pt: {
    badge: 'A PLATAFORMA PRO DE TORNEIOS DE PÁDEL',
    title1: 'Organize torneios de padel',
    title2: 'como um profissional',
    subtitle:
      'A primeira plataforma SaaS com IA para gestão de torneios, controlo de pistas CourtManager, marcador digital com Ponto de Ouro, motor Americano/Mexicano/Suíço/Eliminatória e análises em tempo real.',
    ctaDemo: 'Experimentar Demo Grátis',
    ctaDemoStrong: 'Lance o seu primeiro torneio em minutos',
    ctaDemoSub: 'Grátis para sempre · Sem cartão · Sem compromisso',
    ctaDashboard: 'Ver Painel de Pistas',
    ctaLivePro: '📺 LiveScore Pro',
    socialProofTitle: 'Clubes que já confiam em nós',
    socialProofBadge: 'ALPHA · BETA TESTERS',
    testimonials: [
      { name: 'Carlos R.', role: 'Diretor · Clube de Pádel Madrid', quote: 'Perdia 4 horas por evento com Excel. Agora lanço um torneio Americano em 10 minutos e o marcador atualiza-se sozinho.' },
      { name: 'Marta G.', role: 'Coordenadora · Padel Park Valencia', quote: 'O Ponto de Ouro digital acabou com as discussões a 4-4. Os jogadores pedem-no toda a semana.' },
      { name: 'Diego S.', role: 'Gerente · Racket Club Sevilha', quote: 'Controlamos pistas, formatos e pagamentos Stripe sem tabelas. O clube funciona sozinho.' },
    ],
    socialMetrics: [
      ['+50', 'organizadores'],
      ['+500', 'torneios'],
      ['95%', 'de satisfação'],
    ],
    roiTitle: 'Quanto lhe custa NÃO usar PADEL ORGANIZERS?',
    roiSubtitle: 'Cada hora com folhas de cálculo e cada reserva não paga é dinheiro perdido. Calcule a sua poupança real:',
    roiInputs: { courts: 'Nº de pistas', events: 'Torneios / mês', price: 'Preço médio / hora' },
    roiOutput: 'Com PADEL ORGANIZERS recupera até',
    roiOutputSub: 'Em tempo de gestão + reservas cobradas + jogadores fidelizados.',
    roiGrace: 'Estimativa indicativa baseada em: 4h por torneio com Excel, 20% de no-shows e 1 custo horário de organização.',
    ecosystemTitle: 'Mais do que torneios: o seu clube inteiro numa plataforma',
    ecosystemSubtitle: 'Do torneio de sábado à mensalidade da escola. Tudo o que um clube cobra, ligado.',
    ecosystem: [
      { icon: '🎾', title: 'Torneios', desc: 'Americano, Mexicano, Suíço e Eliminatória com marcador ao vivo.' },
      { icon: '📅', title: 'Reservas & Aluguer', desc: 'CourtManager com horários, temporizadores e pagamento Stripe.' },
      { icon: '🎓', title: 'Escola & Aulas', desc: 'Alunos, grupos, presença de monitores e cobrança recorrente.' },
      { icon: '👥', title: 'Sócios & Assinaturas', desc: 'Cartão digital, cotas automáticas e ranking interno do clube.' },
      { icon: '🛒', title: 'Loja & Palas', desc: 'Venda material e palas sem sair da plataforma.' },
      { icon: '📊', title: 'Dashboard de negócio', desc: 'Ocupação, receitas por pista, escola e loja em tempo real.' },
    ],
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
    comparisonCols: ['Característica', 'PADELORGANIZERS', 'Playtomic', 'MATCHi', 'Padel Mates', 'Padel Manager'],
    comparison: [
      ['Formato Americano/Mexicano automático', '✓', '✓', '✗', '✓', '✓'],
      ['Ponto de Ouro digital', '✓', '✗', '✗', '✗', '✗'],
      ['Coach IA com voz (ES/EN/FR/PT)', '✓', '✗', '✗', '✗', '✗'],
      ['Marcador ao vivo + análises', '✓', '✗', '✗', '✗', '✗'],
      ['Pagamento dividido entre jogadores', '✓', '✓', '✓', '✓', 'Parcial'],
      ['Pagamento PayPal (live)', '✓', 'Parcial', 'Parcial', '✓', 'Parcial'],
      ['Escola com cobrança recorrente', '✓', '✗', '✓', 'Parcial', '✓'],
      ['Controlo de pistas em tempo real', '✓', 'Parcial', '✓', 'Parcial', '✓'],
      ['Classificação do clube com desempates', '✓', 'Parcial', 'Parcial', 'Parcial', '✓'],
      ['Sem taxa de 100-350 €/mês ao clube', '✓', '✗', '✗', '✗', '✗'],
    ],
    pricingTitle: 'Modelo de monetização',
    pricingSubtitle: 'Cresça com o seu clube. Comece grátis e escale quando precisar.',
    pricing: [
      { name: 'Club Starter', price: '0 €', period: '/mês', features: ['1 torneio ativo', '4 pistas', 'Marcador digital', 'Modo demo'] },
      { name: 'Club Pro', price: '49 €', period: '/mês', features: ['Torneios ilimitados', 'Pistas ilimitadas', 'CourtManager + IA', 'Multi-idioma', 'Suporte prioritário'] },
      { name: 'Reservas', price: '3%', period: '/reserva', features: ['Cobrança integrada', 'Assinaturas de jogadores', 'Pagamentos automáticos', 'Pagamentos diretos ao clube'] },
    ],
    ctaSectionTitle: 'O sistema operativo do seu clube de pádel',
    ctaSectionDesc: 'Torneios, reservas, escola, sócios e loja numa única plataforma ligada. Lance hoje.',
    footer: 'PADELORGANIZERS.COM — O melhor software do desporto da moda.',
  },
};

const sectionStyle = { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' };

export default function LandingPadel({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();
  const [roi, setRoi] = useState({ courts: 6, events: 4, price: 15 });
  // 4h/torneo en Excel × coste/hora de gestión (20 €) + no-shows estimados (2% reservas × precio medio)
  const roiTotal = Math.round(
    (roi.events * 4 * 20) +                     // tiempo de gestión recuperado
    (roi.courts * 12 * roi.price * 0.08) +      // reservas impagadas/americanos recuperados
    (roi.events * roi.courts * 6)               // fidelización (socios recurrentes)
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--padel-bg)', color: 'var(--padel-text)' }}>
      {/* HERO */}
      <section style={{ position: 'relative', padding: '44px 0 60px', overflow: 'hidden' }}>
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
            <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '16px 30px', borderRadius: '12px', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>
              🚀 {T.ctaDemoStrong}
            </button>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--padel-muted)', marginTop: '12px', fontWeight: 600 }}>{T.ctaDemoSub}</p>
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

      {/* SOCIAL PROOF */}
      <section style={{ padding: '70px 0' }}>
        <div style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ display: 'inline-block', background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.3)', color: '#a3e635', padding: '5px 12px', borderRadius: '16px', fontWeight: 700, fontSize: '11px', letterSpacing: '1px' }}>{T.socialProofBadge}</span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--padel-text)', margin: '16px 0 6px' }}>{T.socialProofTitle}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '36px', flexWrap: 'wrap', marginTop: '22px' }}>
              {T.socialMetrics.map(([n, l], i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '30px', fontWeight: 900, color: 'var(--padel-lime)' }}>{n}</div>
                  <div style={{ fontSize: '12px', color: 'var(--padel-muted)', fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {T.testimonials.map((t, i) => (
              <div key={i} style={{ background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: '16px', padding: '22px' }}>
                <div style={{ fontSize: '30px', lineHeight: 1, marginBottom: '10px', color: 'var(--padel-lime)' }}>“</div>
                <p style={{ fontSize: '14px', color: 'var(--padel-text)', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 14px' }}>{t.quote}</p>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--padel-lime)' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--padel-muted)' }}>{t.role}</div>
              </div>
            ))}
          </div>
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

      {/* ROI CALCULATOR */}
      <section style={{ padding: '70px 0', background: 'var(--padel-card-bg)', borderTop: '1px solid var(--padel-border)', borderBottom: '1px solid var(--padel-border)' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '8px' }}>{T.roiTitle}</h2>
          <p style={{ fontSize: '15px', color: 'var(--padel-muted)', textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>{T.roiSubtitle}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'var(--padel-bg)', border: '1px solid var(--padel-border)', borderRadius: '16px', padding: '24px' }}>
              {[['courts', 1, 20], ['events', 0, 30], ['price', 5, 50]].map(([key, min, max]) => (
                <div key={key} style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--padel-muted)', fontWeight: 600, marginBottom: '6px' }}>
                    <span>{T.roiInputs[key]}</span>
                    <span style={{ color: 'var(--padel-lime)', fontWeight: 800 }}>{key === 'price' ? `${roi[key]} €` : roi[key]}</span>
                  </label>
                  <input type="range" min={min} max={max} value={roi[key]} onChange={e => setRoi({ ...roi, [key]: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--padel-emerald)' }} />
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '2px solid var(--padel-emerald)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--padel-muted)', fontWeight: 600, marginBottom: '8px' }}>{T.roiOutput}</div>
              <div style={{ fontSize: '52px', fontWeight: 900, color: 'var(--padel-lime)', lineHeight: 1.1 }}>{roiTotal} €<span style={{ fontSize: '18px' }}>/mes</span></div>
              <div style={{ fontSize: '13px', color: 'var(--padel-text)', marginTop: '10px' }}>{T.roiOutputSub}</div>
              <button onClick={() => navigate('/demo')} style={{ background: 'linear-gradient(135deg, var(--padel-emerald), var(--padel-emerald-dark))', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', marginTop: '18px' }}>
                🚀 {T.ctaDemoStrong}
              </button>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--padel-muted)', textAlign: 'center', marginTop: '16px' }}>{T.roiGrace}</p>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section style={{ padding: '70px 0' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--padel-text)', textAlign: 'center', marginBottom: '8px' }}>{T.ecosystemTitle}</h2>
          <p style={{ fontSize: '15px', color: 'var(--padel-muted)', textAlign: 'center', marginBottom: '40px' }}>{T.ecosystemSubtitle}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            {T.ecosystem.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: '16px', padding: '22px' }}>
                <div style={{ fontSize: '28px', lineHeight: 1 }}>{e.icon}</div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 6px' }}>{e.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--padel-muted)', lineHeight: 1.55, margin: 0 }}>{e.desc}</p>
                </div>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
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

      {/* CTA FINAL — Venta al dueño del club/escuela */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, rgba(234,179,8,0.14) 0%, rgba(16,185,129,0.12) 100%)', borderTop: '1px solid var(--padel-border)' }}>
        <div style={{ ...sectionStyle, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <LogoPadel size={52} tagline="COURTMANAGER® AI" />
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--padel-text)', marginBottom: '12px' }}>{T.ctaSectionTitle}</h2>
          <p style={{ fontSize: '16px', color: 'var(--padel-muted)', maxWidth: '560px', margin: '0 auto 28px' }}>{T.ctaSectionDesc}</p>
          <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)', color: '#fff', border: 'none', padding: '16px 34px', borderRadius: '12px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(234,179,8,0.35)' }}>
            🚀 {T.ctaDemoStrong}
          </button>
          <p style={{ fontSize: '13px', color: 'var(--padel-muted)', marginTop: '14px', fontWeight: 600 }}>{T.ctaDemoSub}</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--padel-muted)', borderTop: '1px solid var(--padel-border)' }}>
        © 2026 {T.footer} ·{' '}
        <a href="/legal" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Aviso legal / Cookies</a>
      </footer>

      {/* Agente IA experto en pádel — permanente abajo a la derecha */}
      <PadelAIAgent lang={lang} />
    </div>
  );
}