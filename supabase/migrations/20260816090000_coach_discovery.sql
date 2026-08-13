-- ============================================================
-- PADELORGANIZERS.COM — Coach Discovery & Private Lesson Booking
-- Extiende la tabla coaches con nivel y tarifa horaria para el
-- directorio público de entrenadores (/coaches) y la reserva de
-- lecciones privadas.
-- Aplicar en el SQL Editor de Supabase.
-- ============================================================

alter table public.coaches
  add column if not exists level text default 'BEGINNER';   -- BEGINNER | INTERMEDIATE | ADVANCED | PRO
alter table public.coaches
  add column if not exists hourly_rate decimal(10,2) default 0;  -- tarifa €/h de lección privada