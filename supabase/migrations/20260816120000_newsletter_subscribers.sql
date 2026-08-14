-- newsletter_subscribers — tabla de suscriptores del newsletter (panel /newsletters/suscripciones)
-- Se crea manualmente en el SQL Editor de Supabase (la CLI no tiene credenciales).
-- El código tolera su ausencia (fallback localStorage), como con coach_discovery.

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null default '',
  lang text not null default 'es',
  city text not null default '',
  active boolean not null default true,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

-- Permitir a la app (anon key) hacer upsert, lectura y baja.
create policy "newsletter_subscribers_select" on newsletter_subscribers
  for select using (true);
create policy "newsletter_subscribers_insert" on newsletter_subscribers
  for insert with check (true);
create policy "newsletter_subscribers_update" on newsletter_subscribers
  for update using (true);
create policy "newsletter_subscribers_delete" on newsletter_subscribers
  for delete using (true);
