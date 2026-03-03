"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  OBJECTIVE_LABELS,
  FORMAT_LABELS,
  CONTENT_TYPE_LABELS,
  FORMAT_TYPE_LABELS,
  type CampaignObjective,
  type CampaignFormat,
  type ContentType,
  type FormatType,
} from "@/types/campaign"

interface CampaignFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    objective: CampaignObjective
    format: CampaignFormat
    content_types: ContentType[]
    formats: FormatType[]
    start_date: string
    end_date?: string
  }) => void
  isLoading?: boolean
}

export function CampaignFormModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CampaignFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    objective: "" as CampaignObjective,
    format: "" as CampaignFormat,
    content_types: [] as ContentType[],
    formats: [] as FormatType[],
    start_date: "",
    end_date: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      objective: formData.objective,
      format: formData.format,
      content_types: formData.content_types,
      formats: formData.formats,
      start_date: formData.start_date,
      end_date: formData.end_date || undefined,
    })
  }

  const toggleContentType = (type: ContentType) => {
    setFormData((prev) => ({
      ...prev,
      content_types: prev.content_types.includes(type)
        ? prev.content_types.filter((t) => t !== type)
        : [...prev.content_types, type],
    }))
  }

  const toggleFormat = (format: FormatType) => {
    setFormData((prev) => ({
      ...prev,
      formats: prev.formats.includes(format)
        ? prev.formats.filter((f) => f !== format)
        : [...prev.formats, format],
    }))
  }

  const isValid =
    formData.name &&
    formData.objective &&
    formData.format &&
    formData.content_types.length > 0 &&
    formData.formats.length > 0 &&
    formData.start_date

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-500" />
            Nova Campanha
          </DialogTitle>
          <DialogDescription>
            Preencha os dados e deixe a IA estruturar o plano completo da sua campanha.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da Campanha <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Lançamento FII Autem Q1"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          {/* Objetivo e Formato */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Objetivo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.objective}
                onValueChange={(value: CampaignObjective) =>
                  setFormData((prev) => ({ ...prev, objective: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OBJECTIVE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Formato <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.format}
                onValueChange={(value: CampaignFormat) =>
                  setFormData((prev) => ({ ...prev, format: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tipos de Conteúdo */}
          <div className="space-y-3">
            <Label>
              Tipos de Conteúdo <span className="text-red-500">*</span>
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                (Selecione pelo menos um)
              </span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    formData.content_types.includes(key as ContentType)
                      ? "border-accent-500 bg-accent-500/5"
                      : "border-border hover:border-accent-500/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={formData.content_types.includes(key as ContentType)}
                    onChange={() => toggleContentType(key as ContentType)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-primary text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Formatos */}
          <div className="space-y-3">
            <Label>
              Formatos <span className="text-red-500">*</span>
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                (Selecione pelo menos um)
              </span>
            </Label>
            <div className="flex gap-3">
              {Object.entries(FORMAT_TYPE_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors flex-1",
                    formData.formats.includes(key as FormatType)
                      ? "border-accent-500 bg-accent-500/5"
                      : "border-border hover:border-accent-500/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={formData.formats.includes(key as FormatType)}
                    onChange={() => toggleFormat(key as FormatType)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-primary text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Data de Início <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Término (opcional)</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                }
                disabled={isLoading}
                min={formData.start_date}
              />
            </div>
          </div>

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
                  Criando campanha...
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
