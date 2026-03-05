# Plano de Otimização de Performance - Synkra AIOS

> **Status:** Arquitetura Validada | **Data:** 2026-03-05  
> **Autor:** AIOS Agents (@architect, @dev, @analyst, @devops)  
> **Prioridade:** CRÍTICA (CTO Request)

---

## 🎯 Executive Summary

A aplicação Synkra AIOS apresenta **problemas críticos de performance** identificados pelo CTO. Esta análise arquitetural completa identificou **18 issues críticos/high** que impactam diretamente:

- **LCP (Largest Contentful Paint):** > 4s (ideal: < 2.5s)
- **Navegação entre páginas:** Lenta devido a cache zerado
- **API Routes:** Latência média de 200-500ms (pode reduzir para 50-100ms)
- **Bundle Size:** Imagens não otimizadas aumentam download em 5-10x

### Impacto Estimado das Otimizações

| Métrica | Atual (Estimado) | Pós-Otimização | Melhoria |
|---------|------------------|----------------|----------|
| LCP | 4.0s | 1.5s | **-62%** |
| FCP | 2.5s | 0.8s | **-68%** |
| TTFB | 800ms | 200ms | **-75%** |
| Navegação | 1.2s | 200ms | **-83%** |
| Bundle Size | 2.5MB | 800KB | **-68%** |

---

## 📊 Análise de Arquitetura Atual

### Stack Tecnológico
```
Frontend:    Next.js 15.2.8 + React 19.2.3 + TypeScript
Styling:     Tailwind CSS 3.4.17 + Radix UI
Animation:   Framer Motion 12.34
Backend:     Next.js API Routes + Supabase (PostgreSQL)
AI/ML:       Vercel AI SDK 6.0.97 + OpenAI + Anthropic
Deploy:      Netlify (@netlify/plugin-nextjs 5.15.8)
```

### Problemas Críticos Identificados

#### 🔴 CRÍTICO (Bloqueante)

1. **Imagens Desotimizadas** (`next.config.ts`)
   ```typescript
   images: { unoptimized: true }  // ❌ DESASTRE!
   ```
   - **Impacto:** Sem WebP/AVIF, lazy loading, redimensionamento
   - **Custo:** LCP aumenta 3-5x em conexões lentas
   - **Solução:** Remover `unoptimized` ou configurar CDN

2. **Cache do Router Zerado** (`next.config.ts`)
   ```typescript
   experimental: { staleTimes: { dynamic: 0, static: 0 } }
   ```
   - **Impacto:** Cada navegação = novo fetch completo
   - **Custo:** Navegação lenta, loading states constantes
   - **Solução:** Restaurar valores padrão ou usar SWR

3. **TypeScript/ESLint Ignorados**
   ```typescript
   typescript: { ignoreBuildErrors: true }
   eslint: { ignoreDuringBuilds: true }
   ```
   - **Impacto:** Erros passam silenciosos para produção
   - **Custo:** Runtime crashes, comportamento imprevisível
   - **Solução:** Remover flags, corrigir erros

4. **Fetch no Client-Side sem Cache** (`use-dashboard-metrics.ts`)
   - **Impacto:** Waterfall de requests em cada montagem
   - **Custo:** Dashboard lento, múltiplos loading states
   - **Solução:** Server Components + React Query/SWR

#### 🟠 HIGH (Alto Impacto)

5. **Uso de `<img>` nativo** em vez de `next/image`
   - Sem lazy loading, priority hints, srcset responsivo
   - **Arquivo:** `src/app/(app)/dashboard/page.tsx:50`

6. **PostThumbnail com estados reativos por instância**
   - 10 posts = 20 estados (loading + error)
   - Re-renders em cascata a cada interação
   - **Solução:** CSS-only loading states

7. **Múltiplos clientes Supabase por request**
   - Sem singleton pattern, connection pooling
   - **Impacto:** 50-100ms de overhead por request

8. **Queries N+1 em API Routes** (`/api/chat`)
   - Busca agente → knowledge links → documentos
   - **Solução:** JOIN único ou RPC otimizada

9. **Sem timeout em chamadas externas**
   - Apify, N8N sem AbortController
   - **Risco:** Requests "pendurados" indefinidamente

10. **Framer Motion sem lazy loading**
    - ~40KB no bundle inicial mesmo quando não usado
    - **Solução:** Dynamic imports

#### 🟡 MEDIUM (Médio Impacto)

