# FASE 5.1: Web Vitals Monitoring

## Resumo

Implementação completa de monitoramento de Core Web Vitals para métricas de performance em tempo real.

## Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/analytics/web-vitals.ts` | Core logic e integração com analytics |
| `src/components/analytics/web-vitals-reporter.tsx` | Componente de captura automática |
| `src/components/analytics/performance-panel.tsx` | Painel visual (dev only) |

## Métricas Monitoradas

| Métrica | Nome | Bom | Precisa Melhorar | Ruim |
|---------|------|-----|------------------|------|
| **CLS** | Cumulative Layout Shift | ≤0.1 | ≤0.25 | >0.25 |
| **FCP** | First Contentful Paint | ≤1.8s | ≤3.0s | >3.0s |
| **INP** | Interaction to Next Paint | ≤200ms | ≤500ms | >500ms |
| **LCP** | Largest Contentful Paint | ≤2.5s | ≤4.0s | >4.0s |
| **TTFB** | Time to First Byte | ≤800ms | ≤1.8s | >1.8s |

> **Nota:** FID (First Input Delay) foi removido pois foi substituído por INP no Core Web Vitals 2024.

## Uso

### 1. Painel de Performance (Desenvolvimento)

Em desenvolvimento, um painel flutuante aparece no canto inferior direito:

```
📊 Perf  →  Clique para expandir
```

Mostra em tempo real:
- Valores das métricas
- Classificação por cor (🟢🟡🔴)
- Atualização automática

### 2. Console Logs

```bash
# Desenvolvimento
[Web Vitals] LCP: { value: 1200, rating: 'good', page: '/dashboard' }
[Web Vitals] CLS: { value: 0.05, rating: 'good', page: '/dashboard' }

# Produção (métricas ruins)
[Web Vitals] Poor LCP on /dashboard: 4500
```

### 3. API Programática

```typescript
import { measureEvent, measureComponentLoad, measureApiCall } from '@/lib/analytics/web-vitals'

// Medir evento customizado
const startTime = performance.now()
// ... operação
measureEvent('custom_operation', startTime)

// Medir carregamento de componente
const endMeasure = measureComponentLoad('HeavyComponent')
// ... render
endMeasure() // Envia métrica automaticamente

// Medir chamada de API
const data = await measureApiCall('fetchUser', () => 
  fetch('/api/user').then(r => r.json())
)
```

## Integrações

### Google Analytics (gtag)

```typescript
// Configurado automaticamente se window.gtag existir
gtag('event', 'LCP', {
  value: 1200,
  metric_id: '...',
  metric_value: 1200,
  metric_delta: 1200,
})
```

### Vercel Speed Insights

```typescript
// Configurado automaticamente se window.si existir
window.si.push(['LCP', 1200])
```

### Endpoint Customizado

```env
# .env.local
NEXT_PUBLIC_ANALYTICS_URL=https://sua-api.com/analytics
```

## Dashboard de Monitoramento

### Opção 1: Vercel Speed Insights (Recomendado)

```bash
# Instalar
npm install @vercel/speed-insights

# Adicionar ao layout
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Opção 2: Google Analytics 4

```typescript
// O web-vitals.ts já envia automaticamente para gtag
// Basta ter o GA4 configurado no site
```

### Opção 3: Endpoint Próprio

```typescript
// Receber métricas no seu backend
// POST /api/analytics/web-vitals

interface WebVitalsPayload {
  name: 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
  page: string
  timestamp: string
}
```

## Thresholds de Alerta

### Console Warnings (Produção)

```typescript
// Alerta automático para métricas 'poor'
[Web Vitals] Poor LCP on /dashboard: 4500
[Web Vitals] Poor CLS on /agentes: 0.35
```

### SLIs Recomendados

| Métrica | SLO | Alerta |
|---------|-----|--------|
| LCP | 90% < 2.5s | >10% poor |
| INP | 90% < 200ms | >10% poor |
| CLS | 90% < 0.1 | >10% poor |

## Troubleshooting

### Métricas não aparecem

1. Verificar se está em desenvolvimento (painel só aparece em dev)
2. Recarregar a página - métricas são capturadas durante o ciclo de vida
3. Verificar console por erros

### Valores muito altos

```
LCP: 8000ms (poor)
```

Possíveis causas:
- Imagens não otimizadas
- Fontes bloqueando render
- JavaScript pesado

Verificar com Lighthouse:
```bash
npm run build
npx lighthouse http://localhost:3000
```

### CLS alto inesperado

```
CLS: 0.5 (poor)
```

Possíveis causas:
- Imagens sem dimensões
- Fontes causing FOIT/FOUT
- Conteúdo carregando dinamicamente

Soluções:
```tsx
// Sempre definir width/height em imagens
<Image width={800} height={600} ... />

// Usar font-display: swap
font-display: swap;

// Reservar espaço para conteúdo dinâmico
<div className="min-h-[200px]">
  {dynamicContent}
</div>
```

## Próximos Passos

- [ ] Configurar Vercel Speed Insights
- [ ] Setup de alertas (Slack/Email)
- [ ] Dashboard de métricas históricas
- [ ] Integração com Sentry para correlação de erros

## Referências

- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals Thresholds](https://web.dev/defining-core-web-vitals-thresholds/)
- [web-vitals library](https://github.com/GoogleChrome/web-vitals)
