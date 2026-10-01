-- ============================================================
-- 20260929000000_comercial.sql — CRM comercial Padel Organizers
-- Actividad comercial (leads, pipeline) + solicitudes de demo virtual.
-- Aplicar en: Supabase Dashboard > SQL Editor > New query > Run
-- (o `supabase db push` si usas la CLI con el proyecto enlazado).
-- Sigue el mismo modelo de policies abiertas ANON que schema.sql;
-- acotar a auth.uid() cuando el panel tenga login de dueño.
-- ============================================================

-- ---------- Leads comerciales (pipeline de venta) ----------
create table if not exists public.commercial_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nombre text default '',
  ciudad text default '',
  fuente text default '',            -- ej: leads_madrid.csv, web, demo
  estado text not null default 'nuevo',
  -- estados: nuevo | contactado | respondido | demo_solicitada |
  --          demo_hecha | negociacion | ganado | perdido | rebote | sin_correo
  ultimo_error text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Solicitudes de demo virtual (SOLO estas avisan) ----------
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nombre text default '',
  perfil text default '',            -- Club / Escuela / Federación / Proveedor…
  idioma text default 'es',
  fuente text default 'web',         -- web | email | federacion
  estado text not null default 'pendiente',  -- pendiente | contactado | hecha | ganado | perdido
  created_at timestamptz not null default now()
);
create index if not exists demo_requests_estado_idx on public.demo_requests (estado);
create index if not exists demo_requests_email_idx on public.demo_requests (email);

-- ---------- RLS + policies ANON (demo, como schema.sql) ----------
alter table public.commercial_leads enable row level security;
alter table public.demo_requests enable row level security;

create policy "anon_select_commercial_leads" on public.commercial_leads for select using (true);
create policy "anon_insert_commercial_leads" on public.commercial_leads for insert with check (true);
create policy "anon_update_commercial_leads" on public.commercial_leads for update using (true);

create policy "anon_select_demo_requests" on public.demo_requests for select using (true);
create policy "anon_insert_demo_requests" on public.demo_requests for insert with check (true);
create policy "anon_update_demo_requests" on public.demo_requests for update using (true);
