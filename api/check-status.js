/**
 * api/check-status.js — Estado de pago de una Checkout Session de Stripe.
 * GET /api/check-status?id=cs_...
 * Devuelve { paid: boolean } cuando la sesión está pagada en Stripe (real).
 *
 * Validación: el id debe tener el formato de una Checkout Session
 * (cs_live_/cs_test_ + 40+ alfanuméricos) — evita abusar el endpoint como
 * proxy genérico. Rate limit en memoria (por instancia) para frenar scraping.
 */

const RATE = new Map();
function allowRequest(ip) {
  const now = Date.now();
  const e = RATE.get(ip) || { c: 0, t: now + 60000 };
  if (now > e.t) { e.c = 0; e.t = now + 60000; }
  e.c += 1;
  RATE.set(ip, e);
  if (RATE.size > 3000) { for (const [k, v] of RATE) if (now > v.t) RATE.delete(k); }
  return e.c <= 30; // 30 comprobaciones/min por IP
}

const SESSION_ID_RE = /^cs_(live|test)_[A-Za-z0-9]{10,64}$/;

export default async function handler(req, res) {
  const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0]).trim()
    || (req.socket && req.socket.remoteAddress) || 'unknown';
  if (!allowRequest(ip)) return res.status(429).json({ error: 'too many requests' });

  const sessionId = String((req.query && req.query.id) || '').trim();
  if (!SESSION_ID_RE.test(sessionId)) {
    return res.status(400).json({ error: 'id inválido' });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return res.status(200).json({ paid: false, demo: true });

  try {
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const session = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'cannot verify session' });
    return res.status(200).json({
      paid: session.livemode === true && session.payment_status === 'paid',
      status: session.payment_status,
    });
  } catch (err) {
    return res.status(500).json({ error: err && err.message ? err.message : 'check error' });
  }
}
