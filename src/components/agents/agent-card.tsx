"use client"

import Link from "next/link"
import { Cpu } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { AgentAvatar } from "@/components/shared/agent-avatar"
import type { Agent } from "@/types/database"

interface AgentCardProps {
  agent: Agent & { time_squads?: { id: string; name: string; color: string; icon: string } | null }
}

export function AgentCard({ agent }: AgentCardProps) {
  const squad = agent.time_squads

  return (
    <Link href={`/agents/${agent.id}`}>
      <Card className="border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <AgentAvatar
                seed={agent.name}
                avatarUrl={agent.avatar_url}
                size={40}
              />
              <div>
                <h3 className="font-display text-sm font-semibold">
                  {agent.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Cpu className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {agent.provider === "anthropic" ? "Claude" : "GPT"} ·{" "}
                    {agent.model.split("-").slice(0, 2).join("-")}
                  </span>
                </div>
              </div>
            </div>
            <StatusBadge status={agent.status} />
          </div>

          {agent.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {agent.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            {squad && (
              <span
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: squad.color + "15", color: squad.color }}
              >
                {squad.icon} {squad.name}
              </span>
            )}
            {agent.type !== "chat" && (
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {agent.type}
              </span>
            )}
            {agent.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
