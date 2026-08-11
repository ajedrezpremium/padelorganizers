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
  {
    id: 'c-b1', name: 'Vall Parc', city: 'Barcelona', province: 'Barcelona', country: 'ES',
    address: 'Carretera de l\'Arrabassada, 107-127, 08035 Barcelona', latitude: 41.4182993, longitude: 2.1386325, geo_approx: false,
    phone: '+34 932 12 67 89 / 695 299 455', email: 'info@vallparc.com', website: 'https://www.vallparc.com/',
    courts: '19 pistas (14 outdoor, 5 indoor)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'El club de raqueta más grande de Barcelona: 19 pistas de pádel (14 outdoor, 5 indoor), tenis, gimnasio y escuela con más de 800 alumnos, al pie del Tibidabo.',
  },
  {
    id: 'c-b2', name: 'Nick Club Pádel Barcelona', city: 'Barcelona', province: 'Barcelona', country: 'ES',
    address: 'Carrer de Campoamor, 66, 08031 Barcelona', latitude: 41.4355296, longitude: 2.1541484, geo_approx: false,
    phone: '+34 605 67 13 55', email: 'hola@nickpadel.com', website: 'https://www.nickpadel.com/',
    courts: '8 pistas panorámicas (1 central CUPRA)', indoor: true, grass: 'panorámico', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con 8 pistas panorámicas en Horta-Guinardó y pista central CUPRA.',
  },
  {
    id: 'c-b3', name: 'Artós Sports Club', city: 'Barcelona', province: 'Barcelona', country: 'ES',
    address: 'Carrer dels Vergós, 67, 08017 Barcelona', latitude: 41.399678, longitude: 2.1311927, geo_approx: false,
    phone: '+34 931 162 118 / 662 602 833', email: 'info@artossportsclub.com', website: 'https://artossportsclub.com/',
    courts: '11 pistas outdoor (1 panorámica)', indoor: false, grass: 'sintético', booking_platform: 'Web Propia / WhatsApp',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club de pádel y fútbol en Sarrià con 11 pistas outdoor y escuela de pádel.',
  },
  {
    id: 'c-b4', name: 'Indoor Pádel Barcelona (22@)', city: 'Barcelona', province: 'Barcelona', country: 'ES',
    address: 'Carrer de Veneçuela, 78, 08019 Barcelona', latitude: 41.4113742, longitude: 2.2092793, geo_approx: false,
    phone: '+34 932 66 35 12', email: 'gerencia@ipadelbarcelona.com', website: 'https://www.ipadelbarcelona.com/',
    courts: '5 pistas indoor (distrito 22@)', indoor: true, grass: 'sintético', booking_platform: 'App Propia / Web',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'El primer y único padel indoor en el núcleo urbano de Barcelona, en el distrito 22@ (Sant Martí).',
  },
  {
    id: 'c-b5', name: 'Uno Padel Teixonera', city: 'Barcelona', province: 'Barcelona', country: 'ES',
    address: 'Carrer de la Granja Vella, 10, 08035 Barcelona', latitude: 41.4269126, longitude: 2.1467277, geo_approx: false,
    phone: '+34 93 101 09 33 / 667 16 29 07', email: '', website: 'https://www.unopadel.com/',
    courts: '9 pistas de pádel', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro UnoPadel en la Ciutat Deportiva Vall d\'Hebron-Teixonera con 9 pistas.',
  },
  {
    id: 'c-b6', name: 'Padel 7 Sant Andreu', city: 'Barcelona', province: 'Barcelona', country: 'ES',
    address: 'Carrer de Bonaventura Gispert, 1, 08020 Barcelona', latitude: 41.4259303, longitude: 2.1980254, geo_approx: false,
    phone: '+34 627 944 548', email: 'padel7esportiu@gmail.com', website: 'https://padel7santmarti.com/',
    courts: 'Pistas outdoor e indoor · 8.200 m²', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Sede original del grupo Padel 7 en Sant Andreu.',
  },
  {
    id: 'c-b7', name: 'Padel 7 Sant Martí', city: 'Barcelona', province: 'Barcelona', country: 'ES',
    address: 'Carrer de Puigcerdà, 111, 08019 Barcelona', latitude: 41.4137828, longitude: 2.2113413, geo_approx: false,
    phone: '+34 627 944 548', email: 'padel7esportiu@gmail.com', website: 'https://padel7santmarti.com/',
    courts: '11 pistas indoor', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Sede de Padel 7 en Sant Martí con 11 pistas indoor.',
  },
  {
    id: 'c-b8', name: 'Bela Padel Center Barcelona', city: 'Barcelona', province: 'Barcelona', country: 'ES',
    address: 'Avinguda del Parc Logístic, 28, 08040 Barcelona', latitude: 41.3410341, longitude: 2.126219, geo_approx: false,
    phone: '+34 636 242 557', email: 'info.bcn@belapadelcenter.com', website: 'https://belapadelcenter.com/',
    courts: '20 pistas (9 indoor, 11 outdoor)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Firma de Fernando Belasteguín: 20 pistas de última generación (9 indoor, 11 outdoor) en la Zona Franca de Barcelona.',
  },
  {
    id: 'c-b9', name: 'Padel Top Club (Top Padel Barcelona)', city: 'L\'Hospitalet de Llobregat', province: 'Barcelona', country: 'ES',
    address: 'Carretera del Mig, 39, 08907 L\'Hospitalet de Llobregat', latitude: 41.357904, longitude: 2.1128575, geo_approx: false,
    phone: '', email: '', website: '',
    courts: '5 pistas indoor + squash y gimnasio', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: false, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Uno de los primeros clubes indoor de Barcelona, en el área de Bellvitge (L\'Hospitalet).',
  },
  {
    id: 'c-b10', name: 'Pàdel Indoor L\'Hospitalet', city: 'L\'Hospitalet de Llobregat', province: 'Barcelona', country: 'ES',
    address: 'Carrer del Cobalt, 85, 08907 L\'Hospitalet de Llobregat', latitude: 41.3581349, longitude: 2.1087007, geo_approx: false,
    phone: '+34 635 721 728', email: 'info@padelindoorhospitalet.com', website: 'https://padelindoorhospitalet.com/',
    courts: '24 pistas indoor', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Gran centro indoor con 24 pistas en el polígono industrial de Bellvitge (L\'Hospitalet).',
  },
  {
    id: 'c-v1', name: 'Sportcity Valencia (BamVolea)', city: 'Massanassa', province: 'Valencia', country: 'ES',
    address: 'Carrer del Poliesportiu, 2, 46470 Massanassa', latitude: 39.4110157, longitude: -0.3905469, geo_approx: false,
    phone: '+34 96 113 03 50', email: '', website: 'https://sportcityvalencia.com/',
    courts: '30 pistas (20 indoor, 10 outdoor)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'De la red BamVolea: 30 pistas (20 indoor y 10 outdoor). El 2º club de pádel más grande del mundo y el mayor de la Comunitat Valenciana. Frente a Ikea.',
  },
  {
    id: 'c-v2', name: 'Pádel City VLC', city: 'Valencia', province: 'Valencia', country: 'ES',
    address: 'Valencia', latitude: 39.4699, longitude: -0.3763, geo_approx: true,
    phone: '+34 962 05 41 67', email: 'info@padelcv.com', website: 'https://padelcv.com/',
    courts: 'Pistas indoor panorámicas', indoor: true, grass: 'panorámico', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club indoor de referencia en Valencia, con pistas panorámicas y sede del grupo deportivo PadelCV.',
  },
  {
    id: 'c-v3', name: '7 Pádel', city: 'Valencia', province: 'Valencia', country: 'ES',
    address: 'Carrer dels Llanterners, 6, Vara de Quart, 46014 València', latitude: 39.4611585, longitude: -0.408754, geo_approx: false,
    phone: '+34 615 07 10 10', email: 'info@7padel.com', website: 'https://www.7padel.com/',
    courts: '11 pistas indoor (13 m de altura libre)', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / WhatsApp',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club indoor en el polígono Vara de Quart con 11 pistas de 13 metros de altura libre, tienda y escuela.',
  },
  {
    id: 'c-v4', name: 'CM Valencia Tennis Center (Malvarrosa)', city: 'Valencia', province: 'Valencia', country: 'ES',
    address: 'Carrer de Vicent la Roda, s/n, 46011 València (Malvarrosa)', latitude: 39.4794127, longitude: -0.3277079, geo_approx: false,
    phone: '+34 609 690 090 / 650 047 962', email: 'gerente@cmvalenciatenniscenter.com', website: 'https://www.cmvalenciatenniscenter.com/',
    courts: '8 pistas de pádel + 10 de tenis', indoor: false, grass: 'césped sintético', booking_platform: 'Web Propia / WhatsApp',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club de tenis y pádel junto a la playa de la Patacona, en las instalaciones del colegio Escoles Pies de Malvarrosa.',
  },
  {
    id: 'c-v5', name: 'Forus Rambleta Valencia', city: 'Valencia', province: 'Valencia', country: 'ES',
    address: 'Carrer de Pius IX, s/n, 46017 València (La Rambleta)', latitude: 39.4434254, longitude: -0.3970499, geo_approx: false,
    phone: '+34 960 663 825', email: '', website: 'https://rambleta.forus.es/',
    courts: 'Pistas de pádel exteriores', indoor: false, grass: 'sintético', booking_platform: 'Playtomic / Web Forus',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro deportivo municipal gestionado por Forus, con pistas de pádel, piscina cubierta, spa y gran oferta fitness.',
  },
  {
    id: 'c-v6', name: 'SUMA Pádel Club Patacona', city: 'Valencia', province: 'Valencia', country: 'ES',
    address: 'Passeig Marítim de la Patacona, 46113 Alboraya', latitude: 39.4849804, longitude: -0.3249837, geo_approx: false,
    phone: '+34 963 20 51 80', email: '', website: 'https://www.sumafitnessclub.com/patacona/',
    courts: '4 pistas exteriores', indoor: false, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club de pádel a 100 metros del paseo de la playa de la Patacona, con escuela y reservas por Playtomic.',
  },
  {
    id: 'c-v7', name: 'Padel Galaxy', city: 'Benetússer', province: 'Valencia', country: 'ES',
    address: 'Carrer del Camí de l\'Orba, 8, 46910 Benetússer', latitude: 39.4209075, longitude: -0.3941681, geo_approx: false,
    phone: '', email: '', website: '',
    courts: '8 pistas panorámicas', indoor: true, grass: 'panorámico', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con 8 pistas panorámicas de última generación a pocos minutos de Valencia, con torneos y escuela.',
  },
  {
    id: 'c-v8', name: 'Flow Pádel Club', city: 'Paterna', province: 'Valencia', country: 'ES',
    address: 'Carrer de la Ciutat de Sevilla, 43, PI Fuente del Jarro, 46988 Paterna', latitude: 39.5187273, longitude: -0.463549, geo_approx: false,
    phone: '', email: '', website: '',
    courts: '7 pistas indoor', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con 7 pistas indoor en el polígono Fuente del Jarro (Paterna).',
  },
  {
    id: 'c-v9', name: 'Padel Club Valencia', city: 'La Pobla de Vallbona', province: 'Valencia', country: 'ES',
    address: 'Ctra. Valencia-Ademuz, Km 20,9, 46185 La Pobla de Vallbona', latitude: 39.5907339, longitude: -0.5532185, geo_approx: true,
    phone: '', email: '', website: 'https://padelclubvalencia.es/',
    courts: '9 pistas indoor de cristal (Mondo WPT)', indoor: true, grass: 'césped Mondo / moqueta', booking_platform: 'Web Propia',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club indoor de referencia en l\'Horta Nord con 9 pistas de cristal, ligas y escuela de menores.',
  },
  {
    id: 'c-v10', name: 'SUMA Pádel Club Alfafar', city: 'Alfafar', province: 'Valencia', country: 'ES',
    address: 'Alfafar, Valencia', latitude: 39.4200749, longitude: -0.3891355, geo_approx: true,
    phone: '+34 963 20 51 80', email: '', website: 'https://sumapadelclub.com/',
    courts: '15 pistas (11 indoor, 4 exteriores) + 2 de tenis', indoor: true, grass: 'panorámico', booking_platform: 'Playtomic',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con 15 pistas panorámicas (11 indoor), 2 de tenis, escuela y centro fitness SUMA.',
  },
  {
    id: 'c-s1', name: 'Icónico Sports & Social Club', city: 'Sevilla', province: 'Sevilla', country: 'ES',
    address: 'Calle Economía, 11-13, Pol. Store, 41007 Sevilla', latitude: 37.394221, longitude: -5.9479863, geo_approx: false,
    phone: '+34 722 239 744', email: 'info@iconicosports.com', website: 'https://www.iconicosports.com/',
    courts: 'Pistas panorámicas · 9.000 m²', indoor: true, grass: 'panorámico', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Referente del pádel en Sevilla: 9.000 m² con pistas panorámicas de última generación, escuela, restauración y eventos.',
  },
  {
    id: 'c-s2', name: 'El Remate Pádel Club', city: 'Sevilla', province: 'Sevilla', country: 'ES',
    address: 'Avenida de Montes Sierra, 38, 41007 Sevilla', latitude: 37.3956621, longitude: -5.9493939, geo_approx: false,
    phone: '+34 619 817 451 / 658 090 639', email: '', website: 'https://elrematepadelclub.com/',
    courts: '11 pistas indoor de cristal cubiertas', indoor: true, grass: 'cristal', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con 11 pistas indoor de cristal y una de las escuelas de pádel más prestigiosas de Sevilla.',
  },
  {
    id: 'c-s3', name: 'Iron Padel Indoor Sevilla', city: 'Sevilla', province: 'Sevilla', country: 'ES',
    address: 'Calle Nivel, 10 (Polígono Store), 41008 Sevilla', latitude: 37.4104718, longitude: -5.9604976, geo_approx: false,
    phone: '', email: '', website: '',
    courts: '4 pistas indoor climatizadas', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club indoor climatizado en el Polígono Store, con escuela de pádel.',
  },
  {
    id: 'c-s4', name: 'IOPadel', city: 'Sevilla', province: 'Sevilla', country: 'ES',
    address: 'Avenida de la Prensa, 36, 41007 Sevilla', latitude: 37.3897757, longitude: -5.9541344, geo_approx: false,
    phone: '', email: '', website: '',
    courts: '6 pistas (4 cubiertas, 2 exteriores)', indoor: true, grass: 'sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club con 6 pistas de pádel (4 cubiertas y 2 exteriores) en Sevilla Este.',
  },
  {
    id: 'c-s5', name: 'Galisport Happiness Club', city: 'Sevilla', province: 'Sevilla', country: 'ES',
    address: 'Cardenal Bueno Monreal, s/n (Av. de la Palmera), 41013 Sevilla', latitude: 37.3679474, longitude: -5.986178, geo_approx: false,
    phone: '', email: '', website: '',
    courts: 'Pistas de pádel', indoor: false, grass: 'sintético', booking_platform: 'Web Propia',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club social y deportivo en la zona de la Palmera con pistas de pádel.',
  },
  {
    id: 'c-s6', name: 'Santé Sport & Social Club', city: 'Sevilla', province: 'Sevilla', country: 'ES',
    address: 'Avenida del Deporte, 12, 41020 Sevilla (Sevilla Este)', latitude: 37.3897486, longitude: -5.914019, geo_approx: false,
    phone: '+34 955 94 05 72', email: '', website: 'https://www.santesportsocialclub.es/',
    courts: '6 pistas de pádel (4 indoor) + fútbol 7', indoor: true, grass: 'sintético', booking_platform: 'App / Web Propia',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club privado en Sevilla Este con 6 pistas de pádel (4 indoor), piscinas, fitness y amplia zona social.',
  },
  {
    id: 'c-s7', name: 'Real Club de Tenis Betis', city: 'Sevilla', province: 'Sevilla', country: 'ES',
    address: 'Avenida Ramón Carande, 4, 41013 Sevilla', latitude: 37.369653, longitude: -5.9780869, geo_approx: false,
    phone: '+34 954 233 622', email: '', website: 'https://www.tenisbetis.com/',
    courts: '2 pistas de pádel + 6 de tenis', indoor: false, grass: 'cristal / césped artificial', booking_platform: 'Web Socios / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Histórico club sevillano (1929) con pistas de pádel y tenis, sede de la Copa Sevilla Challenger (ATP).',
  },
  {
    id: 'c-s8', name: 'Sevilla Padel Experience', city: 'Sevilla', province: 'Sevilla', country: 'ES',
    address: 'Cardenal Bueno Monreal, s/n, 41013 Sevilla', latitude: 37.3684719, longitude: -5.9833723, geo_approx: false,
    phone: '', email: '', website: 'https://sevillapadelexperience.com/',
    courts: 'Pistas panorámicas + estancias de entrenamiento', indoor: true, grass: 'panorámico', booking_platform: 'Web Propia',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club centrado en formación de alto nivel y padel tourism, con pistas panorámicas en zona Cardenal Bueno Monreal.',
  },
  {
    id: 'c-s9', name: 'Panoramic Padel Club', city: 'Sevilla', province: 'Sevilla', country: 'ES',
    address: 'Sevilla', latitude: 37.3891, longitude: -5.9845, geo_approx: true,
    phone: '', email: '', website: '',
    courts: '10 pistas (indoor y outdoor)', indoor: true, grass: 'panorámico', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club de pádel de referencia en Sevilla con pistas panorámicas y escuela.',
  },
  {
    id: 'c-s10', name: 'Infinity Indoor', city: 'Dos Hermanas', province: 'Sevilla', country: 'ES',
    address: 'Calle Adalid Domingo Ledesma, 9, 41703 Dos Hermanas (Sevilla)', latitude: 37.3130425, longitude: -5.9757148, geo_approx: false,
    phone: '+34 955 54 75 77', email: '', website: 'https://infinityindoor.com/',
    courts: '8 pistas indoor', indoor: true, grass: 'sintético', booking_platform: 'Playtomic / Web Propia',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro indoor con 8 pistas y academia de pádel en Dos Hermanas (metro de Sevilla).',
  },
  {
    id: 'c-z1', name: 'Pádel Zaragoza', city: 'Zaragoza', province: 'Zaragoza', country: 'ES',
    address: 'C/ San Juan Bautista de la Salle, 1, 50012 Zaragoza', latitude: 41.6334286, longitude: -0.92736, geo_approx: false,
    phone: '+34 876 77 66 22', email: 'info@padelzaragoza.es', website: 'https://padelzaragoza.es/',
    courts: '14 pistas (outdoor e indoor)', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: true, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'El mayor club de pádel de Zaragoza y Aragón: 14 pistas, la mayor escuela de Aragón, torneos, eventos corporativos y gastrobar.',
  },
  {
    id: 'c-z2', name: 'Pádel Indoor Aragón', city: 'Zaragoza', province: 'Zaragoza', country: 'ES',
    address: 'Camino de la Raya, s/n, 50002 Zaragoza', latitude: 41.6438521, longitude: -0.8557242, geo_approx: false,
    phone: '', email: '', website: 'https://padelindooraragon.com/',
    courts: '6 pistas cubiertas', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club indoor con 6 pistas cubiertas, escuela de pádel y zona de ocio y restauración con terraza ajardinada.',
  },
  {
    id: 'c-z3', name: 'CD Montecanal', city: 'Zaragoza', province: 'Zaragoza', country: 'ES',
    address: 'C/ de la Mesta, 35 (s/n), 50012 Zaragoza', latitude: 41.6296663, longitude: -0.944131, geo_approx: false,
    phone: '+34 976 75 58 00', email: 'padel@cdmontecanal.com', website: 'https://cdmontecanal.com/padel/',
    courts: '10 pistas (6 indoor, 4 outdoor)', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Montecanal Centro Deportivo: 6 pistas de pádel de cristal indoor y 4 exteriores, con escuela, torneos y campus.',
  },
  {
    id: 'c-z4', name: 'Regal Pádel Club', city: 'Zaragoza', province: 'Zaragoza', country: 'ES',
    address: 'CC Alcampo Los Enlaces, Antigua Carretera N-II, KM 315,2, Local 31, 50012 Zaragoza', latitude: 41.6448803, longitude: -0.923477, geo_approx: true,
    phone: '', email: '', website: 'https://regalpadelclub.com/',
    courts: '8 pistas indoor', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Reserva Online',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club indoor de referencia con 8 pistas, restaurante y zona salud, en el CC Alcampo Los Enlaces.',
  },
  {
    id: 'c-z5', name: 'Pádel Plaza', city: 'Zaragoza', province: 'Zaragoza', country: 'ES',
    address: 'Av. Diagonal Plaza, 3, Nave C, 50197 Zaragoza', latitude: 41.6347101, longitude: -0.9921257, geo_approx: false,
    phone: '', email: '', website: 'https://www.padelplaza.es/',
    courts: 'Pistas indoor y outdoor', indoor: true, grass: 'sintético', booking_platform: 'Web Propia (Reserva Online)',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club de pádel en el complejo Diagonal Plaza con reserva online de pistas y escuela.',
  },
  {
    id: 'c-z6', name: 'Zaragoza Pádel Club', city: 'Zaragoza', province: 'Zaragoza', country: 'ES',
    address: 'C/ Madre Genoveva Torres Morales, 5, Local 17, 50006 Zaragoza', latitude: 41.6417144, longitude: -0.8894862, geo_approx: false,
    phone: '+34 976 79 55 33', email: 'info@zaragozapadelclub.es', website: 'https://www.zaragozapadelclub.es/',
    courts: '38 pistas (19 cubiertas) en 10 CDMs municipales', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Gestora del pádel municipal de Zaragoza: 38 pistas (19 cubiertas) repartidas en 10 Centros Deportivos Municipales.',
  },
  {
    id: 'c-z7', name: 'C.N. Helios', city: 'Zaragoza', province: 'Zaragoza', country: 'ES',
    address: 'Parque Macanaz, s/n, 50018 Zaragoza', latitude: 41.6589887, longitude: -0.879579, geo_approx: false,
    phone: '+34 976 520 255', email: 'cnhelios@cnhelios.com', website: 'https://www.cnhelios.com/instalaciones/pistas-de-padel',
    courts: '5 pistas de pádel + tenis, squash y gimnasio', indoor: false, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Histórico club social de Zaragoza: 5 pistas de pádel, tenis, squash, gimnasio y piscinas junto al Parque Macanaz.',
  },
  {
    id: 'c-z8', name: 'CDM Delicias (Zaragoza Pádel Club)', city: 'Zaragoza', province: 'Zaragoza', country: 'ES',
    address: 'C/ Moreno Alcañiz, 2, 50017 Zaragoza', latitude: 41.655598, longitude: -0.9180261, geo_approx: false,
    phone: '+34 976 72 61 31', email: 'cdmdelicias@zaragoza.es', website: 'https://www.zaragozapadelclub.es/',
    courts: '6 pistas (4 cubiertas)', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: false, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro Deportivo Municipal Delicias-Bombarda: 6 pistas de césped artificial (4 cubiertas), gestionado por Zaragoza Pádel Club.',
  },
  {
    id: 'c-z9', name: 'CDM Almozara (Zaragoza Pádel Club)', city: 'Zaragoza', province: 'Zaragoza', country: 'ES',
    address: 'Av. de la Almozara, 65, 50001 Zaragoza', latitude: 41.66349, longitude: -0.8995166, geo_approx: false,
    phone: '+34 976 72 64 01', email: 'cdmalmozara@zaragoza.es', website: 'https://www.zaragozapadelclub.es/',
    courts: '4 pistas cubiertas', indoor: true, grass: 'sintético', booking_platform: 'Web Propia / Teléfono',
    has_school: false, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Centro Deportivo Municipal La Almozara: 4 pistas de pádel cubiertas gestionadas por Zaragoza Pádel Club.',
  },
  {
    id: 'c-z10', name: 'Real Zaragoza Club de Tenis', city: 'Zaragoza', province: 'Zaragoza', country: 'ES',
    address: 'Carretera Aeropuerto, KM 5,8, 50190 Zaragoza', latitude: 41.6646515, longitude: -0.9994234, geo_approx: false,
    phone: '+34 976 346 193', email: 'administracion@rzct.com', website: 'https://www.rzct.com/',
    courts: '9 pistas de pádel + 19 de tenis', indoor: false, grass: 'césped sintético', booking_platform: 'Playtomic',
    has_school: true, has_shop: false, is_verified: false, is_featured: false, status: 'pendiente_verificacion',
    description: 'Club histórico (1907) con 9 pistas de pádel y 19 de tenis (13 de tierra batida), gimnasio, piscina y zonas verdes.',
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