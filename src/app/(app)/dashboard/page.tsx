"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Zap,
  Activity,
  MessageSquare,
  Users,
  Target,
  Instagram,
  TrendingUp,
  ArrowRight,
  Plus,
  Lightbulb,
  BarChart3,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Sparkles,
  Brain,
  Cpu,
  Heart,
  Eye,
  TrendingDown,
  Bug,
} from "lucide-react"
import Link from "next/link"
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { toast } from "sonner"
import { agenteGeneralista } from "@/lib/n8n/client"
import type { Campaign } from "@/types/campaign"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isTyping?: boolean
}

// Animação tech de loading com status
function TechLoadingAnimation() {
  const [statusIndex, setStatusIndex] = useState(0)
  const statusMessages = [
    { icon: Brain, text: "Analisando contexto..." },
    { icon: Sparkles, text: "Gerando ideias criativas..." },
    { icon: Cpu, text: "Processando conteúdo..." },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  const CurrentIcon = statusMessages[statusIndex].icon

  return (
    <div className="flex items-center gap-3 bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3 border border-accent-500/10">
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-500 to-primary flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-2 border-accent-500/30 animate-ping" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CurrentIcon className="h-3 w-3 text-accent-500 animate-pulse" />
          <span className="animate-pulse">{statusMessages[statusIndex].text}</span>
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="w-1.5 h-1.5 bg-accent-500/50 rounded-full animate-bounce" style={{ animationDelay: "450ms" }} />
        </div>
      </div>
    </div>
  )
}

// Hook para efeito de digitação
function useTypewriter(text: string, speed: number = 15, onComplete?: () => void) {
  const [displayText, setDisplayText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) return
    
    setDisplayText("")
    setIsComplete(false)
    let index = 0
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        onComplete?.()
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, onComplete])

  return { displayText, isComplete }
}

// Componente de mensagem com efeito de digitação
function TypingMessage({ content, onComplete }: { content: string; onComplete?: () => void }) {
  const { displayText, isComplete } = useTypewriter(content, 12, onComplete)

  return (
    <div className="whitespace-pre-line">
      {displayText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-accent-500 ml-0.5 animate-pulse" />
      )}
    </div>
  )
}

// Dados de campanhas mockados (virão do Supabase depois)
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    org_id: "org-1",
    created_by: "user-1",
    name: "Lançamento FII Autem",
    objective: "conversao",
    format: "lancamento",
    content_types: ["tecnico", "emocional", "autoridade"],
    formats: ["carrossel", "reels"],
    start_date: "2026-03-01",
    end_date: "2026-03-15",
    status: "active",
    metrics: {
      posts_generated: 12,
      posts_published: 8,
      engagement_rate: 4.2,
      reach: 45000,
    },
    created_at: "2026-02-28T10:00:00Z",
    updated_at: "2026-03-01T08:00:00Z",
  },
  {
    id: "2",
    org_id: "org-1",
    created_by: "user-1",
    name: "Educação Financeira",
    objective: "nutricao",
    format: "perpetuo",
    content_types: ["tecnico", "social"],
    formats: ["carrossel", "card"],
    start_date: "2026-02-01",
    status: "active",
    metrics: {
      posts_generated: 24,
      posts_published: 20,
      engagement_rate: 3.8,
      reach: 82000,
    },
    created_at: "2026-01-25T14:00:00Z",
    updated_at: "2026-02-28T16:00:00Z",
  },
]

const QUICK_IDEAS = [
  "RF vs FII: qual escolher?",
  "5 erros no CDB",
  "Diversificação inteligente",
  "Dúvidas sobre Tesouro",
]

