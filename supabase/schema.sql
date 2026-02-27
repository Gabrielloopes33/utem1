-- =============================================
-- Time — AI Workforce Platform
-- Schema: nexia (shared Supabase project)
-- Prefix: time_ (avoid collision with licitaia)
-- =============================================
-- Structure: ALL TABLES first, then RLS + POLICIES, then INDEXES

-- ============ TABLES ============

-- 1. Organizations
CREATE TABLE IF NOT EXISTS nexia.time_organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  owner_id    uuid NOT NULL,
  settings    jsonb DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Organization Members
CREATE TABLE IF NOT EXISTS nexia.time_org_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES nexia.time_organizations(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- 3. Squads
CREATE TABLE IF NOT EXISTS nexia.time_squads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES nexia.time_organizations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  icon        text DEFAULT '🤖',
  color       text DEFAULT '#5B8DEF',
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 4. Agents
CREATE TABLE IF NOT EXISTS nexia.time_agents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES nexia.time_organizations(id) ON DELETE CASCADE,
  squad_id        uuid REFERENCES nexia.time_squads(id) ON DELETE SET NULL,
  name            text NOT NULL,
  description     text,
  avatar_url      text,
  type            text NOT NULL DEFAULT 'chat' CHECK (type IN ('chat','task','qa_gate','planner')),
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','archived')),
  provider        text NOT NULL DEFAULT 'anthropic' CHECK (provider IN ('anthropic','openai')),
  model           text NOT NULL DEFAULT 'claude-sonnet-4-20250514',
  system_prompt   text,
  temperature     decimal DEFAULT 0.7,
  max_tokens      integer DEFAULT 4096,
  trigger_type    text DEFAULT 'manual' CHECK (trigger_type IN ('manual','scheduled','webhook','workflow')),
  trigger_config  jsonb DEFAULT '{}',
  approval_required boolean DEFAULT false,
  approval_role   text,
  tools           jsonb DEFAULT '[]',
  tags            text[] DEFAULT '{}',
  metadata        jsonb DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 5. Squad-Agent link
CREATE TABLE IF NOT EXISTS nexia.time_squad_agents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id    uuid NOT NULL REFERENCES nexia.time_squads(id) ON DELETE CASCADE,
  agent_id    uuid NOT NULL REFERENCES nexia.time_agents(id) ON DELETE CASCADE,
  role_in_squad text DEFAULT 'member',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(squad_id, agent_id)
);

