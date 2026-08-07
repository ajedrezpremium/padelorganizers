/**
 * useAuth.js — Sesión de autenticación (login con email/correo).
 * Expone user, session, profile, signIn, signUp, signOut y charla loading/error.
 */

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getProfile } from '../services/dataService';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    async function boot() {
      const { data } = await supabase.auth.getSession();
      applySession(data.session);
      setLoading(false);
    }
    boot();

    const { subscription } = supabase.auth.onAuthStateChange((_event, ses) => {
      applySession(ses);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function applySession(ses) {
    setSession(ses);
    setUser(ses?.user || null);
    if (ses?.user) {
      const p = await getProfile(ses.user.id);
      setProfile(p);
    } else {
      setProfile(null);
    }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { session: data.session, error };
  }

  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { session: data.session, error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }

  return { session, user, profile, loading, signIn, signUp, signOut };
}