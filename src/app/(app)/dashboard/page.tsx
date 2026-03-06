"use client"

import { useState } from "react"
import {
  Activity,
  Instagram,
  Users,
  TrendingUp,
  Heart,
  Eye,
  TrendingDown,
  Bug,
} from "lucide-react"
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Componente de thumbnail de post com tratamento de erro
function PostThumbnail({ url, title, type }: { url?: string; title: string; type: string }) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Extrair primeira letra ou número do título para o fallback
  const initial = title.charAt(0).toUpperCase()
  
  // Cor baseada no tipo de conteúdo
  const typeColors: Record<string, string> = {
    "Carrossel": "from-blue-400 to-blue-600",
    "Reels": "from-purple-400 to-pink-500",
    "Imagem": "from-green-400 to-emerald-600",
    "Vídeo": "from-orange-400 to-red-500",
    "Card": "from-gray-400 to-gray-600",
  }
  const gradient = typeColors[type] || "from-pink-400 to-purple-500"
  
  // Tentar usar imagem via proxy se a URL direta falhar
  const proxyUrl = url ? `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=100&h=100&fit=cover` : null
  
  if (!url || error) {
    return (
      <div className={`relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${gradient} shadow-sm flex items-center justify-center`}>
        <span className="text-white font-bold text-lg">{initial}</span>
      </div>
    )
  }

  return (
    <div className={`relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${gradient} shadow-sm`}>
      <img 
        src={proxyUrl || url}
        alt={title}
        className={`h-full w-full object-cover transition-all duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  // Métricas reais dos concorrentes (via Apify + Supabase)
  const { metrics: dashboardMetrics, isLoading: isLoadingMetrics } = useDashboardMetrics()

  return (
    <div className="animate-fade-up space-y-6">
      {/* Título */}
      <div className="flex items-center gap-2">
        <Instagram className="h-6 w-6 text-pink-500" />
        <h1 className="font-display text-xl font-semibold">Métricas Insta</h1>
        <span className="text-xs text-muted-foreground">@autem.inv</span>
      </div>

      {/* Layout Principal - 3 Colunas */}
      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar Esquerda - Métricas Verticais (2 cols) */}
        <div className="col-span-12 md:col-span-2 space-y-3">
          {/* Seguidores */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Seguidores</span>
              </div>
              <p className="text-xl font-bold">
                {isLoadingMetrics ? "-" : `${(dashboardMetrics?.instagram.followers || 0) / 1000}K`}
              </p>
              {!isLoadingMetrics && dashboardMetrics && (
                <div className="flex items-center gap-1 mt-1">
                  {dashboardMetrics.instagram.followers_change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${dashboardMetrics.instagram.followers_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dashboardMetrics.instagram.followers_change >= 0 ? '+' : ''}{dashboardMetrics.instagram.followers_change}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Curtidas */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Curtidas</span>
              </div>
              <p className="text-xl font-bold">
                {isLoadingMetrics ? "-" : `${(dashboardMetrics?.instagram.likes || 0) / 1000}K`}
              </p>
              {!isLoadingMetrics && dashboardMetrics && (
                <div className="flex items-center gap-1 mt-1">
                  {dashboardMetrics.instagram.likes_change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${dashboardMetrics.instagram.likes_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dashboardMetrics.instagram.likes_change >= 0 ? '+' : ''}{dashboardMetrics.instagram.likes_change}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visualizações */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Visualizações</span>
              </div>
              <p className="text-xl font-bold">
                {isLoadingMetrics ? "-" : `${(dashboardMetrics?.instagram.views || 0) / 1000}K`}
              </p>
              {!isLoadingMetrics && dashboardMetrics && (
                <div className="flex items-center gap-1 mt-1">
                  {dashboardMetrics.instagram.views_change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${dashboardMetrics.instagram.views_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dashboardMetrics.instagram.views_change >= 0 ? '+' : ''}{dashboardMetrics.instagram.views_change}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Taxa de Engajamento */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Taxa de Engajamento</span>
              </div>
              <p className="text-xl font-bold">
                {isLoadingMetrics ? "-" : `${dashboardMetrics?.instagram.engagement || 0}%`}
              </p>
              {!isLoadingMetrics && dashboardMetrics && (
                <div className="flex items-center gap-1 mt-1">
                  {dashboardMetrics.instagram.engagement_change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${dashboardMetrics.instagram.engagement_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dashboardMetrics.instagram.engagement_change >= 0 ? '+' : ''}{dashboardMetrics.instagram.engagement_change}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Central - Performance e Crescimento (5 cols) */}
        <div className="col-span-12 md:col-span-5 space-y-4">
          {/* Performance por Tipo de Conteúdo */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Performance por Tipo de Conteúdo</CardTitle>
              <p className="text-[10px] text-muted-foreground">Baseado na análise de concorrentes</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {isLoadingMetrics ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-4 w-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  dashboardMetrics?.contentPerformance.map((item) => (
                    <div key={item.type} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.type}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Crescimento dos Últimos 30 Dias - Gráfico 1 */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Crescimento dos Últimos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end gap-2 h-24">
                {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95].map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-accent-500/20 rounded-t-sm hover:bg-accent-500/40 transition-colors"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>Day 1</span>
                <span>Day 10</span>
                <span>Day 20</span>
                <span>Day 30</span>
              </div>
            </CardContent>
          </Card>

          {/* Crescimento dos Últimos 30 Dias - Gráfico 2 (Alcance) */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Crescimento dos Últimos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end gap-2 h-24">
                {[30, 40, 35, 50, 60, 55, 70, 65, 80, 85].map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>Day 1</span>
                <span>Day 10</span>
                <span>Day 20</span>
                <span>Day 30</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Posts (5 cols) */}
        <div className="col-span-12 md:col-span-5 flex flex-col h-full">
          {/* Posts com Maior Engajamento - Expandido */}
          <Card className="border-border/50 flex-1 flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Posts com Maior Engajamento</CardTitle>
                <a 
                  href="https://instagram.com/autem.inv" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-full transition-colors"
                >
                  <Instagram className="h-3 w-3" />
                  Ver perfil
                </a>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {isLoadingMetrics ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-4 w-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  dashboardMetrics?.topPosts.slice(0, 10).map((post, index) => (
                    <a
                      key={post.id}
                      href={post.permalink || `https://instagram.com/p/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-all cursor-pointer group border border-transparent hover:border-accent-500/20"
                    >
                      {/* Número de ranking */}
                      <span className="text-xs font-bold text-muted-foreground w-5 text-center">{index + 1}</span>
                      
                      {/* Preview da arte */}
                      <PostThumbnail url={post.thumbnailUrl} title={post.title} type={post.type} />
                      
                      {/* Informações do post */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-accent-500 transition-colors leading-tight">{post.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                            {post.type}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Métricas */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-accent-500">{post.engagement}</p>
                        <p className="text-[10px] text-muted-foreground">{post.likes} likes</p>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t pt-4 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© 2026 Autem. Todos os direitos reservados.</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">v1.0.0</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Sistemas no ar</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
              <Bug className="h-3 w-3" />
              Debug
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
