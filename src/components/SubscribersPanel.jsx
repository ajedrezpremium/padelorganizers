import React, { useState, useEffect } from 'react';
import {
  listSubscribersSync, subscriberKpisSync, addSubscriber, unsubscribe,
  resubscribe, removeSubscriber, resetSubscribers, downloadSubscribersCsv, syncSubscribersToCloud,
} from '../services/subscribersService';

const I18N = {
  es: {
    badge: '📧 Panel de suscriptores',
    title: 'Tu lista de newsletter en tiempo real',
    sub: 'Alta, baja y exportación a CSV compatible con los scripts de campaña (clientes/enviar-*.mjs).',
    kpiTotal: 'Suscriptores', kpiActive: 'Activos', kpiInactive: 'Dados de baja',
    addTitle: '➕ Añadir suscriptor', email: 'Correo', name: 'Nombre (club/persona)', lang: 'Idioma', city: 'Ciudad',
    addBtn: 'Añadir', cancel: 'Cancelar',
    tableEmail: 'Correo', tableName: 'Nombre', tableCity: 'Ciudad', tableLang: 'Idioma', tableStatus: 'Estado', tableActions: 'Acciones',
    active: 'Activo', inactive: 'Baja', remove: 'Eliminar', deactivate: 'Dar de baja', reactivate: 'Reactivar',
    exportBtn: '⬇️ Exportar CSV', resetBtn: '↺ Restaurar demo', syncBtn: '☁️ Sincronizar nube',
    empty: 'Aún no hay suscriptores. Añade el primero o genera la lista desde el studio.',
    added: '✓ Suscriptor añadido (o reactivado)', noAdded: 'No se pudo añadir: correo inválido',
    synced: '✓ Sincronizados a la nube', syncErr: 'La nube no está configurada (tabla newsletter_subscribers no existe)',
    removed: 'Eliminado', unsubscribed: 'Dado de baja', hes: 'es',
    langs: { es: '🇪🇸 ES', en: '🇬🇧 EN', fr: '🇫🇷 FR', pt: '🇵🇹 PT' },
    hint: 'El CSV incluye SOLO los suscriptores activos en el formato que esperan enviar-campana.mjs / enviar-espaciado.mjs.',
  },
  en: {
    badge: '📧 Subscribers panel',
    title: 'Your newsletter list in real time',
    sub: 'Sign-ups, opt-out and CSV export compatible with the campaign scripts (clientes/enviar-*.mjs).',
    kpiTotal: 'Subscribers', kpiActive: 'Active', kpiInactive: 'Opted out',
    addTitle: '➕ Add subscriber', email: 'Email', name: 'Name (club/person)', lang: 'Language', city: 'City',
    addBtn: 'Add', cancel: 'Cancel',
    tableEmail: 'Email', tableName: 'Name', tableCity: 'City', tableLang: 'Lang', tableStatus: 'Status', tableActions: 'Actions',
    active: 'Active', inactive: 'Opted out', remove: 'Remove', deactivate: 'Opt out', reactivate: 'Reactivate',
    exportBtn: '⬇️ Export CSV', resetBtn: '↺ Restore demo', syncBtn: '☁️ Sync cloud',
    empty: 'No subscribers yet. Add the first one or generate the list from the studio.',
    added: '✓ Subscriber added (or reactivated)', noAdded: 'Could not add: invalid email',
    synced: '✓ Synced to cloud', syncErr: 'Cloud is not configured (newsletter_subscribers table missing)',
    removed: 'Removed', unsubscribed: 'Opted out', hes: 'en',
    langs: { es: '🇪🇸 ES', en: '🇬🇧 EN', fr: '🇫🇷 FR', pt: '🇵🇹 PT' },
    hint: 'The CSV includes ONLY active subscribers in the format expected by enviar-campana.mjs / enviar-espaciado.mjs.',
  },
  fr: {
    badge: '📧 Panneau des abonnés',
    title: 'Votre liste de newsletter en temps réel',
    sub: 'Inscriptions, désinscription et export CSV compatible avec les scripts de campagne (clientes/enviar-*.mjs).',
    kpiTotal: 'Abonnés', kpiActive: 'Actifs', kpiInactive: 'Désabonnés',
    addTitle: '➕ Ajouter un abonné', email: 'E-mail', name: 'Nom (club/personne)', lang: 'Langue', city: 'Ville',
    addBtn: 'Ajouter', cancel: 'Annuler',
    tableEmail: 'E-mail', tableName: 'Nom', tableCity: 'Ville', tableLang: 'Langue', tableStatus: 'Statut', tableActions: 'Actions',
    active: 'Actif', inactive: 'Désabonné', remove: 'Supprimer', deactivate: 'Désabonner', reactivate: 'Réactiver',
    exportBtn: '⬇️ Exporter CSV', resetBtn: '↺ Restaurer la démo', syncBtn: '☁️ Sync nuage',
    empty: 'Aucun abonné. Ajoutez le premier ou générez la liste depuis le studio.',
    added: '✓ Abonné ajouté (ou réactivé)', noAdded: 'Impossible d\'ajouter : e-mail invalide',
    synced: '✓ Synchronisé au nuage', syncErr: 'Le nuage n\'est pas configuré (table newsletter_subscribers absente)',
    removed: 'Supprimé', unsubscribed: 'Désabonné', hes: 'fr',
    langs: { es: '🇪🇸 ES', en: '🇬🇧 EN', fr: '🇫🇷 FR', pt: '🇵🇹 PT' },
    hint: 'Le CSV inclut UNIQUEMENT les abonnés actifs au format attendu par enviar-campana.mjs / enviar-espaciado.mjs.',
  },
  pt: {
    badge: '📧 Painel de subscritores',
    title: 'A sua lista de newsletter em tempo real',
    sub: 'Inscrição, cancelamento e export CSV compatível com os scripts de campanha (clientes/enviar-*.mjs).',
    kpiTotal: 'Subscritores', kpiActive: 'Ativos', kpiInactive: 'Cancelados',
    addTitle: '➕ Adicionar subscritor', email: 'E-mail', name: 'Nome (clube/pessoa)', lang: 'Idioma', city: 'Cidade',
    addBtn: 'Adicionar', cancel: 'Cancelar',
    tableEmail: 'E-mail', tableName: 'Nome', tableCity: 'Cidade', tableLang: 'Idioma', tableStatus: 'Estado', tableActions: 'Ações',
    active: 'Ativo', inactive: 'Cancelado', remove: 'Eliminar', deactivate: 'Cancelar', reactivate: 'Reativar',
    exportBtn: '⬇️ Exportar CSV', resetBtn: '↺ Restaurar demo', syncBtn: '☁️ Sincronizar nuvem',
    empty: 'Ainda não há subscritores. Adicione o primeiro ou gere a lista a partir do estúdio.',
    added: '✓ Subscritor adicionado (ou reativado)', noAdded: 'Não foi possível adicionar: e-mail inválido',
    synced: '✓ Sincronizado com a nuvem', syncErr: 'A nuvem não está configurada (tabela newsletter_subscribers ausente)',
    removed: 'Eliminado', unsubscribed: 'Cancelado', hes: 'pt',
    langs: { es: '🇪🇸 ES', en: '🇬🇧 EN', fr: '🇫🇷 FR', pt: '🇵🇹 PT' },
    hint: 'O CSV inclui APENAS os subscritores ativos no formato esperado por enviar-campana.mjs / enviar-espaciado.mjs.',
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const btn = { border: 'none', padding: '10px 16px', borderRadius: 11, fontWeight: 800, fontSize: 13, cursor: 'pointer' };
const statusColor = { active: '#10b981', inactive: '#64748b' };

export default function SubscribersPanel({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [subs, setSubs] = useState([]);
  const [kpis, setKpis] = useState({ total: 0, active: 0, inactive: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', lang: 'es', city: '' });
  const [msg, setMsg] = useState('');
  const [syncing, setSyncing] = useState(false);

  const refresh = () => {
    setSubs(listSubscribersSync());
    setKpis(subscriberKpisSync());
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [lang]);

  const save = async (fn) => { await fn(); refresh(); };

  const handleAdd = async () => {
    const res = await addSubscriber(form);
    if (res.ok) {
      setMsg(T.added);
      setShowAdd(false);
      setForm({ email: '', name: '', lang: 'es', city: '' });
      refresh();
    } else {
      setMsg(res.error || T.noAdded);
    }
    setTimeout(() => setMsg(''), 2600);
  };

  const handleSync = async () => {
    setSyncing(true);
    const res = await syncSubscribersToCloud({ onProgress: () => {} });
    setSyncing(false);
    setMsg(res.synced > 0 ? T.synced : res.error ? T.syncErr : T.syncErr);
    setTimeout(() => setMsg(''), 3200);
  };

  const langsSelect = ['es', 'en', 'fr', 'pt'];

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>
        {/* Cabecera */}
        <div style={{ ...card, padding: 24, background: 'linear-gradient(135deg,#0c1f1a,#0e241f)', borderColor: 'rgba(132,204,22,0.35)' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: '#a3e635', padding: '5px 14px', borderRadius: 99, background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.3)' }}>{T.badge}</span>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: '12px 0 6px', color: 'var(--padel-text)' }}>{T.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--padel-muted)', maxWidth: 660, lineHeight: 1.55, margin: 0 }}>{T.sub}</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginTop: 16 }}>
          {[{ label: T.kpiTotal, v: kpis.total, c: '#a3e635' }, { label: T.kpiActive, v: kpis.active, c: '#10b981' }, { label: T.kpiInactive, v: kpis.inactive, c: '#64748b' }].map((k, i) => (
            <div key={i} style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: k.c }}>{k.v}</div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--padel-muted)' }}>{k.label}</div>
            </div>
          ))}
        </div>

        {msg && <div style={{ ...card, marginTop: 12, padding: '12px 18px', fontSize: 13, fontWeight: 700, color: '#10b981', borderColor: 'rgba(16,185,129,0.4)' }}>{msg}</div>}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setShowAdd(v => !v)} style={{ ...btn, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }}>{showAdd ? T.cancel : T.addTitle}</button>
          <button onClick={() => save(downloadSubscribersCsv)} style={{ ...btn, background: 'rgba(255,255,255,0.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }}>{T.exportBtn}</button>
          <button onClick={handleSync} disabled={syncing} style={{ ...btn, background: 'rgba(255,255,255,0.08)', color: '#a3e635', border: '1px solid rgba(132,204,22,0.4)', opacity: syncing ? 0.6 : 1 }}>{syncing ? '…' : T.syncBtn}</button>
          <button onClick={() => save(() => { resetSubscribers(); })} style={{ ...btn, background: 'rgba(255,255,255,0.06)', color: 'var(--padel-muted)', border: '1px solid var(--padel-border)' }}>{T.resetBtn}</button>
        </div>

        {/* Formulario alta */}
        {showAdd && (
          <div style={{ ...card, marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={T.email} style={inputStyle} />
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={T.name} style={inputStyle} />
            <select value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value }))} style={inputStyle}>
              {langsSelect.map(l => <option key={l} value={l}>{T.langs[l]}</option>)}
            </select>
            <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder={T.city} style={inputStyle} />
            <button onClick={handleAdd} style={{ ...btn, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }}>{T.addBtn}</button>
          </div>
        )}

        <p style={{ fontSize: 11.5, color: '#64748b', margin: '14px 2px 0', lineHeight: 1.5 }}>{T.hint}</p>

        {/* Tabla */}
        <div style={{ ...card, marginTop: 12, overflowX: 'auto' }}>
          {subs.length === 0 ? (
            <div style={{ padding: 26, textAlign: 'center', color: 'var(--padel-muted)', fontSize: 13.5 }}>{T.empty}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--padel-border)', color: 'var(--padel-muted)', fontSize: 11, letterSpacing: 0.8 }}>
                  {[T.tableEmail, T.tableName, T.tableCity, T.tableLang, T.tableStatus, T.tableActions].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '10px 10px', fontWeight: 800 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '11px 10px', color: s.active ? 'var(--padel-text)' : '#475569' }}>{s.email}</td>
                    <td style={{ padding: '11px 10px', color: 'var(--padel-text)' }}>{s.name || '—'}</td>
                    <td style={{ padding: '11px 10px', color: 'var(--padel-muted)' }}>{s.city || '—'}</td>
                    <td style={{ padding: '11px 10px', color: 'var(--padel-muted)' }}>{T.langs[s.lang] || s.lang}</td>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: statusColor[s.active ? 'active' : 'inactive'], background: `${statusColor[s.active ? 'active' : 'inactive']}1a`, padding: '4px 10px', borderRadius: 99 }}>{s.active ? T.active : T.inactive}</span>
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {s.active
                          ? <button onClick={() => save(() => unsubscribe(s.id))} title={T.deactivate} style={miniBtn}>{T.deactivate}</button>
                          : <button onClick={() => save(() => resubscribe(s.id))} title={T.reactivate} style={{ ...miniBtn, borderColor: 'rgba(16,185,129,0.4)', color: '#10b981' }}>{T.reactivate}</button>}
                        <button onClick={() => save(() => removeSubscriber(s.id))} title={T.remove} style={{ ...miniBtn, borderColor: 'rgba(248,113,113,0.4)', color: '#f87171' }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: '#0f211d', color: 'var(--padel-text)', border: '1px solid var(--padel-border)',
  borderRadius: 10, padding: '10px 12px', fontSize: 13,
};
const miniBtn = {
  border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--padel-muted)', borderRadius: 8, fontSize: 11, padding: '4px 9px', cursor: 'pointer',
};