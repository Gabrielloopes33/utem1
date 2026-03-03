"use client"

import { useState, useCallback } from "react"
import { agentePersonas } from "@/lib/n8n/client"
import { toast } from "sonner"
import type { PersonaProfile } from "@/types/persona"
import { PERSONA_TEMPLATES } from "@/types/persona"

export type PersonaFormData = {
  nome: string
  perfil: PersonaProfile
  idade?: number
  renda?: string
  patrimonio?: string
  objetivos?: string[]
  medos?: string[]
}

export type PersonaStatus = "idle" | "generating" | "success" | "error"

interface UseAgentePersonasReturn {
  status: PersonaStatus
  result: string | null
  template: Partial<import("@/types/persona").Persona> | null
  generatePersona: (data: PersonaFormData) => Promise<void>
  loadTemplate: (perfil: PersonaProfile) => void
  reset: () => void
}

export function useAgentePersonas(): UseAgentePersonasReturn {
  const [status, setStatus] = useState<PersonaStatus>("idle")
  const [result, setResult] = useState<string | null>(null)
  const [template, setTemplate] = useState<Partial<import("@/types/persona").Persona> | null>(null)
  
  const loadTemplate = useCallback((perfil: PersonaProfile) => {
    setTemplate(PERSONA_TEMPLATES[perfil] || null)
  }, [])
  
  const generatePersona = useCallback(async (data: PersonaFormData) => {
    setStatus("generating")
    
    try {
      const payload = {
        acao: "criar" as const,
        nome: data.nome,
        perfil: data.perfil,
        dados: {
          idade: data.idade,
          renda: data.renda,
          patrimonio: data.patrimonio,
          objetivos: data.objetivos,
          medos: data.medos,
        },
      }
      
      const response = await agentePersonas(payload)
      setResult(response)
      setStatus("success")
      toast.success(`Persona ${data.nome} gerada com sucesso!`)
      
    } catch (error) {
      console.error("Erro ao gerar persona:", error)
      setStatus("error")
      toast.error("Erro ao gerar persona", {
        description: "Tente novamente em alguns instantes.",
      })
    }
  }, [])
  
  const reset = useCallback(() => {
    setStatus("idle")
    setResult(null)
    setTemplate(null)
  }, [])
  
  return {
    status,
    result,
    template,
    generatePersona,
    loadTemplate,
    reset,
  }
}
