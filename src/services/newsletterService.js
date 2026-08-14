/**
 * newsletterService.js — Newsletter Studio (#comercial)
 * Genera un newsletter HTML listo para email (inline styles, compatible Gmail)
 * a partir de datos REALES del store: torneo activo, ranking global, sponsors
 * y coaches. La salida es un .html autocontenido que se puede copiar a Gmail
 * o alimentar los scripts de campaña de clientes/ (enviar-programado.mjs).
 *
 * Puro y determinista (dado un seed fijo → mismo output) para que la
 * regeneración sea reproducible y la QA verificable.
 */

import { generateMarketingContent } from './marketingAiService';
import { tierOf } from './sponsorService';

const I18N = {
  es: {
    badge: '📧 PADELORGANIZERS Newsletter',
    tagline: 'Las noticias que mueven tu club y tu escuela de pádel — de lo local a lo internacional.',
    heroPre: 'EDICIÓN',
    kpiPlayers: 'JUGADORES',
    kpiCourts: 'PISTAS',
    kpiSponsors: 'SPONSORS',
    kpiCoaches: 'COACHES',
    rankingTitle: '🌍 Top del ranking global',
    rankingSub: 'Elo + forma de la comunidad PADELORGANIZERS.',
    rankingTable: { rank: '#', player: 'Jugador', club: 'Club', elo: 'Elo', mov: 'Mov' },
    sponsorsTitle: '🤝 Patrocina tu torneo',
    sponsorsSub: 'Tu marca en pista central, pantallas y web pública del torneo.',
    coachesTitle: '👨🏫 Entrena con nosotros',
    coachesSub: 'Reserva una lección privada con el equipo de profesionales.',
    ctaTitle: 'CREATE · CONNECT · WIN',
    ctaSub: 'La infraestructura digital de los eventos globales de pádel.',
    ctaMarketing: '🎯 Marketing & Negocio',
    ctaRanking: '🌍 Ver ranking',
    ctaTournament: '🎾 Ver torneo demo',
    unsubscribe: 'Recibes este boletín porque eres parte de la comunidad PADELORGANIZERS. CREATE · CONNECT · WIN.',
    news1Title: 'El torneo {NAME} ya está en marcha',
    news1Text: '{MOD} · {DATE}. Cuadros, marcador en directo y ranking en tiempo real desde la web pública del torneo.',
    news2Title: 'Los clubes ya no persiguen a sus jugadores para cobrar',
    news2Text: 'Los partidos se reservan por la web pública del club y el pago se divide entre los 4 jugadores con un clic.',
    news3Title: 'Se acabaron las pistas vacías por no-shows',
    news3Text: 'Fianza reembolsable y lista de espera con un clic: si alguien falla, la plaza se cubre al instante.',
    news4Title: 'El asistente de marketing genera tus campañas en 4 idiomas',
    news4Text: 'Post, web, email y póster de tu torneo generados al instante en español, inglés, francés y portugués.',
    news1Alt: 'El torneo {NAME} se juega en tu club',
    news1AltText: '{MOD}. Inscripción online, pago dividido y pista garantizada: el jugador reserva solo en la web pública del club.',
    news2Alt: 'Las escuelas cierran el mes sin cuadrar asistencias',
    news2AltText: 'El ERP de escuela registra la asistencia del monitor, cobra recurrente a fin de mes y genera la factura automática.',
    news3Alt: 'Directorio: cada club, su ficha digital verificada',
    news3AltText: 'Vigo, Madrid, Barcelona y Valencia ya tienen perfil público con pistas, contacto y verificaciones. Reserva en segundos.',
    news4Alt: 'Player Digital ID: el historial acompaña al jugador',
    news4AltText: 'Perfil público internacional con Elo, nivel, historial, rivalidades y curva de progresión.',
  },
  en: {
    badge: '📧 PADELORGANIZERS Newsletter',
    tagline: 'The stories moving your padel club and school — from local to international.',
    heroPre: 'EDITION',
    kpiPlayers: 'PLAYERS',
    kpiCourts: 'COURTS',
    kpiSponsors: 'SPONSORS',
    kpiCoaches: 'COACHES',
    rankingTitle: '🌍 Global ranking top',
    rankingSub: 'Elo + form of the PADELORGANIZERS community.',
    rankingTable: { rank: '#', player: 'Player', club: 'Club', elo: 'Elo', mov: 'Mov' },
    sponsorsTitle: '🤝 Sponsor your tournament',
    sponsorsSub: 'Your brand on centre court, screens and the public tournament page.',
    coachesTitle: '👨🏫 Train with us',
    coachesSub: 'Book a private lesson with our professional team.',
    ctaTitle: 'CREATE · CONNECT · WIN',
    ctaSub: 'The digital infrastructure for global padel events.',
    ctaMarketing: '🎯 Marketing & Business',
    ctaRanking: '🌍 View ranking',
    ctaTournament: '🎾 View demo tournament',
    unsubscribe: 'You receive this newsletter as part of the PADELORGANIZERS community. CREATE · CONNECT · WIN.',
    news1Title: 'The {NAME} tournament is underway',
    news1Text: '{MOD} · {DATE}. Draws, live scoring and ranking in real time on the public tournament page.',
    news2Title: 'Clubs no longer chase players to collect payment',
    news2Text: 'Matches are booked through the club\'s public web and the payment splits between the 4 players in one click.',
    news3Title: 'No more empty courts from no-shows',
    news3Text: 'Refundable deposit and one-click waiting list: if someone fails, the slot is covered instantly.',
    news4Title: 'The marketing assistant generates your campaigns in 4 languages',
    news4Text: 'Post, web, email and poster of your tournament generated instantly in Spanish, English, French and Portuguese.',
    news1Alt: 'The {NAME} tournament is played at your club',
    news1AltText: '{MOD}. Online registration, split payment and guaranteed court: players book only on the club\'s public page.',
    news2Alt: 'Schools close the month without manual attendance',
    news2AltText: 'The school ERP records coach attendance, charges recurrently at month end and generates the invoice automatically.',
    news3Alt: 'Directory: every club, its verified digital profile',
    news3AltText: 'Vigo, Madrid, Barcelona and Valencia already have their public profile with courts, contact and verifications. Book in seconds.',
    news4Alt: 'Player Digital ID: the record follows the player',
    news4AltText: 'International public profile with Elo, level, history, rivalries and progression curve.',
  },
  fr: {
    badge: '📧 PADELORGANIZERS Newsletter',
    tagline: 'Les actualités qui font bouger votre club et votre école de padel — du local à l\'international.',
    heroPre: 'ÉDITION',
    kpiPlayers: 'JOUEURS',
    kpiCourts: 'PISTES',
    kpiSponsors: 'SPONSORS',
    kpiCoaches: 'COACHS',
    rankingTitle: '🌍 Top du classement global',
    rankingSub: 'Elo + forme de la communauté PADELORGANIZERS.',
    rankingTable: { rank: '#', player: 'Joueur', club: 'Club', elo: 'Elo', mov: 'Mouv' },
    sponsorsTitle: '🤝 Sponsorisez votre tournoi',
    sponsorsSub: 'Votre marque sur la piste centrale, les écrans et la page publique du tournoi.',
    coachesTitle: '👨🏫 Entraînez-vous avec nous',
    coachesSub: 'Réservez une leçon privée avec notre équipe de professionnels.',
    ctaTitle: 'CREATE · CONNECT · WIN',
    ctaSub: 'L\'infrastructure numérique des événements mondiaux de padel.',
    ctaMarketing: '🎯 Marketing & Business',
    ctaRanking: '🌍 Voir le classement',
    ctaTournament: '🎾 Voir le tournoi démo',
    unsubscribe: 'Vous recevez cette newsletter car vous faites partie de la communauté PADELORGANIZERS. CREATE · CONNECT · WIN.',
    news1Title: 'Le tournoi {NAME} est lancé',
    news1Text: '{MOD} · {DATE}. Tableaux, marquage en direct et classement en temps réel sur la page publique du tournoi.',
    news2Title: 'Les clubs ne courent plus après leurs joueurs pour encaisser',
    news2Text: 'Les matchs se réservent sur la web publique du club et le paiement se divise entre les 4 joueurs en un clic.',
    news3Title: 'Fini les pistes vides à cause des no-shows',
    news3Text: 'Caution remboursable et liste d\'attente en un clic : si quelqu\'un défaille, la place est couverte immédiatement.',
    news4Title: 'L\'assistant marketing génère vos campagnes en 4 langues',
    news4Text: 'Post, web, e-mail et affiche de votre tournoi générés instantanément en espagnol, anglais, français et portugais.',
    news1Alt: 'Le tournoi {NAME} se joue dans votre club',
    news1AltText: '{MOD}. Inscription en ligne, paiement divisé et piste garantie : le joueur réserve sur la web publique du club.',
    news2Alt: 'Les écoles bouclent le mois sans pointer les présences',
    news2AltText: 'L\'ERP d\'école enregistre la présence du moniteur, encaisse en fin de mois et génère la facture automatiquement.',
    news3Alt: 'Annuaire : chaque club, sa fiche numérique vérifiée',
    news3AltText: 'Vigo, Madrid, Barcelone et Valence ont déjà leur profil public avec pistes, contact et vérifications. Réservez en quelques secondes.',
    news4Alt: 'Player Digital ID : le palmarès suit le joueur',
    news4AltText: 'Profil public international avec Elo, niveau, historique, rivalités et courbe de progression.',
  },
  pt: {
    badge: '📧 PADELORGANIZERS Newsletter',
    tagline: 'As notícias que movem o seu clube e a sua escola de pádel — do local ao internacional.',
    heroPre: 'EDIÇÃO',
    kpiPlayers: 'JOGADORES',
    kpiCourts: 'PISTAS',
    kpiSponsors: 'SPONSORS',
    kpiCoaches: 'TREINADORES',
    rankingTitle: '🌍 Top do ranking global',
    rankingSub: 'Elo + forma da comunidade PADELORGANIZERS.',
    rankingTable: { rank: '#', player: 'Jogador', club: 'Clube', elo: 'Elo', mov: 'Mov' },
    sponsorsTitle: '🤝 Patrocine o seu torneio',
    sponsorsSub: 'A sua marca na pista central, nos ecrãs e na página pública do torneio.',
    coachesTitle: '👨🏫 Treine connosco',
    coachesSub: 'Reserve uma aula privada com a nossa equipa de profissionais.',
    ctaTitle: 'CREATE · CONNECT · WIN',
    ctaSub: 'A infraestrutura digital dos eventos globais de pádel.',
    ctaMarketing: '🎯 Marketing & Negócio',
    ctaRanking: '🌍 Ver ranking',
    ctaTournament: '🎾 Ver torneio demo',
    unsubscribe: 'Recebe esta newsletter por fazer parte da comunidade PADELORGANIZERS. CREATE · CONNECT · WIN.',
    news1Title: 'O torneio {NAME} já está em curso',
    news1Text: '{MOD} · {DATE}. Quadros, marcador ao vivo e ranking em tempo real na página pública do torneio.',
    news2Title: 'Os clubes deixam de perseguir os jogadores para cobrar',
    news2Text: 'Os jogos são reservados pela web pública do clube e o pagamento divide-se entre os 4 jogadores com um clique.',
    news3Title: 'Sem mais pistas vazias por no-shows',
    news3Text: 'Caução reembolsável e lista de espera com um clique: se alguém faltar, a vaga é coberta de imediato.',
    news4Title: 'O assistente de marketing gera as suas campanhas em 4 idiomas',
    news4Text: 'Post, web, e-mail e cartaz do seu torneio gerados instantaneamente em espanhol, inglês, francês e português.',
    news1Alt: 'O torneio {NAME} joga-se no seu clube',
    news1AltText: '{MOD}. Inscrição online, pagamento dividido e pista garantida: o jogador reserva só na web pública do clube.',
    news2Alt: 'As escolas fecham o mês sem confirmar presenças',
    news2AltText: 'O ERP de escola regista a presença do monitor, cobra recorrente a finais do mês e gera a fatura automaticamente.',
    news3Alt: 'Diretório: cada clube, a sua ficha digital verificada',
    news3AltText: 'Vigo, Madrid, Barcelona e Valência já têm perfil público com pistas, contacto e verificações. Reserve em segundos.',
    news4Alt: 'Player Digital ID: o histórico acompanha o jogador',
    news4AltText: 'Perfil público internacional com Elo, nível, histórico, rivalidades e curva de progressão.',
  },
};

