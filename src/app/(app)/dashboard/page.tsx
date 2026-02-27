"use client"

import { useEffect, useState } from "react"
import { Bot, Zap, MessageSquare, Activity } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"

interface DashboardData {
  kpis: {
    total_agents: number
    active_agents: number
    executions_today: number
    conversations: number
  }
  recent_executions: Array<{
    id: string
    status: "running" | "completed" | "failed" | "cancelled"
    started_at: string
    tokens_total: number
    cost_usd: number
    time_agents?: { id: string; name: string } | null
    time_workflows?: { id: string; name: string } | null
  }>
  top_agents: Array<{
    id: string
    name: string
    avatar_url: string | null
    provider: string
    model: string
    status: "draft" | "active" | "paused" | "archived"
  }>
}

const KPI_CONFIG = [
  {
    key: "total_agents" as const,
    label: "Total de Agentes",
    icon: Bot,
    iconBg: "bg-[#D6E6FF]",
    iconColor: "text-[#4A8BF5]",
  },
  {
    key: "active_agents" as const,
    label: "Agentes Ativos",
    icon: Activity,
    iconBg: "bg-[#C8E6C9]",
    iconColor: "text-[#43A047]",
  },
  {
    key: "executions_today" as const,
    label: "Execuções Hoje",
    icon: Zap,
    iconBg: "bg-[#E2D1FC]",
    iconColor: "text-[#8B5CF6]",
  },
  {
    key: "conversations" as const,
    label: "Conversas",
    icon: MessageSquare,
    iconBg: "bg-[#FFE0B2]",
    iconColor: "text-[#F57C00]",
  },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const kpis = data?.kpis ?? {
    total_agents: 0,
    active_agents: 0,
    executions_today: 0,
    conversations: 0,
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Dashboard"
        description="Visão geral da sua AI Workforce"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {KPI_CONFIG.map((kpi) => (
          <Card
            key={kpi.key}
            className="border-border/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.iconBg}`}
              >
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="font-mono text-2xl font-semibold">
                  {loading ? (
                    <span className="inline-block h-7 w-10 animate-shimmer rounded" />
                  ) : (
                    kpis[kpi.key]
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Executions */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-display text-base font-semibold mb-4">
              Execuções Recentes
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-shimmer h-10 rounded-lg" />
                ))}
              </div>
            ) : (data?.recent_executions?.length ?? 0) === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Nenhuma execução ainda
              </div>
            ) : (
              <div className="space-y-2">
                {data!.recent_executions.map((exec) => (
                  <div
                    key={exec.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusBadge status={exec.status} />
                      <span className="text-sm truncate">
                        {exec.time_agents?.name || exec.time_workflows?.name || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {exec.tokens_total} tok
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(exec.started_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Agents */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-display text-base font-semibold mb-4">
              Agentes Ativos
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-shimmer h-10 rounded-lg" />
                ))}
              </div>
            ) : (data?.top_agents?.length ?? 0) === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Nenhum agente ativo ainda
              </div>
            ) : (
              <div className="space-y-2">
                {data!.top_agents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/agents/${agent.id}`}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-500 shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {agent.name}
                      </p>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {agent.provider} · {agent.model}
                      </span>
                    </div>
                    <StatusBadge status={agent.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
