"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Send, Copy, Bot, User, Loader2, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// ============================================
// UTILS: Remover Markdown
// ============================================

function stripMarkdown(text: string): string {
  if (!text) return "";
  return (
    text
      // Headers (###, ##, #)
      .replace(/^#{1,6}\s+/gm, "")
      // Bold (**text** ou __text__)
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      // Italic (*text* ou _text_)
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/_(.+?)_/g, "$1")
      // Código inline (`text`)
      .replace(/`(.+?)`/g, "$1")
      // Code blocks (```...```)
      .replace(/```[\s\S]*?```/g, "")
      // Links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Listas (- item ou * item ou 1. item)
      .replace(/^\s*[-*+]\s+/gm, "• ")
      .replace(/^\s*\d+\.\s+/gm, "• ")
      // Blockquotes (>
      .replace(/^\s*>\s*/gm, "")
      // Linhas horizontais (--- ou ***)
      .replace(/^[-*]{3,}\s*$/gm, "")
      // Múltiplas linhas em branco -> uma
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

// ============================================
// TIPOS
// ============================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  metadata?: {
    tokens_used?: number;
    model_used?: string;
    processing_time_ms?: number;
  };
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  agent_type: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

interface ChatInterfaceProps {
  agentId: string;
  agentName: string;
  agentType?: string;
  conversationId?: string;
  initialMessages?: ChatMessage[];
  starterPrompts?: string[];
  onConversationCreated?: (id: string) => void;
  apiEndpoint?: string;
  className?: string;
  height?: string;
}

// ============================================
// COMPONENTE: ChatBubble
// ============================================

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onCopy?: (content: string) => void;
}

function ChatBubble({ message, onCopy }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar do Assistente */}
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-500 shadow-sm">
          <Bot className="h-4 w-4" />
        </div>
      )}

      {/* Conteúdo da Mensagem */}
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-accent-500 text-white rounded-br-md"
            : "bg-muted/80 rounded-bl-md border border-border/50"
        )}
      >
        {isAssistant ? (
          <p className="whitespace-pre-wrap leading-relaxed">
            {stripMarkdown(message.content)}
          </p>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        )}

        {/* Botão Copiar (apenas assistente) */}
        {isAssistant && message.content && onCopy && (
          <button
            onClick={() => onCopy(message.content)}
            className="mt-2 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <Copy className="h-3 w-3" />
            Copiar
          </button>
        )}
      </div>

      {/* Avatar do Usuário */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE: TypingIndicator
// ============================================

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-500 shadow-sm">
        <Bot className="h-4 w-4" />
      </div>
      <div className="bg-muted/80 rounded-2xl rounded-bl-md px-4 py-3 border border-border/50">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: AutoResizeTextarea
// ============================================

interface AutoResizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxHeight?: number;
}

