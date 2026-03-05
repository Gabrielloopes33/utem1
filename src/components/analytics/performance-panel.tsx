// src/components/analytics/performance-panel.tsx
"use client"

import { useEffect, useState } from "react"
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals"
import type { Metric } from "web-vitals"

type MetricWithRating = Metric & { rating: "good" | "needs-improvement" | "poor" }

export function PerformancePanel() {
  const [metrics, setMetrics] = useState<Record<string, MetricWithRating>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Só mostrar em desenvolvimento
    if (process.env.NODE_ENV !== "development") return

    const handleMetric = (metric: Metric) => {
      // Classificar métrica
      let rating: "good" | "needs-improvement" | "poor" = "good"
      
      const thresholds: Record<string, [number, number]> = {
        CLS: [0.1, 0.25],
        FCP: [1800, 3000],
        FID: [100, 300],
        INP: [200, 500],
        LCP: [2500, 4000],
        TTFB: [800, 1800],
      }
      
      const [good, poor] = thresholds[metric.name] || [0, 0]
      if (metric.value > poor) rating = "poor"
      else if (metric.value > good) rating = "needs-improvement"
      
      setMetrics(prev => ({
        ...prev,
        [metric.name]: { ...metric, rating }
      }))
    }

    onCLS(handleMetric)
    onFCP(handleMetric)
    onINP(handleMetric)
    onLCP(handleMetric)
    onTTFB(handleMetric)
  }, [])

  if (process.env.NODE_ENV !== "development") return null

  const getColor = (rating: string) => {
    switch (rating) {
      case "good": return "text-green-500"
      case "needs-improvement": return "text-yellow-500"
      case "poor": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  const formatValue = (metric: MetricWithRating) => {
    if (metric.name === "CLS") return metric.value.toFixed(3)
    return `${Math.round(metric.value)}ms`
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-medium shadow-lg hover:bg-primary/90"
      >
        📊 Perf
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border rounded-lg shadow-xl p-4 w-64">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Core Web Vitals</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        {Object.entries(metrics).map(([name, metric]) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <span className="font-mono text-xs">{name}</span>
            <span className={`font-mono font-medium ${getColor(metric.rating)}`}>
              {formatValue(metric)}
            </span>
          </div>
        ))}
        
        {Object.keys(metrics).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Aguardando métricas...
          </p>
        )}
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex gap-3">
          <span className="text-green-500">● Good</span>
          <span className="text-yellow-500">● Needs improvement</span>
          <span className="text-red-500">● Poor</span>
        </div>
      </div>
    </div>
  )
}
