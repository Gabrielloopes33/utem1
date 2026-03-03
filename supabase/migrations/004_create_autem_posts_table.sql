-- Tabela para armazenar posts da conta @autem.inv
CREATE TABLE IF NOT EXISTS public.autem_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL, -- ID do post no Instagram
    short_code TEXT UNIQUE NOT NULL,   -- Código curto do post (para URL)
    caption TEXT,                      -- Legenda do post
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    media_type TEXT CHECK (media_type IN ('carousel', 'reel', 'image', 'video')),
    timestamp TIMESTAMP WITH TIME ZONE,
    permalink TEXT NOT NULL,           -- URL direta do post
    thumbnail_url TEXT,                -- URL da imagem/thumbnail
    display_url TEXT,                  -- URL da imagem em alta resolução
    video_url TEXT,                    -- URL do vídeo (se for reel/video)
    video_view_count INTEGER DEFAULT 0, -- Views (para reels/videos)
    hashtags TEXT[],                   -- Array de hashtags
    mentions TEXT[],                   -- Array de menções
    engagement_rate NUMERIC(5,2) DEFAULT 0, -- Taxa de engajamento calculada
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_autem_posts_timestamp ON public.autem_posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_autem_posts_engagement ON public.autem_posts(engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_autem_posts_media_type ON public.autem_posts(media_type);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_autem_posts_updated_at ON public.autem_posts;
CREATE TRIGGER update_autem_posts_updated_at
    BEFORE UPDATE ON public.autem_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.autem_posts IS 'Posts da conta oficial @autem.inv do Instagram';
COMMENT ON COLUMN public.autem_posts.external_id IS 'ID único do post no Instagram';
COMMENT ON COLUMN public.autem_posts.short_code IS 'Código curto usado na URL (ex: Cxyz123ABC)';
COMMENT ON COLUMN public.autem_posts.engagement_rate IS 'Taxa de engajamento: (likes + comments) / followers * 100';
