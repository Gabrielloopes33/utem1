// src/lib/performance/index.ts
/**
 * Performance Module - Exportações públicas
 */

export {
  logApiPerformance,
  withPerformanceLogging,
  measurePerformance,
  getPerformanceMetrics,
  getSystemStats,
  cleanupOldMetrics,
} from "./logger"

export type {
  ApiPerformanceLog,
  PerformanceMetrics,
} from "./logger"
