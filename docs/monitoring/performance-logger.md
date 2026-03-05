# FASE 5.2: Performance Logger

## Resumo

Sistema completo de logging de performance para APIs com alertas automáticos e integração com APMs.

## Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/performance/logger.ts` | Core do performance logger |
| `src/lib/performance/index.ts` | Exportações públicas |

## Thresholds de Alerta

| Nível | Threshold | Log |
|-------|-----------|-----|
| OK | ≤1000ms | `[API OK]` |
| SLOW | >1000ms | `[API SLOW]` ⚠️ |
| VERY SLOW | >3000ms | `[API VERY SLOW]` 🔶 |
| CRITICAL | >5000ms | `[API CRITICAL]` 🚨 |
| ERROR | Falha | `[API ERROR]` ❌ |

## Uso Básico

### 1. Logging Manual

```typescript
import { logApiPerformance } from '@/lib/performance'

export async function GET(request: Request) {
  const start = performance.now()
  
  try {
    const data = await fetchData()
    logApiPerformance('/api/data', performance.now() - start, true)
    return Response.json(data)
  } catch (error) {
    logApiPerformance('/api/data', performance.now() - start, false)
    throw error
  }
}
```

### 2. Middleware Automático

```typescript
import { withPerformanceLogging } from '@/lib/performance'

async function handler(req: Request) {
  return Response.json({ data: 'hello' })
}

export const GET = withPerformanceLogging(handler, '/api/hello')
```

### 3. Decorator de Função

```typescript
import { measurePerformance } from '@/lib/performance'

const heavyOperation = measurePerformance(
  async () => {
    // Operação pesada
    return result
  },
  'heavyOperation'
)

// Uso
const result = await heavyOperation()
```

## Métricas Agregadas

```typescript
import { getPerformanceMetrics } from '@/lib/performance'

const metrics = getPerformanceMetrics()
// {
//   totalRequests: 1000,
//   slowRequests: 50,
//   errorRequests: 5,
//   avgDuration: 450,
//   p95Duration: 1200,
//   p99Duration: 2500
// }
```

## Estatísticas do Sistema

```typescript
import { getSystemStats } from '@/lib/performance'

const stats = getSystemStats()
// {
//   performance: { ... },
//   cache: { memorySize: 42 },
//   uptime: 3600,
//   memory: { heapUsed: 123456, ... }
// }
```

## Integração com APM

### Configuração

```env
# .env.local
NEXT_PUBLIC_APM_ENABLED=true
NEXT_PUBLIC_APM_ENDPOINT=https://api.datadog.com/v1/metrics
APM_API_KEY=seu-api-key
```

### Formatos Suportados

- Datadog
- New Relic
- Dynatrace
- Endpoint customizado

## Exemplos de Saída

### Console (Desenvolvimento)
```bash
[API OK] GET /api/agents: 45ms
[API OK] POST /api/chat: 120ms
[API SLOW] GET /api/concorrentes/metrics: 1250ms
[API ERROR] POST /api/agentes/conteudo: 500ms { status: 500, error: 'Timeout' }
```

### Console (Produção)
```bash
[API CRITICAL] POST /api/chat: 5200ms ⚠️
[API VERY SLOW] GET /api/dashboard: 3200ms
```

## Dashboard de Performance

Use `getPerformanceMetrics()` para criar um dashboard:

```typescript
// app/api/admin/performance/route.ts
import { getPerformanceMetrics, getSystemStats } from '@/lib/performance'

export async function GET() {
  const metrics = getPerformanceMetrics()
  const system = getSystemStats()
  
  return Response.json({
    metrics,
    system,
    alerts: generateAlerts(metrics)
  })
}
```

## Troubleshooting

### Métricas não aparecem
- Verificar se `performance.now()` está disponível
- Checar se `Date.now()` funciona no ambiente

### Memory leak
- O store limita a 1000 requisições
- Auto-cleanup a cada hora
- Cleanup manual: `cleanupOldMetrics()`

### APM não recebe dados
- Verificar `NEXT_PUBLIC_APM_ENABLED=true`
- Confirmar endpoint e API key
- Checar CORS no endpoint
