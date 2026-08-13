-- ============================================================
-- PADELORGANIZERS.COM — Anti no-show + lista de espera (core #3)
-- Aplicar en: Supabase Dashboard > SQL Editor > Nuevo query > Run
-- ============================================================

-- Fianza anti no-show en las reservas (reembolsable si se cancela)
alter table public.reservations
  add column if not exists deposit_eur numeric(8,2) not null default 0,
  add column if not exists refundable boolean not null default false;

-- Lista de espera por pista/día/hora (el "cuarto" que quedó fuera)
create table if not exists public.reservation_waitlist (
  id uuid primary key default gen_random_uuid(),
  court_name text not null,
  day text not null,
  time_slot text not null,
  name text not null,
  email text not null,
  status text not null default 'waiting',   -- waiting | promoted | cancelled
  created_at timestamptz not null default now()
);

alter table public.reservation_waitlist enable row level security;

drop policy if exists "waitlist_select" on public.reservation_waitlist;
drop policy if exists "waitlist_insert" on public.reservation_waitlist;
drop policy if exists "waitlist_update" on public.reservation_waitlist;
drop policy if exists "waitlist_delete" on public.reservation_waitlist;

create policy "waitlist_select" on public.reservation_waitlist for select using (true);
create policy "waitlist_insert" on public.reservation_waitlist for insert with check (true);
create policy "waitlist_update" on public.reservation_waitlist for update using (true);
create policy "waitlist_delete" on public.reservation_waitlist for delete using (true);

create index if not exists idx_waitlist_slot on public.reservation_waitlist(day, time_slot, court_name);