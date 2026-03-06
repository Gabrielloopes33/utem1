-- ============================================
-- TABELA: agent_conversations
-- Conversas do Agente de Conteúdo (chat específico)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nova conversa',
    agent_type TEXT NOT NULL DEFAULT 'conteudo' CHECK (agent_type IN ('conteudo', 'generalista', 'campanhas', 'personas', 'gerar-post')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: agent_messages
-- Mensagens individuais das conversas do agente
-- ============================================
CREATE TABLE IF NOT EXISTS agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    -- Metadados opcionais da mensagem
    metadata JSONB DEFAULT '{}',
    -- Informações de tokens e modelo (para analytics)
    tokens_used INTEGER,
    model_used TEXT,
    -- Tempo de processamento (em ms)
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_org_id ON agent_conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_updated_at ON agent_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation_id ON agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created_at ON agent_messages(created_at);

-- Índice composto para buscar mensagens de uma conversa ordenadas
CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation_created 
    ON agent_messages(conversation_id, created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para agent_conversations
CREATE POLICY "Users can view own agent conversations"
    ON agent_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agent conversations"
    ON agent_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent conversations"
    ON agent_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agent conversations"
    ON agent_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para agent_messages
CREATE POLICY "Users can view messages from own conversations"
    ON agent_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM agent_conversations 
        WHERE agent_conversations.id = agent_messages.conversation_id 
        AND agent_conversations.user_id = auth.uid()
    ));

CREATE POLICY "Users can create messages in own conversations"
    ON agent_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM agent_conversations 
        WHERE agent_conversations.id = agent_messages.conversation_id 
        AND agent_conversations.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete messages from own conversations"
    ON agent_messages FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM agent_conversations 
        WHERE agent_conversations.id = agent_messages.conversation_id 
        AND agent_conversations.user_id = auth.uid()
    ));

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_agent_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
CREATE TRIGGER update_agent_conversations_updated_at
    BEFORE UPDATE ON agent_conversations
    FOR EACH ROW EXECUTE FUNCTION update_agent_conversations_updated_at();

-- Função para atualizar o updated_at da conversa quando uma nova mensagem é inserida
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agent_conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar conversa quando mensagem é inserida
CREATE TRIGGER update_conversation_on_message_insert
    AFTER INSERT ON agent_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();
