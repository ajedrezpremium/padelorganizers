/**
 * api/demo-request.js — Solicitud de demo virtual.
 * Guarda en Supabase (demo_requests) y avisa al dueño POR EMAIL.
 * Este es el ÚNICO aviso comercial: si nadie pide demo, silencio total.
 */
import nodemailer from 'nodemailer';

const SUPA_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASS = (process.env.GMAIL_APP_PASS || process.env['GOOGLE-APP-KEY'] || '').replace(/\s+/g, '');
const ALERT_EMAIL = process.env.ALERT_EMAIL || GMAIL_USER; // dueño: solo recibe esto

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const { email, name = '', profile = '', lang = 'es', source = 'web' } = req.body || {};
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'email required' });

  // 1) Guardar en Supabase (best-effort: la demo web nunca debe romperse por esto)
  let saved = false;
  if (SUPA_URL && SUPA_KEY) {
    try {
      const r = await fetch(`${SUPA_URL}/rest/v1/demo_requests`, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ email: email.trim(), nombre: name, perfil: profile, idioma: lang, fuente: source }),
      });
      saved = r.ok;
    } catch { /* noop */ }
  }

  // 2) Avisar al dueño — SOLO ante solicitud de demo
  let alerted = false;
  if (GMAIL_USER && GMAIL_APP_PASS && ALERT_EMAIL) {
    try {
      const tr = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS } });
      await tr.sendMail({
        from: `Padel Organizers <${GMAIL_USER}>`,
        to: ALERT_EMAIL,
        subject: `🎾 Demo solicitada: ${name || email} (${profile || source})`,
        text: `Alguien pidió demo virtual.\n\nNombre: ${name || '-'}\nEmail: ${email}\nPerfil: ${profile || '-'}\nIdioma: ${lang}\nFuente: ${source}\n\nResponde en <24h con día/hora para la videollamada.`,
      });
      alerted = true;
    } catch { /* noop */ }
  }

  return res.status(200).json({ ok: true, saved, alerted });
}
