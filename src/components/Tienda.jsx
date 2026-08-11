import React, { useState } from 'react';

const I18N = {
  es: {
    nav: 'Tienda oficial del circuito',
    badge: '✦ Área de Partners & Beneficios',
    title: 'Tienda Oficial del Circuito',
    subtitle: 'Recomendamos, no vendemos. Todo lo que encuentras aquí lo gestionan directamente nuestros partners y proveedores: tú solo eliges y compras donde ellos.',
    arrow: '↗ Enlace externo',
    // B2C
    b2cLabel: 'PARA JUGADORES Y ESPECTADORES',
    b2cTitle: 'Equipamiento y productos recomendados del circuito',
    b2cDesc: 'Negociamos códigos de descuento exclusivos y enlaces de afiliado con las grandes tiendas y marcas. Tu compra apoya el circuito sin coste extra para ti.',
    couponTag: 'TIENDA OFICIAL DEL CIRCUITO',
    couponTitle: 'Código exclusivo de descuento',
    couponText: 'Usa el código del circuito en tu tienda de pádel favorita para obtener tu descuento personal.',
    couponCode: 'PADELPRO10',
    couponCta: 'Ir a la tienda oficial del circuito',
    couponNote: 'Descuento gestionado por el partner. PadelOrganizers solo recomienda.',
    affTitle: 'Recomendados del último torneo',
    affDesc: 'Las palas y accesorios más usados por los jugadores de nuestros torneos pro.',
    powerful: 'La pala más usada en el circuito',
    cheaper: 'Mejor relación calidad-precio',
    beginner: 'Ideal para iniciarse',
    prod1Title: 'Pala de gama alta concurrente',
    prod1Body: 'Elegida por la mayoría de jugadores del circuito.',
    prod2Title: 'Pala de control premium',
    prod2Body: 'La favorita entre los jugadores de control y defensa.',
    prod3Title: 'Pack de iniciación completo',
    prod3Body: 'Pala + funda + sobre grip para empezar con garantías.',
    seeCta: 'Ver recomendación completa',
    merchTitle: 'Merchandising oficial bajo demanda',
    merchDesc: 'La camiseta oficial del circuito se imprime y envía bajo demanda. Tú solo eliges tu talla.',
    merchCta: 'Comprar merchandising oficial',
    '62one': 'Camiseta oficial torneo',
    // B2B
    b2bLabel: 'PARA CLUBES Y ESCUELAS',
    b2bTitle: 'Directorio de Partners Recomendados',
    b2bDesc: 'Proveedores verificados por PadelOrganizers y recomendados a los +clubCount clubes y escuelas que usan nuestro software.',
    cats: [
      { n: 'pistas', emoji: '🏟️', name: 'Mantenimiento de pistas', desc: 'Regeneración de césped y pistas listas para competición.' },
      { n: 'cesped', emoji: '🌱', name: 'Césped artificial', desc: 'Césped certificado homologado por la federación.' },
      { n: 'led', emoji: '💡', name: 'Iluminación LED', desc: 'Proyectos de iluminación anti-deslumbramiento para pistas.' },
      { n: 'maquinas', emoji: '🤖', name: 'Máquinas lanzabolas', desc: 'Lanzadoras para entrenamiento individual y escuela.' },
      { n: 'construccion', emoji: '🏗️', name: 'Construcción de pistas', desc: 'Construcción llave en mano de nuevas pistas y clubes.' },
      { n: 'seguros', emoji: '🛡️', name: 'Seguros deportivos', desc: 'Seguros de responsabilidad civil y accidentes para clubes.' },
    ],
    leadHeading: '¿Necesitas presupuesto?',
    leadText: 'Envía tu petición y te ponemos en contacto directo con el proveedor recomendado.',
    openMail: 'Solicitar presupuesto',
    partnerCta: '¿Eres proveedor? Conviértete en Partner Oficial',
    partnerCtaSub: 'Aparece en el directorio recomendado ante +clubCount clubes y escuelas.',
    partnerMail: 'Ser Partner',
    legalTitle: 'Aviso legal',
    legal1: 'Los productos y servicios mostrados en esta sección son gestionados directamente por nuestros partners y proveedores externos.',
    legal2: 'PadelOrganizers actúa únicamente como recomendador y no gestiona pagos, envíos, stock ni garantías.',
  },
  en: {
    nav: 'Official circuit shop',
    badge: '✦ Partners & Benefits Area',
    title: 'Official Circuit Shop',
    subtitle: 'We recommend, we do not sell. Everything here is handled directly by our partners: you just choose and shop with them.',
    arrow: '↗ External link',
    b2cLabel: 'FOR PLAYERS & SPECTATORS',
    b2cTitle: 'Recommended gear from the circuit',
    b2cDesc: 'We negotiate exclusive discount codes and affiliate links with top stores and brands. Your purchase supports the circuit at no extra cost.',
    couponTag: 'OFFICIAL CIRCUIT STORE',
    couponTitle: 'Exclusive discount code',
    couponText: 'Use the circuit code at your favourite padel store for your personal discount.',
    couponCode: 'PADELPRO10',
    couponCta: 'Go to the official circuit store',
    couponNote: 'Discount managed by the partner. PadelOrganizers only recommends.',
    affTitle: 'Top picks from the last tournament',
    affDesc: 'The rackets and gear most used by players in our pro tournaments.',
    powerful: 'Most used racket in the circuit',
    cheaper: 'Best value for money',
    beginner: 'Great to get started',
    prod1Title: 'Concurrent premium racket',
    prod1Body: 'Chosen by most circuit players.',
    prod2Title: 'Premium control racket',
    prod2Body: 'Favourite among control and defensive players.',
    prod3Title: 'Full starter pack',
    prod3Body: 'Racket + bag + overgrip to start for real.',
    seeCta: 'See full recommendation',
    merchTitle: 'Official print-on-demand merchandise',
    merchDesc: 'The official tournament shirt is printed and shipped on demand. You just pick your size.',
    merchCta: 'Buy official merchandise',
    '62one': 'Official tournament shirt',
    b2bLabel: 'FOR CLUBS & SCHOOLS',
    b2bTitle: 'Recommended Partners Directory',
    b2bDesc: 'Providers vetted by PadelOrganizers and recommended to the +clubCount clubs and schools using our software.',
    cats: [
      { n: 'pistas', emoji: '🏟️', name: 'Court maintenance', desc: 'Turf regeneration and competition-ready courts.' },
      { n: 'cesped', emoji: '🌱', name: 'Artificial turf', desc: 'Federation-homologated certified turf.' },
      { n: 'led', emoji: '💡', name: 'LED lighting', desc: 'Anti-glare lighting projects.' },
      { n: 'maquinas', emoji: '🤖', name: 'Ball machines', desc: 'Launchers for solo practice and schools.' },
      { n: 'construccion', emoji: '🏗️', name: 'Court construction', desc: 'Turnkey construction of new courts and clubs.' },
      { n: 'seguros', emoji: '🛡️', name: 'Sports insurance', desc: 'Liability and accident insurance for clubs.' },
    ],
    leadHeading: 'Need a quote?',
    leadText: 'Send your request and we will connect you directly with the recommended provider.',
    openMail: 'Request a quote',
    partnerCta: 'Are you a provider? Become an Official Partner',
    partnerCtaSub: 'Appear in the recommended directory in front of +clubCount clubs and schools.',
    partnerMail: 'Become a Partner',
    legalTitle: 'Legal notice',
    legal1: 'The products and services shown in this section are managed directly by our partners and external providers.',
    legal2: 'PadelOrganizers only acts as a recommender and does not manage payments, shipping, stock or warranties.',
  },
  fr: {
    nav: 'Boutique officielle du circuit',
    badge: '✦ Espace Partenaires & Avantages',
    title: 'Boutique Officielle du Circuit',
    subtitle: 'Nous recommandons, nous ne vendons pas. Tout est géré directement par nos partenaires : vous choisissez et achetez chez eux.',
    arrow: '↗ Lien externe',
    b2cLabel: 'POUR LES JOUEURS ET SPECTATEURS',
    b2cTitle: 'Équipement recommandé du circuit',
    b2cDesc: 'Nous négocions des codes de réduction exclusifs et des liens d’affiliation avec les grandes boutiques et marques.',
    couponTag: 'BOUTIQUE OFFICIELLE DU CIRCUIT',
    couponTitle: 'Code de réduction exclusif',
    couponText: 'Utilisez le code du circuit dans votre boutique préférée.',
    couponCode: 'PADELPRO10',
    couponCta: 'Aller à la boutique officielle',
    couponNote: 'Réduction gérée par le partenaire. PadelOrganizers recommande uniquement.',
    affTitle: 'Recommandations du dernier tournoi',
    affDesc: 'Les palas et accessoires les plus utilisés par nos joueurs pro.',
    powerful: 'La palette la plus utilisée du circuit',
    cheaper: 'Meilleur rapport qualité/prix',
    beginner: 'Idéal pour débuter',
    prod1Title: 'Paleta haut de gamme',
    prod1Body: 'Choisie par la majorité des joueurs du circuit.',
    prod2Title: 'Paleta de contrôle premium',
    prod2Body: 'La préférée des joueurs de contrôle et de défense.',
    prod3Title: 'Pack de démarrage complet',
    prod3Body: 'Paleta + housse + surgrip pour bien commencer.',
    seeCta: 'Voir la recommandation complète',
    merchTitle: 'Merchandising officiel à la demande',
    merchDesc: 'Le maillot officiel est imprimé et expédié à la demande.',
    merchCta: 'Acheter le merchandising officiel',
    '62one': 'Maillot officiel du tournoi',
    b2bLabel: 'POUR LES CLUBS ET ÉCOLES',
    b2bTitle: 'Annuaire des Partenaires Recommandés',
    b2bDesc: 'Fournisseurs certifiés par PadelOrganizers et recommandés aux +clubCount clubs et écoles.',
    cats: [
      { n: 'pistas', emoji: '🏟️', name: 'Entretien des pistes', desc: 'Régénération des tapis et pistes prêtes pour la compétition.' },
      { n: 'cesped', emoji: '🌱', name: 'Tapis synthétique', desc: 'Tapis certifié homologué par la fédération.' },
      { n: 'led', emoji: '💡', name: 'Éclairage LED', desc: 'Projets d’éclairage anti-éblouissement.' },
      { n: 'maquinas', emoji: '🤖', name: 'Machines à balles', desc: 'Lance-balles pour l’entraînement et les écoles.' },
      { n: 'construccion', emoji: '🏗️', name: 'Construction de pistes', desc: 'Construction clé en main de nouvelles pistes.' },
      { n: 'seguros', emoji: '🛡️', name: 'Assurances sportives', desc: 'Assurances RC et accidents pour les clubs.' },
    ],
    leadHeading: 'Besoin d’un devis ?',
    leadText: 'Envoyez votre demande et nous vous mettons en relation avec le fournisseur.',
    openMail: 'Demander un devis',
    partnerCta: 'Vous êtes fournisseur ? Devenez Partenaire Officiel',
    partnerCtaSub: 'Figurez dans l’annuaire recommandé devant +clubCount clubs et écoles.',
    partnerMail: 'Devenir Partenaire',
    legalTitle: 'Mention légale',
    legal1: 'Les produits et services présentés dans cette section sont gérés directement par nos partenaires et prestataires externes.',
    legal2: 'PadelOrganizers agit uniquement en tant que recommandeur et ne gère ni paiements, ni expéditions, ni stocks, ni garanties.',
  },
  pt: {
    nav: 'Loja oficial do circuito',
    badge: '✦ Área de Parceiros & Benefícios',
    title: 'Loja Oficial do Circuito',
    subtitle: 'Recomendamos, não vendemos. Tudo aqui é gerido diretamente pelos nossos parceiros: escolhe e compra com eles.',
    arrow: '↗ Link externo',
    b2cLabel: 'PARA JOGADORES E ESPETADORES',
    b2cTitle: 'Equipamento recomendado do circuito',
    b2cDesc: 'Negociamos códigos de desconto exclusivos e links de afiliados com grandes lojas e marcas.',
    couponTag: 'LOJA OFICIAL DO CIRCUITO',
    couponTitle: 'Código de desconto exclusivo',
    couponText: 'Usa o código do circuito na tua loja de padel favorita.',
    couponCode: 'PADELPRO10',
    couponCta: 'Ir para a loja oficial do circuito',
    couponNote: 'Desconto gerido pelo parceiro. A PadelOrganizers apenas recomenda.',
    affTitle: 'Recomendados do último torneio',
    affDesc: 'As palas e acessórios mais usados pelos nossos jogadores pro.',
    powerful: 'A pala mais usada no circuito',
    cheaper: 'Melhor relação qualidade/preço',
    beginner: 'Ideal para começar',
    prod1Title: 'Pala de gama alta',
    prod1Body: 'Escolhida pela maioria dos jogadores do circuito.',
    prod2Title: 'Pala de controlo premium',
    prod2Body: 'A favorita dos jogadores de controlo e defesa.',
    prod3Title: 'Pack de iniciação completo',
    prod3Body: 'Pala + bolsa + overgrip para começar com tudo.',
    seeCta: 'Ver recomendação completa',
    merchTitle: 'Merchandising oficial sob demanda',
    merchDesc: 'A camisola oficial é impressa e enviada sob demanda.',
    merchCta: 'Comprar merchandising oficial',
    '62one': 'Camisola oficial do torneio',
    b2bLabel: 'PARA CLUBES E ESCOLAS',
    b2bTitle: 'Diretório de Parceiros Recomendados',
    b2bDesc: 'Fornecedores verificados pela PadelOrganizers e recomendados aos +clubCount clubes e escolas.',
    cats: [
      { n: 'pistas', emoji: '🏟️', name: 'Manutenção de pistas', desc: 'Regeneração de tapetes e pistas prontas para competição.' },
      { n: 'cesped', emoji: '🌱', name: 'Relva artificial', desc: 'Relva certificada e homologada pela federação.' },
      { n: 'led', emoji: '💡', name: 'Iluminação LED', desc: 'Projetos de iluminação antirreflexo.' },
      { n: 'maquinas', emoji: '🤖', name: 'Máquinas lançadoras', desc: 'Lançadoras para treino individual e escolas.' },
      { n: 'construccion', emoji: '🏗️', name: 'Construção de pistas', desc: 'Construção chave-na-mão de novas pistas.' },
      { n: 'seguros', emoji: '🛡️', name: 'Seguros desportivos', desc: 'Seguros de responsabilidade civil e acidentes.' },
    ],
    leadHeading: 'Precisas de orçamento?',
    leadText: 'Envia o teu pedido e colocamos-te em contacto direto com o fornecedor.',
    openMail: 'Pedir orçamento',
    partnerCta: 'És fornecedor? Torna-te Parceiro Oficial',
    partnerCtaSub: 'Aparece no diretório recomendado diante de +clubCount clubes e escolas.',
    partnerMail: 'Ser Parceiro',
    legalTitle: 'Aviso legal',
    legal1: 'Os produtos e serviços apresentados nesta secção são geridos diretamente pelos nossos parceiros e prestadores externos.',
    legal2: 'A PadelOrganizers atua apenas como recomendador e não gere pagamentos, envios, stocks ou garantias.',
  },
};

