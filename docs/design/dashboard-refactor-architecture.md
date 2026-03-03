# Arquitetura - Dashboard Autem Refatoração

## 1. ESTRUTURA DE ROTAS (App Router)

```
src/app/(app)/
├── page.tsx                          # Redirect → /dashboard
├── layout.tsx                        # App layout com sidebar
├── dashboard/
│   └── page.tsx                      # Dashboard home (métricas + chat)
├── agentes/
│   ├── (list)/
│   │   └── page.tsx                  # Lista de agentes
│   ├── [id]/
│   │   └── page.tsx                  # Detalhe do agente
│   ├── novo/
│   │   └── page.tsx                  # Criar agente
│   ├── conteudo/
│   │   ├── page.tsx                  # Conteúdo generalista
│   │   └── historico/
│   │       └── page.tsx              # Histórico de posts
│   ├── campanhas/
│   │   ├── page.tsx                  # Agente de Campanhas
│   │   └── historico/
│   │       └── page.tsx              # Histórico de campanhas
│   ├── ideias/
│   │   └── page.tsx                  # Ideias de conteúdo
│   ├── ajustes/
│   │   └── page.tsx                  # Ajustes dos agentes
│   └── concorrentes/
│       ├── page.tsx                  # Overview análise
│       ├── xp/
│       │   └── page.tsx              # XP Investimentos
│       ├── raul-sena/
│       │   └── page.tsx              # Raul Sena
│       ├── primo-rico/
│       │   └── page.tsx              # Primo Rico
│       └── gemeos-financas/
│           └── page.tsx              # Gêmeos das Finanças
├── campanhas/                        # Nova estrutura de campanhas
│   ├── (list)/
│   │   └── page.tsx                  # Lista de campanhas
│   ├── [id]/
│   │   └── page.tsx                  # Detalhe da campanha
│   └── nova/
│       └── page.tsx                  # Criar campanha
├── personas/
│   ├── page.tsx                      # Lista de personas
│   ├── [id]/
│   │   └── page.tsx                  # Detalhe da persona
│   └── nova/
│       └── page.tsx                  # Criar persona
├── api/
│   ├── instagram/
│   │   └── metrics/
│   │       └── route.ts              # API Apify Instagram
│   ├── campaigns/
│   │   ├── route.ts                  # CRUD campanhas
│   │   └── [id]/
│   │       └── route.ts              # Detalhe campanha
│   ├── personas/
│   │   ├── route.ts                  # CRUD personas
│   │   └── [id]/
│   │       └── route.ts              # Detalhe persona
│   └── competitors/
│       ├── route.ts                  # Lista concorrentes
│       └── [handle]/
│           └── route.ts              # Dados do concorrente
```

## 2. SCHEMA DO BANCO DE DADOS (Supabase)

### Tabela: campaigns
```sql
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) not null,
  created_by uuid references auth.users(id) not null,
  
  -- Campos da campanha
  name text not null,
  objective campaign_objective not null, -- enum: conversao, atracao, nutricao
  format campaign_format not null,       -- enum: lancamento, perpetuo, interna
  
  -- Tipos de conteúdo (array)
  content_types content_type[] not null, -- enum: tecnico, emocional, objecao, autoridade, social
  
  -- Formatos (array)
  formats format_type[] not null,        -- enum: carrossel, card, reels
  
  -- Período
  start_date date not null,
  end_date date,
  
  -- Status
  status campaign_status default 'draft', -- enum: draft, active, paused, completed, archived
  
  -- Métricas
  metrics jsonb default '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enums
create type campaign_objective as enum ('conversao', 'atracao', 'nutricao');
create type campaign_format as enum ('lancamento', 'perpetuo', 'interna');
create type content_type as enum ('tecnico', 'emocional', 'objecao', 'autoridade', 'social');
create type format_type as enum ('carrossel', 'card', 'reels');
create type campaign_status as enum ('draft', 'active', 'paused', 'completed', 'archived');

-- Índices
CREATE INDEX idx_campaigns_org ON campaigns(org_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
```

### Tabela: personas
```sql
create table personas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) not null,
  created_by uuid references auth.users(id) not null,
  
  -- Identificação
  name text not null,
  avatar_url text,
  
  -- Perfil do investidor
  profile_type persona_profile not null, -- enum: conservador, moderado, agressivo
  
  -- Dados demográficos
  age_range text,           -- ex: "45-60 anos"
  income_range text,        -- ex: "R$ 10K-30K/mês"
  patrimony_range text,     -- ex: "R$ 50K-200K"
  
  -- Características
  objectives text[],        -- Objetivos de investimento
  fears text[],            -- Medos/preocupações
  interests text[],        -- Interesses financeiros
  
  -- Comunicação
  communication_tone text,  -- Tom ideal de comunicação
  preferred_channels jsonb, -- {instagram: 70, youtube: 60, email: 40}
  
  -- Gatilhos
  conversion_triggers text[], -- O que converte essa persona
  
  -- Conteúdo
  content_preferences jsonb, -- Preferências de tipo/formato de conteúdo
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create type persona_profile as enum ('conservador', 'moderado', 'agressivo');

CREATE INDEX idx_personas_org ON personas(org_id);
CREATE INDEX idx_personas_profile ON personas(profile_type);
```

