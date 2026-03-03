"use client"

import { useState, useEffect } from "react"
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
import { createClient } from "@/lib/supabase/client"
import type { Persona, PersonaProfile } from "@/types/persona"

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  // Buscar personas do Supabase
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
          console.error("Erro ao buscar personas:", error)
          toast.error("Erro ao carregar personas")
        } else {
          setPersonas(data || [])
        }
      } catch (err) {
        console.error("Erro:", err)
      } finally {
        setLoading(false)
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Usuário não autenticado")
        return
      }

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

      // Parse da resposta da IA (assumindo que vem em formato estruturado)
      let parsedData: any = {}
      try {
        // Tenta extrair JSON da resposta
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0])
        }
      } catch {
        // Se não conseguir parsear, usa valores padrão
        parsedData = {}
      }

      // Salva no Supabase
      const { data: newPersona, error } = await supabase
        .from("personas")
        .insert({
          user_id: user.id,
          name: data.name,
          profile_type: data.profile_type,
          age_range: data.age_range,
          income_range: data.income_range,
          patrimony_range: data.patrimony_range,
          objectives: parsedData.objectives || [],
          fears: parsedData.fears || [],
          interests: parsedData.interests || [],
          communication_tone: parsedData.communication_tone || "",
          preferred_channels: parsedData.preferred_channels || {},
          conversion_triggers: parsedData.conversion_triggers || [],
          ai_response: aiResponse,
        })
        .select()
        .single()

      if (error) {
        console.error("Erro ao salvar persona:", error)
        toast.error("Erro ao salvar persona")
        return
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

  async function handleDeletePersona(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta persona?")) return

    try {
      const { error } = await supabase
        .from("personas")
        .delete()
        .eq("id", id)

      if (error) {
        toast.error("Erro ao excluir persona")
        return
      }

      setPersonas((prev) => prev.filter((p) => p.id !== id))
      toast.success("Persona excluída")
    } catch {
      toast.error("Erro ao excluir persona")
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
