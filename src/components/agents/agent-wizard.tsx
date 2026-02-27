"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AGENT_TYPES } from "@/lib/constants"
import { MODELS, type Provider } from "@/lib/ai/models"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Bot,
  Cpu,
  FileText,
  Tags,
  Eye,
} from "lucide-react"

const STEPS = [
  { id: 1, label: "Basico", icon: Bot },
  { id: 2, label: "LLM", icon: Cpu },
  { id: 3, label: "Prompt", icon: FileText },
  { id: 4, label: "Extras", icon: Tags },
  { id: 5, label: "Review", icon: Eye },
]

interface AgentFormData {
  name: string
  description: string
  type: string
  provider: Provider
  model: string
  temperature: number
  max_tokens: number
  system_prompt: string
  tags: string
  squad_id: string
}

export function AgentWizard({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<AgentFormData>({
    name: "",
    description: "",
    type: "chat",
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    temperature: 0.7,
    max_tokens: 4096,
    system_prompt: "",
    tags: "",
    squad_id: "",
  })

  function update(field: keyof AgentFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCreate() {
    setLoading(true)
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          name: form.name,
          description: form.description || null,
          type: form.type,
          provider: form.provider,
          model: form.model,
          temperature: form.temperature,
          max_tokens: form.max_tokens,
          system_prompt: form.system_prompt || null,
          tags: form.tags
            ? form.tags.split(",").map((t) => t.trim())
            : [],
          squad_id: form.squad_id || null,
          status: "active",
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erro ao criar agente")
        return
      }

      const agent = await res.json()
      toast.success("Agente criado com sucesso!")
      router.push(`/agents/${agent.id}`)
    } catch {
      toast.error("Erro ao criar agente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s) => (
          <button
            key={s.id}
            onClick={() => s.id < step && setStep(s.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              s.id === step
                ? "bg-accent-500 text-white"
                : s.id < step
                  ? "bg-accent-50 text-accent-500 cursor-pointer"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      <Card className="border-border/50 shadow-sm max-w-2xl">
        <CardContent className="p-6">
          {/* Step 1: Basic */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Agente *</Label>
                <Input
                  placeholder="Ex: Copywriter Estratégico"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="O que esse agente faz?"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => update("type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label} — {t.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: LLM */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={form.provider}
                  onValueChange={(v) => {
                    const provider = v as Provider
                    update("provider", provider)
                    update("model", MODELS[provider][0].id)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select
                  value={form.model}
                  onValueChange={(v) => update("model", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS[form.provider].map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Temperatura{" "}
                    <span className="font-mono text-muted-foreground">
                      ({form.temperature})
                    </span>
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={form.temperature}
                    onChange={(e) =>
                      update("temperature", parseFloat(e.target.value))
                    }
                    className="w-full accent-accent-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={form.max_tokens}
                    onChange={(e) =>
                      update("max_tokens", parseInt(e.target.value) || 4096)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: System Prompt */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>System Prompt</Label>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {form.system_prompt.length} chars
                  </span>
                </div>
                <Textarea
                  placeholder="Voce e um assistente especializado em..."
                  value={form.system_prompt}
                  onChange={(e) => update("system_prompt", e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 4: Extras */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tags (separadas por virgula)</Label>
                <Input
                  placeholder="estrategia, copy, vendas"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-display text-base font-semibold">
                Revisar Agente
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="font-medium">{form.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">{form.type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{form.provider}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Modelo</span>
                  <span className="font-mono text-xs">{form.model}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Temperatura</span>
                  <span className="font-mono">{form.temperature}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">System Prompt</span>
                  <span className="font-mono text-xs">
                    {form.system_prompt ? `${form.system_prompt.length} chars` : "—"}
                  </span>
                </div>
                {form.tags && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Tags</span>
                    <span>{form.tags}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={() => (step === 1 ? router.back() : setStep(step - 1))}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? "Cancelar" : "Voltar"}
            </Button>

            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !form.name}
                className="bg-accent-500 hover:bg-accent-600 gap-2"
              >
                Proximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={loading || !form.name}
                className="bg-accent-500 hover:bg-accent-600 gap-2"
              >
                <Check className="h-4 w-4" />
                {loading ? "Criando..." : "Criar Agente"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
