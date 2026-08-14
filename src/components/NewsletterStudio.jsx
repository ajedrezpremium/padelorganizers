import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../services/store';
import { computeGlobalRanking } from '../services/globalRankingService';
import { listLeague } from '../services/leagueService';
import { listSponsorsSync } from '../services/sponsorService';
import { ensureCoachSeed } from '../services/coachDiscoveryService';
import { buildNewsletter, downloadNewsletterHtml } from '../services/newsletterService';

const I18N = {
  es: {
    badge: '🎛️ Newsletter Studio',
    title: 'Genera tu newsletter con datos reales',
    sub: 'Tira de tu torneo activo, ranking global, sponsors y entrenadores. El HTML resultante es compatible con Gmail y con los scripts de campaña.',
    lang: 'Idioma',
    edition: 'Edición',
    club: 'Club',
    regenerate: '🎲 Regenerar (variantes)',
    copy: '📋 Copiar HTML',
    download: '⬇️ Descargar .html',
    previewLabel: 'Vista previa (exacta al email)',
    sourceLabel: 'HTML generado',
    hint: 'Copia el HTML en Gmail (redactar → Insertar → HTML) o usa clientes/enviar-espaciado.mjs con el archivo descargado.',
    empty: 'Sin jugadores todavía. Crea un torneo o entra en la Ranked League para alimentar el ranking.',
    copied: '✓ HTML copiado',
    back: '← Volver a la vista pública',
    loading: 'Cargando datos reales…',
    metaRanking: 'ranking',
    metaSponsors: 'sponsors',
    metaCoaches: 'coaches',
    dataFrom: 'Datos reales: ',
  },
  en: {
    badge: '🎛️ Newsletter Studio',
    title: 'Build your newsletter with real data',
    sub: 'Pulls your active tournament, global ranking, sponsors and coaches. The HTML output is Gmail-ready and fits the campaign scripts.',
    lang: 'Language',
    edition: 'Edition',
    club: 'Club',
    regenerate: '🎲 Regenerate (variants)',
    copy: '📋 Copy HTML',
    download: '⬇️ Download .html',
    previewLabel: 'Preview (exact email render)',
    sourceLabel: 'Generated HTML',
    hint: 'Paste the HTML into Gmail (compose → Insert → HTML) or feed clientes/enviar-espaciado.mjs with the downloaded file.',
    empty: 'No players yet. Create a tournament or join the Ranked League to feed the ranking.',
    copied: '✓ HTML copied',
    back: '← Back to public view',
    loading: 'Loading real data…',
    metaRanking: 'ranking',
    metaSponsors: 'sponsors',
    metaCoaches: 'coaches',
    dataFrom: 'Real data: ',
  },
  fr: {
    badge: '🎛️ Newsletter Studio',
    title: 'Générez votre newsletter avec des données réelles',
    sub: 'Puis votre tournoi actif, classement global, sponsors et coachs. Le HTML est compatible Gmail et les scripts de campagne.',
    lang: 'Langue',
    edition: 'Édition',
    club: 'Club',
    regenerate: '🎲 Régénérer (variantes)',
    copy: '📋 Copier le HTML',
    download: '⬇️ Télécharger .html',
    previewLabel: 'Aperçu (rendu exact de l\'e-mail)',
    sourceLabel: 'HTML généré',
    hint: 'Collez le HTML dans Gmail (rédiger → Insérer → HTML) ou utilisez clientes/enviar-espaciado.mjs avec le fichier téléchargé.',
    empty: 'Aucun joueur. Créez un tournoi ou rejoignez la Ranked League pour alimenter le classement.',
    copied: '✓ HTML copié',
    back: '← Retour à la vue publique',
    loading: 'Chargement des données réelles…',
    metaRanking: 'classement',
    metaSponsors: 'sponsors',
    metaCoaches: 'coachs',
    dataFrom: 'Données réelles : ',
  },
  pt: {
    badge: '🎛️ Newsletter Studio',
    title: 'Gere a sua newsletter com dados reais',
    sub: 'Usa o seu torneio ativo, ranking global, patrocinadores e treinadores. O HTML gerado é compatível com o Gmail e com os scripts de campanha.',
    lang: 'Idioma',
    edition: 'Edição',
    club: 'Clube',
    regenerate: '🎲 Regenerar (variantes)',
    copy: '📋 Copiar HTML',
    download: '⬇️ Descarregar .html',
    previewLabel: 'Pré-visualização (render exato do e-mail)',
    sourceLabel: 'HTML gerado',
    hint: 'Cole o HTML no Gmail (redigir → Inserir → HTML) ou use clientes/enviar-espaciado.mjs com o ficheiro descarregado.',
    empty: 'Sem jogadores ainda. Crie um torneio ou entre na Ranked League para alimentar o ranking.',
    copied: '✓ HTML copiado',
    back: '← Voltar à vista pública',
    loading: 'A carregar dados reais…',
    metaRanking: 'ranking',
    metaSponsors: 'patrocinadores',
    metaCoaches: 'treinadores',
    dataFrom: 'Dados reais: ',
  },
};

const LANGS = ['es', 'en', 'fr', 'pt'];

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const btn = { border: 'none', padding: '11px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' };

