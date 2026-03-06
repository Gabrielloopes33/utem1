"use client"

/**
 * Agente de Ideias - Chat Interface
 * Usa o novo ChatInterface com persistência em agent_conversations
 * API Route: /api/agentes/conteudo (modo chat)
 */

import { useState } from "react"
import { Sparkles, Trash2, MessageSquare, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { ChatInterface } from "@/components/agentes/chat-interface"
import { useAgenteConteudoChat } from "@/hooks/use-agente-conteudo-chat"
import { QUICK_PROMPTS } from "@/types/chat"

// Mapeamento de ícones para as sugestões
const iconMap: Record<string, string> = {
  Building: "🏢",
  Scale: "⚖️",
  Lightbulb: "💡",
  TrendingUp: "📈",
  BookOpen: "📚",
  Shield: "🛡️",
}

// Sugestões iniciais formatadas
const STARTER_PROMPTS = QUICK_PROMPTS.map(p => `${iconMap[p.icon || ""] || "💡"} ${p.label}`)

export default function AgenteIdeiasPage() {
  const [conversationId, setConversationId] = useState<string>()
  
  const {
    messages,
    conversation,
    isSending,
    hasMessages,
    sendMessage,
    createConversation,
  } = useAgenteConteudoChat({
    conversationId,
    agentType: "generalista",
    autoLoad: false,
  })

  const handleConversationCreated = (id: string) => {
    setConversationId(id)
  }

  const handleClear = async () => {
    setConversationId(undefined)
    await createConversation("Nova conversa")
  }

  return (
    <div className="animate-fade-up flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="Agente de Ideias"
        description="Brainstorming de ideias de conteúdo com IA"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!hasMessages || isSending}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Nova conversa
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar com info e sugestões */}
        <div className="hidden lg:flex w-72 flex-col gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-accent-500" />
              <h3 className="font-semibold text-sm">Sugestões rápidas</h3>
            </div>
            <div className="space-y-2">
              {STARTER_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(prompt.replace(/^[💡📈🏢⚖️📚🛡️]\s*/, ""))}
                  disabled={isSending}
                  className="w-full text-left p-2 rounded-lg text-sm transition-colors hover:bg-accent-500/10 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-4 w-4 text-accent-500" />
              <h3 className="font-semibold text-sm">Sobre o agente</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O Agente de Ideias é seu parceiro para brainstorming de conteúdo 
              sobre investimentos. Ele entrega 3-5 ideias criativas imediatamente.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{messages.length} mensagens</span>
              </div>
              {conversation && (
                <div className="text-xs text-muted-foreground">
                  Conversa: {conversation.title}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Área principal do chat - NOVO ChatInterface */}
        <div className="flex-1 min-h-0">
          <ChatInterface
            agentId="agente-ideias"
            agentName="Agente de Ideias"
            agentType="generalista"
            conversationId={conversationId}
            initialMessages={messages}
            starterPrompts={STARTER_PROMPTS}
            onConversationCreated={handleConversationCreated}
            apiEndpoint="/api/agentes/conteudo"
            height="100%"
          />
        </div>
      </div>
    </div>
  )
}
