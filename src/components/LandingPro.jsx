import React from 'react';
import { useNavigate } from 'react-router-dom';

const I18N = {
  es: {
    badge: 'CREATE. CONNECT. WIN.',
    title: 'La infraestructura digital',
    title2: 'de los eventos globales de pádel',
    subtitle:
      'PADELORGANIZERS.COM es la capa tecnológica que conecta jugadores, clubes, organizadores, datos y patrocinadores: IA para crear el torneo óptimo, resultado en directo que se propaga a cuadro, ranking y perfil, y monetización de cada evento. Cada torneo se convierte en un producto digital.',
    ctaDemo: '🚀 Probar la demo',
    ctaClub: 'Solicitar plan club',
    offerTitle: 'Oferta de lanzamiento',
    offers: [
      { name: 'Club Starter', price: '0 €', period: '/mes', features: ['1 torneo activo', '4 pistas', 'Marcador Punto de Oro', 'LiveScore', 'Analíticas'], hot: false },
      { name: 'Club Pro', price: 'GRATIS 3 MESES', period: '· luego 49 €/mes', features: ['Torneos y pistas ilimitadas', 'CourtManager + IA', 'Reservas con Stripe', 'Ranked League', 'Soporte prioritario'], hot: true },
    ],
    segmentsTitle: 'Diseñado para cada segmento',
    segments: [
      { icon: '🏟️', who: 'Clubes & Escuelas', title: 'Menos staff, más dinero', points: ['Control de pistas sin papel', 'Cobro de reservas integrado (Stripe)', 'Ranked League para fidelizar jugadores'] },
      { icon: '🎌', who: 'Federaciones', title: 'Tus torneos, tu app oficial', points: ['Motor americano/mexicano/suizo', 'Elos oficiales de cada jugador', 'LiveScore en vivo para retransmitir'] },
      { icon: '🤝', who: 'Campeones & Influencers', title: 'Tu marca, en todas las canchas', points: ['Tarjeta social viral al terminar el partido', 'LiveScore para tus retos en vivo', 'Perfil y badge de club'] },
      { icon: '🎒', who: 'Escuelas de pádel', title: 'Enseña y organiza', points: ['Reservas de pista por clic', 'Marcador digital en clase', 'Ranking de alumnos en la nube'] },
    ],
    proofTitle: 'Qué te llevas al probarlo',
    proof: ['Organizas un torneo en 5 min', 'Compartes el enlace de retransmisión', 'Cobras las reservas sin efectivo', 'Cada jugador sale con su tarjeta social'],
    cta: 'Lanza tu próximo evento, sin coste.',
    footer: 'PADELORGANIZERS.COM — La infraestructura digital de los eventos globales de pádel.',
  },
  en: {
    badge: 'CREATE. CONNECT. WIN.',
    title: 'The digital infrastructure',
    title2: 'for global padel events',
    subtitle:
      'PADELORGANIZERS.COM is the tech layer connecting players, clubs, organizers, data and sponsors: AI builds the optimal tournament, live results propagate to the draw, ranking and profile, and every event gets monetized. Each tournament becomes a digital product.',
    ctaDemo: '● Try the demo',
    ctaClub: 'Request club plan',
    offerTitle: 'Launch offer',
    offers: [
      { name: 'Club Starter', price: '$0', period: '/month', features: ['1 active tournament', '4 courts', 'Gold Point scoreboard', 'LiveScore', 'Analytics'], hot: false },
      { name: 'Club Pro', price: 'FREE 3 MONTHS', period: '· then $49/mo', features: ['Unlimited tournaments & courts', 'CourtManager + AI', 'Stripe bookings', 'Ranked League', 'Priority support'], hot: true },
    ],
    segmentsTitle: 'Built for every segment',
    segments: [
      { icon: '🏟', who: 'Clubs & Facilities', title: 'Less chaos, more revenue', desc: ['Real-time court control', 'Integrated booking payments', 'Ranked League to retain players'] },
      { icon: '🎌', who: 'Federations', title: 'Your data, your official app', desc: ['Americano/Mexicano/Swiss engine', 'Player Elo rating', 'Live streaming'] },
      { icon: '🔥', who: 'Pros & Influencers', title: 'Your brand, every court', desc: ['Auto social card after each match', 'LiveScore for your matches', 'Club profile & badge'] },
      { icon: '🎒', who: 'Padel Schools', title: 'Teach and organize', desc: ['Court booking by slot', 'Digital scoreboard', 'Cloud player rankings'] },
    ],
    whyTitle: 'What you will be',
    proof: ['Run a tournament in 5 min', 'Share a live retransmission link', 'Get paid without paperwork', 'Each player gets their social card'],
    cta: 'Launch your first club, free.',
    footer: 'PADELORGANIZERS.COM — The digital infrastructure for global padel events.',
  },
  fr: {
    badge: 'CREATE. CONNECT. WIN.',
    title: "L'infrastructure numérique",
    title2: 'des événements mondiaux de padel',
    subtitle: "PADELORGANIZERS.COM est la couche technologique qui relie joueurs, clubs, organisateurs, données et sponsors : l'IA crée le tournoi optimal, le résultat en direct se propage au tableau, au classement et au profil, chaque événement est monétisé. Chaque tournoi devient un produit numérique.",
    ctaDemo: 'Essayer la démo',
    ctaClub: 'Demander le plan club',
    offerTitle: 'Offre de lancement',
    offers: [
      { name: 'Club Starter', price: '0 €', period: '/mois', features: ['Torneo actif', 'Pistes', 'Marquage', 'LiveScore'], hot: false },
      { name: 'Club Pro', price: 'GRATUIT 3 MOIS', period: '· puis 49 €/mois', features: ['Torneos illimités', 'CourtManager + IA', 'Stripe', 'Ligue'], hot: true },
    ],
    segmentsTitle: 'Conçu pour chaque segment',
    segments: [
      { icon: '🏸', who: 'Clubs & Écoles', title: 'Moins de chaos, plus de revenus', desc: ['Gestion de pistes en temps réel', 'Paiements Stripe intégrés', 'Ligue pour fidéliser'] },
      { icon: '🎌', who: 'Fédérations', title: 'Vos données, votre app officielle', desc: ['Moteur Elo', 'Classements', 'Diffusion en direct'] },
      { icon: '🔥', who: 'Champions & Influenceurs', title: 'Votre marque, sur tous les terrains', desc: ['Carte sociale automatique', 'LiveScore en direct', 'Profil & badge'] },
    ],
    footer: "PADELORGANIZERS.COM — L'infrastructure numérique des événements mondiaux de padel.",
  },
  pt: {
    badge: 'CREATE. CONNECT. WIN.',
    title: 'A infraestrutura digital',
    title2: 'dos eventos globais de padel',
    subtitle: 'PADELORGANIZERS.COM é a camada tecnológica que liga jogadores, clubes, organizadores, dados e patrocinadores: IA cria o torneio ótimo, o resultado ao vivo propaga-se para o quadro, ranking e perfil, e cada evento é monetizado. Cada torneio torna-se um produto digital.',
    ctaDemo: '🚀 Experimentar a demo',
    ctaClub: 'Pedir plano de clube',
    offerTitle: 'Oferta de lançamento',
    offers: [
      { name: 'Club Starter', price: '0 €', period: '/mês', features: ['1 torneio ativo', '4 pistas', 'Marcador', 'LiveScore', 'Análises'], hot: false },
      { name: 'Club Pro', price: 'GRÁTIS 3 MESES', period: '· depois 49 €/mês', features: ['Torneios ilimitados', 'CourtManager + IA', 'Reservas com Stripe', 'Ranked League', 'Suporte'], hot: true },
    ],
    segmentsTitle: 'Feito para cada segmento',
    segments: [
      { icon: '🏟️', who: 'Clubes & Escolas', title: 'Menos caos, mais receita', desc: ['Pistas sem papel', 'Pagamentos integrados', 'Liga para fidelizar'] },
      { icon: '🎌', who: 'Federações', title: 'Os seus torneios, sua app oficial', desc: ['Motor de torneios', 'Elos oficiais', 'LiveScore'] },
      { icon: '🔥', who: 'Campeões & Influencers', title: 'A sua marca em todas as quadras', desc: ['Card social automático', 'LiveScore em direto', 'Perfil e badge'] },
    ],
    whyTitle: 'O que ganha em testar',
    cta: 'Lance o seu próximo evento, sem custo.',
    footer: 'PADELORGANIZERS.COM — A infraestrutura digital dos eventos globais de padel.',
  },
};

