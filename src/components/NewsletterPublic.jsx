import React from 'react';
import { useNavigate } from 'react-router-dom';

const I18N = {
  es: {
    badge: '📧 PADELORGANIZERS Newsletter',
    edition: 'Agosto 2026',
    tagline: 'Las 10 noticias que mueven tu club y tu escuela de pádel — de lo local a lo internacional.',
    ctaMarketing: '🎯 Marketing & Negocio',
    ctaAlliance: '🤝 Alianza con federaciones',
    ctaTournament: '🎾 Ver torneo demo',
    local: 'LOCAL', national: 'NACIONAL', international: 'INTERNACIONAL',
    footer: 'THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
    unsubscribe: 'Recibes este boletín porque eres parte de la comunidad PADELORGANIZERS. CREATE · CONNECT · WIN.',
  },
  en: {
    badge: '📧 PADELORGANIZERS Newsletter',
    edition: 'August 2026',
    tagline: 'The 10 stories moving your padel club and school — from local to international.',
    ctaMarketing: '🎯 Marketing & Business',
    ctaAlliance: '🤝 Alliance with federations',
    ctaTournament: '🎾 View demo tournament',
    local: 'LOCAL', national: 'NATIONAL', international: 'INTERNATIONAL',
    footer: 'THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
    unsubscribe: 'You receive this newsletter as part of the PADELORGANIZERS community. CREATE · CONNECT · WIN.',
  },
  fr: {
    badge: '📧 PADELORGANIZERS Newsletter',
    edition: 'Août 2026',
    tagline: 'Les 10 actualités qui font bouger votre club et votre école de padel — du local à l\'international.',
    ctaMarketing: '🎯 Marketing & Business',
    ctaAlliance: '🤝 Alliance avec les fédérations',
    ctaTournament: '🎾 Voir le tournoi démo',
    local: 'LOCAL', national: 'NATIONAL', international: 'INTERNATIONAL',
    footer: 'THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
    unsubscribe: 'Vous recevez cette newsletter car vous faites partie de la communauté PADELORGANIZERS. CREATE · CONNECT · WIN.',
  },
  pt: {
    badge: '📧 PADELORGANIZERS Newsletter',
    edition: 'Agosto 2026',
    tagline: 'As 10 notícias que movem o seu clube e a sua escola de pádel — do local ao internacional.',
    ctaMarketing: '🎯 Marketing & Negócio',
    ctaAlliance: '🤝 Aliança com federações',
    ctaTournament: '🎾 Ver torneio demo',
    local: 'LOCAL', national: 'NACIONAL', international: 'INTERNACIONAL',
    footer: 'THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
    unsubscribe: 'Recebe esta newsletter por fazer parte da comunidade PADELORGANIZERS. CREATE · CONNECT · WIN.',
  },
};

