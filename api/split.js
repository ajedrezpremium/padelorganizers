/**
 * api/split.js — Split Payments: 1 reserva → N links de pago (uno por jugador).
 *
 * Crea una Checkout Session de Stripe por jugador, cada una con su parte
 * (total / nº jugadores). El frontend envía cada link a su jugador; cuando
 * TODOS pagan, el webhook confirma la reserva completa.
 *
 * Reglas:
 *  - Si STRIPE_SECRET_KEY está configurada en Vercel -> crea sesiones reales.
 *  - Si NO -> devuelve { demo: true } con URLs nulas para probar sin Stripe.
 */

import { amountToCents, saneStr, validPlayers } from './_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { court_name, day, slot_time, amount, players } = req.body || {};
  const totalEur = amountToCents(amount);
  if (totalEur.error) {
    return res.status(400).json({ error: totalEur.error });
  }
  const pl = validPlayers(players);
  if (pl.error) {
    return res.status(400).json({ error: pl.error });
  }
  const list = pl.list;
  const court = saneStr(court_name) || 'Pista';
  const dayS = saneStr(day, 40);
  const slot = saneStr(slot_time, 20);

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(200).json({
      demo: true,
      url: null,
      payments: list.map((p, i) => ({
        index: i,
        name: p.name,
        email: p.email,
        amount: Math.round((totalEur.cents / 100 / list.length) * 100) / 100,
        url: null,
        sessionId: null,
      })),
      message: 'Modo demostración: pasarela no configurada. Sin cargo.',
    });
  }

  try {
    const payments = [];
    const shareCent = Math.floor((totalEur.cents) / list.length);

    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      const session = await stripeSplitCreate({
        amountCent: shareCent,
        label: `${(shareCent / 100).toFixed(2)} € · ${court} · ${dayS} ${slot}`,
        court_name: court, day: dayS, slot_time: slot,
        index: i, name: p.name, email: p.email,
      });
      payments.push({
        index: i,
        name: p.name,
        email: p.email,
        amount: shareCent / 100,
        url: session.url,
        sessionId: session.id,
      });
    }

    return res.status(200).json({ demo: false, payments });
  } catch (err) {
    return res.status(500).json({ error: err && err.message ? err.message : 'split error' });
  }
}

async function stripeSplitCreate({ amountCent, label, court_name, day, slot_time, index, name, email }) {
  const origin = process.env.SITE_URL || 'https://padelorganizers.vercel.app';
  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', `${origin}/club?status=success&split=1&slot=${encodeURIComponent(slot_time || '')}`);
  params.append('cancel_url', `${origin}/club?status=cancelled&split=1`);
  params.append('line_items[0][price_data][currency]', 'eur');
  params.append('line_items[0][price_data][product_data][name]', `Reserva dividida · ${court_name || 'Pista'}`);
  params.append('line_items[0][price_data][product_data][description]', `${label} (parte ${index + 1})`);
  params.append('line_items[0][price_data][unit_amount]', String(amountCent));
  params.append('line_items[0][quantity]', '1');
  params.append('metadata[court_name]', court_name || '');
  params.append('metadata[day]', day || '');
  params.append('metadata[slot_time]', slot_time || '');
  params.append('metadata[split]', '1');
  params.append('metadata[split_index]', String(index));
  params.append('metadata[player_email]', email || '');

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
