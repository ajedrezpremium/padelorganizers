/**
 * api/_lib/validate.js — Validación de entrada compartida por los endpoints
 * de pago (checkout, split, paypal-order). Serverless; sin dependencias.
 */

export const MAX_AMOUNT_EUR = 500; // tope por hora de reserva: sobra con creces
export const MIN_AMOUNT_EUR = 0.5; // mínimo Stripe (50 céntimos)
export const MAX_PLAYERS = 16;
export const MAX_STR = 120;
export const DEFAULT_PRICE_EUR = 8; // por hora; usado cuando amount no llega

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Sanitiza un campo de texto para metadata/labels de Stripe/PayPal.
export function saneStr(v, max = MAX_STR) {
  if (v == null) return '';
  return String(v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

export function validEmail(v) {
  return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v.trim());
}

// Devuelve { cents } válido o { error }.
export function amountToCents(amount) {
  if (amount == null) return { cents: Math.round(DEFAULT_PRICE_EUR * 100) };
  const n = Number(amount);
  if (!Number.isFinite(n)) return { error: 'amount inválido' };
  const cents = Math.round(n * 100);
  if (cents < Math.round(MIN_AMOUNT_EUR * 100)) return { error: `importe mínimo ${MIN_AMOUNT_EUR} €` };
  if (cents > Math.round(MAX_AMOUNT_EUR * 100)) return { error: `importe máximo ${MAX_AMOUNT_EUR} €` };
  return { cents };
}

// Valida la lista de jugadores de split (bien formada, emails reales).
export function validPlayers(players) {
  const list = Array.isArray(players) ? players.filter(p => p && typeof p === 'object' && validEmail(p.email)) : [];
  if (list.length !== (Array.isArray(players) ? players.filter(p => p && typeof p === 'object').length : 0)) {
    return { error: 'algún email de jugador no es válido' };
  }
  if (list.length < 2) return { error: 'se necesitan al menos 2 jugadores' };
  if (list.length > MAX_PLAYERS) return { error: `máximo ${MAX_PLAYERS} jugadores` };
  return { list: list.map(p => ({ name: saneStr(p.name, 80) || '', email: p.email.trim().toLowerCase() })) };
}
