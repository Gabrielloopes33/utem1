"use client"

/**
 * Agente de Conteúdo
 * Webhook N8N: agente-gerar-post
 * API Route: /api/agentes/conteudo
 */

import { useState } from "react"
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Image, 
  Video,
  BookOpen,
  Heart,
  Shield,
  Award,
  Users,
  Copy,
  Check,
  RefreshCw,
  PenTool,
  Wand2,
  Lightbulb,
  SkipForward
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useAgenteGerarPost } from "@/hooks/use-agente-gerar-post"
import { cn } from "@/lib/utils"
import { GeneratingAnimation } from "@/components/shared/agent-loading-animation"

const STEPS = [
  { id: 1, label: "Tema" },
  { id: 2, label: "Formato" },
  { id: 3, label: "Persona" },
  { id: 4, label: "Resultado" },
]

const TIPOS_CONTEUDO = [
  { id: "tecnico", label: "Técnico", description: "Conteúdo educacional e informativo", icon: BookOpen },
  { id: "emocional", label: "Emocional", description: "Conecta com os sentimentos", icon: Heart },
  { id: "autoridade", label: "Autoridade", description: "Demonstra expertise", icon: Award },
  { id: "social", label: "Social Proof", description: "Cases e resultados", icon: Users },
]

const FORMATOS_POST = [
  { id: "carrossel", label: "Carrossel", description: "Múltiplos slides", icon: Image },
  { id: "reels", label: "Reels", description: "Vídeo curto", icon: Video },
  { id: "card", label: "Card", description: "Imagem única", icon: FileText },
]

const PERFIS_PERSONA = [
  { id: "conservador", label: "Conservador", color: "blue" },
  { id: "moderado", label: "Moderado", color: "amber" },
  { id: "agressivo", label: "Agressivo", color: "red" },
]

