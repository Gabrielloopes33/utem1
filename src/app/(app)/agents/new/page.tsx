"use client"

import { PageHeader } from "@/components/shared/page-header"
import { AgentWizard } from "@/components/agents/agent-wizard"

export default function NewAgentPage() {
  // TODO: Get orgId from auth context
  const orgId = "temp-org-id"

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Novo Agente"
        description="Configure um novo agente de IA"
      />
      <AgentWizard orgId={orgId} />
    </div>
  )
}
