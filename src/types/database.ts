export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface OrgMember {
  id: string
  org_id: string
  user_id: string
  role: "owner" | "admin" | "member"
  created_at: string
}

export interface Agent {
  id: string
  org_id: string
  name: string
  description: string | null
  avatar_url: string | null
  type: "chat" | "task" | "qa_gate" | "planner"
  status: "draft" | "active" | "paused" | "archived"
  squad_id: string | null
  provider: "anthropic" | "openai"
  model: string
  system_prompt: string | null
  temperature: number
  max_tokens: number
  trigger_type: "manual" | "scheduled" | "webhook" | "workflow"
  trigger_config: Record<string, unknown>
  approval_required: boolean
  approval_role: string | null
  tools: unknown[]
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Squad {
  id: string
  org_id: string
  name: string
  description: string | null
  icon: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface SquadAgent {
  id: string
  squad_id: string
  agent_id: string
  role_in_squad: string | null
  created_at: string
}

export interface KnowledgeBase {
  id: string
  org_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface KnowledgeDoc {
  id: string
  kb_id: string
  filename: string
  file_type: string | null
  file_size: number | null
  content: string | null
  storage_path: string | null
  status: "processing" | "ready" | "error"
  created_at: string
}

export interface Conversation {
  id: string
  org_id: string
  agent_id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: "user" | "assistant" | "system"
  content: string
  parts: unknown | null
  tokens_used: number | null
  model_used: string | null
  created_at: string
}

export interface Workflow {
  id: string
  org_id: string
  name: string
  description: string | null
  status: "draft" | "active" | "paused"
  trigger_type: "manual" | "schedule" | "webhook"
  created_at: string
  updated_at: string
}

export interface WorkflowStep {
  id: string
  workflow_id: string
  agent_id: string | null
  step_order: number
  name: string
  type: "agent" | "condition" | "transform" | "output"
  config: Record<string, unknown>
  created_at: string
}

export interface Execution {
  id: string
  org_id: string
  workflow_id: string | null
  agent_id: string | null
  status: "running" | "completed" | "failed" | "cancelled"
  input: unknown | null
  output: unknown | null
  error: string | null
  started_at: string
  completed_at: string | null
  tokens_total: number
  cost_usd: number
}

export interface ApiKey {
  id: string
  org_id: string
  provider: "anthropic" | "openai"
  encrypted_key: string
  label: string | null
  created_at: string
}
