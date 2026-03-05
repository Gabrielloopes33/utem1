"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Users,
  RefreshCw,
  Instagram,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Film,
  Layers,
  ExternalLink,
  AlertCircle,
  Search,
  BarChart3,
  Eye,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { AgentLoadingAnimation } from "../../../../components/shared/agent-loading-animation";
import { createClient } from "../../../../lib/supabase/client";
import { toast } from "sonner";
import { COMPETITORS } from "../../../../constants/competitors";

// Formata número para exibição (1.2K, 1.5M, etc)
function formatNumber(num: number | null | undefined): string {
  const n = num ?? 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// Gradientes únicos baseados no nome do perfil
const AVATAR_GRADIENTS = [
  "from-pink-500 to-rose-500",
  "from-purple-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-red-500 to-orange-500",
  "from-violet-500 to-purple-500",
  "from-fuchsia-500 to-pink-500",
] as const;

// Gera um gradiente determinístico baseado no nome
function getGradientForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

// Componente de avatar de perfil com tratamento de erro
function ProfileAvatar({ url, name, size = "md" }: { url?: string; name: string; size?: "sm" | "md" | "lg" }) {
  const [error, setError] = useState(false)
  
  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-16 w-16 text-xl",
    lg: "h-20 w-20 text-2xl",
  }
  
  // Extrair iniciais do nome (primeira letra de cada palavra, máx 2)
  const initials = name
    .split(" ")
    .map(n => n.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase()
  
  // Gradient único para este perfil
  const gradient = getGradientForName(name)
  
  // Verificar se URL é válida (não vazia, não null, não undefined)
  const hasValidUrl = url && url.trim().length > 0 && url.startsWith('http');
  
  // Tentar usar imagem via proxy
  const proxyUrl = hasValidUrl ? `https://images.weserv.nl/?url=${encodeURIComponent(url!)}&w=200&h=200&fit=cover` : null
  
  // Se não tem URL ou deu erro, mostrar avatar com iniciais
  if (!hasValidUrl || error) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/20`}
        title={name}
      >
        <span className="text-white font-bold drop-shadow-md">{initials}</span>
      </div>
    )
  }

  // Mapear tamanhos para dimensões numéricas
  const sizeDimensions = {
    sm: 40,
    md: 64,
    lg: 80,
  }

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg ring-2 ring-white/20 relative`}>
      <Image 
        src={proxyUrl!}
        alt={name}
        width={sizeDimensions[size]}
        height={sizeDimensions[size]}
        className="object-cover"
        loading="lazy"
        onError={() => setError(true)}
        unoptimized
      />
    </div>
  )
}

