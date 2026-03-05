import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { getLanguageModel } from "@/lib/ai/providers"
import { getSystemClient } from "@/lib/supabase/cache"
import { getCachedKnowledgeContext } from "@/lib/cache/strategies"

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, agentId } = body as {
      messages: UIMessage[]
      agentId: string
    }

    if (!agentId) {
      return new Response("agentId is required", { status: 400 })
    }

    const supabase = await getSystemClient()

    // Buscar config do agente
    const { data: agent, error } = await supabase
      .from("time_agents")
      .select("*")
      .eq("id", agentId)
      .single()

    if (error || !agent) {
      return new Response("Agent not found", { status: 404 })
    }

    // Get the language model
    const model = getLanguageModel(agent.provider, agent.model)

    // Buscar contexto de knowledge base com cache (1 hora TTL)
    let kbContext = ""
    const knowledgeContext = await getCachedKnowledgeContext(agentId)
    
    if (knowledgeContext?.documents?.length) {
      kbContext = knowledgeContext.documents
        .filter((d) => d.content)
        .map((d) => `<knowledge name="${d.filename}">\n${d.content}\n</knowledge>`)
        .join("\n\n")
    }
    
    const agentConfig = agent

    // Build system message: KB context + agent prompt
    const systemParts = [kbContext, agentConfig.system_prompt].filter(Boolean)
    const systemMessage = systemParts.join("\n\n---\n\n") || undefined

    // Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(messages)

    // Stream response
    const result = streamText({
      model,
      system: systemMessage,
      messages: modelMessages,
      temperature: agentConfig.temperature ?? 0.7,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat error:", error)
    return new Response("Internal error", { status: 500 })
  }
}
