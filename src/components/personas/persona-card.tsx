"use client"

import { User, Wallet, Target, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  PERSONA_PROFILE_LABELS,
  type Persona,
} from "@/types/persona"
import { cn } from "@/lib/utils"

interface PersonaCardProps {
  persona: Persona
  onClick?: () => void
}

export function PersonaCard({ persona, onClick }: PersonaCardProps) {
  const profileConfig = PERSONA_PROFILE_LABELS[persona.profile_type]

  return (
    <Card
      className={cn(
        "border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full text-white shrink-0",
            profileConfig.color
          )}>
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">{persona.name}</h3>
            <Badge
              variant="secondary"
              className={cn("text-[10px] font-medium text-white", profileConfig.color)}
            >
              {profileConfig.label}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {profileConfig.description}
        </p>

        {/* Info */}
        <div className="space-y-2 text-sm">
          {persona.age_range && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>{persona.age_range}</span>
            </div>
          )}
          {persona.income_range && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4 shrink-0" />
              <span>{persona.income_range}</span>
            </div>
          )}
          {persona.patrimony_range && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>Patrimônio: {persona.patrimony_range}</span>
            </div>
          )}
        </div>

        {/* Objectives */}
        {persona.objectives.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Objetivos:</span>
            <div className="flex flex-wrap gap-1">
              {persona.objectives.slice(0, 2).map((obj, i) => (
                <Badge key={i} variant="outline" className="text-[10px] font-normal">
                  {obj}
                </Badge>
              ))}
              {persona.objectives.length > 2 && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  +{persona.objectives.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Interests */}
        {persona.interests.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Interesses:</span>
            <div className="flex flex-wrap gap-1">
              {persona.interests.slice(0, 3).map((interest, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] font-normal">
                  {interest}
                </Badge>
              ))}
              {persona.interests.length > 3 && (
                <Badge variant="secondary" className="text-[10px] font-normal">
                  +{persona.interests.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* AI Badge */}
        {persona.ai_response && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1.5">
            <Target className="h-3.5 w-3.5 text-accent-500" />
            <span>Perfil gerado pela IA</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
