-- Migration: Create campaign_posts table
-- Posts gerados para cada campanha

CREATE TABLE IF NOT EXISTS campaign_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Conteúdo do post
    title TEXT,
    content TEXT NOT NULL,
    caption TEXT, -- Legenda para Instagram
    
    -- Configurações
    tipo TEXT CHECK (tipo IN ('tecnico', 'emocional', 'objecao', 'autoridade', 'social')),
    formato TEXT CHECK (formato IN ('carrossel', 'card', 'reels')),
    
    -- Status do post
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'scheduled', 'published', 'rejected')),
    
    -- Slides (para carrossel)
    slides JSONB DEFAULT '[]'::JSONB,
    -- Ex: [{"text": "Slide 1", "image_prompt": "..."}, {"text": "Slide 2", ...}]
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    -- Pode incluir: hashtags, mentions, image_prompts, etc
    
    -- AI Feedback
    ai_version INTEGER DEFAULT 1, -- Versão da geração
    ai_feedback TEXT, -- Feedback do usuário para regeneração
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_campaign_posts_campaign_id ON campaign_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_user_id ON campaign_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_status ON campaign_posts(status);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_created_at ON campaign_posts(created_at DESC);

-- Enable RLS
ALTER TABLE campaign_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own campaign posts"
    ON campaign_posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaign posts"
    ON campaign_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaign posts"
    ON campaign_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaign posts"
    ON campaign_posts FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_campaign_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_posts_updated_at
    BEFORE UPDATE ON campaign_posts
    FOR EACH ROW EXECUTE FUNCTION update_campaign_posts_updated_at();

-- Grant permissions
GRANT ALL ON campaign_posts TO authenticated;
GRANT ALL ON campaign_posts TO service_role;
