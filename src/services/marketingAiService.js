/**
 * marketingAiService.js — AI Marketing Assistant (#9)
 * Genera todos los contenidos de promoción de un torneo en 4 idiomas
 * a partir de unos pocos campos: nombre, club, formato, fecha y lugar.
 * Es determinista (plantillas + variantes) para no depender de una API.
 */

const MODALITY_TEXT = {
  es: { americano: 'formato Americano', mexicano: 'formato Mexicano', suizo: 'formato Suizo', knockout: 'eliminación directa' },
  en: { americano: 'Americano format', mexicano: 'Mexicano format', suizo: 'Swiss format', knockout: 'knockout format' },
  fr: { americano: 'format américain', mexicano: 'format mexicain', suizo: 'format suisse', knockout: 'élimination directe' },
  pt: { americano: 'formato Americano', mexicano: 'formato Mexicano', suizo: 'formato Suíço', knockout: 'eliminação direta' },
};

function pick(rnd, ...variants) {
  return variants[Math.floor(rnd * variants.length)];
}

function fmtDate(d, lang) {
  if (!d) return null;
  try {
    const loc = lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-PT' : 'en-GB';
    return new Date(d).toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return d;
  }
}

export function generateMarketingContent({ name = 'Open Pádel Pro 2026', club = 'Mi Club', modality = 'americano', date = '', place = '', lang = 'es', seed = Date.now() } = {}) {
  const T = MODALITY_TEXT[lang] || MODALITY_TEXT.es;
  const mod = T[modality] || T.americano;
  const day = fmtDate(date, lang);
  const when = day ? ` · ${day}` : '';
  const where = place ? `@ ${place}` : club;
  const rnd = (seed % 100) / 100;

  const common = { name, club, where, mod, when, day };

  const es = {
    instagram: pick(rnd,
      `¡Vuelve el pádel grande! 🎾🔥\nGancho de la semana: **${name}**\n\n🏟️ ${club}\n🎯 ${mod}${when}\n📍 ${where || club}\n\nCuadros, marcador en vivo, ranking y analíticas en tiempo real. ¿Listo para jugar?\n\n➡️ Inscríbete desde este perfil\n#Padel #Torneo #${club.replace(/\s/g, '')} #PadelOrganizers`,
      `${name} YA ESTÁ AQUÍ 🚀\n\n${club} organiza este torneo con la tecnología de PADELORGANIZERS: inscripción, cuadros, pantallas y resultados en directo.\n\n${mod}${when}\n\n¿Te lo vas a perder?\n\n#Padel #Competition #PadelOrganizers`,
    ),
    story: `🎾 ${name}\n${club}\n${mod}${when}\n🔗 Link en bio\n#PadelOrganizers`,
    facebook: pick(rnd,
      `🏆 **${name}** en ${club}${when}\n\nUn torneo de pádel con ${mod}, partidos en pista, marcador en vivo para todos los aficionados y cuadro actualizado al segundo.\n\n👥 Jugadores inscritos ya confirmando plaza\n📅 ${day ? `Fecha: ${day}` : 'Reserva tu fecha'}\n📍 ${club}\n\nEntra y asegura tu pareja.\n\n#Padel #TorneoPadel #${club.replace(/\s/g, '')}`,
      `¿Listo para competir? 🔥 ${name} llega a ${club}. ${mod}${when}. Sigue el torneo en tiempo real y anima a tu jugador favorito.\n\nMás información y solicitud de plaza en la web pública del torneo.\n#Padel #PadelOrganizers`,
    ),
    linkedin: pick(rnd,
      `Hoy anunciamos ${name}, que se celebrará en ${club}${when}.\n\nComo organizadores apostamos por profesionalizar lo amateur: ` + 'cuadros automáticos, marcador en directo, ranking Elo, analíticas y cobertura para jugadores y sponsors.\n\nTodo desde una única plataforma digital: PADELORGANIZERS.\n\nUn torneo, un producto digital.\n#Padel #Eventos #Innovacion #Deporte',
      `${name} · ${club}\n\nUn evento de pádel gestionado end-to-end con tecnología: ${mod}${when}. Datos en vivo, patrocinios y cobertura profesional.\n\nPADELORGANIZERS — La infraestructura digital de los eventos globales de pádel.\n#PadelEvents #Tech #Sports #PadelOrganizers`,
    ),
    whatsapp: `🎾 ${name}\n🏟️ ${club}\n🎯 ${mod}${when}\n\n¡Anímate a participar! Plazas limitadas. Pregunta por el enlace del torneo y confirma tu pareja.`,
    emailSubject: `🎾 ${name} en ${club} — inscríbete${day ? ' · ' + day : ''}`,
    emailBody: `Hola,\n\nte escribimos desde ${club} para invitarte a participar en **${name}**.\n\nDetalles del torneo:\n· Formato: ${mod}\n· Fecha: ${day || 'por confirmar'}\n· Lugar: ${club}\n\nPodrás seguir cuadros, marcador en vivo, ranking y analíticas desde la web pública del torneo.\n\nResponde a este correo para reservar tu plaza.\n\nUn saludo,\nEquipo ${club}`,
    description: `${name} es un torneo de pádel con ${mod} organizado por ${club}. Los asistentes siguen cada partido en directo: cuadro actualizado, resultados en tiempo real, ranking y estadísticas${when}.`,
    sponsorProposal: pick(rnd,
      `**Oportunidad de patrocinio — ${name}**\n\nSu marca acompañará a ${club} en este torneo con ${mod}${when}. Ofrecemos:\n\n· Patrocinio principal (logo en todas las piezas)\n· Patrocinio de pista (banners)\n· Presencia en la web pública del torneo\n· Menciones en redes sociales\n\nContacte con nosotros para el dossier completo.\nPADELORGANIZERS · Deporte y datos en vivo.`,
      `${name} busca patrocinadores 👋\n\n${club} organiza este evento con visibilidad en pantallas, redes y web en directo. Oportunidades desde logo en redes hasta naming del torneo.\n\nConversemos: deporte + datos + marca.\n#Sponsoring #Padel`,
    ),
    press: `**Nota de prensa**\n\n**${name}** — ${club}${when}\n\nEl club organiza un torneo de pádel con ${mod} y gestión 100% digital: inscripción online, cuadros automáticos, marcador en directo, ranking y analíticas en tiempo real mediante la plataforma PADELORGANIZERS.\n\nEl torneo dispondrá de web pública propia que seguirá en vivo a jugadores, sponsors y aficionados.\n\nPara más información: contacto de ${club}.`,
  };

  const en = {
    instagram: pick(rnd,
      `Big padel is back! 🎾🔥\nThe **${name}** is the match of the week\n\n🏟️ ${club}\n🎯 ${mod}${when}\n📍 ${where || club}\n\nDraws, live scoring, rankings and live analytics. Ready to play?\n\n➡️ Sign up from this profile\n#Padel #Tournament #${club.replace(/\s/g, '')} #PadelOrganizers`,
      `${name} IS HERE 🚀\n\n${club} runs this tournament powered by PADELORGANIZERS: registration, draws, live screens and results.\n\n${mod}${when}\n\nDon't miss it!\n\n#Padel #Competition #PadelOrganizers`,
    ),
    story: `🎾 ${name}\n${club}\n${mod}${when}\n🔗 Link in bio\n#PadelOrganizers`,
    facebook: pick(rnd,
      `🏆 **${name}** at ${club}${when}\n\nA padel tournament with ${mod}, live scoring for every fan and a draw updated in real time.\n\n👥 Players already confirming spots\n📅 ${day ? `Date: ${day}` : 'Book the date'}\n📍 ${club}\n\nJoin and secure your partner.\n\n#Padel #PadelTournament #${club.replace(/\s/g, '')}`,
      `Ready to compete? 🔥 ${name} lands at ${club}. ${mod}${when}. Follow the tournament live and cheer for your favourite player.\n\nMore info and registration on the public tournament page.\n#Padel #PadelOrganizers`,
    ),
    linkedin: pick(rnd,
      `We are proud to announce ${name}, hosted at ${club}${when}.\n\nWe are professionalising amateur competition: ` + 'automatic draws, live scoring, Elo ranking, analytics and full coverage for players and sponsors.\n\nAll from one digital platform: PADELORGANIZERS.\n\nEvery tournament is a digital product.\n#Padel #Events #Innovation #Sport',
      `${name} · ${club}\n\nAn end-to-end, tech-managed padel event: ${mod}${when}. Live data, sponsorship and professional coverage.\n\nPADELORGANIZERS — The digital infrastructure for global padel events.\n#PadelEvents #Tech #Sports #PadelOrganizers`,
    ),
    whatsapp: `🎾 ${name}\n🏟️ ${club}\n🎯 ${mod}${when}\n\nJoin us! Limited spots. Ask for the tournament link and confirm your partner.`,
    emailSubject: `🎾 ${name} at ${club} — register${day ? ' · ' + day : ''}`,
    emailBody: `Hi,\n\nwe are writing from ${club} to invite you to take part in **${name}**.\n\nTournament details:\n· Format: ${mod}\n· Date: ${day || 'to be confirmed'}\n· Venue: ${club}\n\nYou can follow draws, live scores, ranking and analytics on the public tournament page.\n\nReply to this email to book your spot.\n\nBest regards,\nTeam ${club}`,
    description: `${name} is a padel tournament in ${mod} organised by ${club}. Attendees follow every match live: updated draw, real-time results, ranking and statistics${when}.`,
    sponsorProposal: pick(rnd,
      `**Sponsorship opportunity — ${name}**\n\nYour brand will be with ${club} at this ${mod} tournament${when}. We offer:\n\n· Main sponsorship (logo across all assets)\n· Court sponsorship (banners)\n· Presence on the public tournament page\n· Social media mentions\n\nContact us for the full package.\nPADELORGANIZERS · Live data sports.`,
      `${name} is looking for sponsors 👋\n\n${club} is hosting this event with live visibility on screens, social and the web. Opportunities range from social logos to tournament naming.\n\nLet's talk: sport + data + brand.\n#Sponsoring #Padel`,
    ),
    press: `**Press release**\n\n**${name}** — ${club}${when}\n\nThe club is organising a padel tournament in ${mod} with 100% digital management: online registration, automatic draws, live scoring, ranking and real-time analytics powered by PADELORGANIZERS.\n\nThe tournament will have its own public page following players, sponsors and fans live.\n\nFor more information: ${club} contact.`,
  };

  const fr = {
    instagram: pick(rnd,
      `Le grand padel est de retour ! 🎾🔥\n` + `**${name}** est le rendez-vous de la semaine\n\n🏟️ ${club}\n🎯 ${mod}${when}\n📍 ${where || club}\n\nTableaux, marquage en direct, classement et analyses en temps réel. Prêt à jouer ?\n\n➡️ Inscrivez-vous depuis ce profil\n#Padel #Tournoi #${club.replace(/\s/g, '')} #PadelOrganizers`,
      `${name} ARRIVE 🚀\n\n${club} organise ce tournoi avec la technologie PADELORGANIZERS : inscriptions, tableaux, écrans et résultats en direct.\n\n${mod}${when}\n\nNe le manquez pas !\n\n#Padel #Comp\u00e9tition #PadelOrganizers`,
    ),
    story: `🎾 ${name}\n${club}\n${mod}${when}\n🔗 Lien en bio\n#PadelOrganizers`,
    facebook: pick(rnd,
      `🏆 **${name}** à ${club}${when}\n\nUn tournoi de padel en ${mod}, marquage en direct pour tous les fans et tableau actualisé à la seconde.\n\n👥 Les joueurs confirment déjà leur place\n📅 ${day ? `Date : ${day}` : 'Réservez la date'}\n📍 ${club}\n\nInscrivez-vous et sécurisez votre binôme.\n\n#Padel #TournoiPadel #${club.replace(/\s/g, '')}`,
      `Prêt à jouer ? 🔥 ${name} arrive à ${club}. ${mod}${when}. Suivez le tournoi en direct et encouragez votre joueur préféré.\n\nInfos et inscriptions sur la page publique du tournoi.\n#Padel #PadelOrganizers`,
    ),
    linkedin: pick(rnd,
      `Nous avons le plaisir d'annoncer ${name}, qui se tiendra à ${club}${when}.\n\nNous professionnalisons l'amateur : ` + 'tableaux automatiques, marquage en direct, classement Elo, analyses et couverture complète pour joueurs et sponsors.\n\nLe tout depuis une seule plateforme numérique : PADELORGANIZERS.\n\nChaque tournoi est un produit numérique.\n#Padel #Événements #Innovation #Sport',
      `${name} · ${club}\n\nUn événement padel géré de bout en bout grâce à la technologie : ${mod}${when}. Données en direct, sponsoring et couverture professionnelle.\n\nPADELORGANIZERS — L'infrastructure numérique des événements mondiaux de padel.\n#PadelEvents #Tech #Sports #PadelOrganizers`,
    ),
    whatsapp: `🎾 ${name}\n🏟️ ${club}\n🎯 ${mod}${when}\n\nParticipez ! Places limitées. Demandez le lien du tournoi et confirmez votre binôme.`,
    emailSubject: `🎾 ${name} à ${club} — inscrivez-vous${day ? ' · ' + day : ''}`,
    emailBody: `Bonjour,\n\nnous vous écrivons depuis ${club} pour vous inviter à participer à **${name}**.\n\nDétails du tournoi :\n· Format : ${mod}\n· Date : ${day || 'à confirmer'}\n· Lieu : ${club}\n\nVous pourrez suivre tableaux, marquage en direct, classement et analyses sur la page publique du tournoi.\n\nRépondez à cet e-mail pour réserver votre place.\n\nCordialement,\nL'équipe ${club}`,
    description: `${name} est un tournoi de padel en ${mod} organisé par ${club}. Les participants suivent chaque match en direct : tableau actualisé, résultats en temps réel, classement et statistiques${when}.`,
    sponsorProposal: pick(rnd,
      `**Opportunité de sponsoring — ${name}**\n\nVotre marque accompagnera ${club} sur ce tournoi en ${mod}${when}. Nous proposons :\n\n· Sponsoring principal (logo sur tous les supports)\n· Sponsoring de piste (banner)\n· Présence sur la page publique du tournoi\n· Mentions sur les réseaux sociaux\n\nContactez-nous pour le dossier complet.\nPADELORGANIZERS · Sport et données en direct.`,
      `${name} cherche des sponsors 👋\n\n${club} organise cet événement avec une visibilité en direct sur écrans, réseaux et web. Occasions du logo sur les réseaux jusqu'au naming.\n\nParlons-en : sport + données + marque.\n#Sponsoring #Padel`,
    ),
    press: `**Communiqué de presse**\n\n**${name}** — ${club}${when}\n\nLe club organise un tournoi de padel en ${mod} avec gestion 100% numérique : inscriptions en ligne, tableaux automatiques, marquage en direct, classement et analyses en temps réel via la plateforme PADELORGANIZERS.\n\nLe tournoi disposera de sa propre page publique pour suivre en direct joueurs, sponsors et supporters.\n\nPour plus d'informations : contact ${club}.`,
  };

  const pt = {
    instagram: pick(rnd,
      `O padel voltou! 🎾🔥\nO **${name}** é o evento da semana\n\n🏟️ ${club}\n🎯 ${mod}${when}\n📍 ${where || club}\n\nQuadros, marcador ao vivo, ranking e análises em tempo real. Pronto para jogar?\n\n➡️ Inscreva-se neste perfil\n#Padel #Torneio #${club.replace(/\s/g, '')} #PadelOrganizers`,
      `${name} CHEGOU 🚀\n\n${club} organiza este torneio com a tecnologia PADELORGANIZERS: inscrições, quadros, ecrãs e resultados ao vivo.\n\n${mod}${when}\n\nNão perca!\n\n#Padel #Competição #PadelOrganizers`,
    ),
    story: `🎾 ${name}\n${club}\n${mod}${when}\n🔗 Link na bio\n#PadelOrganizers`,
    facebook: pick(rnd,
      `🏆 **${name}** em ${club}${when}\n\nUm torneio de padel com ${mod}, marcador ao vivo para todos os fãs e quadro atualizado a cada segundo.\n\n👥 Jogadores a confirmar vagas\n📅 ${day ? `Data: ${day}` : 'Reserve a data'}\n📍 ${club}\n\nInscreva-se e garanta a sua dupla.\n\n#Padel #TorneioPadel #${club.replace(/\s/g, '')}`,
      `Pronto para competir? 🔥 ${name} chega a ${club}. ${mod}${when}. Acompanhe o torneio ao vivo e anime o seu jogador favorito.\n\nMais informações e inscrições na página pública do torneio.\n#Padel #PadelOrganizers`,
    ),
    linkedin: pick(rnd,
      `Temos o prazer de anunciar ${name}, que se realizará em ${club}${when}.\n\nEstamos a profissionalizar o amador: ` + 'quadros automáticos, marcador em direto, ranking Elo, análises e cobertura completa para jogadores e patrocinadores.\n\nTudo numa única plataforma digital: PADELORGANIZERS.\n\nCada torneio é um produto digital.\n#Padel #Eventos #Inovação #Desporto',
      `${name} · ${club}\n\nUm evento de padel gerido de ponta a ponta com tecnologia: ${mod}${when}. Dados em direto, patrocínios e cobertura profissional.\n\nPADELORGANIZERS — A infraestrutura digital dos eventos globais de padel.\n#PadelEvents #Tech #Sports #PadelOrganizers`,
    ),
    whatsapp: `🎾 ${name}\n🏟️ ${club}\n🎯 ${mod}${when}\n\nParticipe! Vagas limitadas. Peça o link do torneio e confirme a sua dupla.`,
    emailSubject: `🎾 ${name} em ${club} — inscreva-se${day ? ' · ' + day : ''}`,
    emailBody: `Olá,\n\nescrevemos-lhe da parte de ${club} para o convidar a participar em **${name}**.\n\nDetalhes do torneio:\n· Formato: ${mod}\n· Data: ${day || 'a confirmar'}\n· Local: ${club}\n\nPoderá acompanhar quadros, marcador ao vivo, ranking e análises na página pública do torneio.\n\nResponda a este e-mail para reservar a sua vaga.\n\nCumprimentos,\nEquipa ${club}`,
    description: `${name} é um torneio de padel em ${mod} organizado por ${club}. Os asistentes seguem cada partida ao vivo: quadro atualizado, resultados em tempo real, ranking e estatísticas${when}.`,
    sponsorProposal: pick(rnd,
      `**Oportunidade de patrocínio — ${name}**\n\nA sua marca estará com ${club} neste torneio em ${mod}${when}. Oferecemos:\n\n· Patrocínio principal (logo em todas as peças)\n· Patrocínio de pista (banners)\n· Presença na página pública do torneio\n· Menções nas redes sociais\n\nContacte-nos para o dossier completo.\nPADELORGANIZERS · Desporto e dados em direto.`,
      `${name} procura patrocinadores 👋\n\n${club} organiza este evento com visibilidade em direto nos ecrãs, redes e web. Oportunidades do logo nas redes ao naming do torneio.\n\nVamos conversar: desporto + dados + marca.\n#Sponsoring #Padel`,
    ),
    press: `**Comunicado de imprensa**\n\n**${name}** — ${club}${when}\n\nO clube organiza um torneio de padel em ${mod} com gestão 100% digital: inscrições online, quadros automáticos, marcador ao vivo, ranking e análises em tempo real através da plataforma PADELORGANIZERS.\n\nO torneio terá página pública própria para seguir ao vivo jogadores, patrocinadores e adeptos.\n\nPara mais informações: contacto ${club}.`,
  };

  return { es, en, fr, pt }[lang] || es;
}

