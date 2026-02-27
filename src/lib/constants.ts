export const APP_NAME = "Time"
export const APP_DESCRIPTION = "AI Workforce Platform"

export const AGENT_TYPES = [
  { value: "chat", label: "Chat", description: "Agente conversacional interativo" },
  { value: "task", label: "Task", description: "Executa tarefas específicas" },
  { value: "qa_gate", label: "QA Gate", description: "Valida e revisa outputs" },
  { value: "planner", label: "Planner", description: "Planeja e organiza trabalho" },
] as const

export const AGENT_STATUSES = [
  { value: "draft", label: "Rascunho", color: "muted" },
  { value: "active", label: "Ativo", color: "success" },
  { value: "paused", label: "Pausado", color: "warning" },
  { value: "archived", label: "Arquivado", color: "muted" },
] as const

export type AgentType = (typeof AGENT_TYPES)[number]["value"]
export type AgentStatus = (typeof AGENT_STATUSES)[number]["value"]
