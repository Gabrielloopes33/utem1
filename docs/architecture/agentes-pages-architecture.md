# Arquitetura Técnica: Páginas de Agentes

> **Agente:** Architect (Aria)  
> **Projeto:** Synkra AIOS / Autem  
> **Data:** 2026-03-03  
> **Versão:** 1.0

---

## 1. Visão Geral

Este documento especifica a arquitetura técnica para implementação de 4 páginas de agentes N8N integradas ao dashboard da Autem.

### Stack Tecnológico
- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript 5.x
- **Estilização:** Tailwind CSS 4.x
- **UI Components:** shadcn/ui
- **Validação:** Zod
- **Banco de Dados:** Supabase (PostgreSQL)
- **Integração:** N8N Webhooks

---

## 2. Estrutura de Diretórios

```
src/
├── app/(app)/
│   ├── agentes/
│   │   ├── generalista/
│   │   │   └── page.tsx              # Página do chat generalista
│   │   └── gerar-post/
│   │       └── page.tsx              # Página de geração de posts
│   ├── campanhas/
│   │   ├── page.tsx                  # Lista de campanhas (existente)
│   │   ├── new/
│   │   │   └── page.tsx              # Nova página: Criar campanha (full page)
│   │   └── [id]/
│   │       └── page.tsx              # Detalhes da campanha
│   ├── personas/
│   │   ├── page.tsx                  # Lista de personas (existente)
│   │   ├── new/
│   │   │   └── page.tsx              # Nova página: Criar persona (full page)
│   │   └── [id]/
│   │       └── page.tsx              # Detalhes da persona
│   └── api/
│       ├── agentes/
│       │   ├── generalista/
│       │   │   └── route.ts          # API Route: Chat generalista
│       │   ├── campanhas/
│       │   │   └── route.ts          # API Route: Criar campanha
│       │   ├── personas/
│       │   │   └── route.ts          # API Route: Criar persona
│       │   └── gerar-post/
│       │       └── route.ts          # API Route: Gerar post
│       └── chat/
│           └── history/
│               └── route.ts          # API Route: Histórico de chats
│
├── components/
│   ├── agentes/
│   │   ├── generalista/
│   │   │   ├── chat-container.tsx    # Container principal do chat
│   │   │   ├── chat-message.tsx      # Componente de mensagem
│   │   │   ├── chat-input.tsx        # Input com sugestões
│   │   │   └── chat-sidebar.tsx      # Sidebar com histórico
│   │   └── gerar-post/
│   │       ├── post-form.tsx         # Formulário de geração
│   │       ├── post-preview.tsx      # Preview do post gerado
│   │       └── post-actions.tsx      # Ações (copiar, salvar, etc)
│   ├── campanhas/
│   │   ├── campaign-form.tsx         # Formulário completo (Zod)
│   │   ├── campaign-calendar.tsx     # Visualização de calendário
│   │   ├── campaign-result.tsx       # Resultado da IA
│   │   └── campaign-wizard.tsx       # Wizard passo-a-passo
│   ├── personas/
│   │   ├── persona-form.tsx          # Formulário completo (Zod)
│   │   ├── persona-result.tsx        # Resultado da IA
│   │   └── persona-preview.tsx       # Preview do perfil
│   └── ui/                           # shadcn components (existente)
│
├── hooks/
│   ├── use-agente-generalista.ts     # Hook: Agente Generalista
│   ├── use-agente-campanhas.ts       # Hook: Agente Campanhas
│   ├── use-agente-personas.ts        # Hook: Agente Personas
│   ├── use-agente-gerar-post.ts      # Hook: Agente Gerar Post
│   ├── use-chat-history.ts           # Hook: Histórico de chats
│   └── use-local-storage.ts          # Hook: Persistência local
│
├── lib/
│   ├── n8n/
│   │   └── client.ts                 # Cliente N8N (existente)
│   ├── supabase/
│   │   ├── client.ts                 # Cliente browser (existente)
│   │   └── server.ts                 # Cliente server (existente)
│   └── validators/
│       ├── campanha.ts               # Schema Zod: Campanha
│       ├── persona.ts                # Schema Zod: Persona
│       ├── post.ts                   # Schema Zod: Post
│       └── chat.ts                   # Schema Zod: Chat
│
├── types/
│   ├── campaign.ts                   # Tipos Campanha (existente)
│   ├── persona.ts                    # Tipos Persona (existente)
│   ├── chat.ts                       # NOVO: Tipos Chat
│   └── post.ts                       # NOVO: Tipos Post
│
└── server/
    └── actions/
        ├── campanhas.ts              # Server Actions: Campanhas
        ├── personas.ts               # Server Actions: Personas
        ├── posts.ts                  # Server Actions: Posts
        └── chat.ts                   # Server Actions: Chat
```

