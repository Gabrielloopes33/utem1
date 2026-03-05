"use client"

import { useEffect, useState } from "react"
import { Bot } from "lucide-react"
import { PageHeader } from "../../../../components/shared/page-header"
import { EmptyState } from "../../../../components/shared/empty-state"
import { AgentCard } from "../../../../components/agents/agent-card"
import type { Agent } from "../../../../types/database"

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/agents?collection=frontend")
      .then((res) => res.json())
      .then((data) => setAgents(Array.isArray(data) ? data : []))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Time de Agentes"
        description="Os 5 agentes principais do frontend, prontos para estrategia, copy, revisao, planejamento e roteiro"
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer h-40 rounded-xl" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="Nenhum agente do time encontrado"
          description="O frontend espera os 5 agentes principais publicados no banco: Estrategista, Copywriter, Revisor, Planejador e Roteirista."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}
