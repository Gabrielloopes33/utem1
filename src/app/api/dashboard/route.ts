import { NextResponse } from "next/server"
import { getSystemClient } from "@/lib/supabase/cache"
import { FRONTEND_AGENT_NAMES, sortFrontendAgents } from "@/lib/agents/catalog"

// GET /api/dashboard
export async function GET() {
  try {
    const supabase = await getSystemClient()

    // Fetch all KPIs in parallel
    const [agentsRes, activeRes, executionsRes, conversationsRes, recentExecRes, topAgentsRes] =
      await Promise.all([
        // Total agents
        supabase
          .from("time_agents")
          .select("id", { count: "exact", head: true }),
        // Active agents
        supabase
          .from("time_agents")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        // Executions today
        supabase
          .from("time_executions")
          .select("id", { count: "exact", head: true })
          .gte("started_at", new Date().toISOString().split("T")[0]),
        // Total conversations
        supabase
          .from("time_conversations")
          .select("id", { count: "exact", head: true }),
        // Recent executions (last 10)
        supabase
          .from("time_executions")
          .select("*, time_agents(id, name), time_workflows(id, name)")
          .order("started_at", { ascending: false })
          .limit(10),
        // Top agents (by execution count)
        supabase
          .from("time_agents")
          .select("id, name, avatar_url, provider, model, status")
          .eq("status", "active")
          .in("name", [...FRONTEND_AGENT_NAMES])
          .limit(5),
      ])

    const topAgents = sortFrontendAgents(topAgentsRes.data ?? [])

    return NextResponse.json({
      kpis: {
        total_agents: agentsRes.count ?? 0,
        active_agents: activeRes.count ?? 0,
        executions_today: executionsRes.count ?? 0,
        conversations: conversationsRes.count ?? 0,
      },
      recent_executions: recentExecRes.data ?? [],
      top_agents: topAgents,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
