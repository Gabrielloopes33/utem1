"use client"

import { useState, useEffect } from "react"
import { Bot, Brain, Sparkles, Cpu, Lightbulb, Wand2 } from "lucide-react"

interface AgentLoadingAnimationProps {
  messages?: { icon: React.ElementType; text: string }[]
  interval?: number
}

const defaultMessages = [
  { icon: Brain, text: "Analisando contexto..." },
  { icon: Lightbulb, text: "Gerando ideias criativas..." },
  { icon: Sparkles, text: "Processando conteúdo..." },
  { icon: Cpu, text: "Otimizando resultado..." },
]

export function AgentLoadingAnimation({ 
  messages = defaultMessages,
  interval = 1200 
}: AgentLoadingAnimationProps) {
  const [statusIndex, setStatusIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % messages.length)
    }, interval)
    return () => clearInterval(timer)
  }, [messages.length, interval])

  const CurrentIcon = messages[statusIndex].icon

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
          <span className="animate-pulse">{messages[statusIndex].text}</span>
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

// Versão simplificada para uso em cards e áreas menores
export function AgentLoadingCompact() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="relative">
        <Bot className="h-4 w-4" />
        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      </div>
      <div className="flex gap-0.5">
        <span className="w-1 h-1 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1 h-1 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1 h-1 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}

// Animação para quando está gerando texto longo (ex: campanha, post)
export function GeneratingAnimation({ text = "Gerando conteúdo..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent-500/20 to-primary/20 flex items-center justify-center">
          <Wand2 className="h-8 w-8 text-accent-500 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-accent-500/30 animate-ping" />
        <div className="absolute -inset-2 rounded-full border border-accent-500/10 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <p className="font-medium">{text}</p>
        <div className="flex justify-center gap-1">
          <span className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}

// Animação para chat
export function ChatTypingAnimation() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <Bot className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
      </div>
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}
