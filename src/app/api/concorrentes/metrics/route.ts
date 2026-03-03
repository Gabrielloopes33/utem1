/**
 * API Route: GET /api/concorrentes/metrics
 * Retorna métricas agregadas de todos os concorrentes para a dashboard
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Buscar todos os concorrentes
    const { data: competitors, error } = await supabase
      .from("competitor_data")
      .select("*")
      .order("followers_count", { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar concorrentes: ${error.message}`);
    }

    if (!competitors || competitors.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "Nenhum concorrente cadastrado",
      });
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

    return NextResponse.json({
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
      },
    });
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
