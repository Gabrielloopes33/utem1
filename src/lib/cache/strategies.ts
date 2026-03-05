// src/lib/cache/strategies.ts
/**
 * Estratégias de Cache Multi-Layer
 * 
 * Layers:
 * 1. React.cache() - Cache por request (já implementado)
 * 2. unstable_cache - Cache de aplicação Next.js
 * 3. MemoryCache - Cache em memória (fallback)
 * 4. (Futuro) Redis/Vercel KV - Cache distribuído
 */

import { unstable_cache } from "next/cache"
import { memoryCache } from "./memory-cache"
import { createServiceClient } from "@/lib/supabase/service"

// ============================================
// CACHE DE APLICAÇÃO - Dashboard
// ============================================

export interface DashboardMetrics {
  totalAgents: number
  activeCampaigns: number
  totalSquads: number
  recentActivities: unknown[]
  performanceData: {
    labels: string[]
    data: number[]
  }
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createServiceClient()

  const [
    { count: totalAgents },
    { count: activeCampaigns },
    { count: totalSquads },
    { data: recentActivities },
  ] = await Promise.all([
    supabase.from("time_agents").select("*", { count: "exact", head: true }),
    supabase.from("time_campaigns").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("squads").select("*", { count: "exact", head: true }),
    supabase
      .from("time_activities")
      .select("id, type, description, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  // Gerar dados de performance (últimos 7 dias)
  const labels: string[] = []
  const data: number[] = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString("pt-BR", { weekday: "short" }))
    data.push(Math.floor(Math.random() * 50) + 20) // Simulado - substituir por dados reais
  }

  return {
    totalAgents: totalAgents ?? 0,
    activeCampaigns: activeCampaigns ?? 0,
    totalSquads: totalSquads ?? 0,
    recentActivities: recentActivities ?? [],
    performanceData: { labels, data },
  }
}

/**
 * Cache de métricas do dashboard (5 minutos)
 * Usa unstable_cache do Next.js para persistir entre requests
 */
export const getCachedDashboardMetrics = unstable_cache(
  fetchDashboardMetrics,
  ["dashboard-metrics"],
  {
    revalidate: 300, // 5 minutos
    tags: ["dashboard", "metrics"],
  }
)

// ============================================
// CACHE DE AGENTES
// ============================================

export interface AgentListItem {
  id: string
  name: string
  status: string
  avatar_url: string | null
}

async function fetchAgentList(): Promise<AgentListItem[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from("time_agents")
    .select("id, name, status, avatar_url")
    .order("name")

  if (error) throw error

  return data ?? []
}

/**
 * Cache da lista de agentes (2 minutos)
 * Muda frequentemente com status updates
 */
export const getCachedAgentList = unstable_cache(
  fetchAgentList,
  ["agent-list"],
  {
    revalidate: 120, // 2 minutos
    tags: ["agents", "agent-list"],
  }
)

// ============================================
// CACHE DE REFERÊNCIA (Dados que mudam pouco)
// ============================================

export interface ReferenceData {
  contentTypes: Array<{ id: string; name: string }>
  campaignStatuses: Array<{ id: string; name: string; color: string }>
  personas: Array<{ id: string; name: string }>
}

async function fetchReferenceData(): Promise<ReferenceData> {
  const supabase = createServiceClient()

  // Buscar dados de referência em paralelo
  const [
    { data: contentTypes },
    { data: campaignStatuses },
    { data: personas },
  ] = await Promise.all([
    supabase.from("content_types").select("id, name").order("name"),
    supabase.from("campaign_statuses").select("id, name, color").order("name"),
    supabase.from("personas").select("id, name").order("name"),
  ])

  return {
    contentTypes: contentTypes ?? [],
    campaignStatuses: campaignStatuses ?? [],
    personas: personas ?? [],
  }
}

/**
 * Cache de dados de referência (10 minutos)
 * Dados que mudam muito raramente
 */
export const getCachedReferenceData = unstable_cache(
  fetchReferenceData,
  ["reference-data"],
  {
    revalidate: 600, // 10 minutos
    tags: ["reference", "metadata"],
  }
)

// ============================================
// CACHE DE EDGE - Competidores (Memory fallback)
// ============================================

export interface CompetitorData {
  handle: string
  followers: number
  engagement: number
  posts: number
  lastUpdated: string
}

/**
 * Busca dados de competidor com cache em memória
 * TTL: 24 horas (dados de competidor mudam lentamente)
 */
export async function getCachedCompetitorData(
  handle: string
): Promise<CompetitorData | null> {
  const cacheKey = `competitor:${handle.toLowerCase()}`

  // Tentar cache em memória primeiro
  const cached = await memoryCache.get<CompetitorData>(cacheKey)
  if (cached) {
    return cached
  }

  // Buscar do banco
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("competitors")
    .select("handle, followers, engagement, posts, updated_at")
    .eq("handle", handle)
    .single()

  if (error || !data) return null

  const competitorData: CompetitorData = {
    handle: data.handle,
    followers: data.followers,
    engagement: data.engagement,
    posts: data.posts,
    lastUpdated: data.updated_at,
  }

  // Salvar em cache (24 horas)
  await memoryCache.set(cacheKey, competitorData, 86400)

  return competitorData
}

/**
 * Invalida cache de competidor (após atualização)
 */
export async function invalidateCompetitorCache(handle: string): Promise<void> {
  const cacheKey = `competitor:${handle.toLowerCase()}`
  await memoryCache.delete(cacheKey)
}

// ============================================
// CACHE DE CONHECIMENTO (Agent Knowledge)
// ============================================

export interface KnowledgeContext {
  agentId: string
  documents: Array<{
    kb_id: string
    filename: string
    content: string
  }>
  compiledAt: string
}

/**
 * Busca contexto de conhecimento do agente com cache
 * TTL: 1 hora (documentos mudam pouco)
 */
export async function getCachedKnowledgeContext(
  agentId: string
): Promise<KnowledgeContext | null> {
  const cacheKey = `knowledge:${agentId}`

  // Tentar cache
  const cached = await memoryCache.get<KnowledgeContext>(cacheKey)
  if (cached) {
    return cached
  }

  // Buscar do banco
  const supabase = createServiceClient()

  const { data: kbLinks, error: linksError } = await supabase
    .from("time_agent_knowledge")
    .select("kb_id")
    .eq("agent_id", agentId)

  if (linksError || !kbLinks?.length) return null

  const kbIds = kbLinks.map((l) => l.kb_id)

  const { data: docs, error: docsError } = await supabase
    .from("time_knowledge_docs")
    .select("kb_id, content, filename")
    .in("kb_id", kbIds)
    .eq("status", "ready")

  if (docsError || !docs?.length) return null

  const knowledgeContext: KnowledgeContext = {
    agentId,
    documents: docs.map((d) => ({
      kb_id: d.kb_id,
      filename: d.filename,
      content: d.content ?? "",
    })),
    compiledAt: new Date().toISOString(),
  }

  // Salvar em cache (1 hora)
  await memoryCache.set(cacheKey, knowledgeContext, 3600)

  return knowledgeContext
}

/**
 * Invalida cache de conhecimento (após atualizar documentos)
 */
export async function invalidateKnowledgeCache(agentId: string): Promise<void> {
  const cacheKey = `knowledge:${agentId}`
  await memoryCache.delete(cacheKey)
}

// ============================================
// UTILITÁRIOS DE CACHE
// ============================================

/**
 * Wrapper genérico para cache com fallback
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = await memoryCache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const data = await fetcher()
  await memoryCache.set(key, data, ttlSeconds)
  return data
}

/**
 * Invalida todos os caches relacionados a um agente
 */
export async function invalidateAgentCaches(agentId: string): Promise<void> {
  await Promise.all([
    memoryCache.invalidatePattern(`knowledge:${agentId}*`),
    memoryCache.invalidatePattern(`agent:${agentId}*`),
  ])
}

/**
 * Estatísticas do cache (para debug/monitoramento)
 */
export function getCacheStats(): {
  memorySize: number
} {
  return {
    memorySize: memoryCache.size(),
  }
}
