-- ============================================
-- TABELA: time_agent_settings
-- Configurações dos agentes por usuário
-- Schema: nexia
-- ============================================

CREATE TABLE IF NOT EXISTS nexia.time_agent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por user_id
CREATE INDEX IF NOT EXISTS idx_time_agent_settings_user_id
  ON nexia.time_agent_settings(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE nexia.time_agent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent settings"
  ON nexia.time_agent_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent settings"
  ON nexia.time_agent_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent settings"
  ON nexia.time_agent_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: updated_at automático
-- ============================================

CREATE OR REPLACE FUNCTION nexia.update_time_agent_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_time_agent_settings_updated_at
  BEFORE UPDATE ON nexia.time_agent_settings
  FOR EACH ROW EXECUTE FUNCTION nexia.update_time_agent_settings_updated_at();
