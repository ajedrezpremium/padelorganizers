-- ============================================================
-- PADELORGANIZERS.COM — Reservas de pistas (Club App) + Moments en nube
-- Aplicar en: Supabase Dashboard > SQL Editor > Nuevo query > Run
-- ============================================================

-- 1) Reservas de pistas (con estado de pago Stripe)
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  court_name text not null,
  day text not null,
  time_slot text not null,
  player_name text not null,
  player_email text not null,
  user_id uuid references auth.users(id) on delete set null,
  price numeric(8,2) not null default 0,
  currency text not null default 'eur',
  status text not null default 'pending',
  stripe_session text,
  created_at timestamptz not null default now()
);

alter table public.reservations enable row level security;

create policy "reservations_select_own" on public.reservations for select
  using (auth.uid() = user_id OR user_id is null);
create policy "reservations_insert" on public.reservations for insert
  with check (auth.uid() = user_id OR user_id is null);
create policy "reservations_update" on public.reservations for update
  using (auth.uid() = user_id OR user_id is null) with check (auth.uid() = user_id OR user_id is null);

create index if not exists idx_reservations_user on public.reservations(user_id);
create index if not exists idx_reservations_slot on public.reservations(day, time_slot, court_name);

-- 2) Moments del partido persistentes en la nube (LiveScore Pro público)
create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  tournament_key text not null default 'demo',
  match_key text not null default 'demo',
  title text not null,
  pair1_names text,
  pair2_names text,
  score text,
  combo integer not null default 1,
  votes integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.moments enable row level security;

create policy "moments_select" on public.moments for select using (true);
create policy "moments_insert" on public.moments for insert with check (true);
create policy "moments_update" on public.moments for update using (true) with check (true);

create index if not exists idx_moments_match on public.moments(match_key, created_at);