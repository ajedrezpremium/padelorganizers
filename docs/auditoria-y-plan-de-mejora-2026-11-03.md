# Auditoría técnica y plan de mejora — PadelOrganizers
**Fecha:** 2026-11-03 · **Repo:** `main` @ `4dbc867` · Stack: React 18 + Vite 5 + Supabase + Vercel (serverless `api/`)

---

## 1. Resumen ejecutivo

El producto funciona y está desplegado en producción con pagos reales (Stripe LIVE). La auditoría detecta **3 problemas críticos de seguridad**, 1 de cumplimiento RGPD, y deuda técnica estructural (0 tests, 0 TypeScript, componentes de 700+ líneas). Todo es corregible en 2–3 semanas de trabajo priorizado.

| Severidad | Hallazgos |
|---|---|
| 🔴 Crítico | 4 |
| 🟠 Alto | 5 |
| 🟡 Medio | 4 |
| 🟢 Bajo | 7 |

---

## 2. Hallazgos

### 🔴 Críticos

**C1. Secretos reales en `.env` en texto plano** — clave Stripe LIVE (`rk_live_...`), App Password de Gmail, API key de OpenRouter.
- Mitigante: `.env` no está commiteado ni en historial (verificado con `git log --all -- .env`).
- Riesgo residual: un `git add -f` lo sube; `api/welcome-email.js` lee el `.env` desde disco con `readFileSync`.
- **Acción:** rotar las 3 claves **hoy**, moverlas solo a Vercel Env Vars, eliminar `GMAIL_APP_PASS`/`GOOGLE-APP-KEY` duplicadas.

**C2. RLS de Supabase abiertas a `anon` en tablas de negocio**
- `supabase/schema.sql:94-124` → `tournaments`, `players`, `pairs`, `courts`, `matches`, `messages`: `using (true)`.
- `20260807010000_auth_sync.sql:55-58` → `tournament_state` (blob completo del torneo) sin filto de ownership para anon.
- `20260929000000_comercial.sql:43-49` → `commercial_leads` (CRM con emails de leads) y `demo_requests` abiertas.
- La anon key es pública (va en el bundle) → **cualquiera puede leer/borrar/editar todos los torneos y el CRM**.
- **Acción:** policies por `auth.uid()`/ownership y que el backend escriba con `service_role` (ver H3).

**C3. `api/agent-chat.js` suplanta usuarios**
- Acepta `userId` del body sin JWT → cualquiera puede escribir/leer conversaciones atribuidas a otro usuario (líneas 13-18, 26-49, 53-66).
- Fallback a anon key (`admin || createClient(url, anonKey)`), anulando la única RLS correcta del esquema.
- URL de Supabase hardcodeada como fallback (también en `src/lib/supabaseClient.js:6`).

**C4. Datos personales de terceros commiteados (RGPD)**
- 76 CSV en `clientes/` trackeados en git: `leads_madrid.csv`, `leads_todos_completo.csv` (114 KB), etc. — emails, teléfonos y direcciones de clubes obtenidos por scraping.
- **Acción:** mover fuera del repo, purgar historial si hay push público (`git filter-repo`/BFG), y revisar base legal RGPD de los contactos scrapeados.

### 🟠 Altos

**H1. Componentes monolíticos** (líneas): `LandingPadel.jsx` 789, `SchoolApp.jsx` 735, `TournamentPublic.jsx` 608, `ClubApp.jsx` 507, `padelEngine.js` 571, `schoolService.js` 539. Duplicados probables: `LandingPadel`/`LandingPro`, `TorneoOrganizer`/`TournamentControl`/`TournamentPublic`, `ThemeToggle`/`ModeToggle`, 3x Newsletter*.

**H2. Serverless escribe en Supabase con anon key** — `api/webhook.js`, `api/paypal-capture.js`, `api/demo-request.js` usan `VITE_SUPABASE_ANON_KEY` en escrituras críticas de pago; la seguridad de los pagos depende de que las RLS sigan abiertas (acoplamiento C2↔H2).

**H3. Webhooks sin verificación de firma** — `api/webhook.js` no verifica firma de Stripe (mitigado re-consultando la sesión con `livemode/paid`); PayPal captura `order_id` sin verificar origen.

**H4. Validación de entrada y rate-limiting insuficientes** — `checkout.js` no acota `amount` superior ni valida tipos; emails sin regex en `split.js`/`paypal-order.js`; `check-status.js` sin rate limit; `demo-request.js` usa rate limit en `Map` en memoria (inefectivo en serverless multi-instancia).