export default function DashboardPage() {
  const [chatMessage, setChatMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChatExpanded, setIsChatExpanded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [typingComplete, setTypingComplete] = useState<Record<number, boolean>>({})
  
  // Métricas reais dos concorrentes (via Apify + Supabase)
  const { metrics: dashboardMetrics, isLoading: isLoadingMetrics } = useDashboardMetrics()

  // Scroll to bottom when messages change (apenas dentro do container)
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [messages, typingComplete])

  const handleTypingComplete = useCallback((index: number) => {
    setTypingComplete((prev) => ({ ...prev, [index]: true }))
  }, [])

  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!chatMessage.trim() || isLoading) return

    const userMessage = chatMessage.trim()
    setChatMessage("")
    setIsLoading(true)

    // Add user message
    const newUserMessage: ChatMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      // Preparar payload
      const payload = {
        message: userMessage,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
        userId: "user-1",
      }
      
      console.log("[DEBUG] Enviando payload:", JSON.stringify(payload, null, 2))

      // CHAMA O AGENTE GENERALISTA REAL DO N8N
      const response = await agenteGeneralista(payload)
      
      console.log("[DEBUG] Resposta recebida:", response)

      // Add assistant response (will be typed out)
      const newAssistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
        isTyping: true,
      }
      setMessages((prev) => [...prev, newAssistantMessage])
    } catch (error) {
      console.error("[DEBUG] Erro ao chamar agente:", error)
      
      // Mostrar erro detalhado no toast
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error("Erro ao gerar ideias", {
        description: errorMessage,
        duration: 8000,
      })
      
      // Adicionar mensagem de erro no chat
      const errorAssistantMessage: ChatMessage = {
        role: "assistant",
        content: `❌ Ops! Ocorreu um erro: ${errorMessage}\n\nTente novamente ou entre em contato com o suporte se o problema persistir.`,
        timestamp: new Date(),
        isTyping: false,
      }
      setMessages((prev) => [...prev, errorAssistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  function handleInputFocus() {
    if (!isChatExpanded) {
      setIsChatExpanded(true)
    }
  }

  function handleCloseChat() {
    setIsChatExpanded(false)
    setMessages([])
    setChatMessage("")
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Título */}
      <div className="flex items-center gap-2">
        <Instagram className="h-6 w-6 text-pink-500" />
        <h1 className="font-display text-xl font-semibold">Métricas Insta</h1>
        <span className="text-xs text-muted-foreground">@autem.inv</span>
      </div>

      {/* Layout Principal - 3 Colunas */}
      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar Esquerda - Métricas Verticais (2 cols) */}
        <div className="col-span-12 md:col-span-2 space-y-3">
          {/* Seguidores */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Seguidores</span>
              </div>
              <p className="text-xl font-bold">
                {isLoadingMetrics ? "-" : `${(dashboardMetrics?.instagram.followers || 0) / 1000}K`}
              </p>
              {!isLoadingMetrics && dashboardMetrics && (
                <div className="flex items-center gap-1 mt-1">
                  {dashboardMetrics.instagram.followers_change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${dashboardMetrics.instagram.followers_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dashboardMetrics.instagram.followers_change >= 0 ? '+' : ''}{dashboardMetrics.instagram.followers_change}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Curtidas */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Curtidas</span>
              </div>
              <p className="text-xl font-bold">
                {isLoadingMetrics ? "-" : `${(dashboardMetrics?.instagram.likes || 0) / 1000}K`}
              </p>
              {!isLoadingMetrics && dashboardMetrics && (
                <div className="flex items-center gap-1 mt-1">
                  {dashboardMetrics.instagram.likes_change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${dashboardMetrics.instagram.likes_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dashboardMetrics.instagram.likes_change >= 0 ? '+' : ''}{dashboardMetrics.instagram.likes_change}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visualizações */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Visualizações</span>
              </div>
              <p className="text-xl font-bold">
                {isLoadingMetrics ? "-" : `${(dashboardMetrics?.instagram.views || 0) / 1000}K`}
              </p>
              {!isLoadingMetrics && dashboardMetrics && (
                <div className="flex items-center gap-1 mt-1">
                  {dashboardMetrics.instagram.views_change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${dashboardMetrics.instagram.views_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dashboardMetrics.instagram.views_change >= 0 ? '+' : ''}{dashboardMetrics.instagram.views_change}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Taxa de Engajamento */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Taxa de Engajamento</span>
              </div>
              <p className="text-xl font-bold">
                {isLoadingMetrics ? "-" : `${dashboardMetrics?.instagram.engagement || 0}%`}
              </p>
              {!isLoadingMetrics && dashboardMetrics && (
                <div className="flex items-center gap-1 mt-1">
                  {dashboardMetrics.instagram.engagement_change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${dashboardMetrics.instagram.engagement_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dashboardMetrics.instagram.engagement_change >= 0 ? '+' : ''}{dashboardMetrics.instagram.engagement_change}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Central - Performance e Crescimento (5 cols) */}
        <div className="col-span-12 md:col-span-5 space-y-4">
          {/* Performance por Tipo de Conteúdo */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Performance por Tipo de Conteúdo</CardTitle>
              <p className="text-[10px] text-muted-foreground">Baseado na análise de concorrentes</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {isLoadingMetrics ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-4 w-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  dashboardMetrics?.contentPerformance.map((item) => (
                    <div key={item.type} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.type}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Crescimento dos Últimos 30 Dias - Gráfico 1 */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Crescimento dos Últimos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end gap-2 h-24">
                {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95].map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-accent-500/20 rounded-t-sm hover:bg-accent-500/40 transition-colors"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>Day 1</span>
                <span>Day 10</span>
                <span>Day 20</span>
                <span>Day 30</span>
              </div>
            </CardContent>
          </Card>

          {/* Crescimento dos Últimos 30 Dias - Gráfico 2 (Alcance) */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Crescimento dos Últimos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end gap-2 h-24">
                {[30, 40, 35, 50, 60, 55, 70, 65, 80, 85].map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>Day 1</span>
                <span>Day 10</span>
                <span>Day 20</span>
                <span>Day 30</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Posts e Ideias (5 cols) */}
        <div className="col-span-12 md:col-span-5 space-y-4">
          {/* Posts com Maior Engajamento */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Posts com Maior Engajamento</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {isLoadingMetrics ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-4 w-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  dashboardMetrics?.topPosts.map((post, index) => (
                    <a
                      key={post.id}
                      href={post.permalink || `https://instagram.com/p/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-4">{index + 1}</span>
                        {post.thumbnailUrl ? (
                          <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                            <img 
                              src={post.thumbnailUrl} 
                              alt={post.title}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Instagram className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium line-clamp-1 group-hover:text-accent-500 transition-colors">{post.title}</p>
                          <p className="text-[10px] text-muted-foreground">{post.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-accent-500">{post.engagement}</p>
                        <p className="text-[10px] text-muted-foreground">{post.likes} likes</p>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Concorrentes Monitorados */}
          {!isLoadingMetrics && dashboardMetrics?.competitors && dashboardMetrics.competitors.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Concorrentes Monitorados</CardTitle>
                  <Link href="/agentes/concorrentes" className="text-xs text-accent-500 hover:underline">
                    Ver todos →
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {dashboardMetrics.competitors.slice(0, 4).map((comp) => (
                    <Link 
                      key={comp.id}
                      href={`/agentes/concorrentes`}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {comp.profilePicUrl ? (
                          <img src={comp.profilePicUrl} alt={comp.name} className="h-full w-full object-cover" />
                        ) : (
                          <Instagram className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{comp.name}</p>
                        <p className="text-[10px] text-muted-foreground">@{comp.handle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-accent-500">{comp.engagement.toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground">Engajamento</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ideias de Conteúdo - Chat */}
          <Card 
            className={`border-accent-500/20 bg-gradient-to-br from-accent-500/5 to-transparent transition-all duration-300 ${
              isChatExpanded ? "shadow-xl ring-1 ring-accent-500/20" : ""
            }`}
          >
            <CardContent className={`p-4 flex flex-col ${isChatExpanded ? "min-h-[400px]" : ""}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent-500" />
                  <h3 className="font-semibold text-sm">Ideias de Conteúdo</h3>
                  <Badge variant="secondary" className="text-[10px]">IA</Badge>
                </div>
                {isChatExpanded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseChat}
                    className="h-7 w-7 p-0 text-muted-foreground"
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Messages Area - Only shown when expanded */}
              {isChatExpanded && (
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2 min-h-0 max-h-[200px]">
                  {messages.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Bot className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Olá! Como posso ajudar com ideias de conteúdo?</p>
                    </div>
                  )}
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                        msg.role === "user" ? "bg-accent-500/20" : "bg-primary/10"
                      }`}>
                        {msg.role === "user" ? (
                          <User className="h-3 w-3 text-accent-500" />
                        ) : (
                          <Bot className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                        msg.role === "user"
                          ? "bg-accent-500 text-white rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}>
                        {msg.role === "assistant" && msg.isTyping && !typingComplete[index] ? (
                          <TypingMessage 
                            content={msg.content} 
                            onComplete={() => handleTypingComplete(index)}
                          />
                        ) : (
                          <div className="whitespace-pre-line">{msg.content}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2">
                      <TechLoadingAnimation />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
              
              {/* Input Area */}
              <form onSubmit={handleChatSubmit} className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Qual tema quer explorar?"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onFocus={handleInputFocus}
                    className="pr-20 h-10 text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !chatMessage.trim()}
                    className="absolute right-1 top-1 bottom-1 bg-accent-500 hover:bg-accent-600 h-8 px-2"
                  >
                    {isLoading ? (
                      <Zap className="h-3 w-3 animate-pulse" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                
                {/* Quick suggestions */}
                {!isChatExpanded && (
                  <div className="flex gap-1 flex-wrap">
                    {QUICK_IDEAS.slice(0, 3).map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => {
                          setChatMessage(idea)
                          if (!isChatExpanded) setIsChatExpanded(true)
                        }}
                        className="text-[10px] px-2 py-1 rounded-full bg-muted hover:bg-accent-500/10 hover:text-accent-500 transition-colors"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                )}
              </form>

              {/* Simple Response (when not expanded) */}
              {!isChatExpanded && messages.length > 0 && (
                <div className="mt-3 p-3 bg-card rounded-lg border whitespace-pre-line text-xs">
                  <div className="flex items-center gap-1 mb-1 text-muted-foreground">
                    <Bot className="h-3 w-3" />
                    <span>Última resposta</span>
                  </div>
                  <p className="line-clamp-3">{messages[messages.length - 1].content}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChatExpanded(true)}
                    className="mt-2 text-accent-500 h-6 text-xs px-2"
                  >
                    Continuar →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t pt-4 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© 2026 Autem. Todos os direitos reservados.</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">v1.0.0</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Sistemas no ar</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
              <Bug className="h-3 w-3" />
              Debug
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
