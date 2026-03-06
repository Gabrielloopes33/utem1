/**
 * API Route: Gerar Posts para Campanha
 * Gera posts usando IA baseado nos dados da campanha
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface CampanhaData {
  nome?: string
  tema?: string
  tipoConteudo?: string
  formato?: string
  persona?: string
  perfilPersona?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { campanhaData, quantidade = 5 }: { campanhaData: CampanhaData; quantidade?: number } = body

    if (!campanhaData.nome || !campanhaData.tema) {
      return NextResponse.json(
        { error: "Dados da campanha incompletos" },
        { status: 400 }
      )
    }

    // Buscar a campanha recém-criada
    const { data: campanha, error: campanhaError } = await supabase
      .from("campaigns")
      .select("id, name, objective, target_persona, metadata")
      .eq("name", campanhaData.nome)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (campanhaError || !campanha) {
      return NextResponse.json(
        { error: "Campanha não encontrada" },
        { status: 404 }
      )
    }

    // Gerar posts usando N8N ou fallback local
    const posts = await gerarPostsIA(campanhaData, quantidade)

    // Salvar posts no banco
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postsToInsert = posts.map((post: any, index: number) => ({
      campaign_id: campanha.id,
      user_id: user.id,
      title: post.titulo || `Post ${index + 1}`,
      content: post.conteudo || post.texto || "",
      caption: post.legenda || "",
      tipo: (campanhaData.tipoConteudo as string) || "tecnico",
      formato: (campanhaData.formato as string) || "carrossel",
      status: "draft",
      slides: post.slides || [],
      metadata: {
        generated_by: "ai",
        campanha_tema: campanhaData.tema,
        campanha_persona: campanhaData.persona,
        ai_prompt: post.prompt_usado || ""
      }
    }))

    const { data: savedPosts, error: insertError } = await supabase
      .from("campaign_posts")
      .insert(postsToInsert)
      .select()

    if (insertError) {
      console.error("Erro ao salvar posts:", insertError)
      return NextResponse.json(
        { error: "Erro ao salvar posts" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      posts: savedPosts,
      message: `${savedPosts?.length || 0} posts gerados com sucesso`
    })

  } catch (error) {
    console.error("Erro na API de gerar posts:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Função para gerar posts (fallback local ou N8N)
async function gerarPostsIA(campanhaData: CampanhaData, quantidade: number) {
  const N8N_WEBHOOK_URL = process.env.N8N_GERAR_POSTS_URL

  // Tentar chamar N8N primeiro
  if (N8N_WEBHOOK_URL) {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campanha: campanhaData,
          quantidade,
          timestamp: new Date().toISOString()
        }),
        cache: "no-store"
      })

      if (response.ok) {
        const data = await response.json()
        if (data.posts && Array.isArray(data.posts)) {
          return data.posts
        }
      }
    } catch (error) {
      console.log("N8N não respondeu, usando fallback:", error)
    }
  }

  // Fallback: Gerar posts localmente
  return gerarPostsFallback(campanhaData, quantidade)
}

// Gerador de posts fallback
function gerarPostsFallback(campanhaData: CampanhaData, quantidade: number) {
  const posts = []
  const formato = campanhaData.formato || "carrossel"
  const tema = campanhaData.tema || "Investimentos"
  const persona = campanhaData.persona || "Investidores iniciantes"

  const templates = [
    {
      titulo: `${tema}: O Guia Completo`,
      conteudo: `Descubra tudo sobre ${tema} neste guia prático.`,
      legenda: `🚀 ${tema}: Tudo que você precisa saber!\n\nSe você é ${persona.toLowerCase()}, este conteúdo foi feito especialmente para você.\n\n💡 Dica: Comece com pequenos passos e evolua gradualmente.\n\n#${tema.replace(/\s+/g, '')} #Investimentos #EducaçãoFinanceira`
    },
    {
      titulo: `5 Erros Comuns em ${tema}`,
      conteudo: `Evite esses 5 erros ao investir em ${tema}.`,
      legenda: `⚠️ 5 ERROS que ${persona.toLowerCase()} cometem em ${tema}\n\n1️⃣ Não diversificar\n2️⃣ Investir sem estudar\n3️⃣ Deixar emoções controlarem\n4️⃣ Não ter planejamento\n5️⃣ Ignorar riscos\n\nQual desses você já cometeu? Comenta aqui! 👇\n\n#${tema.replace(/\s+/g, '')} #Erros #Aprendizado`
    },
    {
      titulo: `Por que ${tema} é importante?`,
      conteudo: `Entenda a importância de ${tema} para seu futuro financeiro.`,
      legenda: `💭 Já parou pra pensar em como ${tema} pode mudar sua vida financeira?\n\nPara ${persona.toLowerCase()}, isso é ainda mais relevante.\n\n✅ Segurança\n✅ Crescimento\n✅ Tranquilidade\n\nComece hoje! 🚀\n\n#${tema.replace(/\s+/g, '')} #Planejamento #Futuro`
    },
    {
      titulo: `Case de Sucesso: ${tema}`,
      conteudo: `Veja como investir em ${tema} transformou a vida de muitas pessoas.`,
      legenda: `📊 CASE REAL: Como ${tema} mudou tudo\n\n"Eu era ${persona.toLowerCase()} e não sabia por onde começar. Depois de estudar ${tema}, minha visão mudou completamente."\n\nResultados em 1 ano:\n📈 +15% de retorno\n💰 Patrimônio crescendo\n😌 Mais tranquilidade\n\nE você, quando vai começar?\n\n#${tema.replace(/\s+/g, '')} #Sucesso #Resultados`
    },
    {
      titulo: `Passo a Passo: ${tema}`,
      conteudo: `Aprenda ${tema} em 3 passos simples.`,
      legenda: `📋 PASSO A PASSO: Como começar em ${tema}\n\n1️⃣ ESTUDE\nEntenda o básico antes de aplicar\n\n2️⃣ PLANEJE\nDefina seus objetivos financeiros\n\n3️⃣ APLIQUE\nComece com valores que você pode perder\n\nPronto para ${persona.toLowerCase()} que quer resultados! 💪\n\nQual passo você está?\n\n#${tema.replace(/\s+/g, '')} #PassoAPasso #Início`
    }
  ]

  for (let i = 0; i < quantidade; i++) {
    const template = templates[i % templates.length]
    posts.push({
      titulo: template.titulo,
      conteudo: template.conteudo,
      legenda: template.legenda,
      slides: formato === "carrossel" ? [
        { text: "Slide 1: Introdução", image_prompt: `Imagem sobre ${tema}` },
        { text: "Slide 2: Desenvolvimento", image_prompt: `Infográfico sobre ${tema}` },
        { text: "Slide 3: Conclusão", image_prompt: `Call to action sobre ${tema}` }
      ] : [],
      prompt_usado: `Gerar post sobre ${tema} para ${persona}`
    })
  }

  return posts
}
