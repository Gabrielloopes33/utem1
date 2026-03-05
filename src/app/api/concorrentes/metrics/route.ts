/**
 * API Route: GET /api/concorrentes/metrics
 * Retorna métricas agregadas de todos os concorrentes para a dashboard
 * 
 * CACHE: 5 minutos via unstable_cache
 */

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";

// Função interna que busca os dados
async function fetchCompetitorMetrics() {
  try {
    const supabase = createServiceClient();

    // Buscar todos os concorrentes
    const { data: competitors, error } = await supabase
      .from("competitor_data")
      .select("*")
      .order("followers_count", { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar concorrentes: ${error.message}`);
    }

    if (!competitors || competitors.length === 0) {
      return {
        success: true,
        data: null,
        message: "Nenhum concorrente cadastrado",
      };
    }

    // Calcular métricas agregadas
    const totalFollowers = competitors.reduce((sum, c) => sum + (c.followers_count || 0), 0);
    const avgEngagement =
      competitors.reduce((sum, c) => sum + (c.engagement_rate || 0), 0) / competitors.length;

    // Calcular total de posts por tipo
    const contentBreakdown = {
      carousel: competitors.reduce((sum, c) => sum + (c.content_breakdown?.carousel || 0), 0),
      reels: competitors.reduce((sum, c) => sum + (c.content_breakdown?.reels || 0), 0),
      image: competitors.reduce((sum, c) => sum + (c.content_breakdown?.image || 0), 0),
    };

    const totalPostsAnalyzed = contentBreakdown.carousel + contentBreakdown.reels + contentBreakdown.image;

    // Calcular percentuais
    const contentPerformance = [
      {
        type: "Carrossel",
        value: totalPostsAnalyzed > 0 ? Math.round((contentBreakdown.carousel / totalPostsAnalyzed) * 100) : 0,
        color: "bg-accent-500",
      },
      {
        type: "Reels",
        value: totalPostsAnalyzed > 0 ? Math.round((contentBreakdown.reels / totalPostsAnalyzed) * 100) : 0,
        color: "bg-primary",
      },
      {
        type: "Cards",
        value: totalPostsAnalyzed > 0 ? Math.round((contentBreakdown.image / totalPostsAnalyzed) * 100) : 0,
        color: "bg-muted-foreground",
      },
    ];

    // Formatar dados dos concorrentes
    const formattedCompetitors = competitors.map((c) => ({
      id: c.id,
      handle: c.handle,
      name: c.name,
      followers: c.followers_count,
      engagement: c.engagement_rate,
      postsCount: c.posts_count,
      profilePicUrl: c.profile_pic_url,
      isStale: isCacheStale(c.last_scraped_at),
    }));

    // Buscar top posts dos concorrentes (mais engajados)
    const competitorIds = competitors.map(c => c.id);
    const { data: topPostsData, error: postsError } = await supabase
      .from("competitor_posts")
      .select("*")
      .in("competitor_id", competitorIds)
      .order("engagement_rate", { ascending: false })
      .limit(10);

    if (postsError) {
      console.error("[API] Erro ao buscar posts:", postsError);
    }

    // Formatar top posts
    const topPosts = (topPostsData || []).slice(0, 5).map((post) => {
      // Extrair um título a partir da caption
      const caption = post.caption || "";
      const title = caption.length > 50 
        ? caption.substring(0, 50) + "..." 
        : caption || "Sem legenda";
      
      // Formatar o engajamento
      const engagementValue = post.engagement_rate || 0;
      const engagement = engagementValue.toFixed(1) + "%";
      
      // Formatar likes
      const likesNum = post.likes || 0;
      const likes = likesNum >= 1000 
        ? (likesNum / 1000).toFixed(1) + "K" 
        : likesNum.toString();

      // Mapear tipo de mídia
      const typeMap: Record<string, string> = {
        carousel: "Carrossel",
        reel: "Reels",
        image: "Imagem",
      };

      return {
        id: post.id,
        title,
        engagement,
        likes,
        type: typeMap[post.media_type] || post.media_type,
        thumbnailUrl: post.thumbnail_url,
        permalink: post.permalink,
      };
    });

    return {
      success: true,
      data: {
        summary: {
          totalCompetitors: competitors.length,
          totalFollowers,
          avgEngagement: parseFloat(avgEngagement.toFixed(2)),
          totalPostsAnalyzed,
        },
        contentPerformance,
        competitors: formattedCompetitors,
        topPosts: topPosts.length > 0 ? topPosts : undefined,
      },
    };
  } catch (error) {
    console.error("[API] Erro ao buscar métricas:", error);
    throw error;
  }
}

// Cache de 5 minutos para métricas de concorrentes
const getCachedCompetitorMetrics = unstable_cache(
  fetchCompetitorMetrics,
  ["competitor-metrics"],
  {
    revalidate: 300, // 5 minutos
    tags: ["competitors", "metrics", "dashboard"],
  }
);

export async function GET() {
  try {
    const data = await getCachedCompetitorMetrics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Erro ao buscar métricas:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

/**
 * Verifica se o cache está desatualizado (> 24h)
 */
function isCacheStale(lastScrapedAt: string | null): boolean {
  if (!lastScrapedAt) return true;
  const lastScraped = new Date(lastScrapedAt);
  const now = new Date();
  const diffHours = (now.getTime() - lastScraped.getTime()) / (1000 * 60 * 60);
  return diffHours > 24;
}
