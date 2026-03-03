# 🤖 Workflows N8N - Autem Investimentos

## Estrutura de Agentes

Todos os agentes seguem o padrão: **Webhook → Processamento → AI Agent → Response**

---

## 📋 Lista de Agentes

### 1. AGENTE GENERALISTA ✅ (Já existente)
- **Webhook:** `97ab2e1b-12f4-4a2d-b087-be15edfaf000`
- **Função:** Planejamento geral de conteúdo
- **Modelo:** Google Gemini + OpenAI
- **Status:** 🟢 Ativo

**Payload:**
```json
{
  "message": "Quero um bloco de 7 conteúdos para nutrição no Instagram",
  "history": [],
  "userId": "uuid-do-usuario"
}
```

---

### 2. AGENTE CAMPANHAS 🆕
- **Webhook:** `agente-campanhas`
- **Função:** Criar e estruturar campanhas de marketing
- **Modelo:** OpenAI GPT-4o-mini

**Payload:**
```json
{
  "nome": "Lançamento FII Autem",
  "objetivo": "conversao",
  "formato": "lancamento",
  "tiposConteudo": ["tecnico", "emocional", "autoridade"],
  "formatos": ["carrossel", "reels"],
  "periodo": {
    "inicio": "2026-03-01",
    "fim": "2026-03-15"
  },
  "persona": "Investidor Moderado"
}
```

**Resposta:**
- Confirmação da estrutura
- Calendário de conteúdo
- Mix de conteúdo balanceado
- Métricas esperadas
- Próximos passos

---

### 3. AGENTE PERSONAS 🆕
- **Webhook:** `agente-personas`
- **Função:** Criar e analisar personas de investidores
- **Modelo:** OpenAI GPT-4o-mini

**Payload para Criar:**
```json
{
  "acao": "criar",
  "nome": "Fernanda",
  "perfil": "moderado",
  "dados": {
    "idade": 35,
    "renda": "R$ 15K/mês",
    "objetivo": "Aposentadoria"
  }
}
```

**Payload para Sugerir Conteúdo:**
```json
{
  "acao": "sugerir-conteudo",
  "nome": "Fernanda",
  "perfil": "moderado",
  "objetivo": "atração"
}
```

**Resposta:**
- Perfil completo da persona
- Dados demográficos
- Comportamentos e medos
- Tom de comunicação ideal
- Gatilhos de conversão
- Exemplos de conteúdo

---

### 4. AGENTE CONCORRENTES 🆕
- **Webhook:** `agente-concorrentes`
- **Função:** Análise de concorrentes com Apify + AI
- **Modelo:** OpenAI GPT-4o-mini
- **Integrações:** Apify Instagram Scraper

**Payload:**
```json
{
  "concorrente": "XP Investimentos",
  "handle": "xpinvestimentos"
}
```

**Fluxo:**
1. Recebe handle do Instagram
2. Busca dados via Apify
3. Processa métricas
4. AI Agent analisa padrões
5. Gera insights e recomendações

**Resposta:**
- Métricas (seguidores, engajamento)
- Top posts performáticos
- Análise de conteúdo
- Insights da IA
- Recomendações para Autem

---

### 5. AGENTE GERAR POST 🆕
- **Webhook:** `agente-gerar-post`
- **Função:** Criar posts prontos para Instagram
- **Modelo:** OpenAI GPT-4o-mini

**Payload:**
```json
{
  "tema": "FII vs Tesouro Selic",
  "tipoConteudo": "tecnico",
  "formato": "carrossel",
  "persona": "Investidor Conservador",
  "perfilPersona": "conservador",
  "campanha": "Educação Financeira",
  "referencias": "Material sobre RF enviado"
}
```

**Resposta (JSON):**
```json
{
  "post": "... conteúdo completo ...",
  "metadata": {
    "tipo": "tecnico",
    "formato": "carrossel",
    "tema": "FII vs Tesouro Selic"
  }
}
```

**Estrutura do Post:**
- Conceito/Hook
- Conteúdo formatado por tipo
- Legenda completa
- Hashtags
- Elementos visuais sugeridos

