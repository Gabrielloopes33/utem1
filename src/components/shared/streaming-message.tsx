"use client"

import { useStreamingText } from "@/hooks/use-streaming-text"

interface StreamingMessageProps {
  content: string
  speed?: number
  onComplete?: () => void
  className?: string
}

export function StreamingMessage({ 
  content, 
  speed = 12, 
  onComplete,
  className = ""
}: StreamingMessageProps) {
  const { displayText, isComplete } = useStreamingText(content, { speed, onComplete })

  return (
    <div className={`whitespace-pre-line ${className}`}>
      {displayText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-accent-500 ml-0.5 animate-pulse" />
      )}
    </div>
  )
}

// Versão para texto em tempo real (streaming de chunks)
interface RealtimeStreamingProps {
  chunks: string[]
  speed?: number
  className?: string
}

export function RealtimeStreaming({ 
  chunks, 
  speed = 20,
  className = ""
}: RealtimeStreamingProps) {
  const fullText = chunks.join("")
  const { displayText, isComplete } = useStreamingText(fullText, { speed })

  return (
    <div className={`whitespace-pre-line ${className}`}>
      {displayText}
      {!isComplete && chunks.length > 0 && (
        <span className="inline-block w-0.5 h-4 bg-accent-500 ml-0.5 animate-pulse" />
      )}
    </div>
  )
}