---

## 3. Schema do Supabase

### 3.1 Tabela: `chat_sessions`

```sql
-- Histórico de sessões de chat do agente generalista
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nova conversa',
    agent_type TEXT NOT NULL DEFAULT 'generalista',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_chat_sessions_org ON chat_sessions(org_id);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated ON chat_sessions(updated_at DESC);
```

### 3.2 Tabela: `chat_messages`

```sql
-- Mensagens individuais do chat
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    tokens_used INTEGER,
    model_used TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
```

### 3.3 Tabela: `campaigns` (Atualização)

```sql
-- Adicionar campos para integração com agente
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ai_generated_plan JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ai_generated_posts JSONB DEFAULT '[]';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}';
```

### 3.4 Tabela: `personas` (Atualização)

```sql
-- Adicionar campos para integração com agente
ALTER TABLE personas ADD COLUMN IF NOT EXISTS ai_generated_profile JSONB;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}';
```

### 3.5 Tabela: `generated_posts`

```sql
-- Posts gerados pelo agente
CREATE TABLE generated_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    
    -- Dados do post
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    caption TEXT,
    hashtags TEXT[],
    
    -- Configuração usada
    tema TEXT NOT NULL,
    tipo_conteudo TEXT NOT NULL,
    formato TEXT NOT NULL,
    
    -- Metadados
    ai_raw_response TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'scheduled', 'published', 'archived')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_generated_posts_org ON generated_posts(org_id);
CREATE INDEX idx_generated_posts_campaign ON generated_posts(campaign_id);
CREATE INDEX idx_generated_posts_persona ON generated_posts(persona_id);
CREATE INDEX idx_generated_posts_status ON generated_posts(status);
```

### 3.6 Tabela: `campaign_calendar_items`

```sql
-- Itens de calendário gerados para campanhas
CREATE TABLE campaign_calendar_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- Data e conteúdo
    scheduled_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL,
    format TEXT NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    
    -- Relacionamentos
    generated_post_id UUID REFERENCES generated_posts(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_calendar_campaign ON campaign_calendar_items(campaign_id);
CREATE INDEX idx_calendar_date ON campaign_calendar_items(scheduled_date);
```

### 3.7 Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_calendar_items ENABLE ROW LEVEL SECURITY;

-- Políticas para chat_sessions
CREATE POLICY "Users can view their org chat sessions"
    ON chat_sessions FOR SELECT
    USING (org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create chat sessions in their org"
    ON chat_sessions FOR INSERT
    WITH CHECK (org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
    ));

-- Políticas para chat_messages
CREATE POLICY "Users can view messages from their sessions"
    ON chat_messages FOR SELECT
    USING (session_id IN (
        SELECT id FROM chat_sessions 
        WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    ));

-- Políticas para generated_posts
CREATE POLICY "Users can view their org generated posts"
    ON generated_posts FOR SELECT
    USING (org_id IN (
        SELECT org_id FROM org_members WHERE user_id = auth.uid()
    ));
```

---

## 4. Tipagens TypeScript

### 4.1 `src/types/chat.ts`

```typescript
export interface ChatSession {
  id: string;
  org_id: string;
  user_id: string;
  title: string;
  agent_type: 'generalista' | 'campanhas' | 'personas' | 'gerar-post';
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    suggestions?: string[];
    actions?: ChatAction[];
  };
  tokens_used?: number;
  model_used?: string;
  created_at: string;
}

export interface ChatAction {
  type: 'create_campaign' | 'create_persona' | 'generate_post' | 'link';
  label: string;
  payload?: Record<string, unknown>;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  updated_at: string;
  messageCount: number;
}
```

### 4.2 `src/types/post.ts`

```typescript
export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'archived';

