-- Migration: Create campaigns table if not exists
-- Created: 2026-03-04

-- Create table for campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  objective TEXT CHECK (objective IN ('conversao', 'atracao', 'nutricao')),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido')),
  start_date DATE,
  end_date DATE,
  target_persona TEXT,
  focus_product TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user campaigns
CREATE INDEX IF NOT EXISTS campaigns_user_id_idx 
  ON campaigns(user_id, status);

-- Create index for name search
CREATE INDEX IF NOT EXISTS campaigns_name_idx 
  ON campaigns(name);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own campaigns
CREATE POLICY "Users can manage their own campaigns"
  ON campaigns
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaigns TO service_role;
