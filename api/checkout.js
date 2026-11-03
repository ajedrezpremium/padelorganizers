/**
 * api/checkout.js — Función serverless de Vercel.
 * Crea un Checkout Session de Stripe para las reservas de pista.
 *
 * Reglas:
 *  - Si STRIPE_SECRET_KEY está configurada en Vercel -> crea sesión real y devuelve su URL.
 *  - Si NO hay clave -> devuelve { demo: true } para poder probar el flujo sin Stripe.
 *
 * La clave secreta de Stripe NUNCA vive en el cliente; solo aquí (serverless).
 */

import { amountToCents, saneStr } from './_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { court_name, day, slot_time, amount } = req.body || {};
  const amt = amountToCents(amount);
  if (amt.error) {
    return res.status(400).json({ error: amt.error });
  }
  const priceCh = amt.cents;
  const court = saneStr(court_name) || 'Pista';
  const dayS = saneStr(day, 40);
  const slot = saneStr(slot_time, 20);
  const label = `Reserva · ${court} · ${dayS} ${slot}`;

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(200).json({
      demo: true,
      url: null,
      message: 'Modo demostración: pasarela de pago no configurada. Reserva confirmada sin cargo.',
    });
  }

  try {
    const session = await stripeCheckoutCreate({
      priceCh, label, court_name: court, day: dayS, slot_time: slot,
    });
    return res.status(200).json({ demo: false, url: session.url, sessionId: session.id });
  } catch (err) {
    return res.status(500).json({ error: err && err.message ? err.message : 'checkout error' });
  }
}

// Llama a la API REST de Stripe (sin depender de paquete 'stripe' en el runtime)
async function stripeCheckoutCreate({ priceCh, label, court_name, day, slot_time }) {
  const origin = process.env.SITE_URL || 'https://padelorganizers.vercel.app';
  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', `${origin}/club?status=success&slot=${encodeURIComponent(slot_time || '')}`);
  params.append('cancel_url', `${origin}/club?status=cancelled`);
  params.append(
    'line_items[0][price_data][currency]', 'eur'
  );
  params.append(
    'line_items[0][price_data][product_data][name]', `Reserva de pista · ${court_name || 'Pista'}`
  );
  params.append(
    'line_items[0][price_data][product_data][description]', `${label}`
  );
  params.append('line_items[0][price_data][unit_amount]', String(priceCh));
  params.append('line_items[0][quantity]', '1');
  params.append('metadata[court_name]', court_name || '');
  params.append('metadata[day]', day || '');
  params.append('metadata[slot_time]', slot_time || '');

  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error && json.error.message ? json.error.message : 'stripe error');
  return json;
}