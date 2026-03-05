// src/lib/performance/logger.ts
/**
 * Performance Logger
 * Monitora performance de APIs e operações críticas
 */

import { getCacheStats } from "@/lib/cache"

// Thresholds para alertas (ms)
const THRESHOLDS = {
  SLOW: 1000,      // >1s = warning
  VERY_SLOW: 3000, // >3s = error
  CRITICAL: 5000,  // >5s = critical
}

// Configuração de APM (configurar quando necessário)
const APM_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_APM_ENABLED === "true",
  endpoint: process.env.NEXT_PUBLIC_APM_ENDPOINT,
  apiKey: process.env.APM_API_KEY,
}

export interface ApiPerformanceLog {
  route: string
  method: string
  duration: number
  success: boolean
  timestamp: string
  userAgent?: string
  ip?: string
  metadata?: Record<string, unknown>
}

export interface PerformanceMetrics {
  totalRequests: number
  slowRequests: number
  errorRequests: number
  avgDuration: number
  p95Duration: number
  p99Duration: number
}

// Armazenamento em memória para métricas (últimas 1000 requisições)
const metricsStore: Array<{ duration: number; success: boolean; timestamp: number }> = []
const MAX_STORE_SIZE = 1000

/**
 * Loga performance de chamada de API
 */
export function logApiPerformance(
  route: string,
  duration: number,
  success: boolean,
  options: {
    method?: string
    userAgent?: string
    ip?: string
    metadata?: Record<string, unknown>
  } = {}
): void {
  const { method = "GET", userAgent, ip, metadata } = options

  // Criar log
  const log: ApiPerformanceLog = {
    route,
    method,
    duration: Math.round(duration),
    success,
    timestamp: new Date().toISOString(),
    userAgent,
    ip,
    metadata,
  }

  // Armazenar métrica
  metricsStore.push({
    duration,
    success,
    timestamp: Date.now(),
  })

  // Limpar store antigo
  if (metricsStore.length > MAX_STORE_SIZE) {
    metricsStore.shift()
  }

  // Log no console com nível apropriado
  const durationStr = `${log.duration}ms`

  if (!success) {
    console.error(`[API ERROR] ${method} ${route}: ${durationStr}`, metadata)
  } else if (duration > THRESHOLDS.CRITICAL) {
    console.error(`[API CRITICAL] ${method} ${route}: ${durationStr} ⚠️`, metadata)
  } else if (duration > THRESHOLDS.VERY_SLOW) {
    console.warn(`[API VERY SLOW] ${method} ${route}: ${durationStr}`, metadata)
  } else if (duration > THRESHOLDS.SLOW) {
    console.warn(`[API SLOW] ${method} ${route}: ${durationStr}`)
  } else if (process.env.NODE_ENV === "development") {
    console.log(`[API OK] ${method} ${route}: ${durationStr}`)
  }

  // Enviar para APM se configurado
  if (APM_CONFIG.enabled && APM_CONFIG.endpoint) {
    sendToAPM(log).catch((e) => console.error("[APM] Failed to send:", e))
  }
}

/**
 * Middleware para API routes (Next.js App Router)
 */
export function withPerformanceLogging(
  handler: (req: Request) => Promise<Response>,
  routeName: string
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const start = performance.now()
    const method = req.method

    try {
      const response = await handler(req)
      const duration = performance.now() - start

      logApiPerformance(routeName, duration, response.ok, {
        method,
        metadata: { status: response.status },
      })

      return response
    } catch (error) {
      const duration = performance.now() - start

      logApiPerformance(routeName, duration, false, {
        method,
        metadata: { error: error instanceof Error ? error.message : "Unknown" },
      })

      throw error
    }
  }
}

/**
 * Decorator para funções assíncronas
 */
export function measurePerformance<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  name: string
): T {
  return (async (...args: unknown[]): Promise<unknown> => {
    const start = performance.now()

    try {
      const result = await fn(...args)
      const duration = performance.now() - start

      logApiPerformance(name, duration, true)
      return result
    } catch (error) {
      const duration = performance.now() - start

      logApiPerformance(name, duration, false)
      throw error
    }
  }) as T
}

/**
 * Calcula métricas agregadas
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  if (metricsStore.length === 0) {
    return {
      totalRequests: 0,
      slowRequests: 0,
      errorRequests: 0,
      avgDuration: 0,
      p95Duration: 0,
      p99Duration: 0,
    }
  }

  const durations = metricsStore.map((m) => m.duration).sort((a, b) => a - b)
  const total = metricsStore.length
  const slow = metricsStore.filter((m) => m.duration > THRESHOLDS.SLOW).length
  const errors = metricsStore.filter((m) => !m.success).length

  const avg = durations.reduce((a, b) => a + b, 0) / total
  const p95Index = Math.floor(total * 0.95)
  const p99Index = Math.floor(total * 0.99)

  return {
    totalRequests: total,
    slowRequests: slow,
    errorRequests: errors,
    avgDuration: Math.round(avg),
    p95Duration: Math.round(durations[p95Index] || durations[durations.length - 1]),
    p99Duration: Math.round(durations[p99Index] || durations[durations.length - 1]),
  }
}

/**
 * Retorna estatísticas completas do sistema
 */
export function getSystemStats(): {
  performance: PerformanceMetrics
  cache: { memorySize: number }
  uptime: number
  memory: NodeJS.MemoryUsage
} {
  return {
    performance: getPerformanceMetrics(),
    cache: getCacheStats(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }
}

/**
 * Envia métricas para APM externo
 */
async function sendToAPM(log: ApiPerformanceLog): Promise<void> {
  if (!APM_CONFIG.endpoint) return

  try {
    await fetch(APM_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(APM_CONFIG.apiKey && { Authorization: `Bearer ${APM_CONFIG.apiKey}` }),
      },
      body: JSON.stringify(log),
      // Usar keepalive para não bloquear o response
      keepalive: true,
    })
  } catch {
    // Silenciar erros de APM para não afetar a aplicação
  }
}

/**
 * Limpa métricas antigas (manter apenas últimas 24h)
 */
export function cleanupOldMetrics(): void {
  const ONE_DAY = 24 * 60 * 60 * 1000
  const now = Date.now()

  const cutoffIndex = metricsStore.findIndex((m) => now - m.timestamp < ONE_DAY)

  if (cutoffIndex > 0) {
    metricsStore.splice(0, cutoffIndex)
  }
}

// Auto-cleanup a cada hora
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOldMetrics, 60 * 60 * 1000)
}
