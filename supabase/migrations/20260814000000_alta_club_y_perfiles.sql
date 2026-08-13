-- ============================================================
-- PADELORGANIZERS.COM — Fase 9: registro de dirigentes + alta de
-- clubes/escuelas que NO están en el directorio.
-- 1) Perfiles: rol (player | director) y teléfono con prefijo
--    internacional (phone_country + phone), estilo Playtomic.
-- 2) Trigger handle_new_user ampliado: guarda role/phone que
--    llegan en user_metadata (options.data del auth).
-- 3) RPC alta_club (SECURITY DEFINER): crea una ficha nueva como
--    pendiente_verificacion + registra la solicitud. Como la fase 3
--    revocó las policies de escritura de clubes, el alta solo puede
--    hacerse por esta función. Idempotente y reejecutable.
-- Aplicar en el SQL Editor de Supabase.
-- ============================================================

-- 1) Perfiles: rol + teléfono internacional --------------------
alter table public.profiles
  add column if not exists role text not null default 'player',  -- player | director
  add column if not exists phone_country text,                   -- '+34', '+44', '+351'...
  add column if not exists phone text;                           -- número local sin prefijo

comment on column public.profiles.role is 'player | director (empresario / dirigente de club o escuela)';
comment on column public.profiles.phone_country is 'Prefijo internacional (+34, +44, +351...)';
comment on column public.profiles.phone is 'Número de teléfono local sin prefijo';

-- 2) Trigger: recoger role/phone del user_metadata --------------
-- El perfil se crea al registrarse; si el registro ya existía con
-- on conflict se actualizan role/phone (para re-registros).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role, phone_country, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'player'),
    new.raw_user_meta_data->>'phone_country',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do update set
    role = coalesce(excluded.role, profiles.role),
    phone_country = coalesce(excluded.phone_country, profiles.phone_country),
    phone = coalesce(excluded.phone, profiles.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) RPC: alta de club/escuela que no está en el directorio ------
-- Requiere name y city. El slug se genera con un sufijo numérico
-- aleatorio para evitar colisiones. La ficha nace como
-- pendiente_verificacion (nunca verificada por defecto).
create or replace function public.alta_club(
  p_name text,
  p_city text,
  p_province text default null,
  p_address text default null,
  p_country text default 'ES',
  p_phone text default null,
  p_email text default null,
  p_website text default null,
  p_courts text default null,
  p_indoor boolean default true,
  p_grass text default null,
  p_booking_platform text default null,
  p_has_school boolean default false,
  p_has_shop boolean default false,
  p_description text default null,
  p_notas text default null
) returns public.clubes
language plpgsql security definer set search_path = public
as $$
declare
  v_slug text;
  v_club public.clubes;
  v_owner_id uuid := auth.uid();
begin
  if p_name is null or trim(p_name) = '' or p_city is null or trim(p_city) = '' then
    raise exception 'nombre_y_ciudad_obligatorios';
  end if;

  v_slug := lower(regexp_replace(trim(p_name), '[^a-z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then v_slug := 'club'; end if;
  v_slug := v_slug || '-' || floor(random() * 100000)::text;

  insert into public.clubes
    (name, slug, city, province, country, address, geo_approx,
     phone, email, website, courts, indoor, grass, booking_platform,
     has_school, has_shop, is_verified, status, description)
  values
    (trim(p_name), v_slug, trim(p_city), p_province, p_country, p_address, true,
     p_phone, p_email, p_website, p_courts, p_indoor, p_grass, p_booking_platform,
     p_has_school, p_has_shop, false, 'pendiente_verificacion', p_description)
  returning * into v_club;

  insert into public.club_verificaciones
    (club_id, canal, estado, notas, contacto_email)
  values (v_club.id, 'web', 'solicitada', p_notas, p_email);

  if v_owner_id is not null then
    update public.profiles set role = 'director' where id = v_owner_id;
  end if;

  return v_club;
end
$$;

grant execute on function public.alta_club to anon, authenticated;