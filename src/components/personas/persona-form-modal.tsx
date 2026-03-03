"use client"

import { useState } from "react"
import { Sparkles, Loader2, User, TrendingUp, Shield, Zap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PERSONA_PROFILE_LABELS,
  PERSONA_TEMPLATES,
  type PersonaProfile,
} from "@/types/persona"
import { cn } from "@/lib/utils"

interface PersonaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    profile_type: PersonaProfile
    age_range?: string
    income_range?: string
    patrimony_range?: string
  }) => void
  isLoading?: boolean
}

export function PersonaFormModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: PersonaFormModalProps) {
  const [formData, setFormData] = useState<{
    name: string
    profile_type: PersonaProfile | ""
    age_range: string
    income_range: string
    patrimony_range: string
  }>({
    name: "",
    profile_type: "",
    age_range: "",
    income_range: "",
    patrimony_range: "",
  })

  const handleProfileSelect = (profile: PersonaProfile) => {
    const template = PERSONA_TEMPLATES[profile]
    setFormData((prev) => ({
      ...prev,
      profile_type: profile,
      age_range: template.age_range || "",
      income_range: template.income_range || "",
      patrimony_range: template.patrimony_range || "",
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.profile_type) return

    onSubmit({
      name: formData.name,
      profile_type: formData.profile_type,
      age_range: formData.age_range,
      income_range: formData.income_range,
      patrimony_range: formData.patrimony_range,
    })
  }

  const isValid = formData.name && formData.profile_type

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-500" />
            Nova Persona
          </DialogTitle>
          <DialogDescription>
            Crie um perfil de investidor e deixe a IA completar as características.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Fernanda, Carlos, Amanda..."
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          {/* Profile Type */}
          <div className="space-y-3">
            <Label>
              Perfil do Investidor <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(PERSONA_PROFILE_LABELS).map(([key, config]) => {
                const Icon = key === "conservador" ? Shield : key === "moderado" ? TrendingUp : Zap
                const isSelected = formData.profile_type === key

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleProfileSelect(key as PersonaProfile)}
                    disabled={isLoading}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                      isSelected
                        ? "border-accent-500 bg-accent-500/5 ring-1 ring-accent-500"
                        : "border-border hover:border-accent-500/50 hover:bg-accent-500/5"
                    )}
                  >
                    <div className={cn("p-2 rounded-full text-white", config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{config.label}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {config.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Demographics */}
          {formData.profile_type && (
            <div className="space-y-4 pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Dados preenchidos automaticamente (pode editar):
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Idade</Label>
                  <Input
                    value={formData.age_range}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, age_range: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="35-45 anos"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Renda</Label>
                  <Input
                    value={formData.income_range}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, income_range: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="R$ 10K/mês"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Patrimônio</Label>
                  <Input
                    value={formData.patrimony_range}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, patrimony_range: e.target.value }))
                    }
                    disabled={isLoading}
                    placeholder="R$ 100K"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="bg-accent-500 hover:bg-accent-600 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando persona...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Criar com IA
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
