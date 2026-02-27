"use client"

import { useEffect, useState } from "react"
import { GitBranch, Plus, Play } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
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
import type { Workflow } from "@/types/database"

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<(Workflow & { step_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: "", description: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchWorkflows()
  }, [])

  function fetchWorkflows() {
    setLoading(true)
    fetch("/api/workflows")
      .then((res) => res.json())
      .then((data) => setWorkflows(Array.isArray(data) ? data : []))
      .catch(() => setWorkflows([]))
      .finally(() => setLoading(false))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, org_id: "temp-org-id" }),
      })
      if (res.ok) {
        toast.success("Workflow criado!")
        fetchWorkflows()
        setShowCreate(false)
        setForm({ name: "", description: "" })
      } else {
        toast.error("Erro ao criar")
      }
    } catch {
      toast.error("Erro ao criar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Workflows"
        description="Automatize fluxos entre agentes"
      >
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-accent-500 hover:bg-accent-600 gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Workflow
        </Button>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer h-32 rounded-xl" />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="Nenhum workflow criado"
          description="Workflows conectam agentes em sequência para automatizar processos complexos."
        >
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-accent-500 hover:bg-accent-600 gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Workflow
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <Link key={wf.id} href={`/workflows/${wf.id}`}>
              <Card className="border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#8B5CF6]">
                        <GitBranch className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-semibold">
                          {wf.name}
                        </h3>
                        <span className="text-[11px] text-muted-foreground">
                          {wf.step_count ?? 0} step{(wf.step_count ?? 0) !== 1 ? "s" : ""}
                          {" · "}
                          {wf.trigger_type}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={wf.status} />
                  </div>
                  {wf.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {wf.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Workflow</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Criação de Campanha"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Descreva o objetivo do workflow..."
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !form.name.trim()}
                className="bg-accent-500 hover:bg-accent-600"
              >
                {saving ? "Criando..." : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
