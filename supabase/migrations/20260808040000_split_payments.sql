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
  split_index integer not null default 0,        -- 0..N-1 (posición del jugador)
  total_splits integer not null default 2,       -- nº total de jugadores de la reserva
  player_name text not null,
  player_email text not null,
  amount_eur numeric(8,2) not null default 0,
  status text not null default 'pending',      -- pending | paid | refunded
  payment_method text not null default 'stripe', -- stripe | paypal
  stripe_session text,                          -- sesión Stripe si pago con tarjeta
  paypal_order text,                            -- order id de PayPal si pago con PayPal
  paid_at timestamptz,
  refunded_at timestamptz,
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
create index if not exists idx_splits_paypal on public.reservation_splits(paypal_order);
create index if not exists idx_splits_status on public.reservation_splits(reservation_id, status);

-- PayPal: referencia de la reserva pagada con PayPal (para confirmarla sin stripe_session).
alter table public.reservations
  add column if not exists payment_method text not null default 'stripe',
  add column if not exists paypal_order text;
create index if not exists idx_reservations_paypal on public.reservations(paypal_order);