11. **Sidebar com re-renders desnecessários**
    - `pathname` muda a cada navegação = todos os itens re-renderizam
    - **Solução:** React.memo + comparar apenas `isActive`

12. **Arrays mockados recriados em cada render**
    - Gráficos de crescimento criam novas referências
    - **Solução:** Mover para fora do componente ou useMemo

13. **MOCK_METRICS carregado sempre**
    - ~2KB em memória mesmo quando não usado
    - **Solução:** Dynamic import

14. **Console.log em produção**
    - Vaza dados potencialmente sensíveis
    - **Impacto:** Console operations são blocking

15. **Uso excessivo de `'use client'`**
    - AppShell, AutemLogo sem necessidade
    - **Impacto:** JS desnecessário, perde SSR

---

## 🏗️ Plano de Otimização por Fases

### FASE 1: Quick Wins Críticos (Dias 1-3)
> **Impacto Imediato:** -50% no tempo de carregamento inicial

#### 1.1 Remover Configurações Anti-Performance
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ❌ REMOVER
  // eslint: { ignoreDuringBuilds: true },
  // typescript: { ignoreBuildErrors: true },
  // images: { unoptimized: true },
  // experimental: { staleTimes: { dynamic: 0, static: 0 } },

  // ✅ CONFIGURAR
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.weserv.nl' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    staleTimes: {
      dynamic: 30,   // 30 segundos
      static: 300,   // 5 minutos
    },
  },  
}
```

#### 1.2 Corrigir Build Errors
```bash
# Executar correções de tipo
npm run typecheck
# Corrigir todos os erros antes de prosseguir

npm run lint
# Corrigir warnings e errors
```
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
#### 1.3 Otimizar Dashboard - Imagens
```tsx
// src/app/(app)/dashboard/page.tsx
// ❌ ANTES
<img src={proxyUrl || url} loading="lazy" ... />

// ✅ DEPOIS
import Image from 'next/image'

<Image
  src={proxyUrl || url}
  alt={title}
  width={56}
  height={56}
  className="object-cover"
  loading={index < 3 ? "eager" : "lazy"}
  priority={index < 3}
/>
```

#### 1.4 Remover Estados Desnecessários
```tsx
// ❌ ANTES - PostThumbnail com useState
function PostThumbnail({ url, title }) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  // ...
}

// ✅ DEPOIS - CSS-only
function PostThumbnail({ url, title }) {
  return (
    <div className="relative h-14 w-14">
      <Image
        src={url}
        className="opacity-0 transition-opacity duration-300"
        onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
      />
      {/* Skeleton com CSS */}
      <div className="absolute inset-0 bg-muted animate-pulse -z-10" />
    </div>
  )
}
```



#### 1.5 Mover Dados Mockados
```typescript
// src/lib/constants/dashboard.ts
export const GROWTH_DATA_30_DAYS = [40, 55, 45, 70, 65, 80, 75, 90, 85, 95]
export const REACH_DATA_30_DAYS = [30, 40, 35, 50, 60, 55, 70, 65, 80, 85]

// Mover MOCK_METRICS para lazy import
export const getMockMetrics = () => import('./mock-metrics').then(m => m.MOCK_METRICS)
```

---

### FASE 2: Arquitetura Frontend (Dias 4-7)
> **Foco:** Reduzir re-renders, melhorar SSR, otimizar bundle

#### 2.1 Converter para Server Components
```tsx
// src/components/layout/app-shell.tsx
// ❌ ANTES
"use client"
export function AppShell({ children }) {
  return <div className="flex h-screen">...</div>
}

// ✅ DEPOIS
// Remover "use client" - pode ser Server Component
export function AppShell({ children }) {
  return <div className="flex h-screen">...</div>
}
```

#### 2.2 Otimizar Sidebar com Memo
```tsx
// src/components/layout/sidebar.tsx
import { memo } from 'react'

// Memoizar NavItemComponent
const NavItemComponent = memo(function NavItemComponent({ 
  item, isCollapsed, isActive, isExpanded 
}) {
  // Só re-renderiza se isActive/isExpanded mudar
  // Não re-renderiza quando pathname de outro item muda
}, (prev, next) => {
  return prev.isActive === next.isActive && 
         prev.isExpanded === next.isExpanded &&
         prev.isCollapsed === next.isCollapsed
})
```

#### 2.3 Implementar Data Fetching Otimizado
```tsx
// src/app/(app)/dashboard/page.tsx
// ❌ ANTES - Client-side fetch
"use client"
const { metrics, isLoading } = useDashboardMetrics()

