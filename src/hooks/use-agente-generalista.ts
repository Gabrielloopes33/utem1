"use client"

import { useState, useCallback, useEffect } from "react"
import { agenteGeneralista } from "@/lib/n8n/client"
import { toast } from "sonner"
import type { ChatHistoryItem, ChatStatus } from "@/types/chat"

interface UseAgenteGeneralistaOptions {
  persistHistory?: boolean
  maxHistory?: number
}

export function useAgenteGeneralista(options: UseAgenteGeneralistaOptions = {}) {
  const { persistHistory = true, maxHistory = 50 } = options
  
  const [messages, setMessages] = useState<ChatHistoryItem[]>([])
  const [status, setStatus] = useState<ChatStatus>("idle")
  
  // Carregar histórico do localStorage ao iniciar
  useEffect(() => {
    if (persistHistory) {
      const saved = localStorage.getItem("agente-generalista-history")
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
      localStorage.setItem("agente-generalista-history", JSON.stringify(messages))
    }
  }, [messages, persistHistory])
  
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return
    
    const userMessage: ChatHistoryItem = { role: "user", content: message }
    setMessages(prev => [...prev, userMessage])
    setStatus("loading")
    
    try {
      const history = messages.slice(-maxHistory)
      
      const response = await agenteGeneralista({
        message,
        history,
        userId: "anonymous", // TODO: Integrar com auth
      })
      
      const assistantMessage: ChatHistoryItem = { 
        role: "assistant", 
        content: response 
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setStatus("idle")
      
    } catch (error) {
      console.error("Erro ao chamar agente:", error)
      setStatus("error")
      toast.error("Erro ao gerar resposta", {
        description: "Tente novamente em alguns instantes.",
      })
    }
  }, [messages, maxHistory])
  
  const clearHistory = useCallback(() => {
    setMessages([])
    localStorage.removeItem("agente-generalista-history")
    toast.success("Histórico limpo")
  }, [])
  
  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")
    if (lastUserMessage) {
      // Remove a última resposta de erro se existir
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1))
      await sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])
  
  return {
    messages,
    status,
    sendMessage,
    clearHistory,
    retryLastMessage,
  }
}
