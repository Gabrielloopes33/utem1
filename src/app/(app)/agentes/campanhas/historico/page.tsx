"use client"

/**
 * Histórico de Campanhas
 * Layout tipo feed com busca, filtros e lista de campanhas
 */

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  MoreVertical, 
  Clock,
  ArrowLeft,
  Trash2,
  Edit3,
  Megaphone,
  Filter,
  ChevronDown,
  X,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================
// TIPOS
// ============================================

interface HistoryItem {
  id: string
  title: string
  preview: string
  updated_at: string
  created_at: string
}

// ============================================
// UTILS
// ============================================

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "há alguns segundos"
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`
  if (diffInSeconds < 2592000) return `há ${Math.floor(diffInSeconds / 604800)} semanas`
  
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

// ============================================
// COMPONENTE
// ============================================

export default function HistoricoCampanhasPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Estados
  const [items, setItems] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  
  // Carregar dados
  useEffect(() => {
    const loadItems = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Buscar campanhas com primeira mensagem para preview
      const { data: conversations, error: convError } = await supabase
        .from("agent_conversations")
        .select("id, title, updated_at, created_at")
        .eq("agent_type", "campanhas")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
      
      if (convError) throw convError
      
      // Buscar preview da primeira mensagem de cada campanha
      const itemsWithPreview: HistoryItem[] = []
      
      for (const conv of (conversations || [])) {
        const { data: messages } = await supabase
          .from("agent_messages")
          .select("content")
          .eq("conversation_id", conv.id)
          .eq("role", "user")
          .order("created_at", { ascending: true })
          .limit(1)
          .single()
        
        itemsWithPreview.push({
          id: conv.id,
          title: conv.title,
          preview: messages?.content || "Sem preview disponível",
          updated_at: conv.updated_at,
          created_at: conv.created_at
        })
      }
      
      setItems(itemsWithPreview)
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
      toast.error("Erro ao carregar histórico")
    } finally {
      setIsLoading(false)
    }
    }
    loadItems()
  }, [])
  
  // Filtrar e ordenar
  const filteredItems = useMemo(() => {
    let result = [...items]
    
    // Filtro de busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.preview.toLowerCase().includes(query)
      )
    }
    
    // Ordenação
    result.sort((a, b) => {
      const dateA = new Date(sortBy === "recent" ? a.updated_at : a.created_at).getTime()
      const dateB = new Date(sortBy === "recent" ? b.updated_at : b.created_at).getTime()
      return sortBy === "recent" ? dateB - dateA : dateA - dateB
    })
    
    return result
  }, [items, searchQuery, sortBy])
  
  // Ações
  const handleOpenItem = (id: string) => {
    router.push(`/agentes/campanhas?id=${id}`)
  }
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Excluir esta campanha permanentemente?")) return
    
    try {
      await supabase.from("agent_conversations").delete().eq("id", id)
      setItems(prev => prev.filter(item => item.id !== id))
      toast.success("Campanha excluída")
    } catch {
      toast.error("Erro ao excluir")
    }
  }
  
  const handleStartEdit = (item: HistoryItem, e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setEditingId(item.id)
    setEditTitle(item.title)
  }
  
  const handleSaveTitle = async (id: string) => {
    if (!editTitle.trim()) return
    
    try {
      await supabase
        .from("agent_conversations")
        .update({ title: editTitle.trim() })
        .eq("id", id)
      
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, title: editTitle.trim() } : item
      ))
      setEditingId(null)
      toast.success("Título atualizado")
    } catch {
      toast.error("Erro ao atualizar")
    }
  }
  
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle("")
  }
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#f1f5f9]/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Back + Title */}
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/agentes/campanhas")}
              className="h-8 w-8 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Histórico de Campanhas</h1>
                <p className="text-sm text-gray-500">Gerenciador de Campanhas</p>
              </div>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar suas campanhas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 bg-white border-gray-200 focus-visible:ring-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredItems.length} {filteredItems.length === 1 ? "campanha" : "campanhas"}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-gray-600">
                  <Filter className="h-3.5 w-3.5" />
                  Ordenar
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Mais recentes
                  {sortBy === "recent" && <span className="ml-auto text-orange-600">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Mais antigos
                  {sortBy === "oldest" && <span className="ml-auto text-orange-600">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-full mb-1" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchQuery ? "Nenhuma campanha encontrada" : "Nenhuma campanha ainda"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery 
                ? "Tente buscar com outros termos" 
                : "Suas campanhas aparecerão aqui quando você começar a criar"}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => router.push("/agentes/campanhas")}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Criar primeira campanha
              </Button>
            )}
          </div>
        ) : (
          // Items list
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenItem(item.id)}
                className="group bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle(item.id)
                            if (e.key === "Escape") handleCancelEdit()
                          }}
                        />
                        <Button 
                          size="sm" 
                          className="h-8 px-2"
                          onClick={() => handleSaveTitle(item.id)}
                        >
                          Salvar
                        </Button>
                      </div>
                    ) : (
                      <h3 className="font-medium text-gray-900 mb-1 group-hover:text-orange-600 transition-colors truncate">
                        {item.title}
                      </h3>
                    )}
                    
                    {/* Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {item.preview}
                    </p>
                    
                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(item.updated_at)}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleStartEdit(item, e as React.MouseEvent<HTMLElement>)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => handleDelete(item.id, e as React.MouseEvent<HTMLElement>)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
