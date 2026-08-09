/**
 * api/paypal-order.js — Crea una orden de pago de PayPal (Orders v2).
 *
 * Soporta dos modos:
 *  - single: una reserva normal → 1 orden por el total.
 *  - split: 1 reserva → N órdenes (una por jugador, parte = total / N),
 *    con metadata custom_id para identificar el split al confirmar.
 *
 * La clave NUNCA vive en el cliente: se lee de PAYPAL_CLIENT_ID /
 * PAYPAL_CLIENT_SECRET (solo Vercel). Sin claves → { demo: true } sin cargo.
 */

const DEFAULT_PRICE = 8; // EUR por hora

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { court_name, day, slot_time, amount, players, split } = req.body || {};
  const totalEur = Number(amount) || DEFAULT_PRICE;

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(200).json({ demo: true, message: 'Modo demostración: PayPal no configurado. Sin cargo.' });
  }

  try {
    const token = await paypalToken();
    const origin = process.env.SITE_URL || 'https://padelorganizers.vercel.app';

    if (split) {
      const list = Array.isArray(players) ? players.filter(p => p && p.email) : [];
      if (list.length < 2) {
        return res.status(400).json({ error: 'se necesitan al menos 2 jugadores' });
      }
      const shareEur = (Math.round((totalEur * 100) / list.length) / 100).toFixed(2);
      const payments = [];
      for (let i = 0; i < list.length; i++) {
        const o = await paypalCreateOrder({
          token,
          amount: shareEur,
          meta: { court_name, day, slot_time, split: '1', split_index: i },
          origin,
        });
        payments.push({ index: i, name: list[i].name, email: list[i].email, amount: Number(shareEur), id: o.id, url: o.approveUrl });
      }
      return res.status(200).json({ demo: false, split: true, payments });
    }

    const o = await paypalCreateOrder({
      token,
      amount: totalEur.toFixed(2),
      meta: { court_name, day, slot_time },
      origin,
    });
    return res.status(200).json({ demo: false, id: o.id, url: o.approveUrl });
  } catch (err) {
    return res.status(500).json({ error: err && err.message ? err.message : 'paypal order error' });
  }
}

// OAuth 2.0 client_credentials → access token de PayPal.
async function paypalToken() {
  const r = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error_description || json.message || 'paypal token error');
  return json.access_token;
}

// Crea una Order v2 de PayPal (intent CAPTURE). Devuelve { id, approveUrl }.
async function paypalCreateOrder({ token, amount, meta, origin }) {
  const detail = meta.split === '1'
    ? `${meta.court_name || 'Pista'} · ${meta.day || ''} · parte ${Number(meta.split_index) + 1}`
    : `${meta.court_name || 'Pista'} · ${meta.day || ''} ${meta.slot_time || ''}`.trim();

  const r = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'EUR', value: amount },
        description: `Reserva · ${detail}`,
        custom_id: JSON.stringify(meta),
      }],
      application_context: {
        brand_name: 'PadelOrganizers',
        user_action: 'PAY_NOW',
        return_url: `${origin}/club?status=success${meta.split === '1' ? '&split=1' : ''}`,
        cancel_url: `${origin}/club?status=cancelled${meta.split === '1' ? '&split=1' : ''}`,
      },
    }),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.message || 'paypal order error');
  const approve = json.links && json.links.find(l => l.rel === 'approve');
  return { id: json.id, approveUrl: approve ? approve.href : null };
}