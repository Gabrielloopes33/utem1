/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Route: Agente de Campanhas (Modo Conversacional)
 * Webhook N8N: https://flow.agenciatouch.com.br/webhook/agente-campanhas-chat
 * 
 * Recebe mensagens do chat e gerencia o fluxo conversacional
 */

import { NextRequest, NextResponse } from "next/server"
import { fetchWithTimeout, TIMEOUTS } from "@/lib/api/timeout"

const N8N_WEBHOOK_URL = process.env.N8N_AGENTE_CAMPANHAS_URL || 
  "https://flow.agenciatouch.com.br/webhook/agente-campanhas-chat"

// Fluxo de fallback quando o n8n não responde
const FLUXO_ROTEIRO = {
  "inicio": {
    message: `Olá! Sou o Agente de Campanhas. Vou te ajudar a criar uma campanha completa para o Instagram.

Para começar, qual é o **tema** da campanha? (ex: "Lançamento FII Autem", "Educação Financeira")`,
    nextStep: "tema",
    showInput: true,
    inputType: "text"
  },
  "tema": {
    message: "Ótimo! Agora qual é o **tipo de conteúdo** desta campanha?",
    nextStep: "tipo_conteudo",
    options: [
      { label: "📚 Técnico - Educacional", value: "tecnico" },
      { label: "❤️ Emocional - Conecta sentimentos", value: "emocional" },
      { label: "🏆 Autoridade - Demonstra expertise", value: "autoridade" },
      { label: "👥 Social Proof - Cases e resultados", value: "social" }
    ],
    showInput: false
  },
  "tipo_conteudo": {
    message: "Perfeito! Agora escolha o **formato** principal:",
    nextStep: "formato",
    options: [
      { label: "🎴 Carrossel", value: "carrossel" },
      { label: "🎬 Reels", value: "reels" },
      { label: "🖼️ Card Único", value: "card" }
    ],
    showInput: false
  },
  "formato": {
    message: "Excelente escolha! Agora me fale sobre a **persona** que quer atingir (descrição livre):",
    nextStep: "persona_descricao",
    showInput: true,
    inputType: "textarea"
  },
  "persona_descricao": {
    message: "Entendido! Qual o **perfil de investidor** da persona?",
    nextStep: "perfil_persona",
    options: [
      { label: "🔵 Conservador", value: "conservador" },
      { label: "🟡 Moderado", value: "moderado" },
      { label: "🔴 Agressivo", value: "agressivo" }
    ],
    showInput: false
  },
  "perfil_persona": {
    message: "Ótimo! Para finalizar, qual **nome** você quer dar para esta campanha?",
    nextStep: "nome_campanha",
    showInput: true,
    inputType: "text"
  },
  "nome_campanha": {
    message: `🎉 Perfeito! Recebi todas as informações. Vou criar sua campanha e gerar alguns posts iniciais...`,
    nextStep: "gerando",
    showInput: false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      message, 
      step = "inicio", 
      history = [], 
      conversationId,
      campanhaData = {},
      files = []
    } = body

    // Validação básica
    if (!message && step !== "inicio") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Tenta chamar o N8N primeiro (com timeout)
    try {
      const n8nResponse = await fetchWithTimeout(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          step,
          history,
          conversationId,
          campanhaData,
          files,
          timestamp: new Date().toISOString(),
        }),
        cache: "no-store",
        timeout: TIMEOUTS.EXTERNAL,
      })

      if (n8nResponse.ok) {
        const data = await n8nResponse.json()
        
        // Se o N8N retornou uma resposta válida
        if (data.response || data.message) {
          return NextResponse.json({
            response: data.response || data.message,
            nextStep: data.nextStep || getNextStep(step),
            options: data.options,
            showInput: data.showInput !== false,
            inputType: data.inputType || "text",
            campanha: data.campanha,
          })
        }
      }
      
      console.log("N8N não respondeu ou retornou erro, usando fallback")
      
    } catch (n8nError) {
      console.log("Erro ao chamar N8N, usando fallback:", n8nError)
    }

    // Fallback: roteiro local
    const fallbackResponse = getFallbackResponse(step, message, campanhaData)
    
    return NextResponse.json(fallbackResponse)
    
  } catch (error) {
    console.error("API Route error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        response: "Desculpe, ocorreu um erro. Tente novamente.",
        nextStep: "error",
        showInput: true 
      },
      { status: 500 }
    )
  }
}

function getFallbackResponse(currentStep: string, userMessage: string, campanhaData: any) {
  // Se for o passo de nome da campanha, gera a mensagem de conclusão
  if (currentStep === "nome_campanha") {
    return {
      response: `🎉 Campanha "${userMessage}" criada com sucesso!

✅ **Resumo:**
- Tema: ${campanhaData.tema}
- Tipo: ${campanhaData.tipoConteudo}
- Formato: ${campanhaData.formato}
- Persona: ${campanhaData.perfilPersona}

A campanha foi salva e você pode ver ela na aba **Campanhas**. Quer que eu gere posts para ela agora?`,
      nextStep: "finalizado",
      options: [
        { label: "✨ Gerar posts agora", value: "gerar_posts" },
        { label: "📋 Ver campanha", value: "ver_campanha" },
        { label: "🆕 Criar outra campanha", value: "nova_campanha" }
      ],
      showInput: false,
      campanha: {
        nome: userMessage,
        ...campanhaData
      }
    }
  }

  // Fluxo normal baseado no step atual
  const roteiroStep = FLUXO_ROTEIRO[currentStep as keyof typeof FLUXO_ROTEIRO]
  
  if (roteiroStep) {
    // Personaliza a mensagem se tiver o tema
    let message = roteiroStep.message
    if (currentStep === "tema" && userMessage) {
      message = `Ótimo! Tema: "${userMessage}".\n\n${message}`
    }
    if (currentStep === "persona_descricao" && userMessage) {
      message = `Entendido! Persona: "${userMessage}".\n\n${message}`
    }

    return {
      response: message,
      nextStep: roteiroStep.nextStep,
      options: (roteiroStep as any).options,
      showInput: roteiroStep.showInput,
      inputType: (roteiroStep as any).inputType || "text",
    }
  }

  // Default
  return {
    response: "Entendido! Vamos continuar. Qual é a próxima informação?",
    nextStep: currentStep,
    showInput: true,
    inputType: "text"
  }
}

function getNextStep(currentStep: string): string {
  const stepMap: Record<string, string> = {
    "inicio": "tema",
    "tema": "tipo_conteudo",
    "tipo_conteudo": "formato",
    "formato": "persona_descricao",
    "persona_descricao": "perfil_persona",
    "perfil_persona": "nome_campanha",
    "nome_campanha": "finalizado"
  }
  
  return stepMap[currentStep] || currentStep
}
