-- ============================================================
-- PADELORGANIZERS.COM — Socios & Membresías (Hito A)
-- Altas/bajas de socios, plan/membresía, carnets digitales,
-- cuotas recurrentes, promociones/bonos y puntos de fidelización.
-- Idempotente: se puede aplicar varias veces en el SQL Editor.
-- ============================================================

create table if not exists public.members (
  id text primary key,
  name text not null default 'Socio',
  email text not null default '',
  phone text not null default '',
  birthdate text,
  level text not null default 'BEGINNER',
  plan text not null default 'basic',
  status text not null default 'active',
  joined_on text,
  card_number text not null default '',
  guardian_name text not null default '',
  guardian_phone text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id text primary key,
  name text not null default 'Plan',
  price numeric not null default 0,
  cycle text not null default 'monthly',
  benefits text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dues (
  id text primary key,
  member_id text not null default '',
  amount numeric not null default 0,
  currency text not null default 'eur',
  status text not null default 'pending',
  paid_on timestamptz,
  due_date text,
  method text not null default 'stripe',
  created_at timestamptz not null default now()
);

create table if not exists public.promos (
  id text primary key,
  code text not null default '',
  name text not null default 'Promoción',
  type text not null default 'discount',
  value numeric not null default 0,
  expires_on text,
  active boolean not null default true,
  uses integer not null default 0,
  max_uses integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty (
  id text primary key,
  member_id text not null default '',
  points integer not null default 0,
  reason text not null default '',
  created_at timestamptz not null default now()
);

-- Índices para ritmo de listado por socio
create index if not exists idx_dues_member on public.dues(member_id, created_at);
create index if not exists idx_loyalty_member on public.loyalty(member_id, created_at);

-- Seguridad: lectura pública y escritura abierta para el MVP demo
-- (igual patrón que messages / reservations).
alter table public.members enable row level security;
alter table public.plans enable row level security;
alter table public.dues enable row level security;
alter table public.promos enable row level security;
alter table public.loyalty enable row level security;

create policy "members_select" on public.members for select using (true);
create policy "members_insert_update" on public.members for insert with check (true);
create policy "members_update" on public.members for update using (true);
create policy "members_delete" on public.members for delete using (true);

create policy "plans_select" on public.plans for select using (true);
create policy "plans_insert" on public.plans for insert with check (true);
create policy "plans_update" on public.plans for update using (true);
create policy "plans_delete" on public.plans for delete using (true);

create policy "dues_select" on public.dues for select using (true);
create policy "dues_insert" on public.dues for insert with check (true);
create policy "dues_update" on public.dues for update using (true);
create policy "dues_delete" on public.dues for delete using (true);

create policy "promos_select" on public.promos for select using (true);
create policy "promos_insert" on public.promos for insert with check (true);
create policy "promos_update" on public.promos for update using (true);
create policy "promos_delete" on public.promos for delete using (true);

create policy "loyalty_select" on public.loyalty for select using (true);
create policy "loyalty_insert" on public.loyalty for insert with check (true);
create policy "loyalty_update" on public.loyalty for update using (true);
create policy "loyalty_delete" on public.loyalty for delete using (true);

-- Semilla de planes por defecto (idempotente)
insert into public.plans (id, name, price, cycle, benefits, active) values
  ('plan-basic',   'basic',   15, 'monthly', 'Reservas con descuento',            true),
  ('plan-premium', 'premium', 25, 'monthly', 'Reservas + clases + tienda 10%',    true),
  ('plan-family',  'family',  35, 'monthly', 'Hasta 4 personas',                  true),
  ('plan-pro',     'pro',     50, 'monthly', 'Torneos + material + prioridad',    true)
on conflict (id) do nothing;