/**
 * API Route: GET /api/concorrentes/[handle]
 * Busca dados de um concorrente específico (com cache)
 * Query params:
 *   - refresh=true (opcional): força atualização dos dados
 */

import { NextRequest, NextResponse } from "next/server";
import { getCompetitor, refreshCompetitor } from "@/lib/apify/cache";

interface RouteParams {
  params: Promise<{ handle: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { handle } = await params;
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    console.log(`[API] Buscando concorrente: @${handle}${forceRefresh ? " (forçando refresh)" : ""}`);

    let result;
    if (forceRefresh) {
      const competitor = await refreshCompetitor(handle);
      result = { competitor, posts: [] };
    } else {
      result = await getCompetitor(handle);
    }

    return NextResponse.json({
      success: true,
      data: result,
      cached: !forceRefresh && !result.competitor.isStale,
      stale: result.competitor.isStale,
    });
  } catch (error) {
    console.error(`[API] Erro ao buscar concorrente @${(await params).handle}:`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
