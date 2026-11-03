/**
 * api/_lib/stripeSignature.js — Verificación de firma de webhooks de Stripe
 * sin el paquete oficial (node:crypto puro).
 *
 * Formato de la cabecera `stripe-signature`:
 *   t=<unix_ts>,v1=<hex_hmac>[,v1=<hex_hmac2>...]
 * Firma esperada = HMAC-SHA256(secret, `${t}.${cuerpo_crudo}`)
 * Incluye tolerancia anti-replay (por defecto 5 min).
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyStripeSignature(rawBody, header, secret, toleranceSec = 300) {
  if (!rawBody || !header || !secret) return false;
  const parts = {};
  for (const piece of String(header).split(',')) {
    const i = piece.indexOf('=');
    if (i === -1) continue;
    const k = piece.slice(0, i).trim();
    const v = piece.slice(i + 1).trim();
    (parts[k] = parts[k] || []).push(v);
  }
  const t = parts.t && parts.t[0];
  if (!t || !parts.v1 || !parts.v1.length) return false;

  // Anti-replay: el timestamp no debe desviarse de la hora actual
  const ts = parseInt(t, 10);
  if (!Number.isFinite(ts)) return false;
  const age = Math.abs(Date.now() / 1000 - ts);
  if (age > toleranceSec) return false;

  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  // timing-safe contra todos los v1 entregados (cualquiera válido sirve)
  for (const sig of parts.v1) {
    let got;
    try {
      got = Buffer.from(String(sig), 'hex');
    } catch {
      continue;
    }
    if (got.length === expectedBuf.length && timingSafeEqual(got, expectedBuf)) {
      return true;
    }
  }
  return false;
}
