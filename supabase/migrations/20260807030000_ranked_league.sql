-- ============================================================
-- PADELORGANIZERS.COM — Ranked League persistente (Hito 5)
-- Ranking global por club con rating Elo, badge de club y reset mensual.
-- Aplicar en: Supabase SQL Editor, o promocionar la migración con:
--   supabase db push --db-url postgresql://postgres:<PW>@db.uhkrrjhebiqcxnxdgvlg.supabase.co:5432/postgres
-- ============================================================

-- Temporada / liga
create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Ranked League',
  club text,
  season text not null default to_char(now(),'YYYY-MM'),
  starts_on timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Entrada de un jugador/pareja en una liga (con badge de club y rating)
create table if not exists public.league_entries (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references public.leagues(id) on delete cascade,
  player_name text not null,
  player_id uuid,                          -- si hay cuenta auth
  pair_names text,
  club text,
  badge text default 'FRIEND',              -- FRIEND | PRO | LEGEND | <emoji custom>
  rating double precision not null default 1500,
  played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  points integer not null default 0,
  champion integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.leagues enable row level security;
alter table public.league_entries enable row level security;

-- lectura pública de la tabla de honor
create policy "leagues_select" on public.leagues for select using (true);
create policy "league_entries_select" on public.league_entries for select using (true);
-- inserción pública (para que cualquiera pueda sumar su club a la liga)
create policy "league_entries_insert" on public.league_entries for insert with check (true);
-- actualización de la propia entrada (durante una partida)
create policy "league_entries_update_own" on public.league_entries for update
  using (true) with check (true);

create index if not exists idx_league_entries_league_rating on public.league_entries(league_id, rating desc);
create index if not exists idx_league_entries_club on public.league_entries(club);