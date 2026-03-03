-- ============================================
-- GARANTIR QUE TABELAS EXISTAM NO SCHEMA PUBLIC
-- ============================================

-- 1. Criar tabela competitor_data (se não existir)
CREATE TABLE IF NOT EXISTS public.competitor_data (
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

-- 2. Criar tabela competitor_posts (se não existir)
CREATE TABLE IF NOT EXISTS public.competitor_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES public.competitor_data(id) ON DELETE CASCADE,
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

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_competitor_posts_competitor_id ON public.competitor_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_timestamp ON public.competitor_posts(timestamp DESC);

-- 4. Habilitar RLS
ALTER TABLE public.competitor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_posts ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas (remover se existirem e recriar)
DROP POLICY IF EXISTS "Anyone can view competitor data" ON public.competitor_data;
CREATE POLICY "Anyone can view competitor data"
    ON public.competitor_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view competitor posts" ON public.competitor_posts;
CREATE POLICY "Anyone can view competitor posts"
    ON public.competitor_posts FOR SELECT USING (true);

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_competitor_data_updated_at ON public.competitor_data;
CREATE TRIGGER update_competitor_data_updated_at
    BEFORE UPDATE ON public.competitor_data
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_competitor_posts_updated_at ON public.competitor_posts;
CREATE TRIGGER update_competitor_posts_updated_at
    BEFORE UPDATE ON public.competitor_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 
    'competitor_data' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'competitor_data') as exists
UNION ALL
SELECT 
    'competitor_posts' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'competitor_posts') as exists;
