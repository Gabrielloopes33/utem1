"use client"

import { useEffect, useState } from "react"
import {
  Bot,
  Zap,
  Activity,
  MessageSquare,
  Users,
  GitBranch,
  BookOpen,
  ArrowRight,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { AgentAvatar } from "@/components/shared/agent-avatar"
import { InstagramMetricsCard } from "@/components/dashboard/instagram-metrics"
import { QuickContentChat } from "@/components/dashboard/quick-content-chat"

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

const CATEGORIES = [
  {
    name: "Agentes",
    description: "Crie e gerencie agentes de IA",
    href: "/agents",
    icon: Bot,
    color: "#5B8DEF",
    bgColor: "#EEF3FF",
    tags: ["Chat", "Task", "QA Gate", "Planner"],
  },
  {
    name: "Squads",
    description: "Organize agentes em times",
    href: "/squads",
    icon: Users,
    color: "#8B5CF6",
    bgColor: "#F3EEFF",
    tags: ["Colaboração", "Grupos", "Roles"],
  },
  {
    name: "Workflows",
    description: "Automatize fluxos entre agentes",
    href: "/workflows",
    icon: GitBranch,
    color: "#22A06B",
    bgColor: "#E8F7EF",
    tags: ["Automação", "Triggers", "Steps"],
  },
  {
    name: "Knowledge",
    description: "Bases de conhecimento para agentes",
    href: "/knowledge",
    icon: BookOpen,
    color: "#F57C00",
    bgColor: "#FFF3E0",
    tags: ["Documentos", "Contexto", "Upload"],
  },
]

const KPI_CONFIG = [
  {
    key: "total_agents" as const,
    label: "Agentes",
    icon: Bot,
    color: "#5B8DEF",
  },
  {
    key: "active_agents" as const,
    label: "Ativos",
    icon: Activity,
    color: "#22A06B",
  },
  {
    key: "executions_today" as const,
    label: "Execuções",
    icon: Zap,
    color: "#8B5CF6",
  },
  {
    key: "conversations" as const,
    label: "Conversas",
    icon: MessageSquare,
    color: "#F57C00",
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
    <div className="animate-fade-up space-y-8">
      {/* Quick Content Chat - Hero interativo */}
      <QuickContentChat />

      {/* KPI Row — compact */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPI_CONFIG.map((kpi) => (
          <div
            key={kpi.key}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3"
          >
            <kpi.icon
              className="h-4 w-4 shrink-0"
              style={{ color: kpi.color }}
            />
            <div>
              <p className="font-mono text-lg font-semibold leading-tight">
                {loading ? (
                  <span className="inline-block h-5 w-8 animate-shimmer rounded" />
                ) : (
                  kpis[kpi.key]
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold">Marketplace</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} href={cat.href}>
              <Card className="border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: cat.bgColor }}
                    >
                      <cat.icon
                        className="h-5 w-5"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-display text-sm font-bold"
                        style={{ color: cat.color }}
                      >
                        {cat.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {cat.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {cat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Instagram Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold">Redes Sociais</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <InstagramMetricsCard />
        </div>
      </div>

      {/* Popular Agents + Recent Executions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Popular Agents */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold">
              Agentes
            </h2>
            <Link
              href="/agents"
              className="flex items-center gap-1 text-xs text-accent-500 hover:underline"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-shimmer h-12 rounded-lg" />
                  ))}
                </div>
              ) : (data?.top_agents?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-3">
                    <Bot className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Nenhum agente criado ainda
                  </p>
                  <Link href="/agents/new">
                    <Button
                      size="sm"
                      className="bg-accent-500 hover:bg-accent-600 gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Criar Agente
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {data!.top_agents.map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/agents/${agent.id}`}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/60 transition-colors"
                    >
                      <AgentAvatar seed={agent.name} avatarUrl={agent.avatar_url} size={36} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {agent.name}
                        </p>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {agent.provider === "anthropic" ? "Claude" : "GPT"} ·{" "}
                          {agent.model.split("-").slice(0, 2).join("-")}
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

        {/* Recent Executions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold">
              Execuções Recentes
            </h2>
          </div>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-shimmer h-12 rounded-lg" />
                  ))}
                </div>
              ) : (data?.recent_executions?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-3">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nenhuma execução ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {data!.recent_executions.map((exec) => (
                    <div
                      key={exec.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <StatusBadge status={exec.status} />
                        <span className="text-sm truncate">
                          {exec.time_agents?.name ||
                            exec.time_workflows?.name ||
                            "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {exec.tokens_total} tok
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(exec.started_at).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
