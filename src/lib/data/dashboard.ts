"use server"

import { unstable_cache } from "next/cache"

export interface DashboardMetrics {
  instagram: {
    followers: number
    followers_change: number
    likes: number
    likes_change: number
    views: number
    views_change: number
    engagement: number
    engagement_change: number
  }
  contentPerformance: Array<{
    type: string
    value: number
    color: string
  }>
  topPosts: Array<{
    id: string
    title: string
    engagement: string
    likes: string
    type: string
    thumbnailUrl?: string
    permalink?: string
  }>
  competitors: Array<{
    id: string
    handle: string
    name: string
    followers: number
    engagement: number
    profilePicUrl?: string
  }>
  _dataSource?: {
    topPostsIsReal: boolean
    topPostsError?: string
  }
}

// Dados mockados como fallback
const MOCK_METRICS: DashboardMetrics = {
  instagram: {
    followers: 12800,
    followers_change: 8,
    likes: 45200,
    likes_change: 12,
    views: 125000,
    views_change: -5,
    engagement: 3.2,
    engagement_change: 15,
  },
  contentPerformance: [
    { type: "Carrossel", value: 45, color: "bg-accent-500" },
    { type: "Reels", value: 35, color: "bg-primary" },
    { type: "Cards", value: 20, color: "bg-muted-foreground" },
  ],
  topPosts: [
    { id: "1", title: "RF vs FII: Qual escolher?", engagement: "4.8%", likes: "1.2K", type: "Carrossel", permalink: "https://instagram.com/p/mock1" },
    { id: "2", title: "5 erros no CDB", engagement: "4.2%", likes: "980", type: "Reels", permalink: "https://instagram.com/p/mock2" },
    { id: "3", title: "Diversificação inteligente", engagement: "3.9%", likes: "856", type: "Carrossel", permalink: "https://instagram.com/p/mock3" },
    { id: "4", title: "Dúvidas sobre Tesouro", engagement: "3.5%", likes: "720", type: "Card", permalink: "https://instagram.com/p/mock4" },
    { id: "5", title: "Como começar a investir com R$ 100", engagement: "3.3%", likes: "680", type: "Reels", permalink: "https://instagram.com/p/mock5" },
    { id: "6", title: "Alugar ou financiar? Análise completa", engagement: "3.1%", likes: "620", type: "Carrossel", permalink: "https://instagram.com/p/mock6" },
    { id: "7", title: "Os erros que me fizeram perder dinheiro", engagement: "2.9%", likes: "580", type: "Story", permalink: "https://instagram.com/p/mock7" },
    { id: "8", title: "Como ler o gráfico de um FII", engagement: "2.7%", likes: "520", type: "Carrossel", permalink: "https://instagram.com/p/mock8" },
    { id: "9", title: "5 hooks virais sobre educação financeira", engagement: "2.5%", likes: "480", type: "Card", permalink: "https://instagram.com/p/mock9" },
    { id: "10", title: "A verdade sobre day trade", engagement: "2.3%", likes: "420", type: "Reels", permalink: "https://instagram.com/p/mock10" },
  ],
  competitors: [],
}

/**
 * Busca métricas do dashboard no servidor
 * Executado em Server Component - zero JavaScript no cliente
 * 
 * CACHE: Dados cacheados por 5 minutos (300s)
 * Tags: ['dashboard', 'metrics', 'competitors', 'autem-posts']
 */
async function fetchDashboardMetricsInternal(): Promise<DashboardMetrics> {
  const dashboardMetrics: DashboardMetrics = { ...MOCK_METRICS }

  try {
    // Buscar métricas em paralelo: concorrentes + posts da Autem
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    
    const [competitorsResponse, autemPostsResponse] = await Promise.allSettled([
      fetch(`${baseUrl}/api/concorrentes/metrics`, {
        next: { revalidate: 300 },
      }),
      fetch(`${baseUrl}/api/autem/top-posts?limit=10`, {
        next: { revalidate: 300 },
      }),
    ])

    // Processar dados de concorrentes
    if (competitorsResponse.status === "fulfilled") {
      const competitorsResult = await competitorsResponse.value.json()
      if (competitorsResult.success && competitorsResult.data) {
        dashboardMetrics.contentPerformance = competitorsResult.data.contentPerformance
        dashboardMetrics.competitors = competitorsResult.data.competitors.slice(0, 4)
      }
    }

    // Processar posts reais da Autem
    let topPostsIsReal = false
    let topPostsError: string | undefined

    if (autemPostsResponse.status === "fulfilled") {
      const autemResult = await autemPostsResponse.value.json()
      if (autemResult.success && autemResult.data && autemResult.data.length > 0) {
        dashboardMetrics.topPosts = autemResult.data
        topPostsIsReal = true
      } else {
        topPostsError = autemResult.error || autemResult.message || "API retornou vazia"
      }
    } else {
      topPostsError = `Falha na requisição: ${autemPostsResponse.reason}`
    }

    dashboardMetrics._dataSource = {
      topPostsIsReal,
      topPostsError,
    }

    return dashboardMetrics
  } catch (error) {
    console.error("[Dashboard Server] Erro ao buscar métricas:", error)
    return {
      ...MOCK_METRICS,
      _dataSource: {
        topPostsIsReal: false,
        topPostsError: error instanceof Error ? error.message : "Erro desconhecido",
      },
    }
  }
}

/**
 * Versão cacheada das métricas do dashboard
 * Usa unstable_cache do Next.js para persistir entre requests
 */
const getCachedDashboardMetricsInternal = unstable_cache(
  fetchDashboardMetricsInternal,
  ["dashboard-metrics"],
  {
    revalidate: 300, // 5 minutos
    tags: ["dashboard", "metrics", "competitors", "autem-posts"],
  }
)

/**
 * Exporta função pública que usa cache
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return getCachedDashboardMetricsInternal()
}
