import React, { useEffect, useState } from 'react';
import TournamentChat from './TournamentChat';
import { readAds, addAd, closeAd } from '../services/matchmakingService';

const I18N = {
  es: {
    title: '💬 Comunidad',
    subtitle: 'Tablón de anuncios "busco cuarto", chat del torneo y grupos de la comunidad.',
    tabAds: '📢 Tablón', tabChat: '💬 Chat', tabGroups: '👥 Grupos',
    myAd: 'Publicar un anuncio', adName: 'Tu nombre', adElo: 'Tu ELO', adWhen: 'Cuándo', adSlot: 'Franja', adMode: 'Modo',
    publish: 'Publicar', ads: 'Anuncios activos', noAds: 'No hay anuncios activos. ¡Publica el primero!',
    close: 'Cerrar anuncio', open: 'Abierto',
    groupsTitle: 'Grupos de la comunidad', groupName: 'Nombre del grupo', groupLevel: 'Nivel', groupDay: 'Día',
    createGroup: 'Crear grupo', myGroups: 'Mis grupos', noGroups: 'Crea tu primer grupo de juego.',
    avatar: 'Sala', when: 'cuándo', slot: 'franja', mode: 'modo', elo: 'ELO', day: 'día', level: 'nivel',
  },
  en: {
    title: '💬 Community',
    subtitle: '"Fourth player" notice board, tournament chat and community groups.',
    tabAds: '📢 Board', tabChat: '💬 Chat', tabGroups: '👥 Groups',
    myAd: 'Post an ad', adName: 'Your name', adElo: 'Your ELO', adWhen: 'When', adSlot: 'Slot', adMode: 'Mode',
    publish: 'Post', ads: 'Active ads', noAds: 'No active ads. Post the first one!',
    close: 'Close ad', open: 'Open',
    groupsTitle: 'Community groups', groupName: 'Group name', groupLevel: 'Level', groupDay: 'Day',
    createGroup: 'Create group', myGroups: 'My groups', noGroups: 'Create your first game group.',
    avatar: 'Room', when: 'when', slot: 'slot', mode: 'mode', elo: 'ELO', day: 'day', level: 'level',
  },
  fr: {
    title: '💬 Communauté',
    subtitle: 'Tableau «je cherche un 4e», chat du tournoi et groupes de la communauté.',
    tabAds: '📢 Tableau', tabChat: '💬 Chat', tabGroups: '👥 Groupes',
    myAd: 'Publier une annonce', adName: 'Votre nom', adElo: 'Votre ELO', adWhen: 'Quand', adSlot: 'Créneau', adMode: 'Mode',
    publish: 'Publier', ads: 'Annonces actives', noAds: 'Aucune annonce active. Publiez la première !',
    close: 'Fermer l\'annonce', open: 'Ouvert',
    groupsTitle: 'Groupes de la communauté', groupName: 'Nom du groupe', groupLevel: 'Niveau', groupDay: 'Jour',
    createGroup: 'Créer un groupe', myGroups: 'Mes groupes', noGroups: 'Créez votre premier groupe de jeu.',
    avatar: 'Salle', when: 'quand', slot: 'créneau', mode: 'mode', elo: 'ELO', day: 'jour', level: 'niveau',
  },
  pt: {
    title: '💬 Comunidade',
    subtitle: 'Quadro de anúncios "procuro o 4º", chat do torneio e grupos da comunidade.',
    tabAds: '📢 Quadro', tabChat: '💬 Chat', tabGroups: '👥 Grupos',
    myAd: 'Publicar um anúncio', adName: 'O seu nome', adElo: 'O seu ELO', adWhen: 'Quando', adSlot: 'Horário', adMode: 'Modo',
    publish: 'Publicar', ads: 'Anúncios ativos', noAds: 'Sem anúncios ativos. Publique o primeiro!',
    close: 'Fechar anúncio', open: 'Aberto',
    groupsTitle: 'Grupos da comunidade', groupName: 'Nome do grupo', groupLevel: 'Nível', groupDay: 'Dia',
    createGroup: 'Criar grupo', myGroups: 'Os meus grupos', noGroups: 'Crie o seu primeiro grupo de jogo.',
    avatar: 'Sala', when: 'quando', slot: 'horário', mode: 'modo', elo: 'ELO', day: 'dia', level: 'nível',
  },
};

