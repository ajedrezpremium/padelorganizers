-- ============================================================
-- PADELORGANIZERS.COM — Auth de jugadores + Sincronización Local↔Nube
-- Aplicar en: Supabase Dashboard > SQL Editor > Nuevo query > Run
-- ============================================================

-- 1) Perfiles de jugadores vinculados a auth.users (login por email)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  elo integer not null default 1500,
  level numeric(3,1) not null default 3.0,
  home_club text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Políticas: cada usuario solo ve/edita su propio perfil
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Trigger: crear perfil automáticamente al registrarse con email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Estado del torneo (JSON completo) para sincronizar modo Local↔Nube
create table if not exists public.tournament_state (
  tournament_key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.tournament_state enable row level security;

create policy "tournament_state_select" on public.tournament_state for select using (true);
create policy "tournament_state_insert" on public.tournament_state for insert with check (true);
create policy "tournament_state_update" on public.tournament_state for update using (true);
create policy "tournament_state_delete" on public.tournament_state for delete using (true);

-- Índice para ordenar por última actualización
create index if not exists idx_tournament_state_updated on public.tournament_state(updated_at desc);
