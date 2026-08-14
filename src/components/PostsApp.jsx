import React, { useState } from 'react';
import { generateCrónica, listPosts, savePost, deletePost } from '../services/postsService';

const I18N = {
  es: {
    badge: '📰 CMS & Crónicas IA',
    sub: 'Genera la crónica automática de tu torneo y publica el contenido que mueve tu club.',
    genBtn: '✨ Generar crónica IA del torneo',
    genSub: 'La IA resume el torneo activo con datos reales: formato, jugadores, parejas, MVP y podio. Determinista y reproducible.',
    edit: 'Editar publicación',
    placeholder: 'Texto de la publicación…',
    titleLabel: 'Título',
    catLabel: 'Categoría',
    cats: ['Crónica', 'Noticia', 'Comunicado', 'SEO'],
    saveBtn: '💾 Guardar publicación',
    saved: 'Publicación guardada ✓',
    savedAt: 'guardada el',
    publishBtn: '📤 Publicar',
    published: 'Publicada',
    delBtn: '🗑️',
    empty: 'Aún no hay publicaciones. Genera tu primera crónica IA arriba.',
    prevTitle: 'Vista previa',
    copyBtn: '📋 Copiar texto',
    copied: 'Copiado ✓',
    timeAgo: (d) => {
      const sec = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
      if (sec < 60) return 'hace un momento';
      const min = Math.round(sec / 60);
      if (min < 60) return `hace ${min} min`;
      const h = Math.round(min / 60);
      if (h < 24) return `hace ${h} h`;
      return `hace ${Math.round(h / 24)} d`;
    },
  },
  en: {
    badge: '📰 CMS & AI Reports',
    sub: 'Generate your tournament report automatically and publish the content that drives your club.',
    genBtn: '✨ Generate AI tournament report',
    genSub: 'The AI summarises the active tournament with real data: format, players, pairs, MVP and podium. Deterministic and reproducible.',
    edit: 'Edit post',
    placeholder: 'Post text…',
    titleLabel: 'Title',
    catLabel: 'Category',
    cats: ['Report', 'News', 'Announcement', 'SEO'],
    saveBtn: '💾 Save post',
    saved: 'Post saved ✓',
    savedAt: 'saved',
    publishBtn: '📤 Publish',
    published: 'Published',
    delBtn: '🗑️',
    empty: 'No posts yet. Generate your first AI report above.',
    prevTitle: 'Preview',
    copyBtn: '📋 Copy text',
    copied: 'Copied ✓',
    timeAgo: (d) => {
      const sec = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
      if (sec < 60) return 'just now';
      const min = Math.round(sec / 60);
      if (min < 60) return `${min} min ago`;
      const h = Math.round(min / 60);
      if (h < 24) return `${h} h ago`;
      return `${Math.round(h / 24)} d ago`;
    },
  },
  fr: {
    badge: '📰 CMS & Rapports IA',
    sub: 'Générez le rapport automatique de votre tournoi et publiez le contenu qui fait vivre votre club.',
    genBtn: '✨ Générer le rapport IA du tournoi',
    genSub: 'L\'IA résume le tournoi actif avec des données réelles : format, joueurs, paires, MVP et podium. Déterministe et reproductible.',
    edit: 'Modifier la publication',
    placeholder: 'Texte de la publication…',
    titleLabel: 'Titre',
    catLabel: 'Catégorie',
    cats: ['Rapport', 'Actualité', 'Communiqué', 'SEO'],
    saveBtn: '💾 Enregistrer',
    saved: 'Publication enregistrée ✓',
    savedAt: 'enregistrée',
    publishBtn: '📤 Publier',
    published: 'Publiée',
    delBtn: '🗑️',
    empty: 'Aucune publication. Générez votre premier rapport IA ci-dessus.',
    prevTitle: 'Aperçu',
    copyBtn: '📋 Copier le texte',
    copied: 'Copié ✓',
    timeAgo: (d) => {
      const sec = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
      if (sec < 60) return 'à l\'instant';
      const min = Math.round(sec / 60);
      if (min < 60) return `il y a ${min} min`;
      const h = Math.round(min / 60);
      if (h < 24) return `il y a ${h} h`;
      return `il y a ${Math.round(h / 24)} j`;
    },
  },
  pt: {
    badge: '📰 CMS & Relatórios IA',
    sub: 'Gere o relatório automático do seu torneio e publique o conteúdo que move o seu clube.',
    genBtn: '✨ Gerar relatório IA do torneio',
    genSub: 'A IA resume o torneio ativo com dados reais: formato, jogadores, duplas, MVP e pódio. Determinístico e reproduzível.',
    edit: 'Editar publicação',
    placeholder: 'Texto da publicação…',
    titleLabel: 'Título',
    catLabel: 'Categoria',
    cats: ['Relatório', 'Notícia', 'Comunicado', 'SEO'],
    saveBtn: '💾 Guardar publicação',
    saved: 'Publicação guardada ✓',
    savedAt: 'guardada',
    publishBtn: '📤 Publicar',
    published: 'Publicada',
    delBtn: '🗑️',
    empty: 'Ainda não há publicações. Gere o seu primeiro relatório IA acima.',
    prevTitle: 'Pré-visualização',
    copyBtn: '📋 Copiar texto',
    copied: 'Copiado ✓',
    timeAgo: (d) => {
      const sec = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
      if (sec < 60) return 'há um momento';
      const min = Math.round(sec / 60);
      if (min < 60) return `há ${min} min`;
      const h = Math.round(min / 60);
      if (h < 24) return `há ${h} h`;
      return `há ${Math.round(h / 24)} d`;
    },
  },
};

