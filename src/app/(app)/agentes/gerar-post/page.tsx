"use client"

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
  Wand2,
  Copy,
  Check,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useAgenteGerarPost } from "@/hooks/use-agente-gerar-post"
import { 
  TIPOS_CONTEUDO, 
  FORMATOS_POST, 
  PERFIS_PERSONA,
  type PostFormData 
} from "@/types/post"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const STEPS = [
  { id: 1, label: "Tema" },
  { id: 2, label: "Formato" },
  { id: 3, label: "Persona" },
  { id: 4, label: "Resultado" },
]

// Mapeamento de ícones para tipos de conteúdo
const tipoConteudoIcons: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  Award: <Award className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
}

// Mapeamento de ícones para formatos
const formatoIcons: Record<string, React.ReactNode> = {
  Images: <Image className="h-6 w-6" />,
  Image: <FileText className="h-6 w-6" />,
  Video: <Video className="h-6 w-6" />,
}

export default function GerarPostPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<PostFormData>>({
    tema: "",
    tipoConteudo: undefined,
    formato: undefined,
    persona: "",
    perfilPersona: undefined,
    campanha: "",
    referencias: "",
  })
  const [copied, setCopied] = useState(false)
  
  const { status, result, generatePost, reset } = useAgenteGerarPost()

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.tema?.trim() && formData.tipoConteudo
      case 2:
        return formData.formato
      case 3:
        return formData.persona?.trim() && formData.perfilPersona
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (step === 3) {
      // Gerar post
      if (formData.tema && formData.tipoConteudo && formData.formato && formData.persona && formData.perfilPersona) {
        await generatePost(formData as PostFormData)
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
      tema: "",
      tipoConteudo: undefined,
      formato: undefined,
      persona: "",
      perfilPersona: undefined,
      campanha: "",
      referencias: "",
    })
    reset()
  }

  const handleCopy = () => {
    if (result?.content.copy) {
      navigator.clipboard.writeText(result.content.copy)
      setCopied(true)
      toast.success("Copiado para a área de transferência!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Gerar Post"
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
              {step > s.id ? (
                <Check className="h-4 w-4" />
              ) : (
                s.id
              )}
            </div>
            <span
              className={cn(
                "ml-2 text-sm hidden sm:block",
                step === s.id ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
            {index < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Conteúdo do step */}
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-6">
          {/* Step 1: Tema e Tipo */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="tema" className="text-base">
                  Qual o tema do post?
                </Label>
                <Input
                  id="tema"
                  placeholder="Ex: FII vs Tesouro Selic, Diversificação de carteira..."
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
                      key={tipo.value}
                      onClick={() => setFormData(prev => ({ ...prev, tipoConteudo: tipo.value }))}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-all",
                        formData.tipoConteudo === tipo.value
                          ? "border-accent-500 bg-accent-500/10"
                          : "border-border hover:border-accent-500/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          formData.tipoConteudo === tipo.value
                            ? "bg-accent-500 text-white"
                            : "bg-muted"
                        )}>
                          {tipoConteudoIcons[tipo.icon]}
                        </div>
                        <div>
                          <h4 className="font-medium">{tipo.label}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {tipo.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="referencias" className="text-base">
                  Referências (opcional)
                </Label>
                <Textarea
                  id="referencias"
                  placeholder="Links, materiais ou informações adicionais..."
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
                      key={formato.value}
                      onClick={() => setFormData(prev => ({ ...prev, formato: formato.value }))}
                      className={cn(
                        "p-6 rounded-lg border text-center transition-all",
                        formData.formato === formato.value
                          ? "border-accent-500 bg-accent-500/10"
                          : "border-border hover:border-accent-500/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3",
                          formData.formato === formato.value
                            ? "bg-accent-500 text-white"
                            : "bg-muted"
                        )}
                      >
                        {formatoIcons[formato.icon]}
                      </div>
                      <h4 className="font-medium">{formato.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formato.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="campanha" className="text-base">
                  Campanha relacionada (opcional)
                </Label>
                <Input
                  id="campanha"
                  placeholder="Ex: Educação Financeira, Lançamento FII..."
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
                      key={perfil.value}
                      onClick={() => setFormData(prev => ({ ...prev, perfilPersona: perfil.value }))}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-all",
                        formData.perfilPersona === perfil.value
                          ? `border-${perfil.color}-500 bg-${perfil.color}-500/10`
                          : "border-border hover:border-accent-500/50"
                      )}
                    >
                      <Badge
                        variant="secondary"
                        className={cn(
                          "mb-2",
                          perfil.value === "conservador" && "bg-blue-500/10 text-blue-500",
                          perfil.value === "moderado" && "bg-amber-500/10 text-amber-500",
                          perfil.value === "agressivo" && "bg-red-500/10 text-red-500"
                        )}
                      >
                        {perfil.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {perfil.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="persona" className="text-base">
                  Nome da persona alvo
                </Label>
                <Input
                  id="persona"
                  placeholder="Ex: Fernanda, Investidor Iniciante..."
                  value={formData.persona}
                  onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                  className="mt-2"
                />
              </div>

              {/* Resumo antes de gerar */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Resumo do pedido:</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Tema:</span> {formData.tema}</p>
                  <p><span className="text-muted-foreground">Tipo:</span> {TIPOS_CONTEUDO.find(t => t.value === formData.tipoConteudo)?.label}</p>
                  <p><span className="text-muted-foreground">Formato:</span> {FORMATOS_POST.find(f => f.value === formData.formato)?.label}</p>
                  <p><span className="text-muted-foreground">Perfil:</span> {PERFIS_PERSONA.find(p => p.value === formData.perfilPersona)?.label}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Resultado */}
          {step === 4 && (
            <div className="space-y-6">
              {status === "generating" && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="h-8 w-8 text-accent-500 animate-pulse" />
                  </div>
                  <h3 className="font-semibold mb-2">Gerando seu post...</h3>
                  <p className="text-sm text-muted-foreground">
                    A IA está criando conteúdo personalizado para você.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Erro ao gerar post</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tente novamente em alguns instantes.
                  </p>
                  <Button onClick={() => setStep(3)} variant="outline">
                    Voltar e tentar novamente
                  </Button>
                </div>
              )}

              {result && status === "success" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Post Gerado</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        className="gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted p-6 rounded-lg">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {result.content.copy}
                      </pre>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Novo post
                    </Button>
                    <Button
                      className="flex-1 bg-accent-500 hover:bg-accent-600"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Salvar na biblioteca
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navegação */}
          {step < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || status === "generating"}
                className="bg-accent-500 hover:bg-accent-600 gap-2"
              >
                {step === 3 ? (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Gerar Post
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
