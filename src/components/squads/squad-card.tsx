"use client"

import Link from "next/link"
import { Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Squad } from "@/types/database"

interface SquadCardProps {
  squad: Squad & { agent_count?: number }
}

export function SquadCard({ squad }: SquadCardProps) {
  return (
    <Link href={`/squads/${squad.id}`}>
      <Card className="border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: squad.color + "18" }}
            >
              {squad.icon || "🤖"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-semibold truncate">
                {squad.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">
                  {squad.agent_count ?? 0} agente{(squad.agent_count ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0 mt-1"
              style={{ backgroundColor: squad.color }}
            />
          </div>

          {squad.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {squad.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
