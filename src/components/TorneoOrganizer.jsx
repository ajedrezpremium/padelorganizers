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
  fr: {
    badge: '+ TOURNOI',
    title: 'Organisez un tournoi de padel pro',
    subtitle: 'Transformez chaque semaine en une expérience incroyable pour les joueurs, les techniciens et les sponsors grâce à une coordination impeccable, des tableaux clairs et une journée de compétition fluide.',
    ctaPrimary: 'Essayer la démo',
    ctaSecondary: 'Demander le plan club',
    highlights: [
      { value: '5 phases', label: 'de la planification à la clôture' },
      { value: '1h15', label: 'par match pour ne pas retarder le calendrier' },
      { value: '2-3 remplaçants', label: 'pour parer à tout imprévu' },
      { value: '100%', label: 'de coordination pour un déroulement sans accroc' },
    ],
    phasesTitle: 'Le workflow idéal de l’organisateur',
    phases: [
      {
        title: 'Phase 1 · Planification et définition',
        description: 'Définissez le format, les catégories, le lieu, le budget et le règlement pour poser les bases du tournoi.',
        items: [
          'Élimination directe, groupes + éliminatoires ou format américain/mexicain.',
          'Catégories par niveau, genre et modalité pour équilibrer la compétition.',
          'Réservation des pistes, négociation avec le club et contrôle du budget.',
          'Règlement clair avec point d’or, mort subite ou tie-breaks.',
        ],
      },
      {
        title: 'Phase 2 · Inscriptions et diffusion',
        description: 'Trouvez vos participants, gérez les paiements et construisez une communication forte dès le premier jour.',
        items: [
          'Flyer et diffusion sur les réseaux, WhatsApp et la réception du club.',
          'Plateforme d’inscription avec coordonnées, niveau et confirmation par e-mail.',
          'Paiement préalable pour garantir les places et éviter les surprises.',
          'Groupe de diffusion pour les mises à jour et les horaires.',
        ],
      },
      {
        title: 'Phase 3 · Tableaux et logistique finale',
        description: 'Clôturez les listes, tirez les rencontres au sort et préparez la journée avec précision.',
        items: [
          'Clôture des inscriptions et têtes de série pour éviter les croisements précoces.',
          'Tirage en direct, tableaux publiés et horaires échelonnés par créneaux.',
          'Achats de dernière minute : balles, trophées, eau, fruits et trousse de secours.',
          'Prévoyez 1h15 ou 1h30 par match selon le format.',
        ],
      },
      {
        title: 'Phase 4 · Le jour du tournoi',
        description: 'Passez à la direction de la compétition avec une table de contrôle, une piste et des temps parfaitement organisés.',
        items: [
          'Check-in 30 minutes avant avec pack de bienvenue et briefing de piste.',
          'Tableau ou appli en temps réel avec ordre de jeu et horaires.',
          'Résolution de conflits et auto-arbitrage en l’absence d’arbitre.',
          'Musique, photos, vidéos et hydratation constante pour élever l’expérience.',
        ],
      },
      {
        title: 'Phase 5 · Clôture et post-tournoi',
        description: 'Terminez l’événement avec des récompenses, un suivi et un retour qui vous aidera à faire encore mieux la prochaine fois.',
        items: [
          'Finales sur piste centrale, remise des trophées et tirages cadeaux.',
          'Paiement des prestataires, nettoyage et clôture logistique de l’installation.',
          'Photos, résultats et remerciements aux joueurs et sponsors.',
          'Enquête rapide pour améliorer l’édition suivante.',
        ],
      },
    ],
    tipsTitle: '3 conseils en or',
    tips: [
      {
        title: 'Point d’or',
        text: 'Activez le point d’or et le super tie-break pour accélérer les tournois avec beaucoup de paires et éviter les retards.',
      },
      {
        title: 'Invités',
        text: 'Gardez 2 ou 3 joueurs locaux de confiance prêts à couvrir les absences et à ne pas déséquilibrer le tableau.',
      },
      {
        title: 'Votre appli comme centre névralgique',
        text: 'Utilisez une plateforme avec des tableaux en temps réel, des horaires sur mobile et des résultats mis à jour instantanément.',
      },
    ],
    finalTitle: 'Faites sentir le tournoi professionnel dès le premier contact',
    finalText: 'PADEL ORGANIZERS vous aide à transformer un tournoi en événement premium, avec une expérience qui convient aux joueurs, aux techniciens et aux sponsors.',
  },
  pt: {
    badge: '+ TORNEIO',
    title: 'Organize um torneio de padel pro',
    subtitle: 'Transforme cada semana numa experiência incrível para jogadores, técnicos e patrocinadores com uma coordenação impecável, quadros claros e um dia de competição que flui.',
    ctaPrimary: 'Experimentar a demo',
    ctaSecondary: 'Solicitar plano de clube',
    highlights: [
      { value: '5 fases', label: 'do planeamento ao encerramento' },
      { value: '1h15', label: 'por jogo para não atrasar o calendário' },
      { value: '2-3 suplentes', label: 'para salvar qualquer imprevisto' },
      { value: '100%', label: 'coordenação para tudo correr bem' },
    ],
    phasesTitle: 'O workflow ideal do organizador',
    phases: [
      {
        title: 'Fase 1 · Planeamento e definição',
        description: 'Defina o formato, as categorias, a sede, o orçamento e o regulamento para assentar as bases do torneio.',
        items: [
          'Eliminação direta, grupos + eliminatórias ou formato americano/mexicano.',
          'Categorias por nível, género e modalidade para equilibrar a competição.',
          'Reserva de pistas, negociação com o clube e controlo do orçamento.',
          'Regulamento claro com ponto de ouro, morte súbita ou desempates.',
        ],
      },
      {
        title: 'Fase 2 · Inscrições e divulgação',
        description: 'Conquiste participantes, gerencie pagamentos e construa uma comunicação forte desde o primeiro dia.',
        items: [
          'Flyer e divulgação nas redes, WhatsApp e receção do clube.',
          'Plataforma de inscrição com dados de contacto, nível e confirmação por email.',
          'Pagamento prévio para garantir vagas e evitar surpresas.',
          'Grupo de divulgação para atualizações e horários.',
        ],
      },
      {
        title: 'Fase 3 · Quadros e logística final',
        description: 'Feche as listas, sorteie os emparelhamentos e prepare o dia com precisão.',
        items: [
          'Encerramento das inscrições e cabeças de série para evitar cruzamentos precoces.',
          'Sorteio em direto, quadros publicados e horários escalonados por faixas.',
          'Compras de última hora: bolas, troféus, água, fruta e kit de primeiros socorros.',
          'Planeie 1h15 ou 1h30 por jogo conforme o formato.',
        ],
      },
      {
        title: 'Fase 4 · O dia do torneio',
        description: 'Passe a dirigir a competição com uma mesa de controlo, pista e tempos perfeitamente organizados.',
        items: [
          'Check-in 30 minutos antes com welcome pack e briefing de pista.',
          'Quadro ou app em tempo real com ordem de jogo e horários.',
          'Resolução de conflitos e autoarbitragem quando não há árbitro.',
          'Música, fotos, vídeos e hidratação constante para elevar a experiência.',
        ],
      },
      {
        title: 'Fase 5 · Encerramento e pós-torneio',
        description: 'Feche o evento com prémios, acompanhamento e um retorno que o ajuda a repetir ainda melhor.',
        items: [
          'Finais na pista central, entrega de troféus e sorteios de brindes.',
          'Pagamento a fornecedores, limpeza e encerramento logístico da instalação.',
          'Fotos, resultados e agradecimentos a jogadores e patrocinadores.',
          'Inquérito rápido para melhorar a próxima edição.',
        ],
      },
    ],
    tipsTitle: '3 conselhos de ouro',
    tips: [
      {
        title: 'Ponto de ouro',
        text: 'Ative o ponto de ouro e o super tie-break para acelerar torneios com muitas duplas e evitar atrasos.',
      },
      {
        title: 'Coringas',
        text: 'Mantenha 2 ou 3 jogadores locais de confiança prontos para cobrir ausências e não desequilibrar o quadro.',
      },
      {
        title: 'A sua app como centro nevrálgico',
        text: 'Use uma plataforma com quadros em tempo real, horários no telemóvel e resultados atualizados no instante.',
      },
    ],
    finalTitle: 'Faça o torneio parecer profissional desde o primeiro contacto',
    finalText: 'PADEL ORGANIZERS ajuda-o a transformar um torneio num evento premium, com uma experiência que se encaixa em jogadores, técnicos e sponsors.',
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
