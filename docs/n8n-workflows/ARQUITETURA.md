# 🏗️ Arquitetura N8N - Autem Investimentos

## Resumo da Decisão

**✅ TODOS OS AGENTES NO N8N**

Seguindo o padrão do Agente Generalista existente, todos os agentes rodam no n8n via webhooks.

---

## 📁 Arquivos Criados

```
docs/
├── design/
│   ├── dashboard-refactor-wireframe.md     # Wireframes UI/UX
│   └── dashboard-refactor-architecture.md  # Arquitetura técnica
└── n8n-workflows/
    ├── README.md                           # Documentação completa
    ├── ARQUITETURA.md                      # Este arquivo
    ├── agente-campanhas.json               # Workflow n8n
    ├── agente-personas.json                # Workflow n8n
    ├── agente-concorrentes.json            # Workflow n8n (com Apify)
    └── agente-gerar-post.json              # Workflow n8n

src/
└── lib/
    └── n8n/
        └── client.ts                       # Cliente TypeScript
```

---

## 🔄 Fluxo de Dados

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│     n8n     │────▶│  AI Agent   │
│  Frontend   │◄────│  Webhook    │◄────│  (Gemini/   │
│             │     │             │     │   OpenAI)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         ┌────────┐   ┌────────┐   ┌────────┐
         │ Apify  │   │Supabase│   │Outras  │
         │(Insta) │   │(Dados) │   │APIs    │
         └────────┘   └────────┘   └────────┘
```

---

## 🤖 Agentes no N8N

| Agente | Endpoint | Modelo | Integrações |
|--------|----------|--------|-------------|
| **Generalista** | `97ab2e1b-12f4-4a2d-b087-be15edfaf000` | Gemini + OpenAI | - |
| **Campanhas** | `agente-campanhas` | GPT-4o-mini | - |
| **Personas** | `agente-personas` | GPT-4o-mini | - |
| **Concorrentes** | `agente-concorrentes` | GPT-4o-mini | Apify |
| **Gerar Post** | `agente-gerar-post` | GPT-4o-mini | - |

---

## 📋 Mapeamento Completo

### Menu Lateral → Funcionalidades → Agentes

```
📊 HOME
├── 💬 Ideias de Conteúdo (Chat)
│   └── Agente: GENERALISTA
│   └── Payload: { message, history, userId }
│   └── Exemplo: "Quero 5 ideias sobre FII"
│
├── 📈 Métricas Instagram
│   └── Agente: CONCORRENTES (com @autem.inv)
│   └── Payload: { concorrente: "Autem", handle: "autem.inv" }
│   └── Exemplo: Buscar métricas do perfil
│
└── 🎯 Campanhas Ativas (Preview)
    └── Dados do Supabase (não usa agente)

🤖 AGENTES
├── Conteúdo Generalista
│   └── Agente: GENERALISTA
│   └── Histórico: Supabase
│
├── Campanhas
│   └── Agente: CAMPANHAS
│   └── Payload: { nome, objetivo, formato, tiposConteudo, formatos, periodo }
│   └── Exemplo: Criar campanha de lançamento
│   └── Histórico: Supabase
│
├── Ideias de Conteúdo
│   └── Agente: GENERALISTA
│   └── Exemplo: "Sugestões para nutrição"
│
├── Ajustes dos Agentes
│   └── Configurações (não usa agente)
│
└── Análise de Concorrentes
    ├── XP Investimentos
    │   └── Agente: CONCORRENTES
    │   └── Payload: { concorrente: "XP", handle: "xpinvestimentos" }
    ├── Raul Sena
    │   └── Payload: { concorrente: "Raul Sena", handle: "raulsena" }
    ├── Primo Rico
    │   └── Payload: { concorrente: "Primo Rico", handle: "primorico" }
    └── Gêmeos das Finanças
        └── Payload: { concorrente: "Gêmeos", handle: "gemeosdasfinancas" }

👥 PERSONAS
├── Lista de Personas
│   └── Dados do Supabase
├── Nova Persona
│   └── Agente: PERSONAS
│   └── Payload: { acao: "criar", nome, perfil, dados }
│   └── Exemplo: Criar "Fernanda - Moderada"
├── Sugerir Conteúdo
│   └── Agente: PERSONAS
│   └── Payload: { acao: "sugerir-conteudo", nome, perfil, objetivo }
└── Gerar Post para Persona
    └── Agente: GERAR_POST
    └── Payload: { tema, tipoConteudo, formato, persona, perfilPersona }
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Necessárias

