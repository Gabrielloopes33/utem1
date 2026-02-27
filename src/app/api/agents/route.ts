import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// GET /api/agents - List agents
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get("orgId")
    const squadId = searchParams.get("squadId")
    const status = searchParams.get("status")

    let query = supabaseAdmin
      .from("time_agents")
      .select("*, time_squads(id, name, color, icon)")
      .order("created_at", { ascending: false })

    if (orgId) query = query.eq("org_id", orgId)
    if (squadId) query = query.eq("squad_id", squadId)
    if (status) query = query.eq("status", status)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error listing agents:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// POST /api/agents - Create agent
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from("time_agents")
      .insert({
        org_id: body.org_id,
        squad_id: body.squad_id || null,
        name: body.name,
        description: body.description || null,
        avatar_url: body.avatar_url || null,
        type: body.type || "chat",
        status: body.status || "draft",
        provider: body.provider || "anthropic",
        model: body.model || "claude-sonnet-4-20250514",
        system_prompt: body.system_prompt || null,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 4096,
        trigger_type: body.trigger_type || "manual",
        trigger_config: body.trigger_config || {},
        approval_required: body.approval_required || false,
        approval_role: body.approval_role || null,
        tools: body.tools || [],
        tags: body.tags || [],
        metadata: body.metadata || {},
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
