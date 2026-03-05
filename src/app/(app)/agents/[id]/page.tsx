"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Cpu, ArrowLeft, Trash2, Pencil } from "lucide-react"
import { Button } from "../../../../../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs"
import { Card, CardContent } from "../../../../../../components/ui/card"
import { StatusBadge } from "../../../../../../components/shared/status-badge"
import { AgentAvatar } from "../../../../../../components/shared/agent-avatar"
import { ChatPanel } from "../../../../../../components/chat/chat-panel"
import { Input } from "../../../../../../components/ui/input"
import { Label } from "../../../../../../components/ui/label"
import { Textarea } from "../../../../../../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../components/ui/select"
import { MODELS, type Provider } from "../../../../../../lib/ai/models"
import { AGENT_TYPES } from "../../../../../../lib/constants"
import { toast } from "sonner"
import type { Agent } from "../../../../../../types/database"

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Agent>>({})

  const fetchAgent = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/${params.id}`)
      if (!res.ok) {
        router.push("/agents")
        return
      }
      const data = await res.json()
      setAgent(data)
      setEditForm(data)
    } catch {
      router.push("/agents")
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    fetchAgent()
  }, [fetchAgent])

  async function handleSave() {
    if (!agent) return
    setSaving(true)
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        const updated = await res.json()
        setAgent(updated)
        toast.success("Agente atualizado!")
      } else {
        toast.error("Erro ao salvar")
      }
    } catch {
      toast.error("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!agent || !confirm("Tem certeza que deseja deletar este agente?"))
      return
    try {
      const res = await fetch(`/api/agents/${agent.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Agente deletado")
        router.push("/agents")
      }
    } catch {
      toast.error("Erro ao deletar")
    }
  }

  if (loading) {
    return <div className="animate-shimmer h-48 rounded-xl" />
  }

  if (!agent) return null

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <AgentAvatar seed={agent.name} avatarUrl={agent.avatar_url} size={48} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold">{agent.name}</h1>
            <StatusBadge status={agent.status} />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Cpu className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">
              {agent.provider} · {agent.model}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-muted-foreground hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {agent.description && (
        <p className="text-sm text-muted-foreground mb-6">
          {agent.description}
        </p>
      )}

      {/* Tabs */}
      <Tabs defaultValue="chat">
        <TabsList className="mb-6">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <ChatPanel agentId={agent.id} agentName={agent.name} />
        </TabsContent>

        <TabsContent value="config">
          <Card className="border-border/50 shadow-sm max-w-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={editForm.type || "chat"}
                    onValueChange={(v) =>
                      setEditForm((p) => ({ ...p, type: v as Agent["type"] }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AGENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.status || "draft"}
                    onValueChange={(v) =>
                      setEditForm((p) => ({ ...p, status: v as Agent["status"] }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select
                    value={editForm.provider || "anthropic"}
                    onValueChange={(v) => {
                      const provider = v as Provider
                      setEditForm((p) => ({ ...p, provider, model: MODELS[provider][0].id }))
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Select
                    value={editForm.model || ""}
                    onValueChange={(v) => setEditForm((p) => ({ ...p, model: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODELS[(editForm.provider as Provider) || "anthropic"].map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temperatura ({editForm.temperature})</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editForm.temperature ?? 0.7}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, temperature: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-accent-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={editForm.max_tokens ?? 4096}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, max_tokens: parseInt(e.target.value) || 4096 }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>System Prompt</Label>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {(editForm.system_prompt || "").length} chars
                  </span>
                </div>
                <Textarea
                  value={editForm.system_prompt || ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, system_prompt: e.target.value }))
                  }
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-accent-500 hover:bg-accent-600 gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Nenhuma execução registrada ainda
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Métricas disponíveis após primeiras execuções
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
