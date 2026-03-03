# Dashboard Autem - Wireframe de Refatoração

## Estrutura do Menu Lateral

```
┌─────────────────────────────────────┐
│  [AUTEM LOGO]                       │
├─────────────────────────────────────┤
│  📊 Home                             │
│     ├── Métricas Instagram          │
│     └── Ideias de Conteúdo          │
├─────────────────────────────────────┤
│  🤖 Agentes (expandível)            │
│     ├── Conteúdo Generalista ▼      │
│     │   └── Histórico de Posts      │
│     ├── Campanhas ▼                 │
│     │   └── Histórico de Campanhas  │
│     ├── Ideias de Conteúdo          │
│     ├── Ajustes dos Agentes         │
│     └── Análise de Concorrentes     │
│         ├── XP Investimentos        │
│         ├── Raul Sena               │
│         ├── Primo Rico              │
│         └── Gêmeos das Finanças     │
├─────────────────────────────────────┤
│  👥 Personas                         │
├─────────────────────────────────────┤
│  ⚙️ Configurações                   │
└─────────────────────────────────────┘
```

## Dashboard Home - Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [AUTEM]                    Planejador de Conteúdo    [👤 Profile] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║  💡 IDEIAS DE CONTEÚDO - CHAT INTERATIVO                      ║  │
│  ║                                                                 ║  │
│  ║  "Qual tema você quer explorar hoje?"                          ║  │
│  ║  [Campo de input com sugestões rápidas]                        ║  │
│  ║  [RF] [Fundos Imobiliários] [Ações] [Diversificação]          ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 📈 Alcance  │ │ 👥 Seguidores│ │ 💬 Engajamento│ │ 🔄 Taxa    │   │
│  │ 45.2K       │ │ 12.8K       │ │ 3.2%        │ │ 1.8%       │   │
│  │ ↑ 12%       │ │ ↑ 8%        │ │ ↑ 15%       │ │ ↑ 5%       │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                     │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐   │
│  │ 📊 MÉTRICAS INSTAGRAM   │    │ 📈 EVOLUÇÃO 7 DIAS           │   │
│  │                         │    │                              │   │
│  │  Perfil: @autem.inv     │    │  [Gráfico de linha]          │   │
│  │  Última atual: 2h atrás │    │  • Seguidores               │   │
│  │                         │    │  • Alcance                  │   │
│  │  Top posts:             │    │  • Engajamento              │   │
│  │  🥇 RF vs FII (4.2K)   │    │                              │   │
│  │  🥈 CDB vs Tesouro     │    │                              │   │
│  │  🥉 Diversificação     │    │                              │   │
│  │                         │    │                              │   │
│  │  [↻ Atualizar Apify]   │    │                              │   │
│  └─────────────────────────┘    └──────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🎯 CAMPANHAS ATIVAS                                         │   │
│  │                                                              │   │
│  │  [Card] [Card] [Card] [Ver todas →]                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Tela Campanhas - Nova Estrutura

