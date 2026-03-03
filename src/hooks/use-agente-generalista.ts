"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import type { ChatHistoryItem, ChatStatus } from "@/types/chat"

interface UseAgenteGeneralistaOptions {
  persistHistory?: boolean
  maxHistory?: number
  enableStreaming?: boolean
  streamingSpeed?: number
}

export function useAgenteGeneralista(options: UseAgenteGeneralistaOptions = {}) {
  const { 
    persistHistory = true, 
    maxHistory = 50,
    enableStreaming = true,
    streamingSpeed = 12
  } = options
  
  const [messages, setMessages] = useState<ChatHistoryItem[]>([])
  const [status, setStatus] = useState<ChatStatus>("idle")
  const [streamingContent, setStreamingContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const streamingRef = useRef<NodeJS.Timeout | null>(null)
  
  // Carregar histórico do localStorage ao iniciar
  useEffect(() => {
    if (persistHistory) {
      const saved = localStorage.getItem("agente-ideias-history")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setMessages(parsed)
        } catch {
          console.error("Erro ao carregar histórico")
        }
      }
    }
  }, [persistHistory])
  
  // Salvar histórico quando mudar
  useEffect(() => {
    if (persistHistory && messages.length > 0) {
      localStorage.setItem("agente-ideias-history", JSON.stringify(messages))
    }
  }, [messages, persistHistory])

  // Função para fazer streaming do texto
  const streamText = useCallback((text: string, onComplete: () => void) => {
    if (!enableStreaming) {
      setStreamingContent(text)
      onComplete()
      return
    }

    setIsStreaming(true)
    setStreamingContent("")
    let index = 0

    if (streamingRef.current) {
      clearInterval(streamingRef.current)
    }

    streamingRef.current = setInterval(() => {
      if (index < text.length) {
        setStreamingContent(text.slice(0, index + 1))
        index++
      } else {
        if (streamingRef.current) {
          clearInterval(streamingRef.current)
        }
        setIsStreaming(false)
        onComplete()
      }
    }, streamingSpeed)
  }, [enableStreaming, streamingSpeed])
  
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return
    
    const userMessage: ChatHistoryItem = { role: "user", content: message }
    setMessages(prev => [...prev, userMessage])
    setStatus("loading")
    setStreamingContent("")
    
    try {
      const history = messages.slice(-maxHistory)
      
      // Chama a API Route local (sem CORS)
      const response = await fetch("/api/agentes/ideias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history,
          userId: "anonymous",
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      const fullResponse = data.response
      
      // Inicia streaming do texto
      streamText(fullResponse, () => {
        setMessages(prev => [...prev, { role: "assistant", content: fullResponse }])
        setStreamingContent("")
        setStatus("idle")
      })
      
    } catch (error) {
      console.error("Erro ao chamar agente:", error)
      setStatus("error")
      setIsStreaming(false)
      toast.error("Erro ao gerar resposta", {
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
      })
    }
  }, [messages, maxHistory, streamText])
  
  const clearHistory = useCallback(() => {
    setMessages([])
    setStreamingContent("")
    setIsStreaming(false)
    if (streamingRef.current) {
      clearInterval(streamingRef.current)
    }
    localStorage.removeItem("agente-ideias-history")
    toast.success("Histórico limpo")
  }, [])
  
  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")
    if (lastUserMessage) {
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1))
      setStreamingContent("")
      await sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])

  const skipStreaming = useCallback(() => {
    if (streamingRef.current) {
      clearInterval(streamingRef.current)
    }
    setIsStreaming(false)
    if (streamingContent) {
      setMessages(prev => [...prev, { role: "assistant", content: streamingContent }])
      setStreamingContent("")
      setStatus("idle")
    }
  }, [streamingContent])
  
  return {
    messages,
    status,
    streamingContent,
    isStreaming,
    sendMessage,
    clearHistory,
    retryLastMessage,
    skipStreaming,
  }
}
