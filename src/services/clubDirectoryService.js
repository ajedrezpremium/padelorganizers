/**
 * clubDirectoryService.js — Directorio Nacional de Clubes y Escuelas (#12)
 * Buscador público: tarjetas + filtros + ficha con mapa y contacto.
 * Persistencia: Supabase (tabla `clubes`) si está configurado, si no datos
 * semilla desde `/clubes-semilla.json` (caché inmutable, solo se descarga en /clubes y /verificar).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LS_KEY = 'padelorganizers-clubes';

let _semillaCache = null;

export async function loadSemilla() {
  if (_semillaCache) return _semillaCache;
  try {
    const res = await fetch('/clubes-semilla.json', { cache: 'force-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _semillaCache = await res.json();
    return _semillaCache;
  } catch (e) {
    console.error('[clubDirectoryService] Error cargando semilla:', e);
    _semillaCache = [];
    return _semillaCache;
  }
}

// Comprueba si el directorio está en modo online (Supabase configurado)
export function directorioOnline() {
  return isSupabaseConfigured;
}

// Lista todos los clubes del directorio (nube si está configurado y hay datos,
// si no semilla desde JSON). Ante error (p.ej. tabla `clubes` aún no creada) o
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
  return loadSemilla();
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

// Actualiza/crea ficha (solo admin / dueño verificado vía RLS).
export async function upsertClub(club) {
  if (!isSupabaseConfigured) return { ok: false, demo: true };
  const { data, error } = await supabase
    .from('clubes')
    .upsert(club, { onConflict: 'id' })
    .select()
    .single();
  if (error) return { ok: false, error };
  return { ok: true, data };
}

// Borra ficha (solo admin / dueño verificado vía RLS).
export async function deleteClub(id) {
  if (!isSupabaseConfigured) return { ok: false, demo: true };
  const { error } = await supabase.from('clubes').delete().eq('id', id);
  if (error) return { ok: false, error };
  return { ok: true };
}