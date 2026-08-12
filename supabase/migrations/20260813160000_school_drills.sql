-- ============================================================
-- PADELORGANIZERS.COM — Planificador metodológico de drills
-- Tabla school_drills para el catálogo de ejercicios técnicos de
-- la escuela (Perfil 2 ampliado: tab Drills).
-- Aplicar en el SQL Editor de Supabase o con supabase db push.
-- ============================================================

-- Catálogo de drills / ejercicios metodológicos
create table if not exists public.school_drills (
  id text primary key,                    -- drl-serve, drl-band, ... (clave estable)
  name text not null,
  axis text not null default 'technical', -- technical | tactical | movement | mental
  level text not null default 'BEGINNER', -- BEGINNER | INTERMEDIATE | ADVANCED | PRO
  duration_min integer not null default 20,
  category text not null default 'adults',-- adults | kids
  focus text,                             -- objetivo didáctico
  setup text,                             -- material / preparación
  created_at timestamptz not null default now()
);

-- Seguridad: RLS
alter table public.school_drills enable row level security;

-- Lectura pública para el panel de la escuela (como el resto del MVP)
create policy "school_drills_select" on public.school_drills for select using (true);

-- Escritura pública para el panel (MVP de la demo; subir permisos en fase RBAC)
create policy "school_drills_insert" on public.school_drills for insert with check (true);
create policy "school_drills_update" on public.school_drills for update using (true);
create policy "school_drills_delete" on public.school_drills for delete using (true);

-- Índices
create index if not exists idx_school_drills_axis on public.school_drills(axis);
create index if not exists idx_school_drills_level on public.school_drills(level);