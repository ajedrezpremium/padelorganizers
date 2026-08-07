-- ============================================================
-- PADELORGANIZERS.COM — Esquema Supabase (plan gratuito)
-- Aplicar en: Supabase Dashboard > SQL Editor > Nuevo query > Run
--
-- IMPORTANTE: este esquema habilita la autenticación con el
-- ANON KEY público (role "anon"). Para restringir acceso en
-- producción, añade auth y acota las policies a auth.uid().
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------ Tablas ------------------

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  club text,
  format text not null default 'americano',
  total_courts integer not null default 4,
  points_per_match integer not null default 24,
  gold_point boolean not null default true,
  status text not null default 'draft',
  lang text not null default 'es',
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  elo integer not null default 1500,
  level numeric(3,1) not null default 3.0,
  matches_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.pairs (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player1 uuid references public.players(id) on delete set null,
  player2 uuid references public.players(id) on delete set null,
  name text not null,
  ranking integer default 0,
  points integer not null default 0,
  games_won integer not null default 0,
  games_lost integer not null default 0,
  diff integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  status text not null default 'free',
  current_match_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  court_id uuid references public.courts(id) on delete set null,
  pair1_id uuid references public.pairs(id) on delete set null,
  pair2_id uuid references public.pairs(id) on delete set null,
  round integer not null default 1,
  score_set1 text not null default '0-0',
  score_set2 text not null default '0-0',
  current_set integer not null default 1,
  gold_point_occurrences integer not null default 0,
  status text not null default 'scheduled',
  winner_pair_id uuid references public.pairs(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- ------------------ RLS ------------------
alter table public.tournaments enable row level security;
alter table public.players enable row level security;
alter table public.pairs enable row level security;
alter table public.courts enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;

-- Políticas para ANON (demostración): permitir todo sin auth.
-- Para producción restringir con auth.
create policy "anon_select_tournaments" on public.tournaments for select using (true);
create policy "anon_insert_tournaments" on public.tournaments for insert with check (true);
create policy "anon_update_tournaments" on public.tournaments for update using (true);
create policy "anon_delete_tournaments" on public.tournaments for delete using (true);

create policy "anon_select_players" on public.players for select using (true);
create policy "anon_insert_players" on public.players for insert with check (true);
create policy "anon_update_players" on public.players for update using (true);
create policy "anon_delete_players" on public.players for delete using (true);

create policy "anon_select_pairs" on public.pairs for select using (true);
create policy "anon_insert_pairs" on public.pairs for insert with check (true);
create policy "anon_update_pairs" on public.pairs for update using (true);
create policy "anon_delete_pairs" on public.pairs for delete using (true);

create policy "anon_select_courts" on public.courts for select using (true);
create policy "anon_insert_courts" on public.courts for insert with check (true);
create policy "anon_update_courts" on public.courts for update using (true);
create policy "anon_delete_courts" on public.courts for delete using (true);

create policy "anon_select_matches" on public.matches for select using (true);
create policy "anon_insert_matches" on public.matches for insert with check (true);
create policy "anon_update_matches" on public.matches for update using (true);
create policy "anon_delete_matches" on public.matches for delete using (true);

create policy "anon_select_messages" on public.messages for select using (true);
create policy "anon_insert_messages" on public.messages for insert with check (true);
create policy "anon_update_messages" on public.messages for update using (true);
create policy "anon_delete_messages" on public.messages for delete using (true);

-- ------------------ Índices ------------------
create index if not exists idx_matches_tournament on public.matches(tournament_id);
create index if not exists idx_pairs_tournament on public.pairs(tournament_id);
create index if not exists idx_players_tournament on public.players(tournament_id);
create index if not exists idx_messages_tournament on public.messages(tournament_id);