const MODALITY_TEXT = {
  es: { americano: 'formato Americano', mexicano: 'formato Mexicano', suizo: 'formato Suizo', knockout: 'eliminación directa' },
  en: { americano: 'Americano format', mexicano: 'Mexicano format', suizo: 'Swiss format', knockout: 'knockout format' },
  fr: { americano: 'format américain', mexicano: 'format mexicain', suizo: 'format suisse', knockout: 'élimination directe' },
  pt: { americano: 'formato Americano', mexicano: 'formato Mexicano', suizo: 'formato Suíço', knockout: 'eliminação direta' },
};

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtDate(d, lang) {
  if (!d) return '';
  try {
    const loc = lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-PT' : 'en-GB';
    return new Date(d).toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return d; }
}

function movementBadge(m) {
  if (m === 'up') return '<span style="color:#10b981">▲</span>';
  if (m === 'down') return '<span style="color:#f87171">▼</span>';
  if (m === 'new') return '<span style="color:#fbbf24">🆕</span>';
  return '<span style="color:#64748b">•</span>';
}

/**
 * buildNewsletter — genera el HTML del newsletter a partir de datos reales.
 * @param {Object} opts
 * @param {string} opts.lang 'es'|'en'|'fr'|'pt'
 * @param {string} opts.edition  p.ej. 'Agosto 2026'
 * @param {Object} opts.tournament  torneo del store ({name, club, modality, totalCourts, players?, matches?, status})
 * @param {Array}  opts.ranking     salida de computeGlobalRanking (rows con rank/name/club/elo/movement/level)
 * @param {Array}  opts.sponsors    sponsors (listSponsorsSync)
 * @param {Array}  opts.coaches     coaches (listCoaches local)
 * @param {Object} opts.urls        { tournament, ranking, marketing }
 * @returns {{ subject: string, html: string }}
 */
