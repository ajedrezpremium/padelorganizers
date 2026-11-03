-- ============================================================
-- 20261103020000_octubre_catchup.sql — Catch-up de las migraciones de
-- octubre (idempotente): se puede ejecutar 1 o N veces sin error.
-- Reemplaza a: 20261001000000 + 20261001000001 + 20261001000002
-- (esos originales NO son idempotentes: si los ejecutas de nuevo dan
--  "policy ... already exists" — ignora ese archivo y usa este).
--
-- Aplicar en: Supabase Dashboard > SQL Editor > New query > Run
-- Después de este, re-ejecuta 20261103000000_seguridad_rls.sql (v2).
-- ============================================================

-- ---------- 1) commercial_events (traza por lead) ----------
create table if not exists public.commercial_events (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  tipo text not null,
  detalle text default '',
  fuente text default '',
  created_at timestamptz not null default now()
);
create index if not exists commercial_events_email_idx on public.commercial_events (email);
create index if not exists commercial_events_created_idx on public.commercial_events (created_at desc);

alter table public.commercial_events enable row level security;

-- ---------- 2) web_events (medición web con UTMs) ----------
create table if not exists public.web_events (
  id uuid primary key default gen_random_uuid(),
  email text default '',
  evento text not null,
  detalle text default '',
  path text default '',
  utm_source text default '',
  utm_medium text default '',
  utm_campaign text default '',
  utm_content text default '',
  created_at timestamptz not null default now()
);
create index if not exists web_events_evento_idx on public.web_events (evento);
create index if not exists web_events_created_idx on public.web_events (created_at desc);

alter table public.web_events enable row level security;

-- ---------- 3) Policies FINALES idempotentes para ambas ----------
-- Objetivo (coherente con 20261103000000):
--   * commercial_events: SELECT/INSERT solo autenticado (+ service_role).
--   * web_events: INSERT público (beacon de acción del visitante),
--     SELECT solo autenticado (el dueño).
do $$
begin
  -- commercial_events: limpiar todo lo anterior y fijar destino
  execute 'drop policy if exists "anon_select_commercial_events" on public.commercial_events';
  execute 'drop policy if exists "anon_insert_commercial_events" on public.commercial_events';
  execute 'drop policy if exists "anon_delete_commercial_events" on public.commercial_events';
  execute 'drop policy if exists "anon_update_commercial_events" on public.commercial_events';
  execute 'drop policy if exists "auth_select_commercial_events" on public.commercial_events';
  execute 'drop policy if exists "auth_insert_commercial_events" on public.commercial_events';
  execute 'create policy "auth_select_commercial_events" on public.commercial_events for select to authenticated using (true)';
  execute 'create policy "auth_insert_commercial_events" on public.commercial_events for insert to authenticated with check (true)';

  -- web_events: limpiar y fijar destino
  execute 'drop policy if exists "anon_select_web_events" on public.web_events';
  execute 'drop policy if exists "anon_insert_web_events" on public.web_events';
  execute 'drop policy if exists "anon_update_web_events" on public.web_events';
  execute 'drop policy if exists "anon_delete_web_events" on public.web_events';
  execute 'drop policy if exists "auth_select_web_events" on public.web_events';
  execute 'create policy "anon_insert_web_events" on public.web_events for insert to anon, authenticated with check (true)';
  execute 'create policy "auth_select_web_events" on public.web_events for select to authenticated using (true)';
end
$$;

-- ---------- 4) Verificación rápida ----------
-- Los dos prints muestran el estado final de policies:
select tablename, cmd, roles, policyname
from pg_policies
where schemaname='public' and tablename in ('commercial_events','web_events')
order by tablename, cmd;
