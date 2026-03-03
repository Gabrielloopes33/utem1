"use client"

import { useState } from "react"
import { Plus, Target, Calendar, Filter, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { CampaignFilters } from "@/components/campanhas/campaign-filters"
import { CampaignCard } from "@/components/campanhas/campaign-card"
import { CampaignFormModal } from "@/components/campanhas/campaign-form-modal"
import { toast } from "sonner"
import type { Campaign } from "@/types/campaign"

// Dados mockados para demonstração
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


  function handleCreateCampaign(data: Partial<Campaign>) {
    setIsLoading(true)
    
    // Simula chamada ao agente n8n
    setTimeout(() => {
      const newCampaign: Campaign = {
        id: Math.random().toString(36).substring(7),
        org_id: "org-1",
        created_by: "user-1",
        name: data.name || "Nova Campanha",
        objective: data.objective || "conversao",
        format: data.format || "lancamento",
        content_types: data.content_types || ["tecnico"],
        formats: data.formats || ["carrossel"],
        start_date: data.start_date || new Date().toISOString().split('T')[0],
        end_date: data.end_date,
        status: "draft",
        ai_response: `🚀 **Campanha: ${data.name}**

## Calendário de Conteúdo

**Semana 1 (01/03 - 07/03):**
- Post 1: Carrossel técnico sobre ${data.objective}
- Post 2: Reels emocional com case de sucesso

**Semana 2 (08/03 - 15/03):**
- Post 3: Carrossel de autoridade
- Post 4: Reels quebrando objeções

## Métricas Esperadas
- Alcance estimado: 50K pessoas
- Taxa de engajamento: 4-5%
- Leads gerados: 200-300

## Próximos Passos
1. Criar os posts no sistema
2. Agendar publicações
3. Monitorar métricas diariamente`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setCampaigns(prev => [newCampaign, ...prev])
      setFilteredCampaigns(prev => [newCampaign, ...prev])
      setShowCreateModal(false)
      setIsLoading(false)

      toast.success("Campanha criada!", {
        description: "O agente gerou o plano completo. Confira os detalhes.",
      })
    }, 2000)
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10 text-accent-500">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{campaigns.length}</p>
              <p className="text-xs text-muted-foreground">Campanhas totais</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {campaigns.filter(c => c.status === "active").length}
              </p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {campaigns.reduce((acc, c) => acc + (c.metrics?.posts_generated || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Posts gerados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(campaigns.reduce((acc, c) => acc + (c.metrics?.engagement_rate || 0), 0) / (campaigns.filter(c => c.metrics?.engagement_rate).length || 1) * 10) / 10}%
              </p>
              <p className="text-xs text-muted-foreground">Engajamento médio</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                // TODO: Implementar página de detalhes
                toast.info("Ver detalhes", {
                  description: `Abrindo campanha: ${campaign.name}`,
                })
              }}
            />
          ))}
        </div>
      )}

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
