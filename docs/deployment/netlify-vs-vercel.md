# FASE 4.4: Avaliação - Netlify vs Vercel

## Resumo Comparativo

| Feature | Netlify (Atual) | Vercel | Impacto |
|---------|-----------------|--------|---------|
| **Next.js Runtime** | Via plugin | Nativo | Vercel vence |
| **ISR** | Suportado | Nativo/Instantâneo | Vercel vence |
| **Streaming** | Limitado | Completo | Vercel vence |
| **Edge Runtime** | Suportado | Nativo | Vercel vence |
| **Image Optimization** | Plugin | Nativo | Vercel vence |
| **AI SDK Streaming** | Funciona | Otimizado | Vercel vence |
| **Preço** | Generoso | Generoso | Empate |
| **Build Time** | ~90s | ~75s | Vercel vence |
| **Cold Start** | ~200ms | ~100ms | Vercel vence |

## Análise para TIME Platform

### ✅ Netlify funciona bem para:
- Static sites / JAMstack
- Sites com pouca interatividade
- Projetos que usam funcionalidades básicas do Next.js
- Equipes já familiarizadas com a plataforma

### ⚠️ Pontos de Atenção no Netlify:
```
1. ISR com staleTimes experimental
   - Funciona, mas não é otimizado
   - Pode ter inconsistências de cache

2. Streaming de AI
   - Funciona com workarounds
   - Headers especiais necessários

3. Edge Runtime
   - Suportado via plugin
   - Menos integrado que na Vercel

4. Build Time
   - Plugin Next.js adiciona overhead
   - ~15-20s mais lento que Vercel
```

### 🚀 Vercel seria melhor se:
- Uso intensivo de streaming AI (chat em tempo real)
- Necessidade de ISR com baixa latência
- Edge Functions para processamento distribuído
- Image optimization nativa mais rápida
- Melhor integração com AI SDK

## Recomendação para TIME

### Curto prazo (Manter Netlify)
```
Justificativa:
- Configuração atual estável
- Build passando (101KB bundle)
- Cache otimizado configurado
- Migração teria custo de tempo

Ações:
✓ Monitorar performance
✓ Coletar métricas Web Vitals
✓ Testar Vercel em paralelo (preview)
```

### Médio prazo (Avaliar migração se):
```
Triggers para migração:
- LCP > 2.5s consistentemente
- Problemas com streaming de chat
- Necessidade de Edge Functions
- Escala para múltiplas regiões
- Uso intensivo de ISR
```

## Plano de Migração (Se Decidido)

### Fase 1: Preparação (1 dia)
```bash
# 1. Criar projeto na Vercel
vercel projects add time-platform

# 2. Importar repo Git
# 3. Configurar variáveis de ambiente
```

### Fase 2: Configuração (1 dia)
```typescript
// vercel.json (se necessário)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "regions": ["gru1", "iad1"] // São Paulo + Virginia
}
```

### Fase 3: Variáveis de Ambiente
```bash
# Copiar do Netlify para Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... demais variáveis
```

### Fase 4: Testes (1-2 dias)
```bash
# Deploy de preview
vercel --preview

# Testar:
# - Chat streaming
# - ISR das páginas
# - Image optimization
# - Edge functions (se usar)
```

### Fase 5: Cutover (1 dia)
```
1. DNS TTL reduzido (5 min)
2. Deploy em produção na Vercel
3. Verificar health checks
4. Atualizar DNS
5. Monitorar por 24h
```

## Benchmark de Teste

```bash
# Testar na Vercel (antes de migrar)
# 1. Criar branch de teste
git checkout -b test/vercel-deploy

# 2. Deploy preview
vercel --yes

# 3. Comparar métricas
# - TTFB
# - LCP
# - Build time
# - Streaming response time
```

## Conclusão

**Recomendação atual: MANTER NETLIFY**

Razões:
1. Setup atual está otimizado e funcionando
2. Bundle size excelente (101KB)
3. Cache configurado adequadamente
4. Sem problemas críticos identificados

**Reavaliar quando:**
- Chat streaming apresentar problemas
- Necessidade de ISR em escala
- Adoção de Edge Functions
- Métricas indicarem necessidade

## Documentos Relacionados

- `docs/deployment/infra-config.md` - Configuração atual Netlify
- `docs/deployment/migration-checklist.md` - Checklist de migração (criar quando necessário)
