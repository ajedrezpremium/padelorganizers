import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { listClubes, findClub, solicitarVerificacion, confirmarVerificacion } from '../services/clubDirectoryService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const I18N = {
  es: {
    pending: 'Solicitar verificación',
    confirm: 'Confirmar ficha y verificar',
    hPending: 'Solicita verificar tu ficha',
    hConfirm: 'Verifica la ficha de tu club',
    intro: 'Completa tus datos de contacto. Un responsable del equipo revisará tu solicitud y os enviará el enlace de confirmación.',
    introConfirm: 'Tus datos se publicaran en el directorio con la insignia "Verificado" y apareceras antes en las busquedas.',
    clubLabel: 'Club',
    stateLabel: 'Estado',
    name: 'Tu nombre',
    email: 'Tu correo',
    role: 'Tu cargo',
    notes: 'Notas (opcional)',
    send: 'Enviar solicitud',
    sendConfirm: 'Confirmar y verificar',
    back: '← Volver al directorio',
    successPending: 'Solicitud enviada. Revisaremos tus datos y te contactaremos con el enlace de confirmación.',
    successConfirm: '¡Ficha verificada! Gracias por confirmar los datos de tu club.',
    invalid: 'Este enlace es inválido o el token no coincide.',
    loading: 'Cargando ficha…',
    saveError: 'No se pudo enviar. Revisa que el formulario esté completo.',
    verificado: 'Verificado',
    pendiente: 'Pendiente de verificación',
    notFound: 'Club no encontrado.',
    off: 'La verificación por correo está disponible cuando la plataforma está conectada a la nube.',
  },
  en: {
    pending: 'Request verification',
    confirm: 'Verify listing',
    hPending: 'Request to verify your listing',
    hConfirm: 'Verify your club listing',
    intro: 'Complete your contact details. A member of our team will review and send you the confirmation link.',
    introConfirm: 'Your details will be published with a "Verified" badge and you will appear higher in search results.',
    clubLabel: 'Club',
    stateLabel: 'Status',
    name: 'Your name',
    email: 'Your email',
    role: 'Your role',
    notes: 'Notes (optional)',
    send: 'Send request',
    sendConfirm: 'Confirm & verify',
    back: '← Back to directory',
    successPending: 'Request sent. We will review your details and send you the confirmation link.',
    successConfirm: 'Listing verified! Thank you for confirming your club details.',
    invalid: 'This link is invalid or the token does not match.',
    loading: 'Loading listing…',
    saveError: 'Could not save. Please review the form.',
    verificado: 'Verified',
    pendiente: 'Pending verification',
    notFound: 'Club not found.',
    off: 'Email verification is available when the platform is connected to the cloud.',
  },
};

const styles = {
  wrap: { minHeight: '100vh', background: 'var(--padel-bg)', padding: '40px 16px', fontFamily: "'Segoe UI', system-ui, sans-serif", color: 'var(--padel-text)' },
  card: { maxWidth: 640, margin: '0 auto', background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 28 },
  h1: { margin: '0 0 6px', fontSize: 22, fontWeight: 800 },
  sub: { margin: '0 0 20px', color: 'var(--padel-muted)', fontSize: 14 },
  badge: { display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 10 },
  label: { display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--padel-muted)', margin: '12px 0 4px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--padel-input-border)', background: 'var(--padel-input-bg)', color: 'var(--padel-text)', fontSize: 15, boxSizing: 'border-box' },
  btn: { marginTop: 18, padding: '12px 20px', borderRadius: 10, border: 'none', background: 'var(--padel-emerald)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', width: '100%' },
  back: { display: 'inline-block', marginBottom: 16, color: 'var(--padel-emerald-dark)', textDecoration: 'none', fontSize: 14 },
  success: { background: 'var(--padel-emerald)', color: '#fff', borderRadius: 10, padding: '14px 18px', fontWeight: 600, fontSize: 14 },
  error: { background: '#fee2e2', color: '#b91c1c', borderRadius: 10, padding: '12px 16px', fontWeight: 600, fontSize: 14 },
  text: { margin: '0 0 8px', color: 'var(--padel-muted)' },
};

