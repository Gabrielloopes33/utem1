"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Plus, Target, Calendar, Sparkles, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { CampaignFilters } from "@/components/campanhas/campaign-filters"
import { CampaignCard } from "@/components/campanhas/campaign-card"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Campaign, CampaignObjective, CampaignStatus, ContentType, FormatType } from "@/types/campaign"

// Dynamic import para modal de campanha (carregado sob demanda)
const CampaignFormModal = dynamic(
  () => import("@/components/campanhas/campaign-form-modal").then((m) => ({ default: m.CampaignFormModal })),
  { ssr: false, loading: () => null }
)

// Tipo para campanha do banco
interface DBCampaign {
  id: string
  user_id: string
  name: string
  objective: CampaignObjective
  status: 'ativo' | 'pausado' | 'concluido'
  start_date: string | null
  end_date: string | null
  target_persona: string | null
  metadata: {
    tipoConteudo?: string
    formato?: string
    perfilPersona?: string
    tema?: string
  }
  created_at: string
  updated_at: string
}

// Usar tipo Campaign importado de @/types/campaign

const STATUS_MAP: Record<'ativo' | 'pausado' | 'concluido', CampaignStatus> = {
  ativo: 'active',
  pausado: 'paused',
  concluido: 'completed'
}

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Buscar campanhas do Supabase
  const loadCampaigns = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Usuário não autenticado")
        return
      }

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar campanhas:", error)
        toast.error("Erro ao carregar campanhas")
        return
      }

      // Mapear dados do banco para o formato da UI
      const mappedCampaigns: Campaign[] = (data || []).map((c: DBCampaign) => ({
        id: c.id,
        org_id: c.user_id,
        created_by: c.user_id,
        name: c.name,
        objective: c.objective,
        format: (c.metadata?.formato === 'reels' ? 'lancamento' : 
                c.metadata?.formato === 'carrossel' ? 'perpetuo' : 'interna') as 'lancamento' | 'perpetuo' | 'interna',
        content_types: (c.metadata?.tipoConteudo ? [c.metadata.tipoConteudo] : ['tecnico']) as ContentType[],
        formats: (c.metadata?.formato ? [c.metadata.formato] : ['carrossel']) as FormatType[],
        start_date: c.start_date || new Date().toISOString(),
        end_date: c.end_date || undefined,
        status: STATUS_MAP[c.status] || 'draft',
        ai_response: c.metadata?.tema,
        metrics: {
          posts_generated: 0,
          posts_published: 0,
          engagement_rate: 0,
          reach: 0,
        },
        created_at: c.created_at,
        updated_at: c.updated_at,
      }))

      setCampaigns(mappedCampaigns)
      setFilteredCampaigns(mappedCampaigns)
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao carregar campanhas")
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  async function handleCreateCampaign(data: {
    name: string
    objective: CampaignObjective
    format: 'lancamento' | 'perpetuo' | 'interna'
    content_types: string[]
    formats: string[]
    start_date: string
    end_date?: string
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Usuário não autenticado")
        return
      }

      // Inserir no banco
      const { error } = await supabase
        .from("campaigns")
        .insert({
          user_id: user.id,
          name: data.name,
          objective: data.objective,
          status: 'ativo',
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          metadata: {
            formato: data.formats[0],
            tipoConteudo: data.content_types[0],
          }
        })

      if (error) {
        console.error("Erro ao criar campanha:", error)
        toast.error("Erro ao criar campanha")
        return
      }

      toast.success("Campanha criada com sucesso!")
      setShowCreateModal(false)
      
      // Recarregar lista
      await loadCampaigns()
      
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao criar campanha")
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
        description="Gerencie suas campanhas de marketing criadas com auxílio da IA"
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-accent-500 hover:bg-accent-600 gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Campanha
        </Button>
      </PageHeader>

      {/* Cards de métricas na parte superior */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-xl font-bold">{isLoading ? '-' : campaigns.length}</p>
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
              {isLoading ? '-' : campaigns.filter(c => c.status === "active").length}
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
            <p className="text-xl font-bold">{isLoading ? '-' : totalPosts}</p>
            <p className="text-[10px] text-muted-foreground">Gerados</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Engajamento</span>
            </div>
            <p className="text-xl font-bold">{isLoading ? '-' : avgEngagement}%</p>
            <p className="text-[10px] text-muted-foreground">Média</p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo principal */}
      <div className="space-y-6">
        {/* Filters */}
        <CampaignFilters onFilterChange={handleFilterChange} />

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
          </div>
        )}

        {/* Campaigns Grid */}
        {!isLoading && (
          <>
            {filteredCampaigns.length === 0 ? (
              <EmptyState
                icon={Target}
                title="Nenhuma campanha encontrada"
                description="Crie sua primeira campanha usando o Agente de Campanhas ou clique em Nova Campanha."
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
                      // Verificar se tem conversation_id nos metadados
                      const conversationId = (campaign as { metadata?: { conversation_id?: string } }).metadata?.conversation_id
                      if (conversationId) {
                        // Redirecionar para o agente com a conversa
                        window.location.href = `/agentes/campanhas?conversation=${conversationId}`
                      } else {
                        // Se não tem conversa vinculada, mostra toast
                        toast.info("Campanha sem conversa vinculada", {
                          description: `Esta campanha foi criada manualmente: ${campaign.name}`,
                        })
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
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
