# AUTEM AI - Plataforma de Gestão de Conteúdo com IA

> **Nota:** Este projeto foi desenvolvido com o framework **Synkra AIOS** (AI Operating System) para orquestração de agentes de IA.

## 🚀 O que é o AUTEM AI?

O **AUTEM AI** é uma plataforma completa para **gestão, planejamento e criação de conteúdo digital com Inteligência Artificial**. A plataforma integra múltiplos agentes de IA, base de conhecimento vetorizada e automação via n8n para criar uma experiência unificada de produção de conteúdo.

---

## ✨ Funcionalidades Principais

### 🤖 **Agentes de IA**
- Interface conversacional integrada com n8n webhooks
- RAG (Retrieval Augmented Generation) com base de conhecimento
- Histórico de conversas mantido por sessão
- Respostas contextualizadas com base em documentos

### 📚 **Base de Conhecimento (RAG)**
Sistema de busca semântica com embeddings vetorizados:

| Base | Descrição |
|------|-----------|
| **Ganchos** | Hooks e frases de abertura validadas para conteúdo |
| **Estratégia** | Frameworks e princípios de alta conversão |
| **Resumo Executivo** | Posicionamento, tom de voz e essência da marca |

- CRUD completo de documentos
- Geração automática de embeddings via OpenAI
- Busca semântica com pgvector (Supabase)

### 👤 **Personas**
Perfis detalhados de público-alvo:
- Fernanda (Empreendedora)
- Ricardo (Profissional liberal)
- Camila (Executiva)
- Leandro (Estudante/Autônomo)

### 📊 **Dashboard**
- Visão geral de métricas
- Chat rápido com o agente de conteúdo
- Cards expansíveis com analytics

### 🎯 **Campanhas**
Gestão de campanhas de marketing e conteúdo

---

## 🏗️ Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Dashboard │  │  Knowledge  │  │      Campanhas      │ │
│  │   Chat AI   │  │     CRUD    │  │      Personas       │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         └─────────────────┴────────────────────┘            │
│                         │                                   │
│              ┌──────────┴──────────┐                       │
│              │    API Routes       │                       │
│              │  /api/n8n-agent     │                       │
│              │  /api/knowledge/*   │                       │
│              └──────────┬──────────┘                       │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│              BACKEND & INTEGRAÇÕES                         │
│                         │                                   │
│  ┌──────────────────────┴──────────────────────┐           │
│  │              Supabase (PostgreSQL)          │           │
│  │  • knowledge_documents (com pgvector)      │           │
│  │  • Autenticação e autorização              │           │
│  └──────────────────────┬──────────────────────┘           │
│                         │                                   │
│  ┌──────────────────────┴──────────────────────┐           │
│  │           n8n (Automação)                   │           │
│  │  • Webhook para processamento de IA        │           │
│  │  • Workflows de agentes conversacionais    │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | Next.js 15.1.0 + React 19 |
| **Linguagem** | TypeScript 5.9 |
| **Estilização** | Tailwind CSS 3.4 + shadcn/ui |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **Autenticação** | Supabase Auth |
| **AI/ML** | OpenAI API (embeddings) |
| **Automação** | n8n Webhooks |
| **Fontes** | Inter (main), JetBrains Mono (code) |

---

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/                    # Rotas Next.js (App Router)
│   │   ├── (app)/             # Grupo de rotas autenticadas
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── agents/        # Gestão de agentes
│   │   │   ├── knowledge/     # Base de conhecimento
│   │   │   ├── campanhas/     # Campanhas de marketing
│   │   │   └── settings/      # Configurações
│   │   └── api/               # API Routes
│   │       ├── n8n-agent/     # Proxy para n8n
│   │       └── knowledge/     # CRUD documentos
│   ├── components/            # Componentes React
│   │   ├── dashboard/         # Cards e chat
│   │   ├── layout/            # Sidebar, shell
│   │   └── ui/                # shadcn components
│   └── lib/                   # Utilitários
│       ├── ai/                # Lógica de IA
│       └── supabase/          # Clientes Supabase
├── supabase/
│   └── migrations/            # Schema e funções SQL
└── scripts/                   # Scripts utilitários
```

---

## 🚦 Como Executar

### Pré-requisitos
- Node.js 20+
- Conta Supabase com pgvector habilitado
- Instância n8n configurada
- Chave API OpenAI

### 1. Clone e instale
```bash
git clone https://github.com/Gabrielloopes33/utem1.git
cd utem1
npm install
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

**Variáveis obrigatórias:**
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service
OPENAI_API_KEY=sk-...
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/...
```

### 3. Execute as migrações do banco
No SQL Editor do Supabase, execute os arquivos em `supabase/migrations/`.

### 4. Inicie o servidor
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run typecheck` | Verificação de tipos TypeScript |
| `npm run db:seed` | Popula base de conhecimento com dados iniciais |
| `npm run db:embeddings` | Gera embeddings para documentos |

---

## 🔌 Integrações

### n8n Webhook
O sistema envia requisições POST para o webhook do n8n com:
```json
{
  "message": "mensagem do usuário",
  "history": [...],
  "knowledgeContext": "contexto RAG",
  "userId": "id-do-usuario",
  "timestamp": "2026-03-02T..."
}
```

### Supabase Vector Search
Busca semântica utilizando a função SQL:
```sql
search_knowledge_base(
  query_embedding: vector(1536),
  base_filter: text[],
  match_count: int
)
```

---

## 🤝 Contribuição

Este projeto utiliza o **Synkra AIOS** para orquestração de agentes de desenvolvimento. Consulte `AGENTS.md` para entender o fluxo de trabalho dos agentes.

---

## 📄 Licença

Projeto proprietário - Agência Touch / Synkra

---

<p align="center">
  <strong>Feito com 💜 e IA</strong><br>
  <em>Synkra AIOS Framework</em>
</p>
