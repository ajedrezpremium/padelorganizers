/**
 * api/agent-chat.js — Persistencia de conversaciones del agente.
 *
 * POST /api/agent/chat  { userId, agentType, question, answer, lang }
 *   Headers: Authorization: Bearer <JWT de Supabase>  → inserta fila
 * GET  /api/agent/chat?agentType=&limit=50
 *   Headers: Authorization: Bearer <JWT de Supabase>  → historial del usuario del token
 *
 * Requiere en Vercel: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * El userId SIEMPRE se deriva del JWT (nunca del body/query): un cliente no
 * puede leer ni escribir conversaciones atribuidas a otro usuario.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

const isConfigured = Boolean(supabaseUrl && supabaseServiceKey);
let admin = null;
function getAdmin() {
  if (!admin) {
    admin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
  }
  return admin;
}

// Extrae el Bearer token y devuelve el userId autenticado, o error.
async function authenticate(req) {
  const header = (req.headers.authorization || req.headers.Authorization || '').trim();
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return { error: 'missing Authorization Bearer token', status: 401 };
  const token = match[1];
  if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token)) {
    return { error: 'invalid token format', status: 401 };
  }
  const { data, error } = await getAdmin().auth.getUser(token);
  if (error || !data || !data.user) {
    return { error: 'invalid or expired token', status: 401 };
  }
  return { userId: data.user.id };
}

export default async function handler(req, res) {
  if (!isConfigured) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const auth = await authenticate(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }
  const userId = auth.userId;

  // POST: insertar conversación
  if (req.method === 'POST') {
    const { agentType, question, answer, lang } = req.body || {};
    if (!agentType || !question || !answer) {
      return res.status(400).json({ error: 'agentType, question, answer required' });
    }
    if (typeof question !== 'string' || question.length > 10000 || typeof answer !== 'string' || answer.length > 10000) {
      return res.status(400).json({ error: 'question/answer must be strings <= 10000 chars' });
    }

    const { data, error } = await getAdmin()
      .from('agent_conversations')
      .insert({
        user_id: userId, // derivado del JWT, no del body
        agent_type: String(agentType).slice(0, 64),
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

  // GET: listar historial del usuario autenticado
  if (req.method === 'GET') {
    const { agentType, limit = '50' } = req.query;
    if (!agentType) {
      return res.status(400).json({ error: 'agentType required' });
    }
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    const { data, error } = await getAdmin()
      .from('agent_conversations')
      .select('*')
      .eq('user_id', userId) // derivado del JWT, no del query
      .eq('agent_type', agentType)
      .order('created_at', { ascending: false })
      .limit(parsedLimit);

    if (error) {
      console.error('[agent/chat] select error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data || []);
  }

  return res.status(405).json({ error: 'method not allowed' });
}
