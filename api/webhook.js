/**
 * api/webhook.js — Confirmación de pago Stripe (webhook) para reservas de pista.
 *
 * En lugar de depender de la firma del webhook (frágil en serverless por el
 * cuerpo crudo), este endpoint RECONSULTA la sesión de Stripe para confirmar
 * que el pago es real y ha sido completado. Así:
 *   - Un atacante no puede marcar reservas como pagadas sin una sesión
 *     realmente cobrada en Stripe (livemode=true, payment_status=paid).
 *   - No requiere paquete 'stripe' ni firma del body.
 *
 * Cuando recibe el evento `checkout.session.completed`, marca la reserva cuyo
 * `stripe_session` coincide como `completed` en Supabase (vía REST + anon key).
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  // Cuerpo típico de un webhook de Stripe: { type, data: { object: { id } } }
  const event = req.body || {};
  const type = event.type || '';
  const sessionId = (event.data && event.data.object && event.data.object.id) || '';

  if (type !== 'checkout.session.completed' || !sessionId) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY;

  if (!secret || !supabaseUrl || !supabaseAnon) {
    return res.status(500).json({ error: 'server misconfigured' });
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
      return await handleSplitPayment({ supabaseUrl, supabaseAnon, sessionId, res, session });
    }

    // 3) Pago normal: marcar la reserva con ese stripe_session como 'completed'.
    const patch = await fetch(
      `${supabaseUrl}/rest/v1/reservations?stripe_session=eq.${encodeURIComponent(sessionId)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: supabaseAnon,
          Authorization: `Bearer ${supabaseAnon}`,
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
async function handleSplitPayment({ supabaseUrl, supabaseAnon, sessionId, res }) {
  // 1) Buscar el split cuyo stripe_session coincide.
  const find = await fetch(
    `${supabaseUrl}/rest/v1/reservation_splits?stripe_session=eq.${encodeURIComponent(sessionId)}&select=id,reservation_id`,
    {
      headers: { apikey: supabaseAnon, Authorization: `Bearer ${supabaseAnon}` },
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
        apikey: supabaseAnon,
        Authorization: `Bearer ${supabaseAnon}`,
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
      headers: { apikey: supabaseAnon, Authorization: `Bearer ${supabaseAnon}` },
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
        apikey: supabaseAnon,
        Authorization: `Bearer ${supabaseAnon}`,
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