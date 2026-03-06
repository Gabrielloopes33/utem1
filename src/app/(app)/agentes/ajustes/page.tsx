"use client"

import { useState, useEffect, useCallback } from "react"
import { Save, Loader2, SlidersHorizontal, Sparkles, Megaphone, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

// ============================================
// TIPOS
// ============================================

interface AgentSettings {
  marca: {
    nome: string
    nicho: string
    publicoAlvo: string
    tomDeVoz: string
    palavrasEvitar: string[]
  }
  agentes: {
    conteudo: {
      instrucaoAdicional: string
      comprimentoRespostas: string
    }
    campanhas: {
      instrucaoAdicional: string
    }
  }
}

interface Competitor {
  id: string
  handle: string
  name: string | null
  followers_count: number | null
  engagement_rate: number | null
  last_scraped_at: string | null
}

const DEFAULT_SETTINGS: AgentSettings = {
  marca: {
    nome: "",
    nicho: "",
    publicoAlvo: "",
    tomDeVoz: "educativo",
    palavrasEvitar: [],
  },
  agentes: {
    conteudo: {
      instrucaoAdicional: "",
      comprimentoRespostas: "medio",
    },
    campanhas: {
      instrucaoAdicional: "",
    },
  },
}

// ============================================
// HELPERS
// ============================================

function formatFollowers(n: number | null): string {
  if (!n) return "—"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return String(n)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Nunca"
  const d = new Date(dateStr)
  const now = new Date()
  const diffH = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
  if (diffH < 1) return "Agora há pouco"
  if (diffH < 24) return `${diffH}h atrás`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return "Ontem"
  return `${diffD} dias atrás`
}

// ============================================
// COMPONENTE: TAG INPUT
// ============================================

function TagInput({
  tags,
  onChange,
  placeholder = "Adicionar...",
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState("")

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput("")
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-[#e8f0fd] text-[#3b6fd4] font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addTag() }
          }}
          placeholder={placeholder}
          className="h-9 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!input.trim()}
          className="h-9 px-3 shrink-0"
        >
          Adicionar
        </Button>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AjustesPage() {
  const [settings, setSettings] = useState<AgentSettings>(DEFAULT_SETTINGS)
  const [savedSettings, setSavedSettings] = useState<AgentSettings>(DEFAULT_SETTINGS)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings)

  // Carregar settings e concorrentes
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [settingsRes, competitorsRes] = await Promise.all([
        fetch("/api/agentes/ajustes"),
        supabase
          .from("competitor_data")
          .select("id, handle, name, followers_count, engagement_rate, last_scraped_at")
          .order("followers_count", { ascending: false }),
      ])

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        if (data.settings) {
          setSettings(data.settings)
          setSavedSettings(data.settings)
        }
      }

      if (competitorsRes.data) {
        setCompetitors(competitorsRes.data)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar configurações")
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  // Salvar settings
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/agentes/ajustes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })

      if (!res.ok) throw new Error("Falha ao salvar")

      setSavedSettings(settings)
      toast.success("Configurações salvas!")
    } catch {
      toast.error("Erro ao salvar configurações")
    } finally {
      setIsSaving(false)
    }
  }

  // Helpers de atualização
  const setMarca = (field: keyof AgentSettings["marca"], value: string | string[]) => {
    setSettings((prev) => ({
      ...prev,
      marca: { ...prev.marca, [field]: value },
    }))
  }

  const setConteudo = (field: keyof AgentSettings["agentes"]["conteudo"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      agentes: {
        ...prev.agentes,
        conteudo: { ...prev.agentes.conteudo, [field]: value },
      },
    }))
  }

  const setCampanhas = (field: keyof AgentSettings["agentes"]["campanhas"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      agentes: {
        ...prev.agentes,
        campanhas: { ...prev.agentes.campanhas, [field]: value },
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-[#5B8DEF]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#5B8DEF]/10 flex items-center justify-center">
            <SlidersHorizontal className="h-5 w-5 text-[#5B8DEF]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Ajustes dos Agentes</h1>
            <p className="text-sm text-muted-foreground">Configure identidade e comportamento</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="gap-2 bg-[#5B8DEF] hover:bg-[#4a7de0] text-white rounded-[8px]"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Alterações
        </Button>
      </div>

      {/* ==========================================
          SEÇÃO 1 — Identidade da Marca
      ========================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#5B8DEF]" />
          <h2 className="text-base font-semibold text-foreground">Identidade da Marca</h2>
        </div>

        <div className="bg-white rounded-[14px] p-6 shadow-sm border border-border/40 space-y-5">
          <p className="text-sm text-muted-foreground">
            Contexto injetado em todos os agentes como base de personalização.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nome da marca</label>
              <Input
                value={settings.marca.nome}
                onChange={(e) => setMarca("nome", e.target.value)}
                placeholder="Ex: AUTEM"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nicho / Mercado</label>
              <Input
                value={settings.marca.nicho}
                onChange={(e) => setMarca("nicho", e.target.value)}
                placeholder="Ex: finanças pessoais, investimentos"
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Público-alvo</label>
            <Input
              value={settings.marca.publicoAlvo}
              onChange={(e) => setMarca("publicoAlvo", e.target.value)}
              placeholder="Ex: investidores iniciantes de 25–40 anos"
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tom de voz</label>
            <Select
              value={settings.marca.tomDeVoz}
              onValueChange={(v) => setMarca("tomDeVoz", v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="informal">Informal</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="inspiracional">Inspiracional</SelectItem>
                <SelectItem value="educativo">Educativo</SelectItem>
                <SelectItem value="direto">Direto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Palavras / temas a evitar</label>
            <TagInput
              tags={settings.marca.palavrasEvitar}
              onChange={(tags) => setMarca("palavrasEvitar", tags)}
              placeholder="Ex: risco, perda, falência..."
            />
          </div>
        </div>
      </section>

      {/* ==========================================
          SEÇÃO 2 — Configurações por Agente
      ========================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#5B8DEF]" />
          <h2 className="text-base font-semibold text-foreground">Configurações por Agente</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Agente de Conteúdo */}
          <div className="bg-white rounded-[14px] p-5 shadow-sm border border-border/40 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-[#5B8DEF]/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#5B8DEF]" />
              </div>
              <span className="text-sm font-semibold text-foreground">Agente de Conteúdo</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Instrução adicional</label>
              <Textarea
                value={settings.agentes.conteudo.instrucaoAdicional}
                onChange={(e) => setConteudo("instrucaoAdicional", e.target.value)}
                placeholder="Ex: Sempre incluir dados e estatísticas nas respostas..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Comprimento das respostas</label>
              <Select
                value={settings.agentes.conteudo.comprimentoRespostas}
                onValueChange={(v) => setConteudo("comprimentoRespostas", v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curto">Curto</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="longo">Longo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Agente de Campanhas */}
          <div className="bg-white rounded-[14px] p-5 shadow-sm border border-border/40 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-[#5B8DEF]/10 flex items-center justify-center">
                <Megaphone className="h-4 w-4 text-[#5B8DEF]" />
              </div>
              <span className="text-sm font-semibold text-foreground">Agente de Campanhas</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Instrução adicional</label>
              <Textarea
                value={settings.agentes.campanhas.instrucaoAdicional}
                onChange={(e) => setCampanhas("instrucaoAdicional", e.target.value)}
                placeholder="Ex: Sempre sugerir 2 formatos alternativos por campanha..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SEÇÃO 3 — Concorrentes Monitorados
      ========================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#5B8DEF]" />
          <h2 className="text-base font-semibold text-foreground">Concorrentes Monitorados</h2>
        </div>

        <div className="bg-white rounded-[14px] p-5 shadow-sm border border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {competitors.length} concorrente{competitors.length !== 1 ? "s" : ""} ativos
            </p>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Somente leitura</span>
            </div>
          </div>

          {competitors.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhum concorrente cadastrado ainda.
            </div>
          ) : (
            <div className="space-y-2">
              {competitors.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-3 px-4 rounded-[10px] bg-[#F4F6FB] hover:bg-[#eef1f8] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5B8DEF]/15 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#5B8DEF]">
                        {(c.name || c.handle).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {c.name || c.handle}
                      </p>
                      <p className="text-xs text-muted-foreground">@{c.handle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-foreground">
                        {formatFollowers(c.followers_count)}
                      </p>
                      <p className="text-xs text-muted-foreground">seguidores</p>
                    </div>

                    {c.engagement_rate !== null && (
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-foreground">
                          {c.engagement_rate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">engagement</p>
                      </div>
                    )}

                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium shrink-0"
                    >
                      {formatDate(c.last_scraped_at)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Botão salvar no bottom para conveniência */}
      {isDirty && (
        <div className="flex justify-end pb-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-[#5B8DEF] hover:bg-[#4a7de0] text-white rounded-[8px]"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </div>
      )}
    </div>
  )
}
