import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Cliente para schema padrão (public) - Knowledge base
export async function createClient(schema: string = "public") {
  const cookieStore = await cookies()

  const options: any = {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Record<string, string>)
          )
        } catch {
          // setAll called from Server Component — ignore
        }
      },
    },
  }

  // Só adiciona schema se não for public (padrão)
  if (schema !== "public") {
    options.db = { schema }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  )
}

// Cliente específico para sistema (nexia schema)
export async function createSystemClient() {
  return createClient("nexia")
}
