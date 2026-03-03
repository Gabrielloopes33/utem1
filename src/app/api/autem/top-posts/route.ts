/**
 * API Route: GET /api/autem/top-posts
 * Retorna os posts com maior engajamento da @autem.inv
 * Busca do Supabase (cache) ou do Apify Storage (sem executar actor)
 */

import { NextResponse } from "next/server";
import { getAutemPostsFromStorage } from "@/lib/apify/autem-storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    console.log(`[API] Buscando top ${limit} posts da @autem.inv...`);
    console.log(`[API] Prioridade: 1) Supabase cache 2) Apify Storage`);

    // Buscar posts (do cache Supabase ou do Apify storage)
    const posts = await getAutemPostsFromStorage({ limit: limit * 2 }); // Pega mais para ordenar

    console.log(`[API] ${posts.length} posts obtidos`);

    if (posts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum post encontrado",
          hint: "Verifique se há datasets no Apify com dados da @autem.inv",
        },
        { status: 404 }
      );
    }

    // Ordenar por engajamento e pegar os top N
    const topPosts = posts
      .sort((a, b) => b.engagement_rate - a.engagement_rate)
      .slice(0, limit)
      .map((post) => {
        // Extrair título da caption (primeira linha ou primeiros 60 caracteres)
        const caption = post.caption || "";
        const firstLine = caption.split("\n")[0].trim();
        const title = firstLine.length > 60 
          ? firstLine.substring(0, 60) + "..." 
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

    console.log(`[API] ${topPosts.length} posts formatados retornados`);

    return NextResponse.json({
      success: true,
      data: topPosts,
      source: "storage",
    });
  } catch (error) {
    console.error("[API] Erro ao buscar top posts:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        hint: "Verifique se o APIFY_API_TOKEN está configurado e se existem datasets no Apify",
      },
      { status: 500 }
    );
  }
}
