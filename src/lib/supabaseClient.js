import { createClient } from '@supabase/supabase-js';

// Claves públicas (seguras de exponer en frontend):
// - VITE_SUPABASE_URL  : https://uhkrrjhebiqcxnxdgvlg.supabase.co
// - VITE_SUPABASE_ANON_KEY : role "anon" (solo lectura/escritura dentro de RLS)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uhkrrjhebiqcxnxdgvlg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// true si el usuario configuró las dos variables en Vercel (o .env*.local)
export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});