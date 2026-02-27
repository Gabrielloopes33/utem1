"use client"

import { useEffect, useState } from "react"
import { Bot, Plus } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { AgentCard } from "@/components/agents/agent-card"
import { Button } from "@/components/ui/button"
import type { Agent } from "@/types/database"

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => setAgents(Array.isArray(data) ? data : []))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-up">
      <PageHeader title="Agentes" description="Seus agentes de IA">
        <Link href="/agents/new">
          <Button className="bg-accent-500 hover:bg-accent-600 gap-2">
            <Plus className="h-4 w-4" />
            Novo Agente
          </Button>
        </Link>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer h-40 rounded-xl" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="Nenhum agente criado"
          description="Agentes são assistentes de IA configurados com prompts, modelos e ferramentas específicas."
        >
          <Link href="/agents/new">
            <Button className="bg-accent-500 hover:bg-accent-600 gap-2">
              <Plus className="h-4 w-4" />
              Criar Agente
            </Button>
          </Link>
        </EmptyState>
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
