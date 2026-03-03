/**
 * API Route: GET /api/concorrentes
 * Lista todos os concorrentes salvos no cache
 */

import { NextResponse } from "next/server";
import { getAllCompetitors } from "@/lib/apify/cache";

export async function GET() {
  try {
    console.log("[API] Buscando concorrentes...");
    const competitors = await getAllCompetitors();
    console.log(`[API] Encontrados ${competitors.length} concorrentes`);

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
        hint: "Verifique se as tabelas existem no Supabase",
      },
      { status: 500 }
    );
  }
}