function AutoResizeTextarea({
  value,
  onChange,
  onSubmit,
  placeholder = "Digite sua mensagem...",
  disabled = false,
  maxHeight = 200,
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize baseado no conteúdo
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Resetar height para calcular scrollHeight correto
    textarea.style.height = "auto";
    
    // Calcular nova height (mínimo 44px, máximo maxHeight)
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [value, maxHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter envia, Shift+Enter quebra linha
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      className={cn(
        "w-full resize-none rounded-xl border border-input bg-background px-4 py-3",
        "text-sm placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "min-h-[44px] overflow-y-auto"
      )}
      style={{ maxHeight: `${maxHeight}px` }}
    />
  );
}

// ============================================
// COMPONENTE PRINCIPAL: ChatInterface
// ============================================

export function ChatInterface({
  agentId,
  agentName,
  agentType = "conteudo",
  conversationId: initialConversationId,
  initialMessages = [],
  starterPrompts = [],
  onConversationCreated,
  apiEndpoint = "/api/agentes/conteudo",
  className,
  height = "600px",
}: ChatInterfaceProps) {
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Estados
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // ============================================
  // AUTO-SCROLL
  // ============================================

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // ============================================
  // PERSISTÊNCIA: Criar conversa
  // ============================================

  const createConversation = useCallback(async (title: string = "Nova conversa"): Promise<string | null> => {
    try {
      setIsCreatingConversation(true);
      
      const { data, error } = await supabase
        .from("agent_conversations")
        .insert({
          title,
          agent_type: agentType,
          status: "active",
          user_id: (await supabase.auth.getUser()).data.user?.id || "",
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar conversa:", error);
        return null;
      }

      setConversationId(data.id);
      onConversationCreated?.(data.id);
      return data.id;
    } catch (err) {
      console.error("Erro ao criar conversa:", err);
      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  }, [agentType, onConversationCreated, supabase]);

  // ============================================
  // PERSISTÊNCIA: Salvar mensagem
  // ============================================

  const saveMessage = useCallback(async (
    content: string,
    role: "user" | "assistant",
    convId: string
  ) => {
    try {
      const { error } = await supabase.from("agent_messages").insert({
        conversation_id: convId,
        role,
        content,
      });

      if (error) {
        console.error("Erro ao salvar mensagem:", error);
      }
    } catch (err) {
      console.error("Erro ao salvar mensagem:", err);
    }
  }, [supabase]);

  // ============================================
  // AÇÕES
  // ============================================

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado para a área de transferência!");
  }, []);

  const exportToPDF = useCallback(() => {
    if (messages.length === 0) {
      toast.error("Nenhuma mensagem para exportar");
      return;
    }

    // Abrir diálogo de impressão
    setTimeout(() => {
      window.print();
    }, 100);
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput("");
    setIsLoading(true);

    // Adicionar mensagem do usuário localmente
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Garantir que temos uma conversa
      let currentConvId = conversationId;
      if (!currentConvId) {
        // Criar nova conversa com o primeiro texto como título (truncado)
        const title = messageContent.length > 50 
          ? messageContent.substring(0, 50) + "..." 
          : messageContent;
        currentConvId = await createConversation(title) || undefined;
      }

      // Salvar mensagem do usuário no banco
      if (currentConvId) {
        await saveMessage(messageContent, "user", currentConvId);
      }

      // Chamar API do agente
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          conversationId: currentConvId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.response || data.content || "Sem resposta";

      // Adicionar resposta do assistente
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantContent,
        created_at: new Date().toISOString(),
        metadata: {
          tokens_used: data.tokens_used,
          model_used: data.model_used,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Salvar resposta no banco
      if (currentConvId) {
        await saveMessage(assistantContent, "assistant", currentConvId);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });

      // Adicionar mensagem de erro no chat
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "❌ Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, conversationId, messages, agentId, apiEndpoint, createConversation, saveMessage]);

  // ============================================
  // RENDER
  // ============================================

  const hasMessages = messages.length > 0;

  return (
    <div
      className={cn(
        "flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm chat-print-container",
        className
      )}
      style={{ height }}
      data-chat-container="true"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{agentName}</h3>
          <p className="text-xs text-muted-foreground truncate">
            Assistente de Conteúdo
          </p>
        </div>
        <div className="flex items-center gap-1">
          {/* Botão Exportar PDF */}
          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={exportToPDF}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              title="Exportar como PDF"
            >
              <Printer className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline text-xs">Exportar</span>
            </Button>
          )}
          {(isLoading || isCreatingConversation) && (
            <Loader2 className="h-4 w-4 animate-spin text-accent-500 ml-2" />
          )}
        </div>
      </div>

      {/* Área de Mensagens (com auto-scroll) */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
      >
        {/* Estado Vazio */}
        {!hasMessages && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 text-accent-500 shadow-sm">
              <Bot className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">{agentName}</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Envie uma mensagem para começar a conversar sobre estratégias de conteúdo
              </p>
            </div>

            {/* Starter Prompts */}
            {starterPrompts.length > 0 && (
              <div className="w-full max-w-md space-y-2 pt-4">
                <p className="text-xs text-muted-foreground font-medium">Sugestões:</p>
                <div className="grid gap-2">
                  {starterPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(prompt);
                      }}
                      className="text-left px-4 py-3 rounded-xl border border-border/60 bg-background text-sm hover:bg-muted transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensagens */}
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            onCopy={copyMessage}
          />
        ))}

        {/* Indicador de Digitação */}
        {isLoading && <TypingIndicator />}
      </div>

      {/* Área de Input */}
      <div className="border-t border-border/50 p-4 bg-muted/30">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <AutoResizeTextarea
              value={input}
              onChange={setInput}
              onSubmit={sendMessage}
              placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
              disabled={isLoading}
              maxHeight={200}
            />
          </div>
          <Button
            type="button"
            size="icon"
            disabled={isLoading || !input.trim()}
            onClick={sendMessage}
            className="bg-accent-500 hover:bg-accent-600 shrink-0 h-[44px] w-[44px] rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Enter para enviar • Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}

// Exportar sub-componentes para uso individual
export { ChatBubble, TypingIndicator, AutoResizeTextarea };
