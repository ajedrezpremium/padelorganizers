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
    address: 'Estrada Fragosiño, 30, Sárdoma, 36214 Vigo', latitude: 42.2145, longitude: -8.721, geo_approx: true,
    phone: '+34 986 84 17 97 / 645 01 67 42', email: '12padelzenter@gmail.com', website: 'http://www.twelvepadelzenter.com/',
    courts: '12 pistas indoor', indoor: true, grass: 'sintético', booking_platform: 'Playtomic / App Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Uno de los centros de pádel más grandes de Vigo, con 12 pistas indoor y escuela propia.',
  },
  {
    id: 'c-2', name: 'Máster Pádel Zenter', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Rúa de Saá do Monte, 15, 36312 Vigo', latitude: 42.2112, longitude: -8.7205, geo_approx: true,
    phone: '+34 747 73 24 30', email: '12padelzenter@gmail.com', website: 'N/A (Grupo Twelve)',
    courts: '11 pistas indoor', indoor: true, grass: 'sintético', booking_platform: 'Playtomic / App Propia',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Sede del grupo Twelve en Vigo con 11 pistas indoor.',
  },
  {
    id: 'c-3', name: 'Ipadel Fitness | Sport Club', city: 'Mos', province: 'Pontevedra', country: 'ES',
    address: 'Avenida de Puxeiros, 86, Cabral, 36416 Mos', latitude: 42.213, longitude: -8.669, geo_approx: true,
    phone: '+34 676 56 53 67 / 986 47 10 10', email: 'info@ipadelfitness.es', website: 'https://ipadelfitness.es/',
    courts: '11 pistas panorámicas indoor (10D + 1I)', indoor: true, grass: 'panorámico', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con 11 pistas panorámicas indoor en el área de Cabral/Mos.',
  },
  {
    id: 'c-4', name: 'Win Pádel Club', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Av. da Ponte, 80, Cabral, 36215 Vigo', latitude: 42.2205, longitude: -8.686, geo_approx: true,
    phone: '+34 609 78 07 31', email: 'info@winpadelclub.com', website: 'https://winpadelclub.com/',
    courts: 'Pistas cubiertas premium', indoor: true, grass: 'premium', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club de pádel con pistas cubiertas premium en Cabral.',
  },
  {
    id: 'c-5', name: 'Vigo Pádel', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Estrada Ponte Segade-Sárdoma, 29, 36214 Vigo', latitude: 42.213, longitude: -8.718, geo_approx: true,
    phone: '+34 986 09 35 43', email: 'info@vigopadel.com', website: 'http://www.vigopadel.com/',
    courts: 'Pistas cubiertas climatizadas', indoor: true, grass: 'sintético climatizado', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro de pádel con pistas climatizadas en Sárdoma.',
  },
  {
    id: 'c-6', name: 'ARENGA PADEL CLUB', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Camiño da Devesa, 1, Sárdoma, 36214 Vigo', latitude: 42.214, longitude: -8.719, geo_approx: true,
    phone: '+34 986 42 51 92 / 608 802 499', email: 'info@arenga.es', website: 'http://www.arenga.es/',
    courts: '4 pistas indoor (Césped Mondo WPT)', indoor: true, grass: 'césped Mondo WPT', booking_platform: 'Playtomic',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con pistas indoor de césped Mondo WPT en Sárdoma.',
  },
  {
    id: 'c-7', name: 'Indoorvigo club de padel', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Camiño Gandariña, 19, Nave 6, Lavadores, 36214 Vigo', latitude: 42.222, longitude: -8.701, geo_approx: true,
    phone: '+34 986 26 18 15', email: 'indoor@indoorvigo.com', website: 'http://www.indoorvigo.com/',
    courts: '5 pistas indoor (4 dobles y 1 individual)', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro indoor con 5 pistas en Lavadores.',
  },
  {
    id: 'c-8', name: 'Rec Fitness & Padel Club', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Cño. do Caramuxo, 52, 36213 Vigo', latitude: 42.225, longitude: -8.735, geo_approx: true,
    phone: '+34 986 63 24 99 / 616 79 83 04', email: 'recfitnesspadel@gmail.com', website: 'http://www.recfitness.es/',
    courts: '4 pistas (3 cubiertas, 1 exterior techada)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club de fitness y pádel con 4 pistas en Caramuxo.',
  },
  {
    id: 'c-9', name: 'Máis que Auga Barreiro', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Rúa de Barreiro, 99, 36214 Vigo', latitude: 42.224, longitude: -8.729, geo_approx: true,
    phone: '+34 986 26 47 44', email: 'barreiro@maisqueauga.com', website: 'https://maisqueauga.com/',
    courts: '8 pistas (5 cubiertas, 3 muro exteriores)', indoor: true, grass: 'sintético / muro', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro deportivo con 8 pistas de pádel en Barreiro.',
  },
  {
    id: 'c-10', name: 'Máis que Auga Navia', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Rúa de Lamelas, s/n, 36212 Vigo', latitude: 42.235, longitude: -8.713, geo_approx: true,
    phone: '+34 986 24 74 44', email: 'navia@maisqueauga.com', website: 'https://maisqueauga.com/',
    courts: '8 pistas indoor (7 dobles, 1 individual)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro indoor con 8 pistas en Navia.',
  },
  {
    id: 'c-11', name: 'Círculo Cultural Mercantil e Industrial de Vigo', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Estrada das Plantas, 121, 36214 Vigo', latitude: 42.216, longitude: -8.723, geo_approx: true,
    phone: '+34 986 43 33 44', email: 'circulomercantilvigo@gmail.com', website: 'https://circulomercantilvigo.com/',
    courts: '8 pistas de pádel cubiertas (cristal y muro)', indoor: true, grass: 'cristal y muro', booking_platform: 'App Socios / Zona No Socios Web',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con 8 pistas cubiertas de pádel, abiertas a no socios.',
  },
  {
    id: 'c-12', name: 'Real Club Náutico de Vigo (Los Abetos)', city: 'Nigrán', province: 'Pontevedra', country: 'ES',
    address: 'Camiño dos Abetos, s/n, 36350 Priegue, Nigrán', latitude: 42.182, longitude: -8.792, geo_approx: true,
    phone: '+34 986 36 61 00 / 986 44 74 41', email: 'gestiondeportiva@rcnauticovigo.com', website: 'http://www.rcnauticovigo.com/',
    courts: '7 pistas de pádel (4 indoor, 3 outdoor)', indoor: true, grass: 'sintético', booking_platform: 'Gestión Interna Socios / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Instalaciones deportivas Los Abetos del RCN Vigo en Nigrán.',
  },
  {
    id: 'c-13', name: 'Club de Campo de Vigo', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Estrada de Canido, 95, Coruxo, 36331 Vigo', latitude: 42.221, longitude: -8.76, geo_approx: true,
    phone: '+34 986 46 03 50', email: 'info@clubdecampodevigo.com', website: 'https://www.clubdecampodevigo.com/',
    courts: '7 pistas de pádel exteriores', indoor: false, grass: 'sintético', booking_platform: 'Exclusivo Socios / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club social con 7 pistas exteriores en Coruxo.',
  },
  {
    id: 'c-14', name: 'URECA ABANCA', city: 'Nigrán', province: 'Pontevedra', country: 'ES',
    address: 'Avenida Manuel Lemos, 124, 36379 Nigrán', latitude: 42.163, longitude: -8.778, geo_approx: true,
    phone: '+34 986 36 78 60', email: 'oficina@ureca.es', website: 'https://www.ureca.es/',
    courts: '5 pistas de pádel cubiertas', indoor: true, grass: 'sintético', booking_platform: 'App Reservas URECA / Web',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Complejo deportivo con 5 pistas cubiertas en Nigrán.',
  },
  {
    id: 'c-15', name: 'Complexo Deportivo de Samil (IMD)', city: 'Vigo', province: 'Pontevedra', country: 'ES',
    address: 'Avenida de Samil, 32, 36212 Vigo', latitude: 42.211, longitude: -8.778, geo_approx: true,
    phone: '+34 986 24 15 79 / 986 81 02 95', email: 'concelleriadeportes@vigo.org', website: 'https://deportes.vigo.org/',
    courts: 'Pistas de pádel de césped artificial al aire libre', indoor: false, grass: 'césped artificial', booking_platform: 'Web Concello de Vigo (IMD) / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Pistas municipales al aire libre de césped artificial junto a la playa de Samil.',
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