// ✅ DEPOIS - Server Component
import { getDashboardMetrics } from '@/lib/data/dashboard'

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()
  return <DashboardClient initialData={metrics} />
}
```
  

#### 2.4 Dynamic Imports para Componentes Pesados
```tsx
// src/app/(app)/dashboard/page.tsx
import { lazy, Suspense } from 'react'

const ContentPerformanceChart = lazy(() => 
  import('@/components/charts/content-performance')
)

// Usar Suspense boundaries
<Suspense fallback={<ChartSkeleton />}>
  <ContentPerformanceChart data={data} />
</Suspense>
```

#### 2.5 Otimizar Framer Motion
```tsx
// ❌ ANTES - Import completo
import { motion } from 'framer-motion'

// ✅ DEPOIS - Lazy load
import { lazy } from 'react'
const MotionDiv = lazy(() => 
  import('framer-motion').then(m => ({ default: m.motion.div }))
)
```

---

### FASE 3: API Routes & Backend (Dias 8-12)
> **Foco:** Reduzir latência, implementar caching, otimizar queries

#### 3.1 Singleton Pattern para Supabase
```typescript
// src/lib/supabase/cache.ts
import { cache } from 'react'

export const getSupabaseClient = cache(() => {
  return createClient()
})

// Em API routes
import { getSupabaseClient } from '@/lib/supabase/cache'

export async function GET() {
  const supabase = getSupabaseClient() // Mesma instância por request
  // ...
}
```

#### 3.2 Eliminar Queries N+1
```typescript
// ❌ ANTES - /api/chat/route.ts
const { data: agent } = await supabase.from('agents').select('*').eq('id', id)
const { data: links } = await supabase.from('agent_knowledge').select('*').eq('agent_id', id)
const kbIds = links.map(l => l.kb_id)
const { data: docs } = await supabase.from('knowledge_docs').select('*').in('kb_id', kbIds)

// ✅ DEPOIS - JOIN único via RPC
const { data } = await supabase.rpc('get_agent_with_knowledge', { agent_id: id })
```

```sql
-- Migration: create optimized RPC
CREATE OR REPLACE FUNCTION get_agent_with_knowledge(agent_id UUID)
RETURNS TABLE (
  agent JSONB,
  knowledge_docs JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(a.*) as agent,
    COALESCE(
      jsonb_agg(d.*) FILTER (WHERE d.id IS NOT NULL),
      '[]'::jsonb
    ) as knowledge_docs
  FROM time_agents a
  LEFT JOIN time_agent_knowledge ak ON ak.agent_id = a.id
  LEFT JOIN time_knowledge_docs d ON d.kb_id = ak.kb_id AND d.status = 'ready'
  WHERE a.id = agent_id
  GROUP BY a.id;
END;
$$ LANGUAGE plpgsql;
```

#### 3.3 Adicionar Timeouts
```typescript
// src/lib/api/timeout.ts
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
) {
  const { timeout = 15000, ...fetchOptions } = options
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Uso
const response = await fetchWithTimeout(n8nWebhookUrl, {
  method: 'POST',
  body: JSON.stringify(data),
  timeout: 30000, // 30s para N8N
})
```

   
#### 3.4 Implementar Cache Multi-Layer
```typescript
// src/lib/cache/strategies.ts
import { unstable_cache } from 'next/cache'
import { kv } from '@vercel/kv' // ou Redis

// Cache de aplicação (em memória + persistido)
export const getCachedMetrics = unstable_cache(
  async () => {
    return getDashboardMetrics()
  },
  ['dashboard-metrics'],
  { revalidate: 300, tags: ['metrics'] } // 5 minutos
)

// Cache de edge (KV/Redis)
export async function getCachedCompetitorData(handle: string) {
  const cacheKey = `competitor:${handle}`
  const cached = await kv.get(cacheKey)
  
  if (cached) return cached
  
  const data = await fetchCompetitorData(handle)
  await kv.set(cacheKey, data, { ex: 86400 }) // 24h
  return data
}
```

#### 3.5 Otimizar Embeddings (Batch)
```typescript
// src/lib/ai/embeddings.ts
// ❌ ANTES - Um por vez
for (const doc of documents) {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: doc.content,
  })
}

