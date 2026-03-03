/**
 * API Route: GET /api/autem/top-posts
 * Retorna os posts com maior engajamento da @autem.inv
 */

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    const supabase = createServiceClient();

    console.log(`[API] Buscando top ${limit} posts da @autem.inv...`);

    // Buscar posts ordenados por engajamento
    const { data: posts, error } = await supabase
      .from("autem_posts")
      .select("*")
      .order("engagement_rate", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar posts: ${error.message}`);
    }

    // Formatar resposta para o dashboard
    const topPosts = (posts || []).map((post) => {
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
        id: post.id,
        title,
        engagement: (post.engagement_rate || 0).toFixed(1) + "%",
        likes,
        type: typeMap[post.media_type] || post.media_type,
        thumbnailUrl: post.thumbnail_url,
        permalink: post.permalink,
        timestamp: post.timestamp,
        caption: post.caption,
      };
    });

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
        hint: "Verifique se a tabela autem_posts existe no Supabase",
      },
      { status: 500 }
    );
  }
}
