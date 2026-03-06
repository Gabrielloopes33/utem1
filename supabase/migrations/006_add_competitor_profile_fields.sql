-- Migration: adiciona colunas de perfil e métricas à tabela competitor_data
-- Essas colunas estavam faltando na migration 002 original

ALTER TABLE competitor_data
  ADD COLUMN IF NOT EXISTS profile_pic_url   TEXT,
  ADD COLUMN IF NOT EXISTS biography         TEXT,
  ADD COLUMN IF NOT EXISTS avg_likes         INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_comments      INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS content_breakdown JSONB   DEFAULT '{}'::JSONB;
