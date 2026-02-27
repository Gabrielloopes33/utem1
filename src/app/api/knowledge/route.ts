import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// GET /api/knowledge
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("time_knowledge_bases")
      .select("*, time_knowledge_docs(id)")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const bases = data?.map((kb) => ({
      ...kb,
      doc_count: kb.time_knowledge_docs?.length ?? 0,
      time_knowledge_docs: undefined,
    }))

    return NextResponse.json(bases)
  } catch (error) {
    console.error("Error listing knowledge bases:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// POST /api/knowledge
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from("time_knowledge_bases")
      .insert({
        org_id: body.org_id,
        name: body.name,
        description: body.description || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating knowledge base:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
