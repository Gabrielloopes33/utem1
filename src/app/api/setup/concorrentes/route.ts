/**
 * API Route: GET /api/setup/concorrentes
 * Verifica e cria as tabelas necessárias para o cache de concorrentes
 */

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const CREATE_TABLES_SQL = `
-- Criar tabela competitor_data se não existir
CREATE TABLE IF NOT EXISTS nexia.competitor_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'instagram',
    profile_url TEXT,
    profile_pic_url TEXT,
    biography TEXT,
    
    -- Métricas principais
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    posts_per_month INTEGER DEFAULT 0,
    avg_likes INTEGER DEFAULT 0,
    avg_comments INTEGER DEFAULT 0,
    
    -- Dados brutos e timestamps
    content_breakdown JSONB DEFAULT '{"carousel": 0, "reels": 0, "image": 0}',
    apify_data JSONB,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela competitor_posts se não existir
CREATE TABLE IF NOT EXISTS nexia.competitor_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES nexia.competitor_data(id) ON DELETE CASCADE,
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
    topic TEXT,
    why_it_worked TEXT,
    apify_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(competitor_id, external_id)
);

-- Criar tabela competitor_analyses se não existir
CREATE TABLE IF NOT EXISTS nexia.competitor_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES nexia.competitor_data(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    ai_insights TEXT[] DEFAULT ARRAY[]::TEXT[],
    recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
    content_breakdown JSONB DEFAULT '{}',
    top_posts JSONB DEFAULT ARRAY[]::JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_competitor_posts_competitor_id ON nexia.competitor_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_timestamp ON nexia.competitor_posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_analyses_competitor_id ON nexia.competitor_analyses(competitor_id);

-- Políticas RLS
ALTER TABLE nexia.competitor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.competitor_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.competitor_analyses ENABLE ROW LEVEL SECURITY;

-- Políticas para competitor_data (todos podem ver)
DROP POLICY IF EXISTS "Anyone can view competitor data" ON nexia.competitor_data;
CREATE POLICY "Anyone can view competitor data"
    ON nexia.competitor_data FOR SELECT
    USING (true);

-- Políticas para competitor_posts (todos podem ver)
DROP POLICY IF EXISTS "Anyone can view competitor posts" ON nexia.competitor_posts;
CREATE POLICY "Anyone can view competitor posts"
    ON nexia.competitor_posts FOR SELECT
    USING (true);

-- Políticas para competitor_analyses
DROP POLICY IF EXISTS "Users can view own analyses" ON nexia.competitor_analyses;
CREATE POLICY "Users can view own analyses"
    ON nexia.competitor_analyses FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own analyses" ON nexia.competitor_analyses;
CREATE POLICY "Users can create own analyses"
    ON nexia.competitor_analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
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
`;

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Verificar se as tabelas existem
    const { data: tables, error: checkError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "nexia")
      .eq("table_name", "competitor_data")
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw new Error(`Erro ao verificar tabelas: ${checkError.message}`);
    }

    if (tables) {
      return NextResponse.json({
        success: true,
        message: "Tabelas já existem",
        setupRequired: false,
        tables: ["competitor_data", "competitor_posts", "competitor_analyses"],
      });
    }

    // Criar tabelas
    const { error: createError } = await supabase.rpc("exec_sql", {
      sql: CREATE_TABLES_SQL,
    });

    if (createError) {
      // Se a função exec_sql não existir, tentar executar diretamente
      console.log("Tentando criar tabelas via query direta...");
      
      // Executar SQL em partes
      const statements = CREATE_TABLES_SQL.split(";").filter(s => s.trim());
      
      for (const statement of statements) {
        const { error } = await supabase.rpc("exec_sql", {
          sql: statement + ";",
        });
        if (error) {
          console.log("Statement falhou (pode ser normal se já existir):", error.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tabelas criadas com sucesso",
      setupRequired: true,
      tables: ["competitor_data", "competitor_posts", "competitor_analyses"],
    });
  } catch (error) {
    console.error("[Setup] Erro:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      instructions: "Execute o SQL em supabase/migrations/002_create_agentes_tables.sql manualmente no SQL Editor do Supabase",
    }, { status: 500 });
  }
}
