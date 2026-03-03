/**
 * API Route: GET /api/autem/posts
 * Retorna posts da conta oficial @autem.inv
 */

import { NextResponse } from "next/server";
import { getAutemPosts, getAutemMetrics } from "@/lib/apify/autem";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const forceRefresh = searchParams.get("refresh") === "true";

    console.log("[API] Buscando posts da @autem.inv...");

    // Buscar posts e métricas
    const [posts, metrics] = await Promise.all([
      getAutemPosts({ limit, forceRefresh }),
      getAutemMetrics(),
    ]);

    console.log(`[API] ${posts.length} posts encontrados`);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        metrics: {
          totalPosts: posts.length,
          avgEngagement: metrics.avgEngagement,
          avgLikes: metrics.avgLikes,
          avgComments: metrics.avgComments,
        },
      },
    });
  } catch (error) {
    console.error("[API] Erro ao buscar posts da Autem:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        hint: "Verifique se a tabela autem_posts existe e se o APIFY_API_TOKEN está configurado",
      },
      { status: 500 }
    );
  }
}
