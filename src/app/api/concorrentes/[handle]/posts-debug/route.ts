/**
 * API Route: GET /api/concorrentes/[handle]/posts-debug
 * Retorna os posts brutos para debug
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

interface RouteParams {
  params: Promise<{ handle: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { handle } = await params;
    const cleanHandle = handle.replace("@", "").trim().toLowerCase();
    const supabase = createServiceClient();

    // Buscar o concorrente
    const { data: competitor, error: compError } = await supabase
      .from("competitor_data")
      .select("id, handle, name")
      .eq("handle", cleanHandle)
      .single();

    if (compError || !competitor) {
      return NextResponse.json(
        { success: false, error: "Concorrente não encontrado" },
        { status: 404 }
      );
    }

    // Buscar os posts
    const { data: posts, error: postsError } = await supabase
      .from("competitor_posts")
      .select("id, external_id, caption, apify_data")
      .eq("competitor_id", competitor.id)
      .order("timestamp", { ascending: false })
      .limit(3);

    if (postsError) {
      return NextResponse.json(
        { success: false, error: postsError.message },
        { status: 500 }
      );
    }

    // Extrair campos relevantes
    const postsDebug = posts?.map((post, index) => {
      const apify = post.apify_data as Record<string, unknown> | null;
      return {
        index,
        external_id: post.external_id,
        caption_preview: post.caption?.substring(0, 50),
        has_apify_data: !!apify,
        apify_keys: apify ? Object.keys(apify) : [],
        ownerProfilePicUrl: apify?.ownerProfilePicUrl,
        profilePicUrl: apify?.profilePicUrl,
      };
    });

    return NextResponse.json({
      success: true,
      competitor: {
        id: competitor.id,
        handle: competitor.handle,
        name: competitor.name,
      },
      posts_count: posts?.length || 0,
      posts: postsDebug,
    });
  } catch (error) {
    console.error("[API PostsDebug] Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
