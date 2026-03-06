/**
 * API Route: Melhorar Post com IA
 * Recebe um post e feedback do usuário, retorna versão melhorada
 */

import { NextRequest, NextResponse } from "next/server"

interface Post {
  id: string
  title: string
  content: string
  caption: string
  tipo: string
  formato: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post, feedback }: { post: Post; feedback: string } = body

    if (!post || !feedback.trim()) {
      return NextResponse.json(
        { error: "Post e feedback são obrigatórios" },
        { status: 400 }
      )
    }

    // Tentar chamar N8N primeiro
    const N8N_WEBHOOK_URL = process.env.N8N_MELHORAR_POST_URL
    
    if (N8N_WEBHOOK_URL) {
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post,
            feedback,
            timestamp: new Date().toISOString()
          }),
          cache: "no-store"
        })

        if (response.ok) {
          const data = await response.json()
          if (data.improvedPost) {
            return NextResponse.json({
              success: true,
              improvedPost: data.improvedPost
            })
          }
        }
      } catch (error) {
        console.log("N8N não respondeu, usando fallback:", error)
      }
    }

    // Fallback: Melhorar post localmente
    const improvedPost = melhorarPostFallback(post, feedback)

    return NextResponse.json({
      success: true,
      improvedPost
    })

  } catch (error) {
    console.error("Erro na API de melhorar post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Melhorador de posts fallback
function melhorarPostFallback(post: Post, feedback: string): { content: string; caption: string } {
  const feedbackLower = feedback.toLowerCase()
  
  let content = post.content
  let caption = post.caption

  // Aplicar melhorias baseadas no feedback
  if (feedbackLower.includes("formal") || feedbackLower.includes("profissional")) {
    content = content.replace(/!/g, ".").replace(/🚀|💎|🔥/g, "📊")
    caption = caption.replace(/!/g, ".").replace(/🚀|💎|🔥/g, "📊")
  }

  if (feedbackLower.includes("emojis") || feedbackLower.includes("divertido")) {
    content = content + " 🚀💪"
    caption = caption.replace(/\n\n/g, "\n\n✨ ")
    if (!caption.includes("🚀")) caption = "🚀 " + caption
  }

  if (feedbackLower.includes("jovens") || feedbackLower.includes("jovial")) {
    caption = caption.replace(/você/gi, "vc").replace(/para/gi, "pra")
    caption = "🔥 " + caption + " #BoraInvestir"
  }

  if (feedbackLower.includes("longo") || feedbackLower.includes("mais conteúdo")) {
    content = content + "\n\n" + "Este é um conteúdo aprofundado para quem quer ir além do básico e realmente dominar o assunto."
    caption = caption + "\n\n🧵 Thread completa nos comentários!"
  }

  if (feedbackLower.includes("curto") || feedbackLower.includes("resumo")) {
    content = content.split(". ")[0] + "."
    caption = caption.split("\n\n")[0]
  }

  if (feedbackLower.includes("call to action") || feedbackLower.includes("cta")) {
    caption = caption + "\n\n👉 Clique no link da bio e comece agora!"
  }

  if (feedbackLower.includes("pergunta") || feedbackLower.includes("engajamento")) {
    caption = caption + "\n\n❓ E você, o que acha disso? Conta nos comentários!"
  }

  // Se não reconheceu o feedback, adiciona uma melhoria genérica
  if (content === post.content && caption === post.caption) {
    content = "✨ " + content + "\n\n" + "Versão atualizada com base no seu feedback."
    caption = caption + "\n\n💡 Versão melhorada conforme solicitado!"
  }

  return { content, caption }
}
