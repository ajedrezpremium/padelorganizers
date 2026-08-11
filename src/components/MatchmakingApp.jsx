import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  buildPlayerPool, findMatches, addAd, closeAd, readAds, SEED_PLAYERS, levelFromElo,
} from '../services/matchmakingService';

const I18N = {
  es: {
    title: '🤝 Busco cuarto · Matchmaking',
    subtitle: 'Encuentra pareja, rival o el cuarto jugador que te falta. Matchmaking por ELO y disponibilidad.',
    tabs: { four: 'Busco cuarto', pool: 'Bolsa de jugadores', how: 'Cómo funciona' },
    myPost: 'Publicar un anuncio', titleAd: 'Anuncios activos', noAds: 'No hay anuncios activos. ¡Publica el primero!',
    namePh: 'Tu nombre', whenPh: 'Cuándo peleo (ej. Viernes 20:00)', slotPh: 'Franja horaria',
    slots: ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    publish: 'Publicar', published: '✓ Anuncio publicado', sameName: 'Publica primero tu anuncio (arriba) con tu nombre.',
    close: 'Cerrar', open: 'Abierto', matchBtn: 'Ver candidatos', matches: 'Emparejados',
    myName: 'Me llamo', myElo: 'Mi ELO', mySlot: 'Mi franja', search: 'Buscar matches',
    matched: 'mejores candidatos', noMatch: 'Sin candidatos todavía — publica un anuncio o busca matches.',
    poolTitle: 'Jugadores disponibles (de tu Ranked League + club)',
    howTitle: 'El "Tinder" del pádel',
    howBody: 'Posteas un anuncio con tu nivel, hora y modo de juego. El motor calcula compatibilidad por proximidad de ELO y franja horaria compartida, y te sugiere los mejores candidatos. Cuando encuentres cuarto, reserváis pista en la App Club y se va solo.',
    steps: ['1 · Publica tu anuncio', '2 · Recibe candidatos por ELO', '3 · Reserváis pista juntos', '4 · El resultado sube tu ELO en la Ranked League'],
    guestName: 'Invitado',
    eloUnit: 'ELO', slotUnit: 'Hora', modeUnit: 'Modo',
    modes: ['Americano', 'Partido amistoso', 'Torneo'],
    goClub: 'Reservar pista →',
    rsvp: 'Me interesa', rsvpDone: '✓ Aviso enviado',
  },
  en: {
    title: '🤝 Fourth player · Matchmaking',
    subtitle: 'Find a partner, opponent or the fourth player you are missing. ELO + availability matchmaking.',
    tabs: { four: 'Looking for a 4th', pool: 'Player pool', how: 'How it works' },
    myPost: 'Post an ad', titleAd: 'Active ads', noAds: 'No active ads. Post the first one!',
    namePh: 'Your name', whenPh: 'When are you playing (e.g. Friday 20:00)', slotPh: 'Time slot',
    slots: ['4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm'],
    publish: 'Post', published: '✓ Ad posted', sameName: 'Post your ad first (above) with your name.',
    close: 'Close', open: 'Open', matchBtn: 'See candidates', matches: 'Matched',
    myName: 'My name', myElo: 'My ELO', mySlot: 'My slot', search: 'Find matches',
    matched: 'best candidates', noMatch: 'No candidates yet — post an ad or run a search.',
    poolTitle: 'Available players (from your Ranked League + club)',
    howTitle: 'The "Tinder" of padel',
    howBody: 'Post an ad with your level, time and mode. The engine scores compatibility by ELO proximity and shared time slots, suggesting the best candidates. Once you find a 4th, book a court in the Club App and it just works.',
    steps: ['1 · Post your ad', '2 · Get ELO-matched candidates', '3 · Book a court together', '4 · The result raises your ELO in the Ranked League'],
    guestName: 'Guest',
    eloUnit: 'ELO', slotUnit: 'Time', modeUnit: 'Mode',
    modes: ['American', 'Friendly match', 'Tournament'],
    goClub: 'Book a court →',
    rsvp: 'I\'m in', rsvpDone: '✓ Message sent',
  },
  fr: {
    title: '🤝 Je cherche un 4e · Matchmaking',
    subtitle: 'Trouvez un partenaire, un adversaire ou le quatrième joueur manquant. Appariement par ELO et disponibilité.',
    tabs: { four: 'Je cherche un 4e', pool: 'Bassin de joueurs', how: 'Comment ça marche' },
    myPost: 'Publier une annonce', titleAd: 'Annonces actives', noAds: 'Aucune annonce active. Publiez la première !',
    namePh: 'Votre nom', whenPh: 'Quand jouez-vous (ex. Vendredi 20:00)', slotPh: 'Créneau',
    slots: ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    publish: 'Publier', published: '✓ Annonce publiée', sameName: 'Publiez d\'abord votre annonce (ci-dessus) avec votre nom.',
    close: 'Fermer', open: 'Ouvert', matchBtn: 'Voir les candidats', matches: 'Appariés',
    myName: 'Mon nom', myElo: 'Mon ELO', mySlot: 'Mon créneau', search: 'Trouver des matches',
    matched: 'meilleurs candidats', noMatch: 'Aucun candidat pour l\'instant.',
    poolTitle: 'Joueurs disponibles (de votre Ligue classée + club)',
    howTitle: 'Le "Tinder" du padel',
    howBody: 'Vous publiez une annonce avec votre niveau, votre heure et votre mode. Le moteur calcule la compatibilité par proximité d\'ELO et créneau partagé, et suggère les meilleurs candidats.',
    steps: ['1 · Publiez votre annonce', '2 · Recevez des candidats par ELO', '3 · Réservez une piste ensemble', '4 · Le résultat monte votre ELO'],
    guestName: 'Invité',
    eloUnit: 'ELO', slotUnit: 'Horaire', modeUnit: 'Mode',
    modes: ['Américain', 'Match amical', 'Tournoi'],
    goClub: 'Réserver une piste →',
    rsvp: 'Ça m\'intéresse', rsvpDone: '✓ Message envoyé',
  },
  pt: {
    title: '🤝 Procuro o 4º jogador · Matchmaking',
    subtitle: 'Encontre parceiro, adversário ou o quarto jogador que falta. Match por ELO e disponibilidade.',
    tabs: { four: 'Procuro o 4º', pool: 'Bolsão de jogadores', how: 'Como funciona' },
    myPost: 'Publicar anúncio', titleAd: 'Anúncios ativos', noAds: 'Sem anúncios ativos. Publique o primeiro!',
    namePh: 'O seu nome', whenPh: 'Quando joga (ex. Sexta 20:00)', slotPh: 'Faixa horária',
    slots: ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    publish: 'Publicar', published: '✓ Anúncio publicado', sameName: 'Publique primeiro o seu anúncio (acima) com o seu nome.',
    close: 'Fechar', open: 'Aberto', matchBtn: 'Ver candidatos', matches: 'Emparelhados',
    myName: 'O meu nome', myElo: 'O meu ELO', mySlot: 'A minha hora', search: 'Procurar matches',
    matched: 'melhores candidatos', noMatch: 'Sem candidatos ainda.',
    poolTitle: 'Jogadores disponíveis (da sua Liga ranqueada + clube)',
    howTitle: 'O "Tinder" do padel',
    howBody: 'Publica um anúncio com o seu nível, hora e modo. O motor calcula compatibilidade por proximidade de ELO e faixa partilhada, e sugere os melhores candidatos.',
    steps: ['1 · Publique o seu anúncio', '2 · Receba candidatos por ELO', '3 · Reservem pista juntos', '4 · O resultado sobe o seu ELO'],
    guestName: 'Convidado',
    eloUnit: 'ELO', slotUnit: 'Hora', modeUnit: 'Modo',
    modes: ['Americano', 'Jogo amigável', 'Torneio'],
    goClub: 'Reservar pista →',
    rsvp: 'Tenho interesse', rsvpDone: '✓ Aviso enviado',
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const input = { background: 'var(--padel-bg)', color: 'var(--padel-text)', border: '1px solid var(--padel-border)', padding: '10px 12px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, width: '100%', boxSizing: 'border-box' };
const select = { ...input, cursor: 'pointer' };
const btnPrimary = { background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer' };
const ghostBtn = { background: 'transparent', color: 'var(--padel-muted)', border: '1px solid var(--padel-border)', padding: '8px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' };

export default function MatchmakingApp({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const { user } = useAuth();
  const [tab, setTab] = useState('four');
  const [ads, setAds] = useState([]);
  const [pool, setPool] = useState([]);
  const [form, setForm] = useState({ name: user?.email?.split('@')[0] || '', when: 'Viernes 20:00', slot: T.slots[2], mode: 0 });
  const [published, setPublished] = useState(false);
  const [my, setMy] = useState({ name: user?.email?.split('@')[0] || '', elo: 1500, slot: T.slots[2] });
  const [cands, setCands] = useState(null);
  const [rsvp, setRsvp] = useState({});

  const refreshAds = () => setAds(readAds());
  useEffect(() => { refreshAds(); }, []);

  const refreshPool = async () => setPool(await buildPlayerPool());
  useEffect(() => { refreshPool(); }, []);

  const displayName = user?.email?.split('@')[0] || T.guestName;

  const publish = () => {
    if (!form.name.trim()) { alert(T.sameName); return; }
    addAd({ name: form.name.trim(), elo: Number(my.elo) || 0, when: form.when, slot: form.slot, mode: T.modes[form.mode] });
    setPublished(true);
    refreshAds();
    setTimeout(() => setPublished(false), 2500);
  };

  const closeAdFn = (id) => { closeAd(id); refreshAds(); };

  const runSearch = () => {
    const searchPool = pool.length ? pool : SEED_PLAYERS.map((p) => ({ ...p, source: 'seed' }));
    const res = findMatches(searchPool, {
      name: my.name, elo: Number(my.elo) || 1500, availability: [my.slot],
      omit: [],
    });
    setCands(res);
  };

  const filteredPool = useMemo(() => {
    const slot = my.slot || '';
    const list = pool.filter((p) => !slot || p.availability.length === 0 || p.availability.includes(slot));
    return [...list].sort((a, b) => b.elo - a.elo);
  }, [pool, my.slot]);

  const tabs = [
    { id: 'four', label: T.tabs.four, icon: '📌' },
    { id: 'pool', label: T.tabs.pool, icon: '👥' },
    { id: 'how', label: T.tabs.how, icon: '💡' },
  ];

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--padel-text)', margin: 0 }}>{T.title}</h1>
        <p style={{ fontSize: 13, color: 'var(--padel-muted)', margin: '6px 0 18px' }}>{T.subtitle}</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={tab === t.id
                ? { ...btnPrimary, fontSize: 13.5, padding: '10px 18px' }
                : { ...ghostBtn, fontSize: 13.5, padding: '10px 18px', color: 'var(--padel-text)' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'how' && (
          <div style={{ ...card, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--padel-text)', margin: '0 0 8px' }}>{T.howTitle}</h2>
            <p style={{ fontSize: 13.5, color: 'var(--padel-muted)', lineHeight: 1.6, margin: '0 0 18px', maxWidth: 720 }}>{T.howBody}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['1 · 📌 ' + T.steps[0], '2 · ⚡ ' + T.steps[1], '3 · 🏟️ ' + T.steps[2], '4 · 🏅 ' + T.steps[3]].map((s, i) => (
                <div key={i} style={{ fontSize: 13, fontWeight: 700, color: 'var(--padel-text)', padding: '10px 14px', background: 'var(--padel-bg)', borderRadius: 10 }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {tab === 'four' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            {/* Formulario */}
            <div style={{ ...card, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 12px' }}>📌 {T.myPost}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={lbl}>{T.myName}</label>
                  <input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={T.namePh} />
                </div>
                <div>
                  <label style={lbl}>{T.myElo}</label>
                  <input style={input} type="number" value={my.elo} onChange={(e) => setMy({ ...my, elo: Number(e.target.value) })} placeholder="1500" />
                </div>
                <div>
                  <label style={lbl}>{T.mySlot}</label>
                  <select style={select} value={my.slot} onChange={(e) => setMy({ ...my, slot: e.target.value })}>
                    {T.slots.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>{T.modeUnit}</label>
                  <select style={select} value={form.mode} onChange={(e) => setForm({ ...form, mode: Number(e.target.value) })}>
                    {T.modes.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>{T.whenPh}</label>
                  <input style={input} value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} />
                </div>
                <button onClick={publish} style={btnPrimary}>{published ? T.published : T.publish}</button>
                <button onClick={runSearch} style={btnPrimary}>{T.search}</button>
              </div>
            </div>

            {/* Anuncios */}
            <div style={{ ...card, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 12px' }}>👀 {T.titleAd}</h2>
              {ads.length === 0 ? <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noAds}</p> : ads.map((a, i) => (
                <div key={a.id} style={{ padding: '10px 0', borderBottom: i === ads.length - 1 ? 'none' : '1px solid var(--padel-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--padel-text)' }}>🏓 {a.name}</span>
                    <button onClick={() => closeAdFn(a.id)} style={ghostBtn}>{T.close}</button>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--padel-muted)', marginTop: 3 }}>
                    {a.when} · {a.slot} · {a.mode}
                    {a.elo ? ` · ${T.eloUnit} ${a.elo}` : ''}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {rsvp[a.id] ? <span style={tagDone}>{T.rsvpDone}</span> : (
                      <button onClick={() => setRsvp({ ...rsvp, [a.id]: true })} style={{ ...ghostBtn, color: 'var(--padel-lime)', borderColor: 'rgba(163,230,53,0.3)', fontSize: 11.5 }}>{T.rsvp}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Candidatos */}
            {cands && (
              <div style={{ ...card, padding: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 12px' }}>⚡ {my.name} · {T.matched}</h2>
                {cands.length === 0 ? <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noMatch}</p> : cands.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: i === cands.length - 1 ? 'none' : '1px solid var(--padel-border)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>
                      {c.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--padel-text)' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--padel-muted)' }}>{T.eloUnit} {c.elo} · {T.slotUnit} {my.slot}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: c.score >= 100 ? 'var(--padel-lime)' : '#fbbf24' }}>{c.score}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'pool' && (
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: 0 }}>👥 {T.poolTitle} · {filteredPool.length}</h2>
              <select style={{ ...select, width: 'auto' }} value={my.slot} onChange={(e) => setMy({ ...my, slot: e.target.value })}>
                {T.slots.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
              {filteredPool.map((p, i) => (
                <div key={i} style={{ padding: 12, background: 'var(--padel-bg)', borderRadius: 12 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--padel-text)' }}>🏓 {p.name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>{T.eloUnit} {p.elo}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(163,230,53,0.12)', color: '#a3e635' }}>{T.slotUnit}: {p.availability.length ? (p.availability[0] + '…') : 'flex'}</span>
                  </div>
                </div>
              ))}
              {filteredPool.length === 0 && <p style={{ color: 'var(--padel-muted)', fontSize: 12.5, margin: 0 }}>{T.noMatch}</p>}
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button onClick={refreshPool} style={ghostBtn}>⟳</button>
              <a href="#/club" style={{ ...ghostBtn, color: 'var(--padel-lime)', borderColor: 'rgba(163,230,53,0.3)', textDecoration: 'none' }}>{T.goClub}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const lbl = { fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 };
const tagDone = { fontSize: 11, fontWeight: 800, color: '#84cc16', padding: '6px 12px', borderRadius: 10, background: 'rgba(132,204,22,0.12)' };