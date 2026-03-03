"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface Competitor {
  id: string;
  handle: string;
  name: string;
  platform: string;
  profile_url: string;
  profile_pic_url?: string;
  biography?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  engagement_rate: number;
  posts_per_month: number;
  avg_likes: number;
  avg_comments: number;
  content_breakdown: {
    carousel: number;
    reels: number;
    image: number;
  };
  last_scraped_at: string;
  isStale: boolean;
}

export interface CompetitorPost {
  id: string;
  external_id: string;
  caption: string;
  likes: number;
  comments: number;
  media_type: "carousel" | "reel" | "image";
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
  engagement_rate: number;
}

export interface CompetitorMetrics {
  summary: {
    totalCompetitors: number;
    totalFollowers: number;
    avgEngagement: number;
    totalPostsAnalyzed: number;
  };
  contentPerformance: Array<{
    type: string;
    value: number;
    color: string;
  }>;
  competitors: Array<{
    id: string;
    handle: string;
    name: string;
    followers: number;
    engagement: number;
    postsCount: number;
    profilePicUrl?: string;
    isStale: boolean;
  }>;
}

interface UseCompetitorsReturn {
  // Lista de concorrentes
  competitors: Competitor[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  // Métricas agregadas
  metrics: CompetitorMetrics | null;
  isLoadingMetrics: boolean;

  // Concorrente específico
  selectedCompetitor: Competitor | null;
  selectedPosts: CompetitorPost[];
  isLoadingDetail: boolean;
  selectCompetitor: (handle: string) => Promise<void>;
  refreshCompetitor: (handle: string) => Promise<void>;
  clearSelection: () => void;

  // Ações
  addCompetitor: (handle: string) => Promise<void>;
}

export function useCompetitors(): UseCompetitorsReturn {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<CompetitorMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<CompetitorPost[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Buscar lista de concorrentes
  const fetchCompetitors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/concorrentes");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro ao buscar concorrentes");
      }

      setCompetitors(result.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("Erro ao buscar concorrentes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar métricas agregadas
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoadingMetrics(true);

      const response = await fetch("/api/concorrentes/metrics");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro ao buscar métricas");
      }

      setMetrics(result.data);
    } catch (err) {
      console.error("Erro ao buscar métricas:", err);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  // Buscar detalhes de um concorrente específico
  const selectCompetitor = useCallback(async (handle: string) => {
    try {
      setIsLoadingDetail(true);

      const response = await fetch(`/api/concorrentes/${handle}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro ao buscar concorrente");
      }

      setSelectedCompetitor(result.data.competitor);
      setSelectedPosts(result.data.posts || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao buscar concorrente", { description: message });
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setSelectedCompetitor(null);
    setSelectedPosts([]);
  }, []);

  // Forçar refresh de um concorrente
  const refreshCompetitor = useCallback(async (handle: string) => {
    try {
      setIsLoadingDetail(true);
      toast.info("Atualizando dados...", { description: `Buscando dados atualizados de @${handle}` });

      const response = await fetch(`/api/concorrentes/${handle}?refresh=true`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro ao atualizar concorrente");
      }

      setSelectedCompetitor(result.data.competitor);
      setSelectedPosts(result.data.posts || []);

      toast.success("Dados atualizados!", { description: `@${handle} foi atualizado com sucesso` });

      // Recarregar lista e métricas
      await fetchCompetitors();
      await fetchMetrics();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao atualizar", { description: message });
    } finally {
      setIsLoadingDetail(false);
    }
  }, [fetchCompetitors, fetchMetrics]);

  // Adicionar novo concorrente
  const addCompetitor = useCallback(async (handle: string) => {
    try {
      const cleanHandle = handle.replace("@", "").trim();

      toast.info("Adicionando concorrente...", { description: `Buscando @${cleanHandle}` });

      const response = await fetch(`/api/concorrentes/${cleanHandle}?refresh=true`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro ao adicionar concorrente");
      }

      toast.success("Concorrente adicionado!", { description: `@${cleanHandle} foi adicionado com sucesso` });

      // Recarregar dados
      await fetchCompetitors();
      await fetchMetrics();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao adicionar concorrente", { description: message });
      throw err;
    }
  }, [fetchCompetitors, fetchMetrics]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchCompetitors();
    fetchMetrics();
  }, [fetchCompetitors, fetchMetrics]);

  return {
    competitors,
    isLoading,
    error,
    refresh: fetchCompetitors,

    metrics,
    isLoadingMetrics,

    selectedCompetitor,
    selectedPosts,
    isLoadingDetail,
    selectCompetitor,
    refreshCompetitor,
    clearSelection,

    addCompetitor,
  };
}
