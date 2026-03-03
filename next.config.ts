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
  // Desabilitar o cache do webpack entre builds para evitar conflitos
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.cache = false
    }
    return config
  },
  // Garantir que os assets sejam versionados corretamente
  generateBuildId: async () => {
    // Gera um build ID único baseado no timestamp
    return `build-${Date.now()}`
  },
}

export default nextConfig
