import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import PhoneInput from './PhoneInput';

const I18N = {
  es: {
    title: '➕ Dar de alta tu club o escuela',
    subtitle: '¿No encuentras tu club en el directorio? Rellena la ficha y aparecerá al instante como pendiente de verificación.',
    back: '← Volver al directorio',
    online: 'Publicación en línea activa',
    offline: 'Modo vista previa activo',
    name: 'Nombre del club *',
    city: 'Ciudad *',
    province: 'Provincia',
    address: 'Dirección',
    phone: 'Teléfono de contacto',
    email: 'Correo de contacto',
    website: 'Sitio web',
    courts: 'Pistas / superficie',
    indoor: '¿Tiene pistas cubiertas?',
    indoorYes: 'Sí, cubiertas',
    indoorNo: 'No, exteriores',
    grass: 'Tipo de césped (opcional)',
    booking: 'Plataforma de reservas',
    hasSchool: '¿Tiene escuela / entrenadores?',
    hasShop: '¿Tiene tienda de material?',
    yes: 'Sí',
    no: 'No',
    description: 'Descripción breve',
    notes: 'Notas para el equipo (opcional)',
    submit: 'Publicar mi ficha',
    busy: 'Publicando…',
    success: '¡Ficha creada! Tu club ya aparece en el directorio como pendiente de verificación.',
    successCta: 'Ver mi club en el directorio',
    errRequired: 'Nombre y ciudad son obligatorios.',
    errSave: 'No se pudo publicar. Inténtalo de nuevo.',
    demo: 'El alta online está disponible cuando el directorio está conectado a la nube.',
  },
  en: {
    title: '➕ Register your club or school',
    subtitle: "Don't find your club in the directory? Fill in the listing and it will appear instantly as pending verification.",
    back: '← Back to directory',
    online: 'Online publishing active',
    offline: 'Preview mode active',
    name: 'Club name *',
    city: 'City *',
    province: 'Province',
    address: 'Address',
    phone: 'Contact phone',
    email: 'Contact email',
    website: 'Website',
    courts: 'Courts / surface',
    indoor: 'Does it have indoor courts?',
    indoorYes: 'Yes, indoor',
    indoorNo: 'No, outdoor',
    grass: 'Grass type (optional)',
    booking: 'Booking platform',
    hasSchool: 'Has a school / coaches?',
    hasShop: 'Has a gear shop?',
    yes: 'Yes',
    no: 'No',
    description: 'Short description',
    notes: 'Notes for the team (optional)',
    submit: 'Publish my listing',
    busy: 'Publishing…',
    success: 'Listing created! Your club now appears in the directory as pending verification.',
    successCta: 'View my club in the directory',
    errRequired: 'Name and city are required.',
    errSave: 'Could not publish. Try again.',
    demo: 'Online registration is available when the directory is connected to the cloud.',
  },
  fr: {
    title: '➕ Enregistrez votre club ou école',
    subtitle: 'Vous ne trouvez pas votre club dans l’annuaire ? Remplissez la fiche et elle apparaîtra immédiatement en attente de vérification.',
    back: '← Retour à l’annuaire',
    online: 'Publication en ligne active',
    offline: 'Mode aperçu actif',
    name: 'Nom du club *',
    city: 'Ville *',
    province: 'Province',
    address: 'Adresse',
    phone: 'Téléphone de contact',
    email: 'Email de contact',
    website: 'Site web',
    courts: 'Terrains / surface',
    indoor: 'A-t-il des terrains couverts ?',
    indoorYes: 'Oui, couverts',
    indoorNo: 'Non, extérieurs',
    grass: 'Type de gazon (optionnel)',
    booking: 'Plateforme de réservation',
    hasSchool: 'A-t-il une école / des entraîneurs ?',
    hasShop: 'A-t-il une boutique ?',
    yes: 'Oui',
    no: 'Non',
    description: 'Description courte',
    notes: 'Notes pour l’équipe (optionnel)',
    submit: 'Publier ma fiche',
    busy: 'Publication…',
    success: 'Fiche créée ! Votre club apparaît désormais dans l’annuaire en attente de vérification.',
    successCta: 'Voir mon club dans l’annuaire',
    errRequired: 'Le nom et la ville sont obligatoires.',
    errSave: 'Impossible de publier. Réessayez.',
    demo: 'L’enregistrement en ligne est disponible lorsque l’annuaire est connecté au cloud.',
  },
  pt: {
    title: '➕ Registe o seu clube ou escola',
    subtitle: 'Não encontra o seu clube no diretório? Preencha a ficha e aparecerá imediatamente como pendente de verificação.',
    back: '← Voltar ao diretório',
    online: 'Publicação online ativa',
    offline: 'Modo de pré-visualização ativo',
    name: 'Nome do clube *',
    city: 'Cidade *',
    province: 'Província',
    address: 'Endereço',
    phone: 'Telefone de contacto',
    email: 'Email de contacto',
    website: 'Site',
    courts: 'Campos / superfície',
    indoor: 'Tem campos cobertos?',
    indoorYes: 'Sim, cobertos',
    indoorNo: 'Não, exteriores',
    grass: 'Tipo de relva (opcional)',
    booking: 'Plataforma de reservas',
    hasSchool: 'Tem escola / treinadores?',
    hasShop: 'Tem loja de material?',
    yes: 'Sim',
    no: 'Não',
    description: 'Descrição curta',
    notes: 'Notas para a equipa (opcional)',
    submit: 'Publicar a minha ficha',
    busy: 'A publicar…',
    success: 'Ficha criada! O seu clube já aparece no diretório como pendente de verificação.',
    successCta: 'Ver o meu clube no diretório',
    errRequired: 'Nome e cidade são obrigatórios.',
    errSave: 'Não foi possível publicar. Tente novamente.',
    demo: 'O registo online está disponível quando o diretório está ligado à nuvem.',
  },
};