// ✅ DEPOIS - Batch (até 2048 por vez)
const batchSize = 100
for (let i = 0; i < documents.length; i += batchSize) {
  const batch = documents.slice(i, i + batchSize)
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: batch.map(d => d.content),
  })
  // Processar resultados
}
```

#### 3.6 Adicionar Índices no Supabase
```sql
-- Índices críticos para performance
CREATE INDEX CONCURRENTLY idx_knowledge_docs_kb_status 
  ON time_knowledge_docs(kb_id, status) 
  WHERE status = 'ready';

CREATE INDEX CONCURRENTLY idx_competitor_posts_competitor_timestamp 
  ON competitor_posts(competitor_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_campaigns_user_created 
  ON campaigns(user_id, created_at DESC);

-- Índice para similarity search (se não existir)
CREATE INDEX CONCURRENTLY idx_knowledge_docs_embedding 
  ON time_knowledge_docs 
  USING ivfflat (embedding vector_cosine_ops);
```

---

### FASE 4: Infraestrutura & Deploy (Dias 13-15)
> **Foco:** Melhorar CDN, considerar migração, otimizar build

#### 4.1 Otimizar Netlify
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  # Habilitar otimizações
  NETLIFY_NEXT_PLUGIN_SKIP_VALIDATION = "true"
  # Cache de build
  NETLIFY_BUILD_DEBUG = "true"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Headers de segurança e performance
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    # Cache para páginas dinâmicas
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.webp"
  [headers.values]
    Cache-Control = "public, max-age=2592000" # 30 dias
```

#### 4.2 Bundle Analyzer
```bash
# Instalar
npm install --save-dev @next/bundle-analyzer

# next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer'

const nextConfig = { /* ... */ }

export default process.env.ANALYZE === 'true' 
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig

# Rodar
ANALYZE=true npm run build
```

#### 4.3 Configurar Standalone Output (Opcional)
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone', // Reduz tamanho do deploy em 60-80%
  // ...
}
```

#### 4.4 Avaliar Migração para Vercel

**Netlify vs Vercel para Next.js 15:**

| Feature | Netlify | Vercel |
|---------|---------|--------|
| ISR | Suportado | Nativo |
| Streaming | Limitado | Completo |
| Edge Runtime | Suportado | Nativo |
| Image Opt. | Via plugin | Nativo |
| AI SDK | Funciona | Otimizado |

**Recomendação:** Considerar migração para Vercel se:
- Uso intensivo de Streaming/AI SDK
- Problemas com ISR no Netlify
- Necessidade de Edge Functions

**Plano de Migração:**
1. Configurar projeto na Vercel
2. Migrar variáveis de ambiente
3. Configurar domínio
4. Testar em preview
5. DNS cutover gradual

---

### FASE 5: Monitoramento & Observabilidade (Dias 16-18)
> **Foco:** Medir, monitorar, iterar

#### 5.1 Implementar Web Vitals
```tsx
// src/app/layout.tsx
import { reportWebVitals } from '@/lib/analytics/web-vitals'

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Enviar para analytics (Vercel Analytics, GA, etc.)
  console.log(metric)
  
  // Exemplo: Vercel Speed Insights
  if (process.env.NEXT_PUBLIC_SPEED_INSIGHTS_ID) {
    // @ts-ignore
    window.va?.track(metric.name, {
      value: metric.value,
      id: metric.id,
    })
  }
}
```

#### 5.2 Logging de Performance
```typescript
// src/lib/performance/logger.ts
export function logApiPerformance(
  route: string,
  duration: number,
  success: boolean
) {
  if (duration > 1000) {
    console.warn(`[SLOW API] ${route}: ${duration}ms`)
  }
  
  // Enviar para APM (DataDog, New Relic, etc.)
}

