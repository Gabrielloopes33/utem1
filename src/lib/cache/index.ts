// src/lib/cache/index.ts
/**
 * Cache Module - Exportações públicas
 * 
 * Estratégias de cache multi-layer:
 * - unstable_cache: Cache de aplicação Next.js (persiste entre requests)
 * - memoryCache: Cache em memória (fallback/local)
 * - React.cache: Cache por request (Server Components)
 */

export {
  // Cache de aplicação (Next.js unstable_cache)
  getCachedDashboardMetrics,
  getCachedAgentList,
  getCachedReferenceData,
  
  // Cache de edge/memória
  getCachedCompetitorData,
  getCachedKnowledgeContext,
  
  // Utilitários
  withCache,
  invalidateAgentCaches,
  invalidateCompetitorCache,
  invalidateKnowledgeCache,
  getCacheStats,
} from "./strategies"

export { memoryCache } from "./memory-cache"

// Re-exportar tipos
export type {
  DashboardMetrics,
  AgentListItem,
  ReferenceData,
  CompetitorData,
  KnowledgeContext,
} from "./strategies"
