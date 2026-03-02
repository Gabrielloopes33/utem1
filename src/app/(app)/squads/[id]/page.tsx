"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Users, Pencil, Bot, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { AgentCard } from "@/components/agents/agent-card"
import { SquadFormDialog } from "@/components/squads/squad-form-dialog"
import { toast } from "sonner"
import type { Squad, Agent } from "@/types/database"

export default function SquadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [squad, setSquad] = useState<Squad | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  const fetchSquad = useCallback(async () => {
    try {
      const res = await fetch(`/api/squads/${params.id}`)
      if (!res.ok) {
        router.push("/squads")
        return
      }
      const data = await res.json()
      setSquad(data)
      setAgents(data.time_agents || [])
    } catch {
      router.push("/squads")
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    fetchSquad()
  }, [fetchSquad])

  async function handleDelete() {
    if (!squad || !confirm("Tem certeza que deseja deletar este squad?")) return
    try {
      const res = await fetch(`/api/squads/${squad.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Squad deletado")
        router.push("/squads")
      }
    } catch {
      toast.error("Erro ao deletar")
    }
  }

  if (loading) {
    return <div className="animate-shimmer h-48 rounded-xl" />
  }

  if (!squad) return null

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: squad.color + "18" }}
        >
          {squad.icon || "🤖"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold">{squad.name}</h1>
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: squad.color }}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {agents.length} agente{agents.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEdit(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-muted-foreground hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {squad.description && (
        <p className="text-sm text-muted-foreground mb-6">
          {squad.description}
        </p>
      )}

      {/* Tabs */}
      <Tabs defaultValue="agents">
        <TabsList className="mb-6">
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Execucoes</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          {agents.length === 0 ? (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bot className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Nenhum agente neste squad
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/agents/new")}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Criar Agente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflows">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Nenhum workflow associado
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Nenhuma execução registrada
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SquadFormDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        squad={squad}
        onSaved={fetchSquad}
      />
    </div>
  )
}
