export const APP_NAME = "Time"
export const APP_DESCRIPTION = "AI Workforce Platform"

/** ID fixo da organização NexIA Lab (seed) */
export const DEFAULT_ORG_ID = "a0000000-0000-0000-0000-000000000001"

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
