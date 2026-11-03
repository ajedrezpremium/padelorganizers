# Aplicar migración de seguridad RLS — 2026-11-03 (Sprint 1)

**Prerequisito (Sprint 0):** `SUPABASE_SERVICE_ROLE_KEY` añadida en Vercel.

## Paso 1 — Ejecutar el SQL

> **CORRIENTE (2026-11-03)**: si al ejecutar una migración de octubre ves
> `policy ... already exists` (p.ej. `20261001000000_commercial_events.sql`),
> es porque esos archivos NO son idempotentes y ya se aplicaron en su día.
> Usa el catch-up nuevo y el orden siguiente. No ejecutes los file de octubre
> por su cuenta.

**Orden de ejecución:**

1. `supabase/migrations/20261103020000_octubre_catchup.sql` — crea (si no existen)
   `commercial_events` y `web_events`, y fija sus policies finales (idempotente).
2. `supabase/migrations/20261103000000_seguridad_rls.sql` (v2) — cierre de RLS del resto
   (idempotente: se puede repetir). Salta los bloques de tables que no existan.
3. Verificación (paso 3 de abajo).

## Paso 2 — Configurar el webhook de Stripe ( firma )

1. Stripe Dashboard → Developers → **Webhooks** → Add endpoint:
   - URL: `https://padelorganizers.vercel.app/api/webhook`
   - Evento: solo `checkout.session.completed`
2. Copia el **Signing secret** (`whsec_...`).
3. En Vercel: `vercel env add STRIPE_WEBHOOK_SECRET production`.
4. Redeploy.

> Con `STRIPE_WEBHOOK_SECRET` configurada, `api/webhook.js` rechaza (401) todo lo
> que no lleve firma HMAC válida y anti-replay de 5 min. Además mantiene la
> re-consulta a Stripe (livemode + paid) como segunda barrera.

## Paso 3 — Verificación (pegar en SQL Editor tras aplicarla)

```sql
-- Debe devolver 0 filas: ninguna policy anon sel elemento "for select ... using (true)"
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('commercial_leads','commercial_events','demo_requests')
  and 'anon' = any(roles);
```

```sql
-- Estado esperado por tabla (resumen):
select tablename, cmd, roles
from pg_policies
where schemaname='public'
order by tablename, cmd, roles;
```

## Qué cambia para la app (break intencional)

| Flujo | Antes | Después |
|---|---|---|
| Página pública /torneo/:key | lee `tournament_state` | **igual** (SELECT público se mantiene) |
| Organizador: sincronizar a la nube | funcionaba sin login | **requiere login** (RLS owner) |
| Organizador: lista de torneos en nube (dataService) | listaba TODO el mundo | ahora: solo con login; filtrar por dueño llega en Sprint 3 |
| Panel comercial (ComercialPanel) | datos con anon | **requiere login** del dueño |
| Demo web / avisos email | service_role vía api/ | **igual** (service_role bypasa RLS) |
| Reservas de pista, lista de espera, split cobros | igual | igual (anon insert/select/update de visitante se mantiene) |
| Editing masivo de torneo/estado con anon key | posible (agujero) | **bloqueado** |

## Si algo se rompe

- Un componente muestra error de *"row-level security"* o datos vacíos: el usuario
  ya no está logado → pedir login (AuthModal) en ese flujo. Avísame del componente
  para añadir el aviso de login si hace falta.
- Los torneos creados ANTES de la migración tienen `owner_id NULL`: el primer
  organizador autenticado que los edite se los apropia (política "claim").