const section = { maxWidth: 1080, margin: '0 auto', padding: '0 24px' };
const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const input = { background: 'var(--padel-bg)', color: 'var(--padel-text)', border: '1px solid var(--padel-border)', padding: '10px 12px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, width: '100%', boxSizing: 'border-box' };
const btn = { background: 'linear-gradient(135deg,var(--padel-emerald),var(--padel-emerald-dark))', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer', marginTop: 10 };

const LS_GROUPS = 'padelorganizers-community-groups';

export default function CommunityApp({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [tab, setTab] = useState('ads');
  const [ads, setAds] = useState([]);
  const [adForm, setAdForm] = useState({ name: '', elo: 1500, when: '', slot: '', mode: 'amistoso' });
  const [groups, setGroups] = useState([]);
  const [groupForm, setGroupForm] = useState({ name: '', level: '', day: '' });

  useEffect(() => {
    setAds(readAds());
    try { setGroups(JSON.parse(localStorage.getItem(LS_GROUPS)) || []); } catch { setGroups([]); }
  }, []);

  const publishAd = () => {
    if (!adForm.name) return;
    addAd({ name: adForm.name, elo: Number(adForm.elo) || 1500, when: adForm.when, slot: adForm.slot, mode: adForm.mode });
    setAdForm({ name: '', elo: 1500, when: '', slot: '', mode: 'amistoso' });
    setAds(readAds());
  };

  const doClose = (id) => { closeAd(id); setAds(readAds()); };

  const createGroup = () => {
    const rec = { id: `grp-${Date.now()}`, ...groupForm, createdAt: new Date().toISOString() };
    if (!rec.name) return;
    const next = [rec, ...groups];
    setGroups(next);
    localStorage.setItem(LS_GROUPS, JSON.stringify(next));
    setGroupForm({ name: '', level: '', day: '' });
  };

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={section}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--padel-text)', margin: 0 }}>{T.title}</h1>
        <p style={{ fontSize: 13, color: 'var(--padel-muted)', margin: '6px 0 18px' }}>{T.subtitle}</p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {[['ads', T.tabAds], ['chat', T.tabChat], ['groups', T.tabGroups]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '9px 16px', borderRadius: 10, border: '1px solid var(--padel-border)', background: tab === k ? 'var(--padel-emerald)' : 'var(--padel-card-bg)', color: tab === k ? '#fff' : 'var(--padel-muted)', fontWeight: 800, fontSize: 13, cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>

        {tab === 'ads' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>📢 {T.myAd}</h2>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.adName}</label>
              <input style={input} value={adForm.name} onChange={(e) => setAdForm({ ...adForm, name: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.adElo}</label>
                  <input style={input} type="number" value={adForm.elo} onChange={(e) => setAdForm({ ...adForm, elo: Number(e.target.value) })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.adSlot}</label>
                  <input style={input} placeholder="19:00" value={adForm.slot} onChange={(e) => setAdForm({ ...adForm, slot: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.adWhen}</label>
                  <input style={input} placeholder="Hoy / Viernes" value={adForm.when} onChange={(e) => setAdForm({ ...adForm, when: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.adMode}</label>
                  <input style={input} value={adForm.mode} onChange={(e) => setAdForm({ ...adForm, mode: e.target.value })} />
                </div>
              </div>
              <button onClick={publishAd} style={btn}>{T.publish}</button>
            </div>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>📢 {T.ads}</h2>
              {ads.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ads.map((a) => (
                    <div key={a.id} style={{ background: 'var(--padel-bg)', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--padel-text)' }}>{a.name} <span style={{ color: '#38bdf8' }}>· {a.elo}</span></div>
                          <div style={{ fontSize: 11.5, color: 'var(--padel-muted)' }}>{a.when || T.when} {a.slot ? `· ${T.slot} ${a.slot}` : ''} · {T.mode}: {a.mode}</div>
                        </div>
                        <button onClick={() => doClose(a.id)} style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185', border: 'none', padding: '6px 10px', borderRadius: 8, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>{T.close}</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--padel-muted)', fontSize: 13, margin: 0 }}>{T.noAds}</p>}
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div style={{ ...card, padding: 16 }}>
            <TournamentChat lang={lang} />
          </div>
        )}

        {tab === 'groups' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>👥 {T.createGroup}</h2>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.groupName}</label>
              <input style={input} value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.groupLevel}</label>
                  <input style={input} value={groupForm.level} onChange={(e) => setGroupForm({ ...groupForm, level: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--padel-muted)', display: 'block', marginBottom: 4 }}>{T.groupDay}</label>
                  <input style={input} value={groupForm.day} onChange={(e) => setGroupForm({ ...groupForm, day: e.target.value })} />
                </div>
              </div>
              <button onClick={createGroup} style={btn}>{T.createGroup}</button>
            </div>
            <div style={{ ...card }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: '0 0 10px' }}>👥 {T.myGroups}</h2>
              {groups.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {groups.map((g) => (
                    <div key={g.id} style={{ background: 'var(--padel-bg)', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--padel-text)' }}>{g.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--padel-muted)' }}>{g.level ? `${T.level}: ${g.level}` : ''} {g.day ? `· ${T.day}: ${g.day}` : ''}</div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'var(--padel-muted)', fontSize: 13, margin: 0 }}>{T.noGroups}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}