# Integração RAG para Agentes n8n

Documentação para configurar Retrieval Augmented Generation (RAG) nos agentes n8n usando a base de conhecimento.

## 🎯 Visão Geral

Todos os agentes podem consultar a base de conhecimento para:
- Buscar ganchos validados
- Encontrar frameworks de estratégia
- Acessar resumos executivos da marca

## 📡 Endpoints Disponíveis

### 1. Busca RAG (Principal)

**POST** `https://seu-site.com/api/knowledge/rag`

**Headers:**
```
Content-Type: application/json
Cookie: seu-cookie-de-autenticação
```

**Body:**
```json
{
  "query": "Quais são os melhores ganchos para posts sobre fundos imobiliários?",
  "base_types": ["ganchos", "estrategia"],
  "top_k": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "base_type": "ganchos",
      "title": "Gancho: Medo de perder dinheiro",
      "content": "Você sabia que 8 em cada 10 investidores...",
      "similarity": 0.89
    }
  ],
  "context": "=== CONTEXTO DA BASE DE CONHECIMENTO ===\n[Documento 1...",
  "query": "Quais são os melhores ganchos...",
  "total_results": 5
}
```

### 2. Gerar Embeddings

**POST** `https://seu-site.com/api/knowledge/generate-embeddings`

Gera embeddings para documentos pendentes (chamar após upload de arquivos).

---

## 🔧 Configuração no n8n

### Workflow de Busca RAG (Reutilizável)

Crie um workflow separado chamado **"RAG - Buscar Contexto"**:

```json
{
  "name": "RAG - Buscar Contexto",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook",
      "webhookUri": "rag-buscar-contexto"
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Buscar na API",
      "method": "POST",
      "url": "={{ $env.SITE_URL }}/api/knowledge/rag",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "query": "={{ $json.query }}",
        "base_types": "={{ $json.base_types }}",
        "top_k": "={{ $json.top_k || 5 }}"
      }
    }
  ]
}
```

### Exemplo: Agente Generalista com RAG

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Webhook   │────▶│  Buscar Contexto │────▶│  OpenAI Chat    │
│  (Entrada)  │     │  (HTTP Request)  │     │  (Com RAG)      │
└─────────────┘     └──────────────────┘     └─────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Supabase RAG    │
                    │  API             │
                    └──────────────────┘
```

#### Node HTTP Request (Buscar Contexto)

```javascript
// URL
{{ $env.SITE_URL }}/api/knowledge/rag

// Method
POST

// Headers
{
  "Content-Type": "application/json"
}

// Body (JSON)
{
  "query": "={{ $json.mensagem }}",
  "base_types": ["ganchos", "estrategia", "resumo_executivo"],
  "top_k": 5
}
```

#### Node OpenAI (Com Contexto)

```
System Prompt:
Você é um especialista em marketing financeiro da Autem.

Use o seguinte contexto da base de conhecimento para responder:

{{ $json.context }}

---
Instruções:
- Baseie suas respostas no contexto fornecido
- Se não houver contexto relevante, use seu conhecimento geral
- Mantenha o tom de voz da marca Autem
```

---

## 🎨 Base Types por Agente

### Agente Generalista
```json
{
  "base_types": ["ganchos", "estrategia", "resumo_executivo"]
}
```

### Agente de Ideias
```json
{
  "base_types": ["ganchos", "estrategia"]
}
```

### Agente de Campanhas
```json
{
  "base_types": ["estrategia", "resumo_executivo"]
}
```

### Agente de Personas
```json
{
  "base_types": ["resumo_executivo"]
}
```

### Agente de Concorrentes
```json
{
  "base_types": ["estrategia"]
}
```

---

## 🔄 Fluxo Completo

### 1. Upload de Documento

Quando um usuário faz upload de arquivo:

1. Frontend envia para `/api/knowledge/extract-text`
2. Texto é extraído e salvo no Supabase
3. Chamar `/api/knowledge/generate-embeddings` para gerar vetores

### 2. Consulta do Agente

Quando um agente recebe uma pergunta:

1. Envia query para `/api/knowledge/rag`
2. API gera embedding da query
3. Busca documentos similares no Supabase
4. Retorna contexto formatado
5. Agente usa contexto no prompt do LLM

---

## 🔐 Autenticação

Os endpoints exigem autenticação. No n8n, você pode:

### Opção 1: Cookie de Sessão (Recomendado)
Passar o cookie da sessão do usuário logado.

### Opção 2: API Key (Futuro)
Implementar autenticação por API key para serviço a serviço.

---

## 📝 Exemplo de Prompt com RAG

```
Você é o Agente de Conteúdo da Autem, uma empresa de educação financeira.

CONTEXTO RELEVANTE DA BASE DE CONHECIMENTO:
{{ $json.context }}

---

TAREFA: Crie um post sobre {{ $json.tema }}

DIRETRIZES:
1. Use os ganchos e estratégias do contexto quando relevante
2. Mantenha o tom de voz da marca
3. Foque no público-alvo de investidores iniciantes

FORMATO DE SAÍDA:
- Gancho (primeiras 2 linhas)
- Desenvolvimento
- CTA (call to action)
```

---

## 🚀 Próximos Passos

1. [ ] Criar webhook reutilizável no n8n
2. [ ] Adicionar node de busca RAG em cada agente
3. [ ] Testar com documentos reais
4. [ ] Ajustar top_k e thresholds de similaridade