const styles = {
  wrap: { minHeight: '100vh', background: 'var(--padel-bg)', padding: '40px 16px', fontFamily: "'Segoe UI', system-ui, sans-serif", color: 'var(--padel-text)' },
  card: { maxWidth: 680, margin: '0 auto', background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 28 },
  h1: { margin: '0 0 6px', fontSize: 22, fontWeight: 800 },
  sub: { margin: '0 0 20px', color: 'var(--padel-muted)', fontSize: 14 },
  back: { display: 'inline-block', marginBottom: 16, color: 'var(--padel-emerald-dark)', textDecoration: 'none', fontSize: 14 },
  label: { display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--padel-muted)', margin: '12px 0 4px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--padel-input-border)', background: 'var(--padel-input-bg)', color: 'var(--padel-text)', fontSize: 15, boxSizing: 'border-box' },
  textarea: { ...{}, minHeight: 80, resize: 'vertical' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  btn: { marginTop: 18, padding: '12px 20px', borderRadius: 10, border: 'none', background: 'var(--padel-emerald)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', width: '100%' },
  chip: { display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 10 },
  success: { background: 'var(--padel-emerald)', color: '#fff', borderRadius: 10, padding: '14px 18px', fontWeight: 600, fontSize: 14 },
  error: { background: '#fee2e2', color: '#b91c1c', borderRadius: 10, padding: '12px 16px', fontWeight: 600, fontSize: 14 },
  toggle: { display: 'flex', gap: 18, alignItems: 'center' },
  radio: { accentColor: 'var(--padel-emerald)' },
};

function Field({ label, children }) {
  return (<><label style={styles.label}>{label}</label>{children}</>);
}

