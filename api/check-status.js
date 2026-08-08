/**
 * api/check-status.js — Estado de pago de una Checkout Session de Stripe.
 * GET /api/check-status?id=cs_...
 * Devuelve { paid: boolean } cuando la sesión está pagada en Stripe (real).
 */

export default async function handler(req, res) {
  const sessionId = (req.query && req.query.id) || '';
  if (!sessionId) return res.status(400).json({ error: 'id required' });

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