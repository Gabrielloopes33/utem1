"use client";

import { useState, useEffect, useCallback } from "react";

export interface DashboardMetrics {
  // Métricas do Instagram
  instagram: {
    followers: number;
    followers_change: number;
    likes: number;
    likes_change: number;
    views: number;
    views_change: number;
    engagement: number;
    engagement_change: number;
  };

  // Performance por tipo de conteúdo
  contentPerformance: Array<{
    type: string;
    value: number;
    color: string;
  }>;

  // Top posts
  topPosts: Array<{
    id: string;
    title: string;
    engagement: string;
    likes: string;
    type: string;
    thumbnailUrl?: string;
    permalink?: string;
  }>;

  // Concorrentes
  competitors: Array<{
    id: string;
    handle: string;
    name: string;
    followers: number;
    engagement: number;
    profilePicUrl?: string;
  }>;

  // Flags para indicar origem dos dados
  _dataSource?: {
    topPostsIsReal: boolean;
    topPostsError?: string;
  };
}

interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Dados mockados como fallback (enquanto não temos a conta da Autem no Apify)
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
};

export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar métricas em paralelo: concorrentes + posts da Autem
      const [competitorsResponse, autemPostsResponse] = await Promise.allSettled([
        fetch("/api/concorrentes/metrics"),
        fetch("/api/autem/top-posts?limit=10"),
      ]);

      const dashboardMetrics: DashboardMetrics = { ...MOCK_METRICS };

      // Processar dados de concorrentes
      if (competitorsResponse.status === "fulfilled") {
        const competitorsResult = await competitorsResponse.value.json();
        if (competitorsResult.success && competitorsResult.data) {
          dashboardMetrics.contentPerformance = competitorsResult.data.contentPerformance;
          dashboardMetrics.competitors = competitorsResult.data.competitors.slice(0, 4);
        }
      }

      // Processar posts reais da Autem
      let topPostsIsReal = false;
      let topPostsError: string | undefined;
      
      if (autemPostsResponse.status === "fulfilled") {
        const autemResult = await autemPostsResponse.value.json();
        console.log("[Dashboard] Resposta da API autem/top-posts:", autemResult);
        
        if (autemResult.success && autemResult.data && autemResult.data.length > 0) {
          console.log(`[Dashboard] ${autemResult.data.length} posts REAIS da Autem carregados`);
          dashboardMetrics.topPosts = autemResult.data;
          topPostsIsReal = true;
        } else {
          console.warn("[Dashboard] API retornou sucesso mas sem dados:", autemResult);
          topPostsError = autemResult.error || autemResult.message || "API retornou vazia";
        }
      } else {
        console.error("[Dashboard] Erro na requisição para autem/top-posts:", autemPostsResponse.reason);
        topPostsError = `Falha na requisição: ${autemPostsResponse.reason}`;
      }
      
      // Adicionar metadata sobre a origem dos dados
      dashboardMetrics._dataSource = {
        topPostsIsReal,
        topPostsError,
      };

      setMetrics(dashboardMetrics);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar métricas";
      setError(message);
      console.error("[Dashboard] Erro ao buscar métricas:", err);

      // Usar mock como fallback, mas indicar que é simulado devido a erro
      const fallbackMetrics: DashboardMetrics = {
        ...MOCK_METRICS,
        _dataSource: {
          topPostsIsReal: false,
          topPostsError: `Erro: ${message}`,
        },
      };
      setMetrics(fallbackMetrics);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics,
  };
}
