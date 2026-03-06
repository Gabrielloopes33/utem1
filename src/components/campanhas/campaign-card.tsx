"use client"

import Link from "next/link"
import { Calendar, Eye, FileText, BarChart3, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  OBJECTIVE_LABELS,
  FORMAT_LABELS,
  CONTENT_TYPE_LABELS,
  FORMAT_TYPE_LABELS,
  STATUS_LABELS,
  type Campaign,
} from "@/types/campaign"
import { cn } from "@/lib/utils"

interface CampaignCardProps {
  campaign: Campaign
  onViewDetails?: () => void
}

export function CampaignCard({ campaign, onViewDetails }: CampaignCardProps) {
  const statusConfig = STATUS_LABELS[campaign.status]

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{campaign.name}</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className={cn("text-[10px] font-medium text-white", statusConfig.color)}
              >
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {OBJECTIVE_LABELS[campaign.objective]}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Info básica */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Formato:</span>
            <span className="font-medium">{FORMAT_LABELS[campaign.format]}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Período:</span>
            <span className="font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(campaign.start_date).toLocaleDateString("pt-BR")}
              {campaign.end_date && (
                <> - {new Date(campaign.end_date).toLocaleDateString("pt-BR")}</>
              )}
            </span>
          </div>
        </div>

        {/* Tipos de conteúdo */}
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Tipos de conteúdo:</span>
          <div className="flex flex-wrap gap-1">
            {campaign.content_types.slice(0, 3).map((type) => (
              <Badge key={type} variant="outline" className="text-[10px] font-normal">
                {CONTENT_TYPE_LABELS[type]}
              </Badge>
            ))}
            {campaign.content_types.length > 3 && (
              <Badge variant="outline" className="text-[10px] font-normal">
                +{campaign.content_types.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Formatos */}
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Formatos:</span>
          <div className="flex flex-wrap gap-1">
            {campaign.formats.map((format) => (
              <Badge key={format} variant="outline" className="text-[10px] font-normal">
                {FORMAT_TYPE_LABELS[format]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Métricas (se houver) */}
        {campaign.metrics && (
          <div className="pt-3 border-t border-border/50">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-accent-500">
                  {campaign.metrics.posts_generated || 0}
                </p>
                <p className="text-[10px] text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent-500">
                  {campaign.metrics.engagement_rate?.toFixed(1) || 0}%
                </p>
                <p className="text-[10px] text-muted-foreground">Engajamento</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent-500">
                  {campaign.metrics.reach
                    ? `${(campaign.metrics.reach / 1000).toFixed(1)}K`
                    : 0}
                </p>
                <p className="text-[10px] text-muted-foreground">Alcance</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Badge */}
        {campaign.ai_response && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent-500" />
            <span>Plano gerado pela IA</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={onViewDetails}
          >
            <Eye className="h-3.5 w-3.5" />
            Ver detalhes
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            asChild
          >
            <Link href={`/campanhas/${campaign.id}/posts`}>
              <FileText className="h-3.5 w-3.5" />
              Posts
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
