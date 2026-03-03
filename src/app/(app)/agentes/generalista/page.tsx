"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Send, 
  Trash2, 
  Sparkles, 
  TrendingUp, 
  Building, 
  Scale, 
  Lightbulb,
  BookOpen,
  Shield,
  RefreshCw,
  Bot,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAgenteGeneralista } from "@/hooks/use-agente-generalista"
import { QUICK_PROMPTS } from "@/types/chat"
import { cn } from "@/lib/utils"

// Mapeamento de ícones
const iconMap: Record<string, React.ReactNode> = {
  Building: <Building className="h-4 w-4" />,
  Scale: <Scale className="h-4 w-4" />,
  Lightbulb: <Lightbulb className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
}

export default function AgenteGeneralistaPage() {
  const [input, setInput] = useState("")
  const { messages, status, sendMessage, clearHistory, retryLastMessage } = useAgenteGeneralista()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll automático para o final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status === "loading") return
    
    const message = input
    setInput("")
    await sendMessage(message)
  }

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "educacao":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "comparacao":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
      case "tendencias":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "dicas":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
      default:
        return "bg-accent-500/10 text-accent-500 hover:bg-accent-500/20"
    }
  }

  return (
    <div className="animate-fade-up flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="Agente Generalista"
        description="Brainstorming de ideias de conteúdo com IA"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={clearHistory}
          disabled={messages.length === 0}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Limpar histórico
        </Button>
      </PageHeader>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar com sugestões */}
        <div className="hidden lg:flex w-64 flex-col gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-accent-500" />
              <h3 className="font-semibold text-sm">Sugestões rápidas</h3>
            </div>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleQuickPrompt(prompt.label)}
                  disabled={status === "loading"}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors",
                    getCategoryColor(prompt.category),
                    status === "loading" && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {iconMap[prompt.icon || ""] || <Sparkles className="h-4 w-4" />}
                  <span className="truncate">{prompt.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-4 w-4 text-accent-500" />
              <h3 className="font-semibold text-sm">Sobre o agente</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O Agente Generalista é seu parceiro para brainstorming de ideias de conteúdo 
              sobre investimentos e finanças. Ele entrega sugestões criativas imediatamente, 
              sem fazer mil perguntas.
            </p>
            <div className="mt-4 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">Ideias</Badge>
              <Badge variant="secondary" className="text-[10px]">Hooks</Badge>
              <Badge variant="secondary" className="text-[10px]">Formatos</Badge>
              <Badge variant="secondary" className="text-[10px]">Personas</Badge>
            </div>
          </Card>
        </div>

        {/* Área principal do chat */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Mensagens */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-accent-500" />
                </div>
                <h3 className="font-semibold mb-2">
                  Como posso ajudar com ideias de conteúdo?
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                  Me conte um tema (ex: Fundos Imobiliários, Ações para iniciantes, 
                  Tesouro Direto) e eu te entrego 3-5 ideias criativas imediatamente.
                </p>
                
                {/* Sugestões mobile */}
                <div className="flex lg:hidden flex-wrap gap-2 justify-center">
                  {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handleQuickPrompt(prompt.label)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs transition-colors",
                        getCategoryColor(prompt.category)
                      )}
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        msg.role === "user" 
                          ? "bg-accent-500 text-white" 
                          : "bg-muted"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl p-4",
                        msg.role === "user"
                          ? "bg-accent-500 text-white rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {status === "loading" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-md p-4">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error state */}
                {status === "error" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl rounded-bl-md p-4 max-w-[80%]">
                      <p className="text-sm text-red-500 mb-2">
                        Erro ao gerar resposta. Tente novamente.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={retryLastMessage}
                        className="gap-2"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Tentar novamente
                      </Button>
                    </div>
                  </div>
                )}
                
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite um tema (ex: Fundos Imobiliários)..."
                disabled={status === "loading"}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!input.trim() || status === "loading"}
                className="bg-accent-500 hover:bg-accent-600 gap-2"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
