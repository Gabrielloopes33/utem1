"use client"

import { useState, useEffect, useCallback } from "react"

interface UseStreamingTextOptions {
  speed?: number
  onComplete?: () => void
}

export function useStreamingText(text: string, options: UseStreamingTextOptions = {}) {
  const { speed = 15, onComplete } = options
  const [displayText, setDisplayText] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const startStreaming = useCallback(() => {
    setDisplayText("")
    setIsComplete(false)
    setIsStreaming(true)
  }, [])

  useEffect(() => {
    if (!text || !isStreaming) return

    let index = 0
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        setIsStreaming(false)
        onComplete?.()
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, onComplete, isStreaming])

  return { displayText, isComplete, isStreaming, startStreaming }
}

// Hook para gerenciar múltiplas mensagens com streaming
export function useStreamingMessages() {
  const [streamingId, setStreamingId] = useState<string | null>(null)

  const startStreaming = useCallback((id: string) => {
    setStreamingId(id)
  }, [])

  const stopStreaming = useCallback(() => {
    setStreamingId(null)
  }, [])

  return {
    streamingId,
    startStreaming,
    stopStreaming,
    isStreaming: (id: string) => streamingId === id,
  }
}
