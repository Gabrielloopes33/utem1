"use client"

/**
 * Agente de Ideias
 * Webhook N8N: 97ab2e1b-12f4-4a2d-b087-be15edfaf000
 * 
 * Payload: { message, history, userId }
 * Resposta: Texto com ideias de conteúdo formatado
 */

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
  User,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
  role: "user" | "assistant"
  content: string
}

const QUICK_PROMPTS = [
  { icon: "Building", label: "Fundos Imobiliários", prompt: "Gere ideias sobre Fundos Imobiliários" },
  { icon: "Scale", label: "CDB vs Tesouro", prompt: "Compare CDB e Tesouro Direto" },
  { icon: "Lightbulb", label: "Dicas de Investimento", prompt: "Dê dicas de investimento para iniciantes" },
  { icon: "TrendingUp", label: "Ações", prompt: "Fale sobre investimento em ações" },
]

// Mapeamento de ícones
const iconMap: Record<string, React.ReactNode> = {
  Building: <Building className="h-4 w-4" />,
  Scale: <Scale className="h-4 w-4" />,
  Lightbulb: <Lightbulb className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
}

export default function AgenteIdeiasPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(content: string) {
    if (!content.trim()) return
    
    setStatus("loading")
    setMessages(prev => [...prev, { role: "user", content }])
    setInput("")
    
    try {
      const response = await fetch("https://primary-production-35e3.up.railway.app/webhook/97ab2e1b-12f4-4a2d-b087-be15edfaf000", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages,
          userId: "user-1",
        }),
      })
      
      if (!response.ok) throw new Error("Erro na requisição")
      
      const data = await response.text()
      setMessages(prev => [...prev, { role: "assistant", content: data }])
      setStatus("idle")
    } catch {
      toast.error("Erro ao enviar mensagem")
      setStatus("error")
    }
  }

  function clearHistory() {
    setMessages([])
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Agente de Ideias"
        description="Gere ideias criativas de conteúdo com auxílio da IA"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearHistory} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Limpar
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <Card className="lg:col-span-2 p-6">
          <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                <p>Comece uma conversa para gerar ideias de conteúdo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg: Message, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                      msg.role === "user" ? "bg-accent-500" : "bg-primary"
                    )}>
                      {msg.role === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                      msg.role === "user"
                        ? "bg-accent-500 text-white"
                        : "bg-muted"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {status === "loading" && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Gerando ideias...
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            />
            <Button 
              onClick={() => sendMessage(input)}
              disabled={status === "loading" || !input.trim()}
              className="bg-accent-500 hover:bg-accent-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Prompts rápidos */}
        <Card className="p-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Prompts Rápidos
          </h3>
          <div className="space-y-2">
            {QUICK_PROMPTS.map((item) => (
              <Button
                key={item.label}
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-3"
                onClick={() => sendMessage(item.prompt)}
              >
                {iconMap[item.icon]}
                <span className="text-sm">{item.label}</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
