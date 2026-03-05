"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Users, Plus } from "lucide-react"
import { PageHeader } from "../../../components/shared/page-header"
import { EmptyState } from "../../../components/shared/empty-state"
import { SquadCard } from "../../../components/squads/squad-card"
import { Button } from "../../../components/ui/button"
import type { Squad } from "../../../types/database"

// Dynamic import para modal de squad (carregado sob demanda)
const SquadFormDialog = dynamic(
  () => import("../../../components/squads/squad-form-dialog").then((m) => ({ default: m.SquadFormDialog })),
  { ssr: false, loading: () => null }
)

export default function SquadsPage() {
  const [squads, setSquads] = useState<(Squad & { agent_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const fetchSquads = useCallback((showLoader = true) => {
    if (showLoader) setLoading(true)

    fetch("/api/squads")
      .then((res) => res.json())
      .then((data) => setSquads(Array.isArray(data) ? data : []))
      .catch(() => setSquads([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      fetchSquads(false)
    })
  }, [fetchSquads])

  return (
    <div className="animate-fade-up">
      <PageHeader title="Squads" description="Organize seus agentes em times">
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-accent-500 hover:bg-accent-600 gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Squad
        </Button>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer h-32 rounded-xl" />
          ))}
        </div>
      ) : squads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum squad criado"
          description="Squads organizam seus agentes em times temáticos. Crie seu primeiro squad para começar."
        >
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-accent-500 hover:bg-accent-600 gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Squad
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {squads.map((squad) => (
            <SquadCard key={squad.id} squad={squad} />
          ))}
        </div>
      )}

      <SquadFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSaved={fetchSquads}
      />
    </div>
  )
}
