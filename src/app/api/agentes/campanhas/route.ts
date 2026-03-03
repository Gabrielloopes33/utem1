/**
 * API Route: Proxy para o Agente de Campanha (N8N)
 * Webhook: https://flow.agenciatouch.com.br/webhook/agente-campanhas
 */

import { NextRequest, NextResponse } from "next/server"

const N8N_WEBHOOK_URL = "https://flow.agenciatouch.com.br/webhook/agente-campanhas"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.nome || !body.objetivo || !body.formato || !body.periodo) {
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
        nome: body.nome,
        objetivo: body.objetivo,
        formato: body.formato,
        tiposConteudo: body.tiposConteudo || [],
        formatos: body.formatos || [],
        periodo: body.periodo,
        persona: body.persona,
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

    // O agente campanhas retorna texto
    const data = await response.text()
    
    return NextResponse.json({ response: data })
    
  } catch (error) {
    console.error("API Route error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
