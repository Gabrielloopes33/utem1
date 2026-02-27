import { cn } from "@/lib/utils"

const statusConfig = {
  active: {
    label: "Ativo",
    dotColor: "bg-success",
    bgColor: "bg-success-bg",
    textColor: "text-success-text",
    borderColor: "border-success-bg",
  },
  draft: {
    label: "Rascunho",
    dotColor: "bg-muted-foreground",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    borderColor: "border-border",
  },
  paused: {
    label: "Pausado",
    dotColor: "bg-warning",
    bgColor: "bg-warning-bg",
    textColor: "text-warning-text",
    borderColor: "border-warning-bg",
  },
  archived: {
    label: "Arquivado",
    dotColor: "bg-muted-foreground",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    borderColor: "border-border",
  },
  running: {
    label: "Executando",
    dotColor: "bg-info",
    bgColor: "bg-info-bg",
    textColor: "text-info-text",
    borderColor: "border-info-bg",
  },
  completed: {
    label: "Concluído",
    dotColor: "bg-success",
    bgColor: "bg-success-bg",
    textColor: "text-success-text",
    borderColor: "border-success-bg",
  },
  failed: {
    label: "Falhou",
    dotColor: "bg-danger",
    bgColor: "bg-danger-bg",
    textColor: "text-danger-text",
    borderColor: "border-danger-bg",
  },
  cancelled: {
    label: "Cancelado",
    dotColor: "bg-muted-foreground",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    borderColor: "border-border",
  },
} as const

type StatusType = keyof typeof statusConfig

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  )
}
