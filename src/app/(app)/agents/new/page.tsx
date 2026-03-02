"use client"

import { PageHeader } from "@/components/shared/page-header"
import { AgentWizard } from "@/components/agents/agent-wizard"
import { DEFAULT_ORG_ID } from "@/lib/constants"

export default function NewAgentPage() {
  const orgId = DEFAULT_ORG_ID

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
