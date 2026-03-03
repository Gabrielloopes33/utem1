-- ============================================
-- TABELA: personas
-- Perfis de investidores para direcionar conteúdo
-- ============================================
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    profile_type TEXT NOT NULL CHECK (profile_type IN ('conservador', 'moderado', 'agressivo')),
    age_range TEXT,
    income_range TEXT,
    patrimony_range TEXT,
    objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
    fears TEXT[] DEFAULT ARRAY[]::TEXT[],
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    communication_tone TEXT,
    preferred_channels JSONB DEFAULT '{}',
    conversion_triggers TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);
CREATE INDEX IF NOT EXISTS idx_personas_profile_type ON personas(profile_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Políticas para personas
CREATE POLICY "Users can view own personas"
    ON personas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own personas"
    ON personas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personas"
    ON personas FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personas"
    ON personas FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_personas_updated_at
    BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