-- 6. Knowledge Bases
CREATE TABLE IF NOT EXISTS nexia.time_knowledge_bases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES nexia.time_organizations(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  type        text DEFAULT 'document' CHECK (type IN ('document','url','text')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 7. Knowledge Documents
CREATE TABLE IF NOT EXISTS nexia.time_knowledge_docs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_id       uuid NOT NULL REFERENCES nexia.time_knowledge_bases(id) ON DELETE CASCADE,
  filename    text NOT NULL,
  file_type   text,
  file_size   integer,
  content     text,
  storage_path text,
  status      text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','ready','error')),
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 8. Agent-Knowledge link
CREATE TABLE IF NOT EXISTS nexia.time_agent_knowledge (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    uuid NOT NULL REFERENCES nexia.time_agents(id) ON DELETE CASCADE,
  kb_id       uuid NOT NULL REFERENCES nexia.time_knowledge_bases(id) ON DELETE CASCADE,
  UNIQUE(agent_id, kb_id)
);

-- 9. Conversations
CREATE TABLE IF NOT EXISTS nexia.time_conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES nexia.time_organizations(id) ON DELETE CASCADE,
  agent_id    uuid NOT NULL REFERENCES nexia.time_agents(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL,
  title       text DEFAULT 'Nova conversa',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 10. Messages
CREATE TABLE IF NOT EXISTS nexia.time_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES nexia.time_conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user','assistant','system')),
  content         text NOT NULL,
  parts           jsonb,
  tokens_used     integer,
  model_used      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 11. Workflows
CREATE TABLE IF NOT EXISTS nexia.time_workflows (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES nexia.time_organizations(id) ON DELETE CASCADE,
  squad_id    uuid REFERENCES nexia.time_squads(id) ON DELETE SET NULL,
  name        text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused')),
  trigger_type text DEFAULT 'manual' CHECK (trigger_type IN ('manual','schedule','webhook')),
  trigger_config jsonb DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 12. Workflow Steps
CREATE TABLE IF NOT EXISTS nexia.time_workflow_steps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES nexia.time_workflows(id) ON DELETE CASCADE,
  agent_id    uuid REFERENCES nexia.time_agents(id) ON DELETE SET NULL,
  step_order  integer NOT NULL,
  name        text NOT NULL,
  type        text NOT NULL DEFAULT 'agent' CHECK (type IN ('agent','condition','approval','delay','transform','output')),
  config      jsonb DEFAULT '{}',
  input_mapping jsonb DEFAULT '{}',
  output_mapping jsonb DEFAULT '{}',
  quality_gate jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 13. Executions
CREATE TABLE IF NOT EXISTS nexia.time_executions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES nexia.time_organizations(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES nexia.time_workflows(id) ON DELETE SET NULL,
  agent_id    uuid REFERENCES nexia.time_agents(id) ON DELETE SET NULL,
  status      text NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','failed','cancelled','pending_approval')),
  input       jsonb,
  output      jsonb,
  error       text,
  provider    text,
  model       text,
  tokens_total integer DEFAULT 0,
  cost_usd    decimal DEFAULT 0,
  duration_ms integer,
  started_at  timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- 14. API Keys (per org)
CREATE TABLE IF NOT EXISTS nexia.time_api_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES nexia.time_organizations(id) ON DELETE CASCADE,
  provider    text NOT NULL CHECK (provider IN ('anthropic','openai')),
  encrypted_key text NOT NULL,
  label       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============ RLS + POLICIES ============

ALTER TABLE nexia.time_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_squad_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_knowledge_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_agent_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.time_api_keys ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "org_owner_all" ON nexia.time_organizations
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "org_member_select" ON nexia.time_organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid())
  );

-- Org Members policies
CREATE POLICY "member_self_select" ON nexia.time_org_members
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "member_org_admin" ON nexia.time_org_members
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM nexia.time_org_members
      WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

-- Squads policies
CREATE POLICY "squad_org_member" ON nexia.time_squads
  FOR ALL USING (
    org_id IN (SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid())
  );

-- Agents policies
CREATE POLICY "agent_org_member" ON nexia.time_agents
  FOR ALL USING (
    org_id IN (SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid())
  );

-- Squad-Agent policies
CREATE POLICY "squad_agent_org_member" ON nexia.time_squad_agents
  FOR ALL USING (
    squad_id IN (
      SELECT id FROM nexia.time_squads WHERE org_id IN (
        SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid()
      )
    )
  );

-- Knowledge Bases policies
CREATE POLICY "kb_org_member" ON nexia.time_knowledge_bases
  FOR ALL USING (
    org_id IN (SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid())
  );

-- Knowledge Docs policies
CREATE POLICY "doc_kb_org_member" ON nexia.time_knowledge_docs
  FOR ALL USING (
    kb_id IN (
      SELECT id FROM nexia.time_knowledge_bases WHERE org_id IN (
        SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid()
      )
    )
  );

-- Agent-Knowledge policies
CREATE POLICY "ak_org_member" ON nexia.time_agent_knowledge
  FOR ALL USING (
    agent_id IN (
      SELECT id FROM nexia.time_agents WHERE org_id IN (
        SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid()
      )
    )
  );

-- Conversations policies
CREATE POLICY "conversation_owner" ON nexia.time_conversations
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "conversation_org_member" ON nexia.time_conversations
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid())
  );

-- Messages policies
CREATE POLICY "message_conversation_owner" ON nexia.time_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM nexia.time_conversations WHERE user_id = auth.uid()
    )
  );

-- Workflows policies
CREATE POLICY "workflow_org_member" ON nexia.time_workflows
  FOR ALL USING (
    org_id IN (SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid())
  );

-- Workflow Steps policies
CREATE POLICY "step_workflow_org_member" ON nexia.time_workflow_steps
  FOR ALL USING (
    workflow_id IN (
      SELECT id FROM nexia.time_workflows WHERE org_id IN (
        SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid()
      )
    )
  );

-- Executions policies
CREATE POLICY "execution_org_member" ON nexia.time_executions
  FOR ALL USING (
    org_id IN (SELECT org_id FROM nexia.time_org_members WHERE user_id = auth.uid())
  );

-- API Keys policies
CREATE POLICY "apikey_org_admin" ON nexia.time_api_keys
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM nexia.time_org_members
      WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

-- ============ INDEXES ============

CREATE INDEX IF NOT EXISTS idx_time_agents_org ON nexia.time_agents(org_id);
CREATE INDEX IF NOT EXISTS idx_time_agents_squad ON nexia.time_agents(squad_id);
CREATE INDEX IF NOT EXISTS idx_time_conversations_agent ON nexia.time_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_time_conversations_user ON nexia.time_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_time_messages_conversation ON nexia.time_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_time_executions_org ON nexia.time_executions(org_id);
CREATE INDEX IF NOT EXISTS idx_time_executions_agent ON nexia.time_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_time_workflow_steps_workflow ON nexia.time_workflow_steps(workflow_id);
