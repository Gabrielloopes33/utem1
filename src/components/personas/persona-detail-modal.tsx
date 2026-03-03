"use client"

import { User, Wallet, Target, TrendingUp, MessageCircle, Instagram, Youtube, Mail, CheckCircle2, AlertCircle, Heart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  PERSONA_PROFILE_LABELS,
  type Persona,
} from "@/types/persona"
import { cn } from "@/lib/utils"

interface PersonaDetailModalProps {
  persona: Persona | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PersonaDetailModal({
  persona,
  open,
  onOpenChange,
}: PersonaDetailModalProps) {
  if (!persona) return null

  const profileConfig = PERSONA_PROFILE_LABELS[persona.profile_type]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full text-white",
              profileConfig.color
            )}>
              <User className="h-7 w-7" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{persona.name}</DialogTitle>
              <Badge
                variant="secondary"
                className={cn("text-xs font-medium text-white mt-1", profileConfig.color)}
              >
                {profileConfig.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4 pr-4 max-h-[60vh] overflow-y-auto">
            {/* Demographics */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              {persona.age_range && (
                <div className="text-center">
                  <User className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{persona.age_range}</p>
                  <p className="text-xs text-muted-foreground">Idade</p>
                </div>
              )}
              {persona.income_range && (
                <div className="text-center">
                  <Wallet className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{persona.income_range}</p>
                  <p className="text-xs text-muted-foreground">Renda</p>
                </div>
              )}
              {persona.patrimony_range && (
                <div className="text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{persona.patrimony_range}</p>
                  <p className="text-xs text-muted-foreground">Patrimônio</p>
                </div>
              )}
            </div>

            {/* Objectives */}
            {persona.objectives.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent-500" />
                  Objetivos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {persona.objectives.map((obj, i) => (
                    <Badge key={i} variant="outline" className="font-normal">
                      {obj}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Fears */}
            {persona.fears.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Medos e Preocupações
                </h4>
                <div className="flex flex-wrap gap-2">
                  {persona.fears.map((fear, i) => (
                    <Badge key={i} variant="secondary" className="font-normal bg-red-500/10 text-red-600 hover:bg-red-500/20">
                      {fear}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {persona.interests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  Interesses
                </h4>
                <div className="flex flex-wrap gap-2">
                  {persona.interests.map((interest, i) => (
                    <Badge key={i} variant="secondary" className="font-normal">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Communication */}
            {persona.communication_tone && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  Tom de Comunicação Ideal
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {persona.communication_tone}
                </p>
              </div>
            )}

            {/* Preferred Channels */}
            {Object.keys(persona.preferred_channels).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Canais Preferidos</h4>
                <div className="flex gap-4">
                  {Object.entries(persona.preferred_channels).map(([channel, percentage]) => (
                    <div key={channel} className="flex items-center gap-2">
                      {channel === 'Instagram' && <Instagram className="h-4 w-4" />}
                      {channel === 'YouTube' && <Youtube className="h-4 w-4" />}
                      {channel === 'Email' && <Mail className="h-4 w-4" />}
                      <span className="text-sm">{channel}: {percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversion Triggers */}
            {persona.conversion_triggers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Gatilhos de Conversão
                </h4>
                <ul className="space-y-1">
                  {persona.conversion_triggers.map((trigger, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent-500" />
                      {trigger}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Response */}
            {persona.ai_response && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-sm font-semibold text-accent-500">
                  Análise da IA
                </h4>
                <div className="text-sm text-muted-foreground bg-accent-500/5 p-4 rounded-lg whitespace-pre-line">
                  {persona.ai_response}
                </div>
              </div>
            )}
          </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button className="bg-accent-500 hover:bg-accent-600">
            Gerar Conteúdo para {persona.name}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
