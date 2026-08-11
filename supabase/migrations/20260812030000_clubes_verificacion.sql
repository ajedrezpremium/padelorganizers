-- ============================================================
-- PADELORGANIZERS.COM — Fase 3 directorio: verificación de fichas
-- 1) El badge "Verificado" se concede SOLO por una función RPC con
--    token aleatorio (hash sha256 almacenado). Un visitante anónimo
--    no puede marcarse verificado: sin token válido no hay update.
-- 2) Se suben permisos ("fase RBAC" prevista en la fase 1): se revoca
--    INSERT/UPDATE/DELETE anónimos sobre clubes; toda escritura pasa
--    por las funciones SECURITY DEFINER de abajo.
-- 3) Registro de solicitudes y confirmaciones en club_verificaciones.
-- Aplicar en el SQL Editor de Supabase.
-- ============================================================

create extension if not exists pgcrypto;

-- 1) Columnas de verificación en clubes --------------------------
alter table public.clubes
  add column if not exists verified_at timestamptz,          -- cuándo se verificó
  add column if not exists verified_by text,                 -- quién (contacto) lo confirmó
  add column if not exists claim_token_sha text;             -- sha256 del token mágico (solo hash)

-- 2) Registro de solicitudes / confirmaciones -------------------
create table if not exists public.club_verificaciones (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubes(id) on delete cascade,
  canal text not null default 'web',        -- web | campana
  estado text not null default 'solicitada',-- solicitada | confirmada | rechazada
  contacto_nombre text,
  contacto_email text,
  contacto_cargo text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.club_verificaciones enable row level security;

-- Select público (es una tabla de auditoría sin datos sensibles).
create policy "cv_select" on public.club_verificaciones for select using (true);

-- Los INSERT/UPDATE solo pueden venir de las funciones SECURITY DEFINER
-- de este archivo (no se exponen policies de escritura anónima).

-- 3) Subir permisos en clubes: revocar escritura anónima ----------
drop policy if exists clubes_insert on public.clubes;
drop policy if exists clubes_update on public.clubes;

-- 4) Funciones RPC (SECURITY DEFINER: pueden escribir pese al RLS) --

-- 4a) Solicitar verificación (sin token): registra el interés de un club
--     que quiere aparecer / actualizar su ficha. No otorga el badge.
create or replace function public.solicitar_verificacion(
  p_club_id uuid,
  p_contacto_nombre text default null,
  p_contacto_email text default null,
  p_contacto_cargo text default null,
  p_notas text default null
) returns public.club_verificaciones
language plpgsql security definer set search_path = public
as $$
declare v_row public.club_verificaciones;
begin
  insert into public.club_verificaciones
    (club_id, canal, estado, contacto_nombre, contacto_email, contacto_cargo, notas)
  values
    (p_club_id, 'web', 'solicitada', p_contacto_nombre, p_contacto_email, p_contacto_cargo, p_notas)
  returning * into v_row;
  return v_row;
end
$$;

-- 4b) Confirmar verificación CON token mágico. Comprueba que el sha256 del
--     token coincide con claim_token_sha del club. Si coincide: marca
--     is_verified=true, status='verificado', rellena verified_at/by y
--     registra la confirmación. Cualquier otro caso: error.
create or replace function public.confirmar_verificacion(
  p_club_id uuid,
  p_token text,
  p_contacto_nombre text default null,
  p_contacto_email text default null,
  p_contacto_cargo text default null
) returns public.clubes
language plpgsql security definer set search_path = public
as $$
declare
  v_sha text := encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex');
  v_club public.clubes;
begin
  select * into v_club from public.clubes where id = p_club_id for update;
  if not found then
    raise exception 'club_no_encontrado';
  end if;
  if v_club.claim_token_sha is null or v_club.claim_token_sha <> v_sha then
    raise exception 'token_invalido';
  end if;
  if not v_club.is_verified then
    v_club.is_verified := true;
    v_club.status := 'verificado';
    v_club.verified_at := now();
    v_club.verified_by := coalesce(p_contacto_nombre, v_club.name);
  end if;
  update public.clubes
     set is_verified = v_club.is_verified,
         status = v_club.status,
         verified_at = coalesce(v_club.verified_at, verified_at),
         verified_by = v_club.verified_by,
         updated_at = now()
   where id = p_club_id
   returning * into v_club;
  insert into public.club_verificaciones
    (club_id, canal, estado, contacto_nombre, contacto_email, contacto_cargo)
  values (p_club_id, 'campana', 'confirmada', p_contacto_nombre, p_contacto_email, p_contacto_cargo);
  return v_club;
end
$$;

-- 4c) Aplicar en SQL Editor (1 sola vez, por cada club de la campaña):
--     UPDATE public.clubes SET claim_token_sha = '<sha256 del token>'
--     WHERE slug = '<slug>';   -- el token en claro NO se guarda en BD.
-- El script clientes/enviar-verificacion.mjs genera estos UPDATE y los
-- correos con el enlace mágico /verificar?club=<id>&t=<token>.

-- Permisos de ejecución para PostgREST (anon usa confirmar/solicitar).
grant execute on function public.solicitar_verificacion to anon, authenticated;
grant execute on function public.confirmar_verificacion to anon, authenticated;