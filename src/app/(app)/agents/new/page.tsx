"use client"

import dynamic from "next/dynamic"
import { PageHeader } from "../../../../../../components/shared/page-header"
import { DEFAULT_ORG_ID } from "../../../../../../lib/constants"

// Lazy load do AgentWizard (~25KB)
const AgentWizard = dynamic(
  () => import("../../../../../../components/agents/agent-wizard").then((m) => ({ default: m.AgentWizard })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    )
  }
)

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