---

## 🛠️ Como Importar no N8N

### Método 1: Importar JSON
1. Acesse seu n8n: `https://flow.agenciatouch.com.br`
2. Menu lateral → **Workflows**
3. Clique **"Add Workflow"** ou **"Import"**
4. Cole o conteúdo do arquivo JSON
5. Ajuste as credenciais (OpenAI, Apify)
6. Salve e ative

### Método 2: Criar Manualmente
Se preferir criar manualmente, siga esta estrutura para cada agente:

```
Webhook (POST) → Extract Data (Code) → AI Agent → Respond to Webhook
                      ↑
               OpenAI Chat Model
```

**Configurações Importantes:**
- Webhook: `responseMode` = `responseNode`
- AI Agent: `promptType` = `define`
- Respond: `respondWith` = `text` ou `json`

---

## 📡 Como Chamar do Frontend

### Configuração Base
```typescript
// lib/n8n/client.ts
const N8N_BASE_URL = 'https://flow.agenciatouch.com.br/webhook';

async function callAgent(endpoint: string, payload: any) {
  const response = await fetch(`${N8N_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}
```

### Exemplos de Uso

#### Chamar Agente Generalista
```typescript
const resultado = await callAgent('97ab2e1b-12f4-4a2d-b087-be15edfaf000', {
  message: 'Quero ideias de conteúdo sobre fundos imobiliários',
  history: [],
  userId: user.id
});
```

#### Chamar Agente de Campanhas
```typescript
const campanha = await callAgent('agente-campanhas', {
  nome: 'Lançamento FII',
  objetivo: 'conversao',
  formato: 'lancamento',
  tiposConteudo: ['tecnico', 'emocional'],
  formatos: ['carrossel', 'reels'],
  periodo: { inicio: '2026-03-01', fim: '2026-03-15' }
});
```

#### Chamar Agente de Concorrentes
```typescript
const analise = await callAgent('agente-concorrentes', {
  concorrente: 'XP Investimentos',
  handle: 'xpinvestimentos'
});
```

---

## 🔑 Credenciais Necessárias

### OpenAI
- Nome: `OpenAI` (ou ajuste nos workflows)
- Tipo: `openAiApi`
- API Key: Da sua conta OpenAI

### Apify (apenas para Agente Concorrentes)
- Nome: `Apify`
- Tipo: `httpQueryAuth` ou `httpHeaderAuth`
- Token: Da sua conta Apify

---

## 📊 Mapeamento de Telas → Agentes

| Tela | Funcionalidade | Agente N8N |
|------|----------------|------------|
| Home - Chat | Ideias de conteúdo | Generalista |
| Home - Métricas | Dados Instagram | Concorrentes (com @autem.inv) |
| Campanhas - Nova | Criar campanha | Campanhas |
| Campanhas - Gerar Post | Criar post | Gerar Post |
| Personas - Nova | Criar persona | Personas |
| Personas - Sugerir | Ideias de conteúdo | Personas |
| Concorrentes | Análise completa | Concorrentes |

---

## ⚠️ Considerações Importantes

### Timeouts
- Agente Generalista: ~5-10s
- Agente Concorrentes: ~15-30s (inclui Apify)
- Outros: ~5-10s

### Rate Limits
- OpenAI: Depende do tier da sua conta
- Apify: Verificar limites do plano

### Cache
Recomendamos implementar cache no frontend para:
- Análise de concorrentes (24h)
- Métricas Instagram (6h)

---

## 🚀 Próximos Passos

1. ✅ Importar workflows no n8n
2. ✅ Configurar credenciais (OpenAI, Apify)
3. ✅ Testar cada agente via Postman/Insomnia
4. ✅ Implementar chamadas no frontend Next.js
5. ✅ Adicionar loading states e error handling

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de execução no n8n
2. Confirme que as credenciais estão configuradas
3. Teste o webhook diretamente no n8n (modo "Listen")
4. Verifique os payloads enviados
