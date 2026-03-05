"use client"

import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { Sparkles, Send, X, Wand2, MessageSquare, FileText, Lightbulb, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"

// Wrapper para motion.div com fallback
function MotionDiv({ 
  children, 
  className,
  initial,
  animate,
  exit,
  transition,
  onClick,
}: { 
  children: React.ReactNode
  className?: string
  initial?: { opacity?: number; y?: number; scale?: number }
  animate?: { opacity?: number; y?: number; scale?: number }
  exit?: { opacity?: number; y?: number; scale?: number }
  transition?: { duration?: number }
  onClick?: () => void
}) {
  return (
    <Suspense fallback={<div className={className} onClick={onClick}>{children}</div>}>
      <MotionDivInternal 
        className={className} 
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        onClick={onClick}
      >
        {children}
      </MotionDivInternal>
    </Suspense>
  )
}

function MotionDivInternal({ 
  children, 
  className,
  initial,
  animate,
  exit,
  transition,
  onClick,
}: { 
  children: React.ReactNode
  className?: string
  initial?: { opacity?: number; y?: number; scale?: number }
  animate?: { opacity?: number; y?: number; scale?: number }
  exit?: { opacity?: number; y?: number; scale?: number }
  transition?: { duration?: number }
  onClick?: () => void
}) {
  const [motion, setMotion] = useState<typeof import("framer-motion")["motion"] | null>(null)

  useEffect(() => {
    import("framer-motion").then((mod) => setMotion(() => mod.motion))
  }, [])

  if (!motion) {
    return <div className={className} onClick={onClick}>{children}</div>
  }

  const Component = motion.div
  return <Component 
    className={className} 
    initial={initial}
    animate={animate}
    exit={exit}
    transition={transition}
    onClick={onClick}
  >{children}</Component>
}

// Wrapper para AnimatePresence
function AnimatePresence({ children }: { children: React.ReactNode }) {
  const [Component, setComponent] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null)

  useEffect(() => {
    import("framer-motion").then((mod) => {
      setComponent(() => mod.AnimatePresence)
    })
  }, [])

  if (!Component) {
    return <>{children}</>
  }

  return <Component>{children}</Component>
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

const QUICK_PROMPTS = [
  { icon: FileText, label: "Criar legenda para Instagram", prompt: "Preciso de 7 pautas para Instagram sobre investimentos para iniciantes, objetivo de atração, persona Camila" },
  { icon: Lightbulb, label: "Ideias de conteúdo", prompt: "Quero um bloco de 7 conteúdos para nutrição no Instagram, focado em segurança para a persona Fernanda" },
  { icon: MessageSquare, label: "Roteiro para Reels", prompt: "Crie 3 roteiros de Reels sobre quebra de objeções para conversão de leads" },
  { icon: Wand2, label: "Copy para stories", prompt: "Preciso de um bloco de conteúdos para email sobre planejamento sucessório para a persona Ricardo" },
]

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Olá! Sou o Planejador de Conteúdo da Autem. Vou transformar seus objetivos de negócio em blocos de conteúdo acionáveis.\n\nPara começar, me conte:\n- **Objetivo**: atração, nutrição ou conversão?\n- **Persona**: Fernanda, Ricardo, Camila ou Leandro?\n- **Quantidade**: quantas pautas? (sugiro blocos de 7)\n- **Canal**: Instagram ou Email?\n\nOu use uma das sugestões rápidas abaixo!",
  timestamp: new Date(),
}

export function QuickContentChat() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = useCallback(async (content: string = input) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Add placeholder for assistant response
    const assistantId = (Date.now() + 1).toString()
    setMessages((prev) => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }])

    try {
      // Call n8n webhook
      const response = await fetch("/api/n8n-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          sessionId,
          history: messages.filter(m => m.id !== "welcome").map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao comunicar com o agente")
      }

      const data = await response.json()
      
      // Update session ID
      if (data.sessionId) {
        setSessionId(data.sessionId)
      }

      // Update message with n8n response
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: data.response, isStreaming: false }
            : m
        )
      )

    } catch (error) {
      console.error("Error sending message:", error)
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.", isStreaming: false }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, sessionId])

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="w-full font-sans">
      {/* Card fechado - estado inicial */}
      <AnimatePresence>
        {!isExpanded ? (
          <MotionDiv
            key="closed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(true)}
            className="relative overflow-hidden rounded-2xl bg-[#04132a] px-8 py-8 cursor-pointer group hover:shadow-xl transition-all duration-300"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Planejador de Conteúdo
                  </span>
                </div>
                <h2 className="font-sans text-2xl font-bold text-white mb-2">
                  Qual conteúdo você quer criar hoje?
                </h2>
                <p className="text-sm text-white/60 max-w-md">
                  Transforme objetivos em blocos de conteúdo prontos para produção. Com acesso às bases de conhecimento da Autem.
                </p>
                
                {/* Quick actions preview */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {QUICK_PROMPTS.slice(0, 3).map((prompt) => (
                    <span
                      key={prompt.label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 group-hover:bg-white/15 transition-colors"
                    >
                      <prompt.icon className="h-3 w-3" />
                      {prompt.label}
                    </span>
                  ))}
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
                    +{QUICK_PROMPTS.length - 3} mais
                  </span>
                </div>
              </div>

              {/* CTA visual */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/5 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none" />
            <Sparkles className="absolute right-12 top-8 h-32 w-32 text-white/[0.03] rotate-12" />
          </MotionDiv>
        ) : (
          /* Chat expandido */
          <MotionDiv
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-2xl bg-[#04132a] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/5">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-white">
                    Agente de Conteúdo
                  </h3>
                  <p className="text-xs text-white/50">Planejador da Autem (N8N)</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages area */}
            <div className="h-[450px] overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-[#5B8DEF] text-white"
                        : "bg-white/10 text-white/90"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>
                          {message.content || (message.isStreaming ? "Processando..." : "")}
                        </ReactMarkdown>
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-white/50 ml-1 animate-pulse" />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    <span className="text-[10px] opacity-50 mt-2 block">
                      {message.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-white/60 animate-spin" />
                    <span className="text-sm text-white/60">Consultando bases de conhecimento...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-6 py-3 border-t border-white/10">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                Sugestões rápidas
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => handlePromptClick(prompt.prompt)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    <prompt.icon className="h-3 w-3" />
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Descreva o conteúdo que você quer planejar..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20 focus:bg-white/10 transition-colors disabled:opacity-50"
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-[#5B8DEF] hover:bg-[#4A78D6] disabled:opacity-50 h-11 w-11 rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}
