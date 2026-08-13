import React from 'react';
import { useNavigate } from 'react-router-dom';

const I18N = {
  es: {
    badge: 'OFERTA DE LANZAMIENTO · ALIANZA ESTRATÉGICA',
    title1: 'Tu federación retransmitiendo',
    title2: 'como la élite',
    sub: 'Adopta un torneo oficial con Elos oficiales, LiveScore en vivo y ranking con desempates automáticos. Sin coste para tu primer torneo digital.',
    cta: 'Probar la demo',
    ctaSub: 'Primer torneo digital de prueba sin coste',
    intlTitle: '🌍 Federaciones internacionales',
    intlSub: 'Estructuras supranacionales del pádel con las que alineamos el estándar digital.',
    natTitle: '🇪🇸 Federaciones nacionales',
    natSub: 'Cada federación construye su Ranked League oficial con badge de club.',
    offerTitle: 'Qué ofrece la alianza',
    offerSub: 'Diferencial real frente al mundo amateur, para que tu federación lidere la digitalización del pádel.',
    offers: [
      { icon: '🏆', title: 'Elos oficiales', desc: 'Motor americano/mexicano/suizo/cuadro con Elo por jugador y ranking con desempates automáticos.' },
      { icon: '📺', title: 'LiveScore en vivo', desc: 'Retransmite tus pruebas con la calidad de una emisión profesional.' },
      { icon: '🛡️', title: 'Badge de club', desc: 'Cada federación y club construye su historial y prestigio digital.' },
      { icon: '🌐', title: 'Multi-idioma', desc: 'Plataforma en español, inglés, francés y portugués para circuitos internacionales.' },
    ],
    allianceTitle: 'Convenio propuesto',
    allianceDesc: 'Empezamos con tu primer torneo digital de prueba, sin coste. Si te aporta, dialogamos un convenio oficial de colaboración para tu circuito.',
    allianceCta: 'Solicitar demo para la federación',
    footer: 'PADELORGANIZERS · THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
  },
  en: {
    badge: 'LAUNCH OFFER · STRATEGIC ALLIANCE',
    title1: 'Your federation broadcasting',
    title2: 'like the elite',
    sub: 'Adopt an official tournament with official Elos, live scoreboard and automatic tiebreaker rankings. Free for your first digital tournament.',
    cta: 'Try the demo',
    ctaSub: 'First free digital test tournament',
    intlTitle: '🌍 International federations',
    intlSub: 'Supranational padel bodies we align the digital standard with.',
    natTitle: '🇪🇸 National federations',
    natSub: 'Every federation builds its official Ranked League with club badge.',
    offerTitle: 'What the alliance offers',
    offerSub: 'Real differentiation from the amateur world, so your federation leads padel digitalization.',
    offers: [
      { icon: '🏆', title: 'Official Elos', desc: 'Americano/Mexicano/Swiss/knockout engine with per-player Elo and automatic tiebreaker rankings.' },
      { icon: '📺', title: 'LiveScore', desc: 'Broadcast your events with professional-grade live production.' },
      { icon: '🛡️', title: 'Club badge', desc: 'Every federation and club builds its history and digital prestige.' },
      { icon: '🌐', title: 'Multi-language', desc: 'Platform in Spanish, English, French and Portuguese for international circuits.' },
    ],
    allianceTitle: 'Proposed agreement',
    allianceDesc: 'We start with your first digital test tournament, free of charge. If it adds value, we discuss an official collaboration agreement for your circuit.',
    allianceCta: 'Request a federation demo',
    footer: 'PADELORGANIZERS · THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
  },
  fr: {
    badge: 'OFFRE DE LANCEMENT · ALLIANCE STRATÉGIQUE',
    title1: 'Votre fédération diffuse',
    title2: 'comme l\'élite',
    sub: 'Adoptez un tournoi officiel avec des Elos officiels, LiveScore en direct et classements à égalités automatiques. Gratuit pour votre premier tournoi numérique.',
    cta: 'Essayer la démo',
    ctaSub: 'Premier tournoi numérique d\'essai gratuit',
    intlTitle: '🌍 Fédérations internationales',
    intlSub: 'Organismes supranationaux du padel avec lesquels nous alignons le standard numérique.',
    natTitle: '🇪🇸 Fédérations nationales',
    natSub: 'Chaque fédération construit sa Ranked League officielle avec badge de club.',
    offerTitle: 'Ce que propose l\'alliance',
    offerSub: 'Un vrai différentiel face au monde amateur, pour que votre fédération mène la digitalisation du padel.',
    offers: [
      { icon: '🏆', title: 'Elos officiels', desc: 'Moteur américain/mexicain/suisse/tableau avec Elo par joueur et classement à égalités automatiques.' },
      { icon: '📺', title: 'LiveScore en direct', desc: 'Diffusez vos épreuves avec une qualité de production professionnelle.' },
      { icon: '🛡️', title: 'Badge de club', desc: 'Chaque fédération et club construit son histoire et son prestige numérique.' },
      { icon: '🌐', title: 'Multilingue', desc: 'Plateforme en espagnol, anglais, français et portugais pour les circuits internationaux.' },
    ],
    allianceTitle: 'Convention proposée',
    allianceDesc: 'Nous commençons par votre premier tournoi numérique d\'essai, sans frais. Si cela vous apporte, nous discutons d\'une convention officielle pour votre circuit.',
    allianceCta: 'Demander une démo fédération',
    footer: 'PADELORGANIZERS · THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
  },
  pt: {
    badge: 'OFERTA DE LANÇAMENTO · ALIANÇA ESTRATÉGICA',
    title1: 'A sua federação a transmitir',
    title2: 'como a elite',
    sub: 'Adote um torneio oficial com Elos oficiais, LiveScore ao vivo e classificação com desempates automáticos. Sem custo para o seu primeiro torneio digital.',
    cta: 'Experimentar a demo',
    ctaSub: 'Primeiro torneio digital de teste gratuito',
    intlTitle: '🌍 Federações internacionais',
    intlSub: 'Organismos supranacionais do padel com quem alinhamos o padrão digital.',
    natTitle: '🇪🇸 Federações nacionais',
    natSub: 'Cada federação constrói a sua Ranked League oficial com badge de clube.',
    offerTitle: 'O que a aliança oferece',
    offerSub: 'Diferencial real face ao mundo amador, para a sua federação liderar a digitalização do padel.',
    offers: [
      { icon: '🏆', title: 'Elos oficiais', desc: 'Motor americano/mexicano/suíço/eliminatória com Elo por jogador e classificação com desempates automáticos.' },
      { icon: '📺', title: 'LiveScore ao vivo', desc: 'Transmita as suas provas com qualidade de produção profissional.' },
      { icon: '🛡️', title: 'Badge de clube', desc: 'Cada federação e clube constrói a sua história e prestígio digital.' },
      { icon: '🌐', title: 'Multi-idioma', desc: 'Plataforma em espanhol, inglês, francês e português para circuitos internacionais.' },
    ],
    allianceTitle: 'Convénio proposto',
    allianceDesc: 'Começamos com o seu primeiro torneio digital de teste, sem custos. Se lhe trouxer valor, dialogamos um convénio oficial para o seu circuito.',
    allianceCta: 'Pedir demo para a federação',
    footer: 'PADELORGANIZERS · THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS',
  },
};