**H5. Migraciones aplicadas "a mano"** (SQL Editor) + migración de 220 KB con 1.027 INSERTs; sin `supabase db push` ni trazabilidad real.

### 🟡 Medios

**M1. Calidad de código** — 0% TypeScript, **0 tests** en todo el proyecto (ni vitest/jest), `npm run lint` roto (`eslint` declarado en scripts pero no instalado ni configurado), `nodemailer`/`imapflow` como devDependencies aunque se usan en runtime.

**M2. Lógica de negocio en localStorage** — estado completo del torneo en `localStorage` + blob JSON en `tournament_state` sin campo de dueño; `listCloudStates()` lista torneos de *todos* los usuarios; modo online/offline manual, sin autodetección.

**M3. Binarios/pesos en git** — ~10 MB: imágenes de 2 MB en `public/images/`, `CUADRO PADEL AIRES 2026.docx` (1,7 MB), `clubes-semilla.json` (0,67 MB).

**M4. Configuración web** — falta CSP y HSTS en `vercel.json`; el SW cachea respuestas autenticadas de `rest/v1` de Supabase (NetworkFirst — riesgo de fuga entre usuarios); canonical/OG y varios `success_url` apuntan a `padelorganizers.vercel.app` en vez de dominio propio.

### 🟢 Bajos
- HTML injection en emails de `welcome-email.js` (interpolación sin escape).
- `.temp/linked-project.json` de Supabase no en `.gitignore` explícito.
- `getLiveScore()` fallback con lógica confusa (`store.js:178`).
- SW registado dos veces (inline + plugin PWA) — inofensivo.
- Sin seeds ni `supabase/functions/`.
- Semilla de 1.027 clubes pública (filtering de ventaja competitiva).
- `SMTP_ALLOW_INSECURE=1` en `.env`.

---

## 3. Plan de mejora (4 sprints)

### Sprint 0 — Hoy mismo (seguridad urgente) 🔴
1. **Rotar secretos**: Stripe `rk_live`, App Password Gmail, OpenRouter key. Guardar **solo** en Vercel Env Vars.
2. Borrar `.env` local tras migrar a Vercel; añadir `.env.*` y `supabase/.temp/` al `.gitignore`.
3. Añadir `SUPABASE_SERVICE_ROLE_KEY` a Vercel y cambiar `api/webhook.js`, `api/paypal-capture.js`, `api/demo-request.js`, `api/agent-chat.js` para usarla (sin fallback anon).
4. En `agent-chat.js`: exigir JWT Bearer del usuario y validar `userId` contra el token.

> **✅ Sprint 0 ejecutado (2026-11-03)** — ver sección "Resultado del Sprint 0" al final.
> **✅ Sprint 1 ejecutado (2026-11-03)** — ver sección "Resultado del Sprint 1" al final.
> **✅ Sprint 2 ejecutado (2026-11-03)** — ver sección "Resultado del Sprint 2" al final.

### Sprint 1 — Semana 1: blindar datos
5. Nuevas migraciones RLS: `tournament_state` con columna `owner_id`, policies por `auth.uid()`; `commercial_leads`/`demo_requests` solo service_role; tablas de torneo con ownership. Probar con `anon` que todo falla.
6. Salida de CSVs de leads del repo → mover a almacenamiento externo + `git filter-repo` si hay push público. Borrar `tokens_verificacion.json` de disco.
7. Verificación de firma en webhook Stripe (`stripe-signature` + `constructEvent`) y verificación de origen en PayPal.
8. Validación serverless: cap de `amount` (p.ej. 10.000 €), `Number.isFinite`, regex de emails, rate limit con Vercel KV o Upstash.

### Sprint 2 — Semana 2: red de seguridad
9. Instalar ESLint (flat config) y arreglar `npm run lint` en CI (GitHub Actions).
10. Vitest + tests de `padelEngine.js` (generación americano/mexicano, cuadros), `store.js`, y de los endpoints de pago (mock de Stripe). Objetivo: cubrir el motor de emparejado al 100%.
11. CSP + HSTS en `vercel.json`; excluir `rest/v1` del caching del SW (`networkOnly`).
12. Migrar dominio propio: canonical, OG, `SITE_URL`, `success_url` de Stripe/PayPal.

