# Checklist de lanzamiento — PADEL ORGANIZERS

Fecha objetivo: lunes (próximo día laborable).
Estado: pre-lanzamiento. Flags ⬜ pendiente · ✅ listo · 🔴 bloqueante.

**Última actualización:** 15/08/2026 — promoción activa:

- ✅ Las 10 funciones core del MVP implementadas (`docs/mvp-10-funciones.md`).
- ✅ Comparativa "20 de 20" en la landing + docs (`docs/comparativa-mercado.md`).
- ✅ Captura de leads en la demo (`DemoLeadModal`, guarda email).
- ✅ Campaña email completada: **35 clubes** enviados (0 pendientes).
- ✅ WhatsApp: 30 clubes listos con el gancho 20/20.
- ✅ Redes creadas: IG `@padelorganizers`, LinkedIn `padel-organizers`, iconos en la landing.
- ⏳ Pendiente bloqueante para v1.1: dominio propio y pago de prueba real (webhook Stripe ya verificado).

---

## 1. Credenciales y configuración de entorno (Vercel + terceros)

| # | Tarea | Estado | Quién |
|---|-------|--------|-------|
| 1 | `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` (live) en Vercel | ✅ verificado en prod | Usuario |
| 2 | **Aplicar migración `20260808040000_split_payments.sql` en Supabase SQL Editor** | ✅ verificado: tabla accesible, insert/delete con `payment_method`/`paypal_order` OK | Usuario |
| 3 | **Rotar Google Client Secret** (expirado por filtración en chat) y actualizarlo en Supabase → Authentication → Google | ✅ rotado (pendiente test login) | Usuario |
| 4 | Confirmar `STRIPE_SECRET_KEY` live (no test) en Vercel | ✅ verificado en prod (clave presente en env Production) | Usuario |
| 5 | Configurar **webhook de Stripe** → `https://padelorganizers.vercel.app/api/webhook` (evento `checkout.session.completed`) | ✅ verificado en prod (endpoint responde y re-verifica sesiones reales; pendiente solo pago real de prueba) | Usuario |
| 6 | URL de autorización de Google OAuth en Supabase = dominio canónico (https / sin www) | ⬜ | Usuario |

## 2. Correcciones de código aplicadas este sprint

| # | Cambio | Estado |
|---|--------|--------|
| 1 | PayPal split: captura **siempre** con token (antes se saltaba con `split=1` → orden sin capturar) | ✅ desplegado |
| 2 | Header: botón `+ Torneo` (icono + tooltip), eliminado "Demo Gratuita" | ✅ |
| 3 | Hero subido ~36px → botón CTA visible sin scroll | ✅ |
| 4 | Cohete duplicado eliminado en CTA (4 idiomas) | ✅ |
| 5 | Landing: comparativa **20 funciones** vs 4 competidores reales (Playtomic, MATCHi, Padel Mates, Padel Manager) con badge "20 de 20" | ✅ desplegado |
| 6 | `payment_url` guardado por split PayPal → panel reorganizado con botón copiar por jugador | ✅ compile OK |
| 7 | Captura de leads: modal al pulsar "Probar Demo" (email + perfil, 4 idiomas) guarda el lead y da acceso a la demo | ✅ desplegado |
| 8 | Iconos de Instagram y LinkedIn en el footer de la landing | ✅ desplegado |
| 9 | Ficha de jugador: foto, bandera, instagram, estilo, edad, altura en ranking público y perfil | ✅ desplegado |
| 10 | LiveScore Pro + tarjeta social con los 4 jugadores (foto + bandera) | ✅ desplegado |

## 3. QA funcional (probar en prod antes del lanzamiento)

Flujo crítico (jugador):
- [ ] Reservar pista con **Stripe** (single, monto pequeño) → verificar webhook confirma `completed`
- [ ] Reservar pista con **PayPal** (single) → completar pago en PayPal sandbox/live → volver → reserva `completed`
- [ ] Pago **dividido** (2 jugadores, PayPal): pagar ambos links → reserva solo `completed` cuando ambos paguen
- [ ] Pago dividido (Stripe): mismo check
- [ ] Login email + **Login con Google** (requiere secret rotado, #3)

Flujo organizador:
- [ ] Crear torneo, inscribir jugadores, generar cuadro
- [ ] Crear reserva desde el dashboard
- [ ] Ver estado de splits pagados en el panel

Flujo escuela/técnico:
- [x] Alta de alumno, grupo, asistencia, cobro recurrente (**v1.1**: suscripciones + facturas por mes implementadas)

Calidad:
- [ ] En los 4 idiomas (ES/EN/FR/PT) — comprobar al menos la compra y el chat IA
- [ ] Mobile: header responsive, tabla comparativa scrolleable
- [ ] IA PadelCoach responde (modelo free) y voz STT/TTS

## 4. DNS / dominio

- [ ] `padelorganizers.com` → Vercel (A/namecheap + CNAME www). Verificar HTTPS.
- [ ] Redirección `www` → raíz o viceversa (301)
- [ ] `VITE_SUPABASE_URL`/`ANON_KEY` sin dominio de preview (apuntan a prod)
- [ ] URLs absolutas en `return_url` de PayPal apuntan al dominio final

## 5. Legal y confianza

- [ ] Revisar `/legal` (aviso legal + cookies) con datos reales del titular
- [ ] Política de privacidad conforme RGPD (formularios, cookies, datos de pago)

## 6. Lanzamiento mismo día

- [x] Demo gratis: capturar email de los organizadores que la prueban (**modal de lead desplegado**)
- [x] Invitar a los 3-4 clubes de la ciudad (**campaña email completada: 35 clubes + WhatsApp 30 clubes**)
- [x] Anuncio: material listo para redes (IG/LinkedIn creadas, posts del "20 de 20" en `docs/redes-crear-cuentas.md`)
- [ ] Monitor: `vercel logs` y revisar errores de captura PayPal / webhook Stripe tras 1h
- [ ] Publicar el primer post "20 de 20" en IG y LinkedIn (textos listos)
- [ ] Anuncio en grupos WhatsApp locales con el link único `padelorganizers.com`

---

## Decisión rápida si algo falla (rollback)

- Deploy anterior en Vercel: `vercel rollback` (Vercel CLI) devuelve la última estable.
- PayPal captura fallaba → la reserva queda `pending`; el jugador puede reintentar (order nuevo).
- Webhook Stripe no responde → reentrar en `Dashboard` la session manual puede marcarse.

---

## Notas

- La migración #2 es **bloqueante** para splits en BD: sin ella, `insert reservation_splits`
  fallará en Supabase (columnas `payment_method`/`paypal_order` no existen). La web aplica
  demo/localStorage como fallback (modo sin cloud), pero en producción hay que aplicar el SQL.
- Google OAuth #3: el Client Secret filitrado debe regenerarse en Google Cloud Console y
  sustituirse en Supabase; el Client ID `29623631984-...` sigue válido.
- **15/08/2026:** aplicadas y verificadas las migraciones `20260816090000_coach_discovery.sql`
  (columnas `level`/`hourly_rate` en coaches) y `20260816120000_newsletter_subscribers.sql`
  (tabla de suscriptores). Backend core (profiles, clubes, matches, players, reservation_splits,
  league_entries, school_invoices, school_drills) respondiendo en Supabase.
- **Campaña email:** límite diario de Gmail reseteado el 15/08; 35 envíos completados (0 pendientes).