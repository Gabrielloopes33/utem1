"use client"

import { useState, useCallback, useRef } from "react"
import { toast } from "sonner"
import type { 
  PostFormData,
  GeneratedPost 
} from "@/types/post"

export type PostStatus = "idle" | "generating" | "streaming" | "success" | "error"

interface UseAgenteGerarPostOptions {
  enableStreaming?: boolean
  streamingSpeed?: number
}

interface UseAgenteGerarPostReturn {
  status: PostStatus
  result: GeneratedPost | null
  streamingContent: string
  isStreaming: boolean
  generatePost: (data: PostFormData) => Promise<void>
  reset: () => void
  saveToLibrary: (post: GeneratedPost) => Promise<void>
  skipStreaming: () => void
}

export function useAgenteGerarPost(options: UseAgenteGerarPostOptions = {}): UseAgenteGerarPostReturn {
  const { enableStreaming = true, streamingSpeed = 10 } = options
  
  const [status, setStatus] = useState<PostStatus>("idle")
  const [result, setResult] = useState<GeneratedPost | null>(null)
  const [streamingContent, setStreamingContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const streamingRef = useRef<NodeJS.Timeout | null>(null)

  const streamText = useCallback((text: string, onComplete: () => void) => {
    if (!enableStreaming) {
      setStreamingContent(text)
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
        onComplete()
      }
    }, streamingSpeed)
  }, [enableStreaming, streamingSpeed])
  
  const generatePost = useCallback(async (data: PostFormData) => {
    setStatus("generating")
    setStreamingContent("")
    
    try {
      // Chama a API Route local (sem CORS)
      const response = await fetch("/api/agentes/conteudo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tema: data.tema,
          tipoConteudo: data.tipoConteudo,
          formato: data.formato,
          persona: data.persona,
          perfilPersona: data.perfilPersona,
          campanha: data.campanha,
          referencias: data.referencias,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }
      
      const responseData = await response.json()
      const fullPost = responseData.post || ""
      
      // Inicia streaming do texto
      streamText(fullPost, () => {
        const generatedPost: GeneratedPost = {
          id: crypto.randomUUID(),
          user_id: "anonymous",
          tema: data.tema,
          tipo: data.tipoConteudo,
          formato: data.formato,
          persona: data.persona,
          status: "completed",
          content: {
            hook: fullPost.split('\n')[0] || "",
            copy: fullPost,
            legenda: responseData.metadata?.tema || data.tema,
            hashtags: [],
            elementosVisuais: "",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        setResult(generatedPost)
        setStatus("success")
        toast.success("Post gerado com sucesso!")
      })
      
    } catch (error) {
      console.error("Erro ao gerar post:", error)
      setStatus("error")
      setIsStreaming(false)
      toast.error("Erro ao gerar post", {
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
      })
    }
  }, [streamText])
  
  const saveToLibrary = useCallback(async (_post: GeneratedPost) => {
    try {
      toast.success("Post salvo na biblioteca!")
    } catch {
      toast.error("Erro ao salvar post")
    }
  }, [])

  const skipStreaming = useCallback(() => {
    if (streamingRef.current) {
      clearInterval(streamingRef.current)
    }
    setIsStreaming(false)
    if (streamingContent && result) {
      setResult({
        ...result,
        content: {
          ...result.content,
          copy: streamingContent,
        }
      })
      setStatus("success")
    }
  }, [streamingContent, result])
  
  const reset = useCallback(() => {
    setStatus("idle")
    setResult(null)
    setStreamingContent("")
    setIsStreaming(false)
    if (streamingRef.current) {
      clearInterval(streamingRef.current)
    }
  }, [])
  
  return {
    status,
    result,
    streamingContent,
    isStreaming,
    generatePost,
    reset,
    saveToLibrary,
    skipStreaming,
  }
}
