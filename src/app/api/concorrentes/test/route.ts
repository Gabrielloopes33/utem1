import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Testar conexão com as tabelas
    const results = await Promise.all([
      // Contar concorrentes
      supabase.from("competitor_data").select("*", { count: "exact", head: true }),
      // Contar posts
      supabase.from("competitor_posts").select("*", { count: "exact", head: true }),
    ]);

    const [competitorsResult, postsResult] = results;

    return NextResponse.json({
      success: true,
      message: "Conexão com Supabase funcionando!",
      tables: {
        competitor_data: {
          exists: !competitorsResult.error,
          count: competitorsResult.count || 0,
          error: competitorsResult.error?.message,
        },
        competitor_posts: {
          exists: !postsResult.error,
          count: postsResult.count || 0,
          error: postsResult.error?.message,
        },
      },
      ready: !competitorsResult.error && !postsResult.error,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }, { status: 500 });
  }
}
