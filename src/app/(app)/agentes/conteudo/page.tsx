"use client"

/**
 * Agente de Conteúdo
 * Webhook N8N: agente-gerar-post
 * 
 * Payload: { tema, tipoConteudo, formato, persona, perfilPersona, campanha?, referencias? }
 * Resposta: { post, metadata: { tipo, formato, tema } }
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
  Wand2,
  Copy,
  Check,
  RefreshCw,
  PenTool
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PostFormData {
  tema: string
  tipoConteudo: string
  formato: string
  persona: string
  perfilPersona: string
  campanha?: string
  referencias?: string
}

const TIPOS_CONTEUDO = [
  { id: "educativo", label: "Educativo", icon: BookOpen },
  { id: "emocional", label: "Emocional", icon: Heart },
  { id: "tecnico", label: "Técnico", icon: Shield },
  { id: "autoridade", label: "Autoridade", icon: Award },
]

const FORMATOS_POST = [
  { id: "carrossel", label: "Carrossel", icon: Image },
  { id: "reels", label: "Reels", icon: Video },
  { id: "card", label: "Card", icon: FileText },
]

const PERFIS_PERSONA = [
  { id: "iniciante", label: "Iniciante" },
  { id: "intermediario", label: "Intermediário" },
  { id: "avancado", label: "Avançado" },
]

const STEPS = [
  { id: 1, label: "Tema" },
  { id: 2, label: "Formato" },
  { id: 3, label: "Persona" },
  { id: 4, label: "Gerar" },
]

export default function AgenteConteudoPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PostFormData>({
    tema: "",
    tipoConteudo: "",
    formato: "",
    persona: "",
    perfilPersona: "",
  })
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function updateForm(field: keyof PostFormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function generatePost() {
    setLoading(true)
    try {
      const response = await fetch("https://primary-production-35e3.up.railway.app/webhook/agente-gerar-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) throw new Error("Erro na requisição")
      
      const data = await response.json()
      setResult(data.post || data)
      setCurrentStep(4)
    } catch {
      toast.error("Erro ao gerar post")
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function nextStep() {
    if (currentStep < 3) setCurrentStep(prev => prev + 1)
  }

  function prevStep() {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Agente de Conteúdo"
        description="Gere posts completos com auxílio da IA"
      />

      {/* Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep >= step.id
                ? "bg-accent-500 text-white"
                : "bg-muted text-muted-foreground"
            )}>
              {step.id}
            </div>
            <span className={cn(
              "text-sm hidden sm:inline",
              currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div className="w-8 h-px bg-border mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label>Tema do Post</Label>
                <Input
                  placeholder="Ex: Fundos Imobiliários para iniciantes"
                  value={formData.tema}
                  onChange={(e) => updateForm("tema", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="mb-2 block">Tipo de Conteúdo</Label>
                <div className="grid grid-cols-2 gap-3">
                  {TIPOS_CONTEUDO.map((tipo) => (
                    <Button
                      key={tipo.id}
                      variant={formData.tipoConteudo === tipo.id ? "default" : "outline"}
                      className={cn(
                        "h-auto py-4 justify-start gap-3",
                        formData.tipoConteudo === tipo.id && "bg-accent-500 hover:bg-accent-600"
                      )}
                      onClick={() => updateForm("tipoConteudo", tipo.id)}
                    >
                      <tipo.icon className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-medium">{tipo.label}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={nextStep}
                  disabled={!formData.tema || !formData.tipoConteudo}
                  className="bg-accent-500 hover:bg-accent-600"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Formato</Label>
                <div className="grid grid-cols-3 gap-3">
                  {FORMATOS_POST.map((formato) => (
                    <Button
                      key={formato.id}
                      variant={formData.formato === formato.id ? "default" : "outline"}
                      className={cn(
                        "h-auto py-6 flex-col gap-2",
                        formData.formato === formato.id && "bg-accent-500 hover:bg-accent-600"
                      )}
                      onClick={() => updateForm("formato", formato.id)}
                    >
                      <formato.icon className="h-6 w-6" />
                      <span>{formato.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!formData.formato}
                  className="bg-accent-500 hover:bg-accent-600"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Perfil da Persona</Label>
                <div className="grid grid-cols-3 gap-3">
                  {PERFIS_PERSONA.map((perfil) => (
                    <Button
                      key={perfil.id}
                      variant={formData.perfilPersona === perfil.id ? "default" : "outline"}
                      className={cn(
                        "h-auto py-4",
                        formData.perfilPersona === perfil.id && "bg-accent-500 hover:bg-accent-600"
                      )}
                      onClick={() => updateForm("perfilPersona", perfil.id)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {perfil.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Persona Específica (opcional)</Label>
                <Input
                  placeholder="Ex: Fernanda, Carlos..."
                  value={formData.persona}
                  onChange={(e) => updateForm("persona", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  onClick={generatePost}
                  disabled={!formData.perfilPersona || loading}
                  className="bg-accent-500 hover:bg-accent-600"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Gerar Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Post Gerado
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                    <PenTool className="h-4 w-4 mr-1" />
                    Novo
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                rows={15}
                className="font-mono text-sm resize-none"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
