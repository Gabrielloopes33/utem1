"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Plus, Users, TrendingUp, Shield, Zap } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { PageHeader } from "../../../components/shared/page-header"
import { EmptyState } from "../../../components/shared/empty-state"
import { PersonaCard } from "../../../components/personas/persona-card"
import { toast } from "sonner"
import { createClient } from "../../../lib/supabase/client"
import type { Persona, PersonaProfile } from "../../../types/persona"

// Dynamic imports para modais (carregados sob demanda)
const PersonaFormModal = dynamic(
  () => import("../../../components/personas/persona-form-modal").then((m) => ({ default: m.PersonaFormModal })),
  { ssr: false, loading: () => null }
)

const PersonaDetailModal = dynamic(
  () => import("../../../components/personas/persona-detail-modal").then((m) => ({ default: m.PersonaDetailModal })),
  { ssr: false, loading: () => null }
)


// Dados mockados (fallback enquanto não tem no Supabase)
const MOCK_PERSONAS: Persona[] = [
  {
    id: "1",
    user_id: "mock",
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
    created_at: "2026-02-15T10:00:00Z",
    updated_at: "2026-02-15T10:00:00Z",
  },
  {
    id: "2",
    user_id: "mock",
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
    user_id: "mock",
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
  const [personas, setPersonas] = useState<Persona[]>(MOCK_PERSONAS) // Começa com mock
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, _setLoading] = useState(false) // Não precisa loading inicial
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  // Buscar personas do Supabase (opcional - mantém mock se não conseguir)
  useEffect(() => {
    async function fetchPersonas() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from("personas")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.log("Tabela personas não encontrada ou erro, usando mock:", error)
          // Mantém o mock como fallback
        } else if (data && data.length > 0) {
          // Só substitui se tiver dados no banco
          setPersonas(data)
        }
        // Se data for vazio, mantém o mock
      } catch (err) {
        console.log("Erro ao buscar personas, usando mock:", err)
        // Mantém o mock como fallback
      }
    }

    fetchPersonas()
  }, [supabase])

  async function handleCreatePersona(data: {
    name: string
    profile_type: PersonaProfile
    age_range?: string
    income_range?: string
    patrimony_range?: string
  }) {
    setIsLoading(true)

    try {
      // Cria a persona localmente (mock)
      const newPersona: Persona = {
        id: Math.random().toString(36).substring(7),
        user_id: "local",
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Tenta salvar no Supabase (se a tabela existir)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: savedPersona, error } = await supabase
            .from("personas")
            .insert({
              user_id: user.id,
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
            })
            .select()
            .single()

          if (!error && savedPersona) {
            setPersonas((prev) => [savedPersona, ...prev])
          } else {
            setPersonas((prev) => [newPersona, ...prev])
          }
        } else {
          setPersonas((prev) => [newPersona, ...prev])
        }
      } catch {
        // Se falhar, salva localmente
        setPersonas((prev) => [newPersona, ...prev])
      }

      setShowCreateModal(false)
      toast.success("Persona criada!")
    } catch (error) {
      console.error("Erro ao criar persona:", error)
      toast.error("Erro ao criar persona")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeletePersona(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta persona?")) return

    // Remove localmente primeiro
    setPersonas((prev) => prev.filter((p) => p.id !== id))
    toast.success("Persona excluída")

    // Tenta remover do Supabase também (se existir)
    try {
      await supabase.from("personas").delete().eq("id", id)
    } catch {
      // Ignora erro - já removemos localmente
    }
  }

  const profileCounts = personas.reduce((acc, p) => {
    acc[p.profile_type] = (acc[p.profile_type] || 0) + 1
    return acc
  }, {} as Record<PersonaProfile, number>)

  if (loading) {
    return (
      <div className="animate-fade-up space-y-6">
        <PageHeader
          title="Personas de Investidores"
          description="Crie perfis de investidores para direcionar seu conteúdo"
        />
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
        </div>
      </div>
    )
  }

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

      {/* Cards de métricas na parte superior */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Conteúdo principal */}
      <div>
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
                onDelete={() => handleDeletePersona(persona.id)}
              />
            ))}
          </div>
        )}
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
