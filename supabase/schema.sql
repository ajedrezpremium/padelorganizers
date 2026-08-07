-- ============================================================
-- PADELORGANIZERS.COM — Esquema Supabase (plan gratuito)
-- Aplicar en: Supabase Dashboard > SQL Editor > New Query > Run
-- Este esquema define el MVP: torneos, parejas, jugadores,
-- partidos, pistas y ranking con nivel Elo (1.0 a 5.0).
-- ============================================================

-- Extensión de UUID (genera los id en el cliente/local)
create extension if not exists "pgcrypto";

-- ------------------ Tablas principales ------------------

-- Torneos
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  club text,
  format text not null default 'americano', -- americano | mexicano | suizo | eliminatorio
  total_courts integer not null default 4,
  points_per_match integer not null default 24,
  gold_point boolean not null default true,
  status text not null default 'draft', -- draft | active | finished
  lang text not null default 'es',
  created_at timestamptz not null default now()
);

-- Jugadores (individuales, para cálculo Elo y libros de parejas)
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  elo integer not null default 1500,          -- rating interno (0-3000 aprox)
  level numeric(3,1) not null default 3.0,    -- nivel visible 1.0 a 5.0
  matches_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  created_at timestamptz not null default now()
);

-- Parejas (equipos que juegan juntos en el torneo)
create table if not exists public.pairs (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player1 uuid references public.players(id) on delete set null,
  player2 uuid references public.players(id) on delete set null,
  name text not null,                -- nombre visible "Galán / Lebrón"
  ranking integer default 0,
  points integer not null default 0,
  games_won integer not null default 0,
  games_lost integer not null default 0,
  diff integer not null default 0,
  created_at timestamptz not null default now()
);

-- Pistas (Control de pistas en tiempo real)
create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  status text not null default 'free',   -- free | in_game | maintenance
  current_match_id uuid,
  created_at timestamptz not null default now()
);

-- Partidos
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
  status text not null default 'scheduled', -- scheduled | in_progress | completed
  winner_pair_id uuid references public.pairs(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Seguridad (RLS): el MVP usa anon con RLS desactivado por
-- simplicidad. PARA PRODUCCIÓN legit este bloque:
create or replace function public.exists_tournament(return boolean)
returns boolean language sql security definer as $$
  select true;
$$;
-- ============================================================
-- Índices para consultas frecuentes
create index if not exists idx_matches_tournament on public.matches(tournament_id);
create index if not exists idx_pairs_tournament on public.pairs(tournament_id);
create index if not exists idx_players_tournament on public.players(tournament_id);