const cardStyle = {
  background: '#fff', borderRadius: 12, padding: '18px 20px',
  boxShadow: '0 2px 12px rgba(15,23,42,0.06)', marginBottom: 16,
};
const btnStyle = {
  background: 'linear-gradient(135deg,#16a34a,#0f766e)', color: '#fff', border: 'none',
  borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer',
};
const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db',
  fontSize: 15, boxSizing: 'border-box', marginTop: 6, background: '#fff', color: '#1f2937',
};

export default function PostsApp({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [posts, setPosts] = useState(listPosts());
  const [draft, setDraft] = useState(null);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  const refresh = (list) => { setPosts(list); };

  const gen = () => {
    const cr = generateCrónica(lang);
    setDraft({ title: cr.title, body: cr.body, cat: T.cats[0], published: false });
    setNotice('');
  };

  const save = () => {
    if (!draft || !draft.title.trim() || !draft.body.trim()) return;
    const list = savePost(draft);
    refresh(list);
    setNotice(T.saved);
    setTimeout(() => setNotice(''), 2500);
  };

  const doPublish = (post) => {
    const list = savePost({ ...post, published: true });
    refresh(list);
  };

  const doDelete = (id) => {
    refresh(deletePost(id));
    if (draft && draft.id === id) setDraft(null);
  };

  const copy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.title + '\n\n' + draft.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px 60px' }}>
      <h1 style={{ fontSize: 26, color: '#0f172a', margin: '0 0 4px' }}>{T.badge}</h1>
      <p style={{ color: '#64748b', margin: '0 0 22px' }}>{T.sub}</p>

      {/* Generador crónica IA */}
      <div style={{ ...cardStyle, border: '2px solid #bbf7d0' }}>
        <button style={{ ...btnStyle, fontSize: 16 }} onClick={gen}>{T.genBtn}</button>
        <p style={{ color: '#64748b', fontSize: 13, margin: '10px 0 0' }}>{T.genSub}</p>
      </div>

      {draft && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 18, color: '#0f172a', margin: 0 }}>{draft.id ? T.edit : T.prevTitle}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...btnStyle, background: '#475569' }} onClick={copy}>{copied ? T.copied : T.copyBtn}</button>
              <button style={btnStyle} onClick={save}>{T.saveBtn}</button>
            </div>
          </div>
          {notice && <p style={{ color: '#16a34a', fontWeight: 700, margin: '10px 0 0' }}>{notice}</p>}
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>{T.titleLabel}</label>
            <input
              style={inputStyle}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>{T.catLabel}</label>
            <select
              style={{ ...inputStyle, width: 'auto', display: 'block' }}
              value={draft.cat}
              onChange={(e) => setDraft({ ...draft, cat: e.target.value })}
            >
              {T.cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea
            style={{ ...inputStyle, minHeight: 260, fontFamily: 'inherit', lineHeight: 1.6, marginTop: 12 }}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            placeholder={T.placeholder}
          />
        </div>
      )}

      {/* Listado */}
      <h2 style={{ fontSize: 19, color: '#0f172a', margin: '24px 0 12px' }}>📚 {T.savedAt.charAt(0).toUpperCase() + T.savedAt.slice(1)}</h2>
      {posts.length === 0 && <p style={{ color: '#94a3b8' }}>{T.empty}</p>}
      {posts.map((p) => (
        <div key={p.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 16, color: '#0f172a' }}>{p.title}</strong>
                <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 12, padding: '2px 8px', borderRadius: 999 }}>{p.cat}</span>
                {p.published && <span style={{ background: '#16a34a', color: '#fff', fontSize: 12, padding: '2px 8px', borderRadius: 999 }}>✓ {T.published}</span>}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{T.savedAt}: {T.timeAgo(p.createdAt || p.updatedAt)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...btnStyle, background: '#2563eb' }} onClick={() => setDraft(p)}>{T.edit}</button>
              {!p.published && <button style={btnStyle} onClick={() => doPublish(p)}>{T.publishBtn}</button>}
              <button
                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontWeight: 700 }}
                onClick={() => doDelete(p.id)}
              >
                {T.delBtn}
              </button>
            </div>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', color: '#334155', fontSize: 14, lineHeight: 1.6, margin: '12px 0 0', maxHeight: 150, overflow: 'hidden' }}>
            {p.body}
          </p>
        </div>
      ))}
    </div>
  );
}