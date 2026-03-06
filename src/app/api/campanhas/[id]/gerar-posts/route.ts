/**
 * API Route: Gerar mais posts para uma campanha existente
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
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
    const { quantidade = 3 } = body

    // Buscar dados da campanha
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, name, objective, target_persona, metadata")
      .eq("id", campaignId)
      .eq("user_id", user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campanha não encontrada" },
        { status: 404 }
      )
    }

    // Preparar dados para geração
    const campanhaData = {
      nome: campaign.name,
      tema: campaign.metadata?.tema || campaign.name,
      tipoConteudo: campaign.metadata?.tipoConteudo || "tecnico",
      formato: campaign.metadata?.formato || "carrossel",
      persona: campaign.target_persona || "Investidores",
      perfilPersona: campaign.metadata?.perfilPersona || "moderado"
    }

    // Gerar posts
    const posts = gerarPostsFallback(campanhaData, quantidade)

    // Salvar posts no banco
    const postsToInsert = posts.map((post, index) => ({
      campaign_id: campaignId,
      user_id: user.id,
      title: post.titulo || `Post ${index + 1}`,
      content: post.conteudo || "",
      caption: post.legenda || "",
      tipo: (campanhaData.tipoConteudo as string),
      formato: (campanhaData.formato as string),
      status: "draft",
      slides: post.slides || [],
      metadata: {
        generated_by: "ai",
        campanha_tema: campanhaData.tema,
        campanha_persona: campanhaData.persona
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
    console.error("Erro na API:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Gerador de posts fallback
function gerarPostsFallback(campanhaData: { tipoConteudo?: string; formato?: string; tema?: string; persona?: string }, quantidade: number) {
  const posts = []
  const formato = campanhaData.formato || "carrossel"
  const tema = campanhaData.tema || "Investimentos"
  const persona = campanhaData.persona || "Investidores"

  const templates = [
    {
      titulo: `Mitos sobre ${tema} que você precisa parar de acreditar`,
      conteudo: `Desmistificando os principais mitos sobre ${tema}.`,
      legenda: `🚫 MITOS sobre ${tema} que você precisa esquecer:\n\n❌ "É só para ricos"\n❌ "É muito arriscado"\n❌ "Preciso de muito tempo"\n\nA verdade é que ${persona.toLowerCase()} pode começar hoje mesmo!\n\nQual mito você já ouviu? Comenta! 👇\n\n#${tema.replace(/\s+/g, '')} #Mitos #Verdades`
    },
    {
      titulo: `${tema}: Antes vs Depois`,
      conteudo: `Veja a diferença que ${tema} faz na prática.`,
      legenda: `📊 ANTES vs DEPOIS de entender ${tema}\n\nANTES:\n😰 Insegurança financeira\n📉 Dinheiro parado\n😰 Medo do futuro\n\nDEPOIS:\n😌 Tranquilidade\n📈 Patrimônio crescendo\n🎯 Objetivos claros\n\n${persona}, qual lado você está? 🚀\n\n#${tema.replace(/\s+/g, '')} #Transformação #Resultados`
    },
    {
      titulo: `3 Dicas de ouro sobre ${tema}`,
      conteudo: `As melhores dicas para quem quer começar em ${tema}.`,
      legenda: `💎 3 DICAS OURO para ${persona} sobre ${tema}:\n\n1️⃣ Comece pequeno, mas COMECE\nNão espere ter muito para investir\n\n2️⃣ ESTUDE antes de aplicar\nConhecimento é seu melhor ativo\n\n3️⃣ SEJA CONSISTENTE\nConstância vence intensidade\n\nQual dessas você vai aplicar hoje? 💪\n\n#${tema.replace(/\s+/g, '')} #Dicas #Ouro`
    }
  ]

  for (let i = 0; i < quantidade; i++) {
    const template = templates[i % templates.length]
    posts.push({
      titulo: template.titulo,
      conteudo: template.conteudo,
      legenda: template.legenda,
      slides: formato === "carrossel" ? [
        { text: `Slide 1: Introdução sobre ${tema}`, image_prompt: `Imagem profissional sobre ${tema}` },
        { text: `Slide 2: Desenvolvimento do tema`, image_prompt: `Infográfico ilustrativo` },
        { text: `Slide 3: Call to action`, image_prompt: `Imagem motivacional` }
      ] : [],
      prompt_usado: `Gerar post sobre ${tema} para ${persona}`
    })
  }

  return posts
}
