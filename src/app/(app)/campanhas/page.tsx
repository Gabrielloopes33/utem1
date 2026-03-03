"use client"

// Força o Next.js a nunca pré-cachear o HTML desta rota
export const revalidate = 0
export const dynamic = "force-dynamic"

import { useState } from "react"
import { Plus, Target, Calendar, Filter, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { CampaignFilters } from "@/components/campanhas/campaign-filters"
import { CampaignCard } from "@/components/campanhas/campaign-card"
import { CampaignFormModal } from "@/components/campanhas/campaign-form-modal"
import { toast } from "sonner"
import { agenteCampanhas } from "@/lib/n8n/client"
import type { Campaign, CampaignObjective, CampaignFormat, ContentType, FormatType } from "@/types/campaign"

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
    ai_response: "Campanha estruturada com sucesso...",
    created_at: "2026-02-28T10:00:00Z",
    updated_at: "2026-03-01T08:00:00Z",
  },
  {
    id: "2",
    org_id: "org-1",
    created_by: "user-1",
    name: "Educação Financeira - Nutrição",
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
  {
    id: "3",
    org_id: "org-1",
    created_by: "user-1",
    name: "Campanha Interna Q1",
    objective: "atracao",
    format: "interna",
    content_types: ["emocional", "objecao"],
    formats: ["reels"],
    start_date: "2026-03-10",
    end_date: "2026-03-31",
    status: "draft",
    created_at: "2026-03-02T09:00:00Z",
    updated_at: "2026-03-02T09:00:00Z",
  },
]

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS)
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleCreateCampaign(data: {
    name: string
    objective: CampaignObjective
    format: CampaignFormat
    content_types: ContentType[]
    formats: FormatType[]
    start_date: string
    end_date?: string
  }) {
    setIsLoading(true)
    
    try {
      // CHAMA O AGENTE CAMPANHAS REAL DO N8N
      const aiResponse = await agenteCampanhas({
        nome: data.name,
        objetivo: data.objective,
        formato: data.format,
        tiposConteudo: data.content_types,
        formatos: data.formats,
        periodo: {
          inicio: data.start_date,
          fim: data.end_date || data.start_date,
        },
      })

      const newCampaign: Campaign = {
        id: Math.random().toString(36).substring(7),
        org_id: "org-1",
        created_by: "user-1",
        name: data.name,
        objective: data.objective,
        format: data.format,
        content_types: data.content_types,
        formats: data.formats,
        start_date: data.start_date,
        end_date: data.end_date,
        status: "draft",
        ai_response: aiResponse,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setCampaigns(prev => [newCampaign, ...prev])
      setFilteredCampaigns(prev => [newCampaign, ...prev])
      setShowCreateModal(false)

      toast.success("Campanha criada!", {
        description: "O agente gerou o plano completo. Confira os detalhes.",
      })
    } catch (error) {
      console.error("Erro ao criar campanha:", error)
      toast.error("Erro ao criar campanha", {
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleFilterChange(filters: {
    status?: string
    objective?: string
    search?: string
  }) {
    let filtered = campaigns

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(c => c.status === filters.status)
    }

    if (filters.objective && filters.objective !== "all") {
      filtered = filtered.filter(c => c.objective === filters.objective)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search)
      )
    }

    setFilteredCampaigns(filtered)
  }

  const totalPosts = campaigns.reduce((acc, c) => acc + (c.metrics?.posts_generated || 0), 0)
  const avgEngagement = Math.round(
    campaigns.reduce((acc, c) => acc + (c.metrics?.engagement_rate || 0), 0) / 
    (campaigns.filter(c => c.metrics?.engagement_rate).length || 1) * 10
  ) / 10

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Campanhas"
        description="Crie e gerencie campanhas de marketing com auxílio da IA"
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-accent-500 hover:bg-accent-600 gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Campanha
        </Button>
      </PageHeader>

      {/* Layout com sidebar de métricas */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar com métricas (2 cols) */}
        <div className="col-span-12 md:col-span-2 space-y-3">
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-xl font-bold">{campaigns.length}</p>
              <p className="text-[10px] text-muted-foreground">Campanhas</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Ativas</span>
              </div>
              <p className="text-xl font-bold">
                {campaigns.filter(c => c.status === "active").length}
              </p>
              <p className="text-[10px] text-muted-foreground">Em andamento</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Posts</span>
              </div>
              <p className="text-xl font-bold">{totalPosts}</p>
              <p className="text-[10px] text-muted-foreground">Gerados</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Engajamento</span>
              </div>
              <p className="text-xl font-bold">{avgEngagement}%</p>
              <p className="text-[10px] text-muted-foreground">Média</p>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo principal (10 cols) */}
        <div className="col-span-12 md:col-span-10 space-y-6">
          {/* Filters */}
          <CampaignFilters onFilterChange={handleFilterChange} />

          {/* Campaigns Grid */}
          {filteredCampaigns.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Nenhuma campanha encontrada"
              description="Crie sua primeira campanha e deixe a IA estruturar o plano completo."
            >
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-accent-500 hover:bg-accent-600 gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar Campanha
              </Button>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onViewDetails={() => {
                    toast.info("Ver detalhes", {
                      description: `Abrindo campanha: ${campaign.name}`,
                    })
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CampaignFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateCampaign}
        isLoading={isLoading}
      />
    </div>
  )
}
