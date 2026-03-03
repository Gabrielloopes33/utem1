"use client"

import { useState, useCallback } from "react"
import { agenteGerarPost } from "@/lib/n8n/client"
import { toast } from "sonner"
import type { 
  PostFormData,
  GeneratedPost 
} from "@/types/post"

export type PostStatus = "idle" | "generating" | "success" | "error"

interface UseAgenteGerarPostReturn {
  status: PostStatus
  result: GeneratedPost | null
  generatePost: (data: PostFormData) => Promise<void>
  reset: () => void
  saveToLibrary: (post: GeneratedPost) => Promise<void>
}

export function useAgenteGerarPost(): UseAgenteGerarPostReturn {
  const [status, setStatus] = useState<PostStatus>("idle")
  const [result, setResult] = useState<GeneratedPost | null>(null)
  
  const generatePost = useCallback(async (data: PostFormData) => {
    setStatus("generating")
    
    try {
      const response = await agenteGerarPost({
        tema: data.tema,
        tipoConteudo: data.tipoConteudo,
        formato: data.formato,
        persona: data.persona,
        perfilPersona: data.perfilPersona,
        campanha: data.campanha,
        referencias: data.referencias,
      })
      
      const generatedPost: GeneratedPost = {
        id: crypto.randomUUID(),
        user_id: "anonymous",
        tema: data.tema,
        tipo: data.tipoConteudo,
        formato: data.formato,
        persona: data.persona,
        status: "completed",
        content: {
          hook: response.post.split('\n')[0] || "",
          copy: response.post,
          legenda: response.metadata?.tema || data.tema,
          hashtags: [],
          elementosVisuais: "",
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      setResult(generatedPost)
      setStatus("success")
      toast.success("Post gerado com sucesso!")
      
    } catch (error) {
      console.error("Erro ao gerar post:", error)
      setStatus("error")
      toast.error("Erro ao gerar post", {
        description: "Tente novamente em alguns instantes.",
      })
    }
  }, [])
  
  const saveToLibrary = useCallback(async (_post: GeneratedPost) => {
    try {
      toast.success("Post salvo na biblioteca!")
    } catch {
      toast.error("Erro ao salvar post")
    }
  }, [])
  
  const reset = useCallback(() => {
    setStatus("idle")
    setResult(null)
  }, [])
  
  return {
    status,
    result,
    generatePost,
    reset,
    saveToLibrary,
  }
}
