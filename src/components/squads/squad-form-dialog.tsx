"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import type { Squad } from "@/types/database"

const COLORS = [
  "#5B8DEF", "#6C3483", "#E74C3C", "#27AE60",
  "#F39C12", "#3498DB", "#E91E63", "#00BCD4",
]

const ICONS = ["🤖", "✍️", "🧠", "📊", "🎯", "🔬", "💡", "🚀"]

interface SquadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  squad?: Squad | null
  onSaved: () => void
}

export function SquadFormDialog({ open, onOpenChange, squad, onSaved }: SquadFormDialogProps) {
  const isEdit = !!squad
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: squad?.name || "",
    description: squad?.description || "",
    icon: squad?.icon || "🤖",
    color: squad?.color || "#5B8DEF",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)
    try {
      const url = isEdit ? `/api/squads/${squad.id}` : "/api/squads"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          org_id: "temp-org-id",
        }),
      })

      if (res.ok) {
        toast.success(isEdit ? "Squad atualizado!" : "Squad criado!")
        onSaved()
        onOpenChange(false)
      } else {
        toast.error("Erro ao salvar squad")
      }
    } catch {
      toast.error("Erro ao salvar squad")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Squad" : "Novo Squad"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Estratégia & Copy"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Breve descrição do squad..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, icon }))}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg border-2 transition-colors ${
                    form.icon === icon
                      ? "border-accent-500 bg-accent-50"
                      : "border-transparent bg-muted hover:bg-muted/80"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, color }))}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    form.color === color
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="bg-accent-500 hover:bg-accent-600"
            >
              {saving ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
