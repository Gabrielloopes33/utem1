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
  // Build ID único por deploy usando COMMIT_REF do Netlify
  generateBuildId: async () => {
    return process.env.COMMIT_REF || `build-${Date.now()}`
  },
  // CORREÇÃO DEFINITIVA: Zera o cache do router client-side
  // Garante que o Next.js nunca sirva RSC payloads antigos entre navegações
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
}

export default nextConfig