export const CONTENT_KEYS = {
  es: [
    ['instagram', '📸 Instagram post'],
    ['story', '⏱️ Instagram Story'],
    ['facebook', '📘 Facebook post'],
    ['linkedin', '💼 LinkedIn post'],
    ['whatsapp', '💬 WhatsApp message'],
    ['emailSubject', '📧 Email (asunto)'],
    ['emailBody', '📧 Email (cuerpo)'],
    ['description', '🌐 Descripción web'],
    ['sponsorProposal', '🤝 Propuesta sponsor'],
    ['press', '🗞️ Nota de prensa'],
  ],
  en: [
    ['instagram', '📸 Instagram post'],
    ['story', '⏱️ Instagram Story'],
    ['facebook', '📘 Facebook post'],
    ['linkedin', '💼 LinkedIn post'],
    ['whatsapp', '💬 WhatsApp message'],
    ['emailSubject', '📧 Email (subject)'],
    ['emailBody', '📧 Email (body)'],
    ['description', '🌐 Web description'],
    ['sponsorProposal', '🤝 Sponsor proposal'],
    ['press', '🗞️ Press release'],
  ],
  fr: [
    ['instagram', '📸 Post Instagram'],
    ['story', '⏱️ Story Instagram'],
    ['facebook', '📘 Post Facebook'],
    ['linkedin', '💼 Post LinkedIn'],
    ['whatsapp', '💬 Message WhatsApp'],
    ['emailSubject', '📧 E-mail (objet)'],
    ['emailBody', '📧 E-mail (corps)'],
    ['description', '🌐 Description web'],
    ['sponsorProposal', '🤝 Proposition sponsor'],
    ['press', '🗞️ Communiqué de presse'],
  ],
  pt: [
    ['instagram', '📸 Post Instagram'],
    ['story', '⏱️ Instagram Story'],
    ['facebook', '📘 Post Facebook'],
    ['linkedin', '💼 Post LinkedIn'],
    ['whatsapp', '💬 Mensagem WhatsApp'],
    ['emailSubject', '📧 E-mail (assunto)'],
    ['emailBody', '📧 E-mail (corpo)'],
    ['description', '🌐 Descrição web'],
    ['sponsorProposal', '🤝 Proposta de patrocínio'],
    ['press', '🗞️ Comunicado de imprensa'],
  ],
};