```
┌─────────────────────────────────────────────────────────────────────┐
│  Campanhas                                [+ Nova Campanha]         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FILTROS: [Todas ▼] [Objetivo ▼] [Status ▼]                        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🚀 CAMPANHA: Lançamento FII Autem                           │   │
│  │ ─────────────────────────────────────────────────────────────│   │
│  │ Objetivo: Conversão    │ Formato: Lançamento                │   │
│  │ Status: 🟢 Ativa       │ Período: 01/03 - 15/03            │   │
│  │ ─────────────────────────────────────────────────────────────│   │
│  │ Tipos de Conteúdo:                                          │   │
│  │  [Técnico] [Conexão Emocional] [Quebra Objeção]             │   │
│  │ ─────────────────────────────────────────────────────────────│   │
│  │ Formatos:                                                   │   │
│  │  [Carrossel] [Card Único] [Reels]                           │   │
│  │ ─────────────────────────────────────────────────────────────│   │
│  │ [Ver detalhes]  [Gerar conteúdo]  [Ver histórico ▼]         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  MODAL: Nova Campanha                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Nome da Campanha *                                         │   │
│  │  [________________________________________________]         │   │
│  │                                                             │   │
│  │  Objetivo *                Formato *                        │   │
│  │  [Conversão ▼]            [Lançamento ▼]                    │   │
│  │   • Conversão               • Lançamento                    │   │
│  │   • Atração                 • Perpétuo                      │   │
│  │   • Nutrição                • Campanha Interna              │   │
│  │                                                             │   │
│  │  Tipos de Conteúdo (múltiplo)                               │   │
│  │  [x] Técnico  [x] Conexão Emocional  [ ] Quebra Objeção    │   │
│  │  [ ] Reforço Autoridade  [ ] Prova Social                  │   │
│  │                                                             │   │
│  │  Formatos (múltiplo)                                        │   │
│  │  [x] Carrossel  [x] Card Único  [x] Roteiro Reels          │   │
│  │                                                             │   │
│  │  Período da Campanha                                        │   │
│  │  [Data Início ▼] até [Data Fim ▼]                          │   │
│  │                                                             │   │
│  │              [Cancelar]  [Criar Campanha]                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Tela Personas

```
┌─────────────────────────────────────────────────────────────────────┐
│  Personas de Investidores               [+ Nova Persona]           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       │
│  │ 👤 Investidor   │ │ 👤 Investidor   │ │ 👤 Investidor   │       │
│  │    Conservador  │ │    Moderado     │ │    Agressivo    │       │
│  │                 │ │                 │ │                 │       │
│  │  📊 Perfil:     │ │  📊 Perfil:     │ │  📊 Perfil:     │       │
│  │  Segurança      │ │  Balanceado     │ │  Crescimento    │       │
│  │                 │ │                 │ │                 │       │
│  │  💰 Patrimônio: │ │  💰 Patrimônio: │ │  💰 Patrimônio: │       │
│  │  R$ 50K-200K    │ │  R$ 200K-1M     │ │  R$ 1M+         │       │
│  │                 │ │                 │ │                 │       │
│  │  🎯 Interesses: │ │  🎯 Interesses: │ │  🎯 Interesses: │       │
│  │  RF, CDB, TD    │ │  Multimercado   │ │  Ações, Crypto  │       │
│  │                 │ │  FII            │ │  Venture        │       │
│  │                 │ │                 │ │                 │       │
│  │  [✏️] [🗑️]     │ │  [✏️] [🗑️]     │ │  [✏️] [🗑️]     │       │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘       │
│                                                                     │
│  DETALHE DA PERSONA (modal/expandido)                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  👤 Nome: Investidor Conservador                             │   │
│  │                                                             │   │
│  │  📋 CARACTERÍSTICAS                                         │   │
│  │  • Idade: 45-60 anos                                        │   │
│  │  • Renda: R$ 10K-30K/mês                                    │   │
│  │  • Objetivo: Preservar capital                              │   │
│  │  • Medo: Perder dinheiro                                    │   │
│  │                                                             │   │
│  │  💬 TOM DE COMUNICAÇÃO IDEAL                                │   │
│  │  • Formal e seguro                                          │   │
│  │  • Foco em dados históricos                                 │   │
│  │  • Evitar linguagem agressiva                               │   │
│  │                                                             │   │
│  │  📱 CANAIS PREFERIDOS                                       │   │
│  │  • Instagram: 70%                                           │   │
│  │  • YouTube: 60%                                             │   │
│  │  • Email: 40%                                               │   │
│  │                                                             │   │
│  │  🎯 GATILHOS DE CONVERSÃO                                   │   │
│  │  • Garantias e certificações                                │   │
│  │  • Cases de sucesso conservadores                           │   │
│  │  • Tempo no mercado                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Tela Análise de Concorrentes

