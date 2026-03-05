"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Trash2,
  GitBranch,
  Plus,
  Play,
  GripVertical,
  Bot,
  CircleDot,
  CheckCircle,
} from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent } from "../../../../components/ui/card"
import { StatusBadge } from "../../../../components/shared/status-badge"
import { toast } from "sonner"
import type { Workflow, WorkflowStep } from "../../../../types/database"

const STEP_TYPE_ICONS: Record<string, typeof Bot> = {
  agent: Bot,
  condition: CircleDot,
  transform: GitBranch,
  output: CheckCircle,
}

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [steps, setSteps] = useState<(WorkflowStep & { time_agents?: { id: string; name: string } | null })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWorkflow = useCallback(async () => {
    try {
      const res = await fetch(`/api/workflows/${params.id}`)
      if (!res.ok) {
        router.push("/workflows")
        return
      }
      const data = await res.json()
      setWorkflow(data)
      setSteps(data.time_workflow_steps || [])
    } catch {
      router.push("/workflows")
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    fetchWorkflow()
  }, [fetchWorkflow])

  async function handleDelete() {
    if (!workflow || !confirm("Deletar este workflow?")) return
    try {
      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Workflow deletado")
        router.push("/workflows")
      }
    } catch {
      toast.error("Erro ao deletar")
    }
  }

  if (loading) {
    return <div className="animate-shimmer h-48 rounded-xl" />
  }

  if (!workflow) return null

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#8B5CF6]">
          <GitBranch className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold">{workflow.name}</h1>
            <StatusBadge status={workflow.status} />
          </div>
          <span className="text-xs text-muted-foreground">
            Trigger: {workflow.trigger_type}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => toast.info("Execução de workflows em breve!")}
        >
          <Play className="h-3.5 w-3.5" />
          Executar
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-muted-foreground hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {workflow.description && (
        <p className="text-sm text-muted-foreground mb-6">
          {workflow.description}
        </p>
      )}

      {/* Steps */}
      <div className="max-w-2xl">
        <h3 className="font-display text-sm font-semibold mb-4">
          Steps ({steps.length})
        </h3>

        {steps.length === 0 ? (
          <Card className="border-border/50 shadow-sm border-dashed">
            <CardContent className="p-5">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GitBranch className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Nenhum step adicionado
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    toast.info("Adicionar steps ao workflow em breve!")
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Step
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {steps.map((step, index) => {
              const StepIcon = STEP_TYPE_ICONS[step.type] || Bot
              return (
                <div key={step.id} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-5 top-full h-3 w-0.5 bg-border" />
                  )}
                  <Card className="border-border/50 shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab shrink-0" />
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-500 shrink-0">
                        <StepIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {step.name}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          {step.type}
                          {step.time_agents && ` · ${step.time_agents.name}`}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                        #{step.step_order}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              )
            })}

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 w-full border-dashed"
              onClick={() =>
                toast.info("Adicionar steps ao workflow em breve!")
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar Step
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
