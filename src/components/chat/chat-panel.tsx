"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useRef, useEffect, useState, useMemo } from "react"
import { Send, Copy, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FRONTEND_AGENT_CATALOG, isFrontendAgentName } from "@/lib/agents/catalog"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ChatPanelProps {
  agentId: string
  agentName: string
}

function getMessageText(message: { parts?: Array<{ type: string; text?: string }>, content?: string }): string {
  if (message.parts) {
    return message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text || "")
      .join("")
  }
  return message.content || ""
}

export function ChatPanel({ agentId, agentName }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const starterPrompts = isFrontendAgentName(agentName)
    ? FRONTEND_AGENT_CATALOG[agentName].starters
    : []

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { agentId } }),
    [agentId]
  )

  const { messages, sendMessage, status, error } = useChat({ transport })

  const isStreaming = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content)
    toast.success("Copiado!")
  }

  function handleSend() {
    if (!input.trim() || isStreaming) return
    sendMessage({ text: input })
    setInput("")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[600px] border border-border/50 rounded-xl bg-card overflow-hidden">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-500 mb-3">
              <Bot className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">{agentName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Envie uma mensagem para comecar
            </p>
            {starterPrompts.length > 0 && (
              <div className="mt-5 flex w-full max-w-xl flex-col gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage({ text: prompt })}
                    className="rounded-xl border border-border/60 bg-background px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((message) => {
          const text = getMessageText(message)
          if (!text && message.role === "assistant" && isStreaming) return null

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-500">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-3 text-sm",
                  message.role === "user"
                    ? "bg-accent-500 text-white"
                    : "bg-muted"
                )}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{text}</p>
                )}

                {message.role === "assistant" && text && (
                  <button
                    onClick={() => copyMessage(text)}
                    className="mt-2 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copiar
                  </button>
                )}
              </div>

              {message.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          )
        })}

        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-500">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-muted rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-danger-bg border border-danger-bg p-3 text-sm text-danger-text">
            Erro: {error.message}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            rows={1}
            className="min-h-[44px] max-h-[120px] resize-none"
          />
          <Button
            type="button"
            size="icon"
            disabled={isStreaming || !input.trim()}
            onClick={handleSend}
            className="bg-accent-500 hover:bg-accent-600 shrink-0 h-[44px] w-[44px]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
