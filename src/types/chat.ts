/**
 * Tipos para o Agente Generalista - Chat de Ideias
 */

export interface ChatSession {
  id: string
  user_id: string
  title: string
  agent_type: "generalista"
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at: string
}

export interface ChatHistoryItem {
  role: "user" | "assistant"
  content: string
}

export interface QuickPrompt {
  id: string
  label: string
  icon?: string
  category: "educacao" | "comparacao" | "tendencias" | "dicas"
}

export type ChatStatus = "idle" | "loading" | "streaming" | "error"

export const QUICK_PROMPTS: QuickPrompt[] = [
  { id: "1", label: "Fundos Imobiliários", category: "educacao", icon: "Building" },
  { id: "2", label: "RF vs FII", category: "comparacao", icon: "Scale" },
  { id: "3", label: "Dicas de investimento", category: "dicas", icon: "Lightbulb" },
  { id: "4", label: "Tendências do mercado", category: "tendencias", icon: "TrendingUp" },
  { id: "5", label: "Ações para iniciantes", category: "educacao", icon: "BookOpen" },
  { id: "6", label: "Previdência privada", category: "educacao", icon: "Shield" },
]

// ============================================
// NOVOS TIPOS: Agente de Conteúdo (Conversas)
// ============================================

export interface AgentConversation {
  id: string
  user_id: string
  org_id?: string
  title: string
  agent_type: "conteudo" | "generalista" | "campanhas" | "personas" | "gerar-post"
  status: "active" | "archived"
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AgentMessage {
  id: string
  conversation_id: string
  role: "user" | "assistant" | "system"
  content: string
  metadata?: {
    tokens_used?: number
    model_used?: string
    processing_time_ms?: number
  }
  tokens_used?: number
  model_used?: string
  processing_time_ms?: number
  created_at: string
}

export interface ChatStarterPrompt {
  id: string
  label: string
  prompt: string
  icon?: string
}