export default function AgenteConteudoPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    tema: "",
    tipoConteudo: "",
    formato: "",
    persona: "",
    perfilPersona: "",
    campanha: "",
    referencias: "",
  })
  const [copied, setCopied] = useState(false)
  
  const { 
    status, 
    result, 
    streamingContent,
    isStreaming,
    generatePost, 
    reset,
    skipStreaming
  } = useAgenteGerarPost({ streamingSpeed: 8 })

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.tema.trim() && formData.tipoConteudo
      case 2:
        return formData.formato
      case 3:
        return formData.persona.trim() && formData.perfilPersona
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (step === 3) {
      await generatePost({
        tema: formData.tema,
        tipoConteudo: formData.tipoConteudo as any,
        formato: formData.formato as any,
        persona: formData.persona,
        perfilPersona: formData.perfilPersona as any,
        campanha: formData.campanha,
        referencias: formData.referencias,
      })
    }
    setStep(prev => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleReset = () => {
    setStep(1)
    setFormData({
      tema: "",
      tipoConteudo: "",
      formato: "",
      persona: "",
      perfilPersona: "",
      campanha: "",
      referencias: "",
    })
    setCopied(false)
    reset()
  }

  const handleCopy = () => {
    const textToCopy = result?.content.copy || streamingContent
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Agente de Conteúdo"
        description="Crie posts prontos para Instagram com IA"
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
          {/* Step 1: Tema */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="tema" className="text-base">Qual o tema do post?</Label>
                <Input
                  id="tema"
                  placeholder="Ex: FII vs Tesouro Selic..."
                  value={formData.tema}
                  onChange={(e) => setFormData(prev => ({ ...prev, tema: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base mb-3 block">Tipo de conteúdo</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIPOS_CONTEUDO.map((tipo) => (
                    <button
                      key={tipo.id}
                      onClick={() => setFormData(prev => ({ ...prev, tipoConteudo: tipo.id }))}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-all",
                        formData.tipoConteudo === tipo.id
                          ? "border-accent-500 bg-accent-500/10"
                          : "border-border hover:border-accent-500/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          formData.tipoConteudo === tipo.id ? "bg-accent-500 text-white" : "bg-muted"
                        )}>
                          <tipo.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{tipo.label}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{tipo.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="referencias" className="text-base">Referências (opcional)</Label>
                <Textarea
                  id="referencias"
                  placeholder="Links ou materiais adicionais..."
                  value={formData.referencias}
                  onChange={(e) => setFormData(prev => ({ ...prev, referencias: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Formato */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">Qual formato?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {FORMATOS_POST.map((formato) => (
                    <button
                      key={formato.id}
                      onClick={() => setFormData(prev => ({ ...prev, formato: formato.id }))}
                      className={cn(
                        "p-6 rounded-lg border text-center transition-all",
                        formData.formato === formato.id
                          ? "border-accent-500 bg-accent-500/10"
                          : "border-border hover:border-accent-500/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3",
                        formData.formato === formato.id ? "bg-accent-500 text-white" : "bg-muted"
                      )}>
                        <formato.icon className="h-6 w-6" />
                      </div>
                      <h4 className="font-medium">{formato.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{formato.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="campanha" className="text-base">Campanha relacionada (opcional)</Label>
                <Input
                  id="campanha"
                  placeholder="Ex: Educação Financeira..."
                  value={formData.campanha}
                  onChange={(e) => setFormData(prev => ({ ...prev, campanha: e.target.value }))}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Step 3: Persona */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">Perfil da persona</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PERFIS_PERSONA.map((perfil) => (
                    <button
                      key={perfil.id}
                      onClick={() => setFormData(prev => ({ ...prev, perfilPersona: perfil.id }))}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-all",
                        formData.perfilPersona === perfil.id
                          ? `border-${perfil.color}-500 bg-${perfil.color}-500/10`
                          : "border-border hover:border-accent-500/50"
                      )}
                    >
                      <Badge variant="secondary" className={cn(
                        "mb-2",
                        perfil.id === "conservador" && "bg-blue-500/10 text-blue-500",
                        perfil.id === "moderado" && "bg-amber-500/10 text-amber-500",
                        perfil.id === "agressivo" && "bg-red-500/10 text-red-500"
                      )}>
                        {perfil.label}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="persona" className="text-base">Nome da persona alvo</Label>
                <Input
                  id="persona"
                  placeholder="Ex: Fernanda, Investidor Iniciante..."
                  value={formData.persona}
                  onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Resumo:</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Tema:</span> {formData.tema}</p>
                  <p><span className="text-muted-foreground">Tipo:</span> {TIPOS_CONTEUDO.find(t => t.id === formData.tipoConteudo)?.label}</p>
                  <p><span className="text-muted-foreground">Formato:</span> {FORMATOS_POST.find(f => f.id === formData.formato)?.label}</p>
                  <p><span className="text-muted-foreground">Perfil:</span> {PERFIS_PERSONA.find(p => p.id === formData.perfilPersona)?.label}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Resultado com streaming */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Loading / Generating */}
              {status === "generating" && (
                <GeneratingAnimation text="Criando seu post..." />
              )}

              {/* Streaming o resultado */}
              {(isStreaming || streamingContent) && status !== "success" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-accent-500 animate-pulse" />
                      <h3 className="font-semibold">Gerando post...</h3>
                    </div>
                    <Button size="sm" variant="ghost" onClick={skipStreaming} className="gap-2">
                      <SkipForward className="h-4 w-4" />
                      Pular
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-6 rounded-lg border border-accent-500/20">
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
                  <h3 className="font-semibold mb-2">Erro ao gerar post</h3>
                  <Button onClick={() => setStep(3)} variant="outline">Voltar</Button>
                </div>
              )}

              {/* Resultado final */}
              {result && status === "success" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PenTool className="h-5 w-5 text-accent-500" />
                      <h3 className="font-semibold">Post Gerado</h3>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
                      {copied ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar</>}
                    </Button>
                  </div>

                  <div className="bg-muted p-6 rounded-lg">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm">{result.content.copy}</pre>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleReset} variant="outline" className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Novo post
                    </Button>
                    <Button className="flex-1 bg-accent-500 hover:bg-accent-600">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Salvar
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
                {step === 3 ? <><Lightbulb className="h-4 w-4" /> Gerar Post</> : <>Próximo <ChevronRight className="h-4 w-4" /></>}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
