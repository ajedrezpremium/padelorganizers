-- ============================================================
-- PADELORGANIZERS.COM — Directorio Nacional de Clubes y Escuelas (#12)
-- Buscador público de clubes y escuelas de pádel con fichas tipo Google Maps:
-- contacto, características, geolocalización y estado de verificación.
-- Aplicar en el SQL Editor de Supabase o con supabase db push.
-- ============================================================

create table if not exists public.clubes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  city text not null,
  province text,
  country text not null default 'ES',
  address text,
  latitude double precision,
  longitude double precision,
  geo_approx boolean not null default true,   -- true = coords aproximadas por ciudad
  phone text,
  email text,
  website text,
  courts text,               -- descripción: "12 pistas indoor"
  indoor boolean,            -- true si tiene pistas cubiertas
  grass text,                -- tipo de césped / superficie
  booking_platform text,     -- Playtomic / Web Propia / Teléfono ...
  has_school boolean not null default false,  -- escuela o entrenadores
  has_shop boolean not null default false,
  is_verified boolean not null default false,
  is_featured boolean not null default false,  -- listado destacado (de pago, futuro)
  status text not null default 'pendiente_verificacion',
    -- pendiente_verificacion | verificado | destacado
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed inicial: 15 clubes reales de Vigo y entorno (campaña de presentación).
-- Las coordenadas son aproximadas (geo_approx = true): apuntan a la ciudad de
-- Vigo / municipio correspondiente y se refinarán al geocodificar cada ficha.
insert into public.clubes
  (name, slug, city, province, address, latitude, longitude, geo_approx,
   phone, email, website, courts, indoor, grass, booking_platform,
   has_school, has_shop, is_verified, status, description)
values
  ('Twelve Padel Zenter Vigo', 'twelve-padel-zenter-vigo', 'Vigo', 'Pontevedra',
   'Estrada Fragosiño, 30, Sárdoma, 36214 Vigo', 42.2145, -8.7210, true,
   '+34 986 84 17 97 / 645 01 67 42', '12padelzenter@gmail.com', 'http://www.twelvepadelzenter.com/',
   '12 pistas indoor', true, 'sintético', 'Playtomic / App Propia', true, true, false, 'pendiente_verificacion',
   'Uno de los centros de pádel más grandes de Vigo, con 12 pistas indoor y escuela propia.'),
  ('Máster Pádel Zenter', 'master-padel-zenter', 'Vigo', 'Pontevedra',
   'Rúa de Saá do Monte, 15, 36312 Vigo', 42.2112, -8.7205, true,
   '+34 747 73 24 30', '12padelzenter@gmail.com', 'N/A (Grupo Twelve)',
   '11 pistas indoor', true, 'sintético', 'Playtomic / App Propia', true, false, false, 'pendiente_verificacion',
   'Sede del grupo Twelve en Vigo con 11 pistas indoor.'),
  ('Ipadel Fitness | Sport Club', 'ipadel-fitness-sport-club', 'Mos', 'Pontevedra',
   'Avenida de Puxeiros, 86, Cabral, 36416 Mos', 42.2130, -8.6690, true,
   '+34 676 56 53 67 / 986 47 10 10', 'info@ipadelfitness.es', 'https://ipadelfitness.es/',
   '11 pistas panorámicas indoor (10D + 1I)', true, 'panorámico', 'Playtomic / Web Propia', true, true, false, 'pendiente_verificacion',
   'Club con 11 pistas panorámicas indoor en el área de Cabral/Mos.'),
  ('Win Pádel Club', 'win-padel-club', 'Vigo', 'Pontevedra',
   'Av. da Ponte, 80, Cabral, 36215 Vigo', 42.2205, -8.6860, true,
   '+34 609 78 07 31', 'info@winpadelclub.com', 'https://winpadelclub.com/',
   'Pistas cubiertas premium', true, 'premium', 'Playtomic', true, false, false, 'pendiente_verificacion',
   'Club de pádel con pistas cubiertas premium en Cabral.'),
  ('Vigo Pádel', 'vigo-padel', 'Vigo', 'Pontevedra',
   'Estrada Ponte Segade-Sárdoma, 29, 36214 Vigo', 42.2130, -8.7180, true,
   '+34 986 09 35 43', 'info@vigopadel.com', 'http://www.vigopadel.com/',
   'Pistas cubiertas climatizadas', true, 'sintético climatizado', 'Playtomic / Web Propia', true, true, false, 'pendiente_verificacion',
   'Centro de pádel con pistas climatizadas en Sárdoma.'),
  ('ARENGA PADEL CLUB', 'arenga-padel-club', 'Vigo', 'Pontevedra',
   'Camiño da Devesa, 1, Sárdoma, 36214 Vigo', 42.2140, -8.7190, true,
   '+34 986 42 51 92 / 608 802 499', 'info@arenga.es', 'http://www.arenga.es/',
   '4 pistas indoor (Césped Mondo WPT)', true, 'césped Mondo WPT', 'Playtomic', true, true, false, 'pendiente_verificacion',
   'Club con pistas indoor de césped Mondo WPT en Sárdoma.'),
  ('Indoorvigo club de padel', 'indoorvigo-club-de-padel', 'Vigo', 'Pontevedra',
   'Camiño Gandariña, 19, Nave 6, Lavadores, 36214 Vigo', 42.2220, -8.7010, true,
   '+34 986 26 18 15', 'indoor@indoorvigo.com', 'http://www.indoorvigo.com/',
   '5 pistas indoor (4 dobles y 1 individual)', true, 'sintético', 'Web Propia / Teléfono', true, false, false, 'pendiente_verificacion',
   'Centro indoor con 5 pistas en Lavadores.'),
  ('Rec Fitness & Padel Club', 'rec-fitness-padel-club', 'Vigo', 'Pontevedra',
   'Cño. do Caramuxo, 52, 36213 Vigo', 42.2250, -8.7350, true,
   '+34 986 63 24 99 / 616 79 83 04', 'recfitnesspadel@gmail.com', 'http://www.recfitness.es/',
   '4 pistas (3 cubiertas, 1 exterior techada)', true, 'sintético', 'Playtomic', true, true, false, 'pendiente_verificacion',
   'Club de fitness y pádel con 4 pistas en Caramuxo.'),
  ('Máis que Auga Barreiro', 'mais-que-auga-barreiro', 'Vigo', 'Pontevedra',
   'Rúa de Barreiro, 99, 36214 Vigo', 42.2240, -8.7290, true,
   '+34 986 26 47 44', 'barreiro@maisqueauga.com', 'https://maisqueauga.com/',
   '8 pistas (5 cubiertas, 3 muro exteriores)', true, 'sintético / muro', 'Playtomic / Web Propia', true, false, false, 'pendiente_verificacion',
   'Centro deportivo con 8 pistas de pádel en Barreiro.'),
  ('Máis que Auga Navia', 'mais-que-auga-navia', 'Vigo', 'Pontevedra',
   'Rúa de Lamelas, s/n, 36212 Vigo', 42.2350, -8.7130, true,
   '+34 986 24 74 44', 'navia@maisqueauga.com', 'https://maisqueauga.com/',
   '8 pistas indoor (7 dobles, 1 individual)', true, 'sintético', 'Playtomic / Web Propia', true, true, false, 'pendiente_verificacion',
   'Centro indoor con 8 pistas en Navia.'),
  ('Círculo Cultural Mercantil e Industrial de Vigo', 'circulo-mercantil-vigo', 'Vigo', 'Pontevedra',
   'Estrada das Plantas, 121, 36214 Vigo', 42.2160, -8.7230, true,
   '+34 986 43 33 44', 'circulomercantilvigo@gmail.com', 'https://circulomercantilvigo.com/',
   '8 pistas de pádel cubiertas (cristal y muro)', true, 'cristal y muro', 'App Socios / Zona No Socios Web', true, false, false, 'pendiente_verificacion',
   'Club con 8 pistas cubiertas de pádel, abiertas a no socios.'),
  ('Real Club Náutico de Vigo (Los Abetos)', 'real-club-nautico-vigo-los-abetos', 'Nigrán', 'Pontevedra',
   'Camiño dos Abetos, s/n, 36350 Priegue, Nigrán', 42.1820, -8.7920, true,
   '+34 986 36 61 00 / 986 44 74 41', 'gestiondeportiva@rcnauticovigo.com', 'http://www.rcnauticovigo.com/',
   '7 pistas de pádel (4 indoor, 3 outdoor)', true, 'sintético', 'Gestión Interna Socios / Teléfono', true, false, false, 'pendiente_verificacion',
   'Instalaciones deportivas Los Abetos del RCN Vigo en Nigrán.'),
  ('Club de Campo de Vigo', 'club-de-campo-de-vigo', 'Vigo', 'Pontevedra',
   'Estrada de Canido, 95, Coruxo, 36331 Vigo', 42.2210, -8.7600, true,
   '+34 986 46 03 50', 'info@clubdecampodevigo.com', 'https://www.clubdecampodevigo.com/',
   '7 pistas de pádel exteriores', false, 'sintético', 'Exclusivo Socios / Teléfono', true, false, false, 'pendiente_verificacion',
   'Club social con 7 pistas exteriores en Coruxo.'),
  ('URECA ABANCA', 'ureca-abanca', 'Nigrán', 'Pontevedra',
   'Avenida Manuel Lemos, 124, 36379 Nigrán', 42.1630, -8.7780, true,
   '+34 986 36 78 60', 'oficina@ureca.es', 'https://www.ureca.es/',
   '5 pistas de pádel cubiertas', true, 'sintético', 'App Reservas URECA / Web', true, true, false, 'pendiente_verificacion',
   'Complejo deportivo con 5 pistas cubiertas en Nigrán.'),
  ('Complexo Deportivo de Samil (IMD)', 'complexo-deportivo-samil-imd', 'Vigo', 'Pontevedra',
   'Avenida de Samil, 32, 36212 Vigo', 42.2110, -8.7780, true,
   '+34 986 24 15 79 / 986 81 02 95', 'concelleriadeportes@vigo.org', 'https://deportes.vigo.org/',
   'Pistas de pádel de césped artificial al aire libre', false, 'césped artificial', 'Web Concello de Vigo (IMD) / Teléfono', true, false, false, 'pendiente_verificacion',
   'Pistas municipales al aire libre de césped artificial junto a la playa de Samil.');

-- Seguridad: RLS con lectura pública (el directorio es público).
alter table public.clubes enable row level security;

create policy "clubes_select" on public.clubes for select using (true);

-- Escritura pública solo para el MVP demo (verificación de fichas desde el panel);
-- subir permisos en la fase RBAC.
create policy "clubes_insert" on public.clubes for insert with check (true);
create policy "clubes_update" on public.clubes for update using (true);

-- Índices para búsqueda por ciudad / provincia y destacados.
create index if not exists idx_clubes_city on public.clubes(city, name);
create index if not exists idx_clubes_province on public.clubes(province);
create index if not exists idx_clubes_featured on public.clubes(is_featured) where is_featured;
