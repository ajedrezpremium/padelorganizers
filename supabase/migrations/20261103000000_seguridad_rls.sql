-- ============================================================
-- 20261103000000_seguridad_rls.sql — Cierre de RLS anon (Sprint 1)
-- Versión 2 (idempotente + tolerante a tablas que no existan).
-- Aplicar en: Supabase Dashboard > SQL Editor > New query > Run
-- Guía y verificación: docs/aplicar-migracion-rls-2026-11-03.md
--
-- Modelo:
--  * service_role (serverless api/) BYPASA RLS: única forma de marcar
--    pagos y escribir el CRM.
--  * anon (clave pública del bundle): solo lo que un visitante necesita.
--  * authenticated (usuario con login): dueño de su perfil, su estado de
--    torneo en la nube y del panel comercial.
-- ============================================================

-- ------------------------------------------------------------
-- 1) CRM COMERCIAL — datos personales de terceros. Cero anon.
--    Drops incluidos también de los nombres auth_*: ejecutable múltiples veces.
-- ------------------------------------------------------------
drop policy if exists "anon_select_commercial_leads" on public.commercial_leads;
drop policy if exists "anon_insert_commercial_leads" on public.commercial_leads;
drop policy if exists "anon_update_commercial_leads" on public.commercial_leads;
drop policy if exists "anon_delete_commercial_leads" on public.commercial_leads;
drop policy if exists "auth_select_commercial_leads" on public.commercial_leads;
drop policy if exists "auth_update_commercial_leads" on public.commercial_leads;
drop policy if exists "auth_insert_commercial_leads" on public.commercial_leads;
create policy "auth_select_commercial_leads" on public.commercial_leads
  for select to authenticated using (true);
create policy "auth_update_commercial_leads" on public.commercial_leads
  for update to authenticated using (true) with check (true);
create policy "auth_insert_commercial_leads" on public.commercial_leads
  for insert to authenticated with check (true);

drop policy if exists "anon_select_commercial_events" on public.commercial_events;
drop policy if exists "anon_insert_commercial_events" on public.commercial_events;
drop policy if exists "anon_delete_commercial_events" on public.commercial_events;
drop policy if exists "auth_select_commercial_events" on public.commercial_events;
drop policy if exists "auth_insert_commercial_events" on public.commercial_events;
create policy "auth_select_commercial_events" on public.commercial_events
  for select to authenticated using (true);
create policy "auth_insert_commercial_events" on public.commercial_events
  for insert to authenticated with check (true);

-- ------------------------------------------------------------
-- 2) DEMO REQUESTS — solo service_role escribe; dueño logado consulta.
-- ------------------------------------------------------------
drop policy if exists "anon_select_demo_requests" on public.demo_requests;
drop policy if exists "anon_insert_demo_requests" on public.demo_requests;
drop policy if exists "anon_update_demo_requests" on public.demo_requests;
drop policy if exists "anon_delete_demo_requests" on public.demo_requests;
drop policy if exists "auth_select_demo_requests" on public.demo_requests;
drop policy if exists "auth_update_demo_requests" on public.demo_requests;
create policy "auth_select_demo_requests" on public.demo_requests
  for select to authenticated using (true);
create policy "auth_update_demo_requests" on public.demo_requests
  for update to authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- 3) WEB EVENTS — opcional: si la tabla no existe aún en tu proyecto,
--    este bloque se salta sin error (aplica 20261001000002_web_events.sql
--    aparte si quieres la medición; sus policies ya son las seguras).
-- ------------------------------------------------------------
do $$
begin
  if to_regclass('public.web_events') is not null then
    drop policy if exists "anon_select_web_events" on public.web_events;
    create policy "auth_select_web_events" on public.web_events
      for select to authenticated using (true);
    -- anon_insert_web_events se mantiene (rastreo de acciones públicas)
  end if;
end
$$;

-- ------------------------------------------------------------
-- 4) TOURNAMENT_STATE — lectura pública (compartir por key);
--    escritura solo autenticada y dueña (owner_id).
-- ------------------------------------------------------------
alter table public.tournament_state
  add column if not exists owner_id uuid default auth.uid();

drop policy if exists "tournament_state_insert" on public.tournament_state;
drop policy if exists "tournament_state_update" on public.tournament_state;
drop policy if exists "tournament_state_delete" on public.tournament_state;
drop policy if exists "tournament_state_insert_owner" on public.tournament_state;
drop policy if exists "tournament_state_update_owner" on public.tournament_state;
drop policy if exists "tournament_state_delete_owner" on public.tournament_state;

create policy "tournament_state_insert_owner" on public.tournament_state
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "tournament_state_update_owner" on public.tournament_state
  for update to authenticated
  using (owner_id = auth.uid() or owner_id is null)
  with check (owner_id = auth.uid());

create policy "tournament_state_delete_owner" on public.tournament_state
  for delete to authenticated
  using (owner_id = auth.uid());

-- ------------------------------------------------------------
-- 5) NÚCLEO DE TORNEOS — anon: leer y crear; UPDATE/DELETE solo autenticado.
-- ------------------------------------------------------------
do $$
declare tbl text;
begin
  foreach tbl in array array['tournaments','players','pairs','courts','matches']
  loop
    execute format('drop policy if exists "anon_update_%1$s" on public.%1$I', tbl);
    execute format('drop policy if exists "anon_delete_%1$s" on public.%1$I', tbl);
    execute format('drop policy if exists "auth_update_%1$s" on public.%1$I', tbl);
    execute format('drop policy if exists "auth_delete_%1$s" on public.%1$I', tbl);
    execute format('create policy "auth_update_%1$s" on public.%1$I for update to authenticated using (true) with check (true)', tbl);
    execute format('create policy "auth_delete_%1$s" on public.%1$I for delete to authenticated using (true)', tbl);
  end loop;
end
$$;

-- messages: chat público inserta; editar/borrar historial solo autenticado.
drop policy if exists "anon_update_messages" on public.messages;
drop policy if exists "anon_delete_messages" on public.messages;
drop policy if exists "auth_update_messages" on public.messages;
drop policy if exists "auth_delete_messages" on public.messages;
create policy "auth_update_messages" on public.messages
  for update to authenticated using (true) with check (true);
create policy "auth_delete_messages" on public.messages
  for delete to authenticated using (true);

-- ------------------------------------------------------------
-- 6) RESERVAS / LISTA DE ESPERA / SPLITS
--    Visitante: SELECT/INSERT/UPDATE de su reserva (se mantiene);
--    DELETE anónimo se elimina. Splits: UPDATE solo service_role.
-- ------------------------------------------------------------
drop policy if exists "reservations_delete_anon" on public.reservations;
drop policy if exists "anon_delete_reservations" on public.reservations;

drop policy if exists "waitlist_delete" on public.reservation_waitlist;
drop policy if exists "anon_delete_waitlist" on public.reservation_waitlist;

do $$
begin
  if to_regclass('public.reservation_splits') is not null then
    drop policy if exists "splits_insert" on public.reservation_splits;
    drop policy if exists "splits_update" on public.reservation_splits;
    drop policy if exists "splits_insert_service" on public.reservation_splits;
    drop policy if exists "splits_insert_anon" on public.reservation_splits;
    drop policy if exists "splits_update_service" on public.reservation_splits;
    create policy "splits_insert_anon" on public.reservation_splits
      for insert to anon, authenticated with check (true);
    create policy "splits_update_service" on public.reservation_splits
      for update to service_role using (true) with check (true);
  end if;
end
$$;
