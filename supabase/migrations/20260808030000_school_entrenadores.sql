-- ============================================================
-- PADELORGANIZERS.COM — Escuela / Entrenadores (módulo 4C, sprint 2)
-- Grupos por nivel y edad, clases, asistencia, evaluación técnica,
-- progresión, bonos de clases y comunicación entrenador-alumno.
-- Aplicar en el SQL Editor de Supabase o con supabase db push.
-- ============================================================

-- Entrenadores / monitores
create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  specialty text,                 -- niveles / categorías que imparte
  bio text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Alumnos (incluye menores con tutor)
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  birthdate date,
  level text default 'BEGINNER',  -- BEGINNER | INTERMEDIATE | ADVANCED | PRO
  age_group text,                 -- 'kids' | 'teens' | 'adults' | 'seniors'
  guardian_name text,             -- tutor legal si es menor
  guardian_email text,
  guardian_phone text,
  guardian_authorized boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- Grupos por nivel, edad y objetivo
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text default 'adults',  -- kids | teens | adults | seniors
  level text default 'BEGINNER',   -- BEGINNER | INTERMEDIATE | ADVANCED | PRO
  capacity integer not null default 8,
  coach_id uuid references public.coaches(id) on delete set null,
  schedule text,                    -- descripción de horario
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Miembros de un grupo (muchos-a-muchos group <-> student)
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  joined_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (group_id, student_id)
);

-- Clases / sesiones programadas
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  coach_id uuid references public.coaches(id) on delete set null,
  court_name text,
  starts_on timestamptz not null,
  duration_min integer not null default 60,
  location text,
  status text not null default 'planned',  -- planned | done | cancelled
  price decimal(10,2),                      -- si es clase suelta / bonos
  created_at timestamptz not null default now()
);

-- Asistencia por alumno y clase
create table if not exists public.class_attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  attended boolean not null default false,
  recovered boolean not null default false,   -- recuperación por ausencia
  notes text,
  created_at timestamptz not null default now(),
  unique (class_id, student_id)
);

-- Evaluación técnica / táctica y progresión
create table if not exists public.student_evaluations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  coach_id uuid references public.coaches(id) on delete set null,
  evaluated_on date not null default current_date,
  technical_score integer default 0,   -- 0-10 (drive, revés, volea...)
  tactical_score integer default 0,    -- 0-10
  movement_score integer default 0,    -- 0-10
  mental_score integer default 0,      -- 0-10
  level text,                          -- nivel sugerido
  notes text,
  created_at timestamptz not null default now()
);

-- Bonos de clases (crédito de sesiones de un alumno)
create table if not exists public.class_bonuses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  description text,
  total_classes integer not null default 0,
  used_classes integer not null default 0,
  expires_on date,
  created_at timestamptz not null default now()
);

-- Seguridad: RLS
alter table public.coaches enable row level security;
alter table public.students enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.classes enable row level security;
alter table public.class_attendance enable row level security;
alter table public.student_evaluations enable row level security;
alter table public.class_bonuses enable row level security;

-- Lectura pública para el panel de la escuela (como el resto del MVP)
create policy "coaches_select" on public.coaches for select using (true);
create policy "students_select" on public.students for select using (true);
create policy "groups_select" on public.groups for select using (true);
create policy "group_members_select" on public.group_members for select using (true);
create policy "classes_select" on public.classes for select using (true);
create policy "class_attendance_select" on public.class_attendance for select using (true);
create policy "student_evaluations_select" on public.student_evaluations for select using (true);
create policy "class_bonuses_select" on public.class_bonuses for select using (true);

-- Escritura pública para el panel (MVP de la demo; subir permisos en fase RBAC)
create policy "coaches_insert" on public.coaches for insert with check (true);
create policy "coaches_update" on public.coaches for update using (true);
create policy "students_insert" on public.students for insert with check (true);
create policy "students_update" on public.students for update using (true);
create policy "groups_insert" on public.groups for insert with check (true);
create policy "groups_update" on public.groups for update using (true);
create policy "group_members_insert" on public.group_members for insert with check (true);
create policy "group_members_delete" on public.group_members for delete using (true);
create policy "classes_insert" on public.classes for insert with check (true);
create policy "classes_update" on public.classes for update using (true);
create policy "class_attendance_insert" on public.class_attendance for insert with check (true);
create policy "class_attendance_update" on public.class_attendance for update using (true);
create policy "student_evaluations_insert" on public.student_evaluations for insert with check (true);
create policy "class_bonuses_insert" on public.class_bonuses for insert with check (true);
create policy "class_bonuses_update" on public.class_bonuses for update using (true);

-- Índices
create index if not exists idx_classes_group on public.classes(group_id, starts_on);
create index if not exists idx_classes_coach on public.classes(coach_id);
create index if not exists idx_attendance_class on public.class_attendance(class_id);
create index if not exists idx_group_members_group on public.group_members(group_id);
create index if not exists idx_eval_student on public.student_evaluations(student_id, evaluated_on desc);

-- ============================================================
-- COBRO RECURRENTE FIN DE MES (ERP escuela, core #8)
-- Suscripción del alumno y facturas mensuales. El webhook de Stripe
-- (api/webhook.js) marca las facturas como pagadas igual que las reservas.
-- ============================================================

-- Plan / suscripción de un alumno: cuota mensual recurrente fin de mes
create table if not exists public.student_subscriptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  plan_name text not null default 'Clases mensuales',
  monthly_price decimal(10,2) not null default 0,
  currency text not null default 'eur',
  billing_day integer not null default 1,      -- día del mes del cobro
  status text not null default 'active',        -- active | paused | cancelled
  cancel_on date,                               -- si se cancela a futuro
  notes text,
  created_at timestamptz not null default now()
);

-- Facturas / cobros por alumno (generadas fin de mes o manualmente)
create table if not exists public.school_invoices (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.student_subscriptions(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  period text not null,                          -- '2026-08' (mes facturado)
  amount decimal(10,2) not null default 0,
  currency text not null default 'eur',
  status text not null default 'pending',        -- pending | paid | failed | cancelled
  stripe_session text,
  due_on date,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (subscription_id, period)
);

alter table public.student_subscriptions enable row level security;
alter table public.school_invoices enable row level security;

create policy "student_subscriptions_select" on public.student_subscriptions for select using (true);
create policy "school_invoices_select" on public.school_invoices for select using (true);

create policy "student_subscriptions_insert" on public.student_subscriptions for insert with check (true);
create policy "student_subscriptions_update" on public.student_subscriptions for update using (true);
create policy "school_invoices_insert" on public.school_invoices for insert with check (true);
create policy "school_invoices_update" on public.school_invoices for update using (true);

create index if not exists idx_subscriptions_student on public.student_subscriptions(student_id);
create index if not exists idx_invoices_subscription on public.school_invoices(subscription_id, period);
create index if not exists idx_invoices_student on public.school_invoices(student_id);