const S = {
  page: { maxWidth: 980, margin: '0 auto', padding: '28px 20px 60px', color: 'var(--padel-text)' },
  badge: { color: '#a3e635', fontWeight: 800, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  h1: { fontSize: 'clamp(26px, 5vw, 40px)', margin: '8px 0 12px', fontWeight: 800, lineHeight: 1.1 },
  subtitle: { color: 'var(--padel-muted)', fontSize: 15, maxWidth: 720, marginBottom: 34, lineHeight: 1.6 },
  sectionLabel: { color: '#fbbf24', fontWeight: 800, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 6px' },
  sectionTitle: { fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 800, margin: '0 0 8px' },
  sectionDesc: { color: 'var(--padel-muted)', fontSize: 14, margin: '0 0 18px', maxWidth: 680, lineHeight: 1.6 },
  panel: { background: 'var(--padel-header-bg)', border: '1px solid var(--padel-border)', borderRadius: 18, padding: 22 },
  panelTitle: { fontWeight: 800, fontSize: 17, margin: '0 0 8px' },
  panelText: { color: 'var(--padel-muted)', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 14px' },
  code: { background: 'linear-gradient(135deg, var(--padel-emerald), var(--padel-emerald-dark))', color: '#fff', padding: '4px 12px', borderRadius: 8, fontWeight: 800, fontSize: 20, letterSpacing: 1, boxShadow: '0 4px 14px rgba(16,185,129,.35)' },
  cta: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, var(--padel-emerald), var(--padel-emerald-dark))', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 12px rgba(16,185,129,.3)' },
  ctaGold: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#fbbf24,#d97706)', color: '#1f2937', border: 'none', padding: '12px 20px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 12px rgba(217,119,6,.3)' },
  ctaGhost: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--padel-hover-bg)', color: 'var(--padel-text)', border: '1.5px solid var(--padel-border)', padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none' },
  card: { background: 'var(--padel-header-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 8 },
  tag: { alignSelf: 'flex-start', fontSize: 10.5, fontWeight: 800, letterSpacing: 1, color: '#a3e635', textTransform: 'uppercase' },
  grid: { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' },
  note: { color: 'var(--padel-muted)', fontSize: 12, lineHeight: 1.6, marginTop: 10 },
  legal: { marginTop: 40, padding: '16px 18px', borderRadius: 12, background: 'var(--padel-hover-bg)', border: '1px dashed var(--padel-border)', color: 'var(--padel-muted)', fontSize: 12.5, lineHeight: 1.7 },
};

export default function Tienda({ lang = 'es' }) {
  const t = I18N[lang] || I18N.es;
  const clubCount = 55;
  const parts = (s) => s.replace('+clubCount', `+${clubCount}`);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(t.couponCode); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };

  return (
    <main style={S.page}>
      <div style={S.badge}>{t.badge}</div>
      <h1 style={S.h1}>{t.title}</h1>
      <p style={S.subtitle}>{t.subtitle}</p>

      {/* B2C */}
      <section>
        <div style={S.sectionLabel}>{t.b2cLabel}</div>
        <h2 style={S.sectionTitle}>{t.b2cTitle}</h2>
        <p style={S.sectionDesc}>{parts(t.b2cDesc)}</p>

        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: 22 }}>
          {/* Cupón patrocinado */}
          <div style={S.panel}>
            <div style={S.tag}>{t.couponTag}</div>
            <h3 style={S.panelTitle}>{t.couponTitle}</h3>
            <p style={S.panelText}>{t.couponText}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={S.code}>{t.couponCode}</span>
              <button onClick={copy} style={S.ctaGhost}>{copied ? '✓' : '📋'}</button>
            </div>
            <a href="https://www.padel5.com" target="_blank" rel="noopener noreferrer" style={{ ...S.cta, marginTop: 16 }}>{t.couponCta} {t.arrow}</a>
            <p style={S.note}>{t.couponNote}</p>
          </div>

          {/* Afiliados */}
          <div style={S.panel}>
            <div style={S.tag}>{t.affTitle}</div>
            <h3 style={S.panelTitle}>{t.affTitle}</h3>
            <p style={S.panelText}>{t.affDesc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="https://www.amazon.es" target="_blank" rel="noopener noreferrer" style={{ ...S.ctaGold, justifyContent: 'center' }}>🏆 {t.prod1Title} · {t.powerful} · {t.arrow}</a>
              <a href="https://www.amazon.es" target="_blank" rel="noopener noreferrer" style={{ ...S.ctaGhost, justifyContent: 'center' }}>🎯 {t.prod2Title} · {t.cheaper} · {t.arrow}</a>
              <a href="https://www.amazon.es" target="_blank" rel="noopener noreferrer" style={{ ...S.ctaGhost, justifyContent: 'center' }}>🎒 {t.prod3Title} · {t.beginner} · {t.arrow}</a>
            </div>
          </div>

          {/* Merchandising POD */}
          <div style={S.panel}>
            <div style={S.tag}>Print-on-demand</div>
            <h3 style={S.panelTitle}>{t.merchTitle}</h3>
            <p style={S.panelText}>{t.merchDesc}</p>
            <div style={{
              height: 120, borderRadius: 12, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(16,185,129,.15), rgba(251,113,133,.15))', border: '1px solid var(--padel-border)',
              fontSize: 34,
            }}>👕</div>
            <a href="https://printful.com" target="_blank" rel="noopener noreferrer" style={S.cta}>{t.merchCta} {t.arrow}</a>
          </div>
        </div>
      </section>

      {/* B2B */}
      <section>
        <div style={S.sectionLabel}>{t.b2bLabel}</div>
        <h2 style={S.sectionTitle}>{t.b2bTitle}</h2>
        <p style={S.sectionDesc}>{parts(t.b2bDesc)}</p>
        <div style={S.grid}>
          {t.cats.map((c) => (
            <form key={c.n}
              action="mailto:partners@padelorganizers.com"
              method="post" encType="text/plain"
              style={S.card}
            >
              <div style={{ fontSize: 26 }}>{c.emoji}</div>
              <input type="hidden" name="Petición de lead" value={`Categoría: ${c.name}`} />
              <div style={S.panelTitle}>{c.name}</div>
              <div style={S.panelText}>{c.desc}</div>
              <button type="submit" style={{ ...S.ctaGhost, justifyContent: 'center', marginTop: 'auto' }}>{t.openMail} ↗</button>
            </form>
          ))}
        </div>

        <div style={{ ...S.panel, marginTop: 22, textAlign: 'center' }}>
          <h3 style={{ ...S.panelTitle, fontSize: 20 }}>{t.partnerCta}</h3>
          <p style={{ ...S.panelText, textAlign: 'center' }}>{parts(t.partnerCtaSub)}</p>
          <a href="mailto:partners@padelorganizers.com?subject=Quiero ser Partner Oficial" style={S.ctaGold}>{t.partnerMail} ↗</a>
        </div>
      </section>

      {/* Aviso legal */}
      <div style={S.legal}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>⚖️ {t.legalTitle}</div>
        <div>{t.legal1}</div>
        <div>{t.legal2}</div>
      </div>
    </main>
  );
}