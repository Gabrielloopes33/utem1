"use client"

import { useState } from "react"
import { BarChart3, RefreshCw, Instagram, TrendingUp, Users, MessageCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { DEFAULT_COMPETITORS, type CompetitorAnalysis } from "@/types/competitor"

// Dados mockados
const MOCK_ANALYSIS: Record<string, CompetitorAnalysis> = {
  xpinvestimentos: {
    handle: "xpinvestimentos",
    name: "XP Investimentos",
    platform: "instagram",
    followers_count: 2300000,
    following_count: 100,
    posts_count: 4520,
    engagement_rate: 2.1,
    posts_per_month: 45,
    avg_reach: 890000,
    growth_90d: {
      followers_change: 45000,
      followers_change_pct: 2.0,
      engagement_trend: "stable",
    },
    content_breakdown: {
      carrossel: 60,
      reels: 30,
      card: 10,
    },
    content_performance: {
      carrossel_avg: 450000,
      reels_avg: 890000,
      card_avg: 120000,
    },
    top_posts: [
      {
        id: "1",
        caption: "Cripto: entenda os riscos e oportunidades 🚀",
        likes: 12500,
        comments: 850,
        reach: 1200000,
        media_type: "reel",
        timestamp: "2026-02-28T18:00:00Z",
        permalink: "https://instagram.com/p/xyz",
        topic: "Criptomoedas",
        why_it_worked: "Conteúdo oportuno sobre tendência de mercado",
      },
      {
        id: "2",
        caption: "RF vs FII: onde investir em 2026? 📊",
        likes: 9800,
        comments: 1200,
        reach: 980000,
        media_type: "carousel",
        timestamp: "2026-02-25T12:00:00Z",
        permalink: "https://instagram.com/p/abc",
        topic: "Comparação de investimentos",
        why_it_worked: "Comparação prática que gera engajamento",
      },
      {
        id: "3",
        caption: "Diversificação: o segredo dos milionários 💰",
        likes: 8200,
        comments: 650,
        reach: 850000,
        media_type: "carousel",
        timestamp: "2026-02-20T15:00:00Z",
        permalink: "https://instagram.com/p/def",
        topic: "Diversificação",
        why_it_worked: "Título chamativo com valor educacional",
      },
    ],
    ai_insights: [
      "Reels sobre 'dúvidas comuns' têm 3x mais compartilhamentos",
      "Conteúdo técnico performa melhor às terças e quintas",
      "Hashtags #rendafixa e #fundosimobiliários dominam",
      "Carrosséis educacionais têm maior tempo de retenção",
    ],
    recommendations: [
      "Criar série 'Desmistificando' seguindo formato dos Reels da XP",
      "Testar horário 19h-21h (melhor engajamento da XP)",
      "Focar em comparações práticas (RF vs FII vs CDB)",
      "Aumentar frequência de Reels (30% da XP vs 10% Autem)",
    ],
    analyzed_at: "2026-03-03T09:00:00Z",
    cached: true,
  },
}

export default function ConcorrentesPage() {
  const [selectedCompetitor, setSelectedCompetitor] = useState<{ handle: string; name: string; platform: string }>(DEFAULT_COMPETITORS[0])
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(MOCK_ANALYSIS.xpinvestimentos)
  const [isLoading, setIsLoading] = useState(false)


  async function handleAnalyze(handle: string) {
    setIsLoading(true)

    // Simula chamada ao agente n8n
    setTimeout(() => {
      const mockData = MOCK_ANALYSIS[handle] || {
        ...MOCK_ANALYSIS.xpinvestimentos,
        handle,
        name: selectedCompetitor.name,
        followers_count: Math.floor(Math.random() * 1000000) + 500000,
      }

      setAnalysis(mockData)
      setIsLoading(false)

      toast.success("Análise completa!", {
        description: `Dados de ${selectedCompetitor.name} atualizados.`,
      })
    }, 2000)
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Análise de Concorrentes"
        description="Monitore a estratégia de conteúdo dos principais players do mercado"
      >
        <Button
          onClick={() => handleAnalyze(selectedCompetitor.handle)}
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Atualizar dados
        </Button>
      </PageHeader>

      {/* Competitor Selector */}
      <div className="flex gap-2 flex-wrap">
        {DEFAULT_COMPETITORS.map((comp) => (
          <Button
            key={comp.handle}
            variant={selectedCompetitor.handle === comp.handle ? "default" : "outline"}
            onClick={() => {
              setSelectedCompetitor(comp)
              setAnalysis(null)
            }}
            className={cn(
              "gap-2",
              selectedCompetitor.handle === comp.handle && "bg-accent-500 hover:bg-accent-600"
            )}
          >
            <Instagram className="h-4 w-4" />
            {comp.name}
          </Button>
        ))}
      </div>

      {analysis && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10 text-accent-500">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {(analysis.followers_count / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-muted-foreground">Seguidores</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{analysis.engagement_rate}%</p>
                  <p className="text-xs text-muted-foreground">Engajamento</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{analysis.posts_per_month}</p>
                  <p className="text-xs text-muted-foreground">Posts/mês</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {(analysis.avg_reach / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-muted-foreground">Alcance médio</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="content" className="space-y-4">
            <TabsList>
              <TabsTrigger value="content">Análise de Conteúdo</TabsTrigger>
              <TabsTrigger value="posts">Top Posts</TabsTrigger>
              <TabsTrigger value="insights">Insights da IA</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Distribuição de Conteúdo</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analysis.content_breakdown).map(([type, percentage]) => (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{type}</span>
                          <span className="font-medium">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              <div className="grid gap-4">
                {analysis.top_posts.map((post, i) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                          <span className="font-bold text-lg">#{i + 1}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium line-clamp-2">{post.caption}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {post.likes.toLocaleString()} curtidas
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.comments.toLocaleString()} comentários
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {post.media_type === "carousel" ? "Carrossel" : "Reels"}
                            </Badge>
                          </div>
                          {post.why_it_worked && (
                            <p className="text-xs text-accent-500">
                              ✓ {post.why_it_worked}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Insights da IA</h3>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.ai_insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-accent-500">
                    Recomendações para Autem
                  </h3>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-accent-500/10 text-accent-500 flex items-center justify-center text-xs shrink-0">
                          {i + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
