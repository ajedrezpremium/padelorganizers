/**
 * api/paypal-capture.js — Captura y confirma una orden de PayPal.
 *
 * PayPal redirige al usuario de vuelta a `?status=success&token=ORDERID`
 * tras aprobar. Este endpoint:
 *  1) Recupera la orden en PayPal y la CAPTURA (si aún no capturada).
 *  2) Verifica que quedó COMPLETED.
 *  3) Usa el custom_id/metadata de la orden para marcar en Supabase:
 *       - split  → marca el reservation_split como 'paid' (+ paid_at) y,
 *                  si todos los splits están pagados, completa la reserva.
 *       - single → marca la reserva cuyo payment_ref coincide como 'completed'.
 *
 * La clave PayPal y las de Supabase se leen SOLO del servidor (Vercel env).
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { order_id, token } = req.body || {};
  const orderId = order_id || token || (req.query && req.query.token);

  if (!orderId) return res.status(400).json({ error: 'order_id required' });

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY;

  if (!clientId || !clientSecret) {
    return res.status(200).json({ demo: true, confirmed: false, message: 'PayPal no configurado' });
  }

  try {
    const accessToken = await paypalToken(clientId, clientSecret);

    // 1) Capturar la orden (idempotente: si ya está COMPLETED no vuelve a cobrar).
    const capture = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    const capJson = await capture.json();

    // PayPal devuelve 422 si ya está capturada → recuperar estado.
    if (!capture.ok && capJson.details && capJson.details.some(d => /already captured|ORDER_ALREADY_CAPTURED/i.test(d.description || ''))) {
      const state = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const stJson = await state.json();
      if (stJson.status !== 'COMPLETED') {
        return res.status(200).json({ ok: true, confirmed: false, status: stJson.status });
      }
      return await confirmOrder({ orderId, stJson, supabaseUrl, supabaseAnon, res });
    }

    if (!capture.ok) {
      const msg = capJson.message || `paypal capture error ${capture.status}`;
      return res.status(502).json({ error: msg });
    }
    if (capJson.status !== 'COMPLETED') {
      return res.status(200).json({ ok: true, confirmed: false, status: capJson.status });
    }

    return await confirmOrder({ orderId, capJson, supabaseUrl, supabaseAnon, res });
  } catch (err) {
    return res.status(500).json({ error: err && err.message ? err.message : 'paypal capture error' });
  }
}

// Marca la reserva/split como pagado en Supabase según la metadata de la orden.
async function confirmOrder({ orderId, capJson, supabaseUrl, supabaseAnon, res }) {
  if (!supabaseUrl || !supabaseAnon) {
    return res.status(500).json({ error: 'server misconfigured' });
  }

  // custom_id guardamos como JSON con { court_name, day, slot_time, split?, split_index? }
  const unit = capJson.purchase_units && capJson.purchase_units[0];
  let meta = {};
  try {
    meta = unit && unit.custom_id ? JSON.parse(unit.custom_id) : {};
  } catch { /* meta vacía */ }

  const isSplit = meta.split === '1';
  const h = {
    apikey: supabaseAnon,
    Authorization: `Bearer ${supabaseAnon}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };

  if (isSplit) {
    // Encontrar el split cuyo paypal_order coincide.
    const paypalField = 'paypal_order';
    const find = await fetch(
      `${supabaseUrl}/rest/v1/reservation_splits?paypal_order=eq.${encodeURIComponent(orderId)}&select=id,reservation_id`,
      { headers: h }
    );
    if (!find.ok) return res.status(502).json({ ok: false, error: 'split lookup failed' });
    const splits = await find.json();
    if (!splits.length) return res.status(200).json({ ok: true, confirmed: false, reason: 'no split match' });

    const splitId = splits[0].id;
    const reservationId = splits[0].reservation_id;

    const patchSplit = await fetch(`${supabaseUrl}/rest/v1/reservation_splits?id=eq.${splitId}`, {
      method: 'PATCH', headers: h,
      body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString() }),
    });
    if (!patchSplit.ok) return res.status(502).json({ ok: false, error: 'split update failed' });

    const pending = await fetch(
      `${supabaseUrl}/rest/v1/reservation_splits?reservation_id=eq.${reservationId}&status=eq.pending&select=id`,
      { headers: h }
    );
    const pend = pending.ok ? await pending.json() : [];
    if (pend.length) return res.status(200).json({ ok: true, confirmed: false, waiting: true, orderId });

    const patchRes = await fetch(`${supabaseUrl}/rest/v1/reservations?id=eq.${reservationId}`, {
      method: 'PATCH', headers: h,
      body: JSON.stringify({ status: 'completed' }),
    });
    if (!patchRes.ok) return res.status(502).json({ ok: false, error: 'reservation complete failed' });
    return res.status(200).json({ ok: true, confirmed: true, split: true, orderId });
  }

  // Pago normal: buscar la reserva pendiente por su paypal_order.
  const patch = await fetch(
    `${supabaseUrl}/rest/v1/reservations?paypal_order=eq.${encodeURIComponent(orderId)}`,
    { method: 'PATCH', headers: h, body: JSON.stringify({ status: 'completed' }) }
  );
  if (!patch.ok) {
    const txt = await patch.text();
    return res.status(502).json({ ok: false, error: 'update failed', detail: txt });
  }
  return res.status(200).json({ ok: true, confirmed: true, orderId });
}

async function paypalToken(clientId, clientSecret) {
  const r = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error_description || json.message || 'paypal token error');
  return json.access_token;
}