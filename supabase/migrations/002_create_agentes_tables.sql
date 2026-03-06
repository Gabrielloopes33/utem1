-- Tabelas para os agentes do Synkra AIOS
-- Agente Generalista (Chat), Agente Gerar Post, e dados de Concorrentes

-- ============================================
-- TABELA: chat_sessions
-- Sessões de chat do agente generalista
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'Nova conversa',
    agent_type TEXT NOT NULL DEFAULT 'generalista',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: chat_messages
-- Mensagens individuais do chat
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: generated_posts
-- Posts gerados pelo agente Gerar Post
-- ============================================
CREATE TABLE IF NOT EXISTS generated_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tema TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('tecnico', 'emocional', 'objecao', 'autoridade', 'social')),
    formato TEXT NOT NULL CHECK (formato IN ('carrossel', 'card', 'reels')),
    persona TEXT NOT NULL,
    perfil_persona TEXT NOT NULL CHECK (perfil_persona IN ('conservador', 'moderado', 'agressivo')),
    campanha TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'error')),
    content JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: competitor_data
-- Dados de concorrentes vindos do Apify
-- ============================================
CREATE TABLE IF NOT EXISTS competitor_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'instagram',
    profile_url TEXT,
    
    -- Métricas principais
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    posts_per_month INTEGER DEFAULT 0,
    avg_reach INTEGER DEFAULT 0,
    
    -- Dados brutos do Apify
    apify_data JSONB,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: competitor_posts
-- Posts individuais dos concorrentes
-- ============================================
CREATE TABLE IF NOT EXISTS competitor_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitor_data(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    caption TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    reach INTEGER,
    engagement_rate DECIMAL(5,2),
    media_type TEXT CHECK (media_type IN ('carousel', 'reel', 'image')),
    timestamp TIMESTAMP WITH TIME ZONE,
    permalink TEXT,
    thumbnail_url TEXT,
    -- Análise da IA
    topic TEXT,
    why_it_worked TEXT,
    -- Dados brutos
    apify_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(competitor_id, external_id)
);

-- ============================================
-- TABELA: competitor_analyses
-- Análises geradas pelo agente de concorrentes
-- ============================================
CREATE TABLE IF NOT EXISTS competitor_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitor_data(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    ai_insights TEXT[] DEFAULT ARRAY[]::TEXT[],
    recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
    content_breakdown JSONB DEFAULT '{}',
    top_posts JSONB DEFAULT '[]'::JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_generated_posts_user_id ON generated_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_competitor_id ON competitor_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_timestamp ON competitor_posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_analyses_competitor_id ON competitor_analyses(competitor_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analyses ENABLE ROW LEVEL SECURITY;

-- Políticas para chat_sessions
CREATE POLICY "Users can view own chat sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
    ON chat_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
    ON chat_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para chat_messages
CREATE POLICY "Users can view messages from own sessions"
    ON chat_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM chat_sessions 
        WHERE chat_sessions.id = chat_messages.session_id 
        AND chat_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can create messages in own sessions"
    ON chat_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM chat_sessions 
        WHERE chat_sessions.id = chat_messages.session_id 
        AND chat_sessions.user_id = auth.uid()
    ));

-- Políticas para generated_posts
CREATE POLICY "Users can view own generated posts"
    ON generated_posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generated posts"
    ON generated_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated posts"
    ON generated_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated posts"
    ON generated_posts FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para competitor_data (todos podem ver)
CREATE POLICY "Anyone can view competitor data"
    ON competitor_data FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify competitor data"
    ON competitor_data FOR ALL
    USING (auth.role() = 'authenticated');

-- Políticas para competitor_posts (todos podem ver)
CREATE POLICY "Anyone can view competitor posts"
    ON competitor_posts FOR SELECT
    USING (true);

-- Políticas para competitor_analyses
CREATE POLICY "Users can view own analyses"
    ON competitor_analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses"
    ON competitor_analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_posts_updated_at
    BEFORE UPDATE ON generated_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitor_data_updated_at
    BEFORE UPDATE ON competitor_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitor_posts_updated_at
    BEFORE UPDATE ON competitor_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
