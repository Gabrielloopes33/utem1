# Especificação de Wireframes - Páginas de Agentes

**Projeto:** Synkra AIOS / Autem  
**Data:** 2026-03-03  
**Autor:** Uma (UX-Design Expert)  
**Status:** Draft  

---

## 📋 Sumário

1. [Visão Geral](#1-visão-geral)
2. [Agente Generalista](#2-agente-generalista)
3. [Agente Campanhas](#3-agente-campanhas)
4. [Agente Personas](#4-agente-personas)
5. [Agente Gerar Post](#5-agente-gerar-post)
6. [Componentes Atômicos Compartilhados](#6-componentes-atômicos-compartilhados)
7. [Fluxos de Navegação](#7-fluxos-de-navegação)
8. [Checklist de Implementação](#8-checklist-de-implementação)

---

## 1. Visão Geral

### 1.1 Contexto
Esta especificação detalha as interfaces para 4 agentes de IA do sistema Synkra AIOS:

| Agente | Rota | Tipo | Integração N8N |
|--------|------|------|----------------|
| Generalista | `/agentes/generalista` | Página dedicada | Webhook direto |
| Campanhas | `/campanhas` (modal) | Modal integrado | `agente-campanhas` |
| Personas | `/personas` (modal) | Modal integrado | `agente-personas` |
| Gerar Post | `/agentes/gerar-post` | Página dedicada | `agente-gerar-post` |

### 1.2 Metodologia: Atomic Design

Todas as interfaces seguem a metodologia **Atomic Design**:

```
┌─────────────────────────────────────────┐
│           ATOMIC DESIGN HIERARCHY       │
├─────────────────────────────────────────┤
│  Atoms     → Button, Input, Label       │
│  Molecules → FormField, ChatBubble      │
│  Organisms → ChatPanel, CampaignForm    │
│  Templates → Page layouts               │
│  Pages     → Specific instances         │
└─────────────────────────────────────────┘
```

### 1.3 Estados Comuns

Todos os componentes devem implementar:

| Estado | Descrição | Indicador Visual |
|--------|-----------|------------------|
| `idle` | Estado inicial/pronto | - |
| `loading` | Processando requisição | Spinner + texto |
| `error` | Erro na requisição | Alert vermelho + retry |
| `empty` | Sem dados | EmptyState ilustrado |
| `success` | Ação completada | Toast + resultado |
| `streaming` | Resposta sendo recebida | Animação de typing |

---

## 2. Agente Generalista

**Rota:** `/agentes/generalista`  
**Tipo:** Página dedicada de chat  
**Agente N8N:** `agenteGeneralista()`  
**Payload:** `{ message, history, userId }`

### 2.1 Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [AUTEM]              Agente Generalista              [👤 Profile] [⚙️]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  HEADER DO AGENTE                                                   │   │
│  │  ┌─────┐                                                            │   │
│  │  │ 🤖  │  Assistente de Conteúdo        [i] Info do agente          │   │
│  │  └─────┘  Brainstorming de ideias de investimentos                 │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  CHAT AREA (scrollable)                                             │   │
│  │                                                                     │   │
│  │  ┌──────────┐                                                      │   │
│  │  │🤖        │  Olá! Sou o Assistente de Conteúdo da Autem.        │   │
│  │  │          │  Posso ajudar com ideias sobre:                      │   │
│  │  │          │                                                       │   │
│  │  │          │  • Fundos Imobiliários                               │   │
│  │  │          │  • Renda Fixa vs Variável                            │   │
│  │  │          │  • Diversificação de carteira                        │   │
│  │  │          │  • Estratégias de investimento                       │   │
│  │  └──────────┘                                                       │   │
│  │                                                                     │   │
│  │                        ┌──────────┐                                │   │
│  │  Ideias sobre FII      │👤        │                                │   │
│  │  pra iniciantes        └──────────┘                                │   │
│  │                                                                     │   │
│  │  ┌──────────┐                                                       │   │
│  │  │🤖        │  [Loading...] ████████████░░░                        │   │
│  │  │ ●●●      │                                                     │   │
│  │  └──────────┘                                                      │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SUGESTÕES RÁPIDAS                                                  │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │   │
│  │  │ 📊 Fundos    │ │ ⚖️ RF vs FII │ │ 💡 Dicas de  │               │   │
│  │  │ Imobiliários │ │              │ │ Investimento │               │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘               │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │   │
│  │  │ 🏠 FII vs    │ │ 📈 CDB vs    │ │ 🔄 Diversifi-│               │   │
│  │  │ Tesouro      │ │ Tesouro      │ │ cação        │               │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  INPUT AREA                                                         │   │
│  │  ┌────────────────────────────────────────────┬──────────────────┐ │   │
│  │  │ Digite sua pergunta sobre investimentos... │ [📎] [▶️]        │ │   │
│  │  └────────────────────────────────────────────┴──────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes (Atomic Design)

#### Atoms
| Componente | Props | Descrição |
|------------|-------|-----------|
| `ChatBubble` | `role: 'user' \| 'assistant'`, `content: string`, `timestamp: Date`, `isStreaming?: boolean` | Bala de chat individual |
| `QuickPromptChip` | `label: string`, `icon: LucideIcon`, `onClick: () => void` | Chip clicável de sugestão |
| `TypingIndicator` | - | Animação de digitação (3 pontos) |

#### Molecules
| Componente | Props | Descrição |
|------------|-------|-----------|
| `ChatMessage` | `message: Message`, `isLast?: boolean` | Combina avatar + bubble + timestamp |
| `QuickPromptsGrid` | `prompts: QuickPrompt[]`, `onSelect: (prompt) => void` | Grid de sugestões rápidas |
| `ChatInput` | `value: string`, `onChange: (val) => void`, `onSend: () => void`, `isLoading: boolean` | Input + botão enviar |

#### Organisms
| Componente | Props | Descrição |
|------------|-------|-----------|
| `ChatPanel` | `messages: Message[]`, `onSend: (msg) => void`, `isLoading: boolean`, `suggestions: QuickPrompt[]` | Área completa de chat |
| `AgentHeader` | `name: string`, `description: string`, `icon: ReactNode` | Cabeçalho do agente |

### 2.3 Estados

```typescript
interface GeneralistaPageState {
  // Data
  messages: Message[];
  input: string;
  sessionId?: string;
  
  // UI State
  isLoading: boolean;
  isStreaming: boolean;
  error: Error | null;
  
  // Config
  quickPrompts: QuickPrompt[];
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
};
```

| Estado | Comportamento |
|--------|---------------|
| `idle` | Chat vazio com mensagem de boas-vindas |
| `loading` | Mostra `TypingIndicator` no lugar da resposta |
| `streaming` | Atualiza conteúdo gradualmente com animação |
| `error` | Toast de erro + opção de retry |
| `empty` | Mensagem de boas-vindas do agente |

### 2.4 Fluxo de Interação

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   START     │────▶│    IDLE     │────▶│  TYPING     │────▶│   LOADING   │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
       ▲                                                           │
       │                    ┌─────────────┐                        │
       └────────────────────│   ERROR     │◀───────────────────────┤
                            └──────┬──────┘                        │
                                   │                               │
                                   └───────────────────────────────┘
                                                                   │
                            ┌─────────────┐                        │
                            │  STREAMING  │◀───────────────────────┘
                            └──────┬──────┘
                                   │
                                   ▼
                            ┌─────────────┐
                            │   SUCCESS   │
                            └─────────────┘
```

### 2.5 Props da Página

```typescript
// app/(app)/agentes/generalista/page.tsx
interface GeneralistaPageProps {
  // Nenhuma prop necessária - página autônoma
}

// Componentes filhos
interface ChatPanelProps {
  initialMessage?: string;
  userId: string;
  agentEndpoint: string;
}

interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
  icon: LucideIcon;
  category: 'fundos' | 'comparacao' | 'dicas' | 'estratégia';
}
```

---

## 3. Agente Campanhas

**Rota:** `/campanhas` (modal)  
**Tipo:** Modal integrado à página existente  
**Agente N8N:** `agenteCampanhas()`  
**Payload:** `{ nome, objetivo, formato, tiposConteudo, formatos, periodo, persona }`

### 3.1 Wireframe - Modal de Criação

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✨ Nova Campanha                                    [×]            │   │
│  │                                                                     │   │
│  │  Preencha os dados e deixe a IA estruturar o plano completo.       │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  Nome da Campanha *                                                 │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ Lançamento FII Autem Q1                                      │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  Objetivo *              Formato *                                  │   │
│  │  ┌──────────────────┐   ┌──────────────────┐                       │   │
│  │  │ Conversão     ▼  │   │ Lançamento    ▼  │                       │   │
│  │  │ • Conversão      │   │ • Lançamento     │                       │   │
│  │  │ • Atração        │   │ • Perpétuo       │                       │   │
│  │  │ • Nutrição       │   │ • Campanha Int.  │                       │   │
│  │  └──────────────────┘   └──────────────────┘                       │   │
│  │                                                                     │   │
│  │  Tipos de Conteúdo * (Selecione pelo menos um)                      │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │   │
│  │  │ ☑️ Técnico   │ │ ☑️ Emocional │ │ ☐ Objeção    │               │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘               │   │
│  │  ┌──────────────┐ ┌──────────────┐                                │   │
│  │  │ ☑️ Autoridade│ │ ☐ Social     │                                │   │
│  │  └──────────────┘ └──────────────┘                                │   │
│  │                                                                     │   │
│  │  Formatos * (Selecione pelo menos um)                               │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │   │
│  │  │ ☑️ Carrossel │ │ ☑️ Card      │ │ ☑️ Reels     │               │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘               │   │
│  │                                                                     │   │
│  │  Período da Campanha                                                │   │
│  │  De *                        Até (opcional)                         │   │
│  │  ┌──────────────────┐       ┌──────────────────┐                   │   │
│  │  │ 📅 01/03/2026    │  até  │ 📅 15/03/2026    │                   │   │
│  │  └──────────────────┘       └──────────────────┘                   │   │
│  │                                                                     │   │
│  │  Persona Alvo (opcional)                                            │   │
│  │  ┌──────────────────┐                                              │   │
│  │  │ Fernanda      ▼  │                                              │   │
│  │  └──────────────────┘                                              │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │              [Cancelar]    [    ✨ Criar com IA    ]               │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Wireframe - Resultado (Drawer Lateral)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  CAMPANHAS                              [+ Nova Campanha]                   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌───────────────────────────────────────┐ │
│  │ FILTROS                     │  │ RESULTADO DA IA                    [×]│ │
│  │                             │  │                                       │ │
│  │ Status: [Todas ▼]           │  │  ✅ Campanha criada com sucesso!      │ │
│  │                             │  │                                       │ │
│  │ ─────────────────────────   │  │  📋 PLANO ESTRATÉGICO                 │ │
│  │                             │  │                                       │ │
│  │ METRICS                     │  │  Lançamento FII Autem Q1              │ │
│  │ ┌─────────┐                 │  │  Objetivo: Conversão                  │ │
│  │ │ 3       │                 │  │  Período: 01/03 - 15/03              │ │
│  │ │Campanhas│                 │  │                                       │ │
│  │ └─────────┘                 │  │  📅 CALENDÁRIO DE CONTEÚDO            │ │
│  │                             │  │                                       │ │
│  │ ┌─────────┐                 │  │  Semana 1:                            │ │
│  │ │ 2       │                 │  │  • 01/03 - Carrossel: "5 motivos..."  │ │
│  │ │ Ativas  │                 │  │  • 03/03 - Reels: "Por que FII..."    │ │
│  │ └─────────┘                 │  │  • 05/03 - Card: "Dividendos..."      │ │
│  │                             │  │                                       │ │
│  └─────────────────────────────┘  │  Semana 2:                            │ │
│                                   │  • 08/03 - Carrossel: "Comparativo..."│ │
│  ┌─────────────────────────────┐  │  ...                                  │ │
│  │ 🚀 CAMPANHA: Lançamento...  │  │                                       │ │
│  │                             │  │  🎯 MÉTRICAS ESPERADAS                │ │
│  │ Objetivo: Conversão         │  │  • Alcance estimado: 45K              │ │
│  │ Status: 🟢 Ativa            │  │  • Engajamento: 4.2%                  │ │
│  │                             │  │  • Leads esperados: 120               │ │
│  │ [Ver] [Gerar Post]          │  │                                       │ │
│  └─────────────────────────────┘  │  [📋 Copiar Plano]  [📤 Exportar]     │ │
│                                   │                                       │ │
│  ┌─────────────────────────────┐  │  [✨ Gerar Posts para esta campanha]  │ │
│  │ 🎯 Educação Financeira...   │  │                                       │ │
│  │                             │  └───────────────────────────────────────┘ │
│  │ ...                         │                                            │
│  └─────────────────────────────┘                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Componentes (Atomic Design)

#### Atoms (reutilizados)
- `Checkbox` - seleção múltipla de tipos/formatos
- `Select` - dropdowns de objetivo/formato/persona
- `Input` - nome da campanha, datas
- `Button` - ações primárias/secundárias

#### Molecules
| Componente | Props | Descrição |
|------------|-------|-----------|
| `ContentTypeSelector` | `selected: ContentType[]`, `onChange: (types) => void` | Grid de checkboxes de tipos |
| `FormatSelector` | `selected: FormatType[]`, `onChange: (formats) => void` | Grid de checkboxes de formatos |
| `DateRangeField` | `start: Date`, `end?: Date`, `onChange: (range) => void` | Campos de data início/fim |
| `PersonaSelect` | `value?: string`, `personas: Persona[]`, `onChange: (id) => void` | Select de personas |

#### Organisms
| Componente | Props | Descrição |
|------------|-------|-----------|
| `CampaignForm` | `onSubmit: (data) => void`, `isLoading: boolean`, `personas: Persona[]` | Form completo de criação |
| `CampaignResultDrawer` | `campaign: Campaign`, `aiResponse: string`, `onClose: () => void` | Drawer com resultado da IA |
| `CampaignWizard` | `steps: WizardStep[]`, `currentStep: number` | Wizard opcional em steps |

### 3.4 Estados do Formulário

```typescript
interface CampaignFormState {
  // Form data
  name: string;
  objective: CampaignObjective | '';
  format: CampaignFormat | '';
  content_types: ContentType[];
  formats: FormatType[];
  start_date: string;
  end_date: string;
  persona_id?: string;
  
  // Validation
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  
  // UI
  isSubmitting: boolean;
  isValid: boolean;
}

// Validações
const VALIDATION_RULES = {
  name: { required: true, minLength: 3, maxLength: 100 },
  objective: { required: true },
  format: { required: true },
  content_types: { required: true, minItems: 1 },
  formats: { required: true, minItems: 1 },
  start_date: { required: true },
};
```

### 3.5 Fluxo de Criação

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAMPANHA CREATION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│   │   OPEN   │───▶│  FILL    │───▶│ VALIDATE │───▶│  SUBMIT  │            │
│   │  MODAL   │    │  FORM    │    │   FORM   │    │   TO AI  │            │
│   └──────────┘    └──────────┘    └────┬─────┘    └────┬─────┘            │
│                                        │               │                   │
│                                   ERROR│               │SUCCESS            │
│                                        ▼               ▼                   │
│                                   ┌──────────┐    ┌──────────┐            │
│                                   │  SHOW    │    │  SHOW    │            │
│                                   │ ERRORS   │    │ LOADING  │            │
│                                   └──────────┘    └────┬─────┘            │
│                                                        │                   │
│                             ┌──────────────────────────┼──────────┐       │
│                             │                          ▼          │       │
│                             │                     ┌──────────┐   │       │
│                             │                     │  STREAM  │   │       │
│                             │                     │ RESPONSE │   │       │
│                             │                     └────┬─────┘   │       │
│                             │                          │          │       │
│                             ▼                          ▼          ▼       │
│                        ┌──────────┐              ┌──────────┐            │
│                        │  ERROR   │              │  SHOW    │            │
│                        │  TOAST   │              │ RESULT   │            │
│                        │  + Retry │              │ DRAWER   │            │
│                        └──────────┘              └──────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.6 Props do Modal

```typescript
// components/campanhas/campaign-form-modal.tsx
interface CampaignFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  personas: Persona[];
  isLoading?: boolean;
}

interface CampaignFormData {
  name: string;
  objective: CampaignObjective;
  format: CampaignFormat;
  content_types: ContentType[];
  formats: FormatType[];
  start_date: string;
  end_date?: string;
  persona_id?: string;
}
```

---

## 4. Agente Personas

**Rota:** `/personas` (modal)  
**Tipo:** Modal integrado à página existente  
**Agente N8N:** `agentePersonas()`  
**Payload:** `{ acao: 'criar', nome, perfil, dados: { idade, renda, patrimonio } }`

### 4.1 Wireframe - Modal de Criação

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✨ Nova Persona                                     [×]            │   │
│  │                                                                     │   │
│  │  Crie um perfil de investidor e deixe a IA completar as             │   │
│  │  características detalhadas.                                        │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  Nome *                                                             │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ Fernanda                                                     │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  Perfil do Investidor *                                             │   │
│  │                                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│  │  │    🛡️        │  │    📈        │  │    ⚡        │             │   │
│  │  │              │  │              │  │              │             │   │
│  │  │ Conservador  │  │  Moderado    │  │  Agressivo   │             │   │
│  │  │              │  │              │  │              │             │   │
│  │  │ Prioriza     │  │  Balanceado  │  │  Busca alta  │             │   │
│  │  │ segurança    │  │  entre risco │  │  rentabilid. │             │   │
│  │  │              │  │  e retorno   │  │              │             │   │
│  │  │   [SELECTED] │  │              │  │              │             │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  Dados preenchidos automaticamente (pode editar):                   │   │
│  │                                                                     │   │
│  │  Idade              Renda mensal         Patrimônio                 │   │
│  │  ┌──────────────┐   ┌──────────────┐    ┌──────────────┐           │   │
│  │  │ 35-45 anos   │   │ R$ 15K-30K   │    │ R$ 200K-500K │           │   │
│  │  └──────────────┘   └──────────────┘    └──────────────┘           │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │              [Cancelar]    [    ✨ Criar com IA    ]               │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Wireframe - Resultado da IA (Modal Expandido)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ Persona Criada!                                [×] [✏️]         │   │
│  │                                                                     │   │
│  │  ┌──────┐  Fernanda                                                 │   │
│  │  │ 👤   │  Perfil: Moderado                                         │   │
│  │  │      │  ID: #P-2026-003                                          │   │
│  │  └──────┘                                                           │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  📊 CARACTERÍSTICAS DEMOGRÁFICAS                                    │   │
│  │  ┌─────────────────┬─────────────────┬─────────────────┐           │   │
│  │  │ 👤 Idade        │ 💰 Renda        │ 🏦 Patrimônio   │           │   │
│  │  │ 35-45 anos      │ R$ 15K-30K/mês  │ R$ 200K-500K    │           │   │
│  │  └─────────────────┴─────────────────┴─────────────────┘           │   │
│  │                                                                     │   │
│  │  🎯 OBJETIVOS FINANCEIROS                                           │   │
│  │  • Independência financeira                                         │   │
│  │  • Aposentadoria tranquila                                          │   │
│  │  • Diversificação inteligente                                       │   │
│  │                                                                     │   │
│  │  😰 MEDOS E OBJEÇÕES                                                │   │
│  │  • Perder dinheiro                                                  │   │
│  │  • Não saber investir corretamente                                  │   │
│  │  • Inflação diminuir poder de compra                                │   │
│  │                                                                     │   │
│  │  💡 INTERESSES                                                      │   │
│  │  • Fundos Imobiliários                                              │   │
│  │  • Ações de dividendos                                              │   │
│  │  • Tesouro Direto                                                   │   │
│  │                                                                     │   │
│  │  🗣️ TOM DE COMUNICAÇÃO IDEAL                                        │   │
│  │  "Equilibrado, educativo, exemplos práticos do dia a dia"           │   │
│  │                                                                     │   │
│  │  📱 CANAIS PREFERIDOS                                               │   │
│  │  Instagram: ████████████████████████████████████████  85%          │   │
│  │  YouTube:   ██████████████████████████████████      70%          │   │
│  │  LinkedIn:  ██████████████████████                  50%          │   │
│  │                                                                     │   │
│  │  🎯 GATILHOS DE CONVERSÃO                                           │   │
│  │  • Diversificação inteligente                                       │   │
│  │  • Cases de sucesso de pessoas parecidas                            │   │
│  │  • Educação financeira acessível                                    │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  [📋 Copiar Perfil]  [✨ Gerar Conteúdo]  [🎯 Usar em Campanha]     │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Componentes (Atomic Design)

#### Molecules
| Componente | Props | Descrição |
|------------|-------|-----------|
| `ProfileTypeCard` | `type: PersonaProfile`, `isSelected: boolean`, `onSelect: () => void` | Card selecionável de perfil |
| `DemographicsFields` | `values: Demographics`, `onChange: (field, value) => void` | Campos de dados demográficos |
| `PersonaDetailSection` | `title: string`, `icon: Icon`, `children: ReactNode` | Seção expansível de detalhes |

#### Organisms
| Componente | Props | Descrição |
|------------|-------|-----------|
| `PersonaForm` | `onSubmit: (data) => void`, `isLoading: boolean` | Form de criação com templates |
| `PersonaResultModal` | `persona: Persona`, `onClose: () => void` | Modal com perfil completo gerado |
| `PersonaCard` | `persona: Persona`, `onClick: () => void` | Card resumido (já existe) |

### 4.4 Templates de Perfil

```typescript
const PERSONA_TEMPLATES: Record<PersonaProfile, Partial<Persona>> = {
  conservador: {
    age_range: '45-60 anos',
    income_range: 'R$ 10K-30K/mês',
    patrimony_range: 'R$ 50K-200K',
    objectives: ['Preservar capital', 'Renda extra', 'Aposentadoria segura'],
    fears: ['Perder dinheiro', 'Inflação comer poupança', 'Falta de liquidez'],
    interests: ['Renda Fixa', 'CDB', 'Tesouro Direto', 'Fundos Conservadores'],
    communication_tone: 'Formal, seguro, baseado em dados históricos',
    preferred_channels: { Instagram: 70, YouTube: 60, Email: 40 },
    conversion_triggers: ['Garantias', 'Certificações', 'Cases conservadores'],
  },
  moderado: { /* ... */ },
  agressivo: { /* ... */ },
};
```

### 4.5 Fluxo de Criação

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PERSONA CREATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │  OPEN   │────▶│ ENTER NAME  │────▶│ SELECT TYPE │────▶│  REVIEW     │   │
│  │  MODAL  │     │             │     │             │     │  TEMPLATE   │   │
│  └─────────┘     └─────────────┘     └──────┬──────┘     │  DATA       │   │
│                                             │            └──────┬──────┘   │
│                                             │                    │         │
│                                             ▼                    ▼         │
│                                        ┌─────────┐          ┌─────────┐   │
│                                        │  AUTO   │          │ SUBMIT  │   │
│                                        │  FILL   │─────────▶│   TO AI │   │
│                                        │  FIELDS │          └────┬────┘   │
│                                        └─────────┘               │        │
│                                                                  ▼        │
│                                                             ┌─────────┐   │
│                                                             │ LOADING │   │
│                                                             │  STATE  │   │
│                                                             └────┬────┘   │
│                                                                  │        │
│                              ┌───────────────────────────────────┼───────┤
│                              │                                   ▼       │
│                              │                              ┌─────────┐  │
│                              │                              │ SUCCESS │  │
│                              │                              │  SHOW   │  │
│                              │                              │ RESULT  │  │
│                              │                              └────┬────┘  │
│                              │                                   │       │
│                              ▼                                   ▼       │
│                         ┌─────────┐                        ┌─────────┐   │
│                         │  ERROR  │                        │ ACTIONS │   │
│                         │  STATE  │                        │  PANEL  │   │
│                         │ + Retry │                        │         │   │
│                         └─────────┘                        └─────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.6 Props

```typescript
// components/personas/persona-form-modal.tsx
interface PersonaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PersonaFormData) => Promise<void>;
  isLoading?: boolean;
}

interface PersonaFormData {
  name: string;
  profile_type: PersonaProfile;
  age_range?: string;
  income_range?: string;
  patrimony_range?: string;
}

// components/personas/persona-detail-modal.tsx
interface PersonaDetailModalProps {
  persona: Persona | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateContent?: (personaId: string) => void;
  onUseInCampaign?: (personaId: string) => void;
}
```

---

## 5. Agente Gerar Post

**Rota:** `/agentes/gerar-post`  
**Tipo:** Página dedicada (wizard)  
**Agente N8N:** `agenteGerarPost()`  
**Payload:** `{ tema, tipoConteudo, formato, persona, perfilPersona, campanha?, referencias? }`

### 5.1 Wireframe - Página Completa (Wizard)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [AUTEM]              Gerar Post para Instagram         [👤 Profile] [⚙️]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  WIZARD STEPS                                                       │   │
│  │  [1 Tema]────[2 Formato]────[3 Persona]────[4 Revisão]             │   │
│  │   ●──────────○──────────────○──────────────○                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  STEP 1: TEMA DO POST                                                       │
│                                                                             │
│  Sobre qual tema você quer criar conteúdo? *                                │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ FII vs Tesouro Selic - qual escolher para renda mensal?          │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  Tipo de Conteúdo *                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ 📊 Técnico   │ │ ❤️ Emocional │ │ 🛡️ Objeção   │ │ ⭐ Autoridade│     │
│  │  [SELECTED]  │ │              │ │              │ │              │     │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘     │
│  ┌──────────────┐                                                          │
│  │ 👥 Social    │                                                          │
│  │              │                                                          │
│  └──────────────┘                                                          │
│                                                                             │
│  Referências (opcional)                                                     │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ Cole aqui links, textos ou contexto adicional...                 │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  Campanha Relacionada (opcional)                                            │
│  ┌──────────────────────────────┐                                          │
│  │ Lançamento FII Autem      ▼  │                                          │
│  └──────────────────────────────┘                                          │
│                                                                             │
│                                  [Continuar ▶]                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Wireframe - Step 2: Formato

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ...                                                                        │
│  STEP 2: FORMATO DO POST                                                    │
│                                                                             │
│  Qual formato você prefere? *                                               │
│                                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                  │
│  │                         │  │                         │                  │
│  │    ┌─────────────┐      │  │    ┌─────┐              │                  │
│  │    │ ┌───┬───┐   │      │  │    │     │              │                  │
│  │    │ │   │   │   │      │  │    │     │              │                  │
│  │    │ ├───┼───┤   │      │  │    │     │              │                  │
│  │    │ │   │   │   │      │  │    └─────┘              │                  │
│  │    │ └───┴───┘   │      │  │                         │                  │
│  │    │             │      │  │                         │                  │
│  │    └─────────────┘      │  │                         │                  │
│  │                         │  │                         │                  │
│  │      🎠 CARROSSEL       │  │       🃏 CARD           │                  │
│  │                         │  │       ÚNICO             │                  │
│  │   Múltiplos slides     │  │   Imagem + legenda      │                  │
│  │   para storytelling   │  │   direta                │                  │
│  │                         │  │                         │                  │
│  │      [SELECTED]        │  │                         │                  │
│  │                         │  │                         │                  │
│  └─────────────────────────┘  └─────────────────────────┘                  │
│                                                                             │
│         ┌─────────────────────────┐                                        │
│         │                         │                                        │
│         │    ▶️                   │                                        │
│         │    ┌─────┐              │                                        │
│         │    │     │              │                                        │
│         │    │  ▶  │              │                                        │
│         │    │     │              │                                        │
│         │    └─────┘              │                                        │
│         │                         │                                        │
│         │      📹 REELS           │                                        │
│         │                         │                                        │
│         │   Vídeo curto com       │                                        │
│         │   roteiro e legendas    │                                        │
│         │                         │                                        │
│         └─────────────────────────┘                                        │
│                                                                             │
│  [◀ Voltar]                                    [Continuar ▶]                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Wireframe - Step 3: Persona

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ...                                                                        │
│  STEP 3: PERSONA ALVO                                                       │
│                                                                             │
│  Para qual persona este conteúdo é direcionado? *                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  SELECIONAR PERSONA EXISTENTE                                       │   │
│  │                                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │    👤        │  │    👤        │  │    👤        │              │   │
│  │  │              │  │              │  │              │              │   │
│  │  │  Fernanda    │  │   Carlos     │  │   Amanda     │              │   │
│  │  │  Moderado    │  │ Conservador  │  │  Agressivo   │              │   │
│  │  │              │  │              │  │              │              │   │
│  │  │  [SELECTED]  │  │              │  │              │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  OU CRIAR NOVA PERSONA                                              │   │
│  │                                                                     │   │
│  │  [+ Criar nova persona]                                             │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [◀ Voltar]                                    [Continuar ▶]                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Wireframe - Step 4: Revisão e Resultado

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ...                                                                        │
│  STEP 4: REVISÃO E GERAÇÃO                                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  RESUMO DO PEDIDO                                                   │   │
│  │                                                                     │   │
│  │  📌 Tema:        FII vs Tesouro Selic - qual escolher...            │   │
│  │  📊 Tipo:        Técnico                                            │   │
│  │  🎠 Formato:     Carrossel                                          │   │
│  │  👤 Persona:     Fernanda (Moderado)                                │   │
│  │  🎯 Campanha:    Lançamento FII Autem                               │   │
│  │                                                                     │   │
│  │  [✏️ Editar configurações]                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [✨ Gerar Post com IA]                                                     │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  RESULTADO                                                          │   │
│  │                                                                     │   │
│  │  📋 COPY PRINCIPAL                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ FII vs Tesouro Selic: onde sua renda mensal rende mais? 🏠📈 │  │   │
│  │  │                                                               │  │   │
│  │  │ Se você busca renda passada, já se pegou dividido entre:     │  │   │
│  │  │ • Fundos Imobiliários (dividendos mensais)                   │  │   │
│  │  │ • Tesouro Selic (segurança + liquidez)                       │  │   │
│  │  │                                                               │  │   │
│  │  │ Vamos comparar na prática 👇                                  │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  📝 LEGENDA PARA INSTAGRAM                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ [Mesmo conteúdo com hashtags e CTA]                          │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  🎨 SUGESTÕES VISUAIS                                               │   │
│  │  • Slide 1: Título com ícones de prédio (FII) vs escudo (Selic)    │   │
│  │  • Slide 2: Comparativo lado a lado com números                   │   │
│  │  • Slide 3: Gráfico de rentabilidade 12 meses                     │   │
│  │  • Slide 4: CTA com botão "Link na bio"                           │   │
│  │                                                                     │   │
│  │  #️⃣ HASHTAGS SUGERIDAS                                              │   │
│  │  #fundosimobiliarios #tesouroselic #rendapassada #investimentos   │   │
│  │                                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  [📋 Copiar Tudo]  [📝 Copiar Legenda]  [🔄 Gerar Novamente]       │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Componentes (Atomic Design)

#### Molecules
| Componente | Props | Descrição |
|------------|-------|-----------|
| `ContentTypeSelector` | `value: ContentType`, `onChange: (type) => void` | Cards selecionáveis de tipo |
| `FormatSelector` | `value: FormatType`, `onChange: (format) => void` | Cards grandes com preview |
| `PersonaSelector` | `personas: Persona[]`, `selectedId?: string`, `onSelect: (id) => void` | Grid de personas |
| `PostResultCard` | `result: PostResult`, `onCopy: (field) => void`, `onRegenerate: () => void` | Card de resultado |

#### Organisms
| Componente | Props | Descrição |
|------------|-------|-----------|
| `PostWizard` | `steps: WizardStep[]`, `currentStep: number`, `onStepChange: (step) => void` | Container do wizard |
| `ThemeStep` | `data: ThemeData`, `onChange: (data) => void` | Step 1: Tema e tipo |
| `FormatStep` | `data: FormatData`, `onChange: (data) => void` | Step 2: Formato |
| `PersonaStep` | `personas: Persona[]`, `data: PersonaData`, `onChange: (data) => void` | Step 3: Persona |
| `ReviewStep` | `data: CompletePostRequest`, `result?: PostResult`, `onGenerate: () => void`, `isGenerating: boolean` | Step 4: Revisão e resultado |

### 5.6 Estados do Wizard

```typescript
interface GerarPostState {
  // Wizard
  currentStep: 1 | 2 | 3 | 4;
  
  // Step 1: Theme
  theme: string;
  contentType: ContentType | '';
  references: string;
  campaignId?: string;
  
  // Step 2: Format
  format: FormatType | '';
  
  // Step 3: Persona
  personaId: string;
  
  // Step 4: Result
  result: PostResult | null;
  isGenerating: boolean;
  error: Error | null;
}

interface PostResult {
  copy: string;
  caption: string;
  visualSuggestions: string[];
  hashtags: string[];
  cta: string;
  metadata: {
    theme: string;
    type: ContentType;
    format: FormatType;
    persona: string;
  };
}
```

### 5.7 Fluxo do Wizard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POST GENERATION WIZARD                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│   │  START  │───▶│ STEP 1  │───▶│ STEP 2  │───▶│ STEP 3  │───▶│ STEP 4  │  │
│   │         │    │  THEME  │    │ FORMAT  │    │ PERSONA │    │ REVIEW  │  │
│   └─────────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘  │
│                       │              │              │              │       │
│                       ▼              ▼              ▼              ▼       │
│                  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   │
│                  │VALIDATE │   │VALIDATE │   │VALIDATE │   │GENERATE │   │
│                  │  FORM   │   │  FORM   │   │  FORM   │   │   POST  │   │
│                  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   │
│                       │              │              │              │       │
│                  ERROR│              │              │              │SUCCESS │
│                       ▼              ▼              ▼              ▼       │
│                  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   │
│                  │  SHOW   │   │  SHOW   │   │  SHOW   │   │  SHOW   │   │
│                  │ ERRORS  │   │ ERRORS  │   │ ERRORS  │   │ RESULT  │   │
│                  └─────────┘   └─────────┘   └─────────┘   └─────────┘   │
│                                                                │          │
│                                                                ▼          │
│                                                           ┌─────────┐    │
│                                                           │ ACTIONS │    │
│                                                           │ Copy/   │    │
│                                                           │ Regen   │    │
│                                                           └─────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.8 Props da Página

```typescript
// app/(app)/agentes/gerar-post/page.tsx
interface GerarPostPageProps {
  // Página pode receber query params para pre-fill
  searchParams: {
    campaign?: string;
    persona?: string;
    theme?: string;
  };
}

// lib/n8n/client.ts
interface AgenteGerarPostPayload {
  tema: string;
  tipoConteudo: ContentType;
  formato: FormatType;
  persona: string;        // Nome da persona
  perfilPersona: PersonaProfile;
  campanha?: string;      // Nome da campanha (opcional)
  referencias?: string;   // Texto de referência (opcional)
}
```

---

## 6. Componentes Atômicos Compartilhados

### 6.1 Átomos

```typescript
// components/ui/agent-button.tsx
interface AgentButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

// components/ui/agent-card.tsx
interface AgentCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// components/ui/loading-state.tsx
interface LoadingStateProps {
  message?: string;
  submessage?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

// components/ui/empty-state.tsx (já existe - estender)
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

// components/ui/error-state.tsx
interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  onCancel?: () => void;
}
```

### 6.2 Moléculas Compartilhadas

```typescript
// components/shared/agent-header.tsx
interface AgentHeaderProps {
  name: string;
  description: string;
  icon: ReactNode;
  infoTooltip?: string;
}

// components/shared/form-section.tsx
interface FormSectionProps {
  title: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
}

// components/shared/ai-result-panel.tsx
interface AIResultPanelProps {
  result: string;
  onCopy?: () => void;
  onExport?: () => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

// components/shared/step-indicator.tsx
interface StepIndicatorProps {
  steps: { id: string; label: string }[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}
```

### 6.3 Organismos Compartilhados

```typescript
// components/shared/agent-layout.tsx
interface AgentLayoutProps {
  header: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
}

// components/shared/ai-response-drawer.tsx
interface AIResponseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
  actions?: ReactNode;
}
```

---

## 7. Fluxos de Navegação

### 7.1 Menu Lateral Atualizado

```
┌─────────────────────────────────────┐
│  [AUTEM LOGO]                       │
├─────────────────────────────────────┤
│  📊 Home                             │
│     ├── Métricas Instagram          │
│     └── Ideias de Conteúdo          │
├─────────────────────────────────────┤
│  🤖 Agentes ▼                        │
│     ├── Generalista     ◀ NOVO      │
│     ├── Gerar Post      ◀ NOVO      │
│     ├── Campanhas                   │
│     ├── Personas                    │
│     └── Análise de Concorrentes     │
├─────────────────────────────────────┤
│  🎯 Campanhas                        │
├─────────────────────────────────────┤
│  👥 Personas                         │
├─────────────────────────────────────┤
│  ⚙️ Configurações                   │
└─────────────────────────────────────┘
```

### 7.2 Mapa de Navegação

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NAVIGATION MAP                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DASHBOARD                                                                  │
│     │                                                                       │
│     ├──▶ /agentes/generalista ─────────┐                                   │
│     │      (Chat de ideias)            │                                   │
│     │                                  │                                   │
│     ├──▶ /agentes/gerar-post ──────────┤                                   │
│     │      (Wizard de posts)           │                                   │
│     │                                  ├──▶ Call N8N Webhook               │
│     ├──▶ /campanhas ───────────────────┤      (All agents)                 │
│     │      │                           │                                   │
│     │      └──▶ [Nova Campanha]        │                                   │
│     │             (Modal)              │                                   │
│     │                                  │                                   │
│     └──▶ /personas ────────────────────┘                                   │
│            │                                                                │
│            └──▶ [Nova Persona]                                              │
│                   (Modal)                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Integração com N8N

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         N8N INTEGRATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌───────────┐ │
│  │   USER      │────▶│   REACT     │────▶│   N8N       │────▶│   AI      │ │
│  │   ACTION    │     │   CLIENT    │     │   WEBHOOK   │     │   AGENT   │ │
│  └─────────────┘     └──────┬──────┘     └──────┬──────┘     └─────┬─────┘ │
│                             │                   │                   │       │
│                             │  1. POST /webhook │                   │       │
│                             │  2. JSON Payload  │                   │       │
│                             │  3. Timeout: 30s  │                   │       │
│                             │                   │                   │       │
│                             │◀──────────────────┘                   │       │
│                             │  Response: text/json                    │       │
│                             │                                         │       │
│                             ▼                                         │       │
│                      ┌─────────────┐                                  │       │
│                      │  UPDATE UI  │                                  │       │
│                      │  - Loading  │                                  │       │
│                      │  - Stream   │                                  │       │
│                      │  - Success  │                                  │       │
│                      │  - Error    │                                  │       │
│                      └─────────────┘                                  │       │
│                                                                       │       │
│  TIMEOUT HANDLING: 30s → AbortController → Error Toast                │       │
│  ERROR HANDLING: 5xx → Retry button, 4xx → Show details               │       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Checklist de Implementação

### 8.1 Componentes a Criar

#### Novos Átomos
- [ ] `TypingIndicator` - Animação de digitação
- [ ] `AgentCard` - Card de seleção de agente/perfil
- [ ] `StepIndicator` - Indicador de progresso em steps

#### Novas Moléculas
- [ ] `ChatMessage` - Mensagem de chat com avatar
- [ ] `QuickPromptChip` - Chip de sugestão rápida
- [ ] `FormSection` - Seção de formulário com label
- [ ] `AIResultPanel` - Painel de resultado da IA

#### Novos Organismos
- [ ] `ChatPanel` - Painel completo de chat
- [ ] `PostWizard` - Wizard de geração de post
- [ ] `CampaignResultDrawer` - Drawer de resultado de campanha
- [ ] `PersonaResultModal` - Modal de resultado de persona

### 8.2 Páginas a Criar

- [ ] `app/(app)/agentes/generalista/page.tsx`
- [ ] `app/(app)/agentes/gerar-post/page.tsx`

### 8.3 Modais a Atualizar/Criar

- [ ] `components/campanhas/campaign-form-modal.tsx` (já existe - validar)
- [ ] `components/campanhas/campaign-result-drawer.tsx` (novo)
- [ ] `components/personas/persona-form-modal.tsx` (já existe - validar)
- [ ] `components/personas/persona-result-modal.tsx` (novo)

### 8.4 Integrações N8N

- [ ] Validar `agenteGeneralista()` em `/agentes/generalista`
- [ ] Validar `agenteCampanhas()` em `/campanhas`
- [ ] Validar `agentePersonas()` em `/personas`
- [ ] Implementar `agenteGerarPost()` em `/agentes/gerar-post`

### 8.5 Estados de Loading

Todos os componentes devem implementar:

```typescript
// Pattern de loading consistente
const [isLoading, setIsLoading] = useState(false);

// No JSX:
{isLoading ? (
  <LoadingState message="Processando..." variant="spinner" />
) : (
  <ActualContent />
)}
```

### 8.6 Estados de Erro

```typescript
// Pattern de erro consistente
const [error, setError] = useState<Error | null>(null);

// No JSX:
{error && (
  <ErrorState
    title="Algo deu errado"
    description={error.message}
    onRetry={() => handleRetry()}
  />
)}
```

### 8.7 Estados Vazios

```typescript
// Pattern de empty state
<EmptyState
  icon={MessageSquare}
  title="Nenhuma mensagem ainda"
  description="Comece uma conversa com o agente"
  action={<Button>Começar</Button>}
/>
```

---

## 9. Anexos

### 9.1 Tipos TypeScript

```typescript
// types/agent.ts
export type AgentType = 'generalista' | 'campanhas' | 'personas' | 'gerar-post';

export interface AgentConfig {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  endpoint: string;
  timeout: number;
}

// types/chat.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// types/wizard.ts
export interface WizardStep {
  id: string;
  label: string;
  isValid: boolean;
  isComplete: boolean;
}
```

### 9.2 Constantes

```typescript
// lib/constants/agentes.ts
export const QUICK_PROMPTS_GENERALISTA = [
  { id: 'fii', label: 'Fundos Imobiliários', prompt: 'Quero ideias sobre Fundos Imobiliários para iniciantes', icon: Building },
  { id: 'rf-vs-fii', label: 'RF vs FII', prompt: 'Compare Renda Fixa vs Fundos Imobiliários', icon: Scale },
  { id: 'dicas', label: 'Dicas de Investimento', prompt: 'Dicas práticas para quem está começando a investir', icon: Lightbulb },
  { id: 'diversificacao', label: 'Diversificação', prompt: 'Como diversificar uma carteira de investimentos?', icon: PieChart },
];

export const AGENT_CONFIG: Record<AgentType, AgentConfig> = {
  generalista: {
    id: 'generalista',
    name: 'Assistente de Conteúdo',
    description: 'Brainstorming de ideias de investimentos',
    icon: 'MessageSquare',
    endpoint: '97ab2e1b-12f4-4a2d-b087-be15edfaf000',
    timeout: 30000,
  },
  // ... outros agentes
};
```

---

## 10. Notas de Implementação

### 10.1 Performance
- Usar `React.memo` para componentes de lista (ChatMessage, CampaignCard)
- Implementar virtualização se lista > 50 itens
- Usar `useCallback` para handlers de eventos
- Implementar debounce no input de chat (300ms)

### 10.2 Acessibilidade (WCAG AA)
- Todos os inputs precisam de `label` associado
- Botões precisam de `aria-label` quando sem texto
- Estados de loading precisam de `aria-live="polite"`
- Contraste mínimo 4.5:1 para textos
- Navegação por teclado funcional (Tab, Enter, Escape)

### 10.3 Responsividade
- Mobile: Stack vertical, modais em tela cheia
- Tablet: Sidebar colapsável, grid 2 colunas
- Desktop: Layout completo, grid 3 colunas

---

**— Uma, desenhando com empatia 💝**

*Documento gerado em 2026-03-03 para o projeto Synkra AIOS*
