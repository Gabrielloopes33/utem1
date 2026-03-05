# FASE 5.3: Health Check Endpoint

## Resumo

Endpoint de health check completo que monitora todos os serviços críticos do sistema.

## Endpoint

```
GET /api/health
```

## Serviços Monitorados

| Serviço | Check | Timeout |
|---------|-------|---------|
| **Database** | Query simples no Supabase | 5s |
| **OpenAI** | List models API | 5s |
| **Supabase Storage** | List buckets | 5s |
| **N8N Webhook** | POST health check | 5s |

## Respostas

### ✅ Healthy (200)

```json
{
  "status": "healthy",
  "timestamp": "2026-03-05T13:00:00Z",
  "version": "0.1.0",
  "checks": {
    "database": { "healthy": true, "latency": 45 },
    "openai": { "healthy": true, "latency": 120 },
    "supabase_storage": { "healthy": true, "latency": 30 },
    "n8n_webhook": { "healthy": true, "latency": 80 }
  },
  "metrics": {
    "uptime": 3600,
    "memory": {
      "used": 128,
      "total": 512,
      "percentage": 25
    },
    "cache": {
      "memorySize": 42
    }
  }
}
```

### ⚠️ Degraded (200)

```json
{
  "status": "degraded",
  "timestamp": "2026-03-05T13:00:00Z",
  "version": "0.1.0",
  "checks": {
    "database": { "healthy": true, "latency": 45 },
    "openai": { "healthy": false, "latency": 5000, "error": "Timeout" },
    "supabase_storage": { "healthy": true, "latency": 30 },
    "n8n_webhook": { "healthy": true, "latency": 80 }
  },
  "metrics": { ... }
}
```

### ❌ Unhealthy (503)

```json
{
  "status": "unhealthy",
  "timestamp": "2026-03-05T13:00:00Z",
  "version": "0.1.0",
  "checks": {
    "database": { "healthy": false, "error": "Connection refused" },
    "openai": { "healthy": true, "latency": 120 },
    "supabase_storage": { "healthy": false, "error": "Auth error" },
    "n8n_webhook": { "healthy": true, "latency": 80 }
  },
  "metrics": { ... }
}
```

## Status HTTP

| Status | HTTP Code | Condição |
|--------|-----------|----------|
| healthy | 200 | Todos os serviços OK |
| degraded | 200 | Alguns serviços com problema (exceto DB) |
| unhealthy | 503 | Database falhou ou todos os serviços falharam |

## Uso com Load Balancers

```yaml
# Exemplo: Kubernetes livenessProbe
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

```yaml
# Exemplo: Docker Compose healthcheck
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Uso com Monitores Externos

### Pingdom/UptimeRobot
```
URL: https://seu-dominio.com/api/health
Expected Status: 200
```

### Datadog Synthetics
```json
{
  "assertions": [
    { "operator": "is", "type": "statusCode", "target": 200 },
    { "operator": "validatesJSONPath", "type": "body", "target": { "jsonPath": "$.status", "operator": "is", "expectedValue": "healthy" } }
  ]
}
```

## HEAD Request

Para checks leves (apenas verificar se aplicação está rodando):

```bash
curl -I https://seu-dominio.com/api/health
# HTTP/1.1 200 OK
```

## Monitoramento Programático

```typescript
// Verificar saúde periodicamente
async function checkSystemHealth() {
  const response = await fetch('/api/health')
  const health = await response.json()
  
  if (health.status === 'unhealthy') {
    // Enviar alerta
    await sendAlert('System unhealthy', health)
  }
  
  // Log métricas
  console.log('System metrics:', health.metrics)
}

// Rodar a cada minuto
setInterval(checkSystemHealth, 60000)
```

## Troubleshooting

### Database: Connection refused
- Verificar `SUPABASE_SERVICE_ROLE_KEY`
- Checar se IP está na whitelist do Supabase
- Verificar conectividade de rede

### OpenAI: Timeout
- Verificar `OPENAI_API_KEY`
- Checar quota/rate limits
- Confirmar conectividade com api.openai.com

### N8N: Timeout
- Verificar `N8N_WEBHOOK_CHAT`
- Confirmar se N8N está rodando
- Checar firewall/regras de rede

### Memory Usage Alto
- Reiniciar aplicação se >80%
- Verificar por memory leaks
- Aumentar recursos do servidor

## Alertas Recomendados

| Condição | Severidade | Ação |
|----------|------------|------|
| status = unhealthy | CRITICAL | PagerDuty/Slack imediato |
| status = degraded | WARNING | Slack canal #alerts |
| memory.percentage > 80 | WARNING | Aumentar recursos |
| uptime < 60s | INFO | Aplicação reiniciou |

## Variáveis de Ambiente

```env
# Obrigatórias
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...

# Opcionais
N8N_WEBHOOK_CHAT=https://...
```
