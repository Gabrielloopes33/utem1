import { NextResponse } from "next/server"
import { createSystemClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId, name, email, orgName } = await request.json()

    if (!userId || !name || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const slug = (orgName || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const supabase = await createSystemClient()

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from("time_organizations")
      .insert({
        name: orgName || `${name}'s Team`,
        slug: `${slug}-${Date.now().toString(36)}`,
        owner_id: userId,
      })
      .select()
      .single()

    if (orgError) {
      console.error("Error creating org:", orgError)
      return NextResponse.json({ error: orgError.message }, { status: 500 })
    }

    // Create org membership
    const { error: memberError } = await supabase
      .from("time_org_members")
      .insert({
        org_id: org.id,
        user_id: userId,
        role: "owner",
      })

    if (memberError) {
      console.error("Error creating member:", memberError)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({ org })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
