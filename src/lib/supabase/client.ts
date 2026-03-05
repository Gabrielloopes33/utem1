"use client"

import { createBrowserClient } from "@supabase/ssr"

export function createClient(schema: string = "public") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    db: schema !== "public" ? { schema } : undefined,
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  )
}

// Cliente específico para sistema (nexia schema)
export function createSystemClient() {
  return createClient("nexia")
}
