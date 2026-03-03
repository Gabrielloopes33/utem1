"use client"

import { useState, useCallback, useRef } from "react"
import { toast } from "sonner"
import type { AgenteCampanhasPayload } from "@/lib/n8n/client"

export type CampanhaFormData = {
  nome: string
  objetivo: AgenteCampanhasPayload["objetivo"]
  formato: AgenteCampanhasPayload["formato"]
  tiposConteudo: AgenteCampanhasPayload["tiposConteudo"]
  formatos: AgenteCampanhasPayload["formatos"]
  periodo: AgenteCampanhasPayload["periodo"]
  persona?: string
}

export type CampanhaStatus = "idle" | "generating" | "streaming" | "success" | "error"

interface UseAgenteCampanhasOptions {
  enableStreaming?: boolean
  streamingSpeed?: number
}

interface UseAgenteCampanhasReturn {
  status: CampanhaStatus
  result: string | null
  streamingContent: string
  isStreaming: boolean
  generateCampanha: (data: CampanhaFormData) => Promise<void>
  reset: () => void
  skipStreaming: () => void
}

export function useAgenteCampanhas(options: UseAgenteCampanhasOptions = {}): UseAgenteCampanhasReturn {
  const { enableStreaming = true, streamingSpeed = 8 } = options
  
  const [status, setStatus] = useState<CampanhaStatus>("idle")
  const [result, setResult] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const streamingRef = useRef<NodeJS.Timeout | null>(null)
  
  const streamText = useCallback((text: string, onComplete: () => void) => {
    if (!enableStreaming) {
      setStreamingContent(text)
      setResult(text)
      setStatus("success")
      onComplete()
      return
    }

    setStatus("streaming")
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
        setResult(text)
        setStatus("success")
        onComplete()
      }
    }, streamingSpeed)
  }, [enableStreaming, streamingSpeed])
  
  const generateCampanha = useCallback(async (data: CampanhaFormData) => {
    setStatus("generating")
    setStreamingContent("")
    
    try {
      // Chama a API Route local (sem CORS)
      const response = await fetch("/api/agentes/campanhas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: data.nome,
          objetivo: data.objetivo,
          formato: data.formato,
          tiposConteudo: data.tiposConteudo,
          formatos: data.formatos,
          periodo: data.periodo,
          persona: data.persona,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }
      
      const responseData = await response.json()
      const fullResponse = responseData.response
      
      // Inicia streaming do texto
      streamText(fullResponse, () => {
        toast.success("Campanha gerada com sucesso!")
      })
      
    } catch (error) {
      console.error("Erro ao gerar campanha:", error)
      setStatus("error")
      setIsStreaming(false)
      toast.error("Erro ao gerar campanha", {
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
      })
    }
  }, [streamText])
  
  const reset = useCallback(() => {
    setStatus("idle")
    setResult(null)
    setStreamingContent("")
    setIsStreaming(false)
    if (streamingRef.current) {
      clearInterval(streamingRef.current)
    }
  }, [])

  const skipStreaming = useCallback(() => {
    if (streamingRef.current) {
      clearInterval(streamingRef.current)
    }
    setIsStreaming(false)
    if (streamingContent) {
      setResult(streamingContent)
      setStatus("success")
    }
  }, [streamingContent])
  
  return {
    status,
    result,
    streamingContent,
    isStreaming,
    generateCampanha,
    reset,
    skipStreaming,
  }
}
