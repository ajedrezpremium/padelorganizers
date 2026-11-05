/**
 * comercialTracking.js — Medición mínima del embudo web.
 * Guarda en Supabase (web_events) cada paso con sus UTMs, para saber
 * de qué email/ciudad viene cada alta. Todo fail-soft: si falla, la web sigue.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const EMAIL_KEY = 'padel-demo-email';

export function getTrackingEmail() {
  try { return localStorage.getItem(EMAIL_KEY) || ''; } catch { return ''; }
}

export function setTrackingEmail(email) {
  try { if (email) localStorage.setItem(EMAIL_KEY, email); } catch { /* noop */ }
}

function getUtm() {
  try {
    const first = JSON.parse(sessionStorage.getItem('padel-utm') || 'null');
    if (first) return first;
  } catch { /* noop */ }
  // Solo primera visita de la sesión (atribución al email que trajo al lead)
  let utm = {};
  try {
    const q = new URLSearchParams(window.location.search);
    utm = {
      utm_source: q.get('utm_source') || '',
      utm_medium: q.get('utm_medium') || '',
      utm_campaign: q.get('utm_campaign') || '',
      utm_content: q.get('utm_content') || '',
    };
    sessionStorage.setItem('padel-utm', JSON.stringify(utm));
  } catch { /* noop */ }
  return utm;
}

export function trackWebEvent(evento, detalle = '') {
  try {
    if (!isSupabaseConfigured()) return;
    const utm = getUtm();
    supabase.from('web_events').insert([{
      email: getTrackingEmail(),
      evento,
      detalle: String(detalle || '').slice(0, 300),
      path: window.location.pathname,
      ...utm,
    }]).then(() => {}, () => {});
  } catch { /* noop */ }
}