export default function NewsletterStudio({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const navigate = useNavigate();
  const store = useStore();
  const tournament = store.tournament || {};

  const [edition, setEdition] = useState(lang === 'es' || lang === 'pt' ? 'Agosto 2026' : lang === 'fr' ? 'Août 2026' : 'August 2026');
  const [club, setClub] = useState(tournament.club || '');
  const [seed, setSeed] = useState(42);
  const [entries, setEntries] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [copied, setCopied] = useState(false);

  const sponsors = useMemo(() => listSponsorsSync(), []);

  useEffect(() => {
    let mounted = true;
    listLeague('', { cloud: false })
      .then(list => { if (mounted) setEntries(list); })
      .catch(() => {});
    ensureCoachSeed({ cloud: false })
      .then(list => { if (mounted) setCoaches(Array.isArray(list) ? list : []); })
      .catch(() => setCoaches([]));
    return () => { mounted = false; };
  }, []);

  const ranking = useMemo(() => computeGlobalRanking({ tournament: store, leagueEntries: entries }), [store, entries]);

  const payload = useMemo(() => ({
    lang,
    edition,
    seed,
    tournament: {
      ...tournament,
      club: club || tournament.club,
      name: tournament.name || 'Open Pádel Pro 2026',
      players: store.players || tournament.players,
      matches: store.matches || tournament.matches,
    },
    ranking,
    sponsors,
    coaches,
    urls: { base: 'https://padelorganizers.vercel.app' },
  }), [lang, edition, club, seed, tournament, store.players, store.matches, ranking, sponsors, coaches]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const newsletter = useMemo(() => buildNewsletter(payload), [payload, seed]);

  const handleCopy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(newsletter.html);
      ok = true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = newsletter.html;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      document.body.removeChild(ta);
    }
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1800); }
  };

  const handleDownload = () => {
    downloadNewsletterHtml(newsletter.html, `newsletter-${edition.replace(/[^\w]+/g, '-').toLowerCase()}.html`);
  };

  const meta = [
    `${ranking.length} ${T.metaRanking}`,
    `${sponsors.length} ${T.metaSponsors}`,
    `${coaches.length} ${T.metaCoaches}`,
  ].join(' · ');

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        {/* Cabecera */}
        <div style={{ ...card, padding: 24, background: 'linear-gradient(135deg,#0c1f1a,#0e241f)', borderColor: 'rgba(132,204,22,0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: '#a3e635', padding: '5px 14px', borderRadius: 99, background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.3)' }}>{T.badge}</span>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: '12px 0 6px', color: 'var(--padel-text)' }}>{T.title}</h1>
              <p style={{ fontSize: 13, color: 'var(--padel-muted)', maxWidth: 640, lineHeight: 1.6, margin: 0 }}>{T.sub}</p>
              <div style={{ fontSize: 11.5, color: '#10b981', marginTop: 10, fontWeight: 700 }}>{T.dataFrom}{meta}</div>
            </div>
            <button onClick={() => navigate('/newsletters')} style={{ ...btn, background: 'rgba(255,255,255,0.06)', color: 'var(--padel-text)', border: '1px solid var(--padel-border)' }}>{T.back}</button>
          </div>
        </div>

        {/* Controles */}
        <div style={{ ...card, marginTop: 16, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)' }}>
            {T.lang}
            <select value={lang} disabled style={{ background: '#0f211d', color: 'var(--padel-text)', border: '1px solid var(--padel-border)', borderRadius: 10, padding: '9px 12px', fontSize: 13, fontWeight: 700 }}>{LANGS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}</select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)' }}>
            {T.edition}
            <input value={edition} onChange={e => setEdition(e.target.value)} style={{ background: '#0f211d', color: 'var(--padel-text)', border: '1px solid var(--padel-border)', borderRadius: 10, padding: '9px 12px', fontSize: 13, width: 150 }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--padel-muted)' }}>
            {T.club}
            <input value={club} onChange={e => setClub(e.target.value)} placeholder={tournament.club || 'Mi Club'} style={{ background: '#0f211d', color: 'var(--padel-text)', border: '1px solid var(--padel-border)', borderRadius: 10, padding: '9px 12px', fontSize: 13, width: 170 }} />
          </label>
          <button onClick={() => setSeed(s => (s % 89) + 1)} style={{ ...btn, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }}>{T.regenerate}</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleCopy} style={{ ...btn, background: 'rgba(255,255,255,0.08)', color: '#a3e635', border: '1px solid rgba(132,204,22,0.4)' }}>{copied ? T.copied : T.copy}</button>
            <button onClick={handleDownload} style={{ ...btn, background: 'rgba(255,255,255,0.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }}>{T.download}</button>
          </div>
        </div>

        <p style={{ fontSize: 11.5, color: '#64748b', margin: '10px 2px 0', lineHeight: 1.5 }}>{T.hint}</p>

        {/* Vista previa */}
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--padel-muted)', marginBottom: 10 }}>{T.previewLabel}</div>
          <iframe title="newsletter-preview" sandbox="" srcDoc={newsletter.html} style={{ width: '100%', height: 620, border: '1px solid var(--padel-border)', borderRadius: 12, background: '#0b1513' }} />
        </div>
      </div>
    </div>
  );
}
