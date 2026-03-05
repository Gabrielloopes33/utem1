"use client"

/**
 * Agente de Campanha
 * Webhook N8N: agente-campanhas
 * API Route: /api/agentes/campanhas
 */

import { useState } from "react"
import { 
  Megaphone, 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  TrendingUp, 
  Users,
  Calendar,
  Copy,
  Check,
  RefreshCw,
  FileText,
  BarChart3,
  ArrowRight,
  Wand2,
  SkipForward,
  Lightbulb,
  Loader2
} from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Card, CardContent } from "../../../../components/ui/card"
import { PageHeader } from "../../../../components/shared/page-header"
// import { Badge } from "../../../../components/ui/badge"
import { Label } from "../../../../components/ui/label"
import { useAgenteCampanhas } from "../../../../hooks/use-agente-campanhas"
import type { CampaignObjective, CampaignFormat, ContentType, FormatType } from "../../../../types/campaign"
import { OBJECTIVE_LABELS, FORMAT_LABELS, CONTENT_TYPE_LABELS, FORMAT_TYPE_LABELS } from "../../../../types/campaign"
import { cn } from "../../../../lib/utils"
import { GeneratingAnimation } from "../../../../components/shared/agent-loading-animation"

const STEPS = [
  { id: 1, label: "Informações" },
  { id: 2, label: "Estratégia" },
  { id: 3, label: "Conteúdo" },
  { id: 4, label: "Resultado" },
]

const OBJETIVOS: { value: CampaignObjective; label: string; description: string; icon: string }[] = [
  { 
    value: "conversao", 
    label: "Conversão", 
    description: "Focar em vendas e leads",
    icon: "Target"
  },
  { 
    value: "atracao", 
    label: "Atração", 
    description: "Aumentar alcance e seguidores",
    icon: "Users"
  },
  { 
    value: "nutricao", 
    label: "Nutrição", 
    description: "Educar e engajar audiência",
    icon: "TrendingUp"
  },
]

const FORMATOS_CAMPANHA: { value: CampaignFormat; label: string; description: string }[] = [
  { 
    value: "lancamento", 
    label: "Lançamento", 
    description: "Campanha com data definida de início e fim"
  },
  { 
    value: "perpetuo", 
    label: "Perpétuo", 
    description: "Campanha contínua sem data de término"
  },
  { 
    value: "interna", 
    label: "Campanha Interna", 
    description: "Comunicação interna da equipe"
  },
]

const TIPOS_CONTEUDO: { value: ContentType; label: string }[] = [
  { value: "tecnico", label: "Técnico" },
  { value: "emocional", label: "Conexão Emocional" },
  { value: "objecao", label: "Quebra de Objeção" },
  { value: "autoridade", label: "Reforço de Autoridade" },
  { value: "social", label: "Prova Social" },
]

const FORMATOS_CONTEUDO: { value: FormatType; label: string }[] = [
  { value: "carrossel", label: "Carrossel" },
  { value: "card", label: "Card Único" },
  { value: "reels", label: "Reels" },
]