export function buildNewsletter({ lang = 'es', edition = 'Agosto 2026', tournament = {}, ranking = [], sponsors = [], coaches = [], urls = {}, seed = 42 } = {}) {
  const T = I18N[lang] || I18N.es;
  const MODS = MODALITY_TEXT[lang] || MODALITY_TEXT.es;

  const name = tournament.name || 'Open Pádel Pro 2026';
  const club = tournament.club || 'Mi Club';
  const mod = MODS[tournament.modality] || MODS.americano;
  const playersN = tournament.players ? tournament.players.length : 0;
  const courtsN = tournament.totalCourts || 4;
  const sponsored = sponsors.length;
  const coached = coaches.length;

  const useAlt = (Number(seed) % 2) === 0;
  const ai = generateMarketingContent({ name, club, modality: tournament.modality, date: tournament.date || '', place: '', lang, seed });

  const N = [
    {
      title: (useAlt ? T.news1Alt : T.news1Title).replace('{NAME}', name),
      text: useAlt
        ? T.news1AltText.replace('{MOD}', mod)
        : T.news1Text.replace('{MOD}', mod).replace('{DATE}', fmtDate(tournament.date, lang) || club),
    },
    { title: useAlt ? T.news2Alt : T.news2Title, text: useAlt ? T.news2AltText : T.news2Text },
    { title: useAlt ? T.news3Alt : T.news3Title, text: useAlt ? T.news3AltText : T.news3Text },
    { title: useAlt ? T.news4Alt : T.news4Title, text: useAlt ? T.news4AltText : T.news4Text },
  ];
  const icons = ['🏟️', '🎾', '🚫', '📣'];

  const BASE = urls.base || 'https://padelorganizers.vercel.app';
  const urlTournament = urls.tournament || `${BASE}/tournament/open-padel-vigo-2026`;
  const urlRanking = urls.ranking || `${BASE}/ranking`;
  const urlMarketing = urls.marketing || `${BASE}/marketing`;
  const urlCoaches = urls.coaches || `${BASE}/coaches`;

  const top = ranking.slice(0, 5);
  const rowsHtml = top.length
    ? top.map((r, i) => `
      <tr>
        <td style="padding:8px 10px;font-size:12px;font-weight:800;color:#64748b">${r.rank}</td>
        <td style="padding:8px 10px;font-size:12.5px;color:#e2e8f0;font-weight:700">${esc(r.name)}</td>
        <td style="padding:8px 10px;font-size:11.5px;color:#94a3b8">${esc(r.club || '—')}</td>
        <td style="padding:8px 10px;font-size:12.5px;color:#a3e635;font-weight:800">${r.elo}</td>
        <td style="padding:8px 10px;font-size:11px;color:#94a3b8">${movementBadge(r.movement)}</td>
      </tr>`).join('')
    : `<tr><td style="padding:14px;font-size:12px;color:#94a3b8;text-align:center">—</td></tr>`;

  const sponsorsHtml = sponsored
    ? sponsors.slice(0, 4).map((s) => {
        const tier = tierOf(s.tier);
        return `
        <div style="display:inline-block;background:#12262a;border:1px solid ${esc(tier.color)}55;border-radius:10px;padding:10px 14px;margin:4px;font-size:11.5px;font-weight:800;color:${esc(tier.color)}">
          ${esc(tier.emoji)} ${esc(s.brand || s.name)}
        </div>`;
      }).join('')
    : `<div style="font-size:12px;color:#94a3b8">—</div>`;

  const coachesHtml = coached
    ? coaches.slice(0, 3).map((c) => `
      <div style="background:#12262a;border-radius:10px;padding:12px;margin:4px;display:inline-block;width:46%">
        <div style="font-size:12.5px;color:#e2e8f0;font-weight:800">${esc(c.name)}</div>
        <div style="font-size:11px;color:#10b981;margin-top:2px">${c.level || '—'} · ${c.hourlyRate ? c.hourlyRate + ' €/h' : '—'}</div>
      </div>`).join('')
    : `<div style="font-size:12px;color:#94a3b8">—</div>`;

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(ai.emailSubject)}</title>
</head>
<body style="margin:0;padding:0;background:#0b1513;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1513">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#0d1f1b;border:1px solid #1c3a33;border-radius:18px;overflow:hidden;max-width:600px">

        <!-- HERO -->
        <tr><td style="background:linear-gradient(135deg,#0c1f1a,#0e241f);border-bottom:1px solid #1c3a33;padding:28px 30px;text-align:center">
          <div style="display:inline-block;font-size:11px;font-weight:800;letter-spacing:1.5px;color:#a3e635;padding:5px 14px;border-radius:99px;background:#1a3a2a;border:1px solid #a3e63533">${esc(T.badge)}</div>
          <h1 style="font-size:26px;font-weight:900;color:#f1f5f9;margin:14px 0 4px">🗞️ ${esc(T.heroPre)} ${esc(edition)}</h1>
          <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:0 auto;max-width:480px">${esc(T.tagline)}</p>
        </td></tr>

        <!-- KPIs -->
        <tr><td style="padding:16px 30px 4px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:10px;background:#12262a;border-radius:12px;width:25%">
                <div style="font-size:18px;font-weight:900;color:#a3e635">${playersN}</div>
                <div style="font-size:9.5px;font-weight:800;letter-spacing:1px;color:#64748b">${esc(T.kpiPlayers)}</div>
              </td>
              <td width="8"></td>
              <td align="center" style="padding:10px;background:#12262a;border-radius:12px;width:25%">
                <div style="font-size:18px;font-weight:900;color:#38bdf8">${courtsN}</div>
                <div style="font-size:9.5px;font-weight:800;letter-spacing:1px;color:#64748b">${esc(T.kpiCourts)}</div>
              </td>
              <td width="8"></td>
              <td align="center" style="padding:10px;background:#12262a;border-radius:12px;width:25%">
                <div style="font-size:18px;font-weight:900;color:#fbbf24">${sponsored}</div>
                <div style="font-size:9.5px;font-weight:800;letter-spacing:1px;color:#64748b">${esc(T.kpiSponsors)}</div>
              </td>
              <td width="8"></td>
              <td align="center" style="padding:10px;background:#12262a;border-radius:12px;width:25%">
                <div style="font-size:18px;font-weight:900;color:#fb7185">${coached}</div>
                <div style="font-size:9.5px;font-weight:800;letter-spacing:1px;color:#64748b">${esc(T.kpiCoaches)}</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Noticias -->
        <tr><td style="padding:14px 30px 0">
          ${N.map((n, i) => `
          <div style="background:#12262a;border:1px solid #1c3a33;border-radius:12px;padding:14px 16px;margin-bottom:10px">
            <div style="font-size:13.5px;font-weight:800;color:#f1f5f9">${icons[i]} ${esc(n.title)}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:4px;line-height:1.55">${esc(n.text)}</div>
          </div>`).join('')}
        </td></tr>

        <!-- Ranking top -->
        <tr><td style="padding:18px 30px 0">
          <div style="font-size:15px;font-weight:900;color:#f1f5f9">${esc(T.rankingTitle)}</div>
          <div style="font-size:11.5px;color:#64748b;margin-top:2px">${esc(T.rankingSub)}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12262a;border-radius:12px;margin-top:10px;overflow:hidden">
            <tr style="background:#0f211d">
              <td style="padding:8px 10px;font-size:9.5px;font-weight:800;letter-spacing:1px;color:#64748b">${esc(T.rankingTable.rank)}</td>
              <td style="padding:8px 10px;font-size:9.5px;font-weight:800;letter-spacing:1px;color:#64748b">${esc(T.rankingTable.player)}</td>
              <td style="padding:8px 10px;font-size:9.5px;font-weight:800;letter-spacing:1px;color:#64748b">${esc(T.rankingTable.club)}</td>
              <td style="padding:8px 10px;font-size:9.5px;font-weight:800;letter-spacing:1px;color:#64748b">${esc(T.rankingTable.elo)}</td>
              <td style="padding:8px 10px;font-size:9.5px;font-weight:800;letter-spacing:1px;color:#64748b">${esc(T.rankingTable.mov)}</td>
            </tr>
            ${rowsHtml}
          </table>
          <div align="center" style="margin-top:12px">
            <a href="${esc(urlRanking)}" style="display:inline-block;font-size:12.5px;font-weight:800;color:#a3e635;text-decoration:none;border:1px solid #a3e63555;padding:10px 22px;border-radius:99px">${esc(T.ctaRanking)} →</a>
          </div>
        </td></tr>

        <!-- Sponsors -->
        <tr><td style="padding:18px 30px 0">
          <div style="font-size:15px;font-weight:900;color:#f1f5f9">${esc(T.sponsorsTitle)}</div>
          <div style="font-size:11.5px;color:#64748b;margin-top:2px">${esc(T.sponsorsSub)}</div>
          <div style="margin-top:10px">${sponsorsHtml}</div>
        </td></tr>

        <!-- Coaches -->
        <tr><td style="padding:18px 30px 0">
          <div style="font-size:15px;font-weight:900;color:#f1f5f9">${esc(T.coachesTitle)}</div>
          <div style="font-size:11.5px;color:#64748b;margin-top:2px">${esc(T.coachesSub)}</div>
          <div style="margin-top:10px">${coachesHtml}</div>
          <div align="center" style="margin-top:12px">
            <a href="${esc(urlCoaches)}" style="display:inline-block;font-size:12.5px;font-weight:800;color:#38bdf8;text-decoration:none;border:1px solid #38bdf855;padding:10px 22px;border-radius:99px">${esc(T.ctaTournament)} →</a>
          </div>
        </td></tr>

        <!-- CTA final -->
        <tr><td style="padding:24px 30px 20px;text-align:center">
          <div style="font-size:17px;font-weight:900;color:#a3e635">${esc(T.ctaTitle)}</div>
          <div style="font-size:12px;color:#64748b;margin:4px 0 14px">${esc(T.ctaSub)}</div>
          <a href="${esc(urlMarketing)}" style="display:inline-block;font-size:13px;font-weight:800;color:#04140f;background:linear-gradient(135deg,#10b981,#059669);padding:12px 26px;border-radius:12px;text-decoration:none">${esc(T.ctaMarketing)}</a>
          <a href="${esc(urlTournament)}" style="display:inline-block;font-size:13px;font-weight:800;color:#f1f5f9;background:#12262a;border:1px solid #1c3a33;padding:12px 26px;border-radius:12px;text-decoration:none;margin-left:8px">${esc(T.ctaTournament)}</a>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="border-top:1px solid #1c3a33;padding:16px 30px;text-align:center">
          <div style="font-size:10.5px;color:#64748b;letter-spacing:0.5px;line-height:1.6">${esc(T.unsubscribe)}</div>
          <div style="font-size:9.5px;color:#334a46;margin-top:6px">PADELORGANIZERS · THE DIGITAL INFRASTRUCTURE FOR GLOBAL PADEL EVENTS</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: ai.emailSubject, html };
}

// Descarga el HTML como archivo listo para el pipeline de envío
export function downloadNewsletterHtml(html, filename = 'newsletter.html') {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
