"use client"

import { useState } from "react"
import {
  Zap,
  Activity,
  MessageSquare,
  Users,
  Target,
  Instagram,
  TrendingUp,
  ArrowRight,
  Plus,
  Lightbulb,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { toast } from "sonner"
import { agenteGeneralista } from "@/lib/n8n/client"
import type { Campaign } from "@/types/campaign"

// Dados mockados (esses virão do Supabase depois)
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    org_id: "org-1",
    created_by: "user-1",
    name: "Lançamento FII Autem",
    objective: "conversao",
    format: "lancamento",
    content_types: ["tecnico", "emocional", "autoridade"],
    formats: ["carrossel", "reels"],
    start_date: "2026-03-01",
    end_date: "2026-03-15",
    status: "active",
    metrics: {
      posts_generated: 12,
      posts_published: 8,
      engagement_rate: 4.2,
      reach: 45000,
    },
    created_at: "2026-02-28T10:00:00Z",
    updated_at: "2026-03-01T08:00:00Z",
  },
  {
    id: "2",
    org_id: "org-1",
    created_by: "user-1",
    name: "Educação Financeira",
    objective: "nutricao",
    format: "perpetuo",
    content_types: ["tecnico", "social"],
    formats: ["carrossel", "card"],
    start_date: "2026-02-01",
    status: "active",
    metrics: {
      posts_generated: 24,
      posts_published: 20,
      engagement_rate: 3.8,
      reach: 82000,
    },
    created_at: "2026-01-25T14:00:00Z",
    updated_at: "2026-02-28T16:00:00Z",
  },
]

const MOCK_INSTAGRAM_METRICS = {
  followers: 12800,
  followers_change: 8,
  reach: 45200,
  reach_change: 12,
  engagement: 3.2,
  engagement_change: 15,
  conversion_rate: 1.8,
  conversion_change: 5,
}

const QUICK_IDEAS = [
  "RF vs FII: qual escolher?",
  "5 erros no CDB",
  "Diversificação inteligente",
  "Dúvidas sobre Tesouro",
]

