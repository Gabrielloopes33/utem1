/**
 * API Route: Agente de Conteúdo (Chat + Gerar Post)
 * 
 * Modos:
 * 1. Chat/Conversa: Recebe mensagem e histórico, retorna resposta da IA
 * 2. Gerar Post: Recebe parâmetros do post, retorna conteúdo gerado
 * 
 * Webhooks N8N:
 * - Chat: https://flow.agenciatouch.com.br/webhook/97ab2e1b-12f4-4a2d-b087-be15edfaf000
 * - Gerar Post: https://flow.agenciatouch.com.br/webhook/agente-gerar-post
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/cache";
import { fetchWithTimeout, TIMEOUTS } from "@/lib/api/timeout";

const N8N_WEBHOOK_CHAT = "https://flow.agenciatouch.com.br/webhook/97ab2e1b-12f4-4a2d-b087-be15edfaf000";
const N8N_WEBHOOK_GERAR_POST = "https://flow.agenciatouch.com.br/webhook/agente-gerar-post";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * POST /api/agentes/conteudo
 * 
 * Body para Chat:
 * {
 *   mode: "chat",
 *   message: string,
 *   conversationId?: string,
 *   history?: ChatMessage[],
 *   agentId?: string
 * }
 * 
 * Body para Gerar Post:
 * {
 *   mode: "gerar-post",
 *   tema: string,
 *   tipoConteudo: string,
 *   formato: string,
 *   persona: string,
 *   perfilPersona: string,
 *   campanha?: string,
 *   referencias?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mode = body.mode || (body.tema ? "gerar-post" : "chat");

    console.log(`[Agente Conteúdo] Modo: ${mode}`);

    if (mode === "chat" || (!body.tema && body.message)) {
      return handleChatMode(body);
    } else if (mode === "gerar-post" || body.tema) {
      return handleGerarPostMode(body);
    } else {
      return NextResponse.json(
        { error: "Modo inválido. Use 'chat' ou 'gerar-post'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[Agente Conteúdo] Erro na API:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * Handler para modo Chat/Conversa
 */
async function handleChatMode(body: Record<string, unknown>) {
  const { message, conversationId, history, agentId } = body;

  // Validação
  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "Mensagem é obrigatória" },
      { status: 400 }
    );
  }

  try {
    // Buscar histórico do banco se tiver conversationId
    const parsedHistory = Array.isArray(history) ? history : [];
    let chatHistory: ChatMessage[] = parsedHistory as ChatMessage[];
    
    if (conversationId && chatHistory.length === 0) {
      const supabase = await getSupabaseClient();
      const { data: messages } = await supabase
        .from("agent_messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(20);

      if (messages) {
        chatHistory = messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));
      }
    }

    // Preparar payload para N8N
    const n8nPayload = {
      message: message.trim(),
      history: chatHistory,
      conversationId: conversationId || null,
      agentId: agentId || "agente-conteudo",
      timestamp: new Date().toISOString(),
    };

    console.log("[Agente Conteúdo/Chat] Enviando para N8N:", JSON.stringify(n8nPayload, null, 2));

    // Chamar webhook do N8N com timeout
    const response = await fetchWithTimeout(N8N_WEBHOOK_CHAT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(n8nPayload),
      cache: "no-store",
      timeout: TIMEOUTS.EXTERNAL,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error("[Agente Conteúdo/Chat] Erro N8N:", response.status, errorText);
      return NextResponse.json(
        { error: `Erro no agente: ${response.status}` },
        { status: 502 }
      );
    }

    // Parse da resposta
    let data;
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { response: text };
    }

    console.log("[Agente Conteúdo/Chat] Resposta:", JSON.stringify(data, null, 2));

    return NextResponse.json({
      response: data.response || data.content || data.message || "Sem resposta",
      metadata: {
        tokens_used: data.tokens_used,
        model_used: data.model_used,
        processing_time_ms: data.processing_time_ms,
      },
    });

  } catch (error) {
    console.error("[Agente Conteúdo/Chat] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 }
    );
  }
}

/**
 * Handler para modo Gerar Post
 */
async function handleGerarPostMode(body: Record<string, unknown>) {
  const {
    tema,
    tipoConteudo,
    formato,
    persona,
    perfilPersona,
    campanha,
    referencias,
    personaData,
  } = body;

  // Validação
  if (!tema || !tipoConteudo || !formato || !persona || !perfilPersona) {
    return NextResponse.json(
      { error: "Campos obrigatórios: tema, tipoConteudo, formato, persona, perfilPersona" },
      { status: 400 }
    );
  }

  try {
    // Preparar payload para N8N
    const n8nPayload = {
      tema,
      tipoConteudo,
      formato,
      persona,
      perfilPersona,
      personaData: personaData || null,
      campanha,
      referencias,
      timestamp: new Date().toISOString(),
    };

    console.log("[Agente Conteúdo/GerarPost] Enviando para N8N:", JSON.stringify(n8nPayload, null, 2));

    // Chamar webhook do N8N com timeout
    const response = await fetchWithTimeout(N8N_WEBHOOK_GERAR_POST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(n8nPayload),
      cache: "no-store",
      timeout: TIMEOUTS.EXTERNAL,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error("[Agente Conteúdo/GerarPost] Erro N8N:", response.status, errorText);
      return NextResponse.json(
        { error: `Erro no agente: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    
    console.log("[Agente Conteúdo/GerarPost] Resposta:", JSON.stringify(data, null, 2));

    return NextResponse.json(data);

  } catch (error) {
    console.error("[Agente Conteúdo/GerarPost] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao gerar post" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agentes/conteudo
 * Buscar histórico de uma conversa
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();

    // Buscar conversa e mensagens em paralelo (elimina N+1)
    const [{ data: conversation, error: convError }, { data: messages, error: msgError }] = await Promise.all([
      supabase
        .from("agent_conversations")
        .select("*")
        .eq("id", conversationId)
        .single(),
      supabase
        .from("agent_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
    ]);

    if (convError) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 }
      );
    }

    if (msgError) {
      return NextResponse.json(
        { error: "Erro ao buscar mensagens" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
      messages: messages || [],
    });

  } catch (error) {
    console.error("[Agente Conteúdo] Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
