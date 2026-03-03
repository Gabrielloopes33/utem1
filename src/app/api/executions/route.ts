import { NextResponse } from "next/server"
import { createSystemClient } from "@/lib/supabase/server"

// GET /api/executions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")
    const workflowId = searchParams.get("workflowId")
    const limit = parseInt(searchParams.get("limit") || "20")

    const supabase = await createSystemClient()

    let query = supabase
      .from("time_executions")
      .select("*, time_agents(id, name), time_workflows(id, name)")
      .order("started_at", { ascending: false })
      .limit(limit)

    if (agentId) query = query.eq("agent_id", agentId)
    if (workflowId) query = query.eq("workflow_id", workflowId)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error listing executions:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