export default function DashboardPage() {
  const [chatMessage, setChatMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatResponse, setChatResponse] = useState<string | null>(null)

  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!chatMessage.trim()) return

    setIsLoading(true)
    setChatResponse(null)

    try {
      // CHAMA O AGENTE GENERALISTA REAL DO N8N
      const response = await agenteGeneralista({
        message: chatMessage,
        history: [],
        userId: "user-1", // TODO: Pegar do auth
      })

      setChatResponse(response)
    } catch (error) {
      console.error("Erro ao chamar agente:", error)
      toast.error("Erro ao gerar ideias", {
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-up space-y-8">
      {/* Hero - Chat de Ideias - CONECTADO AO AGENTE GENERALISTA */}
      <Card className="border-accent-500/20 bg-gradient-to-r from-accent-500/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-accent-500" />
            <h2 className="font-semibold text-lg">Ideias de Conteúdo</h2>
            <Badge variant="secondary" className="text-[10px]">IA</Badge>
          </div>
          
          <form onSubmit={handleChatSubmit} className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Qual tema você quer explorar hoje? (ex: Fundos Imobiliários, CDB, Diversificação...)"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="pr-24 h-12"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !chatMessage.trim()}
                className="absolute right-1 top-1 bottom-1 bg-accent-500 hover:bg-accent-600"
              >
                {isLoading ? (
                  <Zap className="h-4 w-4 animate-pulse" />
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-1" />
                    Gerar
                  </>
                )}
              </Button>
            </div>
            
            {/* Quick suggestions */}
            <div className="flex gap-2 flex-wrap">
              {QUICK_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setChatMessage(idea)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent-500/10 hover:text-accent-500 transition-colors"
                >
                  {idea}
                </button>
              ))}
            </div>
          </form>

          {/* Chat Response */}
          {chatResponse && (
            <div className="mt-4 p-4 bg-card rounded-lg border whitespace-pre-line text-sm">
              {chatResponse}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instagram Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            <h2 className="font-display text-base font-semibold">Métricas Instagram</h2>
            <span className="text-xs text-muted-foreground">@autem.inv</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Ver análise completa
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{MOCK_INSTAGRAM_METRICS.followers_change}%
                </span>
              </div>
              <p className="text-2xl font-bold">
                {(MOCK_INSTAGRAM_METRICS.followers / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-muted-foreground">Seguidores</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{MOCK_INSTAGRAM_METRICS.reach_change}%
                </span>
              </div>
              <p className="text-2xl font-bold">
                {(MOCK_INSTAGRAM_METRICS.reach / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-muted-foreground">Alcance</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{MOCK_INSTAGRAM_METRICS.engagement_change}%
                </span>
              </div>
              <p className="text-2xl font-bold">{MOCK_INSTAGRAM_METRICS.engagement}%</p>
              <p className="text-xs text-muted-foreground">Engajamento</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{MOCK_INSTAGRAM_METRICS.conversion_change}%
                </span>
              </div>
              <p className="text-2xl font-bold">{MOCK_INSTAGRAM_METRICS.conversion_rate}%</p>
              <p className="text-xs text-muted-foreground">Conversão</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Campanhas Ativas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold">Campanhas Ativas</h2>
          <Link
            href="/campanhas"
            className="flex items-center gap-1 text-xs text-accent-500 hover:underline"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_CAMPAIGNS.map((campaign) => (
            <Link key={campaign.id} href={`/campanhas/${campaign.id}`}>
              <Card className="border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {campaign.start_date && new Date(campaign.start_date).toLocaleDateString("pt-BR")}
                        {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString("pt-BR")}`}
                      </p>
                    </div>
                    <StatusBadge status={campaign.status} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-border/50">
                    <div>
                      <p className="text-lg font-bold text-accent-500">
                        {campaign.metrics?.posts_generated || 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Posts</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent-500">
                        {campaign.metrics?.engagement_rate?.toFixed(1) || 0}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Engajamento</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent-500">
                        {(campaign.metrics?.reach || 0) >= 1000 
                          ? `${((campaign.metrics?.reach || 0) / 1000).toFixed(1)}K` 
                          : campaign.metrics?.reach || 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Alcance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {/* Card para criar nova campanha */}
          <Link href="/campanhas">
            <Card className="border-dashed border-border/50 hover:border-accent-500/50 hover:bg-accent-500/5 transition-all duration-200 h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[140px] text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10 mb-2">
                  <Plus className="h-5 w-5 text-accent-500" />
                </div>
                <p className="font-medium text-sm">Nova Campanha</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Criar com auxílio da IA
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="font-display text-base font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/campanhas">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <Target className="h-4 w-4 text-accent-500" />
              <div className="text-left">
                <p className="text-sm font-medium">Campanha</p>
                <p className="text-[10px] text-muted-foreground">Nova campanha</p>
              </div>
            </Button>
          </Link>
          
          <Link href="/personas">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <Users className="h-4 w-4 text-accent-500" />
              <div className="text-left">
                <p className="text-sm font-medium">Persona</p>
                <p className="text-[10px] text-muted-foreground">Criar perfil</p>
              </div>
            </Button>
          </Link>
          
          <Link href="/agentes/concorrentes">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <BarChart3 className="h-4 w-4 text-accent-500" />
              <div className="text-left">
                <p className="text-sm font-medium">Concorrentes</p>
                <p className="text-[10px] text-muted-foreground">Análise de mercado</p>
              </div>
            </Button>
          </Link>
          
          <Link href="/agentes/conteudo">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
              <Zap className="h-4 w-4 text-accent-500" />
              <div className="text-left">
                <p className="text-sm font-medium">Agente</p>
                <p className="text-[10px] text-muted-foreground">Conteúdo generalista</p>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