export interface GeneratedPost {
  id: string;
  org_id: string;
  created_by: string;
  campaign_id?: string;
  persona_id?: string;
  
  title: string;
  content: string;
  caption?: string;
  hashtags: string[];
  
  tema: string;
  tipo_conteudo: 'tecnico' | 'emocional' | 'objecao' | 'autoridade' | 'social';
  formato: 'carrossel' | 'card' | 'reels';
  
  ai_raw_response?: string;
  metadata?: {
    slideCount?: number;
    estimatedEngagement?: number;
    bestPostingTime?: string;
  };
  
  status: PostStatus;
  created_at: string;
  updated_at: string;
}

export interface PostFormData {
  tema: string;
  tipoConteudo: 'tecnico' | 'emocional' | 'objecao' | 'autoridade' | 'social';
  formato: 'carrossel' | 'card' | 'reels';
  persona: string;
  perfilPersona: 'conservador' | 'moderado' | 'agressivo';
  campanha?: string;
  referencias?: string;
}
```

### 4.3 Atualizações em `src/types/campaign.ts`

```typescript
export interface CampaignCalendarItem {
  id: string;
  campaign_id: string;
  scheduled_date: string;
  title: string;
  description?: string;
  content_type: ContentType;
  format: FormatType;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  generated_post_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithDetails extends Campaign {
  calendar?: CampaignCalendarItem[];
  generated_posts?: GeneratedPost[];
}
```

---

## 5. Schemas Zod para Validação

### 5.1 `src/lib/validators/campanha.ts`

```typescript
import { z } from 'zod';

export const campanhaFormSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  objetivo: z.enum(['conversao', 'atracao', 'nutricao']),
  formato: z.enum(['lancamento', 'perpetuo', 'interna']),
  tiposConteudo: z.array(
    z.enum(['tecnico', 'emocional', 'objecao', 'autoridade', 'social'])
  ).min(1, 'Selecione pelo menos um tipo de conteúdo'),
  formatos: z.array(z.enum(['carrossel', 'card', 'reels'])).min(1, 'Selecione pelo menos um formato'),
  periodo: z.object({
    inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional(),
  }).refine(
    (data) => !data.fim || data.fim >= data.inicio,
    { message: 'Data final deve ser posterior à data inicial', path: ['fim'] }
  ),
  persona: z.string().optional(),
});

export type CampanhaFormData = z.infer<typeof campanhaFormSchema>;
```

### 5.2 `src/lib/validators/persona.ts`

```typescript
import { z } from 'zod';

export const personaFormSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  perfil: z.enum(['conservador', 'moderado', 'agressivo']),
  dados: z.object({
    idade: z.number().min(18).max(100).optional(),
    renda: z.string().optional(),
    patrimonio: z.string().optional(),
    objetivos: z.array(z.string()).optional(),
    medos: z.array(z.string()).optional(),
  }).optional(),
  objetivo: z.string().optional(),
});

export type PersonaFormData = z.infer<typeof personaFormSchema>;
```

### 5.3 `src/lib/validators/post.ts`

```typescript
import { z } from 'zod';

export const gerarPostFormSchema = z.object({
  tema: z.string().min(5, 'Tema deve ter pelo menos 5 caracteres'),
  tipoConteudo: z.enum(['tecnico', 'emocional', 'objecao', 'autoridade', 'social']),
  formato: z.enum(['carrossel', 'card', 'reels']),
  persona: z.string().min(1, 'Selecione uma persona'),
  perfilPersona: z.enum(['conservador', 'moderado', 'agressivo']),
  campanha: z.string().optional(),
  referencias: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export type GerarPostFormData = z.infer<typeof gerarPostFormSchema>;
```

### 5.4 `src/lib/validators/chat.ts`

```typescript
import { z } from 'zod';

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Mensagem não pode estar vazia').max(2000, 'Máximo 2000 caracteres'),
  sessionId: z.string().uuid().optional(),
});

export const createSessionSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
```

---

## 6. Hooks Customizados

### 6.1 `src/hooks/use-agente-generalista.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { agenteGeneralista } from '@/lib/n8n/client';
import { createClient } from '@/lib/supabase/client';
import type { ChatMessage, ChatSession } from '@/types/chat';

interface UseAgenteGeneralistaOptions {
  sessionId?: string;
  persistToLocal?: boolean;
}

interface UseAgenteGeneralistaReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  session: ChatSession | null;
  sendMessage: (message: string) => Promise<void>;
  createSession: (title?: string) => Promise<string>;
  loadSession: (sessionId: string) => Promise<void>;
  clearHistory: () => void;
}

export function useAgenteGeneralista(
  options: UseAgenteGeneralistaOptions = {}
): UseAgenteGeneralistaReturn {
  const { persistToLocal = true } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const supabase = createClient();

  const sendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: session?.id || 'temp',
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Persistir mensagem no Supabase se houver sessão
      if (session?.id) {
        await supabase.from('chat_messages').insert({
          session_id: session.id,
          role: 'user',
          content: message,
        });
      }

      // Chamar agente N8N
      const response = await agenteGeneralista({
        message,
        history: messages.map(m => ({ role: m.role, content: m.content })),
        userId: 'current-user', // Pegar do contexto de auth
      });

      // Adicionar resposta do assistente
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: session?.id || 'temp',
        role: 'assistant',
        content: response,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Persistir resposta
      if (session?.id) {
        await supabase.from('chat_messages').insert({
          session_id: session.id,
          role: 'assistant',
          content: response,
        });

        // Atualizar timestamp da sessão
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', session.id);
      }

      // Persistir localmente se necessário
      if (persistToLocal && !session?.id) {
        localStorage.setItem('chat_generalista_draft', JSON.stringify({
          messages: [...messages, userMessage, assistantMessage],
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      
      // Adicionar mensagem de erro no chat
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        session_id: session?.id || 'temp',
        role: 'assistant',
        content: `❌ Erro: ${errorMessage}`,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, session, persistToLocal, supabase]);

  const createSession = useCallback(async (title?: string) => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        org_id: 'current-org', // Pegar do contexto
        user_id: 'current-user',
        title: title || 'Nova conversa',
      })
      .select()
      .single();

    if (error) throw error;
    
    setSession(data);
    return data.id;
  }, [supabase]);

  const loadSession = useCallback(async (sessionId: string) => {
    const { data: sessionData } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const { data: messagesData } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (sessionData) setSession(sessionData);
    if (messagesData) setMessages(messagesData);
  }, [supabase]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setSession(null);
    localStorage.removeItem('chat_generalista_draft');
  }, []);

  return {
    messages,
    isLoading,
    error,
    session,
    sendMessage,
    createSession,
    loadSession,
    clearHistory,
  };
}
```

### 6.2 `src/hooks/use-agente-campanhas.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { agenteCampanhas } from '@/lib/n8n/client';
import { createClient } from '@/lib/supabase/client';
import type { Campaign } from '@/types/campaign';
import type { CampanhaFormData } from '@/lib/validators/campanha';

interface UseAgenteCampanhasReturn {
  isLoading: boolean;
  error: string | null;
  result: string | null;
  campaign: Campaign | null;
  createCampaign: (data: CampanhaFormData) => Promise<Campaign | null>;
  reset: () => void;
}

