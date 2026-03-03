/**
 * API Route: GET /api/autem/top-posts
 * Retorna os posts com maior engajamento da @autem.inv
 * Faz scraping via Apify se não tiver dados em cache
 */

import { NextResponse } from "next/server";
import { getAutemPosts, getAutemMetrics } from "@/lib/apify/autem";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");
    const forceRefresh = searchParams.get("refresh") === "true";

    console.log(`[API] Buscando top ${limit} posts da @autem.inv...`);

    // Buscar posts (com scraping automático se necessário)
    const posts = await getAutemPosts({ limit: 50, forceRefresh });

    // Ordenar por engajamento e pegar os top N
    const topPosts = posts
      .sort((a, b) => b.engagement_rate - a.engagement_rate)
      .slice(0, limit)
      .map((post) => {
        // Extrair título da caption (primeira linha ou primeiros 50 caracteres)
        const caption = post.caption || "";
        const firstLine = caption.split("\n")[0].trim();
        const title = firstLine.length > 50 
          ? firstLine.substring(0, 50) + "..." 
          : firstLine || "Sem legenda";

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
          video: "Vídeo",
        };

        return {
          id: post.id || post.external_id,
          title,
          engagement: (post.engagement_rate || 0).toFixed(1) + "%",
          likes,
          type: typeMap[post.media_type] || post.media_type,
          thumbnailUrl: post.thumbnail_url,
          permalink: post.permalink,
          timestamp: post.timestamp,
        };
      });

    console.log(`[API] ${topPosts.length} posts retornados`);

    return NextResponse.json({
      success: true,
      data: topPosts,
    });
  } catch (error) {
    console.error("[API] Erro ao buscar top posts:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        hint: "Verifique se o APIFY_API_TOKEN está configurado",
      },
      { status: 500 }
    );
  }
}
