import { NextResponse } from "next/server"
import { getSystemClient } from "@/lib/supabase/cache"

// GET /api/squads
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get("orgId")

    const supabase = await getSystemClient()

    let query = supabase
      .from("time_squads")
      .select("*, time_agents(id)")
      .order("created_at", { ascending: false })

    if (orgId) query = query.eq("org_id", orgId)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const squads = data?.map((squad) => ({
      ...squad,
      agent_count: squad.time_agents?.length ?? 0,
      time_agents: undefined,
    }))

    return NextResponse.json(squads)
  } catch (error) {
    console.error("Error listing squads:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// POST /api/squads
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const supabase = await getSystemClient()

    const { data, error } = await supabase
      .from("time_squads")
      .insert({
        org_id: body.org_id,
        name: body.name,
        description: body.description || null,
        icon: body.icon || "🤖",
        color: body.color || "#5B8DEF",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating squad:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
