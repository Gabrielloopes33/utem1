"use client"

// Força o Next.js a nunca pré-cachear o HTML desta rota
export const revalidate = 0

import { useState } from "react"
import { Plus, Users, TrendingUp, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PersonaCard } from "@/components/personas/persona-card"
import { PersonaFormModal } from "@/components/personas/persona-form-modal"
import { PersonaDetailModal } from "@/components/personas/persona-detail-modal"
import { toast } from "sonner"
import { agentePersonas } from "@/lib/n8n/client"
import type { Persona, PersonaProfile } from "@/types/persona"

// Dados mockados (esses virão do Supabase depois)
const MOCK_PERSONAS: Persona[] = [
  {
    id: "1",
    org_id: "org-1",
    created_by: "user-1",
    name: "Fernanda",
    profile_type: "moderado",
    age_range: "35-45 anos",
    income_range: "R$ 15K-30K/mês",
    patrimony_range: "R$ 200K-500K",
    objectives: ["Independência financeira", "Aposentadoria tranquila", "Diversificação"],
    fears: ["Perder dinheiro", "Não saber investir", "Inflação"],
    interests: ["Fundos Imobiliários", "Ações de dividendos", "Tesouro Direto"],
    communication_tone: "Equilibrado, educativo, exemplos práticos",
    preferred_channels: { Instagram: 85, YouTube: 70, LinkedIn: 50 },
    conversion_triggers: ["Diversificação inteligente", "Cases de sucesso", "Educação financeira"],
    ai_response: "Persona criada com sucesso...",
    created_at: "2026-02-15T10:00:00Z",
    updated_at: "2026-02-15T10:00:00Z",
  },
  {
    id: "2",
    org_id: "org-1",
    created_by: "user-1",
    name: "Carlos",
    profile_type: "conservador",
    age_range: "50-60 anos",
    income_range: "R$ 20K-40K/mês",
    patrimony_range: "R$ 500K-1M",
    objectives: ["Preservar capital", "Renda extra", "Segurança"],
    fears: ["Volatilidade", "Perder patrimônio", "Falta de liquidez"],
    interests: ["Renda Fixa", "CDB", "Tesouro Selic", "Previdência"],
    communication_tone: "Formal, seguro, baseado em dados históricos",
    preferred_channels: { Instagram: 60, YouTube: 80, Email: 70 },
    conversion_triggers: ["Garantias", "Certificações", "Tempo no mercado"],
    created_at: "2026-02-10T14:00:00Z",
    updated_at: "2026-02-10T14:00:00Z",
  },
  {
    id: "3",
    org_id: "org-1",
    created_by: "user-1",
    name: "Amanda",
    profile_type: "agressivo",
    age_range: "25-35 anos",
    income_range: "R$ 25K-50K/mês",
    patrimony_range: "R$ 100K-300K",
    objectives: ["Multiplicar patrimônio", "Independência precoce", "Alto retorno"],
    fears: ["Perder oportunidades", "Retornos baixos", "Ficar para trás"],
    interests: ["Ações growth", "Criptomoedas", "Startups", "Day trade"],
    communication_tone: "Direto, ambicioso, focado em resultados",
    preferred_channels: { Instagram: 95, Twitter: 85, YouTube: 75 },
    conversion_triggers: ["Alto retorno", "Inovação", "Exclusividade"],
    created_at: "2026-02-20T09:00:00Z",
    updated_at: "2026-02-20T09:00:00Z",
  },
]

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>(MOCK_PERSONAS)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleCreatePersona(data: {
    name: string
    profile_type: PersonaProfile
    age_range?: string
    income_range?: string
    patrimony_range?: string
  }) {
    setIsLoading(true)

    try {
      // CHAMA O AGENTE PERSONAS REAL DO N8N
      const aiResponse = await agentePersonas({
        acao: "criar",
        nome: data.name,
        perfil: data.profile_type,
        dados: {
          idade: data.age_range ? parseInt(data.age_range) : undefined,
          renda: data.income_range,
          patrimonio: data.patrimony_range,
        },
      })

      const newPersona: Persona = {
        id: Math.random().toString(36).substring(7),
        org_id: "org-1",
        created_by: "user-1",
        name: data.name,
        profile_type: data.profile_type,
        age_range: data.age_range,
        income_range: data.income_range,
        patrimony_range: data.patrimony_range,
        objectives: [],
        fears: [],
        interests: [],
        preferred_channels: {},
        conversion_triggers: [],
        ai_response: aiResponse,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setPersonas((prev) => [newPersona, ...prev])
      setShowCreateModal(false)

      toast.success("Persona criada!", {
        description: "O agente gerou o perfil completo.",
      })
    } catch (error) {
      console.error("Erro ao criar persona:", error)
      toast.error("Erro ao criar persona", {
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const profileCounts = personas.reduce((acc, p) => {
    acc[p.profile_type] = (acc[p.profile_type] || 0) + 1
    return acc
  }, {} as Record<PersonaProfile, number>)

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Personas de Investidores"
        description="Crie perfis de investidores para direcionar seu conteúdo"
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-accent-500 hover:bg-accent-600 gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Persona
        </Button>
      </PageHeader>

      {/* Layout com sidebar de métricas */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar com métricas (2 cols) */}
        <div className="col-span-12 md:col-span-2 space-y-3">
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-xl font-bold">{personas.length}</p>
              <p className="text-[10px] text-muted-foreground">Personas</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Conservadores</span>
              </div>
              <p className="text-xl font-bold">{profileCounts.conservador || 0}</p>
              <p className="text-[10px] text-muted-foreground">Perfil seguro</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Moderados</span>
              </div>
              <p className="text-xl font-bold">{profileCounts.moderado || 0}</p>
              <p className="text-[10px] text-muted-foreground">Perfil equilibrado</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Agressivos</span>
              </div>
              <p className="text-xl font-bold">{profileCounts.agressivo || 0}</p>
              <p className="text-[10px] text-muted-foreground">Perfil ousado</p>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo principal (10 cols) */}
        <div className="col-span-12 md:col-span-10">
          {personas.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhuma persona criada"
              description="Crie personas para entender melhor seu público e criar conteúdo direcionado."
            >
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-accent-500 hover:bg-accent-600 gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar Persona
              </Button>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {personas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  onClick={() => setSelectedPersona(persona)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <PersonaFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreatePersona}
        isLoading={isLoading}
      />

      {/* Detail Modal */}
      <PersonaDetailModal
        persona={selectedPersona}
        open={!!selectedPersona}
        onOpenChange={() => setSelectedPersona(null)}
      />
    </div>
  )
}
