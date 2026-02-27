import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { getLanguageModel } from "@/lib/ai/providers"
import { supabaseAdmin } from "@/lib/supabase/admin"

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

    // Load agent config
    const { data: agent, error } = await supabaseAdmin
      .from("time_agents")
      .select("*")
      .eq("id", agentId)
      .single()

    if (error || !agent) {
      return new Response("Agent not found", { status: 404 })
    }

    // Get the language model
    const model = getLanguageModel(agent.provider, agent.model)

    // Load Knowledge Bases linked to this agent
    const { data: kbLinks } = await supabaseAdmin
      .from("time_agent_knowledge")
      .select("kb_id")
      .eq("agent_id", agentId)

    let kbContext = ""
    if (kbLinks?.length) {
      const kbIds = kbLinks.map((l) => l.kb_id)
      const { data: docs } = await supabaseAdmin
        .from("time_knowledge_docs")
        .select("kb_id, content, filename")
        .in("kb_id", kbIds)
        .eq("status", "ready")

      if (docs?.length) {
        kbContext = docs
          .filter((d) => d.content)
          .map((d) => `<knowledge name="${d.filename}">\n${d.content}\n</knowledge>`)
          .join("\n\n")
      }
    }

    // Build system message: KB context + agent prompt
    const systemParts = [kbContext, agent.system_prompt].filter(Boolean)
    const systemMessage = systemParts.join("\n\n---\n\n") || undefined

    // Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(messages)

    // Stream response
    const result = streamText({
      model,
      system: systemMessage,
      messages: modelMessages,
      temperature: agent.temperature ?? 0.7,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat error:", error)
    return new Response("Internal error", { status: 500 })
  }
}