export default function VerificarFicha({ lang = 'es' }) {
  const t = I18N[lang] || I18N.es;
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const clubId = params.get('club');
  const token = params.get('t');

  const [clubes, setClubes] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [notas, setNotas] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listClubes().then((data) => {
      setClubes(data);
      setClub(findClub(data, clubId));
      setLoading(false);
    });
  }, [clubId]);

  if (loading) return <div style={styles.wrap}><p style={styles.text}>{t.loading}</p></div>;

  if (!club) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <a style={styles.back} href="/clubes">{t.back}</a>
          <h1 style={styles.h1}>{t.notFound}</h1>
        </div>
      </div>
    );
  }

  const isConfirm = Boolean(token);
  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if (!nombre.trim() || !email.trim()) { setErr(t.saveError); return; }
    setBusy(true);
    const res = isConfirm
      ? await confirmarVerificacion({ clubId: club.id, token, nombre, email, cargo })
      : await solicitarVerificacion({ clubId: club.id, nombre, email, cargo, notas });
    setBusy(false);
    if (res.demo) { setMsg(t.off); return; }
    if (!res.ok) { setErr(t.saveError + (res.error ? ` (${res.error.message})` : '')); return; }
    setMsg(isConfirm ? t.successConfirm : t.successPending);
  };

  const badge = club.is_verified
    ? { label: t.verificado, bg: '#d1fae5', color: '#065f46' }
    : { label: t.pendiente, bg: '#e2e8f0', color: '#64748b' };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <a style={styles.back} href="/clubes">{t.back}</a>
        <span style={{ ...styles.badge, background: badge.bg, color: badge.color }}>{badge.label}</span>
        <h1 style={styles.h1}>{isConfirm ? t.hConfirm : t.hPending}</h1>
        <p style={styles.sub}>{club.name}{club.address ? ` — ${club.address}` : ''}{club.city ? ` · ${club.city}` : ''}</p>

        {club.latitude && club.longitude ? (
          <MapaClub club={club} t={t} clubes={clubes} />
        ) : null}

        {msg ? <div style={styles.success} role="status">{msg}</div> : null}
        {err ? <div style={styles.error} role="alert">{err}</div> : null}

        <form onSubmit={submit}>
          <label style={styles.label}>{t.name} *</label>
          <input style={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} required />

          <label style={styles.label}>{t.email} *</label>
          <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label style={styles.label}>{t.role}</label>
          <input style={styles.input} value={cargo} onChange={(e) => setCargo(e.target.value)} />

          {!isConfirm ? (
            <>
              <label style={styles.label}>{t.notes}</label>
              <textarea style={{ ...styles.input, minHeight: 72 }} value={notas} onChange={(e) => setNotas(e.target.value)} />
            </>
          ) : null}

          <button style={styles.btn} disabled={busy}>
            {busy ? '…' : (isConfirm ? t.sendConfirm : t.send)}
          </button>
        </form>
        {!isConfirm ? <p style={{ ...styles.text, fontSize: 13, marginTop: 14 }}>{t.intro}</p> : <p style={{ ...styles.text, fontSize: 13, marginTop: 14 }}>{t.introConfirm}</p>}
      </div>
    </div>
  );
}

function MapaClub({ club, t }) {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  useEffect(() => {
    if (!ref.current || !club.latitude || !club.longitude || mapRef.current) return;
    const map = L.map(ref.current).setView([club.latitude, club.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);
    L.marker([club.latitude, club.longitude], { icon: markerIcon }).addTo(map).bindPopup(club.name).openPopup();
    mapRef.current = map;
    return () => { try { map.remove(); } catch {} mapRef.current = null; };
  }, [club, club.name]);
  return <div ref={ref} style={{ height: 200, width: '100%', borderRadius: 12, marginBottom: 16, zIndex: 0, position: 'relative' }} />;
}