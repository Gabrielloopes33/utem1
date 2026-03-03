/**
 * API Route: Proxy para o Agente de Ideias (N8N)
 * Webhook: https://flow.agenciatouch.com.br/webhook/97ab2e1b-12f4-4a2d-b087-be15edfaf000
 */

import { NextRequest, NextResponse } from "next/server"

const N8N_WEBHOOK_URL = "https://flow.agenciatouch.com.br/webhook/97ab2e1b-12f4-4a2d-b087-be15edfaf000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.message) {
      return NextResponse.json(
        { error: "Message is required" },
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
        message: body.message,
        history: body.history || [],
        userId: body.userId || "anonymous",
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

    // O agente de ideias retorna texto plano
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
