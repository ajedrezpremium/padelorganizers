-- ============================================================
-- PADELORGANIZERS.COM — Fase 2 directorio: geocodificación real + Madrid
-- 1) Actualiza a coordenadas de dirección reales los 15 clubes de Vigo
--    (Photon/OSM; antes eran aproximadas por ciudad).
-- 2) Inserta 10 clubes de Madrid y entorno con geo ya real.
-- Idempotente: reejecutable sin duplicar (ON CONFLICT slug).
-- ============================================================

-- 1) Geocodificación real de Vigo ------------
update public.clubes set latitude = v.lat, longitude = v.lon, geo_approx = v.approx, updated_at = now()
from (values
  ('twelve-padel-zenter-vigo', 42.211841, -8.712352, false),
  ('master-padel-zenter', 42.204442, -8.714452, false),
  ('ipadel-fitness-sport-club', 42.209787, -8.657334, false),
  ('win-padel-club', 42.232199, -8.641072, false),
  ('vigo-padel', 42.211841, -8.712352, true),
  ('arenga-padel-club', 42.213423, -8.711912, false),
  ('indoorvigo-club-de-padel', 42.214341, -8.696866, false),
  ('rec-fitness-padel-club', 42.20727, -8.751588, false),
  ('mais-que-auga-barreiro', 42.207181, -8.700674, false),
  ('mais-que-auga-navia', 42.213544, -8.757727, false),
  ('circulo-mercantil-vigo', 42.206244, -8.670572, false),
  ('real-club-nautico-vigo-los-abetos', 42.150131, -8.793221, false),
  ('club-de-campo-de-vigo', 42.195235, -8.796162, false),
  ('ureca-abanca', 42.119779, -8.812466, false),
  ('complexo-deportivo-samil-imd', 42.214044, -8.774528, false)
) as v(slug, lat, lon, approx)
where public.clubes.slug = v.slug;

-- 2) Madrid: insert si no existe (por slug) ------------
insert into public.clubes
  (name, slug, city, province, address, latitude, longitude, geo_approx,
   phone, email, website, courts, indoor, grass, booking_platform,
   has_school, has_shop, is_verified, status, description)
values
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
   'Madrid: 12 pistas de pádel (10 cubiertas).')
on conflict (slug) do nothing;