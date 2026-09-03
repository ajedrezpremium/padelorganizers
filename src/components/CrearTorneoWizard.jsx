import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildTournament, emptyTournamentData } from '../services/store';

const I18N = {
  es: {
    title: 'Crea tu torneo paso a paso',
    subtitle: 'Sigue las 5 fases y lanza tu torneo en minutos. Todo queda guardado y puedes continuar desde la Central de Control.',
    step: 'Paso',
    next: 'Siguiente →',
    prev: '← Anterior',
    create: 'Crear torneo →',
    success: '¡Torneo creado! Redirigiendo a la Central de Control…',
    phases: [
      { title: 'Fase 1 · Planificación y definición', desc: 'Formato, categorías, sede y reglamento.' },
      { title: 'Fase 2 · Inscripciones y difusión', desc: 'Pagos, difusión y comunicación.' },
      { title: 'Fase 3 · Cuadrantes y logística', desc: 'Cuadro, horarios y compras.' },
      { title: 'Fase 4 · El día del torneo', desc: 'Check-in, pizarra y experiencia.' },
      { title: 'Fase 5 · Clausura y post-torneo', desc: 'Premios, fotos y encuesta.' },
    ],
    f1: { name: 'Nombre del torneo', phName: 'I Open Pádel Vigo 2026', club: 'Club / Sede', phClub: 'Club Pádel Bouzas', city: 'Ciudad', phCity: 'Vigo', date: 'Fecha inicio', modality: 'Formato', modalities: ['americano — rotación fija', 'mexicano — re-emparejo dinámico', 'suizo — parejas equilibradas IA', 'eliminatorio — cuadro directo'], values: ['americano','mexicano','suizo','knockout'], courts: 'Nº de pistas', points: 'Puntos por partido', gold: 'Punto de oro activado', categories: 'Categorías', phCat: 'Ej: Masculino A, Femenino B, Mixto', budget: 'Presupuesto estimado (€)', regulation: 'Reglamento resumido' },
    f2: { price: 'Precio inscripción (€)', max: 'Plazas máximas (parejas)', email: 'Email contacto', diffusion: 'Canales de difusión', opts: ['WhatsApp', 'Instagram', 'Recepción club', 'Email'], flyer: '¿Necesitas flyer?', group: 'Grupo difusión (WhatsApp/Telegram)', pay: 'Pago previo obligatorio' },
    f3: { closeDate: 'Cierre inscripciones', seed: 'Cabezas de serie (evitar cruces tempranos)', draw: 'Sorteo en directo', schedule: 'Horario escalonado', slot: 'Minutos por partido', opts: ['75 min','90 min'], shopping: 'Compras (pelotas, trofeos, agua…)' },
    f4: { checkin: 'Check-in 30 min antes', board: 'Pizarra / app tiempo real', referee: 'Autoárbitraje / árbitro', experience: 'Música, fotos, hidratación' },
    f5: { prizes: 'Trofeos y premios', logistics: 'Pago proveedores y limpieza', photos: 'Fotos y agradecimientos', survey: 'Encuesta post-torneo' },
  },
  en: {
    title: 'Create your tournament step by step',
    subtitle: 'Follow the 5 phases and launch your tournament in minutes. Everything is saved and you can continue from the Control Center.',
    step: 'Step', next: 'Next →', prev: '← Previous', create: 'Create tournament →', success: 'Tournament created! Redirecting to Control Center…',
    phases: [
      { title: 'Phase 1 · Planning & definition', desc: 'Format, categories, venue and rules.' },
      { title: 'Phase 2 · Registrations & promotion', desc: 'Payments, promotion and communication.' },
      { title: 'Phase 3 · Brackets & logistics', desc: 'Draw, schedule and purchases.' },
      { title: 'Phase 4 · Tournament day', desc: 'Check-in, board and experience.' },
      { title: 'Phase 5 · Closing & post-event', desc: 'Prizes, photos and survey.' },
    ],
    f1: { name: 'Tournament name', phName: 'I Open Padel Vigo 2026', club: 'Club / Venue', phClub: 'Padel Club Bouzas', city: 'City', phCity: 'Vigo', date: 'Start date', modality: 'Format', modalities: ['americano — fixed rotation', 'mexicano — dynamic re-pairing', 'swiss — AI balanced pairs', 'knockout — direct bracket'], values: ['americano','mexicano','suizo','knockout'], courts: 'Number of courts', points: 'Points per match', gold: 'Golden point enabled', categories: 'Categories', phCat: 'E.g. Male A, Female B, Mixed', budget: 'Estimated budget (€)', regulation: 'Rules summary' },
    f2: { price: 'Entry fee (€)', max: 'Max spots (pairs)', email: 'Contact email', diffusion: 'Promotion channels', opts: ['WhatsApp','Instagram','Club desk','Email'], flyer: 'Need a flyer?', group: 'Broadcast group (WhatsApp/Telegram)', pay: 'Advance payment required' },
    f3: { closeDate: 'Registration deadline', seed: 'Top seeds (avoid early clashes)', draw: 'Live draw', schedule: 'Staggered schedule', slot: 'Minutes per match', opts: ['75 min','90 min'], shopping: 'Shopping (balls, trophies, water…)' },
    f4: { checkin: 'Check-in 30 min before', board: 'Live board / app', referee: 'Self-referee / referee', experience: 'Music, photos, hydration' },
    f5: { prizes: 'Trophies and prizes', logistics: 'Supplier payment & cleanup', photos: 'Photos and thanks', survey: 'Post-tournament survey' },
  },
  fr: {
    title: 'Créez votre tournoi étape par étape',
    subtitle: 'Suivez les 5 phases et lancez votre tournoi en quelques minutes.',
    step: 'Étape', next: 'Suivant →', prev: '← Précédent', create: 'Créer le tournoi →', success: 'Tournoi créé ! Redirection…',
    phases: [
      { title: 'Phase 1 · Planification', desc: 'Format, catégories, lieu et règlement.' },
      { title: 'Phase 2 · Inscriptions & diffusion', desc: 'Paiements, promotion et communication.' },
      { title: 'Phase 3 · Tableaux & logistique', desc: 'Tirage, horaires et achats.' },
      { title: 'Phase 4 · Jour du tournoi', desc: 'Check-in, tableau et expérience.' },
      { title: 'Phase 5 · Clôture & post-tournoi', desc: 'Prix, photos et enquête.' },
    ],
    f1: { name: 'Nom du tournoi', phName: 'I Open Padel Vigo 2026', club: 'Club / Lieu', phClub: 'Club Padel Bouzas', city: 'Ville', phCity: 'Vigo', date: 'Date de début', modality: 'Format', modalities: ['americano — rotation fixe', 'mexicano — re-appariement dynamique', 'suisse — paires équilibrées IA', 'éliminatoire — tableau direct'], values: ['americano','mexicano','suizo','knockout'], courts: 'Nombre de pistes', points: 'Points par match', gold: 'Point en or activé', categories: 'Catégories', phCat: 'Ex : Masculin A, Féminin B, Mixte', budget: 'Budget estimé (€)', regulation: 'Résumé du règlement' },
    f2: { price: 'Frais d\'inscription (€)', max: 'Places max (paires)', email: 'Email contact', diffusion: 'Canaux de diffusion', opts: ['WhatsApp','Instagram','Accueil club','Email'], flyer: 'Besoin d\'un flyer ?', group: 'Groupe de diffusion (WhatsApp/Telegram)', pay: 'Paiement préalable obligatoire' },
    f3: { closeDate: 'Clôture inscriptions', seed: 'Têtes de série', draw: 'Tirage en direct', schedule: 'Horaire échelonné', slot: 'Minutes par match', opts: ['75 min','90 min'], shopping: 'Achats (balles, trophées, eau…)' },
    f4: { checkin: 'Check-in 30 min avant', board: 'Tableau / app temps réel', referee: 'Auto-arbitrage / arbitre', experience: 'Musique, photos, hydratation' },
    f5: { prizes: 'Trophées et prix', logistics: 'Paiement fournisseurs et nettoyage', photos: 'Photos et remerciements', survey: 'Enquête post-tournoi' },
  },
  pt: {
    title: 'Crie seu torneio passo a passo',
    subtitle: 'Siga as 5 fases e lance seu torneio em minutos.',
    step: 'Passo', next: 'Próximo →', prev: '← Anterior', create: 'Criar torneio →', success: 'Torneio criado! Redirecionando…',
    phases: [
      { title: 'Fase 1 · Planejamento', desc: 'Formato, categorias, sede e regulamento.' },
      { title: 'Fase 2 · Inscrições e divulgação', desc: 'Pagamentos, divulgação e comunicação.' },
      { title: 'Fase 3 · Chaves e logística', desc: 'Sorteio, horários e compras.' },
      { title: 'Fase 4 · Dia do torneio', desc: 'Check-in, quadro e experiência.' },
      { title: 'Fase 5 · Encerramento e pós-torneio', desc: 'Prêmios, fotos e pesquisa.' },
    ],
    f1: { name: 'Nome do torneio', phName: 'I Open Padel Vigo 2026', club: 'Clube / Sede', phClub: 'Clube Padel Bouzas', city: 'Cidade', phCity: 'Vigo', date: 'Data início', modality: 'Formato', modalities: ['americano — rotação fixa', 'mexicano — re-emparelhamento dinâmico', 'suíço — pares equilibrados IA', 'eliminatório — chave direta'], values: ['americano','mexicano','suizo','knockout'], courts: 'Nº de quadras', points: 'Pontos por partida', gold: 'Ponto de ouro ativado', categories: 'Categorias', phCat: 'Ex: Masculino A, Feminino B, Misto', budget: 'Orçamento estimado (€)', regulation: 'Resumo do regulamento' },
    f2: { price: 'Taxa inscrição (€)', max: 'Vagas máximas (duplas)', email: 'Email contato', diffusion: 'Canais de divulgação', opts: ['WhatsApp','Instagram','Recepção clube','Email'], flyer: 'Precisa de flyer?', group: 'Grupo divulgação (WhatsApp/Telegram)', pay: 'Pagamento antecipado obrigatório' },
    f3: { closeDate: 'Encerramento inscrições', seed: 'Cabeças de chave', draw: 'Sorteio ao vivo', schedule: 'Horário escalonado', slot: 'Minutos por partida', opts: ['75 min','90 min'], shopping: 'Compras (bolas, troféus, água…)' },
    f4: { checkin: 'Check-in 30 min antes', board: 'Quadro / app tempo real', referee: 'Autoarbitragem / árbitro', experience: 'Música, fotos, hidratação' },
    f5: { prizes: 'Troféus e prêmios', logistics: 'Pagamento fornecedores e limpeza', photos: 'Fotos e agradecimentos', survey: 'Pesquisa pós-torneio' },
  },
};