```
┌─────────────────────────────────────────────────────────────────────┐
│  Análise de Concorrentes               [↻ Atualizar Dados]         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SELETOR DE CONCORRENTE:                                           │
│  [XP Investimentos] [Raul Sena] [Primo Rico] [Gêmeos das Finanças] │
│                                                                     │
│  ═════════════════════════════════════════════════════════════════ │
│                                                                     │
│  📊 XP INVESTIMENTOS (@xpinvestimentos)                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  SEGUIDORES: 2.3M    ENGAJAMENTO: 2.1%    POSTS/MÊS: 45     │   │
│  │                                                             │   │
│  │  📈 CRESCIMENTO (90 dias)                                   │   │
│  │  [Gráfico de linha mostrando evolução]                      │   │
│  │  • Seguidores: +45K (+2%)                                   │   │
│  │  • Alcance médio: 890K                                      │   │
│  │  • Taxa de engajamento: estável                             │   │
│  │                                                             │   │
│  │  🏆 TOP PERFORMING POSTS                                    │   │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│   │
│  │  │ [Thumbnail]     │ │ [Thumbnail]     │ │ [Thumbnail]     ││   │
│  │  │ Alcance: 1.2M   │ │ Alcance: 980K   │ │ Alcance: 850K   ││   │
│  │  │ Tema: Cripto    │ │ Tema: RF vs FII │ │ Tema: Diversifi.││   │
│  │  │ [Ver análise]   │ │ [Ver análise]   │ │ [Ver análise]   ││   │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘│   │
│  │                                                             │   │
│  │  📊 ANÁLISE DE CONTEÚDO                                     │   │
│  │  ┌──────────────┬──────────────┬──────────────┐             │   │
│  │  │ Carrossel    │ Reels        │ Cards        │             │   │
│  │  │ 60%          │ 30%          │ 10%          │             │   │
│  │  │ Avg: 450K    │ Avg: 890K    │ Avg: 120K    │             │   │
│  │  └──────────────┴──────────────┴──────────────┘             │   │
│  │                                                             │   │
│  │  💡 INSIGHTS DA IA                                          │   │
│  │  • Reels sobre "dúvidas comuns" têm 3x mais compartilhamentos│   │
│  │  • Conteúdo técnico performa melhor às terças e quintas     │   │
│  │  • Hashtags #rendafixa e #fundosimobiliários dominam        │   │
│  │                                                             │   │
│  │  🎯 RECOMENDAÇÕES PARA AUTEM                                 │   │
│  │  • Criar série "Desmistificando" seguindo formato dos Reels │   │
│  │  • Testar horário 19h-21h (melhor engajamento XP)           │   │
│  │  • Focar em comparações práticas (RF vs FII vs CDB)         │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Componentes Atômicos Necessários

### Átomos:
- `MetricCard` - Card de métrica com valor, label e variação
- `StatusBadge` - Badge de status (ativo, pausado, etc)
- `ProgressBar` - Barra de progresso visual
- `Avatar` - Avatar de persona/concorrente

### Moléculas:
- `CampaignCard` - Card de campanha com todos os detalhes
- `PersonaCard` - Card de persona resumido
- `CompetitorSelector` - Tabs de seleção de concorrente
- `InstagramMetricsPanel` - Painel de métricas do Instagram
- `ContentTypeTag` - Tag de tipo de conteúdo (técnico, emocional, etc)
- `FormatTag` - Tag de formato (carrossel, reels, etc)

### Organismos:
- `Sidebar` - Menu lateral reestruturado com dropdowns
- `CampaignForm` - Form completo de criação de campanha
- `PersonaDetail` - Detalhe expandido de persona
- `CompetitorAnalysis` - Análise completa de concorrente
- `InstagramDashboard` - Dashboard de métricas Instagram
- `ContentChat` - Chat interativo de ideias

## Fluxos de Navegação

```
Home
 ├── Campanhas
 │    ├── Lista de Campanhas
 │    ├── Nova Campanha (modal)
 │    └── Histórico de Campanha (dropdown)
 ├── Personas
 │    ├── Lista de Personas
 │    ├── Nova Persona (modal)
 │    └── Detalhe da Persona (drawer/modal)
 └── Análise de Concorrentes
      ├── Seletor de Concorrente
      ├── Overview de Métricas
      ├── Top Posts
      └── Recomendações da IA
```
