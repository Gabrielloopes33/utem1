import { NextResponse } from "next/server"
import { createSystemClient } from "@/lib/supabase/server"

// GET /api/squads/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createSystemClient()

    const { data, error } = await supabase
      .from("time_squads")
      .select("*, time_agents(*)")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching squad:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// PUT /api/squads/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const supabase = await createSystemClient()

    const { data, error } = await supabase
      .from("time_squads")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating squad:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// DELETE /api/squads/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createSystemClient()

    const { error } = await supabase
      .from("time_squads")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting squad:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