export default function CrearTorneoWizard({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '', club: '', city: '', date: '', modality: 'americano', courts: 4, points: 24, gold: true, categories: '', budget: '', regulation: '',
    price: '', max: '', email: '', diffusion: [], flyer: false, group: '', pay: true,
    closeDate: '', seed: '', draw: true, schedule: true, slot: '75 min', shopping: '',
    checkin: true, board: true, referee: true, experience: '',
    prizes: '', logistics: '', photos: true, survey: true,
  });

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleDiff = (opt) => setForm(f => ({ ...f, diffusion: f.diffusion.includes(opt) ? f.diffusion.filter(x=>x!==opt) : [...f.diffusion, opt] }));

  const canNext = () => {
    if (step === 0) return form.name.trim().length >= 3 && form.club.trim().length >= 2;
    return true;
  };

  const handleCreate = () => {
    const base = emptyTournamentData(`torneo-${Date.now()}`);
    const courts = Array.from({ length: Number(form.courts) || 4 }, (_, i) => ({ id: i+1, name: `Pista ${i+1}${i===0?' — Central':''}`, status: 'free', matchId: null, startTime: null }));
    const data = {
      ...base,
      tournament: {
        ...base.tournament,
        id: `torneo-${Date.now()}`,
        name: form.name.trim(),
        club: form.club.trim(),
        city: form.city.trim(),
        date: form.date,
        modality: form.modality,
        totalCourts: Number(form.courts) || 4,
        pointsPerMatch: Number(form.points) || 24,
        goldPoint: !!form.gold,
        categories: form.categories,
        budget: form.budget,
        regulation: form.regulation,
        price: form.price,
        maxPairs: form.max,
        email: form.email,
        diffusion: form.diffusion,
        status: 'active',
        lang,
        createdAt: new Date().toISOString(),
        checklist: form,
      },
      courts,
      pairs: [],
      players: [],
      matches: [],
    };
    buildTournament(data);
    try {
      if (form.seed) localStorage.setItem('padelorganizers-wildcards','1');
      if (form.budget) localStorage.setItem('padelorganizers-cap','1');
    } catch {}
    if (form.email) {
      fetch('/api/welcome-email', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: form.email, name: form.name, tournament: form.name, club: form.club, lang }) }).catch(()=>{});
    }
    setDone(true);
    try { localStorage.setItem('padelorganizers-last-tournament-id', data.tournament.id); } catch {}
    setTimeout(() => nav(`/tournament/${encodeURIComponent(data.tournament.id)}`), 900);
  };

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--padel-border)', background: 'var(--padel-input-bg)', color: 'var(--padel-text)', fontSize: 14, boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--padel-muted)', margin: '0 0 6px' };
  const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 22 };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 60px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--padel-text)', margin: '0 0 6px' }}>{T.title}</h1>
      <p style={{ color: 'var(--padel-muted)', margin: '0 0 18px', fontSize: 14 }}>{T.subtitle}</p>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {T.phases.map((p, i) => (
          <button key={i} onClick={() => setStep(i)} style={{ flex: '1 1 140px', padding: '10px 12px', borderRadius: 12, border: i===step ? '2px solid var(--padel-emerald)' : '1px solid var(--padel-border)', background: i===step ? 'rgba(16,185,129,0.12)' : 'var(--padel-card-bg)', color: i===step ? 'var(--padel-emerald)' : 'var(--padel-muted)', fontWeight: 800, fontSize: 12, textAlign: 'left', cursor: 'pointer' }}>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{T.step} {i+1}</div>
            <div style={{ fontSize: 13, lineHeight: 1.2 }}>{p.title.replace(/^Fase \d+ · |^Phase \d+ · |^Phase \d+ · /,'')}</div>
          </button>
        ))}
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 4px' }}>{T.phases[step].title}</h2>
        <p style={{ color: 'var(--padel-muted)', fontSize: 13, margin: '0 0 16px' }}>{T.phases[step].desc}</p>

        {step === 0 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div><label style={labelStyle}>{T.f1.name} *</label><input style={inputStyle} value={form.name} onChange={e=>upd('name', e.target.value)} placeholder={T.f1.phName} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>{T.f1.club} *</label><input style={inputStyle} value={form.club} onChange={e=>upd('club', e.target.value)} placeholder={T.f1.phClub} /></div>
              <div><label style={labelStyle}>{T.f1.city}</label><input style={inputStyle} value={form.city} onChange={e=>upd('city', e.target.value)} placeholder={T.f1.phCity} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>{T.f1.date}</label><input type="date" style={inputStyle} value={form.date} onChange={e=>upd('date', e.target.value)} /></div>
              <div><label style={labelStyle}>{T.f1.courts}</label><input type="number" min={1} max={20} style={inputStyle} value={form.courts} onChange={e=>upd('courts', e.target.value)} /></div>
            </div>
            <div><label style={labelStyle}>{T.f1.modality}</label>
              <select style={inputStyle} value={form.modality} onChange={e=>upd('modality', e.target.value)}>
                {T.f1.modalities.map((m,i)=><option key={i} value={T.f1.values[i]}>{m}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>{T.f1.points}</label><input type="number" style={inputStyle} value={form.points} onChange={e=>upd('points', e.target.value)} /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22, fontWeight: 700, color: 'var(--padel-text)', fontSize: 13 }}><input type="checkbox" checked={form.gold} onChange={e=>upd('gold', e.target.checked)} /> {T.f1.gold}</label>
            </div>
            <div><label style={labelStyle}>{T.f1.categories}</label><input style={inputStyle} value={form.categories} onChange={e=>upd('categories', e.target.value)} placeholder={T.f1.phCat} /></div>
            <div><label style={labelStyle}>{T.f1.budget}</label><input type="number" style={inputStyle} value={form.budget} onChange={e=>upd('budget', e.target.value)} placeholder="1200" /></div>
            <div><label style={labelStyle}>{T.f1.regulation}</label><textarea style={{...inputStyle, minHeight: 70}} value={form.regulation} onChange={e=>upd('regulation', e.target.value)} placeholder="Punto de oro, muerte súbita..." /></div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>{T.f2.price}</label><input type="number" style={inputStyle} value={form.price} onChange={e=>upd('price', e.target.value)} placeholder="25" /></div>
              <div><label style={labelStyle}>{T.f2.max}</label><input type="number" style={inputStyle} value={form.max} onChange={e=>upd('max', e.target.value)} placeholder="32" /></div>
            </div>
            <div><label style={labelStyle}>{T.f2.email}</label><input type="email" style={inputStyle} value={form.email} onChange={e=>upd('email', e.target.value)} placeholder="organizador@club.es" /></div>
            <div><label style={labelStyle}>{T.f2.diffusion}</label><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{T.f2.opts.map(o=><label key={o} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, border: '1px solid var(--padel-border)', background: form.diffusion.includes(o)?'rgba(16,185,129,0.12)':'transparent', fontSize: 13, cursor: 'pointer' }}><input type="checkbox" checked={form.diffusion.includes(o)} onChange={()=>toggleDiff(o)} />{o}</label>)}</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}><input type="checkbox" checked={form.flyer} onChange={e=>upd('flyer', e.target.checked)} /> {T.f2.flyer}</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}><input type="checkbox" checked={form.pay} onChange={e=>upd('pay', e.target.checked)} /> {T.f2.pay}</label>
            </div>
            <div><label style={labelStyle}>{T.f2.group}</label><input style={inputStyle} value={form.group} onChange={e=>upd('group', e.target.value)} placeholder="https://chat.whatsapp.com/..." /></div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div><label style={labelStyle}>{T.f3.closeDate}</label><input type="datetime-local" style={inputStyle} value={form.closeDate} onChange={e=>upd('closeDate', e.target.value)} /></div>
            <div><label style={labelStyle}>{T.f3.seed}</label><input style={inputStyle} value={form.seed} onChange={e=>upd('seed', e.target.value)} placeholder="1. Galán/Lebrón, 2. Tapia/Coello…" /></div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}><input type="checkbox" checked={form.draw} onChange={e=>upd('draw', e.target.checked)} /> {T.f3.draw}</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}><input type="checkbox" checked={form.schedule} onChange={e=>upd('schedule', e.target.checked)} /> {T.f3.schedule}</label>
            </div>
            <div><label style={labelStyle}>{T.f3.slot}</label><select style={inputStyle} value={form.slot} onChange={e=>upd('slot', e.target.value)}>{T.f3.opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
            <div><label style={labelStyle}>{T.f3.shopping}</label><textarea style={{...inputStyle, minHeight: 60}} value={form.shopping} onChange={e=>upd('shopping', e.target.value)} placeholder="Pelotas, trofeos, agua, fruta, botiquín" /></div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}><input type="checkbox" checked={form.checkin} onChange={e=>upd('checkin', e.target.checked)} /> {T.f4.checkin}</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}><input type="checkbox" checked={form.board} onChange={e=>upd('board', e.target.checked)} /> {T.f4.board}</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}><input type="checkbox" checked={form.referee} onChange={e=>upd('referee', e.target.checked)} /> {T.f4.referee}</label>
            <div><label style={labelStyle}>{T.f4.experience}</label><input style={inputStyle} value={form.experience} onChange={e=>upd('experience', e.target.value)} placeholder="Música, fotos, hidratación…" /></div>
            <p style={{ fontSize: 13, color: 'var(--padel-muted)' }}>Usarás <b>Central de Control</b> (/control), <b>CourtManager</b> (/dashboard) y <b>Live</b> (/live) el día del torneo.</p>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div><label style={labelStyle}>{T.f5.prizes}</label><input style={inputStyle} value={form.prizes} onChange={e=>upd('prizes', e.target.value)} placeholder="Trofeos, palas, vales…" /></div>
            <div><label style={labelStyle}>{T.f5.logistics}</label><input style={inputStyle} value={form.logistics} onChange={e=>upd('logistics', e.target.value)} placeholder="Limpieza, pagos…" /></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}><input type="checkbox" checked={form.photos} onChange={e=>upd('photos', e.target.checked)} /> {T.f5.photos}</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}><input type="checkbox" checked={form.survey} onChange={e=>upd('survey', e.target.checked)} /> {T.f5.survey}</label>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--padel-text)' }}>{form.name || '—'} · {form.club || '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--padel-muted)' }}>{form.city} · {form.modality} · {form.courts} pistas · {form.slot}</div>
            </div>
          </div>
        )}

        {done ? (
          <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: '#065f46', color: '#fff', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>{T.success}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12, wordBreak: 'break-all' }}>ID: {(() => { try { return localStorage.getItem('padelorganizers-last-tournament-id'); } catch { return ''; } })()} · <a href={`/tournament/${encodeURIComponent((() => { try { return localStorage.getItem('padelorganizers-last-tournament-id')||''; } catch { return ''; } })())}`} style={{ color: '#a7f3d0', fontWeight: 700 }}>Abrir página del torneo →</a></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => nav('/control')} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>🎛️ Central de Control</button>
              <button onClick={() => nav('/importar')} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#fff', color: '#065f46', fontWeight: 800, cursor: 'pointer' }}>📥 Importar parejas</button>
              <button onClick={() => { const id = (() => { try { return localStorage.getItem('padelorganizers-last-tournament-id'); } catch { return ''; } })(); if (id) navigator.clipboard?.writeText(`${window.location.origin}/tournament/${encodeURIComponent(id)}`); }} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>🔗 Copiar enlace</button>
            </div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 10 }}>Gestionar, actualizar, compartir y exportar desde la página del torneo.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'space-between' }}>
            <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--padel-border)', background: 'transparent', color: 'var(--padel-text)', fontWeight: 700, opacity: step===0?0.4:1, cursor: step===0?'default':'pointer' }}>{T.prev}</button>
            {step < 4 ? (
              <button onClick={()=>setStep(s=>Math.min(4,s+1))} disabled={!canNext()} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: canNext() ? 'linear-gradient(135deg,#10b981,#059669)' : '#334155', color: '#fff', fontWeight: 800, cursor: canNext()?'pointer':'default' }}>{T.next}</button>
            ) : (
              <button onClick={handleCreate} disabled={!canNext()} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: canNext() ? 'linear-gradient(135deg,#10b981,#059669)' : '#334155', color: '#fff', fontWeight: 800, cursor: canNext()?'pointer':'default' }}>{T.create}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