const INTL = {
  es: [
    ['FIP — Federación Internacional de Pádel', 'Ente rector del pádel mundial'],
    ['Premier Padel', 'Circuito profesional global'],
    ['APT Padel Tour', 'Tour profesional internacional'],
    ['FEP — Federación Europea de Pádel', 'Coordinación del pádel en Europa'],
    ['PPA — Profesional Padel Association', 'Voz de los jugadores profesionales'],
  ],
  en: [
    ['FIP — International Padel Federation', 'World governing body of padel'],
    ['Premier Padel', 'Global professional circuit'],
    ['APT Padel Tour', 'International professional tour'],
    ['European Padel Federation', 'Padel coordination in Europe'],
    ['PPA — Professional Padel Association', 'Voice of professional players'],
  ],
  fr: [
    ['FIP — Fédération Internationale de Padel', 'Organe directeur mondial du padel'],
    ['Premier Padel', 'Circuit professionnel mondial'],
    ['APT Padel Tour', 'Tour professionnel international'],
    ['Fédération Européenne de Padel', 'Coordination du padel en Europe'],
    ['PPA — Association des joueurs pros', 'Voix des joueurs professionnels'],
  ],
  pt: [
    ['FIP — Federação Internacional de Padel', 'Órgão mundial do padel'],
    ['Premier Padel', 'Circuito profissional global'],
    ['APT Padel Tour', 'Tour profissional internacional'],
    ['Federação Europeia de Padel', 'Coordenação do padel na Europa'],
    ['PPA — Associação de Jogadores Profissionais', 'Voz dos jogadores profissionais'],
  ],
};

