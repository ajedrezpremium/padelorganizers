/**
 * clubDirectoryService.js — Directorio Nacional de Clubes y Escuelas (#12)
 * Buscador público: tarjetas + filtros + ficha con mapa y contacto.
 * Persistencia: Supabase (tabla `clubes`) si está configurado, si no datos
 * embebidos de Vigo (misma información que la migración SQL 20260810050000).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LS_KEY = 'padelorganizers-clubes';

// Datos semilla: 15 clubes reales de Vigo y entorno (campaña de presentación).
// geo_approx = true porque las coordenadas son aproximadas por ciudad/municipio.
export const CLUBES_SEMILLA = [
  {
    id: 'c-1', name: 'Twelve Padel Zenter Vigo', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Estrada Fragosiño, 30, Sárdoma, 36214 Vigo', latitude: 42.211841, longitude: -8.712352, geo_approx: false,
    phone: '+34 986 84 17 97 / 645 01 67 42', email: '12padelzenter@gmail.com', website: 'http://www.twelvepadelzenter.com/',
    courts: '12 pistas indoor', indoor: true, grass: 'sintético', booking_platform: 'Playtomic / App Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Uno de los centros de pádel más grandes de Vigo, con 12 pistas indoor y escuela propia.',
  },
  {
    id: 'c-2', name: 'Máster Pádel Zenter', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Rúa de Saá do Monte, 15, 36312 Vigo', latitude: 42.204442, longitude: -8.714452, geo_approx: false,
    phone: '+34 747 73 24 30', email: '12padelzenter@gmail.com', website: 'N/A (Grupo Twelve)',
    courts: '11 pistas indoor', indoor: true, grass: 'sintético', booking_platform: 'Playtomic / App Propia',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Sede del grupo Twelve en Vigo con 11 pistas indoor.',
  },
  {
    id: 'c-3', name: 'Ipadel Fitness | Sport Club', city: 'Mos', province: 'Pontevedra', country: 'ES',
    address: 'Avenida de Puxeiros, 86, Cabral, 36416 Mos', latitude: 42.209787, longitude: -8.657334, geo_approx: false,
    phone: '+34 676 56 53 67 / 986 47 10 10', email: 'info@ipadelfitness.es', website: 'https://ipadelfitness.es/',
    courts: '11 pistas panorámicas indoor (10D + 1I)', indoor: true, grass: 'panorámico', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con 11 pistas panorámicas indoor en el área de Cabral/Mos.',
  },
  {
    id: 'c-4', name: 'Win Pádel Club', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Av. da Ponte, 80, Cabral, 36215 Vigo', latitude: 42.232199, longitude: -8.641072, geo_approx: false,
    phone: '+34 609 78 07 31', email: 'info@winpadelclub.com', website: 'https://winpadelclub.com/',
    courts: 'Pistas cubiertas premium', indoor: true, grass: 'premium', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club de pádel con pistas cubiertas premium en Cabral.',
  },
  {
    id: 'c-5', name: 'Vigo Pádel', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Estrada Ponte Segade-Sárdoma, 29, 36214 Vigo', latitude: 42.211841, longitude: -8.712352, geo_approx: true,
    phone: '+34 986 09 35 43', email: 'info@vigopadel.com', website: 'http://www.vigopadel.com/',
    courts: 'Pistas cubiertas climatizadas', indoor: true, grass: 'sintético climatizado', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro de pádel con pistas climatizadas en Sárdoma.',
  },
  {
    id: 'c-6', name: 'ARENGA PADEL CLUB', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Camiño da Devesa, 1, Sárdoma, 36214 Vigo', latitude: 42.213423, longitude: -8.711912, geo_approx: false,
    phone: '+34 986 42 51 92 / 608 802 499', email: 'info@arenga.es', website: 'http://www.arenga.es/',
    courts: '4 pistas indoor (Césped Mondo WPT)', indoor: true, grass: 'césped Mondo WPT', booking_platform: 'Playtomic',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con pistas indoor de césped Mondo WPT en Sárdoma.',
  },
  {
    id: 'c-7', name: 'Indoorvigo club de padel', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Camiño Gandariña, 19, Nave 6, Lavadores, 36214 Vigo', latitude: 42.214341, longitude: -8.696866, geo_approx: false,
    phone: '+34 986 26 18 15', email: 'indoor@indoorvigo.com', website: 'http://www.indoorvigo.com/',
    courts: '5 pistas indoor (4 dobles y 1 individual)', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro indoor con 5 pistas en Lavadores.',
  },
  {
    id: 'c-8', name: 'Rec Fitness & Padel Club', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Cño. do Caramuxo, 52, 36213 Vigo', latitude: 42.20727, longitude: -8.751588, geo_approx: false,
    phone: '+34 986 63 24 99 / 616 79 83 04', email: 'recfitnesspadel@gmail.com', website: 'http://www.recfitness.es/',
    courts: '4 pistas (3 cubiertas, 1 exterior techada)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club de fitness y pádel con 4 pistas en Caramuxo.',
  },
  {
    id: 'c-9', name: 'Máis que Auga Barreiro', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Rúa de Barreiro, 99, 36214 Vigo', latitude: 42.207181, longitude: -8.700674, geo_approx: false,
    phone: '+34 986 26 47 44', email: 'barreiro@maisqueauga.com', website: 'https://maisqueauga.com/',
    courts: '8 pistas (5 cubiertas, 3 muro exteriores)', indoor: true, grass: 'sintético / muro', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro deportivo con 8 pistas de pádel en Barreiro.',
  },
  {
    id: 'c-10', name: 'Máis que Auga Navia', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Rúa de Lamelas, s/n, 36212 Vigo', latitude: 42.213544, longitude: -8.757727, geo_approx: false,
    phone: '+34 986 24 74 44', email: 'navia@maisqueauga.com', website: 'https://maisqueauga.com/',
    courts: '8 pistas indoor (7 dobles, 1 individual)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro indoor con 8 pistas en Navia.',
  },
  {
    id: 'c-11', name: 'Círculo Cultural Mercantil e Industrial de Vigo', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Estrada das Plantas, 121, 36214 Vigo', latitude: 42.206244, longitude: -8.670572, geo_approx: false,
    phone: '+34 986 43 33 44', email: 'circulomercantilvigo@gmail.com', website: 'https://circulomercantilvigo.com/',
    courts: '8 pistas de pádel cubiertas (cristal y muro)', indoor: true, grass: 'cristal y muro', booking_platform: 'App Socios / Zona No Socios Web',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con 8 pistas cubiertas de pádel, abiertas a no socios.',
  },
  {
    id: 'c-12', name: 'Real Club Náutico de Vigo (Los Abetos)', city: 'Nigrán', province: 'Pontevedra', country: 'ES',
    address: 'Camiño dos Abetos, s/n, 36350 Priegue, Nigrán', latitude: 42.150131, longitude: -8.793221, geo_approx: false,
    phone: '+34 986 36 61 00 / 986 44 74 41', email: 'info@rcnauticovigo.com', website: 'http://www.rcnauticovigo.com/',
    courts: '7 pistas de pádel (4 indoor, 3 outdoor)', indoor: true, grass: 'sintético', booking_platform: 'Gestión Interna Socios / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Instalaciones deportivas Los Abetos del RCN Vigo en Nigrán.',
  },
  {
    id: 'c-13', name: 'Club de Campo de Vigo', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Estrada de Canido, 95, Coruxo, 36331 Vigo', latitude: 42.195235, longitude: -8.796162, geo_approx: false,
    phone: '+34 986 46 03 50', email: 'info@clubdecampodevigo.com', website: 'https://www.clubdecampodevigo.com/',
    courts: '7 pistas de pádel exteriores', indoor: false, grass: 'sintético', booking_platform: 'Exclusivo Socios / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club social con 7 pistas exteriores en Coruxo.',
  },
  {
    id: 'c-14', name: 'URECA ABANCA', city: 'Nigrán', province: 'Pontevedra', country: 'ES',
    address: 'Avenida Manuel Lemos, 124, 36379 Nigrán', latitude: 42.119779, longitude: -8.812466, geo_approx: false,
    phone: '+34 986 36 78 60', email: 'oficina@ureca.es', website: 'https://www.ureca.es/',
    courts: '5 pistas de pádel cubiertas', indoor: true, grass: 'sintético', booking_platform: 'App Reservas URECA / Web',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Complejo deportivo con 5 pistas cubiertas en Nigrán.',
  },
  {
    id: 'c-15', name: 'Complexo Deportivo de Samil (IMD)', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Avenida de Samil, 32, 36212 Vigo', latitude: 42.214044, longitude: -8.774528, geo_approx: false,
    phone: '+34 986 24 15 79 / 986 81 02 95', email: 'concelleriadeportes@vigo.org', website: 'https://deportes.vigo.org/',
    courts: 'Pistas de pádel de césped artificial al aire libre', indoor: false, grass: 'césped artificial', booking_platform: 'Web Concello de Vigo (IMD) / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Pistas municipales al aire libre de césped artificial junto a la playa de Samil.',
  },
  {
    id: 'c-m1', name: 'Indie Padel Club', city: 'Madrid', province: 'Madrid', country: 'ES',
    address: 'Avenida de la Democracia, 11, 28031 Madrid', latitude: 40.386292, longitude: -3.62523, geo_approx: false,
    phone: '+34 683 293 467', email: 'info@indiepadelclub.es', website: 'https://www.indiepadelclub.es/',
    courts: '15 pistas (13 indoor, 2 outdoor)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Madrid: 15 pistas (13 indoor, 2 outdoor).',
  },
  {
    id: 'c-m2', name: 'PadelSpirit Club', city: 'Madrid', province: 'Madrid', country: 'ES',
    address: 'Calle Pirotecnia, 59, 28052 Madrid', latitude: 40.394353, longitude: -3.588191, geo_approx: false,
    phone: '+34 617 217 171', email: 'info@padelspiritclub.es', website: 'https://www.padelspiritclub.es/',
    courts: '9 pistas indoor WPT', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Madrid: 9 pistas indoor WPT.',
  },
  {
    id: 'c-m3', name: 'Madrid Central Pádel', city: 'Madrid', province: 'Madrid', country: 'ES',
    address: 'Calle de Boyer, 20 y 28, 28052 Madrid', latitude: 40.403257, longitude: -3.589311, geo_approx: false,
    phone: '+34 608 884 708 / 910 514 100', email: 'recepcion@madridcentralpadel.com', website: 'https://madridcentralpadel.com/',
    courts: '17 pistas (14 indoor climatizadas, 3 outdoor)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Madrid: 17 pistas (14 indoor climatizadas, 3 outdoor).',
  },
  {
    id: 'c-m4', name: 'Blue Padel Rivas', city: 'Rivas-Vaciamadrid', province: 'Madrid', country: 'ES',
    address: 'Calle Profesores Fuster y Menéndez, s/n, 28521 Rivas-Vaciamadrid', latitude: 40.339473, longitude: -3.527966, geo_approx: false,
    phone: '+34 658 910 755 / 91 666 85 42', email: 'recepcion@bluepadelrivas.es', website: 'https://www.bluepadelrivas.com/',
    courts: '19 pistas de cristal (8 cubiertas)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Rivas-Vaciamadrid: 19 pistas de cristal (8 cubiertas).',
  },
  {
    id: 'c-m5', name: 'Euroindoor Alcorcón', city: 'Alcorcón', province: 'Madrid', country: 'ES',
    address: 'Calle Los Pintores, 6-7, Pol. Urtinsa, 28923 Alcorcón', latitude: 40.339784, longitude: -3.808608, geo_approx: false,
    phone: '+34 91 025 63 44 / 625 688 323', email: 'info@euroindoorpadel.com', website: 'https://euroindoorpadel.es/',
    courts: '18 pistas indoor (césped Mondo WPT)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Alcorcón: 18 pistas indoor (césped Mondo WPT).',
  },
  {
    id: 'c-m6', name: 'M3 Padel Center (Leganés)', city: 'Leganés', province: 'Madrid', country: 'ES',
    address: 'Calle Delco, 5, 28914 Leganés', latitude: 40.319857, longitude: -3.758864, geo_approx: false,
    phone: '+34 619 604 420 / 678 436 153', email: 'info@m3padelacademy.com', website: 'https://m3padelcenter.com/',
    courts: '18 pistas panorámicas + 2 individuales', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Leganés: 18 pistas panorámicas + 2 individuales.',
  },
  {
    id: 'c-m7', name: 'Pádel Norte (Alcobendas)', city: 'Alcobendas', province: 'Madrid', country: 'ES',
    address: 'Calle de los Aragoneses, 8, 28108 Alcobendas', latitude: 40.522875, longitude: -3.661661, geo_approx: false,
    phone: '+34 916 611 693', email: 'info@padelnorte.com', website: 'https://www.padelnorte.com/',
    courts: '6 pistas indoor', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Alcobendas: 6 pistas indoor.',
  },
  {
    id: 'c-m8', name: 'Vim Pádel Indoor (Barajas)', city: 'Madrid', province: 'Madrid', country: 'ES',
    address: 'Calle de Agosto, 3, 28022 Madrid', latitude: 40.447237, longitude: -3.54304, geo_approx: false,
    phone: '+34 918 602 199 / 638 952 812', email: 'info@vimpadel.com', website: 'https://www.vimpadel.com/',
    courts: '7 pistas indoor WPT', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Madrid: 7 pistas indoor WPT.',
  },
  {
    id: 'c-m9', name: 'Ciudad de la Raqueta (BamVolea)', city: 'Madrid', province: 'Madrid', country: 'ES',
    address: 'Calle Monasterio de El Paular, 2, 28049 Madrid', latitude: 40.500327, longitude: -3.713749, geo_approx: false,
    phone: '+34 917 297 922', email: 'ciudadraqueta@ciudadraqueta.com', website: 'https://www.ciudadraqueta.com/',
    courts: '30 pistas de pádel (18 cubiertas, 12 descubiertas)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Madrid: 30 pistas de pádel (18 cubiertas, 12 descubiertas).',
  },
  {
    id: 'c-m10', name: 'Pádel Madrid Las Tablas (Municipal)', city: 'Madrid', province: 'Madrid', country: 'ES',
    address: 'Avenida Camino de Santiago, 25, 28050 Madrid', latitude: 40.506095, longitude: -3.672592, geo_approx: false,
    phone: '+34 915 456 972 / 608 057 475', email: 'somos@lastablassports.club', website: 'https://www.madrid.es/',
    courts: '12 pistas de pádel (10 cubiertas)', indoor: true, grass: 'sintético', booking_platform: 'Web Ayuntamiento / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Madrid: 12 pistas de pádel (10 cubiertas).',
  },
];

export function directorioOnline() {
  return isSupabaseConfigured;
}

// Lista todos los clubes del directorio (nube si está configurado y hay datos,
// si no semilla de Vigo). Ante error (p.ej. tabla `clubes` aún no creada) o
// tabla vacía, cae a los datos embebidos para que el directorio siempre funcione.
export async function listClubes() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('clubes')
      .select('*')
      .order('city', { ascending: true })
      .order('name', { ascending: true });
    if (!error && data && data.length) return data;
  }
  return CLUBES_SEMILLA;
}

// Ciudades disponibles (para el filtro).
export async function listCiudades(clubes) {
  const uniq = [...new Set(clubes.map((c) => c.city))].sort();
  return uniq;
}

// Busca un club por id o slug sobre los datos cargados.
export function findClub(clubes, idOrSlug) {
  if (!idOrSlug) return null;
  return clubes.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
}

// Solicitar verificación de una ficha (sin token): registra el interés.
// Debe configurarse Supabase para que funcione de verdad (RPC).
export async function solicitarVerificacion({ clubId, nombre, email, cargo, notas }) {
  if (!isSupabaseConfigured) return { ok: false, demo: true };
  const { data, error } = await supabase.rpc('solicitar_verificacion', {
    p_club_id: clubId,
    p_contacto_nombre: nombre || null,
    p_contacto_email: email || null,
    p_contacto_cargo: cargo || null,
    p_notas: notas || null,
  });
  if (error) return { ok: false, error };
  return { ok: true, data };
}

// Confirmar verificación con el token mágico del correo de la campaña.
export async function confirmarVerificacion({ clubId, token, nombre, email, cargo }) {
  if (!isSupabaseConfigured) return { ok: false, demo: true };
  const { data, error } = await supabase.rpc('confirmar_verificacion', {
    p_club_id: clubId,
    p_token: token,
    p_contacto_nombre: nombre || null,
    p_contacto_email: email || null,
    p_contacto_cargo: cargo || null,
  });
  if (error) return { ok: false, error };
  return { ok: true, data };
}