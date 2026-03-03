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
