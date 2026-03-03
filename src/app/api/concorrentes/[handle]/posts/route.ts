/**
 * API Route: GET /api/concorrentes/[handle]/posts
 * Busca posts de um concorrente específico
 * Query params:
 *   - limit (opcional): quantidade de posts (padrão: 50, max: 100)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ handle: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { handle } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const supabase = await createClient();

    // Buscar ID do concorrente
    const { data: competitor, error: competitorError } = await supabase
      .from("competitor_data")
      .select("id, name")
      .eq("handle", handle.toLowerCase())
      .single();

    if (competitorError || !competitor) {
      return NextResponse.json(
        { success: false, error: "Concorrente não encontrado" },
        { status: 404 }
      );
    }

    // Buscar posts
    const { data: posts, error: postsError } = await supabase
      .from("competitor_posts")
      .select("*")
      .eq("competitor_id", competitor.id)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (postsError) {
      throw new Error(`Erro ao buscar posts: ${postsError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        competitor: {
          id: competitor.id,
          name: competitor.name,
          handle,
        },
        posts: posts || [],
      },
      count: posts?.length || 0,
    });
  } catch (error) {
    console.error(`[API] Erro ao buscar posts de @${(await params).handle}:`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
