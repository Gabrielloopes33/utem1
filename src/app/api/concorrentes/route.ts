/**
 * API Route: GET /api/concorrentes
 * Lista todos os concorrentes salvos no cache
 */

import { NextResponse } from "next/server";
import { getAllCompetitors } from "@/lib/apify/cache";

export async function GET() {
  try {
    const competitors = await getAllCompetitors();

    return NextResponse.json({
      success: true,
      data: competitors,
      count: competitors.length,
    });
  } catch (error) {
    console.error("[API] Erro ao buscar concorrentes:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
