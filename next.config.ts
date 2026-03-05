import type { NextConfig } from "next"
import withBundleAnalyzer from "@next/bundle-analyzer"

const nextConfig: NextConfig = {
  // Configuração de imagens otimizada
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.weserv.nl' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // Build ID único por deploy usando COMMIT_REF do Netlify
  generateBuildId: async () => {
    return process.env.COMMIT_REF || `build-${Date.now()}`
  },
  
  // Otimizações experimentais
  experimental: {
    // Cache do router otimizado (não zerado)
    staleTimes: {
      dynamic: 30,   // 30 segundos
      static: 300,   // 5 minutos
    },
    // Otimizar imports de pacotes grandes
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Configurações de build
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Habilitar compressão gzip/brotli
  
  // Para deploy em VPS/Docker (opcional, reduz tamanho)
  // Descomente a linha abaixo para VPS se quiser build standalone
  // output: 'standalone',
  
  // Redirecionamentos (opcional)
  async redirects() {
    return [
      // Exemplo: redirecionar versões antigas
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ]
  },
  
  // Headers adicionais (complemento ao netlify.toml)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ]
      }
    ]
  },
}

// Bundle Analyzer - apenas quando ANALYZE=true
const config = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer({ 
      enabled: true,
      openAnalyzer: true,
    })(nextConfig)
  : nextConfig

export default config
