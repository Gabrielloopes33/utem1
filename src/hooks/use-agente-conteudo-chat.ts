"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AgentConversation, AgentMessage } from "@/types/chat";

interface UseAgenteConteudoChatOptions {
  conversationId?: string;
  agentType?: string;
  autoLoad?: boolean;
}

interface UseAgenteConteudoChatReturn {
  // Estado
  messages: AgentMessage[];
  conversation: AgentConversation | null;
  conversations: AgentConversation[]; // Lista de conversas do histórico
  isLoading: boolean;
  isSending: boolean;
  isLoadingConversations: boolean;
  error: string | null;
  
  // Ações
  sendMessage: (content: string) => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  loadConversations: () => Promise<void>; // Carregar lista de conversas
  createConversation: (title?: string) => Promise<string | null>;
  clearError: () => void;
  
  // Helpers
  hasMessages: boolean;
  messagesCount: number;
}

/**
 * Hook para gerenciar o chat do Agente de Conteúdo
 * 
 * Funcionalidades:
 * - Criar/carregar conversas
 * - Enviar mensagens com persistência
 * - Auto-scroll integrado
 * - Histórico completo
 * 
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading } = useAgenteConteudoChat({
 *   conversationId: "uuid-da-conversa"
 * });
 * ```
 */
export function useAgenteConteudoChat(
  options: UseAgenteConteudoChatOptions = {}
): UseAgenteConteudoChatReturn {
  const { conversationId: initialConvId, agentType = "conteudo", autoLoad = true } = options;
  
  const supabase = createClient();
  
  // Estados
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [conversation, setConversation] = useState<AgentConversation | null>(null);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>(initialConvId);

  // Carregar conversa inicial se fornecida
  useEffect(() => {
    if (autoLoad && currentConvId) {
      loadConversation(currentConvId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConvId, autoLoad]);

  // Carregar lista de conversas ao montar
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Criar nova conversa
   */
  const createConversation = useCallback(async (
    title: string = "Nova conversa"
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error: dbError } = await supabase
        .from("agent_conversations")
        .insert({
          title,
          agent_type: agentType,
          status: "active",
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Erro ao criar conversa: ${dbError.message}`);
      }

      setConversation(data);
      setCurrentConvId(data.id);
      setMessages([]);
      
      return data.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("[useAgenteConteudoChat] Erro ao criar conversa:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [agentType, supabase]);

  /**
   * Carregar lista de conversas do usuário
   */
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);

      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        return;
      }

      const { data, error: dbError } = await supabase
        .from("agent_conversations")
        .select("*")
        .eq("agent_type", agentType)
        .eq("user_id", userData.user.id)
        .eq("status", "active")
        .order("updated_at", { ascending: false });

      if (dbError) {
        console.error("[useAgenteConteudoChat] Erro ao carregar conversas:", dbError);
        return;
      }

      setConversations(data || []);
    } catch (err) {
      console.error("[useAgenteConteudoChat] Erro ao carregar conversas:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [agentType, supabase]);

  /**
   * Carregar conversa existente com mensagens
   */
  const loadConversation = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar conversa
      const { data: convData, error: convError } = await supabase
        .from("agent_conversations")
        .select("*")
        .eq("id", id)
        .single();

      if (convError) {
        throw new Error(`Conversa não encontrada: ${convError.message}`);
      }

      // Buscar mensagens
      const { data: messagesData, error: msgError } = await supabase
        .from("agent_messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (msgError) {
        throw new Error(`Erro ao carregar mensagens: ${msgError.message}`);
      }

      setConversation(convData);
      setMessages(messagesData || []);
      setCurrentConvId(id);
      
      // Atualizar lista de conversas (para mover a atual para o topo)
      await loadConversations();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("[useAgenteConteudoChat] Erro ao carregar conversa:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  /**
   * Salvar mensagem no banco
   */
  const saveMessage = useCallback(async (
    content: string,
    role: "user" | "assistant",
    convId: string,
    metadata?: { tokens_used?: number; model_used?: string; processing_time_ms?: number }
  ) => {
    const { error } = await supabase.from("agent_messages").insert({
      conversation_id: convId,
      role,
      content,
      tokens_used: metadata?.tokens_used,
      model_used: metadata?.model_used,
      processing_time_ms: metadata?.processing_time_ms,
    });

    if (error) {
      console.error("[useAgenteConteudoChat] Erro ao salvar mensagem:", error);
    }
  }, [supabase]);

  /**
   * Enviar mensagem
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const trimmedContent = content.trim();
    setIsSending(true);
    setError(null);

    // Adicionar mensagem do usuário localmente
    const userMessage: AgentMessage = {
      id: crypto.randomUUID(),
      conversation_id: currentConvId || "temp",
      role: "user",
      content: trimmedContent,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Garantir que temos uma conversa
      let convId: string | null = currentConvId || null;
      
      if (!convId) {
        // Criar nova conversa com o primeiro texto como título
        const title = trimmedContent.length > 50
          ? trimmedContent.substring(0, 50) + "..."
          : trimmedContent;
        
        convId = await createConversation(title);
        
        if (!convId) {
          throw new Error("Não foi possível criar a conversa");
        }
      }

      // Garantir que convId é uma string válida
      if (!convId) {
        throw new Error("ID da conversa não disponível");
      }

      // Salvar mensagem do usuário
      await saveMessage(trimmedContent, "user", convId);

      // Chamar API
      const response = await fetch("/api/agentes/conteudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          message: trimmedContent,
          conversationId: convId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.response || data.content || "Sem resposta";

      // Adicionar resposta do assistente localmente
      const assistantMessage: AgentMessage = {
        id: crypto.randomUUID(),
        conversation_id: convId,
        role: "assistant",
        content: assistantContent,
        created_at: new Date().toISOString(),
        tokens_used: data.metadata?.tokens_used,
        model_used: data.metadata?.model_used,
        processing_time_ms: data.metadata?.processing_time_ms,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Salvar resposta do assistente
      await saveMessage(assistantContent, "assistant", convId, {
        tokens_used: data.metadata?.tokens_used,
        model_used: data.metadata?.model_used,
        processing_time_ms: data.metadata?.processing_time_ms,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar mensagem";
      setError(message);
      
      // Adicionar mensagem de erro no chat
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversation_id: currentConvId || "temp",
          role: "assistant",
          content: `❌ ${message}`,
          created_at: new Date().toISOString(),
        },
      ]);
      
      console.error("[useAgenteConteudoChat] Erro ao enviar:", err);
    } finally {
      setIsSending(false);
    }
  }, [currentConvId, messages, createConversation, saveMessage]);

  /**
   * Limpar erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    messages,
    conversation,
    conversations,
    isLoading,
    isSending,
    isLoadingConversations,
    error,
    
    // Ações
    sendMessage,
    loadConversation,
    loadConversations,
    createConversation,
    clearError,
    
    // Helpers
    hasMessages: messages.length > 0,
    messagesCount: messages.length,
  };
}
