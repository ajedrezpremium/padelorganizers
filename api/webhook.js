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

    // 2) Marcar la reserva con ese stripe_session como 'completed'.
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