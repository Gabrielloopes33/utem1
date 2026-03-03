/**
 * API Route: Proxy para o Agente de Conteúdo / Gerar Post (N8N)
 * Webhook: https://flow.agenciatouch.com.br/webhook/agente-gerar-post
 */

import { NextRequest, NextResponse } from "next/server"

const N8N_WEBHOOK_URL = "https://flow.agenciatouch.com.br/webhook/agente-gerar-post"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.tema || !body.tipoConteudo || !body.formato || !body.persona || !body.perfilPersona) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Chama o webhook do N8N (server-side, sem CORS)
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tema: body.tema,
        tipoConteudo: body.tipoConteudo,
        formato: body.formato,
        persona: body.persona,
        perfilPersona: body.perfilPersona,
        campanha: body.campanha,
        referencias: body.referencias,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error("N8N error:", response.status, errorText)
      return NextResponse.json(
        { error: `N8N error: ${response.status}` },
        { status: 502 }
      )
    }

    // O agente gerar-post retorna JSON
    const data = await response.json()
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("API Route error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
