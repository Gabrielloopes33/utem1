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
        fetch("/api/autem/top-posts?limit=5"),
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
      if (autemPostsResponse.status === "fulfilled") {
        const autemResult = await autemPostsResponse.value.json();
        if (autemResult.success && autemResult.data && autemResult.data.length > 0) {
          console.log(`[Dashboard] ${autemResult.data.length} posts reais da Autem carregados`);
          dashboardMetrics.topPosts = autemResult.data;
        } else {
          console.log("[Dashboard] Usando posts mockados da Autem (nenhum post real encontrado)");
        }
      } else {
        console.log("[Dashboard] Erro ao buscar posts da Autem, usando mockados");
      }

      setMetrics(dashboardMetrics);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar métricas";
      setError(message);
      console.error("Erro ao buscar métricas da dashboard:", err);

      // Usar mock como fallback
      setMetrics(MOCK_METRICS);
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
