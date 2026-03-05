// src/app/api/health/route.ts
/**
 * Health Check Endpoint
 * Verifica status de todos os serviços críticos
 */

import { createServiceClient } from "@/lib/supabase/service"
import { getSystemStats } from "@/lib/performance/logger"
import { getCacheStats } from "@/lib/cache"

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  version: string
  checks: {
    database: { healthy: boolean; latency?: number; error?: string }
    openai: { healthy: boolean; latency?: number; error?: string }
    supabase_storage: { healthy: boolean; latency?: number; error?: string }
    n8n_webhook: { healthy: boolean; latency?: number; error?: string }
  }
  metrics: {
    uptime: number
    memory: {
      used: number
      total: number
      percentage: number
    }
    cache: {
      memorySize: number
    }
  }
}

// Timeout para health checks (ms)
const HEALTH_TIMEOUT = 5000

/**
 * Verifica saúde do banco de dados
 */
async function checkDatabase(): Promise<HealthCheckResult["checks"]["database"]> {
  const start = performance.now()

  try {
    const supabase = createServiceClient()

    // Tentar uma query simples
    const { error } = await supabase
      .from("time_agents")
      .select("id", { count: "exact", head: true })
      .limit(1)

    if (error) {
      throw error
    }

    return {
      healthy: true,
      latency: Math.round(performance.now() - start),
    }
  } catch (error) {
    return {
      healthy: false,
      latency: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Verifica saúde da API da OpenAI
 */
async function checkOpenAI(): Promise<HealthCheckResult["checks"]["openai"]> {
  const start = performance.now()

  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return {
        healthy: false,
        error: "OPENAI_API_KEY not configured",
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT)

    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return {
      healthy: true,
      latency: Math.round(performance.now() - start),
    }
  } catch (error) {
    return {
      healthy: false,
      latency: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Verifica saúde do Supabase Storage
 */
async function checkSupabaseStorage(): Promise<HealthCheckResult["checks"]["supabase_storage"]> {
  const start = performance.now()

  try {
    const supabase = createServiceClient()

    // Tentar listar buckets
    const { error } = await supabase.storage.listBuckets()

    if (error) {
      throw error
    }

    return {
      healthy: true,
      latency: Math.round(performance.now() - start),
    }
  } catch (error) {
    return {
      healthy: false,
      latency: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Verifica saúde do webhook N8N
 */
async function checkN8NWebhook(): Promise<HealthCheckResult["checks"]["n8n_webhook"]> {
  const start = performance.now()

  try {
    const webhookUrl = process.env.N8N_WEBHOOK_CHAT

    if (!webhookUrl) {
      return {
        healthy: false,
        error: "N8N_WEBHOOK_CHAT not configured",
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT)

    // Fazer um POST de health check (espera-se 401 ou 200)
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "health_check" }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // N8N pode retornar 401 (unauthorized) que é ok - significa que está rodando
    if (response.ok || response.status === 401) {
      return {
        healthy: true,
        latency: Math.round(performance.now() - start),
      }
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  } catch (error) {
    // Se for abort error, significa timeout
    if (error instanceof Error && error.name === "AbortError") {
      return {
        healthy: false,
        latency: HEALTH_TIMEOUT,
        error: "Timeout after 5s",
      }
    }

    return {
      healthy: false,
      latency: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * GET /api/health
 * Retorna status de saúde completo do sistema
 */
export async function GET(): Promise<Response> {
  const start = performance.now()

  // Executar todos os checks em paralelo
  const [database, openai, supabase_storage, n8n_webhook] = await Promise.all([
    checkDatabase(),
    checkOpenAI(),
    checkSupabaseStorage(),
    checkN8NWebhook(),
  ])

  // Calcular status geral
  const checks = { database, openai, supabase_storage, n8n_webhook }
  const healthyChecks = Object.values(checks).filter((c) => c.healthy).length
  const totalChecks = Object.keys(checks).length

  let status: HealthCheckResult["status"] = "healthy"
  if (healthyChecks === 0) {
    status = "unhealthy"
  } else if (healthyChecks < totalChecks) {
    status = "degraded"
  }

  // Se database falhar, é crítico
  if (!database.healthy) {
    status = "unhealthy"
  }

  // Obter métricas do sistema
  const stats = getSystemStats()
  const memoryUsed = stats.memory.heapUsed
  const memoryTotal = stats.memory.heapTotal

  const result: HealthCheckResult = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    checks,
    metrics: {
      uptime: Math.round(stats.uptime),
      memory: {
        used: Math.round(memoryUsed / 1024 / 1024), // MB
        total: Math.round(memoryTotal / 1024 / 1024), // MB
        percentage: Math.round((memoryUsed / memoryTotal) * 100),
      },
      cache: getCacheStats(),
    },
  }

  // Status HTTP baseado no health
  const statusCode = status === "healthy" ? 200 : status === "degraded" ? 200 : 503

  // Adicionar headers de cache (não cachear health check)
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "X-Health-Check-Duration": `${Math.round(performance.now() - start)}ms`,
  }

  return Response.json(result, { status: statusCode, headers })
}

/**
 * HEAD /api/health
 * Verificação leve (applicação está rodando)
 */
export async function HEAD(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