export default function AgenteCampanhasPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nome: "",
    objetivo: undefined as CampaignObjective | undefined,
    formato: undefined as CampaignFormat | undefined,
    tiposConteudo: [] as ContentType[],
    formatos: [] as FormatType[],
    dataInicio: "",
    dataFim: "",
    persona: "",
  })
  const [copied, setCopied] = useState(false)
  
  const { 
    status, 
    result, 
    streamingContent,
    isStreaming,
    generateCampanha, 
    reset,
    skipStreaming
  } = useAgenteCampanhas({ streamingSpeed: 6 })

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.nome.trim()
      case 2:
        return formData.objetivo && formData.formato
      case 3:
        return formData.tiposConteudo.length > 0 && formData.formatos.length > 0 && formData.dataInicio
      default:
        return true
    }
  }

  const toggleTipoConteudo = (tipo: ContentType) => {
    setFormData(prev => ({
      ...prev,
      tiposConteudo: prev.tiposConteudo.includes(tipo)
        ? prev.tiposConteudo.filter(t => t !== tipo)
        : [...prev.tiposConteudo, tipo]
    }))
  }

  const toggleFormato = (formato: FormatType) => {
    setFormData(prev => ({
      ...prev,
      formatos: prev.formatos.includes(formato)
        ? prev.formatos.filter(f => f !== formato)
        : [...prev.formatos, formato]
    }))
  }

  const handleNext = async () => {
    if (step === 3) {
      if (formData.nome && formData.objetivo && formData.formato && formData.dataInicio) {
        await generateCampanha({
          nome: formData.nome,
          objetivo: formData.objetivo,
          formato: formData.formato,
          tiposConteudo: formData.tiposConteudo,
          formatos: formData.formatos,
          periodo: {
            inicio: formData.dataInicio,
            fim: formData.dataFim || formData.dataInicio,
          },
          persona: formData.persona,
        })
      }
    }
    setStep(prev => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleReset = () => {
    setStep(1)
    setFormData({
      nome: "",
      objetivo: undefined,
      formato: undefined,
      tiposConteudo: [],
      formatos: [],
      dataInicio: "",
      dataFim: "",
      persona: "",
    })
    setCopied(false)
    reset()
  }

  const handleCopy = () => {
    const textToCopy = result || streamingContent
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Agente de Campanha"
        description="Crie campanhas de marketing completas com IA"
      />

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step === s.id
                  ? "bg-accent-500 text-white"
                  : step > s.id
                  ? "bg-accent-500/20 text-accent-500"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step > s.id ? <Check className="h-4 w-4" /> : s.id}
            </div>
            <span className={cn(
              "ml-2 text-sm hidden sm:block",
              step === s.id ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {s.label}
            </span>
            {index < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Conteúdo */}
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-6">
          {/* Step 1: Informações básicas */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="nome" className="text-base">Nome da campanha</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Lançamento FII Autem, Educação Financeira Q1..."
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="persona" className="text-base">Persona alvo (opcional)</Label>
                <Input
                  id="persona"
                  placeholder="Ex: Investidor Moderado, Fernanda..."
                  value={formData.persona}
                  onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Step 2: Estratégia */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">Objetivo da campanha</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {OBJETIVOS.map((obj) => (
                    <button
                      key={obj.value}
                      onClick={() => setFormData(prev => ({ ...prev, objetivo: obj.value }))}
                      className={cn(
                        "p-4 rounded-lg border text-center transition-all",
                        formData.objetivo === obj.value
                          ? "border-accent-500 bg-accent-500/10"
                          : "border-border hover:border-accent-500/50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2",
                        formData.objetivo === obj.value ? "bg-accent-500 text-white" : "bg-muted"
                      )}>
                        {obj.icon === "Target" && <Target className="h-5 w-5" />}
                        {obj.icon === "Users" && <Users className="h-5 w-5" />}
                        {obj.icon === "TrendingUp" && <TrendingUp className="h-5 w-5" />}
                      </div>
                      <h4 className="font-medium text-sm">{obj.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{obj.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base mb-3 block">Formato da campanha</Label>
                <div className="space-y-2">
                  {FORMATOS_CAMPANHA.map((fmt) => (
                    <button
                      key={fmt.value}
                      onClick={() => setFormData(prev => ({ ...prev, formato: fmt.value }))}
                      className={cn(
                        "w-full p-4 rounded-lg border text-left transition-all flex items-center gap-3",
                        formData.formato === fmt.value
                          ? "border-accent-500 bg-accent-500/10"
                          : "border-border hover:border-accent-500/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        formData.formato === fmt.value ? "bg-accent-500 text-white" : "bg-muted"
                      )}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{fmt.label}</h4>
                        <p className="text-xs text-muted-foreground">{fmt.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Conteúdo e Período */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">Tipos de conteúdo</Label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS_CONTEUDO.map((tipo) => (
                    <button
                      key={tipo.value}
                      onClick={() => toggleTipoConteudo(tipo.value)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm border transition-all",
                        formData.tiposConteudo.includes(tipo.value)
                          ? "border-accent-500 bg-accent-500 text-white"
                          : "border-border hover:border-accent-500/50"
                      )}
                    >
                      {tipo.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base mb-3 block">Formatos de post</Label>
                <div className="flex flex-wrap gap-2">
                  {FORMATOS_CONTEUDO.map((fmt) => (
                    <button
                      key={fmt.value}
                      onClick={() => toggleFormato(fmt.value)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm border transition-all",
                        formData.formatos.includes(fmt.value)
                          ? "border-accent-500 bg-accent-500 text-white"
                          : "border-border hover:border-accent-500/50"
                      )}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataInicio" className="text-base">Data de início *</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim" className="text-base">Data de fim {formData.formato === "lancamento" && "*"}</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
                    className="mt-2"
                    disabled={formData.formato === "perpetuo"}
                  />
                </div>
              </div>

              {/* Resumo */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Resumo:</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Nome:</span> {formData.nome}</p>
                  <p><span className="text-muted-foreground">Objetivo:</span> {OBJECTIVE_LABELS[formData.objetivo || "atracao"]}</p>
                  <p><span className="text-muted-foreground">Formato:</span> {FORMAT_LABELS[formData.formato || "lancamento"]}</p>
                  <p><span className="text-muted-foreground">Tipos:</span> {formData.tiposConteudo.map(t => CONTENT_TYPE_LABELS[t]).join(", ")}</p>
                  <p><span className="text-muted-foreground">Posts:</span> {formData.formatos.map(f => FORMAT_TYPE_LABELS[f]).join(", ")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Resultado com streaming */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Loading / Generating */}
              {status === "generating" && (
                <GeneratingAnimation text="Criando sua campanha..." />
              )}

              {/* Streaming o resultado */}
              {(isStreaming || streamingContent) && status !== "success" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-accent-500 animate-pulse" />
                      <h3 className="font-semibold">Gerando campanha...</h3>
                    </div>
                    <Button size="sm" variant="ghost" onClick={skipStreaming} className="gap-2">
                      <SkipForward className="h-4 w-4" />
                      Pular
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-6 rounded-lg border border-accent-500/20 max-h-[500px] overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {streamingContent}
                        <span className="inline-block w-0.5 h-4 bg-accent-500 ml-0.5 animate-pulse" />
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Erro ao criar campanha</h3>
                  <Button onClick={() => setStep(3)} variant="outline">Voltar</Button>
                </div>
              )}

              {/* Resultado final */}
              {result && status === "success" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-accent-500" />
                      <h3 className="font-semibold">Campanha Criada</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
                        {copied ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar</>}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted p-6 rounded-lg max-h-[500px] overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm">{result}</pre>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Card className="p-3 text-center">
                      <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">12</p>
                      <p className="text-xs text-muted-foreground">Posts sugeridos</p>
                    </Card>
                    <Card className="p-3 text-center">
                      <BarChart3 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">4.2%</p>
                      <p className="text-xs text-muted-foreground">Engajamento esperado</p>
                    </Card>
                    <Card className="p-3 text-center">
                      <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">45K</p>
                      <p className="text-xs text-muted-foreground">Alcance estimado</p>
                    </Card>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleReset} variant="outline" className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Nova campanha
                    </Button>
                    <Button className="flex-1 bg-accent-500 hover:bg-accent-600">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Ver no dashboard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navegação */}
          {step < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button variant="outline" onClick={handleBack} disabled={step === 1} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || status === "generating" || isStreaming}
                className="bg-accent-500 hover:bg-accent-600 gap-2"
              >
                {step === 3 ? (
                  status === "generating" || isStreaming ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Gerando...</>
                  ) : (
                    <><Lightbulb className="h-4 w-4" /> Criar Campanha</>
                  )
                ) : (
                  <>Próximo <ChevronRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