export function useAgenteCampanhas(): UseAgenteCampanhasReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const supabase = createClient();

  const createCampaign = useCallback(async (data: CampanhaFormData): Promise<Campaign | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Chamar agente N8N
      const aiResponse = await agenteCampanhas({
        nome: data.nome,
        objetivo: data.objetivo,
        formato: data.formato,
        tiposConteudo: data.tiposConteudo,
        formatos: data.formatos,
        periodo: data.periodo,
        persona: data.persona,
      });

      setResult(aiResponse);

      // Salvar no Supabase
      const { data: campaignData, error: dbError } = await supabase
        .from('campaigns')
        .insert({
          org_id: 'current-org',
          created_by: 'current-user',
          name: data.nome,
          objective: data.objetivo,
          format: data.formato,
          content_types: data.tiposConteudo,
          formats: data.formatos,
          start_date: data.periodo.inicio,
          end_date: data.periodo.fim,
          status: 'draft',
          ai_response: aiResponse,
          ai_generated_plan: { raw: aiResponse },
          generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setCampaign(campaignData);
      return campaignData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
    setCampaign(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    campaign,
    createCampaign,
    reset,
  };
}
```

### 6.3 `src/hooks/use-agente-personas.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { agentePersonas } from '@/lib/n8n/client';
import { createClient } from '@/lib/supabase/client';
import type { Persona, PersonaProfile } from '@/types/persona';

interface PersonaFormInput {
  nome: string;
  profile_type: PersonaProfile;
  age_range?: string;
  income_range?: string;
  patrimony_range?: string;
}

interface UseAgentePersonasReturn {
  isLoading: boolean;
  error: string | null;
  result: string | null;
  persona: Persona | null;
  createPersona: (data: PersonaFormInput) => Promise<Persona | null>;
  reset: () => void;
}

export function useAgentePersonas(): UseAgentePersonasReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const supabase = createClient();

  const createPersona = useCallback(async (data: PersonaFormInput): Promise<Persona | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Chamar agente N8N
      const aiResponse = await agentePersonas({
        acao: 'criar',
        nome: data.nome,
        perfil: data.profile_type,
        dados: {
          idade: data.age_range ? parseInt(data.age_range) : undefined,
          renda: data.income_range,
          patrimonio: data.patrimony_range,
        },
      });

      setResult(aiResponse);

      // Parsear resposta da IA (JSON ou texto)
      let parsedProfile = {};
      try {
        parsedProfile = JSON.parse(aiResponse);
      } catch {
        // Manter como texto se não for JSON
      }

      // Salvar no Supabase
      const { data: personaData, error: dbError } = await supabase
        .from('personas')
        .insert({
          org_id: 'current-org',
          created_by: 'current-user',
          name: data.nome,
          profile_type: data.profile_type,
          age_range: data.age_range,
          income_range: data.income_range,
          patrimony_range: data.patrimony_range,
          ai_response: aiResponse,
          ai_generated_profile: parsedProfile,
          generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setPersona(personaData);
      return personaData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
    setPersona(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    persona,
    createPersona,
    reset,
  };
}
```

### 6.4 `src/hooks/use-agente-gerar-post.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { agenteGerarPost } from '@/lib/n8n/client';
import { createClient } from '@/lib/supabase/client';
import type { GeneratedPost, PostFormData } from '@/types/post';

interface UseAgenteGerarPostReturn {
  isLoading: boolean;
  error: string | null;
  post: GeneratedPost | null;
  generatePost: (data: PostFormData) => Promise<GeneratedPost | null>;
  savePost: (post: GeneratedPost) => Promise<void>;
  reset: () => void;
}

export function useAgenteGerarPost(): UseAgenteGerarPostReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const supabase = createClient();

  const generatePost = useCallback(async (data: PostFormData): Promise<GeneratedPost | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Chamar agente N8N
      const response = await agenteGerarPost({
        tema: data.tema,
        tipoConteudo: data.tipoConteudo,
        formato: data.formato,
        persona: data.persona,
        perfilPersona: data.perfilPersona,
        campanha: data.campanha,
        referencias: data.referencias,
      });

      // Construir objeto do post
      const generatedPost: GeneratedPost = {
        id: crypto.randomUUID(),
        org_id: 'current-org',
        created_by: 'current-user',
        campaign_id: data.campanha,
        title: response.metadata?.tema || data.tema,
        content: response.post,
        tema: data.tema,
        tipo_conteudo: data.tipoConteudo,
        formato: data.formato,
        ai_raw_response: JSON.stringify(response),
        hashtags: extractHashtags(response.post),
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setPost(generatedPost);
      return generatedPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePost = useCallback(async (postToSave: GeneratedPost) => {
    const { error } = await supabase
      .from('generated_posts')
      .insert(postToSave);

    if (error) throw error;
  }, [supabase]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setPost(null);
  }, []);

  return {
    isLoading,
    error,
    post,
    generatePost,
    savePost,
    reset,
  };
}

// Helper para extrair hashtags do conteúdo
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\w\u00C0-\u00FF]+/g;
  return content.match(hashtagRegex) || [];
}
```

---

## 7. Implementação das Páginas

### 7.1 Página: Agente Generalista (`src/app/(app)/agentes/generalista/page.tsx`)

```typescript
// Server Component por padrão
import { Metadata } from 'next';
import { GeneralistaChatContainer } from '@/components/agentes/generalista/chat-container';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Agente Generalista | Autem',
  description: 'Chat de ideias de conteúdo com IA',
};

interface PageProps {
  searchParams: Promise<{ session?: string }>;
}

export default async function AgenteGeneralistaPage({ searchParams }: PageProps) {
  const { session: sessionId } = await searchParams;
  const supabase = await createClient();
  
  // Buscar sessões anteriores do usuário
  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('agent_type', 'generalista')
    .order('updated_at', { ascending: false })
    .limit(10);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar com histórico */}
      <aside className="w-64 border-r bg-muted/30 hidden md:block">
        <ChatHistorySidebar sessions={sessions || []} />
      </aside>
      
      {/* Área principal do chat */}
      <main className="flex-1 flex flex-col">
        <GeneralistaChatContainer initialSessionId={sessionId} />
      </main>
    </div>
  );
}

