/**
 * API Route: POST /api/concorrentes/import
 * Importa dados existentes do Apify para o Supabase
 * Body: { datasetId: string, username: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { datasetId, username } = body;

    if (!datasetId || !username) {
      return NextResponse.json(
        { success: false, error: "datasetId e username são obrigatórios" },
        { status: 400 }
      );
    }

    if (!APIFY_TOKEN) {
      return NextResponse.json(
        { success: false, error: "APIFY_API_TOKEN não configurado" },
        { status: 500 }
      );
    }

    console.log(`[Import] Buscando dados do dataset ${datasetId} para @${username}`);

    // Buscar dados do dataset do Apify
    const response = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`,
      { method: "GET" }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao buscar dataset: ${response.status} - ${error}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, error: "Dataset vazio ou inválido" },
        { status: 400 }
      );
    }

    // Processar dados
    const profile = data[0];
    const posts = profile.latestPosts || [];

    console.log(`[Import] Perfil: ${profile.fullName || profile.username}, Posts: ${posts.length}`);

    // Calcular métricas
    const totalLikes = posts.reduce((sum: number, p: any) => sum + (p.likesCount || 0), 0);
    const totalComments = posts.reduce((sum: number, p: any) => sum + (p.commentsCount || 0), 0);
    const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
    const avgComments = posts.length > 0 ? Math.round(totalComments / posts.length) : 0;
    const engagementRate = profile.followersCount > 0 && posts.length > 0
      ? ((totalLikes + totalComments) / posts.length / profile.followersCount) * 100
      : 0;

    // Posts por mês
    const postsByMonth = new Map<string, number>();
    posts.forEach((post: any) => {
      if (post.timestamp) {
        const date = new Date(post.timestamp);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        postsByMonth.set(key, (postsByMonth.get(key) || 0) + 1);
      }
    });
    const avgPostsPerMonth = postsByMonth.size > 0
      ? Math.round(Array.from(postsByMonth.values()).reduce((a, b) => a + b, 0) / postsByMonth.size)
      : 0;

    // Breakdown por tipo
    const contentBreakdown = {
      carousel: posts.filter((p: any) => p.type === "Carousel" || p.type === "Sidecar").length,
      reels: posts.filter((p: any) => p.type === "Reel" || p.type === "Video").length,
      image: posts.filter((p: any) => p.type === "Image").length,
    };

    // Salvar no Supabase
    const supabase = createServiceClient();

    // Inserir/atualizar perfil
    const { data: savedProfile, error: profileError } = await supabase
      .from("competitor_data")
      .upsert({
        handle: username.toLowerCase().replace("@", ""),
        name: profile.fullName || profile.username,
        platform: "instagram",
        profile_url: `https://instagram.com/${username.replace("@", "")}`,
        profile_pic_url: profile.profilePicUrl,
        biography: profile.biography,
        followers_count: profile.followersCount || 0,
        following_count: profile.followsCount || 0,
        posts_count: profile.postsCount || 0,
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
        posts_per_month: avgPostsPerMonth,
        avg_likes: avgLikes,
        avg_comments: avgComments,
        content_breakdown: contentBreakdown,
        apify_data: profile,
        last_scraped_at: new Date().toISOString(),
      }, { onConflict: "handle" })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Erro ao salvar perfil: ${profileError.message}`);
    }

    // Inserir posts
    if (posts.length > 0) {
      const postsToUpsert = posts.map((post: any) => ({
        competitor_id: savedProfile.id,
        external_id: post.id,
        caption: post.caption?.substring(0, 2000) || "",
        likes: post.likesCount || 0,
        comments: post.commentsCount || 0,
        media_type: mapMediaType(post.type),
        timestamp: post.timestamp ? new Date(post.timestamp).toISOString() : null,
        permalink: post.url,
        thumbnail_url: post.displayUrl,
        engagement_rate: profile.followersCount > 0
          ? ((post.likesCount + post.commentsCount) / profile.followersCount) * 100
          : 0,
        apify_data: post,
      }));

      const { error: postsError } = await supabase
        .from("competitor_posts")
        .upsert(postsToUpsert, { onConflict: "competitor_id,external_id" });

      if (postsError) {
        console.error("Erro ao salvar posts:", postsError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Dados de @${username} importados com sucesso`,
      data: {
        id: savedProfile.id,
        handle: savedProfile.handle,
        name: savedProfile.name,
        followers: savedProfile.followers_count,
        posts: posts.length,
      },
    });

  } catch (error) {
    console.error("[Import] Erro:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }, { status: 500 });
  }
}

function mapMediaType(apifyType: string): "carousel" | "reel" | "image" {
  switch (apifyType) {
    case "Carousel":
    case "Sidecar":
      return "carousel";
    case "Reel":
    case "Video":
      return "reel";
    case "Image":
    default:
      return "image";
  }
}