const NEWS = {
  es: [
    { cat: 'local', icon: '🏟️', title: 'Los clubes ya no persiguen a sus jugadores para cobrar', text: 'Los partidos se reservan por la web pública del club y el pago se divide entre los 4 jugadores con un clic. Adiós a decidir “quién paga esta vez” en el grupo de WhatsApp.' },
    { cat: 'local', icon: '🎾', title: 'Directorio: cada club, su ficha digital verificada', text: 'Vigo, Madrid, Barcelona y Valencia ya tienen su perfil público con pistas, contacto y verificaciones. Cualquier jugador encuentra el club y reserva en segundos.' },
    { cat: 'national', icon: '📅', title: 'Las escuelas cierran el mes sin cuadrar asistencias', text: 'El ERP de escuela registra la asistencia del monitor, cobra de forma recurrente a fin de mes y genera la factura automáticamente. Menos Excel, más horas de pista.' },
    { cat: 'national', icon: '🏆', title: 'Los torneos sociales se organizan “cero Excel”', text: 'Americano, mexicano, suizo o eliminatorio: la IA decide formato, parejas, grupos, horarios y pistas. Cada torneo genera su propia web pública con resultados en directo.' },
    { cat: 'national', icon: '🚫', title: 'Se acabaron las pistas vacías por no-shows', text: 'Fianza reembolsable y lista de espera con un clic: si alguien falla, la plaza se cubre al instante y la pista nunca queda vacía en hora punta.' },
    { cat: 'international', icon: '🌍', title: 'Player Digital ID: el historial acompaña al jugador', text: 'Cada jugador tiene su perfil público internacional con Elo, nivel, historial, rivalidades y curva de progresión. El currículum digital del jugador amateur.' },
    { cat: 'international', icon: '📊', title: 'Padel Data Intelligence: el torneo se entiende con datos', text: 'Forma, rachas, percentil ELO, proyección de clasificación y calidad de victorias: analíticas de jugador y de club para tomar mejores decisiones.' },
    { cat: 'international', icon: '📣', title: 'El asistente de marketing genera tus campañas en 4 idiomas', text: 'Post, web, email y póster de tu torneo generados al instante en español, inglés, francés y portugués. Publica en segundos, no en horas.' },
    { cat: 'international', icon: '🤝', title: 'Las federaciones exploran la alianza estratégica', text: 'Elos oficiales, LiveScore, insignia digital y multi-idioma para federaciones. Una capa tecnológica común para los eventos de pádel globales.' },
    { cat: 'international', icon: '🚀', title: 'Tournament-as-a-Service: cada torneo es un producto digital', text: 'Inscripciones, streaming, patrocinadores, fotos y chat en una URL. El torneo deja de ser papel y se convierte en un producto digital con su propia web.' },
  ],
  en: [
    { cat: 'local', icon: '🏟️', title: 'Clubs no longer chase players to collect payment', text: 'Matches are booked through the club\'s public web and the payment splits between the 4 players in one click. Goodbye to deciding “who pays this time” in the WhatsApp group.' },
    { cat: 'local', icon: '🎾', title: 'Directory: every club, its verified digital profile', text: 'Vigo, Madrid, Barcelona and Valencia already have their public profile with courts, contact and verifications. Any player finds the club and books in seconds.' },
    { cat: 'national', icon: '📅', title: 'Schools close the month without manual attendance', text: 'The school ERP records coach attendance, charges recurrently at month end and generates the invoice automatically. Less Excel, more court time.' },
    { cat: 'national', icon: '🏆', title: 'Social tournaments organised “zero Excel”', text: 'Americano, Mexican, Swiss or knockout: the AI decides format, pairs, groups, schedules and courts. Each tournament generates its own public web with live results.' },
    { cat: 'national', icon: '🚫', title: 'No more empty courts from no-shows', text: 'Refundable deposit and one-click waiting list: if someone fails, the slot is covered instantly and the court is never empty at peak times.' },
    { cat: 'international', icon: '🌍', title: 'Player Digital ID: the record follows the player', text: 'Every player has their international public profile with Elo, level, history, rivalries and progression curve. The amateur player\'s digital CV.' },
    { cat: 'international', icon: '📊', title: 'Padel Data Intelligence: tournaments understood with data', text: 'Form, streaks, ELO percentile, final projection and quality of wins: player and club analytics for better decisions.' },
    { cat: 'international', icon: '📣', title: 'The marketing assistant generates your campaigns in 4 languages', text: 'Post, web, email and poster of your tournament generated instantly in Spanish, English, French and Portuguese. Publish in seconds, not hours.' },
    { cat: 'international', icon: '🤝', title: 'Federations explore the strategic alliance', text: 'Official Elos, LiveScore, digital badge and multi-language for federations. A common technological layer for global padel events.' },
    { cat: 'international', icon: '🚀', title: 'Tournament-as-a-Service: every tournament is a digital product', text: 'Registrations, streaming, sponsors, photos and chat in one URL. The tournament stops being paper and becomes a digital product with its own web.' },
  ],
  fr: [
    { cat: 'local', icon: '🏟️', title: 'Les clubs ne courent plus après leurs joueurs pour encaisser', text: 'Les matchs se réservent sur la web publique du club et le paiement se divise entre les 4 joueurs en un clic. Fini le « qui paie cette fois » dans le groupe WhatsApp.' },
    { cat: 'local', icon: '🎾', title: 'Annuaire : chaque club, sa fiche numérique vérifiée', text: 'Vigo, Madrid, Barcelone et Valence ont déjà leur profil public avec pistes, contact et vérifications. Chaque joueur trouve le club et réserve en quelques secondes.' },
    { cat: 'national', icon: '📅', title: 'Les écoles bouclent le mois sans pointer les présences à la main', text: 'L\'ERP d\'école enregistre la présence du moniteur, encaisse de façon récurrente en fin de mois et génère la facture automatiquement. Moins d\'Excel, plus de pistes.' },
    { cat: 'national', icon: '🏆', title: 'Les tournois sociaux s\'organisent « zéro Excel »', text: 'Américain, mexicain, suisse ou élimination : l\'IA décide du format, des paires, des groupes, des horaires et des pistes. Chaque tournoi génère sa propre web publique avec résultats en direct.' },
    { cat: 'national', icon: '🚫', title: 'Fini les pistes vides à cause des no-shows', text: 'Caution remboursable et liste d\'attente en un clic : si quelqu\'un défaille, la place est couverte immédiatement et la piste n\'est jamais vide en heure de pointe.' },
    { cat: 'international', icon: '🌍', title: 'Player Digital ID : le palmarès suit le joueur', text: 'Chaque joueur a son profil public international avec Elo, niveau, historique, rivalités et courbe de progression. Le CV numérique du joueur amateur.' },
    { cat: 'international', icon: '📊', title: 'Padel Data Intelligence : comprendre le tournoi avec les données', text: 'Forme, séries, percentile ELO, projection finale et qualité des victoires : analyses de joueur et de club pour mieux décider.' },
    { cat: 'international', icon: '📣', title: 'L\'assistant marketing génère vos campagnes en 4 langues', text: 'Post, web, e-mail et affiche de votre tournoi générés instantanément en espagnol, anglais, français et portugais. Publiez en secondes, pas en heures.' },
    { cat: 'international', icon: '🤝', title: 'Les fédérations explorent l\'alliance stratégique', text: 'Elos officiels, LiveScore, badge numérique et multilingue pour les fédérations. Une couche technologique commune pour les événements mondiaux de padel.' },
    { cat: 'international', icon: '🚀', title: 'Tournament-as-a-Service : chaque tournoi est un produit numérique', text: 'Inscriptions, streaming, sponsors, photos et chat sur une URL. Le tournoi cesse d\'être du papier et devient un produit numérique avec sa propre web.' },
  ],
  pt: [
    { cat: 'local', icon: '🏟️', title: 'Os clubes deixam de perseguir os jogadores para cobrar', text: 'Os jogos são reservados pela web pública do clube e o pagamento divide-se entre os 4 jogadores com um clique. Adeus ao “quem paga desta vez” no grupo de WhatsApp.' },
    { cat: 'local', icon: '🎾', title: 'Diretório: cada clube, a sua ficha digital verificada', text: 'Vigo, Madrid, Barcelona e Valência já têm o seu perfil público com pistas, contacto e verificações. Qualquer jogador encontra o clube e reserva em segundos.' },
    { cat: 'national', icon: '📅', title: 'As escolas fecham o mês sem conferir presenças à mão', text: 'O ERP de escola regista a presença do monitor, cobra de forma recorrente no fim do mês e gera a fatura automaticamente. Menos Excel, mais tempo de pista.' },
    { cat: 'national', icon: '🏆', title: 'Os torneios sociais organizam-se “zero Excel”', text: 'Americano, mexicano, suíço ou eliminação: a IA decide formato, pares, grupos, horários e pistas. Cada torneio gera a sua própria web pública com resultados ao vivo.' },
    { cat: 'national', icon: '🚫', title: 'Sem mais pistas vazias por no-shows', text: 'Caução reembolsável e lista de espera com um clique: se alguém faltar, a vaga é coberta de imediato e a pista nunca fica vazia em hora de ponta.' },
    { cat: 'international', icon: '🌍', title: 'Player Digital ID: o histórico acompanha o jogador', text: 'Cada jogador tem o seu perfil público internacional com Elo, nível, histórico, rivalidades e curva de progressão. O currículo digital do jogador amador.' },
    { cat: 'international', icon: '📊', title: 'Padel Data Intelligence: entender o torneio com dados', text: 'Forma, sequências, percentil ELO, projeção final e qualidade das vitórias: análises de jogador e de clube para melhores decisões.' },
    { cat: 'international', icon: '📣', title: 'O assistente de marketing gera as suas campanhas em 4 idiomas', text: 'Post, web, e-mail e cartaz do seu torneio gerados instantaneamente em espanhol, inglês, francês e português. Publique em segundos, não em horas.' },
    { cat: 'international', icon: '🤝', title: 'As federações exploram a aliança estratégica', text: 'Elos oficiais, LiveScore, selo digital e multilingue para federações. Uma camada tecnológica comum para os eventos globais de pádel.' },
    { cat: 'international', icon: '🚀', title: 'Tournament-as-a-Service: cada torneio é um produto digital', text: 'Inscrições, streaming, patrocinadores, fotos e chat num URL. O torneio deixa de ser papel e torna-se um produto digital com a sua própria web.' },
  ],
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const catColor = { local: '#10b981', national: '#38bdf8', international: '#fbbf24' };

export default function NewsletterPublic({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();
  const items = NEWS[lang] || NEWS.es;

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px' }}>
        {/* Cabecera */}
        <div style={{ ...card, padding: 26, background: 'linear-gradient(135deg,#0c1f1a,#0e241f)', borderColor: 'rgba(132,204,22,0.35)', textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: '#a3e635', padding: '5px 14px', borderRadius: 99, background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.3)' }}>{T.badge}</span>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: '14px 0 6px', color: 'var(--padel-text)' }}>🗞️ {T.edition}</h1>
          <p style={{ fontSize: 13.5, color: 'var(--padel-muted)', maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>{T.tagline}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, padding: '4px 12px', borderRadius: 99, background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>{T.local}</span>
            <span style={{ fontSize: 10.5, fontWeight: 800, padding: '4px 12px', borderRadius: 99, background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>{T.national}</span>
            <span style={{ fontSize: 10.5, fontWeight: 800, padding: '4px 12px', borderRadius: 99, background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>{T.international}</span>
          </div>
        </div>

        {/* 10 noticias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14, marginTop: 18 }}>
          {items.map((n, i) => (
            <div key={i} style={{ ...card, display: 'flex', flexDirection: 'column', borderColor: `rgba(16,185,129,0.15)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, padding: '3px 9px', borderRadius: 99, background: `${catColor[n.cat]}1a`, color: catColor[n.cat] }}>{T[n.cat]}</span>
                <span style={{ fontSize: 20 }}>{n.icon}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--padel-text)', lineHeight: 1.35 }}>{n.title}</div>
              <p style={{ fontSize: 12.5, color: 'var(--padel-muted)', lineHeight: 1.6, margin: '8px 0 0' }}>{n.text}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ ...card, marginTop: 18, textAlign: 'center', borderColor: 'rgba(132,204,22,0.3)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 900, color: 'var(--padel-text)', margin: '0 0 4px' }}>CREATE · CONNECT · WIN</h2>
          <p style={{ fontSize: 12.5, color: 'var(--padel-muted)', margin: '0 0 16px' }}>{T.footer}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/marketing')} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{T.ctaMarketing}</button>
            <button onClick={() => navigate('/alianza')} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{T.ctaAlliance}</button>
            <button onClick={() => navigate('/tournament/open-padel-vigo-2026')} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{T.ctaTournament}</button>
          </div>
          <p style={{ fontSize: 10.5, color: '#475569', margin: '18px 0 0', letterSpacing: 0.5 }}>{T.unsubscribe}</p>
        </div>
      </div>
    </div>
  );
}
