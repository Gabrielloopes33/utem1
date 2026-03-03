"use client"

import { useState, useCallback } from "react"
import { agenteCampanhas } from "@/lib/n8n/client"
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

export type CampanhaStatus = "idle" | "generating" | "success" | "error"

interface UseAgenteCampanhasReturn {
  status: CampanhaStatus
  result: string | null
  generateCampanha: (data: CampanhaFormData) => Promise<void>
  reset: () => void
}

export function useAgenteCampanhas(): UseAgenteCampanhasReturn {
  const [status, setStatus] = useState<CampanhaStatus>("idle")
  const [result, setResult] = useState<string | null>(null)
  
  const generateCampanha = useCallback(async (data: CampanhaFormData) => {
    setStatus("generating")
    
    try {
      const payload: AgenteCampanhasPayload = {
        nome: data.nome,
        objetivo: data.objetivo,
        formato: data.formato,
        tiposConteudo: data.tiposConteudo,
        formatos: data.formatos,
        periodo: data.periodo,
        persona: data.persona,
      }
      
      const response = await agenteCampanhas(payload)
      setResult(response)
      setStatus("success")
      toast.success("Campanha gerada com sucesso!")
      
    } catch (error) {
      console.error("Erro ao gerar campanha:", error)
      setStatus("error")
      toast.error("Erro ao gerar campanha", {
        description: "Tente novamente em alguns instantes.",
      })
    }
  }, [])
  
  const reset = useCallback(() => {
    setStatus("idle")
    setResult(null)
  }, [])
  
  return {
    status,
    result,
    generateCampanha,
    reset,
  }
}
