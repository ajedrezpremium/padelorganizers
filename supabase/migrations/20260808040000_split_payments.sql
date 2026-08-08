-- ============================================================
-- PADELORGANIZERS.COM — Split Payments (pago dividido por jugador)
-- Aplicar en: Supabase Dashboard > SQL Editor > Nuevo query > Run
--
-- Cada jugador tiene su propio stripe_session; la reserva se confirma
-- (completed) cuando TODOS los splits están pagados.
-- ============================================================

create table if not exists public.reservation_splits (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references public.reservations(id) on delete cascade,
  player_name text not null,
  player_email text not null,
  amount_eur numeric(8,2) not null default 0,
  status text not null default 'pending',      -- pending | paid
  stripe_session text,
  created_at timestamptz not null default now()
);

alter table public.reservation_splits enable row level security;

create policy "splits_select_own" on public.reservation_splits for select
  using (true);
create policy "splits_insert" on public.reservation_splits for insert
  with check (true);
create policy "splits_update" on public.reservation_splits for update
  using (true) with check (true);

create index if not exists idx_splits_reservation on public.reservation_splits(reservation_id);
create index if not exists idx_splits_session on public.reservation_splits(stripe_session);