### Tabela: instagram_metrics (cache Apify)
```sql
create table instagram_metrics (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) not null,
  
  -- Identificação
  handle text not null,           -- @autem.inv
  profile_name text,
  
  -- Métricas principais
  followers_count integer,
  following_count integer,
  posts_count integer,
  
  -- Métricas de engajamento
  avg_likes numeric,
  avg_comments numeric,
  avg_reach numeric,
  engagement_rate numeric,        -- Percentual
  
  -- Dados brutos da API
  raw_data jsonb,
  
  -- Timestamp
  fetched_at timestamptz default now(),
  
  -- Único por org + handle
  unique(org_id, handle)
);

CREATE INDEX idx_instagram_metrics_org ON instagram_metrics(org_id);
CREATE INDEX idx_instagram_metrics_fetched ON instagram_metrics(fetched_at);
```

### Tabela: competitor_analysis
```sql
create table competitor_analysis (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) not null,
  
  -- Concorrente
  handle text not null,           -- @xpinvestimentos
  name text not null,             -- XP Investimentos
  platform text default 'instagram',
  
  -- Métricas
  followers_count integer,
  engagement_rate numeric,
  posts_per_month integer,
  avg_reach numeric,
  
  -- Análise de conteúdo
  content_breakdown jsonb,        -- {carrossel: 60, reels: 30, card: 10}
  top_posts jsonb[],             -- Array de posts performáticos
  
  -- Insights da IA
  ai_insights text[],
  recommendations text[],
  
  -- Dados históricos
  historical_data jsonb[],        -- Array de snapshots
  
  -- Timestamp
  analyzed_at timestamptz default now(),
  
  unique(org_id, handle)
);

CREATE INDEX idx_competitor_org ON competitor_analysis(org_id);
```

## 3. TIPOS TYPESCRIPT

```typescript
// types/campaign.ts
export interface Campaign {
  id: string;
  org_id: string;
  created_by: string;
  name: string;
  objective: 'conversao' | 'atracao' | 'nutricao';
  format: 'lancamento' | 'perpetuo' | 'interna';
  content_types: ContentType[];
  formats: FormatType[];
  start_date: string;
  end_date?: string;
  status: CampaignStatus;
  metrics: CampaignMetrics;
  created_at: string;
  updated_at: string;
}

export type ContentType = 'tecnico' | 'emocional' | 'objecao' | 'autoridade' | 'social';
export type FormatType = 'carrossel' | 'card' | 'reels';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface CampaignMetrics {
  posts_generated?: number;
  engagement_rate?: number;
  reach?: number;
  conversions?: number;
}

// types/persona.ts
export interface Persona {
  id: string;
  org_id: string;
  name: string;
  avatar_url?: string;
  profile_type: 'conservador' | 'moderado' | 'agressivo';
  age_range?: string;
  income_range?: string;
  patrimony_range?: string;
  objectives: string[];
  fears: string[];
  interests: string[];
  communication_tone?: string;
  preferred_channels: Record<string, number>;
  conversion_triggers: string[];
  content_preferences?: Record<string, any>;
  created_at: string;
}

// types/instagram.ts
export interface InstagramMetrics {
  handle: string;
  profile_name: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  avg_reach: number;
  top_posts: InstagramPost[];
  fetched_at: string;
}

export interface InstagramPost {
  id: string;
  caption: string;
  likes: number;
  comments: number;
  reach: number;
  media_type: 'carousel' | 'reel' | 'image';
  timestamp: string;
  permalink: string;
}

// types/competitor.ts
export interface CompetitorAnalysis {
  handle: string;
  name: string;
  platform: string;
  followers_count: number;
  engagement_rate: number;
  posts_per_month: number;
  avg_reach: number;
  content_breakdown: Record<string, number>;
  top_posts: CompetitorPost[];
  ai_insights: string[];
  recommendations: string[];
  growth_90d: {
    followers_change: number;
    followers_change_pct: number;
  };
}
```

## 4. COMPONENTES REACT

### Estrutura de Componentes

```
src/components/
├── layout/
│   ├── sidebar.tsx                 # Menu lateral reestruturado
│   ├── sidebar-nav-item.tsx        # Item de navegação com dropdown
│   └── app-shell.tsx               # Shell do app
├── dashboard/
│   ├── instagram-metrics.tsx       # Card de métricas Instagram
│   ├── content-chat.tsx            # Chat de ideias de conteúdo
│   ├── metric-card.tsx             # Card de métrica individual
│   └── campaign-preview.tsx        # Preview de campanhas ativas
├── campaigns/
│   ├── campaign-card.tsx           # Card de campanha
│   ├── campaign-form.tsx           # Form de criação/edição
│   ├── campaign-filters.tsx        # Filtros de campanha
│   ├── content-type-selector.tsx   # Seletor de tipos de conteúdo
│   ├── format-selector.tsx         # Seletor de formatos
│   └── status-badge.tsx            # Badge de status
├── personas/
│   ├── persona-card.tsx            # Card de persona
│   ├── persona-form.tsx            # Form de criação/edição
│   ├── persona-detail.tsx          # Detalhe expandido
│   └── persona-avatar.tsx          # Avatar de persona
├── competitors/
│   ├── competitor-selector.tsx     # Tabs de seleção
│   ├── competitor-header.tsx       # Header com métricas
│   ├── competitor-posts.tsx        # Grid de top posts
│   ├── content-breakdown.tsx       # Análise de tipos de conteúdo
│   ├── ai-insights.tsx             # Insights da IA
│   └── recommendations.tsx         # Recomendações
└── shared/
    ├── metric-value.tsx            # Valor de métrica com variação
    ├── date-range-picker.tsx       # Seletor de período
    ├── tag-group.tsx               # Grupo de tags
    └── empty-state.tsx             # Estado vazio
```

