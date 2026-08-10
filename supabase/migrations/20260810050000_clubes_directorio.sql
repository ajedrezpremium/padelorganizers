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
   'Estrada Fragosiño, 30, Sárdoma, 36214 Vigo', 42.211841, -8.712352, false,
   '+34 986 84 17 97 / 645 01 67 42', '12padelzenter@gmail.com', 'http://www.twelvepadelzenter.com/',
   '12 pistas indoor', true, 'sintético', 'Playtomic / App Propia', true, true, false, 'pendiente_verificacion',
   'Uno de los centros de pádel más grandes de Vigo, con 12 pistas indoor y escuela propia.'),
  ('Máster Pádel Zenter', 'master-padel-zenter', 'Vigo', 'Pontevedra',
   'Rúa de Saá do Monte, 15, 36312 Vigo', 42.204442, -8.714452, false,
   '+34 747 73 24 30', '12padelzenter@gmail.com', 'N/A (Grupo Twelve)',
   '11 pistas indoor', true, 'sintético', 'Playtomic / App Propia', true, false, false, 'pendiente_verificacion',
   'Sede del grupo Twelve en Vigo con 11 pistas indoor.'),
  ('Ipadel Fitness | Sport Club', 'ipadel-fitness-sport-club', 'Mos', 'Pontevedra',
   'Avenida de Puxeiros, 86, Cabral, 36416 Mos', 42.209787, -8.657334, false,
   '+34 676 56 53 67 / 986 47 10 10', 'info@ipadelfitness.es', 'https://ipadelfitness.es/',
   '11 pistas panorámicas indoor (10D + 1I)', true, 'panorámico', 'Playtomic / Web Propia', true, true, false, 'pendiente_verificacion',
   'Club con 11 pistas panorámicas indoor en el área de Cabral/Mos.'),
  ('Win Pádel Club', 'win-padel-club', 'Vigo', 'Pontevedra',
   'Av. da Ponte, 80, Cabral, 36215 Vigo', 42.232199, -8.641072, false,
   '+34 609 78 07 31', 'info@winpadelclub.com', 'https://winpadelclub.com/',
   'Pistas cubiertas premium', true, 'premium', 'Playtomic', true, false, false, 'pendiente_verificacion',
   'Club de pádel con pistas cubiertas premium en Cabral.'),
  ('Vigo Pádel', 'vigo-padel', 'Vigo', 'Pontevedra',
   'Estrada Ponte Segade-Sárdoma, 29, 36214 Vigo', 42.211841, -8.712352, true,
   '+34 986 09 35 43', 'info@vigopadel.com', 'http://www.vigopadel.com/',
   'Pistas cubiertas climatizadas', true, 'sintético climatizado', 'Playtomic / Web Propia', true, true, false, 'pendiente_verificacion',
   'Centro de pádel con pistas climatizadas en Sárdoma.'),
  ('ARENGA PADEL CLUB', 'arenga-padel-club', 'Vigo', 'Pontevedra',
   'Camiño da Devesa, 1, Sárdoma, 36214 Vigo', 42.213423, -8.711912, false,
   '+34 986 42 51 92 / 608 802 499', 'info@arenga.es', 'http://www.arenga.es/',
   '4 pistas indoor (Césped Mondo WPT)', true, 'césped Mondo WPT', 'Playtomic', true, true, false, 'pendiente_verificacion',
   'Club con pistas indoor de césped Mondo WPT en Sárdoma.'),
  ('Indoorvigo club de padel', 'indoorvigo-club-de-padel', 'Vigo', 'Pontevedra',
   'Camiño Gandariña, 19, Nave 6, Lavadores, 36214 Vigo', 42.214341, -8.696866, false,
   '+34 986 26 18 15', 'indoor@indoorvigo.com', 'http://www.indoorvigo.com/',
   '5 pistas indoor (4 dobles y 1 individual)', true, 'sintético', 'Web Propia / Teléfono', true, false, false, 'pendiente_verificacion',
   'Centro indoor con 5 pistas en Lavadores.'),
  ('Rec Fitness & Padel Club', 'rec-fitness-padel-club', 'Vigo', 'Pontevedra',
   'Cño. do Caramuxo, 52, 36213 Vigo', 42.20727, -8.751588, false,
   '+34 986 63 24 99 / 616 79 83 04', 'recfitnesspadel@gmail.com', 'http://www.recfitness.es/',
   '4 pistas (3 cubiertas, 1 exterior techada)', true, 'sintético', 'Playtomic', true, true, false, 'pendiente_verificacion',
   'Club de fitness y pádel con 4 pistas en Caramuxo.'),
  ('Máis que Auga Barreiro', 'mais-que-auga-barreiro', 'Vigo', 'Pontevedra',
   'Rúa de Barreiro, 99, 36214 Vigo', 42.207181, -8.700674, false,
   '+34 986 26 47 44', 'barreiro@maisqueauga.com', 'https://maisqueauga.com/',
   '8 pistas (5 cubiertas, 3 muro exteriores)', true, 'sintético / muro', 'Playtomic / Web Propia', true, false, false, 'pendiente_verificacion',
   'Centro deportivo con 8 pistas de pádel en Barreiro.'),
  ('Máis que Auga Navia', 'mais-que-auga-navia', 'Vigo', 'Pontevedra',
   'Rúa de Lamelas, s/n, 36212 Vigo', 42.213544, -8.757727, false,
   '+34 986 24 74 44', 'navia@maisqueauga.com', 'https://maisqueauga.com/',
   '8 pistas indoor (7 dobles, 1 individual)', true, 'sintético', 'Playtomic / Web Propia', true, true, false, 'pendiente_verificacion',
   'Centro indoor con 8 pistas en Navia.'),
  ('Círculo Cultural Mercantil e Industrial de Vigo', 'circulo-mercantil-vigo', 'Vigo', 'Pontevedra',
   'Estrada das Plantas, 121, 36214 Vigo', 42.206244, -8.670572, false,
   '+34 986 43 33 44', 'circulomercantilvigo@gmail.com', 'https://circulomercantilvigo.com/',
   '8 pistas de pádel cubiertas (cristal y muro)', true, 'cristal y muro', 'App Socios / Zona No Socios Web', true, false, false, 'pendiente_verificacion',
   'Club con 8 pistas cubiertas de pádel, abiertas a no socios.'),
  ('Real Club Náutico de Vigo (Los Abetos)', 'real-club-nautico-vigo-los-abetos', 'Nigrán', 'Pontevedra',
   'Camiño dos Abetos, s/n, 36350 Priegue, Nigrán', 42.150131, -8.793221, false,
   '+34 986 36 61 00 / 986 44 74 41', 'gestiondeportiva@rcnauticovigo.com', 'http://www.rcnauticovigo.com/',
   '7 pistas de pádel (4 indoor, 3 outdoor)', true, 'sintético', 'Gestión Interna Socios / Teléfono', true, false, false, 'pendiente_verificacion',
   'Instalaciones deportivas Los Abetos del RCN Vigo en Nigrán.'),
  ('Club de Campo de Vigo', 'club-de-campo-de-vigo', 'Vigo', 'Pontevedra',
   'Estrada de Canido, 95, Coruxo, 36331 Vigo', 42.195235, -8.796162, false,
   '+34 986 46 03 50', 'info@clubdecampodevigo.com', 'https://www.clubdecampodevigo.com/',
   '7 pistas de pádel exteriores', false, 'sintético', 'Exclusivo Socios / Teléfono', true, false, false, 'pendiente_verificacion',
   'Club social con 7 pistas exteriores en Coruxo.'),
  ('URECA ABANCA', 'ureca-abanca', 'Nigrán', 'Pontevedra',
   'Avenida Manuel Lemos, 124, 36379 Nigrán', 42.119779, -8.812466, false,
   '+34 986 36 78 60', 'oficina@ureca.es', 'https://www.ureca.es/',
   '5 pistas de pádel cubiertas', true, 'sintético', 'App Reservas URECA / Web', true, true, false, 'pendiente_verificacion',
   'Complejo deportivo con 5 pistas cubiertas en Nigrán.'),
  ('Complexo Deportivo de Samil (IMD)', 'complexo-deportivo-samil-imd', 'Vigo', 'Pontevedra',
   'Avenida de Samil, 32, 36212 Vigo', 42.214044, -8.774528, false,
   '+34 986 24 15 79 / 986 81 02 95', 'concelleriadeportes@vigo.org', 'https://deportes.vigo.org/',
   'Pistas de pádel de césped artificial al aire libre', false, 'césped artificial', 'Web Concello de Vigo (IMD) / Teléfono', true, false, false, 'pendiente_verificacion',
   'Pistas municipales al aire libre de césped artificial junto a la playa de Samil.'),
  ('Indie Padel Club', 'indie-padel-club', 'Madrid', 'Madrid',
   'Avenida de la Democracia, 11, 28031 Madrid', 40.386292, -3.62523, false,
   '+34 683 293 467', 'info@indiepadelclub.es', 'https://www.indiepadelclub.es/',
   '15 pistas (13 indoor, 2 outdoor)', true, 'sintético', 'Playtomic',
   true, false, false, 'pendiente_verificacion',
   'Madrid: 15 pistas (13 indoor, 2 outdoor).'),
  ('PadelSpirit Club', 'padelspirit-club', 'Madrid', 'Madrid',
   'Calle Pirotecnia, 59, 28052 Madrid', 40.394353, -3.588191, false,
   '+34 617 217 171', 'info@padelspiritclub.es', 'https://www.padelspiritclub.es/',
   '9 pistas indoor WPT', true, 'sintético', 'Web Propia / Teléfono',
   true, false, false, 'pendiente_verificacion',
   'Madrid: 9 pistas indoor WPT.'),
  ('Madrid Central Pádel', 'madrid-central-padel', 'Madrid', 'Madrid',
   'Calle de Boyer, 20 y 28, 28052 Madrid', 40.403257, -3.589311, false,
   '+34 608 884 708 / 910 514 100', 'recepcion@madridcentralpadel.com', 'https://madridcentralpadel.com/',
   '17 pistas (14 indoor climatizadas, 3 outdoor)', true, 'sintético', 'Playtomic',
   true, false, false, 'pendiente_verificacion',
   'Madrid: 17 pistas (14 indoor climatizadas, 3 outdoor).'),
  ('Blue Padel Rivas', 'blue-padel-rivas', 'Rivas-Vaciamadrid', 'Madrid',
   'Calle Profesores Fuster y Menéndez, s/n, 28521 Rivas-Vaciamadrid', 40.339473, -3.527966, false,
   '+34 658 910 755 / 91 666 85 42', 'recepcion@bluepadelrivas.es', 'https://www.bluepadelrivas.com/',
   '19 pistas de cristal (8 cubiertas)', true, 'sintético', 'Playtomic',
   true, false, false, 'pendiente_verificacion',
   'Rivas-Vaciamadrid: 19 pistas de cristal (8 cubiertas).'),
  ('Euroindoor Alcorcón', 'euroindoor-alcorcon', 'Alcorcón', 'Madrid',
   'Calle Los Pintores, 6-7, Pol. Urtinsa, 28923 Alcorcón', 40.339784, -3.808608, false,
   '+34 91 025 63 44 / 625 688 323', 'info@euroindoorpadel.com', 'https://euroindoorpadel.es/',
   '18 pistas indoor (césped Mondo WPT)', true, 'sintético', 'Playtomic',
   true, false, false, 'pendiente_verificacion',
   'Alcorcón: 18 pistas indoor (césped Mondo WPT).'),
  ('M3 Padel Center (Leganés)', 'm3-padel-center-leganes', 'Leganés', 'Madrid',
   'Calle Delco, 5, 28914 Leganés', 40.319857, -3.758864, false,
   '+34 619 604 420 / 678 436 153', 'info@m3padelacademy.com', 'https://m3padelcenter.com/',
   '18 pistas panorámicas + 2 individuales', true, 'sintético', 'Web Propia / Teléfono',
   true, false, false, 'pendiente_verificacion',
   'Leganés: 18 pistas panorámicas + 2 individuales.'),
  ('Pádel Norte (Alcobendas)', 'padel-norte-alcobendas', 'Alcobendas', 'Madrid',
   'Calle de los Aragoneses, 8, 28108 Alcobendas', 40.522875, -3.661661, false,
   '+34 916 611 693', 'info@padelnorte.com', 'https://www.padelnorte.com/',
   '6 pistas indoor', true, 'sintético', 'Playtomic',
   true, false, false, 'pendiente_verificacion',
   'Alcobendas: 6 pistas indoor.'),
  ('Vim Pádel Indoor (Barajas)', 'vim-padel-indoor-barajas', 'Madrid', 'Madrid',
   'Calle de Agosto, 3, 28022 Madrid', 40.447237, -3.54304, false,
   '+34 918 602 199 / 638 952 812', 'info@vimpadel.com', 'https://www.vimpadel.com/',
   '7 pistas indoor WPT', true, 'sintético', 'Playtomic',
   true, false, false, 'pendiente_verificacion',
   'Madrid: 7 pistas indoor WPT.'),
  ('Ciudad de la Raqueta (BamVolea)', 'ciudad-de-la-raqueta-bamvolea', 'Madrid', 'Madrid',
   'Calle Monasterio de El Paular, 2, 28049 Madrid', 40.500327, -3.713749, false,
   '+34 917 297 922', 'ciudadraqueta@ciudadraqueta.com', 'https://www.ciudadraqueta.com/',
   '30 pistas de pádel (18 cubiertas, 12 descubiertas)', true, 'sintético', 'Playtomic',
   true, false, false, 'pendiente_verificacion',
   'Madrid: 30 pistas de pádel (18 cubiertas, 12 descubiertas).'),
  ('Pádel Madrid Las Tablas (Municipal)', 'padel-madrid-las-tablas-municipal', 'Madrid', 'Madrid',
   'Avenida Camino de Santiago, 25, 28050 Madrid', 40.506095, -3.672592, false,
   '+34 915 456 972 / 608 057 475', 'somos@lastablassports.club', 'https://www.madrid.es/',
   '12 pistas de pádel (10 cubiertas)', true, 'sintético', 'Web Ayuntamiento / Teléfono',
   true, false, false, 'pendiente_verificacion',
   'Madrid: 12 pistas de pádel (10 cubiertas).');

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
