# Migração de Domínio

Se você precisa migrar o projeto para outro domínio, atualize as seguintes configurações:

## 1. Variáveis de Ambiente (Netlify/Dashboard)

```env
# URL da aplicação
NEXT_PUBLIC_APP_URL=https://seu-novo-dominio.com

# N8N Webhooks (se mudou)
N8N_WEBHOOK_CHAT=https://seu-n8n.com/webhook/...
N8N_WEBHOOK_GERAR_POST=https://seu-n8n.com/webhook/...
```

## 2. Arquivos de Código

### API Routes com N8N
```typescript
// src/app/api/agentes/conteudo/route.ts
const N8N_WEBHOOK_CHAT = "https://seu-n8n.com/webhook/..."

// src/app/api/agentes/campanhas/route.ts
const N8N_WEBHOOK_URL = "https://seu-n8n.com/webhook/..."

// src/app/api/agentes/ideias/route.ts
const N8N_WEBHOOK_URL = "https://seu-n8n.com/webhook/..."

// src/lib/n8n/client.ts
const N8N_BASE_URL = 'https://seu-n8n.com/webhook';
```

## 3. Documentação (Opcional)

Atualizar em:
- `docs/monitoring/health-check.md`
- `docs/n8n-workflows/AGENTES-CONFIGURACAO.md`
- `docs/n8n-workflows/README.md`

## 4. Health Check

```bash
# Verificar se o novo domínio está respondendo
curl https://seu-novo-dominio.com/api/health
```

## Nota sobre as Otimizações

Todas as otimizações de performance (Fases 1-5) são **independentes de domínio**:
- ✅ Cache multi-layer
- ✅ Bundle optimization
- ✅ Database indexes
- ✅ Web Vitals monitoring
- ✅ Performance logger

Elas funcionam em qualquer domínio sem alterações.