// Client Component para sidebar
'use client';

import Link from 'next/link';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatSession } from '@/types/chat';

function ChatHistorySidebar({ sessions }: { sessions: ChatSession[] }) {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm">Histórico</h2>
        <Link href="/agentes/generalista">
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-1 overflow-y-auto">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/agentes/generalista?session=${session.id}`}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 text-sm"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{session.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### 7.2 Página: Campanhas New (`src/app/(app)/campanhas/new/page.tsx`)

```typescript
import { Metadata } from 'next';
import { CampaignWizard } from '@/components/campanhas/campaign-wizard';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Nova Campanha | Autem',
  description: 'Crie uma nova campanha com auxílio da IA',
};

export default function NovaCampanhaPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Nova Campanha"
        description="Preencha os dados e deixe a IA estruturar seu plano completo"
      />
      
      <div className="max-w-4xl mx-auto">
        <CampaignWizard />
      </div>
    </div>
  );
}
```

### 7.3 Página: Personas New (`src/app/(app)/personas/new/page.tsx`)

```typescript
import { Metadata } from 'next';
import { PersonaWizard } from '@/components/personas/persona-wizard';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Nova Persona | Autem',
  description: 'Crie um perfil de investidor com auxílio da IA',
};

export default function NovaPersonaPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Nova Persona"
        description="Defina as características e deixe a IA completar o perfil"
      />
      
      <div className="max-w-3xl mx-auto">
        <PersonaWizard />
      </div>
    </div>
  );
}
```

### 7.4 Página: Gerar Post (`src/app/(app)/agentes/gerar-post/page.tsx`)

```typescript
import { Metadata } from 'next';
import { PostGenerator } from '@/components/agentes/gerar-post/post-generator';
import { PageHeader } from '@/components/shared/page-header';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Gerar Post | Autem',
  description: 'Gere posts para Instagram com auxílio da IA',
};

export default async function GerarPostPage() {
  const supabase = await createClient();
  
  // Buscar dados para os selects
  const [{ data: personas }, { data: campaigns }] = await Promise.all([
    supabase.from('personas').select('id, name, profile_type'),
    supabase.from('campaigns').select('id, name').eq('status', 'active'),
  ]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Gerar Post"
        description="Crie conteúdo otimizado para sua audiência"
      />
      
      <div className="grid grid-cols-12 gap-6">
        {/* Formulário (5 cols) */}
        <div className="col-span-12 lg:col-span-5">
          <PostGenerator 
            personas={personas || []} 
            campaigns={campaigns || []}
          />
        </div>
        
        {/* Preview (7 cols) */}
        <div className="col-span-12 lg:col-span-7">
          <PostPreview />
        </div>
      </div>
    </div>
  );
}
```

---

## 8. API Routes

### 8.1 `src/app/api/agentes/generalista/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { agenteGeneralista } from '@/lib/n8n/client';
import { chatMessageSchema } from '@/lib/validators/chat';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar input
    const result = chatMessageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { message, sessionId } = result.data;
    const supabase = await createClient();

    // Buscar histórico se houver sessão
    let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (sessionId) {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(20);
      
      if (messages) {
        history = messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
      }
    }

    // Chamar agente
    const response = await agenteGeneralista({
      message,
      history,
      userId: 'current-user', // Pegar do JWT
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('[API] Erro no agente generalista:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}
```

### 8.2 `src/app/api/agentes/campanhas/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { agenteCampanhas } from '@/lib/n8n/client';
import { campanhaFormSchema } from '@/lib/validators/campanha';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar input
    const result = campanhaFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Chamar agente
    const aiResponse = await agenteCampanhas(result.data);

    // Salvar no banco
    const supabase = await createClient();
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        org_id: 'current-org',
        created_by: 'current-user',
        name: result.data.nome,
        objective: result.data.objetivo,
        format: result.data.formato,
        content_types: result.data.tiposConteudo,
        formats: result.data.formatos,
        start_date: result.data.periodo.inicio,
        end_date: result.data.periodo.fim,
        status: 'draft',
        ai_response: aiResponse,
        ai_generated_plan: { raw: aiResponse },
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ campaign, aiResponse });
  } catch (error) {
    console.error('[API] Erro ao criar campanha:', error);
    return NextResponse.json(
      { error: 'Erro ao criar campanha' },
      { status: 500 }
    );
  }
}
```

---

## 9. Fluxo de Dados

### 9.1 Agente Generalista - Fluxo

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Input    │────▶│  Chat Container  │────▶│  useAgenteGeneralista │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                              │
                                                              ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Display       │◀────│  Parse Response  │◀────│   N8N Webhook   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Supabase       │
│  (chat_messages)│
└─────────────────┘
```

### 9.2 Agente Campanhas - Fluxo

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Form Submit   │────▶│  Zod Validation  │────▶│  useAgenteCampanhas   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                              │
                                     ┌───────────────────────┘
                                     ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Redirect to   │◀────│  Save Campaign   │◀────│   N8N Webhook   │
│   /campanhas/id │     │   (Supabase)     │     │   (AI Response) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### 9.3 Agente Gerar Post - Fluxo

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Form Submit   │────▶│  Zod Validation  │────▶│  useAgenteGerarPost   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                              │
                                     ┌───────────────────────┘
                                     ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Show Preview   │◀────│  Parse Post Data │◀────│   N8N Webhook   │
│  + Save Option  │     │   (JSON/Text)    │     │   (AI Response) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## 10. Componentes Principais (Visão Detalhada)

### 10.1 CampaignWizard (`src/components/campanhas/campaign-wizard.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { campanhaFormSchema, type CampanhaFormData } from '@/lib/validators/campanha';
import { useAgenteCampanhas } from '@/hooks/use-agente-campanhas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Steps do wizard
import { CampaignBasicInfoStep } from './wizard-steps/basic-info';
import { CampaignContentTypesStep } from './wizard-steps/content-types';
import { CampaignPeriodStep } from './wizard-steps/period';
import { CampaignReviewStep } from './wizard-steps/review';
import { CampaignResult } from './campaign-result';

const STEPS = [
  { id: 'basic', label: 'Informações Básicas' },
  { id: 'content', label: 'Tipos de Conteúdo' },
  { id: 'period', label: 'Período' },
  { id: 'review', label: 'Revisar' },
];

export function CampaignWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const { createCampaign, isLoading, result, campaign, reset } = useAgenteCampanhas();

  const form = useForm<CampanhaFormData>({
    resolver: zodResolver(campanhaFormSchema),
    defaultValues: {
      nome: '',
      objetivo: undefined,
      formato: undefined,
      tiposConteudo: [],
      formatos: [],
      periodo: { inicio: '', fim: '' },
    },
  });

  async function onSubmit(data: CampanhaFormData) {
    const created = await createCampaign(data);
    
    if (created) {
      toast.success('Campanha criada com sucesso!');
    }
  }

  // Se já tem resultado, mostrar view de resultado
  if (campaign && result) {
    return (
      <CampaignResult 
        campaign={campaign} 
        aiResponse={result}
        onCreateAnother={() => {
          reset();
          form.reset();
          setCurrentStep(0);
        }}
        onViewCampaign={() => router.push(`/campanhas/${campaign.id}`)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              index === currentStep && 'bg-accent-500 text-white',
              index < currentStep && 'bg-green-500 text-white',
              index > currentStep && 'bg-muted text-muted-foreground'
            )}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className={cn(
              'ml-2 text-sm hidden sm:block',
              index === currentStep && 'text-accent-500 font-medium',
              index < currentStep && 'text-green-500',
              index > currentStep && 'text-muted-foreground'
            )}>
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <div className="w-8 h-px bg-border mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {currentStep === 0 && <CampaignBasicInfoStep form={form} />}
            {currentStep === 1 && <CampaignContentTypesStep form={form} />}
            {currentStep === 2 && <CampaignPeriodStep form={form} />}
            {currentStep === 3 && <CampaignReviewStep form={form} />}

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                Voltar
              </Button>
              
              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  Continuar
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-accent-500 hover:bg-accent-600"
                >
                  {isLoading ? 'Criando...' : 'Criar Campanha'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 11. Checklist de Implementação

### Fase 1: Fundação
- [ ] Criar tabelas no Supabase (migrations)
- [ ] Configurar RLS policies
- [ ] Criar tipagens TypeScript
- [ ] Criar schemas Zod

### Fase 2: Hooks
- [ ] Implementar `useAgenteGeneralista`
- [ ] Implementar `useAgenteCampanhas`
- [ ] Implementar `useAgentePersonas`
- [ ] Implementar `useAgenteGerarPost`

### Fase 3: API Routes
- [ ] Criar `/api/agentes/generalista`
- [ ] Criar `/api/agentes/campanhas`
- [ ] Criar `/api/agentes/personas`
- [ ] Criar `/api/agentes/gerar-post`

### Fase 4: Componentes
- [ ] `GeneralistaChatContainer`
- [ ] `CampaignWizard` + steps
- [ ] `PersonaWizard` + steps
- [ ] `PostGenerator` + `PostPreview`

### Fase 5: Páginas
- [ ] `/agentes/generalista/page.tsx`
- [ ] `/campanhas/new/page.tsx`
- [ ] `/personas/new/page.tsx`
- [ ] `/agentes/gerar-post/page.tsx`

### Fase 6: Integração
- [ ] Atualizar navegação
- [ ] Testar fluxos end-to-end
- [ ] Verificar tipagem TypeScript
- [ ] Verificar lint

---

## 12. Considerações de Performance

### 12.1 Server Components
- Use Server Components para páginas estáticas
- Buscar dados iniciais no servidor
- Passar dados via props para Client Components

### 12.2 Client Components
- Marque apenas componentes interativos com `"use client"`
- Use `useTransition` para transições de UI
- Implemente `Suspense` boundaries

### 12.3 Data Fetching
- Use React Query ou SWR para cache de dados
- Implemente stale-while-revalidate
- Use optimistic updates para melhor UX

### 12.4 Loading States
```typescript
// Exemplo de loading state com Suspense
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

<Suspense fallback={<ChatSkeleton />}>
  <GeneralistaChatContainer />
</Suspense>
```

---

## 13. Tratamento de Erros

### 13.1 Estratégia
- Validação com Zod no client e server
- Try-catch em todas as chamadas N8N
- Toast notifications para feedback
- Fallback UI para estados de erro

### 13.2 Error Boundaries
```typescript
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AgentErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h3>Algo deu errado</h3>
          <p>Tente recarregar a página</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 14. Segurança

### 14.1 Validação
- Zod para validação de inputs
- Rate limiting nas API routes
- Sanitização de conteúdo

### 14.2 Autenticação
- Verificar sessão em todas as API routes
- Usar RLS do Supabase
- Validar org_id em todas as queries

### 14.3 Secrets
```typescript
// .env.local
N8N_WEBHOOK_SECRET=seu_secret_aqui
SUPABASE_SERVICE_ROLE_KEY=chave_de_servico
```

---

## Anexos

### A. Estrutura de Resposta N8N

#### Agente Generalista
```json
{
  "response": "Texto da resposta da IA..."
}
```

#### Agente Campanhas
```json
{
  "resumo": "Resumo da campanha",
  "calendario": [
    { "data": "2026-03-01", "tema": "Tema do post", "formato": "carrossel" }
  ],
  "sugestoes": ["Sugestão 1", "Sugestão 2"]
}
```

#### Agente Personas
```json
{
  "nome": "Nome da Persona",
  "perfil": "moderado",
  "caracteristicas": { ... },
  "dores": [...],
  "objecoes": [...]
}
```

#### Agente Gerar Post
```json
{
  "post": "Texto completo do post...",
  "caption": "Legenda para Instagram",
  "hashtags": ["#tag1", "#tag2"],
  "metadata": {
    "tipo": "tecnico",
    "formato": "carrossel",
    "tema": "Tema"
  }
}
```

---

**Fim da Especificação**
