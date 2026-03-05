"use client"

import Image from "next/image"
import {
  Instagram,
  Users,
  TrendingUp,
  Heart,
  Eye,
  TrendingDown,
  Bug,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { 
  CONTENT_TYPE_COLORS, 
  GROWTH_DATA_30_DAYS, 
  REACH_DATA_30_DAYS,
  DASHBOARD_CONFIG 
} from "../../../lib/constants/dashboard"
import type { DashboardMetrics } from "../../../lib/data/dashboard"

interface DashboardClientProps {
  initialMetrics: DashboardMetrics
}

// Componente de thumbnail otimizado
function PostThumbnail({ 
  url, 
  title, 
  type,
  index = 0 
}: { 
  url?: string; 
  title: string; 
  type: string;
  index?: number;
}) {
  const initial = title.charAt(0).toUpperCase()
  const gradient = CONTENT_TYPE_COLORS[type] || "from-pink-400 to-purple-500"
  const imageUrl = url ? `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=100&h=100&fit=cover` : null
  const isPriority = index < DASHBOARD_CONFIG.PRIORITY_IMAGES_COUNT
  
  return (
    <div className={`relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${gradient} shadow-sm`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          width={56}
          height={56}
          className="object-cover transition-opacity duration-300"
          loading={isPriority ? "eager" : "lazy"}
          priority={isPriority}
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{initial}</span>
        </div>
      )}
    </div>
  )
}

export function DashboardClient({ initialMetrics }: DashboardClientProps) {
  const dashboardMetrics = initialMetrics

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
                {`${(dashboardMetrics?.instagram.followers || 0) / 1000}K`}
              </p>
              {dashboardMetrics && (
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
                {`${(dashboardMetrics?.instagram.likes || 0) / 1000}K`}
              </p>
              {dashboardMetrics && (
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
                {`${(dashboardMetrics?.instagram.views || 0) / 1000}K`}
              </p>
              {dashboardMetrics && (
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
        </div>

        {/* Coluna Central - Gráficos (5 cols) */}
        <div className="col-span-12 md:col-span-5 space-y-4">
          {/* Performance por Tipo de Conteúdo */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Performance por Tipo</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {dashboardMetrics?.contentPerformance.map((item) => (
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
                ))}
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
                {GROWTH_DATA_30_DAYS.map((value, i) => (
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
                {REACH_DATA_30_DAYS.map((value, i) => (
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
                {dashboardMetrics?.topPosts.slice(0, 10).map((post, index) => (
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
                    <PostThumbnail 
                      url={post.thumbnailUrl} 
                      title={post.title} 
                      type={post.type} 
                      index={index}
                    />
                    
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
                ))}
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
