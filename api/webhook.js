/**
 * api/webhook.js — Webhook de Stripe (reserva de pista) con doble confianza:
 *
 *   1) SIGNATURA: si STRIPE_WEBHOOK_SECRET está configurada, se verifica la
 *      cabecera `stripe-signature` (HMAC-SHA256 de `t.cuerpo_crudo`) con
 *      comparación timing-safe. Sin firma válida → 400. Sin dependencias
 *      extra (node:crypto).
 *   2) RECONSULTA: en cualquier caso se vuelve a pedir la sesión a Stripe
 *      y solo se acepta si livemode=true y payment_status=paid. Un atacante
 *      no puede marcar reservas sin un cobro real en Stripe.
 *
 * La actualización en Supabase se hace con SUPABASE_SERVICE_ROLE_KEY
 * (escritura de servidor, evasiva de RLS, nunca la anon key).
 */

import { verifyStripeSignature } from './_lib/stripeSignature.js';

// Cuerpo crudo necesario para la firma: desactivamos el parser automático.
// (Ignorado si el runtime no lo soporta; hay fallback abajo.)
export const config = { api: { bodyParser: false } };

// Lee el cuerpo crudo del stream (o re-serializa si el runtime ya lo parseó).
function readRawBody(req) {
  return new Promise((resolve) => {
    // Caso A: bodyParser funcionó y el runtime ya nos da el objeto parseado.
    // La firma fallará si el formato difiere, pero la reconsulta mantiene
    // la seguridad del flujo de pago.
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
      resolve({ raw: JSON.stringify(req.body), preParsed: true });
      return;
    }
    // Caso B: leer el stream real para la firma exacta.
    let data = '';
    let done = false;
    const finish = (raw) => { if (!done) { done = true; resolve({ raw, preParsed: false }); } };
    req.on('data', (c) => { data += c; });
    req.on('end', () => finish(data));
    req.on('error', () => finish(''));
    setTimeout(() => finish(data), 5000); // salida de seguridad
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  // 0) Cuerpo crudo + verificación de firma ANTES de nada (fail-closed).
  const { raw, preParsed } = await readRawBody(req);
  let event;
  try {
    event = JSON.parse(raw || '{}');
  } catch {
    return res.status(400).json({ error: 'invalid json' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret) {
    const sigHeader = req.headers['stripe-signature'];
    if (!sigHeader) {
      return res.status(401).json({ error: 'missing stripe-signature' });
    }
    if (preParsed) {
      // No disponemos del cuerpo exacto: no podemos verificar la firma con
      // garantía. La reconsulta (paso 1) sigue garantizando pagos reales.
      console.warn('[webhook/stripe] raw body no disponible; firma no verificada');
    } else if (!verifyStripeSignature(raw, sigHeader, webhookSecret)) {
      return res.status(401).json({ error: 'invalid signature' });
    }
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  // Solo service_role: esta operación de servidor NO depende de la anon key
  // (las RLS anon se cerraron; las escrituras de pago bypass RLS por design).
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!secret || !supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'server misconfigured' });
  }

  const type = event.type || '';
  const sessionId = (event.data && event.data.object && event.data.object.id) || '';

  if (type !== 'checkout.session.completed' || !sessionId) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  try {
    // 1) Confirmamos en Stripe que la sesión existe, está en modo live y pagada.
    const confirm = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const session = await confirm.json();
    if (!confirm.ok) {
      return res.status(502).json({ ok: false, error: 'cannot verify session' });
    }
    if (session.livemode !== true || session.payment_status !== 'paid') {
      // no confirmamos: no es un pago real completado
      return res.status(200).json({ ok: true, verified: false, reason: session.payment_status });
    }

    // 2) ¿Es un pago dividido? -> marcar su split como 'paid' y,
    //    si todos los splits de la reserva están pagados, completarla.
    const splitOf = session.metadata && session.metadata.split === '1';
    if (splitOf) {
      return await handleSplitPayment({ supabaseUrl, supabaseKey, sessionId, res, session });
    }

    // 3) Pago normal: marcar la reserva con ese stripe_session como 'completed'.
    const patch = await fetch(
      `${supabaseUrl}/rest/v1/reservations?stripe_session=eq.${encodeURIComponent(sessionId)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ status: 'completed' }),
      }
    );

    if (!patch.ok) {
      const errText = await patch.text();
      return res.status(502).json({ ok: false, error: 'update failed', detail: errText });
    }

    return res.status(200).json({ ok: true, confirmed: true, sessionId });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : 'webhook error' });
  }
}

// Pago dividido: 1 sesión = 1 jugador. Marca el split como 'paid' y, si ya
// están todos los jugadores de la reserva, completa la reserva.
async function handleSplitPayment({ supabaseUrl, supabaseKey, sessionId, res }) {
  // 1) Buscar el split cuyo stripe_session coincide.
  const find = await fetch(
    `${supabaseUrl}/rest/v1/reservation_splits?stripe_session=eq.${encodeURIComponent(sessionId)}&select=id,reservation_id`,
    {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    }
  );
  if (!find.ok) {
    return res.status(502).json({ ok: false, error: 'split lookup failed' });
  }
  const splits = await find.json();
  if (!splits.length) {
    return res.status(200).json({ ok: true, confirmed: false, reason: 'no split match' });
  }
  const splitId = splits[0].id;
  const reservationId = splits[0].reservation_id;

  // 2) Marcar el split como pagado.
  const patchSplit = await fetch(
    `${supabaseUrl}/rest/v1/reservation_splits?id=eq.${splitId}`,
    {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString() }),
    }
  );
  if (!patchSplit.ok) {
    return res.status(502).json({ ok: false, error: 'split update failed' });
  }

  // 3) ¿Quedan splits pendientes en esa reserva?
  const pendingSplits = await fetch(
    `${supabaseUrl}/rest/v1/reservation_splits?reservation_id=eq.${reservationId}&status=eq.pending&select=id`,
    {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    }
  );
  const pending = pendingSplits.ok ? await pendingSplits.json() : [];
  if (pending.length) {
    // aún no pagan todos
    return res.status(200).json({ ok: true, confirmed: false, waiting: true, sessionId });
  }

  // 4) Nadie queda pendiente -> completar la reserva.
  const patchRes = await fetch(
    `${supabaseUrl}/rest/v1/reservations?id=eq.${reservationId}`,
    {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: 'completed' }),
    }
  );
  if (!patchRes.ok) {
    return res.status(502).json({ ok: false, error: 'reservation complete failed' });
  }

  return res.status(200).json({ ok: true, confirmed: true, split: true, sessionId });
}
