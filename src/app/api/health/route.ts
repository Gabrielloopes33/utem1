import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  try {
    const supabase = createServiceClient();
    
    // Testar conexão
    const { data, error } = await supabase
      .from("competitor_data")
      .select("count")
      .limit(1);

    if (error) {
      return NextResponse.json({
        status: "error",
        message: "Erro ao conectar com Supabase",
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "ok",
      message: "Conexão com Supabase funcionando",
      tables: {
        competitor_data: "acessível",
      },
      env: {
        apify_token: process.env.APIFY_API_TOKEN ? "configurado" : "não configurado",
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configurado" : "não configurado",
        service_role: process.env.SUPABASE_SERVICE_ROLE_KEY ? "configurado" : "não configurado",
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    }, { status: 500 });
  }
}