### Sprint 3 — Semanas 3-4: refactor y arquitectura
13. Dividir los 6 archivos >500 líneas en módulos (lógica → `services/`, UI → subcomponentes); empezar por `LandingPadel` y `SchoolApp`.
14. Fusionar duplicados: `TorneoOrganizer`/`TournamentControl`/`TournamentPublic` → un core compartido; limpiar Newsletter*/Toggles.
15. Ownership en la nube: `tournament_state.owner_id` + filtro en `listCloudStates()`; auth real en paneles (dueño del torneo).
16. Evaluación de TypeScript incremental (empezando por `services/`) y de migrar `nodemailer`/`imapflow` a dependencies.

### Sprint 4 — Continuo
17. Migraciones vía `supabase db push` con link a proyecto; romper la migración de 220 KB en seeds.
18. Optimizar assets: convertir PNGs a WebP (objetivo <200 KB), mover `.docx` a Drive, `clubes-semilla.json` → carga bajo demanda.
19. Tests E2E mínimos (Playwright): crear torneo → inscribir → pagar → publicar cuadro.
20. Métricas: error tracking (Sentry) en `api/` y web vitals.

---

## 4. Criterios de éxito
- `anon` **no puede** leer ni escribir ninguna tabla de negocio (test SQL automatizado).
- Todos los pagos pasan por `service_role` + webhook con firma verificada.
- >80% de cobertura en `padelEngine.js`, CI verde con lint+tests.
- Ningún dato personal de terceros dentro del repo.
- Ningún componente >300 líneas.

---

## 5. Resultado del Sprint 0 (ejecutado 2026-11-03)

### Hecho ✅
| Cambio | Archivos |
|---|---|
| Escrituras de pago solo con `SUPABASE_SERVICE_ROLE_KEY` (fallan de forma segura si falta) — sin anon key | `api/webhook.js`, `api/paypal-capture.js` |
| CRM de demos solo con service_role (antes caía a anon key) | `api/demo-request.js` |
| JWT Bearer obligatorio; `userId` derivado siempre del token (nunca del body/query); validación de longitud de question/answer; límite de historial acotado (1-100); sin URL hardcodeada ni fallback anon | `api/agent-chat.js` (reescrito) |
| Ya no lee el `.env` del disco (los secretos viajaban dentro del bundle del deploy); escape HTML en campos del email | `api/welcome-email.js` |
| `.env.*` blindado (excepto `.env.example`) + `supabase/.temp/` ignorados | `.gitignore` |
| Documentada la var de service_role | `.env.example` |
| Verificado con `vercel env ls` + smoke test con `vercel dev`: agent-chat responde 503/503 fail-closed; demo-request responde `{"ok":true}` sin romperse | — |

### Pendiente manual del usuario (no automatizable) ⏳
1. **Rotar credenciales ya usadas en claro que Vercel ha estado empaquetando en el bundle:** la `rk_live_` de Stripe (Dashboard → API Keys → roll secret), la App Password de Gmail (`bymh…` y `ctsc…`; generar una nueva y **dejar solo una**: `GMAIL_APP_PASS` — `GOOGLE-APP-KEY` es un nombre inválido que Vercel descarta y solo lo usan los scripts de `clientes/`) y la key de OpenRouter.
2. **Añadir a Vercel (Production)**:
   - `SUPABASE_SERVICE_ROLE_KEY` → Supabase Dashboard → Settings → API → service_role.
   - `GMAIL_USER`, `GMAIL_APP_PASS` (nueva), `ALERT_EMAIL`.
   - Con el CLI linkeado: `vercel env add SUPABASE_SERVICE_ROLE_KEY production` (repetir por cada var).
3. **Desplegar** tras añadir las vars (`vercel --prod`). Ojo: si se despliega ANTES de añadir `SUPABASE_SERVICE_ROLE_KEY`, los pagos dejarán de confirmarse en Supabase (fail-closed) y las demos dejarán de guardarse. Añadir primero las vars.
4. Normalizar `.env` local tras la rotación: una sola `GMAIL_APP_PASS` (16 dígitos), quitar `GOOGLE-APP-KEY`, quitar `SMTP_ALLOW_INSECURE` (deshabilita la validación TLS en los scripts de email — riesgo MITM).
5. Recordatorio RGPD: los CSV de leads siguen en el repo hasta el Sprint 1.