const NAT = {
  es: [
    ['🇪🇸 FEP — Federación Española de Pádel', 'España'],
    ['🇦🇷 FAP — Federación Argentina de Pádel', 'Argentina'],
    ['🇲🇽 FMP — Federación Mexicana de Pádel', 'México'],
    ['🇮🇹 FIPel — Federazione Italiana Padel', 'Italia'],
    ['🇵🇹 Federação Portuguesa de Pádel', 'Portugal'],
    ['🇫🇷 Fédération Française de Padel', 'Francia'],
    ['🇸🇪 Svenska Padelförbundet', 'Suecia'],
    ['🇧🇪 Belgian Padel Federation', 'Bélgica'],
    ['🇳🇱 Nederlandse Padel Federatie', 'Países Bajos'],
    ['🇧🇷 Confederação Brasileira de Padel', 'Brasil'],
    ['🇺🇾 Federación Uruguaya de Pádel', 'Uruguay'],
    ['🇨🇱 Federación de Pádel de Chile', 'Chile'],
    ['🇵🇾 Federación Paraguaya de Pádel', 'Paraguay'],
    ['🇦🇹 Österreichischer Padelverband', 'Austria'],
    ['🇨🇭 Swiss Padel Federation', 'Suiza'],
    ['🇩🇰 Dansk Padel Union', 'Dinamarca'],
  ],
  en: [
    ['🇪🇸 Spanish Padel Federation', 'Spain'],
    ['🇦🇷 Argentine Padel Federation', 'Argentina'],
    ['🇲🇽 Mexican Padel Federation', 'Mexico'],
    ['🇮🇹 Italian Padel Federation', 'Italy'],
    ['🇵🇹 Portuguese Padel Federation', 'Portugal'],
    ['🇫🇷 French Padel Federation', 'France'],
    ['🇸🇪 Swedish Padel Federation', 'Sweden'],
    ['🇧🇪 Belgian Padel Federation', 'Belgium'],
    ['🇳🇱 Dutch Padel Federation', 'Netherlands'],
    ['🇧🇷 Brazilian Padel Federation', 'Brazil'],
    ['🇺🇾 Uruguayan Padel Federation', 'Uruguay'],
    ['🇨🇱 Chilean Padel Federation', 'Chile'],
    ['🇵🇾 Paraguayan Padel Federation', 'Paraguay'],
    ['🇦🇹 Austrian Padel Federation', 'Austria'],
    ['🇨🇭 Swiss Padel Federation', 'Switzerland'],
    ['🇩🇰 Danish Padel Federation', 'Denmark'],
  ],
  fr: [
    ['🇪🇸 Fédération Espagnole de Padel', 'Espagne'],
    ['🇦🇷 Fédération Argentine de Padel', 'Argentine'],
    ['🇲🇽 Fédération Mexicaine de Padel', 'Mexique'],
    ['🇮🇹 Fédération Italienne de Padel', 'Italie'],
    ['🇵🇹 Fédération Portugaise de Padel', 'Portugal'],
    ['🇫🇷 Fédération Française de Padel', 'France'],
    ['🇸🇪 Fédération Suédoise de Padel', 'Suède'],
    ['🇧🇪 Fédération Belge de Padel', 'Belgique'],
    ['🇳🇱 Fédération Néerlandaise de Padel', 'Pays-Bas'],
    ['🇧🇷 Fédération Brésilienne de Padel', 'Brésil'],
    ['🇺🇾 Fédération Uruguayenne de Padel', 'Uruguay'],
    ['🇨🇱 Fédération Chilienne de Padel', 'Chili'],
    ['🇵🇾 Fédération Paraguayenne de Padel', 'Paraguay'],
    ['🇦🇹 Fédération Autrichienne de Padel', 'Autriche'],
    ['🇨🇭 Fédération Suisse de Padel', 'Suisse'],
    ['🇩🇰 Fédération Danoise de Padel', 'Danemark'],
  ],
  pt: [
    ['🇪🇸 Federação Espanhola de Padel', 'Espanha'],
    ['🇦🇷 Federação Argentina de Padel', 'Argentina'],
    ['🇲🇽 Federação Mexicana de Padel', 'México'],
    ['🇮🇹 Federação Italiana de Padel', 'Itália'],
    ['🇵🇹 Federação Portuguesa de Padel', 'Portugal'],
    ['🇫🇷 Federação Francesa de Padel', 'França'],
    ['🇸🇪 Federação Sueca de Padel', 'Suécia'],
    ['🇧🇪 Federação Belga de Padel', 'Bélgica'],
    ['🇳🇱 Federação Holandesa de Padel', 'Países Baixos'],
    ['🇧🇷 Confederação Brasileira de Padel', 'Brasil'],
    ['🇺🇾 Federação Uruguaia de Padel', 'Uruguai'],
    ['🇨🇱 Federação Chilena de Padel', 'Chile'],
    ['🇵🇾 Federação Paraguaia de Padel', 'Paraguai'],
    ['🇦🇹 Federação Austríaca de Padel', 'Áustria'],
    ['🇨🇭 Federação Suíça de Padel', 'Suíça'],
    ['🇩🇰 Federação Dinamarquesa de Padel', 'Dinamarca'],
  ],
};

