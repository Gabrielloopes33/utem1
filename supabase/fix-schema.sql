-- ============================================
-- FIX: Configurar schema nexia para API REST
-- ============================================

-- 1. Grant permissions para as roles do Supabase
GRANT USAGE ON SCHEMA nexia TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA nexia TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA nexia TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA nexia TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA nexia GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA nexia GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA nexia GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Adicionar schema nexia ao PostgREST (API REST)
-- Isso permite que o schema seja acessado via REST API
DO $$
BEGIN
    -- Verificar se a tabela pgrst.db_schemas existe (Supabase recente)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'pgrst' AND table_name = 'db_schemas'
    ) THEN
        -- Inserir schema nexia na configuração
        INSERT INTO pgrst.db_schemas (schema_name, is_default)
        VALUES ('nexia', false)
        ON CONFLICT (schema_name) DO NOTHING;
    END IF;
END $$;

-- 3. Alternative: usando a função de configuração do Supabase
-- Se você tem acesso ao dashboard, pode ir em:
-- Settings > API > Schemas adicionais
-- E adicionar "nexia"

-- 4. Garantir que as tabelas existam (criação segura)
CREATE TABLE IF NOT EXISTS nexia.competitor_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'instagram',
    profile_url TEXT,
    profile_pic_url TEXT,
    biography TEXT,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    posts_per_month INTEGER DEFAULT 0,
    avg_likes INTEGER DEFAULT 0,
    avg_comments INTEGER DEFAULT 0,
    content_breakdown JSONB DEFAULT '{"carousel": 0, "reels": 0, "image": 0}',
    apify_data JSONB,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nexia.competitor_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES nexia.competitor_data(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    caption TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    media_type TEXT CHECK (media_type IN ('carousel', 'reel', 'image')),
    timestamp TIMESTAMP WITH TIME ZONE,
    permalink TEXT,
    thumbnail_url TEXT,
    engagement_rate DECIMAL(5,2),
    apify_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(competitor_id, external_id)
);

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_competitor_posts_competitor_id ON nexia.competitor_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_timestamp ON nexia.competitor_posts(timestamp DESC);

-- 6. Políticas RLS
ALTER TABLE nexia.competitor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.competitor_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view competitor data" ON nexia.competitor_data;
CREATE POLICY "Anyone can view competitor data"
    ON nexia.competitor_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view competitor posts" ON nexia.competitor_posts;
CREATE POLICY "Anyone can view competitor posts"
    ON nexia.competitor_posts FOR SELECT USING (true);

-- 7. Trigger para updated_at
CREATE OR REPLACE FUNCTION nexia.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_competitor_data_updated_at ON nexia.competitor_data;
CREATE TRIGGER update_competitor_data_updated_at
    BEFORE UPDATE ON nexia.competitor_data
    FOR EACH ROW EXECUTE FUNCTION nexia.update_updated_at_column();

DROP TRIGGER IF EXISTS update_competitor_posts_updated_at ON nexia.competitor_posts;
CREATE TRIGGER update_competitor_posts_updated_at
    BEFORE UPDATE ON nexia.competitor_posts
    FOR EACH ROW EXECUTE FUNCTION nexia.update_updated_at_column();

-- ============================================
-- IMPORTANTE: Configuração via Dashboard
-- ============================================
-- Se o SQL acima não resolver, você PRECISA ir no:
-- 
-- Supabase Dashboard > Settings > API > Schemas adicionais
-- 
-- E adicionar "nexia" na lista de schemas.
-- 
-- Isso é necessário porque o PostgREST (API REST) só expõe
-- os schemas explicitamente configurados.
-- ============================================