export default function AltaClub({ lang = 'es' }) {
  const t = I18N[lang] || I18N.es;
  const navigate = useNavigate();
  const online = isSupabaseConfigured;

  const [form, setForm] = useState({
    name: '', city: '', province: '', address: '',
    email: '', website: '', courts: '', grass: '', booking: '',
    indoor: true, hasSchool: false, hasShop: false, description: '', notes: '',
  });
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [createdId, setCreatedId] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    setErr(''); setMsg('');
    if (!form.name.trim() || !form.city.trim()) { setErr(t.errRequired); return; }
    if (!online) { setMsg(t.demo); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc('alta_club', {
      p_name: form.name.trim(),
      p_city: form.city.trim(),
      p_province: form.province.trim() || null,
      p_address: form.address.trim() || null,
      p_phone: phone || null,
      p_email: form.email.trim() || null,
      p_website: form.website.trim() || null,
      p_courts: form.courts.trim() || null,
      p_indoor: form.indoor,
      p_grass: form.grass.trim() || null,
      p_booking_platform: form.booking.trim() || null,
      p_has_school: form.hasSchool,
      p_has_shop: form.hasShop,
      p_description: form.description.trim() || null,
      p_notas: form.notes.trim() || null,
    });
    setBusy(false);
    if (error) { setErr(error.message || t.errSave); return; }
    setCreatedId(data?.id || data?.slug || null);
    setMsg(t.success);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <a style={styles.back} href="/clubes">{t.back}</a>
        <span style={{ ...styles.chip, background: online ? '#d1fae5' : '#e2e8f0', color: online ? '#065f46' : '#64748b' }}>
          {online ? t.online : t.offline}
        </span>
        <h1 style={styles.h1}>{t.title}</h1>
        <p style={styles.sub}>{t.subtitle}</p>

        {msg ? <div style={styles.success} role="status">{msg}</div> : null}
        {err ? <div style={styles.error} role="alert">{err}</div> : null}

        {createdId ? (
          <div style={{ marginTop: 16 }}>
            <button style={styles.btn} onClick={() => navigate('/clubes')}>{t.successCta}</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <Field label={t.name}>
              <input style={styles.input} value={form.name} onChange={set('name')} required />
            </Field>
            <div style={styles.row}>
              <Field label={t.city}>
                <input style={styles.input} value={form.city} onChange={set('city')} required />
              </Field>
              <Field label={t.province}>
                <input style={styles.input} value={form.province} onChange={set('province')} />
              </Field>
            </div>
            <Field label={t.address}>
              <input style={styles.input} value={form.address} onChange={set('address')} />
            </Field>
            <Field label={t.phone}>
              <PhoneInput value={phone} onChange={setPhone} />
            </Field>
            <div style={styles.row}>
              <Field label={t.email}>
                <input style={styles.input} type="email" value={form.email} onChange={set('email')} />
              </Field>
              <Field label={t.website}>
                <input style={styles.input} value={form.website} onChange={set('website')} placeholder="https://" />
              </Field>
            </div>
            <Field label={t.courts}>
              <input style={styles.input} value={form.courts} onChange={set('courts')} />
            </Field>
            <Field label={t.indoor}>
              <div style={styles.toggle}>
                <label><input style={styles.radio} type="radio" name="indoor" checked={form.indoor} onChange={() => setForm((f) => ({ ...f, indoor: true }))} /> {t.indoorYes}</label>
                <label><input style={styles.radio} type="radio" name="indoor" checked={!form.indoor} onChange={() => setForm((f) => ({ ...f, indoor: false }))} /> {t.indoorNo}</label>
              </div>
            </Field>
            <div style={styles.row}>
              <Field label={t.grass}>
                <input style={styles.input} value={form.grass} onChange={set('grass')} />
              </Field>
              <Field label={t.booking}>
                <input style={styles.input} value={form.booking} onChange={set('booking')} placeholder="Playtomic / Web Propia…" />
              </Field>
            </div>
            <Field label={t.hasSchool}>
              <div style={styles.toggle}>
                <label><input style={styles.radio} type="radio" name="school" checked={form.hasSchool} onChange={() => setForm((f) => ({ ...f, hasSchool: true }))} /> {t.yes}</label>
                <label><input style={styles.radio} type="radio" name="school" checked={!form.hasSchool} onChange={() => setForm((f) => ({ ...f, hasSchool: false }))} /> {t.no}</label>
              </div>
            </Field>
            <Field label={t.hasShop}>
              <div style={styles.toggle}>
                <label><input style={styles.radio} type="radio" name="shop" checked={form.hasShop} onChange={() => setForm((f) => ({ ...f, hasShop: true }))} /> {t.yes}</label>
                <label><input style={styles.radio} type="radio" name="shop" checked={!form.hasShop} onChange={() => setForm((f) => ({ ...f, hasShop: false }))} /> {t.no}</label>
              </div>
            </Field>
            <Field label={t.description}>
              <textarea style={{ ...styles.input, ...styles.textarea }} value={form.description} onChange={set('description')} />
            </Field>
            <Field label={t.notes}>
              <textarea style={{ ...styles.input, ...styles.textarea, minHeight: 56 }} value={form.notes} onChange={set('notes')} />
            </Field>
            <button style={styles.btn} disabled={busy}>{busy ? t.busy : t.submit}</button>
          </form>
        )}
      </div>
    </div>
  );
}