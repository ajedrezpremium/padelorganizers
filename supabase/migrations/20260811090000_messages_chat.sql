-- ============================================================
-- PADELORGANIZERS.COM — Chat en vivo de torneos (realtime)
-- Soporta el TournamentChat del dashboard: mensajes del público
-- conectados vía Supabase Realtime (postgres_changes INSERT).
-- Aplicar en el SQL Editor de Supabase o con supabase db push.
-- ============================================================

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null default 'demo',
  author text not null default 'Jugador',
  body text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_tournament
  on public.messages(tournament_id, created_at);

-- Seguridad: lectura pública y escritura pública para el MVP demo.
alter table public.messages enable row level security;

create policy "messages_select" on public.messages for select using (true);
create policy "messages_insert" on public.messages for insert with check (true);
create policy "messages_delete" on public.messages
  for delete using (auth.uid() is not null);