const sectionStyle = { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' };

export default function FederationsAlliance({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();
  const intl = INTL[lang] || INTL.es;
  const nat = NAT[lang] || NAT.es;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--padel-bg)', color: 'var(--padel-text)' }}>
      <section style={{ position: 'relative', padding: '60px 0 56px', overflow: 'hidden', borderBottom: '1px solid var(--padel-border)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 20%, rgba(16,185,129,0.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(234,179,8,0.1), transparent 40%)' }} />
        <div style={{ ...sectionStyle, position: 'relative', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.35)', color: '#fbbf24', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '12px', letterSpacing: '1.5px' }}>
            🤝 {T.badge}
          </span>
          <h1 style={{ fontSize: '46px', lineHeight: 1.08, fontWeight: 900, margin: '18px 0 14px', letterSpacing: '-1px' }}>
            {T.title1}<br />
            <span style={{ background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-lime) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{T.title2}</span>
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--padel-muted)', maxWidth: '720px', lineHeight: 1.7, margin: '0 auto 26px' }}>{T.sub}</p>
          <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
            🚀 {T.cta}
          </button>
          <p style={{ fontSize: '12px', color: 'var(--padel-muted)', marginTop: '10px', fontWeight: 600 }}>{T.ctaSub}</p>
        </div>
      </section>

      {/* OFERTA */}
      <section style={{ padding: '64px 0', background: 'var(--padel-card-bg)', borderBottom: '1px solid var(--padel-border)' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, textAlign: 'center', margin: '0 0 8px' }}>{T.offerTitle}</h2>
          <p style={{ fontSize: '15px', color: 'var(--padel-muted)', textAlign: 'center', margin: '0 auto 40px', maxWidth: '620px' }}>{T.offerSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {T.offers.map((o, i) => (
              <div key={i} style={{ background: 'var(--padel-bg)', border: '1px solid var(--padel-border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{o.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 6px' }}>{o.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--padel-muted)', lineHeight: 1.6, margin: 0 }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEDERACIONES INTERNACIONALES */}
      <section style={{ padding: '64px 0' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '30px', fontWeight: 900, textAlign: 'center', margin: '0 0 6px' }}>{T.intlTitle}</h2>
          <p style={{ fontSize: '14px', color: 'var(--padel-muted)', textAlign: 'center', margin: '0 0 32px' }}>{T.intlSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {intl.map(([name, role], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: '12px', padding: '14px 18px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>{name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--padel-muted)' }}>{role}</div>
                </div>
                <span style={{ color: 'var(--padel-lime)', fontSize: '18px' }}>🌐</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEDERACIONES NACIONALES */}
      <section style={{ padding: '64px 0', background: 'var(--padel-card-bg)', borderTop: '1px solid var(--padel-border)', borderBottom: '1px solid var(--padel-border)' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '30px', fontWeight: 900, textAlign: 'center', margin: '0 0 6px' }}>{T.natTitle}</h2>
          <p style={{ fontSize: '14px', color: 'var(--padel-muted)', textAlign: 'center', margin: '0 0 32px' }}>{T.natSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            {nat.map(([name, country], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: 'var(--padel-bg)', border: '1px solid var(--padel-border)', borderRadius: '12px', padding: '13px 16px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800 }}>{name}</div>
                <span style={{ fontSize: '11.5px', color: 'var(--padel-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>{country}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONVENIO */}
      <section style={{ padding: '72px 0', background: 'linear-gradient(135deg, rgba(234,179,8,0.12) 0%, rgba(16,185,129,0.1) 100%)' }}>
        <div style={{ ...sectionStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '44px', marginBottom: '14px' }}>📜</div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 12px' }}>{T.allianceTitle}</h2>
          <p style={{ fontSize: '16px', color: 'var(--padel-muted)', maxWidth: '640px', lineHeight: 1.7, margin: '0 auto 28px' }}>{T.allianceDesc}</p>
          <button onClick={() => navigate('/marketing')} className="pulse-glow" style={{ background: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)', color: '#fff', border: 'none', padding: '15px 32px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(234,179,8,0.35)' }}>
            📬 {T.allianceCta}
          </button>
        </div>
      </section>

      <footer style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--padel-muted)', borderTop: '1px solid var(--padel-border)', fontWeight: 700, letterSpacing: '0.5px' }}>
        {T.footer}
      </footer>
    </div>
  );
}