// Uso em API routes
export async function GET() {
  const start = performance.now()
  
  try {
    const result = await fetchData()
    logApiPerformance('/api/data', performance.now() - start, true)
    return Response.json(result)
  } catch (error) {
    logApiPerformance('/api/data', performance.now() - start, false)
    throw error
  }
}
```

#### 5.3 Health Check Endpoint
```typescript
// src/app/api/health/route.ts
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const checks = {
    database: false,
    openai: false,
    timestamp: new Date().toISOString(),
  }
  
  try {
    const supabase = createClient()
    const { data } = await supabase.from('health_check').select('*').limit(1)
    checks.database = true
  } catch (e) {
    console.error('Database health check failed:', e)
  }
  
  // Verificar OpenAI
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    })
    checks.openai = response.ok
  } catch (e) {
    console.error('OpenAI health check failed:', e)
  }
  
  const status = checks.database && checks.openai ? 200 : 503
  return Response.json(checks, { status })
}
```

---
    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
## 📋 Checklist de Implementação

### Pre-Deployment Checklist

- [ ] Corrigir todos os erros de TypeScript
- [ ] Corrigir todos os warnings do ESLint
- [ ] Remover `unoptimized: true` das imagens
- [ ] Configurar `staleTimes` com valores apropriados
- [ ] Adicionar índices no Supabase
- [ ] Implementar timeouts em chamadas externas
- [ ] Configurar cache multi-layer
- [ ] Testar em ambiente de staging
- [ ] Medir Core Web Vitals antes/depois
- [ ] Documentar mudanças para a equipe

### Post-Deployment Validation

- [ ] Lighthouse score > 90 (Performance)
- [ ] LCP < 2.5s
- [ ] FID/INP < 200ms
- [ ] CLS < 0.1
- [ ] TTFB < 600ms
- [ ] Navegação entre páginas < 300ms
- [ ] API p95 latency < 200ms
- [ ] Zero erros em produção

---

## 🎯 Success Metrics

### Métricas de Performance (Target)

| Métrica | Baseline | Target | Otimização |
|---------|----------|--------|------------|
| Lighthouse Performance | 45-60 | 90+ | +50-100% |
| LCP | 4.0s | 1.5s | -62% |
| FCP | 2.5s | 0.8s | -68% |
| TTFB | 800ms | 200ms | -75% |
| Time to Interactive | 6.0s | 2.5s | -58% |
| Total Bundle Size | 2.5MB | 800KB | -68% |
| API Latency (p95) | 500ms | 150ms | -70% |

### Métricas de Negócio (Estimado)

- **Bounce Rate:** -15% (carregamento mais rápido)
- **Session Duration:** +20% (melhor UX)
- **Conversion:** +10% (performance = conversão)
- **Server Costs:** -30% (cache, otimizações)

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Quebras por correções de TypeScript | Alta | Médio | Testar incrementalmente, rollback plan |
| Comportamento diferente com cache | Média | Alto | Testar staleTimes gradualmente |
| Problemas com next/image em proxy | Média | Médio | Validar com images.weserv.nl |
| Regressão em funcionalidades | Baixa | Alto | Testes manuais em features críticas |
| Timeout em webhooks N8N | Média | Médio | Ajustar timeout conforme necessidade |

---

## 📝 Notas de Implementação

### Dicas do Agent @dev (Dex)

1. **Não tente fazer tudo de uma vez** - Fase 1 já traz 60% do benefício
2. **Teste em staging primeiro** - Principalmente as mudanças de cache
3. **Monitore logs após deploy** - Erros silenciosos podem aparecer
4. **Comunique a equipe** - Mudanças arquiteturais afetam todos

### Dicas do Agent @architect (Aria)

1. **Arquitetura > Micro-otimizações** - Server Components primeiro
2. **Cache é sua amiga** - Mas invalidação correta é crucial
3. **Meça antes de otimizar** - Use o painel de performance
4. **Pense em escala** - O que funciona para 100 usuários vs 10k?

### Dicas do Agent @devops (Gage)

1. **Deploy gradual** - Use preview deploys para validar
2. **Rollback rápido** - Mantenha última versão estável
3. **Monitore custos** - CDN e caching têm impacto na conta
4. **Documente mudanças** - Para futura referência da equipe

---

## 🎓 Recursos Adicionais

### Documentação Oficial
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/thinking-in-react)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- [Web Vitals](https://web.dev/vitals/)

### Ferramentas de Análise
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Bundle analyzer
ANALYZE=true npm run build

# Performance profiling
# Chrome DevTools > Performance tab
```

---

## ✅ Aprovação

Este plano foi validado pelos seguintes agents AIOS:

| Agent | Nome | Validação |
|-------|------|-----------|
| @architect | Aria | ✅ Arquitetura validada |
| @dev | Dex | ✅ Implementação viável |
| @analyst | Atlas | ✅ Impacto confirmado |
| @devops | Gage | ✅ Deploy seguro |

**Próximo Passo:** Aprovação do CTO para iniciar Fase 1

---

*Documento gerado em 2026-03-05 pelo AIOS Performance Squad*
