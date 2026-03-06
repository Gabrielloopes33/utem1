/**
 * API Route: /api/agentes/ajustes
 * GET  — busca settings do usuário logado (ou retorna defaults)
 * POST — upsert das settings (ON CONFLICT user_id DO UPDATE)
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const DEFAULT_SETTINGS = {
  marca: {
    nome: "",
    nicho: "",
    publicoAlvo: "",
    tomDeVoz: "educativo",
    palavrasEvitar: [] as string[],
  },
  agentes: {
    conteudo: {
      instrucaoAdicional: "",
      comprimentoRespostas: "medio",
    },
    campanhas: {
      instrucaoAdicional: "",
    },
  },
}

export async function GET() {
  try {
    const supabase = await createClient("nexia")
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("time_agent_settings")
      .select("settings")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = row not found, ignorar
      throw error
    }

    return NextResponse.json({
      success: true,
      settings: data?.settings ?? DEFAULT_SETTINGS,
    })
  } catch (error) {
    console.error("[API ajustes] GET error:", error)
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient("nexia")
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json({ error: "settings é obrigatório" }, { status: 400 })
    }

    const { error } = await supabase
      .from("time_agent_settings")
      .upsert(
        { user_id: user.id, settings },
        { onConflict: "user_id" }
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API ajustes] POST error:", error)
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    )
  }
}