const sectionStyle = { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' };

export default function LaunchPage({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();
  const offers = T.offers || [];
  const segments = T.segments || [];

  return (
    <div>
      {/* HERO */}
      <section style={{ padding: '72px 0 60px', background: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.2), transparent 40%), radial-gradient(circle at 80% 0%, rgba(251,113,133,0.12), transparent 40%)' }}>
        <div style={{ ...sectionStyle, textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.35)', color: '#fb7185', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, marginBottom: 20 }}>
            {T.badge || 'NUEVO'}
          </span>
          <h1 style={{ fontSize: 52, lineHeight: 1.05, fontWeight: 900, color: '#fff', margin: '0 0 18px', letterSpacing: '-1.5px' }}>
            {T.title}
            <br />
            <span style={{ background: 'linear-gradient(135deg,#10b981,#84cc16)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{T.title2}</span>
          </h1>
          <p style={{ fontSize: 17, color: '#94a3b8', maxWidth: 640, margin: '0 auto 30px', lineHeight: 1.7 }}>{T.subtitle}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
              🚀 {T.ctaDemo}
            </button>
            <button onClick={() => navigate('/club')} style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              🏟️ {T.ctaClub}
            </button>
          </div>
        </div>
      </section>

      {/* OFFERS */}
      <section style={{ padding: '70px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 36 }}>{T.offerTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 20 }}>
            {offers.map((p, i) => (
              <div key={i} style={{
                background: p.hot ? 'rgba(16,185,129,0.08)' : '#0e1e1b',
                border: p.hot ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: 28, position: 'relative',
              }}>
                {p.hot && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#10b981,#84cc16)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 12 }}>🔥</span>}
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{p.name}</h3>
                <div style={{ fontSize: 28, fontWeight: 900, color: p.hot ? '#84cc16' : '#fff' }}>{p.price}</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>{p.period}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0' }}>
                  {(p.features || []).map((f, j) => (
                    <li key={j} style={{ fontSize: 14, color: '#cbd5e1', padding: '5px 0', borderBottom: '1px dashed rgba(255,255,255,0.06)' }}>✓ {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEGMENTS */}
      <section style={{ padding: '70px 0', background: '#0a1a17', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 8 }}>{T.segmentsTitle}</h2>
          <p style={{ fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 40 }}>{T.segmentsSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 16 }}>
            {segments.map((s, i) => (
              <div key={i} style={{ background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 22 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#84cc16', margin: 0, letterSpacing: 0.5 }}>{s.who}</h3>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '4px 0 8px' }}>{s.title}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(s.points || s.desc || []).map((d, j) => (
                    <li key={j} style={{ fontSize: 13, color: '#94a3b8', padding: '4px 0' }}>· {d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY / PROOF */}
      <section style={{ padding: '70px 0' }}>
        <div style={{ ...sectionStyle, textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 20 }}>{T.whyTitle}</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {(T.proof || []).map((p, i) => (
              <div key={i} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '10px 18px', color: '#a3e635', fontWeight: 700, fontSize: 14 }}>{p}</div>
            ))}
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 40 }}>{T.cta}</h3>
          <button onClick={() => navigate('/demo')} className="pulse-glow" style={{ marginTop: 18, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            🏆 {T.ctaDemo}
          </button>
        </div>
      </section>

      <footer style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        © 2026 {T.footer}
      </footer>
    </div>
  );
}