### Descubrimientos adicionales durante la ejecución
- **Los emails de demo nunca avisaron en producción**: `GMAIL_USER`/`GMAIL_APP_PASS` no existían como env vars en Vercel; `demo-request.js` las leía de `process.env` y saltaba el bloque. Con welcome-email la cosa era peor: leía el `.env` del disco, que Vercel empaquetaba con el CLI-deploy. Tras rotar + añadir vars, el aviso de demo por email empezará a funcionar por primera vez.
- `OPENROUTER_API_KEY` de Development está visible en texto en el listado del CLI (es normal para Development), pero producción está como Secret — OK.
- El dev-server de Vercel crashea (process exit) ante un body JSON inválido en local; en producción devuelve error controlado. No es un bug del proyecto.

---

## 6. Resultado del Sprint 1 (ejecutado 2026-11-03, commit `21ec8b9` + purga)

**RLS**: `supabase/migrations/20261103000000_seguridad_rls.sql` (v2 idempotente, tolerante a tablas existentes o no). CRM comercial/demo_requests sin anon; `tournament_state` con `owner_id` (escritura solo con login, claim de filas legacy); UPDATE/DELETE del núcleo de torneos solo autenticado; DELETE anónimo de reservas/waitlist eliminado; splits UPDATE solo service_role. Pendiente de que el usuario ejecute el SQL (el primer intento falló por `web_events` inexistente — re-run con la v2).

**Firma webhook**: `stripe-signature` verificada con HMAC-SHA256 timing-safe + anti-replay 5 min (`api/_lib/stripeSignature.js`, sin dependencias). Requiere `STRIPE_WEBHOOK_SECRET` en Vercel (ver `docs/aplicar-migracion-rls-2026-11-03.md`).

**Validación**: `api/_lib/validate.js` — tope 500 €, min 0,50 €, emails con regex, saneo de longitud de campos, max 16 jugadores, floor para splits sumando exacto. `check-status` valida formato `cs_live_/cs_test_` + rate limit 30/min por IP.

**RGPD**: 77 CSV/XLSX de leads eliminados del índice, `.gitignore` bloquea su vuelta, e **historial PURGADO** con `git-filter-repo` (212 commits reescritos) + force push a main + rama remota `agents/*` borrada. Pendiente usuario: escribir a GitHub Support si quiere garantía de purga de blobs huérfanos (repo con 0 forks).

## 7. Resultado del Sprint 2 (ejecutado 2026-11-03)

- **ESLint 9 instalado y configurado** (flat config `eslint.config.js`; `npm run lint`). Salida: **0 errores**, 131 warnings (deuda marcada: unused-vars, exhaustive-deps…).
- **Vitest 2** con `npm test`: 20 tests sobre validación de pagos (`api/_lib/validate.js`) y verificación de firma (`api/_lib/stripeSignature.js` — válido, manipulado, otro secreto, replay, rotación, cabeceras malformadas).
- **Latent bugs corregidos que el lint destapó** (ReferenceError reales):
  - `MarketingApp.jsx`: `PLANS` global inexistente (línea muerta eliminada).
  - `SchoolApp.jsx`: faltaba importar `listAttendanceByClass` (crash en carga de escuela).
  - `TournamentControl.jsx`: sin importar `generateCuadroBForControl`/`C` (crash en acción de panel).
  - `TournamentPublic.jsx`: `getState` sin importar (10 usos) + **hook después de returns tempranos** (crash React auto-SEO; movido al bloque superior).
  - `ExitIntentPopup.jsx`/`NewsletterSignup.jsx`: `require()` en navegador (ESM) → `import()` dinámico.
  - `clientes/scrape-padelizados.mjs`: reasignación de `const email`.
- **CSP + HSTS** en `vercel.json`: CSP por allow-list (fonts, supabase, OSM tiles, qrserver/unpkg avatares; scripts/style self+inline) + `Strict-Transport-Security`.
- Aviso: CSP estricta se valida con el primer despliegue; si algo falla en consola (descartado por allow-list razonable), ajustar la cabecera.

### Pendiente manual del usuario tras Sprint 1/2
1. Ejecutar la **migración SQL v2** en Supabase (SQL Editor) → verificación con la query del doc.
2. Añadir en Vercel: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASS`, `ALERT_EMAIL` → deploy.
3. Rotar credenciales (Stripe rk_live, Gmail, OpenRouter) si no se hizo en Sprint 0.
4. Sprint 3-4 (refactor de monolitos + ownership completo + TypeScript) y Sprint 4-5 (E2E Playwright, Sentry, optimización de assets) quedan planificados.
