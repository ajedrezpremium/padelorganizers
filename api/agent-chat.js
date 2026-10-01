/**
 * api/agent/chat.js — Persistencia de conversaciones del agente.
 *
 * POST /api/agent/chat  { userId, agentType, question, answer, lang } → inserta fila
 * GET  /api/agent/chat?userId=&agentType=&limit=50 → lista historial (más reciente primero)
 *
 * Requiere Supabase configurado (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY en Vercel).
 * RLS en tabla `agent_conversations`: user_id = auth.uid()
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uhkrrjhebiqcxnxdgvlg.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);
const admin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } }) : null;

export default async function handler(req, res) {
  if (!isConfigured) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  // POST: insertar conversación
  if (req.method === 'POST') {
    const { userId, agentType, question, answer, lang } = req.body || {};
    if (!userId || !agentType || !question || !answer) {
      return res.status(400).json({ error: 'userId, agentType, question, answer required' });
    }

    const client = admin || createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client
      .from('agent_conversations')
      .insert({
        user_id: userId,
        agent_type: agentType,
        question: question.trim(),
        answer: answer.trim(),
        lang: lang || 'es',
      })
      .select()
      .single();

    if (error) {
      console.error('[agent/chat] insert error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
  }

  // GET: listar historial
  if (req.method === 'GET') {
    const { userId, agentType, limit = '50' } = req.query;
    if (!userId || !agentType) {
      return res.status(400).json({ error: 'userId and agentType required' });
    }

    const client = admin || createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client
      .from('agent_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_type', agentType)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10) || 50);

    if (error) {
      console.error('[agent/chat] select error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data || []);
  }

  return res.status(405).json({ error: 'method not allowed' });
}