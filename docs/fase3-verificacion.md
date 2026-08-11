# Fase 3 — Directorio: verificación de fichas de clubes

Estado: **preparada (pendiente ejecución SQL + envío de campaña)**.

## Objetivo

Convertir las 25 fichas del directorio (`pendiente_verificacion`) en fichas
**verificadas** mediante la propia campaña de email. El club recibe un enlace
mágico; al confirmarlo se le otorga la insignia "Verificado" y prioridad de
posicionamiento en el directorio y en SEO.

Deformidad de seguridad clave: **un visitante anónimo no puede autoverificarse**.
La confirmación solo ocurre vía la función RPC `confirmar_verificacion`, que
comprueba el `sha256` de un token aleatorio guardado previamente en la BD.

## Qué cambia

1. **Migración `supabase/migrations/20260812030000_clubes_verificacion.sql`**
   - Columnas `verified_at`, `verified_by`, `claim_token_sha` en `clubes`. Solo
     se almacena el hash del token, nunca el token en claro.
   - Tabla `club_verificaciones` (auditoría de solicitudes y confirmaciones).
   - RPC `solicitar_verificacion(club_id, nombre, email, cargo, notas)` → registra
     el interés de un club que quiere aparecer/actualizar (no otorga badge).
   - RPC `confirmar_verificacion(club_id, token, nombre, email, cargo)` → valida
     hash y otorga el badge "Verificado".
   - **Sube permisos**: se revoca INSERT/UPDATE anónimos sobre `clubes`. Toda
     escritura pasa por las funciones SECURITY DEFINER (previsto como "fase RBAC").
2. **Ruta `/verificar`** (`src/components/VerificarFicha.jsx`)
   - Con `?club=<slug>&t=<token>`: formulario de confirmación → RPC.
   - Sin token: formulario de solicitud de verificación → RPC de solicitud.
3. **Directorio `/clubes`** (`ClubesDirectory.jsx`)
   - Fichas verificadas/destacadas aparecen **primero** (ranking).
   - Ficha verificada muestra nota verde de beneficio.
   - Ficha pendiente muestra CTA "¿Eres el club? Verifica tu ficha →".
4. **Campaña 2º contacto**
   - Plantilla: `clientes/plantilla-verificacion.html`.
   - Script: `clientes/enviar-verificacion.mjs` (genera tokens + SQL de carga +
     envía correos con enlace mágico). Log: `clientes/verificacion_log.csv`.

## Pasos de ejecución

1. **Aplicar la migración** en Supabase → SQL Editor:
   `supabase/migrations/20260812030000_clubes_verificacion.sql`
2. **Generar tokens** (local):
   `node clientes/enviar-verificacion.mjs --tokens`
   → crea `clientes/tokens_verificacion.sql` (hash sha256 por club) y
   `clientes/tokens_verificacion.json` (tokens en claro, para ENVIAR).
3. **Cargar hashes** en Supabase → SQL Editor: pegar y ejecutar
   `clientes/tokens_verificacion.sql`.
4. **Desplegar** el frontend con la ruta `/verificar` y los cambios del
   directorio: `npx vercel --prod` (después de commit).
5. **Revisar** un correo de ejemplo: `node clientes/enviar-verificacion.mjs --dry`
6. **Probar** un envío: `node clientes/enviar-verificacion.mjs --solo=0`
7. **Enviar** a todos: `node clientes/enviar-verificacion.mjs`

## Verificación manual QA

- [ ] `/clubes` muestra las 25 fichas; las verificadas suben en la lista.
- [ ] Abrir `?club=<slug>&t=<token>` de un token real → confirmar → el badge
      cambia a "Verificado" y la ficha sube de posición.
- [ ] Abrir la misma URL con un token incorrecto → error `token_invalido`.
- [ ] Formulario de solicitud sin token → fila en `club_verificaciones`.

## Notas de seguridad

- El token en claro **solo** vive en `tokens_verificacion.json` (local, no
  versionado) y en el correo recibido. En la BD solo el `sha256`.
- No versionar `clientes/tokens_verificacion.json` (contiene secretos).
- El RLS de `clubes` queda de solo-lectura para anónimos; las RPC son
  SECURITY DEFINER con `set search_path`.