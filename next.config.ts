import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Desativar otimizações que causam bugs no build
  experimental: {
    optimizeCss: false,
  },
  // Forçar modo standalone para Netlify
  output: "standalone",
  env: {
    // Placeholders para build - substituir no Netlify com valores reais
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
  },
}

export default nextConfig
