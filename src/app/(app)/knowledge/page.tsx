"use client"

import { useEffect, useState } from "react"
import { BookOpen, Plus, FileText, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { DEFAULT_ORG_ID } from "@/lib/constants"
import type { KnowledgeBase } from "@/types/database"

export default function KnowledgePage() {
  const [bases, setBases] = useState<(KnowledgeBase & { doc_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: "", description: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBases()
  }, [])

  function fetchBases() {
    setLoading(true)
    fetch("/api/knowledge")
      .then((res) => res.json())
      .then((data) => setBases(Array.isArray(data) ? data : []))
      .catch(() => setBases([]))
      .finally(() => setLoading(false))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, org_id: DEFAULT_ORG_ID }),
      })
      if (res.ok) {
        toast.success("Knowledge base criada!")
        fetchBases()
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

  async function handleDelete(id: string) {
    if (!confirm("Deletar esta knowledge base?")) return
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Deletado!")
        fetchBases()
      }
    } catch {
      toast.error("Erro ao deletar")
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Knowledge Bases"
        description="Documentos e conteúdos para seus agentes"
      >
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-accent-500 hover:bg-accent-600 gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Base
        </Button>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer h-28 rounded-xl" />
          ))}
        </div>
      ) : bases.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma knowledge base"
          description="Knowledge bases fornecem contexto adicional para seus agentes. Faça upload de documentos ou adicione textos."
        >
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-accent-500 hover:bg-accent-600 gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Knowledge Base
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bases.map((kb) => (
            <Card
              key={kb.id}
              className="border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold">
                        {kb.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">
                          {kb.doc_count ?? 0} documento{(kb.doc_count ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-danger"
                    onClick={() => handleDelete(kb.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {kb.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                    {kb.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Knowledge Base</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Guia de marca"
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
                placeholder="Breve descrição..."
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
