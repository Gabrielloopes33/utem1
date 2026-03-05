"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface UseAgenteConteudoChatProps {
  conversationId?: string;
  agentType: string;
  autoLoad?: boolean;
}

interface UseAgenteConteudoChatReturn {
  messages: Message[];
  conversation: Conversation | null;
  isSending: boolean;
  hasMessages: boolean;
  sendMessage: (content: string) => Promise<void>;
  createConversation: (title: string) => Promise<string | null>;
}

export function useAgenteConteudoChat({
  conversationId,
  agentType,
  autoLoad = true,
}: UseAgenteConteudoChatProps): UseAgenteConteudoChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();

  // Load conversation and messages
  useEffect(() => {
    if (!autoLoad) return;

    const loadConversation = async () => {
      if (conversationId) {
        // Load existing conversation
        const { data: convData } = await supabase
          .from("agent_conversations")
          .select("*")
          .eq("id", conversationId)
          .single();

        if (convData) {
          setConversation(convData);

          const { data: messagesData } = await supabase
            .from("agent_messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

          if (messagesData) {
            setMessages(messagesData);
          }
        }
      }
    };

    loadConversation();
  }, [conversationId, autoLoad, supabase]);

  const createConversation = useCallback(
    async (title: string): Promise<string | null> => {
      const { data, error } = await supabase
        .from("agent_conversations")
        .insert({
          title,
          agent_type: agentType,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating conversation:", error);
        return null;
      }

      setConversation(data);
      setMessages([]);
      return data.id;
    },
    [agentType, supabase]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSending) return;

      setIsSending(true);

      try {
        let currentConversationId = conversationId;

        // Create conversation if doesn't exist
        if (!currentConversationId) {
          const newId = await createConversation("Nova conversa");
          if (!newId) throw new Error("Failed to create conversation");
          currentConversationId = newId;
        }

        // Add user message to local state
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // TODO: Call API to get AI response
        // For now, simulate a response
        setTimeout(() => {
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Resposta simulada para: ${content}`,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsSending(false);
        }, 1000);
      } catch (error) {
        console.error("Error sending message:", error);
        setIsSending(false);
      }
    },
    [conversationId, isSending, createConversation]
  );

  return {
    messages,
    conversation,
    isSending,
    hasMessages: messages.length > 0,
    sendMessage,
    createConversation,
  };
}
