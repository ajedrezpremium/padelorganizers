/**
 * api/checkout-subscription.js — Stripe Checkout en modo subscription.
 * Crea sesión para Starter 29€/mes o Pro 49€/mes con 3 meses gratis (trial).
 * Si no hay STRIPE_SECRET_KEY → demo:true.
 */

const PLANS = {
  starter: { name: 'PADELORGANIZERS Starter', amount: 2900, trialDays: 90 },
  pro: { name: 'PADELORGANIZERS Pro', amount: 4900, trialDays: 90 },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const { plan = 'pro', email } = req.body || {};
  const cfg = PLANS[plan] || PLANS.pro;

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(200).json({ demo: true, url: null, message: 'Modo demo: Stripe no configurado. Suscripción simulada.' });
  }

  const origin = process.env.SITE_URL || 'https://padelorganizers.vercel.app';
  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('success_url', `${origin}/lanzamiento?checkout=success&plan=${plan}`);
  params.append('cancel_url', `${origin}/lanzamiento?checkout=cancel`);
  params.append('line_items[0][price_data][currency]', 'eur');
  params.append('line_items[0][price_data][product_data][name]', cfg.name);
  params.append('line_items[0][price_data][product_data][description]', `Plan ${plan} — ${cfg.amount / 100}€/mes tras ${cfg.trialDays} días gratis`);
  params.append('line_items[0][price_data][unit_amount]', String(cfg.amount));
  params.append('line_items[0][price_data][recurring][interval]', 'month');
  params.append('line_items[0][quantity]', '1');
  params.append('subscription_data[trial_period_days]', String(cfg.trialDays));
  if (email) { params.append('customer_email', email); params.append('metadata[email]', email); }
  params.append('metadata[plan]', plan);
  params.append('allow_promotion_codes', 'true');

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json.error?.message || 'stripe error');
    return res.status(200).json({ demo: false, url: json.url, sessionId: json.id });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'checkout error' });
  }
}
