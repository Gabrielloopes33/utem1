"use client"

import { useEffect, useState } from "react"
import { Instagram, Heart, MessageCircle, Users, Eye, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InstagramMetrics {
  followers: number
  following: number
  posts: number
  likes: number
  comments: number
  reach: number
  engagement_rate: number
}

const DEFAULT_METRICS: InstagramMetrics = {
  followers: 0,
  following: 0,
  posts: 0,
  likes: 0,
  comments: 0,
  reach: 0,
  engagement_rate: 0,
}

const METRIC_CONFIG = [
  {
    key: "followers" as const,
    label: "Seguidores",
    icon: Users,
    color: "#E4405F",
    bgColor: "#FDECEF",
  },
  {
    key: "following" as const,
    label: "Seguindo",
    icon: Users,
    color: "#833AB4",
    bgColor: "#F3E8FD",
  },
  {
    key: "posts" as const,
    label: "Publicações",
    icon: Instagram,
    color: "#405DE6",
    bgColor: "#E8EBFD",
  },
  {
    key: "likes" as const,
    label: "Curtidas",
    icon: Heart,
    color: "#E4405F",
    bgColor: "#FDECEF",
  },
  {
    key: "comments" as const,
    label: "Comentários",
    icon: MessageCircle,
    color: "#5851DB",
    bgColor: "#EDEEFD",
  },
  {
    key: "reach" as const,
    label: "Alcance",
    icon: Eye,
    color: "#F77737",
    bgColor: "#FEF0E8",
  },
]

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

export function InstagramMetricsCard() {
  const [metrics, setMetrics] = useState<InstagramMetrics>(DEFAULT_METRICS)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Simulação de carregamento - aqui você integraria com a API do Instagram
    const timer = setTimeout(() => {
      setMetrics({
        followers: 12540,
        following: 850,
        posts: 328,
        likes: 45230,
        comments: 3890,
        reach: 89200,
        engagement_rate: 4.2,
      })
      setConnected(true)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      {/* Header com gradiente do Instagram */}
      <CardHeader className="pb-4 bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#F77737]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white font-display text-base font-semibold">
                Instagram
              </CardTitle>
              <p className="text-xs text-white/70">
                {connected ? "@seu_perfil" : "Não conectado"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-medium text-white">
              {metrics.engagement_rate.toFixed(1)}% engajamento
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {METRIC_CONFIG.map((metric) => (
            <div
              key={metric.key}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/50 p-3 hover:bg-muted/30 transition-colors"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: metric.bgColor }}
              >
                <metric.icon
                  className="h-4 w-4"
                  style={{ color: metric.color }}
                />
              </div>
              <div className="text-center">
                <p className="font-mono text-lg font-semibold leading-tight">
                  {loading ? (
                    <span className="inline-block h-5 w-8 animate-shimmer rounded" />
                  ) : (
                    formatNumber(metrics[metric.key])
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Botão de ação */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#F77737] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
            <Instagram className="h-4 w-4" />
            {connected ? "Atualizar métricas" : "Conectar Instagram"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
