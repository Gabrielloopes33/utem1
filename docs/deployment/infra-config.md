# FASE 4: Infraestrutura & Deploy

## Resumo

Configurações otimizadas para deploy no Netlify com cache agressivo, segurança e bundle analysis.

## Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `netlify.toml` | Headers de cache e segurança |
| `next.config.ts` | Bundle analyzer, compressão |
| `package.json` | Scripts de performance |

---

## 4.1 Netlify Otimizado

### Headers de Segurança
```toml
X-Frame-Options = "DENY"
X-Content-Type-Options = "nosniff"
X-XSS-Protection = "1; mode=block"
Referrer-Policy = "strict-origin-when-cross-origin"
Permissions-Policy = "accelerometer=(), camera=(), ..."
```

### Estratégia de Cache Multi-Layer

| Asset Type | Cache Duration | Política |
|------------|---------------|----------|
| `/_next/static/*` | 1 ano | `immutable` |
| `/_next/image*` | 30 dias | `stale-while-revalidate` |
| `*.webp`, `*.avif` | 30 dias | `immutable` |
| `/fonts/*` | 1 ano | `immutable` |
| `/static/*` | 7 dias | `stale-while-revalidate` |
| `/api/*` | no-store | nunca cachear |

### Variáveis de Ambiente

```toml
NODE_VERSION = "20"
NEXT_TELEMETRY_DISABLED = "1"
NODE_OPTIONS = "--max-old-space-size=4096"
NETLIFY_NEXT_PLUGIN_SKIP_VALIDATION = "true"
```

---

## 4.2 Bundle Analyzer

### Instalação
```bash
npm install --save-dev @next/bundle-analyzer cross-env
```

### Uso
```bash
# Analisar bundle
npm run build:analyze

# Ou diretamente
ANALYZE=true npm run build
```

### Interpretação dos Resultados

```
.next/analyze/
├── client.html      # Bundle do cliente
├── edge.html        # Edge runtime
└── nodejs.html      # Server-side
```

**Limites recomendados:**
- First Load JS: < 150KB (atual: ~101KB ✅)
- Client Bundle: < 200KB
- Vendor (react/next): ~80KB (aceitável)

---

## 4.3 Scripts Úteis

| Script | Descrição |
|--------|-----------|
| `npm run build` | Build padrão otimizado |
| `npm run build:analyze` | Build + análise de bundle |
| `npm run perf:audit` | Lint + TypeCheck + Build |
| `npm run netlify:build` | Build via Netlify CLI |
| `npm run netlify:deploy` | Deploy para produção |

---

## Checklist de Deploy

### Antes do Deploy
- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa (ou warnings aceitos)
- [ ] `npm run perf:audit` passa
- [ ] Variáveis de ambiente configuradas no Netlify

### Configurações no Netlify Dashboard

1. **Site Settings > Build & Deploy**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   N8N_WEBHOOK_CHAT
   N8N_WEBHOOK_GERAR_POST
   ```

3. **Edge Functions** (se usar)
   - Configurar em `netlify/edge-functions/`

---

## Performance Esperada

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Cache Hit Rate | ~30% | ~85% | +183% |
| TTFB | ~200ms | ~80ms | 60% |
| LCP | ~1.5s | ~0.8s | 47% |
| Bundle Size | ~180KB | ~101KB | 44% |
| Build Time | ~90s | ~75s | 17% |

---

## Troubleshooting

### Build falha por memória
```toml
# netlify.toml
[build.environment]
  NODE_OPTIONS = "--max-old-space-size=6144"
```

### Cache não funciona
1. Verificar headers no DevTools > Network
2. Confirmar `Cache-Control` nos responses
3. Limpar cache do Netlify: `Netlify Dashboard > Site > Build & Deploy > Clear cache`

### Bundle muito grande
```bash
# Analisar
npm run build:analyze

# Verificar imports
# - Usar dynamic imports para componentes grandes
# - Verificar tree-shaking de libs
# - Usar `import()` em vez de require()
```

---

## Próximos Passos (FASE 5)

- [ ] Configurar analytics (Vercel Analytics, Plausible)
- [ ] Setup de monitoramento (Sentry, LogRocket)
- [ ] Alertas de performance (Web Vitals)
- [ ] CI/CD pipeline avançado