## 5. INTEGRAÇÃO APIFY (Instagram)

```typescript
// lib/apify/client.ts
import { Actor } from 'apify';

const APIFY_TOKEN = process.env.APIFY_TOKEN;

export async function fetchInstagramMetrics(handle: string) {
  const client = new Actor(APIFY_TOKEN);
  
  // Usar o actor de Instagram scraper
  const run = await client.call('apify/instagram-scraper', {
    usernames: [handle],
    resultsLimit: 50,
    includeDetails: true,
  });
  
  return run;
}

// lib/apify/transformers.ts
export function transformApifyData(rawData: any): InstagramMetrics {
  return {
    handle: rawData.username,
    profile_name: rawData.fullName,
    followers_count: rawData.followersCount,
    following_count: rawData.followsCount,
    posts_count: rawData.postsCount,
    engagement_rate: calculateEngagementRate(rawData),
    avg_likes: calculateAvgLikes(rawData.latestPosts),
    avg_comments: calculateAvgComments(rawData.latestPosts),
    avg_reach: estimateReach(rawData),
    top_posts: transformPosts(rawData.latestPosts?.slice(0, 10)),
    fetched_at: new Date().toISOString(),
  };
}
```

## 6. FLUXO DE DADOS

### Métricas Instagram (Apify)
```
User clica "Atualizar"
    ↓
API Route: /api/instagram/metrics
    ↓
Apify Client → Instagram Scraper Actor
    ↓
Transformar dados
    ↓
Salvar em instagram_metrics (cache)
    ↓
Retornar para frontend
```

### Criação de Campanha
```
User preenche form → Submit
    ↓
API Route: /api/campaigns (POST)
    ↓
Validação Zod
    ↓
Insert em campaigns
    ↓
Trigger: Gerar conteúdo inicial (opcional)
    ↓
Retornar campaign criada
```

### Análise de Concorrentes
```
User seleciona concorrente
    ↓
API Route: /api/competitors/[handle]
    ↓
Verificar cache (< 24h)
    ↓
Se expirado: Apify → Scraper
    ↓
OpenAI → Análise de padrões
    ↓
Salvar em competitor_analysis
    ↓
Retornar dados + insights
```

## 7. ESTADOS DE UI

### Sidebar Navigation State
```typescript
interface SidebarState {
  expandedSections: {
    agentes: boolean;
    campanhas: boolean;
  };
  activeItem: string;
  collapsed: boolean;
}
```

### Campaign Form State
```typescript
interface CampaignFormState {
  name: string;
  objective: CampaignObjective;
  format: CampaignFormat;
  contentTypes: ContentType[];
  formats: FormatType[];
  startDate: Date;
  endDate?: Date;
  isSubmitting: boolean;
}
```

## 8. MIGRAÇÃO DE DADOS

### De workflows para campaigns
```sql
-- Migrar dados existentes da tabela workflows para campaigns
INSERT INTO campaigns (
  id, org_id, created_by, name, objective, format, 
  content_types, formats, start_date, status, created_at
)
SELECT 
  id, org_id, created_by, name, 
  'conversao'::campaign_objective,
  'interna'::campaign_format,
  ARRAY['tecnico']::content_type[],
  ARRAY['carrossel']::format_type[],
  CURRENT_DATE,
  CASE 
    WHEN status = 'active' THEN 'active'::campaign_status
    ELSE 'draft'::campaign_status
  END,
  created_at
FROM workflows;
```

## 9. SEGURANÇA (RLS)

```sql
-- Campaigns RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org campaigns"
  ON campaigns FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create campaigns in their org"
  ON campaigns FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid()
  ));

-- Personas RLS
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org personas"
  ON personas FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid()
  ));

-- Competitor analysis RLS
ALTER TABLE competitor_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org competitor data"
  ON competitor_analysis FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM organization_members 
    WHERE user_id = auth.uid()
  ));
```

## 10. PERFORMANCE CONSIDERAÇÕES

### Caching Strategy
- **Instagram Metrics**: Cache 4-6 horas (Apify tem limites)
- **Competitor Data**: Cache 24 horas
- **Campaigns/Personas**: Real-time (dados próprios)

### Otimizações
- Pagination em listas (20 items/page)
- Lazy loading de imagens
- SWR/React Query para cache de requisições
- Debounce em filtros de busca
