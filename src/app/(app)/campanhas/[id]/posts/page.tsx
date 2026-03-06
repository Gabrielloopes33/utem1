"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Copy, 
  Loader2,
  MessageSquare,
  Send,
  Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { EmptyState } from "@/components/shared/empty-state"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Post {
  id: string
  campaign_id: string
  title: string
  content: string
  caption: string
  tipo: string
  formato: string
  status: "draft" | "approved" | "scheduled" | "published" | "rejected"
  slides: Array<{ text: string; image_prompt?: string }>
  metadata: {
    generated_by?: string
    campanha_tema?: string
    ai_prompt?: string
  }
  ai_feedback?: string
  created_at: string
  updated_at: string
}

interface Campaign {
  id: string
  name: string
  objective: string
  target_persona: string | null
}

export default function CampaignPostsPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  
  const [posts, setPosts] = useState<Post[]>([])
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [editedCaption, setEditedCaption] = useState("")
  const [aiFeedback, setAiFeedback] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  
  const supabase = createClient()

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Buscar campanha
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .select("id, name, objective, target_persona")
        .eq("id", campaignId)
        .single()
      
      if (campaignError) {
        toast.error("Campanha não encontrada")
        router.push("/campanhas")
        return
      }
      
      setCampaign(campaignData)
      
      // Buscar posts
      const { data: postsData, error: postsError } = await supabase
        .from("campaign_posts")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: true })
      
      if (postsError) {
        console.error("Erro ao carregar posts:", postsError)
        toast.error("Erro ao carregar posts")
        return
      }
      
      setPosts(postsData || [])
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao carregar dados")
    } finally {
      setIsLoading(false)
    }
  }, [campaignId, router, supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const generateMorePosts = async () => {
    if (!campaign) return
    
    setIsGenerating(true)
    toast.info("Gerando novos posts...")
    
    try {
      const response = await fetch(`/api/campanhas/${campaignId}/gerar-posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: 3 })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`${data.posts.length} posts gerados!`)
        await loadData()
      } else {
        toast.error(data.error || "Erro ao gerar posts")
      }
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao gerar posts")
    } finally {
      setIsGenerating(false)
    }
  }

  const savePost = async () => {
    if (!selectedPost) return
    
    setIsSaving(true)
    
    try {
      const { error } = await supabase
        .from("campaign_posts")
        .update({
          content: editedContent,
          caption: editedCaption,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedPost.id)
      
      if (error) throw error
      
      toast.success("Post salvo!")
      await loadData()
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao salvar post")
    } finally {
      setIsSaving(false)
    }
  }

  const improveWithAI = async () => {
    if (!selectedPost || !aiFeedback.trim()) return
    
    setIsImproving(true)
    toast.info("IA está melhorando o post...")
    
    try {
      const response = await fetch("/api/agentes/melhorar-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post: selectedPost,
          feedback: aiFeedback
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.improvedPost) {
        setEditedContent(data.improvedPost.content || editedContent)
        setEditedCaption(data.improvedPost.caption || editedCaption)
        toast.success("Post melhorado pela IA!")
        
        // Salvar versão melhorada
        await supabase
          .from("campaign_posts")
          .update({
            content: data.improvedPost.content || editedContent,
            caption: data.improvedPost.caption || editedCaption,
            ai_feedback: aiFeedback,
            ai_version: ((selectedPost as { ai_version?: number }).ai_version || 1) + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", selectedPost.id)
        
        await loadData()
      } else {
        toast.error(data.error || "Erro ao melhorar post")
      }
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao melhorar post")
    } finally {
      setIsImproving(false)
      setAiFeedback("")
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return
    
    try {
      const { error } = await supabase
        .from("campaign_posts")
        .delete()
        .eq("id", postId)
      
      if (error) throw error
      
      toast.success("Post excluído")
      await loadData()
      
      if (selectedPost?.id === postId) {
        setSelectedPost(null)
      }
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao excluir post")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado para a área de transferência!")
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      draft: { label: "Rascunho", color: "bg-gray-500" },
      approved: { label: "Aprovado", color: "bg-green-500" },
      scheduled: { label: "Agendado", color: "bg-blue-500" },
      published: { label: "Publicado", color: "bg-purple-500" },
      rejected: { label: "Rejeitado", color: "bg-red-500" }
    }
    return labels[status] || { label: status, color: "bg-gray-500" }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/campanhas")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Posts da Campanha</h1>
            <p className="text-muted-foreground">{campaign?.name}</p>
          </div>
        </div>
        
        <Button
          onClick={generateMorePosts}
          disabled={isGenerating}
          className="bg-accent-500 hover:bg-accent-600 gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Gerar Mais Posts
        </Button>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nenhum post gerado"
          description="Esta campanha ainda não tem posts. Clique em 'Gerar Mais Posts' para criar conteúdo com IA."
        >
          <Button
            onClick={generateMorePosts}
            disabled={isGenerating}
            className="bg-accent-500 hover:bg-accent-600 gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Gerar Posts com IA
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Posts */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              {posts.length} Posts Gerados
            </h3>
            
            {posts.map((post, index) => (
              <Card
                key={post.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-accent-300",
                  selectedPost?.id === post.id && "border-accent-500 ring-1 ring-accent-500"
                )}
                onClick={() => {
                  setSelectedPost(post)
                  setEditedContent(post.content)
                  setEditedCaption(post.caption)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full text-white",
                          getStatusLabel(post.status).color
                        )}>
                          {getStatusLabel(post.status).label}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm truncate">{post.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                        <span className="capitalize">{post.formato}</span>
                        <span>•</span>
                        <span className="capitalize">{post.tipo}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePost(post.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Editor do Post Selecionado */}
          <div className="lg:col-span-2">
            {selectedPost ? (
              <Card className="h-full">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{selectedPost.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(editedCaption)}
                        className="gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copiar Legenda
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={savePost}
                        disabled={isSaving}
                        className="gap-1"
                      >
                        {isSaving ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                        Salvar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  {/* Conteúdo Principal */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conteúdo do Post</label>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-32 p-3 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      placeholder="Conteúdo do post..."
                    />
                  </div>

                  {/* Legenda para Instagram */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Legenda (Instagram)</label>
                    <textarea
                      value={editedCaption}
                      onChange={(e) => setEditedCaption(e.target.value)}
                      className="w-full h-40 p-3 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      placeholder="Escreva a legenda..."
                    />
                  </div>

                  {/* Slides (se for carrossel) */}
                  {selectedPost.formato === "carrossel" && selectedPost.slides && selectedPost.slides.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Slides do Carrossel</label>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedPost.slides.map((slide, idx) => (
                          <Card key={idx} className="p-3">
                            <p className="text-xs font-medium mb-1">Slide {idx + 1}</p>
                            <p className="text-xs text-muted-foreground line-clamp-3">{slide.text}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Melhorar com IA */}
                  <div className="pt-4 border-t space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent-500" />
                      Melhorar com IA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiFeedback}
                        onChange={(e) => setAiFeedback(e.target.value)}
                        placeholder="Diga o que quer mudar: 'Deixe mais formal', 'Adicione emojis', 'Foque em jovens'..."
                        className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            improveWithAI()
                          }
                        }}
                      />
                      <Button
                        onClick={improveWithAI}
                        disabled={isImproving || !aiFeedback.trim()}
                        className="bg-accent-500 hover:bg-accent-600 gap-2"
                      >
                        {isImproving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Melhorar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Descreva como você quer melhorar o post e a IA irá reescrevê-lo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center p-12">
                <div className="text-center text-muted-foreground">
                  <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um post para editar</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
