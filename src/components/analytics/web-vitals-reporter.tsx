// src/components/analytics/web-vitals-reporter.tsx
"use client"

import { useEffect } from "react"
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals"
import { reportWebVitals } from "@/lib/analytics/web-vitals"

/**
 * Componente que captura métricas Web Vitals
 * Deve ser incluído no layout raiz
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Registrar todas as métricas Core Web Vitals
    onCLS(reportWebVitals)
    onFCP(reportWebVitals)
    onINP(reportWebVitals)
    onLCP(reportWebVitals)
    onTTFB(reportWebVitals)
  }, [])

  // Não renderiza nada - apenas side effects
  return null
}