```sql
-- Campanhas
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  created_by uuid references auth.users(id),
  name text not null,
  objective text not null,
  format text not null,
  content_types text[] not null,
  formats text[] not null,
  start_date date not null,
  end_date date,
  status text default 'draft',
  ai_response text, -- Resposta do agente
  created_at timestamptz default now()
);

-- Personas
create table personas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  created_by uuid references auth.users(id),
  name text not null,
  profile_type text not null,
  age_range text,
  income_range text,
  patrimony_range text,
  objectives text[],
  fears text[],
  interests text[],
  communication_tone text,
  preferred_channels jsonb,
  conversion_triggers text[],
  ai_response text, -- Resposta do agente
  created_at timestamptz default now()
);

-- Histórico de Interações com Agentes
create table agent_history (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  user_id uuid references auth.users(id),
  agent_type text not null, -- 'generalista', 'campanhas', etc
  payload jsonb not null,
  response text not null,
  created_at timestamptz default now()
);

-- Cache de Análise de Concorrentes
create table competitor_cache (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  handle text not null,
  name text not null,
  metrics jsonb not null,
  top_posts jsonb,
  ai_analysis text,
  fetched_at timestamptz default now(),
  unique(org_id, handle)
);

-- Cache de Métricas Instagram
create table instagram_metrics (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  handle text not null,
  profile_name text,
  followers_count integer,
  engagement_rate numeric,
  raw_data jsonb,
  fetched_at timestamptz default now(),
  unique(org_id, handle)
);
```

---

## 🚀 Implementação - Passo a Passo

### Fase 1: Preparação (Agora)
1. ✅ Criar workflows no n8n (importar JSONs)
2. ✅ Configurar credenciais (OpenAI, Apify)
3. ✅ Testar cada agente via Postman

### Fase 2: Banco de Dados
1. Criar tabelas no Supabase
2. Configurar RLS policies
3. Criar funções/triggers se necessário

### Fase 3: Frontend
1. Atualizar sidebar com nova estrutura
2. Criar tela de Campanhas
3. Criar tela de Personas
4. Criar tela de Análise de Concorrentes
5. Implementar chamadas aos agentes

### Fase 4: Integrações
1. Conectar Apify
2. Configurar cache de métricas
3. Agendamentos automáticos (opcional)

---

## 📊 Exemplo de Uso Completo

### Criar Campanha
```typescript
// 1. Usuário preenche formulário no frontend
const formData = {
  nome: "Lançamento FII Autem",
  objetivo: "conversao",
  formato: "lancamento",
  tiposConteudo: ["tecnico", "emocional", "autoridade"],
  formatos: ["carrossel", "reels"],
  periodo: { inicio: "2026-03-01", fim: "2026-03-15" },
  persona: "Investidor Moderado"
};

// 2. Chamar agente
const respostaAgente = await agenteCampanhas(formData);

// 3. Salvar no Supabase
await supabase.from('campaigns').insert({
  ...formData,
  ai_response: respostaAgente,
  org_id: orgId,
  created_by: userId
});

// 4. Mostrar resposta ao usuário
// Inclui: calendário, sugestões de temas, métricas esperadas
```

### Analisar Concorrente
```typescript
// 1. Usuário seleciona concorrente
const payload = {
  concorrente: "XP Investimentos",
  handle: "xpinvestimentos"
};

// 2. Chamar agente (pode demorar ~30s)
const analise = await agenteConcorrentes(payload);

// 3. Salvar no cache
await supabase.from('competitor_cache').upsert({
  org_id: orgId,
  handle: payload.handle,
  name: payload.concorrente,
  metrics: analise.metricas,
  top_posts: analise.topPosts,
  ai_analysis: analise.analise,
  fetched_at: new Date().toISOString()
});

// 4. Mostrar ao usuário
// Inclui: métricas, top posts, insights, recomendações
```

---

## ⚡ Performance & Otimização

### Timeouts
```typescript
// Agente Generalista: 30s
// Agente Campanhas: 30s
// Agente Personas: 30s
// Agente Concorrentes: 60s (Apify)
// Agente Gerar Post: 30s
```

### Cache
| Dado | TTL | Onde |
|------|-----|------|
| Análise de Concorrentes | 24h | Supabase |
| Métricas Instagram | 6h | Supabase |
| Respostas de Agentes | Persistente | Supabase |

### Retry Logic
```typescript
// Implementar no cliente
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Se falhar, tentar novamente
// Se timeout, mostrar mensagem amigável
```

---

## 🔐 Segurança

### Credenciais
- **Nunca** expor API keys no frontend
- Usar apenas server-side (API Routes) se necessário
- No n8n, credenciais ficam no ambiente seguro

### Autenticação
```typescript
// Opcional: Validar JWT antes de chamar agente
const user = await supabase.auth.getUser();
if (!user) throw new Error("Não autorizado");
```

### Rate Limiting
- OpenAI: Depende do tier
- Apify: Verificar plano atual
- Implementar throttle no frontend

---

## 📞 Resumo para Implementação

### O que está pronto:
✅ Workflows n8n (JSON)  
✅ Cliente TypeScript  
✅ Documentação  
✅ Arquitetura de dados  

### Próximos passos:
🔄 Importar workflows no n8n  
🔄 Criar tabelas no Supabase  
🔄 Implementar telas no frontend  
🔄 Testar integrações  

---

## 💡 Dicas

1. **Teste primeiro no n8n** - Use o "Execute Workflow" antes de integrar
2. **Monitore os logs** - N8N tem logs detalhados de cada execução
3. **Use o pin data** - Para testar com dados fixos
4. **Versão seus workflows** - N8N salva histórico de versões
5. **Backup dos JSONs** - Mantenha os arquivos JSON no git
