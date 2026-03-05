// src/lib/analytics/web-vitals.ts
/**
 * Web Vitals Monitoring
 * Captura e envia métricas Core Web Vitals para analytics
 */

import type { Metric } from "web-vitals"

// Tipos de métricas Web Vitals
export type WebVitalMetric =
  | "CLS" // Cumulative Layout Shift
  | "FCP" // First Contentful Paint
  | "INP" // Interaction to Next Paint
  | "LCP" // Largest Contentful Paint
  | "TTFB" // Time to First Byte

// Tipo para métricas customizadas
interface CustomMetric {
  name: string
  value: number
  rating: string
  delta: number
  id: string
  navigationType: "navigate" | "reload" | "back-forward" | "back-forward-cache" | "prerender" | "restore"
}

// Thresholds de boas métricas (Google)
const THRESHOLDS: Record<WebVitalMetric, { good: number; poor: number }> = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

// URL do endpoint para analytics (configurar quando necessário)
const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_URL

/**
 * Classifica a métrica como good, needs-improvement, ou poor
 */
function getRating(metric: WebVitalMetric, value: number): "good" | "needs-improvement" | "poor" {
  const thresholds = THRESHOLDS[metric]
  
  // CLS é melhor quando menor
  if (metric === "CLS") {
    if (value <= thresholds.good) return "good"
    if (value <= thresholds.poor) return "needs-improvement"
    return "poor"
  }
  
  // Outras métricas: menor é melhor
  if (value <= thresholds.good) return "good"
  if (value <= thresholds.poor) return "needs-improvement"
  return "poor"
}

/**
 * Envia métrica para endpoint de analytics
 */
async function sendToAnalytics(metric: Metric | CustomMetric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  }

  // 1. Enviar para endpoint customizado (se configurado)
  if (ANALYTICS_ENDPOINT) {
    try {
      await fetch(ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      })
    } catch (error) {
      console.error("[Web Vitals] Failed to send:", error)
    }
  }

  // 2. Log em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      page: body.page,
    })
  }

  // 3. Enviar para Google Analytics (gtag)
  if (typeof window !== "undefined" && (window as unknown as { gtag?: unknown }).gtag) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtag = (window as any).gtag
    gtag("event", metric.name, {
      value: metric.value,
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      custom_parameter_1: body.page,
    })
  }

  // 4. Enviar para Vercel Speed Insights (se disponível)
  // @ts-expect-error Speed Insights pode não estar tipado
  if (window.si) {
    // @ts-expect-error window.si não está tipado
    window.si.push([metric.name, metric.value])
  }
}

/**
 * Reporta Web Vitals
 * Usado em app/layout.tsx
 */
export function reportWebVitals(metric: Metric) {
  // Classificar métrica
  const rating = getRating(metric.name as WebVitalMetric, metric.value)
  
  // Enviar para analytics
  sendToAnalytics({ ...metric, rating })

  // Log de alerta para métricas ruins
  if (rating === "poor" && process.env.NODE_ENV === "production") {
    console.warn(`[Web Vitals] Poor ${metric.name} on ${window.location.pathname}:`, metric.value)
  }
}

/**
 * Hook para capturar métricas manualmente (ex: em eventos específicos)
 */
export function measureEvent(name: string, startTime: number) {
  const duration = performance.now() - startTime
  
  const metric = {
    name: `custom_${name}`,
    value: duration,
    rating: duration < 100 ? "good" : duration < 500 ? "needs-improvement" : "poor",
    delta: duration,
    id: `${name}-${Date.now()}`,
    navigationType: "navigate" as const,
  }
  
  sendToAnalytics(metric)
}

/**
 * Medir tempo de carregamento de componente
 * Uso: const end = measureComponentLoad('ComponentName')
 *      // ... render
 *      end()
 */
export function measureComponentLoad(componentName: string): () => void {
  const startTime = performance.now()
  
  return () => {
    measureEvent(`component_${componentName}`, startTime)
  }
}

/**
 * Medir tempo de API
 */
export async function measureApiCall<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()
  
  try {
    const result = await fn()
    measureEvent(`api_${name}_success`, startTime)
    return result
  } catch (error) {
    measureEvent(`api_${name}_error`, startTime)
    throw error
  }
}
