import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// GET /api/workflows
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("time_workflows")
      .select("*, time_workflow_steps(id)")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const workflows = data?.map((wf) => ({
      ...wf,
      step_count: wf.time_workflow_steps?.length ?? 0,
      time_workflow_steps: undefined,
    }))

    return NextResponse.json(workflows)
  } catch (error) {
    console.error("Error listing workflows:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// POST /api/workflows
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from("time_workflows")
      .insert({
        org_id: body.org_id,
        name: body.name,
        description: body.description || null,
        status: "draft",
        trigger_type: body.trigger_type || "manual",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating workflow:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
