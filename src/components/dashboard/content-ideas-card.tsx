"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Lightbulb, Send, X, Bot, User, Minimize2, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { agenteGeneralista } from "@/lib/n8n/client"
import { Brain, Sparkles, Cpu } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isTyping?: boolean
}

const QUICK_IDEAS = [
  "RF vs FII: qual escolher?",
  "5 erros no CDB",
  "Diversificação inteligente",
  "Dúvidas sobre Tesouro",
]

// Animação tech de loading com status
function TechLoadingAnimation() {
  const [statusIndex, setStatusIndex] = useState(0)
  const statusMessages = [
    { icon: Brain, text: "Analisando contexto..." },
    { icon: Sparkles, text: "Gerando ideias criativas..." },
    { icon: Cpu, text: "Processando conteúdo..." },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [statusMessages.length])

  const CurrentIcon = statusMessages[statusIndex].icon

  return (
    <div className="flex items-center gap-3 bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3 border border-accent-500/10">
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-500 to-primary flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-2 border-accent-500/30 animate-ping" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CurrentIcon className="h-3 w-3 text-accent-500 animate-pulse" />
          <span className="animate-pulse">{statusMessages[statusIndex].text}</span>
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="w-1.5 h-1.5 bg-accent-500/50 rounded-full animate-bounce" style={{ animationDelay: "450ms" }} />
        </div>
      </div>
    </div>
  )
}

// Hook para efeito de digitação
function useTypewriter(text: string, speed: number = 15, onComplete?: () => void) {
  const [displayText, setDisplayText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) return
    
    setDisplayText("")
    setIsComplete(false)
    let index = 0
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        onComplete?.()
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, onComplete])

  return { displayText, isComplete }
}

// Componente de mensagem com efeito de digitação
function TypingMessage({ content, onComplete }: { content: string; onComplete?: () => void }) {
  const { displayText, isComplete } = useTypewriter(content, 12, onComplete)

  return (
    <div className="whitespace-pre-line">
      {displayText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-accent-500 ml-0.5 animate-pulse" />
      )}
    </div>
  )
}

interface ContentIdeasCardProps {
  className?: string
  initialExpanded?: boolean
  onClose?: () => void
  showCloseButton?: boolean
}

export function ContentIdeasCard({
  className = "",
  initialExpanded = false,
  onClose,
  showCloseButton = false,
}: ContentIdeasCardProps) {
  const [chatMessage, setChatMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChatExpanded, setIsChatExpanded] = useState(initialExpanded)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [typingComplete, setTypingComplete] = useState<Record<number, boolean>>({})

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [messages, typingComplete])

  const handleTypingComplete = useCallback((index: number) => {
    setTypingComplete((prev) => ({ ...prev, [index]: true }))
  }, [])

  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!chatMessage.trim() || isLoading) return

    const userMessage = chatMessage.trim()
    setChatMessage("")
    setIsLoading(true)

    // Add user message
    const newUserMessage: ChatMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      // Preparar payload
      const payload = {
        message: userMessage,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
        userId: "user-1",
      }
      
      console.log("[DEBUG] Enviando payload:", JSON.stringify(payload, null, 2))

      // CHAMA O AGENTE GENERALISTA REAL DO N8N
      const response = await agenteGeneralista(payload)
      
      console.log("[DEBUG] Resposta recebida:", response)

      // Add assistant response (will be typed out)
      const newAssistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
        isTyping: true,
      }
      setMessages((prev) => [...prev, newAssistantMessage])
    } catch (error) {
      console.error("[DEBUG] Erro ao chamar agente:", error)
      
      // Mostrar erro detalhado no toast
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error("Erro ao gerar ideias", {
        description: errorMessage,
        duration: 8000,
      })
      
      // Adicionar mensagem de erro no chat
      const errorAssistantMessage: ChatMessage = {
        role: "assistant",
        content: `❌ Ops! Ocorreu um erro: ${errorMessage}\n\nTente novamente ou entre em contato com o suporte se o problema persistir.`,
        timestamp: new Date(),
        isTyping: false,
      }
      setMessages((prev) => [...prev, errorAssistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  function handleInputFocus() {
    if (!isChatExpanded) {
      setIsChatExpanded(true)
    }
  }

  function handleCloseChat() {
    setIsChatExpanded(false)
    setMessages([])
    setChatMessage("")
    onClose?.()
  }

  return (
    <Card 
      className={`border-accent-500/20 bg-gradient-to-br from-accent-500/5 to-transparent transition-all duration-300 flex-1 ${
        isChatExpanded ? "shadow-xl ring-1 ring-accent-500/20" : ""
      } ${className}`}
    >
      <CardContent className={`p-4 flex flex-col h-full ${isChatExpanded ? "" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent-500" />
            <h3 className="font-semibold text-sm">Ideias de Conteúdo</h3>
            <Badge variant="secondary" className="text-[10px]">IA</Badge>
          </div>
          {(isChatExpanded || showCloseButton) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseChat}
              className="h-7 w-7 p-0 text-muted-foreground"
            >
              {showCloseButton ? <X className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
          )}
        </div>
        
        {/* Messages Area - Only shown when expanded */}
        {isChatExpanded && (
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2 min-h-0">
            {messages.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Bot className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Olá! Como posso ajudar com ideias de conteúdo?</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                  msg.role === "user" ? "bg-accent-500/20" : "bg-primary/10"
                }`}>
                  {msg.role === "user" ? (
                    <User className="h-3 w-3 text-accent-500" />
                  ) : (
                    <Bot className="h-3 w-3 text-primary" />
                  )}
                </div>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                  msg.role === "user"
                    ? "bg-accent-500 text-white rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}>
                  {msg.role === "assistant" && msg.isTyping && !typingComplete[index] ? (
                    <TypingMessage 
                      content={msg.content} 
                      onComplete={() => handleTypingComplete(index)}
                    />
                  ) : (
                    <div className="whitespace-pre-line">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <TechLoadingAnimation />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Input Area */}
        <form onSubmit={handleChatSubmit} className="space-y-2 mt-auto">
          <div className="relative">
            <Input
              placeholder="Qual tema quer explorar?"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onFocus={handleInputFocus}
              className="pr-20 h-10 text-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !chatMessage.trim()}
              className="absolute right-1 top-1 bottom-1 bg-accent-500 hover:bg-accent-600 h-8 px-2"
            >
              {isLoading ? (
                <Zap className="h-3 w-3 animate-pulse" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          {/* Quick suggestions */}
          {!isChatExpanded && (
            <div className="flex gap-1 flex-wrap">
              {QUICK_IDEAS.slice(0, 3).map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => {
                    setChatMessage(idea)
                    if (!isChatExpanded) setIsChatExpanded(true)
                  }}
                  className="text-[10px] px-2 py-1 rounded-full bg-muted hover:bg-accent-500/10 hover:text-accent-500 transition-colors"
                >
                  {idea}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Simple Response (when not expanded) */}
        {!isChatExpanded && messages.length > 0 && (
          <div className="mt-3 p-3 bg-card rounded-lg border whitespace-pre-line text-xs">
            <div className="flex items-center gap-1 mb-1 text-muted-foreground">
              <Bot className="h-3 w-3" />
              <span>Última resposta</span>
            </div>
            <p className="line-clamp-3">{messages[messages.length - 1].content}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatExpanded(true)}
              className="mt-2 text-accent-500 h-6 text-xs px-2"
            >
              Continuar →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ContentIdeasCard
