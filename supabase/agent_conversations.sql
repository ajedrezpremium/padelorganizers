-- agent_conversations.sql
-- Ejecutar en Supabase SQL Editor o via Management API

CREATE TABLE IF NOT EXISTS public.agent_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_type text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  lang text NOT NULL DEFAULT 'es',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_agent
  ON public.agent_conversations (user_id, agent_type, created_at DESC);

-- RLS: solo el dueño ve/inserta sus conversaciones
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select" ON public.agent_conversations;
CREATE POLICY "owner_select"
  ON public.agent_conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_insert" ON public.agent_conversations;
CREATE POLICY "owner_insert"
  ON public.agent_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_update" ON public.agent_conversations;
CREATE POLICY "owner_update"
  ON public.agent_conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_delete" ON public.agent_conversations;
CREATE POLICY "owner_delete"
  ON public.agent_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- (Opcional) Política para service_role: acceso total
DROP POLICY IF EXISTS "service_role_all" ON public.agent_conversations;
CREATE POLICY "service_role_all"
  ON public.agent_conversations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);