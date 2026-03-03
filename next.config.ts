import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
  },
  // CORREÇÃO DEFINITIVA: Build ID único por deploy usando COMMIT_REF do Netlify
  // Isso força o Next.js a invalidar todos os chunks corretamente
  generateBuildId: async () => {
    // COMMIT_REF é injetado automaticamente pelo Netlify
    // Fallback para timestamp se não estiver disponível (build local)
    return process.env.COMMIT_REF || `build-${Date.now()}`
  },
}

export default nextConfig