// Componente de thumbnail de post
function PostThumbnail({ url, caption, type }: { url?: string; caption: string; type: string }) {
  const [error, setError] = useState(false)
  
  // Extrair primeira letra da caption para fallback
  const initial = caption ? caption.charAt(0).toUpperCase() : "?"
  
  // Gradientes mais bonitos baseados no tipo de conteúdo
  const typeGradients: Record<string, string> = {
    "carousel": "from-blue-500 via-indigo-500 to-purple-600",
    "reel": "from-purple-500 via-pink-500 to-rose-500",
    "image": "from-emerald-500 via-teal-500 to-cyan-600",
    "video": "from-orange-500 via-amber-500 to-yellow-500",
  }
  const gradient = typeGradients[type] || "from-pink-500 via-purple-500 to-indigo-600"
  
  // Ícones por tipo
  const typeIcons: Record<string, React.ReactNode> = {
    "carousel": (
      <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    "reel": (
      <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    "image": (
      <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    "video": (
      <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  }
  
  // Verificar se URL é válida
  const hasValidUrl = url && url.trim().length > 0 && url.startsWith('http');
  
  // Tentar usar imagem via proxy
  const proxyUrl = hasValidUrl ? `https://images.weserv.nl/?url=${encodeURIComponent(url!)}&w=400&h=400&fit=cover` : null
  
  if (!hasValidUrl || error) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
        {typeIcons[type] || typeIcons["image"]}
        <span className="text-white/90 font-bold text-2xl drop-shadow-lg">{initial}</span>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <Image 
        src={proxyUrl!}
        alt={caption}
        fill
        className="object-cover transition-all duration-300 group-hover:scale-105"
        loading="lazy"
        onError={() => setError(true)}
        unoptimized
      />
    </div>
  )
}

// Formata data relativa
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffHours < 1) return "Agora";
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  return date.toLocaleDateString("pt-BR");
}

interface Competitor {
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

interface CompetitorPost {
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

export default function ConcorrentesPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<CompetitorPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fetchStatus, setFetchStatus] = useState<string>("");

  const supabase = createClient();

  // Verificar se o cache está desatualizado (mais de 24h)
  const isCacheStale = (lastScrapedAt: string): boolean => {
    const lastScraped = new Date(lastScrapedAt);
    const now = new Date();
    const diffHours = (now.getTime() - lastScraped.getTime()) / (1000 * 60 * 60);
    return diffHours > 24;
  };

  // Buscar foto de perfil via API do Apify diretamente
  const fetchProfilePicFromApify = useCallback(async (handle: string): Promise<string | null> => {
    try {
      console.log(`[ProfilePic] Buscando foto fresca do Apify para @${handle}...`);
      
      const response = await fetch(`/api/concorrentes/${handle}/profile-pic`);
      console.log(`[ProfilePic] Status da API: ${response.status}`);
      
      const result = await response.json();
      console.log(`[ProfilePic] Resposta da API:`, result);
      
      if (result.success && result.profilePicUrl) {
        console.log(`[ProfilePic] Foto encontrada via API: ${result.profilePicUrl.substring(0, 50)}...`);
        return result.profilePicUrl;
      }
      
      console.log(`[ProfilePic] API não retornou foto. success=${result.success}, url=${result.profilePicUrl}`);
      return null;
    } catch (err) {
      console.error("[ProfilePic] Erro ao buscar foto da API:", err);
      return null;
    }
  }, []);

  // Buscar foto de perfil dos posts (fallback quando a URL principal expirou)
  const fetchProfilePicFromPosts = useCallback(async (competitorId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("competitor_posts")
        .select("apify_data")
        .eq("competitor_id", competitorId)
        .order("timestamp", { ascending: false })
        .limit(10)
        .not("apify_data", "is", null);

      if (error || !data || data.length === 0) {
        console.log(`[ProfilePic] Nenhum post encontrado para ${competitorId}`);
        return null;
      }

      console.log(`[ProfilePic] Buscando foto em ${data.length} posts...`);
      
      // Log da estrutura do primeiro post para debug
      if (data.length > 0) {
        const firstPost = data[0].apify_data as Record<string, unknown> | null;
        console.log(`[ProfilePic] Estrutura do primeiro post:`, 
          firstPost ? Object.keys(firstPost).join(', ') : 'null'
        );
        if (firstPost) {
          console.log(`[ProfilePic] ownerProfilePicUrl no primeiro post:`, firstPost.ownerProfilePicUrl);
        }
      }

      // Procurar por vários campos possíveis nos posts
      const possibleFields = [
        'ownerProfilePicUrl',
        'profilePicUrl', 
        'owner_profile_pic_url',
        'profile_pic_url',
        'ownerProfile.profilePicUrl'
      ];

      for (const post of data) {
        const apifyData = post.apify_data as Record<string, unknown> | null;
        if (apifyData) {
          // Verificar campos diretos
          for (const field of possibleFields) {
            const picUrl = apifyData[field] as string | undefined;
            if (picUrl && picUrl.startsWith('http') && picUrl.includes('instagram')) {
              console.log(`[ProfilePic] Encontrada foto no campo ${field}: ${picUrl.substring(0, 50)}...`);
              return picUrl;
            }
          }
          
          // Verificar no campo owner (pode ser um objeto aninhado)
          const owner = apifyData.owner as Record<string, unknown> | undefined;
          if (owner?.profilePicUrl) {
            const picUrl = owner.profilePicUrl as string;
            if (picUrl.startsWith('http')) {
              console.log(`[ProfilePic] Encontrada foto no owner.profilePicUrl: ${picUrl.substring(0, 50)}...`);
              return picUrl;
            }
          }
        }
      }
      
      console.log(`[ProfilePic] Nenhuma foto encontrada nos posts`);
      return null;
    } catch (err) {
      console.error("[ProfilePic] Erro ao buscar foto dos posts:", err);
      return null;
    }
  }, [supabase]);

  // Buscar posts de um concorrente
  const fetchCompetitorPosts = useCallback(async (competitorId: string) => {
    try {
      const { data, error } = await supabase
        .from("competitor_posts")
        .select("*")
        .eq("competitor_id", competitorId)
        .order("timestamp", { ascending: false })
        .limit(12);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
      return [];
    }
  }, [supabase]);

  // Buscar os 4 concorrentes principais do Supabase
  const fetchMainCompetitors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar apenas os 4 handles principais
      const handles = COMPETITORS.map(c => c.handle.toLowerCase());

      const { data, error: dbError } = await supabase
        .from("competitor_data")
        .select("*")
        .in("handle", handles)
        .order("followers_count", { ascending: false });

      if (dbError) {
        throw new Error(`Erro ao buscar concorrentes: ${dbError.message}`);
      }

      // DEBUG: Log dos dados crus
      console.log("[DEBUG] Dados crus do banco:", data?.map(c => ({ 
        handle: c.handle, 
        profile_pic_url: c.profile_pic_url,
        has_apify_data: !!c.apify_data
      })));

      // Marcar se o cache está desatualizado e preencher campos faltantes via apify_data
      const competitorsWithStale = (data || []).map(c => {
        const apify = (c.apify_data ?? {}) as Record<string, unknown>;
        const mergedProfilePic = c.profile_pic_url ?? (apify.profilePicUrl as string | undefined);
        
        console.log(`[DEBUG] ${c.handle}:`, {
          profile_pic_url: c.profile_pic_url,
          apify_profilePicUrl: apify.profilePicUrl,
          merged: mergedProfilePic
        });
        
        return {
          ...c,
          profile_pic_url: mergedProfilePic,
          biography: c.biography ?? (apify.biography as string | undefined),
          avg_likes: c.avg_likes ?? 0,
          avg_comments: c.avg_comments ?? 0,
          content_breakdown: c.content_breakdown ?? { carousel: 0, reels: 0, image: 0 },
          isStale: isCacheStale(c.last_scraped_at),
        };
      });

      // Buscar fotos de perfil alternativas dos posts ou API para concorrentes sem foto
      const enrichedCompetitors = await Promise.all(
        competitorsWithStale.map(async (c) => {
          // Se já tem foto válida, retorna como está
          if (c.profile_pic_url && c.profile_pic_url.startsWith('http')) {
            console.log(`[DEBUG] ${c.handle}: Já tem foto válida`);
            return c;
          }
          
          console.log(`[DEBUG] ${c.handle}: Sem foto no banco, tentando posts...`);
          // Tenta buscar foto dos posts
          const picFromPosts = await fetchProfilePicFromPosts(c.id);
          if (picFromPosts) {
            console.log(`[DEBUG] ${c.handle}: Foto encontrada nos posts!`);
            return { ...c, profile_pic_url: picFromPosts };
          }
          
          console.log(`[DEBUG] ${c.handle}: Não achou nos posts, tentando API Apify...`);
          // Tenta buscar foto direto do Apify
          const picFromApi = await fetchProfilePicFromApify(c.handle);
          if (picFromApi) {
            console.log(`[DEBUG] ${c.handle}: Foto encontrada via API!`);
            return { ...c, profile_pic_url: picFromApi };
          }
          
          console.log(`[DEBUG] ${c.handle}: Nenhuma foto encontrada em lugar nenhum`);
          return c;
        })
      );

      setCompetitors(enrichedCompetitors);

      // Se não encontrou nenhum, buscar automaticamente do Apify
      if (!data || data.length === 0) {
        // Buscar automaticamente
        await fetchFromApifyInternal();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("Erro ao buscar concorrentes:", err);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, fetchProfilePicFromPosts, fetchProfilePicFromApify]);

  // Buscar do Apify (versão interna para evitar dependência circular)
  const fetchFromApifyInternal = async () => {
    try {
      setIsAutoFetching(true);
      setFetchStatus("Iniciando busca dos concorrentes...");

      const response = await fetch("/api/concorrentes/setup");
      const result = await response.json();

      if (!result.success && result.errors?.length === 4) {
        throw new Error("Não foi possível buscar os concorrentes");
      }

      // Mostrar status de cada um
      result.results.forEach((r: { name: string; status: string }) => {
        if (r.status === "success") {
          setFetchStatus(`✓ ${r.name} carregado`);
        }
      });

      // Recarregar dados do Supabase
      setFetchStatus("Finalizando...");
      
      // Buscar dados atualizados
      const handles = COMPETITORS.map(c => c.handle.toLowerCase());
      const { data } = await supabase
        .from("competitor_data")
        .select("*")
        .in("handle", handles)
        .order("followers_count", { ascending: false });

      if (data) {
        const competitorsWithStale = data.map(c => ({
          ...c,
          isStale: isCacheStale(c.last_scraped_at),
        }));
        setCompetitors(competitorsWithStale);
      }
      
      toast.success("Concorrentes carregados com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar dados";
      setError(message);
      toast.error("Erro ao carregar concorrentes", { description: message });
    } finally {
      setIsAutoFetching(false);
      setFetchStatus("");
    }
  };

  // Atualizar um concorrente específico
  const refreshCompetitor = async (handle: string) => {
    try {
      setIsRefreshing(true);
      toast.info(`Atualizando @${handle}...`);

      // Primeiro tentar buscar só a foto
      const picResponse = await fetch(`/api/concorrentes/${handle}/profile-pic`);
      const picResult = await picResponse.json();
      
      if (picResult.success && picResult.profilePicUrl) {
        // Atualizar no Supabase
        const { error: updateError } = await supabase
          .from("competitor_data")
          .update({ profile_pic_url: picResult.profilePicUrl })
          .eq("handle", handle.toLowerCase());
        
        if (updateError) {
          console.error("Erro ao salvar foto:", updateError);
        } else {
          console.log(`[Refresh] Foto atualizada para @${handle}`);
        }
      }

      // Depois fazer o refresh completo
      const response = await fetch(`/api/concorrentes/${handle}?refresh=true`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(`@${handle} atualizado!`);
      await fetchMainCompetitors();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao atualizar", { description: message });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Selecionar concorrente e mostrar detalhes
  const selectCompetitor = async (competitor: Competitor) => {
    setSelectedCompetitor(competitor);
    setIsLoadingDetail(true);

    const competitorPosts = await fetchCompetitorPosts(competitor.id);
    setSelectedPosts(competitorPosts);

    // Tentar buscar foto de perfil dos posts se não tiver
    if (!competitor.profile_pic_url || !competitor.profile_pic_url.startsWith('http')) {
      const picFromPosts = await fetchProfilePicFromPosts(competitor.id);
      if (picFromPosts) {
        // Atualizar o competidor na lista com a nova foto
        setCompetitors(prev => prev.map(c => 
          c.id === competitor.id ? { ...c, profile_pic_url: picFromPosts } : c
        ));
        // Atualizar o competidor selecionado também
        setSelectedCompetitor(prev => prev ? { ...prev, profile_pic_url: picFromPosts } : null);
      }
    }

    setIsLoadingDetail(false);
  };

  // Filtrar concorrentes pela busca
  const filteredCompetitors = competitors.filter(
    (c) =>
      c.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular métricas agregadas
  const metrics = {
    totalFollowers: competitors.reduce((sum, c) => sum + c.followers_count, 0),
    avgEngagement: competitors.length > 0
      ? competitors.reduce((sum, c) => sum + c.engagement_rate, 0) / competitors.length
      : 0,
    totalPosts: competitors.reduce((sum, c) => sum + c.posts_count, 0),
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchMainCompetitors();
  }, [fetchMainCompetitors]);

  // Tela de loading inicial ou auto-fetch
  if (isLoading || isAutoFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Users className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-accent-500/30 animate-ping" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">
            {isAutoFetching ? "Buscando concorrentes" : "Carregando dados"}
          </h2>
          <p className="text-muted-foreground">
            {isAutoFetching 
              ? fetchStatus || "Buscando dados do Instagram..."
              : "Aguarde um momento..."
            }
          </p>
        </div>

        {isAutoFetching && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-accent-500" />
            <span className="text-sm text-muted-foreground">Processando...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Análise de Concorrentes</h1>
            <p className="text-sm text-muted-foreground">
              Os 4 principais concorrentes do mercado
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              console.log("=== DIAGNÓSTICO DE CONCORRENTES ===");
              competitors.forEach(c => {
                console.log(`\n@${c.handle}:`, {
                  profile_pic_url: c.profile_pic_url,
                  has_profile_pic: !!c.profile_pic_url,
                  name: c.name,
                  id: c.id,
                });
              });
              console.log("===================================");
            }}
          >
            🔍 Debug
          </Button>
          <Button
            variant="outline"
            onClick={fetchMainCompetitors}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Gerais */}
      {competitors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Seguidores Totais</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(metrics.totalFollowers)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Engajamento Médio</span>
              </div>
              <p className="text-2xl font-bold">{metrics.avgEngagement.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Instagram className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total de Posts</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(metrics.totalPosts)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 bg-muted/50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-muted-foreground max-w-md text-center">{error}</p>
          <Button onClick={fetchFromApifyInternal} disabled={isAutoFetching}>
            {isAutoFetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Lista de Concorrentes */}
      {competitors.length > 0 && (
        <div className="space-y-4">
          {/* Busca */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar concorrente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Grid dos 4 Concorrentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCompetitors.map((competitor) => (
              <Card
                key={competitor.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => selectCompetitor(competitor)}
              >
                {/* Header com foto e info básica */}
                <div className="p-6 border-b bg-gradient-to-r from-muted/50 to-transparent">
                  <div className="flex items-start gap-4">
                    {/* Avatar grande */}
                    <ProfileAvatar url={competitor.profile_pic_url} name={competitor.name} size="lg" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold truncate">@{competitor.handle}</h3>
                        {competitor.isStale && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatRelativeDate(competitor.last_scraped_at)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{competitor.name}</p>
                      
                      {competitor.biography && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {competitor.biography}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshCompetitor(competitor.handle);
                      }}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-4 gap-4 p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatNumber(competitor.followers_count)}</p>
                    <p className="text-xs text-muted-foreground">Seguidores</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent-500">{(competitor.engagement_rate ?? 0).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Engajamento</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatNumber(competitor.avg_likes)}</p>
                    <p className="text-xs text-muted-foreground">Média Likes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{competitor.posts_count}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                </div>

                {/* Breakdown de conteúdo */}
                <div className="px-6 pb-6">
                  <div className="flex gap-2 flex-wrap">
                    {competitor.content_breakdown?.carousel > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Layers className="h-3 w-3" />
                        {competitor.content_breakdown.carousel} Carrosséis
                      </Badge>
                    )}
                    {competitor.content_breakdown?.reels > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Film className="h-3 w-3" />
                        {competitor.content_breakdown.reels} Reels
                      </Badge>
                    )}
                    {competitor.content_breakdown?.image > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {competitor.content_breakdown.image} Imagens
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedCompetitor} onOpenChange={(open) => !open && setSelectedCompetitor(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedCompetitor && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <ProfileAvatar url={selectedCompetitor.profile_pic_url} name={selectedCompetitor.name} size="md" />
                    <div>
                      <DialogTitle className="text-xl">@{selectedCompetitor.handle}</DialogTitle>
                      <p className="text-muted-foreground">{selectedCompetitor.name}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshCompetitor(selectedCompetitor.handle)}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    Atualizar
                  </Button>
                </div>
              </DialogHeader>

              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <AgentLoadingAnimation />
                </div>
              ) : (
                <div className="space-y-6 mt-4">
                  {/* Métricas detalhadas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{formatNumber(selectedCompetitor.followers_count)}</p>
                        <p className="text-xs text-muted-foreground">Seguidores</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-5 w-5 mx-auto mb-2 text-accent-500" />
                        <p className="text-2xl font-bold text-accent-500">{(selectedCompetitor.engagement_rate ?? 0).toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Engajamento</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Heart className="h-5 w-5 mx-auto mb-2 text-red-500" />
                        <p className="text-2xl font-bold">{formatNumber(selectedCompetitor.avg_likes)}</p>
                        <p className="text-xs text-muted-foreground">Média Likes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <MessageCircle className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{formatNumber(selectedCompetitor.avg_comments)}</p>
                        <p className="text-xs text-muted-foreground">Média Comentários</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Posts Recentes */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Instagram className="h-5 w-5" />
                      Posts Recentes ({selectedPosts.length})
                    </h3>
                    
                    {selectedPosts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum post encontrado
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedPosts.map((post) => (
                          <a
                            key={post.id}
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block rounded-xl overflow-hidden border hover:shadow-md transition-all"
                          >
                            {/* Thumbnail */}
                            <div className="aspect-square bg-muted relative overflow-hidden">
                              <PostThumbnail url={post.thumbnail_url} caption={post.caption} type={post.media_type} />
                              
                              {/* Badge do tipo */}
                              <Badge className="absolute top-2 left-2 bg-black/70 text-white border-0">
                                {post.media_type === "carousel" && <Layers className="h-3 w-3 mr-1" />}
                                {post.media_type === "reel" && <Film className="h-3 w-3 mr-1" />}
                                {post.media_type === "image" && <ImageIcon className="h-3 w-3 mr-1" />}
                                {post.media_type}
                              </Badge>
                            </div>

                            {/* Info do post */}
                            <div className="p-3">
                              <p className="text-sm line-clamp-2 mb-2 text-muted-foreground">
                                {post.caption || "Sem legenda"}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3 text-red-500" />
                                    {formatNumber(post.likes)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3 text-blue-500" />
                                    {formatNumber(post.comments)}
                                  </span>
                                </div>
                                <span>{formatRelativeDate(post.timestamp)}</span>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Link externo */}
                  <div className="flex justify-center">
                    <a
                      href={selectedCompetitor.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Ver perfil no Instagram
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
