"use client"

import { useEffect, useState } from "react"
import { 
  Plus, 
  FileText, 
  Trash2, 
  Search, 
  Database,
  CheckSquare,
  Tag,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Lightbulb,
  Target,
  Clock,
  FileIcon,
  Hash,
  Upload,
  X,
  LayoutGrid,
  List,
  Pencil,
  FileUp
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Checkbox } from "../../../components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog"
import { Badge } from "../../../components/ui/badge"
import { toast } from "sonner"
import { cn } from "../../../lib/utils"

type KnowledgeBaseType = 'ganchos' | 'estrategia' | 'resumo_executivo'

interface KnowledgeDocument {
  id: string
  base_type: KnowledgeBaseType
  title: string
  content: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  has_embedding: boolean
}

interface KnowledgeBase {
  id: string
  name: string
  description: string
  type: KnowledgeBaseType
  icon: React.ReactNode
  color: string
  bgColor: string
  tags: string[]
  documentCount: number
  chunkCount: number
  updatedAt: string
}

const BASE_CONFIG = {
  ganchos: {
    label: 'Ganchos',
    description: 'Hooks e frases de abertura validados',
    color: '#E4405F',
    bgColor: '#FDECEF',
    icon: Target,
  },
  estrategia: {
    label: 'Estratégia',
    description: 'Frameworks e princípios de conteúdo',
    color: '#22A06B',
    bgColor: '#E8F7EF',
    icon: Lightbulb,
  },
  resumo_executivo: {
    label: 'Resumo Executivo',
    description: 'Posicionamento e tom de voz da marca',
    color: '#8B5CF6',
    bgColor: '#F3EEFF',
    icon: Sparkles,
  },
}

// Mock data for knowledge bases (cards like Dify)
const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: '1',
    name: 'Ganchos de Alta Conversão',
    description: 'Coleção de hooks validados para posts sobre investimentos e finanças pessoais',
    type: 'ganchos',
    color: '#E4405F',
    bgColor: '#FDECEF',
    icon: <Target className="h-5 w-5" style={{ color: '#E4405F' }} />,
    tags: ['Instagram', 'Medo', 'Desejo'],
    documentCount: 24,
    chunkCount: 156,
    updatedAt: '2026-02-28T10:00:00Z',
  },
  {
    id: '2',
    name: 'Frameworks de Conteúdo',
    description: 'Estruturas de copy e storytelling para educação financeira',
    type: 'estrategia',
    color: '#22A06B',
    bgColor: '#E8F7EF',
    icon: <Lightbulb className="h-5 w-5" style={{ color: '#22A06B' }} />,
    tags: ['Copywriting', 'Storytelling'],
    documentCount: 18,
    chunkCount: 89,
    updatedAt: '2026-02-25T14:30:00Z',
  },
  {
    id: '3',
    name: 'Identidade Autem',
    description: 'Tom de voz, pilares de conteúdo e posicionamento da marca',
    type: 'resumo_executivo',
    color: '#8B5CF6',
    bgColor: '#F3EEFF',
    icon: <Sparkles className="h-5 w-5" style={{ color: '#8B5CF6' }} />,
    tags: ['Brand', 'Tom de Voz'],
    documentCount: 8,
    chunkCount: 42,
    updatedAt: '2026-03-01T09:00:00Z',
  },
]

const ALL_TAGS = ['Instagram', 'Medo', 'Desejo', 'Copywriting', 'Storytelling', 'Brand', 'Tom de Voz']

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'hoje'
  if (diffInDays === 1) return 'há 1 dia'
  if (diffInDays < 30) return `há ${diffInDays} dias`
  if (diffInDays < 365) return `há ${Math.floor(diffInDays / 30)} meses`
  return `há ${Math.floor(diffInDays / 365)} anos`
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showAllKnowledge, setShowAllKnowledge] = useState(true)
  const [activeBase, setActiveBase] = useState<KnowledgeBaseType>('ganchos')
  
  // Dialog states
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null)
  
  // Form states
  const [form, setForm] = useState({
    title: '',
    content: '',
    metadata: '{}',
  })
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  useEffect(() => {
    fetchDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBase])

  async function fetchDocuments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/knowledge/documents?base_type=${activeBase}`)
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      } else {
        toast.error('Erro ao carregar documentos')
      }
    } catch {
      toast.error('Erro ao carregar documentos')
    } finally {
      setLoading(false)
    }
  }

  const filteredBases = MOCK_KNOWLEDGE_BASES.filter(base =>
    (showAllKnowledge || base.type === activeBase) &&
    (search === '' || 
      base.name.toLowerCase().includes(search.toLowerCase()) ||
      base.description.toLowerCase().includes(search.toLowerCase())) &&
    (selectedTags.length === 0 || selectedTags.some(tag => base.tags.includes(tag)))
  )

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/knowledge/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_type: activeBase,
          title: form.title,
          content: form.content,
          metadata: JSON.parse(form.metadata || '{}'),
        }),
      })
      
      if (res.ok) {
        toast.success('Documento criado!')
        fetchDocuments()
        setShowCreate(false)
        resetForm()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Erro ao criar')
      }
    } catch {
      toast.error('Erro ao criar')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDoc || !form.title.trim() || !form.content.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/knowledge/documents/${selectedDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          metadata: JSON.parse(form.metadata || '{}'),
        }),
      })
      
      if (res.ok) {
        toast.success('Documento atualizado!')
        fetchDocuments()
        setShowEdit(false)
        setSelectedDoc(null)
        resetForm()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Erro ao atualizar')
      }
    } catch {
      toast.error('Erro ao atualizar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar este documento?')) return
    
    try {
      const res = await fetch(`/api/knowledge/documents/${id}`, { 
        method: 'DELETE' 
      })
      
      if (res.ok) {
        toast.success('Documento deletado!')
        fetchDocuments()
      } else {
        toast.error('Erro ao deletar')
      }
    } catch {
      toast.error('Erro ao deletar')
    }
  }



  function openEdit(doc: KnowledgeDocument) {
    setSelectedDoc(doc)
    setForm({
      title: doc.title,
      content: doc.content,
      metadata: JSON.stringify(doc.metadata, null, 2),
    })
    setShowEdit(true)
  }

  function openCreate() {
    resetForm()
    setShowCreate(true)
  }

  function openUpload() {
    setShowUpload(true)
  }

  function resetForm() {
    setForm({ title: '', content: '', metadata: '{}' })
  }

  const config = BASE_CONFIG[activeBase]

  return (
    <div className="animate-fade-up min-h-[calc(100vh-4rem)] -mx-6 -mt-6 px-6 py-6">
      {/* Header com filtros estilo Dify */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Conhecimento</h1>
        </div>
        
        {/* Barra de filtros */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Checkbox Todo o conhecimento */}
          <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border">
            <Checkbox 
              id="all-knowledge" 
              checked={showAllKnowledge}
              onCheckedChange={(checked) => setShowAllKnowledge(checked as boolean)}
            />
            <Label htmlFor="all-knowledge" className="text-sm cursor-pointer">
              Todo o conhecimento
            </Label>
          </div>

          {/* Dropdown de Tags */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-background">
                <Tag className="h-4 w-4" />
                {selectedTags.length > 0 ? `${selectedTags.length} tags` : 'Todas as tags'}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {ALL_TAGS.map((tag) => (
                <DropdownMenuItem
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    )
                  }}
                  className="flex items-center gap-2"
                >
                  <div className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center",
                    selectedTags.includes(tag) && "bg-accent-500 border-accent-500"
                  )}>
                    {selectedTags.includes(tag) && <CheckSquare className="h-3 w-3 text-white" />}
                  </div>
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Input de busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conhecimento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>


        </div>
      </div>

      {/* Layout principal: Sidebar + Grid */}
      <div className="flex gap-6">
        {/* Sidebar esquerda com ações */}
        <div className="w-64 shrink-0 space-y-3">
          <Card className="border-sidebar-border bg-sidebar">
            <CardContent className="p-2 space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                onClick={openCreate}
              >
                <Plus className="h-4 w-4 text-accent-500" />
                Criar Conhecimento
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                onClick={openUpload}
              >
                <Upload className="h-4 w-4 text-accent-500" />
                Upload de Arquivo
              </Button>
            </CardContent>
          </Card>

          {/* Filtros por tipo */}
          {!showAllKnowledge && (
            <Card className="border-border/50">
              <CardContent className="p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">TIPOS</p>
                <div className="space-y-1">
                  {(Object.keys(BASE_CONFIG) as KnowledgeBaseType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveBase(type)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                        activeBase === type 
                          ? "bg-accent-500/10 text-accent-600" 
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <div 
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: BASE_CONFIG[type].color }}
                      />
                      {BASE_CONFIG[type].label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Área principal - Lista ou Grid */}
        <div className="flex-1">
          {/* Header com toggle de visualização */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {documents.length} documento{documents.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === 'list' ? "bg-white shadow-sm" : "hover:bg-white/50"
                )}
                title="Visualização em lista"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === 'grid' ? "bg-white shadow-sm" : "hover:bg-white/50"
                )}
                title="Visualização em grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lista de documentos */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Nenhum documento encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione documentos à base de conhecimento
              </p>
              <div className="flex gap-2">
                <Button onClick={openCreate} className="bg-accent-500 hover:bg-accent-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Documento
                </Button>
                <Button onClick={openUpload} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            /* Visualização em Lista */
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Documento</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Atualizado</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: BASE_CONFIG[doc.base_type].bgColor }}
                          >
                            {(() => {
                              const Icon = BASE_CONFIG[doc.base_type].icon
                              return <Icon className="h-4 w-4" style={{ color: BASE_CONFIG[doc.base_type].color }} />
                            })()}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{doc.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {doc.content.slice(0, 60)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">
                          {BASE_CONFIG[doc.base_type].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {doc.has_embedding ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckSquare className="h-3 w-3" />
                            Indexado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Clock className="h-3 w-3" />
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(doc.updated_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(doc)}
                            className="p-1.5 hover:bg-muted rounded-md transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Visualização em Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredBases.map((base) => (
                <Card 
                  key={base.id} 
                  className="group border-border/50 hover:shadow-md hover:border-accent-500/30 transition-all cursor-pointer"
                  onClick={() => setActiveBase(base.type)}
                >
                  <CardContent className="p-5">
                    {/* Header com ícone e título */}
                    <div className="flex items-start gap-3 mb-3">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: base.bgColor }}
                      >
                        {base.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate group-hover:text-accent-600 transition-colors">
                          {base.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Autem · Editado {formatTimeAgo(base.updatedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {base.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Descrição */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {base.description}
                    </p>

                    {/* Footer com stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileIcon className="h-3 w-3" />
                          {base.documentCount} / 1
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {base.chunkCount}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Atualizado {formatTimeAgo(base.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer com dica */}
      <div className="mt-12 pt-6 border-t">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-accent-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-accent-600 mb-1">Você sabia?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O Conhecimento pode ser integrado ao aplicativo Autem como um <span className="text-accent-500">contexto</span>,
              ou pode ser criado como um <span className="text-accent-500">plug-in de índice</span> independente para publicação
              como um plug-in de índice autônomo para publicar.
            </p>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Documento - {config.label}</DialogTitle>
            <DialogDescription>
              Adicione um novo documento à base de conhecimento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Gancho: Perda de dinheiro"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Conteúdo completo do documento..."
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Metadata (JSON)</Label>
              <Textarea
                value={form.metadata}
                onChange={(e) => setForm((p) => ({ ...p, metadata: e.target.value }))}
                placeholder='{"tipo": "medo", "canal": "instagram"}'
                rows={3}
                className="font-mono text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !form.title.trim() || !form.content.trim()}
                className="bg-accent-500 hover:bg-accent-600"
              >
                {saving ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Documento - {config.label}</DialogTitle>
            <DialogDescription>
              Atualize o documento da base de conhecimento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Gancho: Perda de dinheiro"
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Conteúdo completo do documento..."
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Metadata (JSON)</Label>
              <Textarea
                value={form.metadata}
                onChange={(e) => setForm((p) => ({ ...p, metadata: e.target.value }))}
                placeholder='{"tipo": "medo", "canal": "instagram"}'
                rows={3}
                className="font-mono text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowEdit(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !form.title.trim() || !form.content.trim()}
                className="bg-accent-500 hover:bg-accent-600"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <FileUploadDialog 
        open={showUpload} 
        onOpenChange={setShowUpload}
        baseType={activeBase}
        onSuccess={fetchDocuments}
      />
    </div>
  )
}

// Componente de Upload de Arquivos
interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  baseType: KnowledgeBaseType
  onSuccess: () => void
}

function FileUploadDialog({ open, onOpenChange, baseType, onSuccess }: FileUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [extractedTexts, setExtractedTexts] = useState<Record<string, string>>({})

  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx']

  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  async function handleFiles(newFiles: File[]) {
    const validFiles = newFiles.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      return allowedTypes.includes(file.type) || allowedExtensions.includes(ext)
    })

    if (validFiles.length !== newFiles.length) {
      toast.error('Alguns arquivos foram ignorados. Apenas .txt, .pdf, .doc e .docx são suportados.')
    }

    setFiles(prev => [...prev, ...validFiles])

    // Extrair texto de cada arquivo
    for (const file of validFiles) {
      try {
        const text = await extractTextFromFile(file)
        setExtractedTexts(prev => ({ ...prev, [file.name]: text }))
      } catch (error) {
        console.error('Erro ao extrair texto:', error)
        toast.error(`Erro ao ler ${file.name}`)
      }
    }
  }

  async function extractTextFromFile(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'txt') {
      return await file.text()
    }

    // Para PDF e DOC/DOCX, enviar para o servidor processar
    const { createClient } = await import('../../../lib/supabase/client')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) throw new Error('Usuário não autenticado')

    const formData = new FormData()
    formData.append('file', file)
    
    const res = await fetch('/api/knowledge/extract-text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Falha ao extrair texto')
    }
    
    const data = await res.json()
    return data.text
  }

  function removeFile(fileName: string) {
    setFiles(prev => prev.filter(f => f.name !== fileName))
    setExtractedTexts(prev => {
      const newTexts = { ...prev }
      delete newTexts[fileName]
      return newTexts
    })
  }

  async function handleUpload() {
    if (files.length === 0) return

    setUploading(true)
    let successCount = 0

    try {
      for (const file of files) {
        const content = extractedTexts[file.name]
        if (!content) continue

        const res = await fetch('/api/knowledge/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base_type: baseType,
            title: file.name.replace(/\.[^/.]+$/, ''),
            content: content,
            metadata: { 
              source: 'file_upload',
              filename: file.name,
              type: file.type,
              size: file.size,
            },
          }),
        })

        if (res.ok) {
          successCount++
        } else {
          toast.error(`Erro ao salvar ${file.name}`)
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} arquivo(s) enviado(s) com sucesso!`)
        onSuccess()
        onOpenChange(false)
        setFiles([])
        setExtractedTexts({})
      }
    } catch {
      toast.error('Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload de Arquivos</DialogTitle>
          <DialogDescription>
            Arraste arquivos ou clique para selecionar. Suportamos .txt, .pdf, .doc e .docx
          </DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            dragActive 
              ? "border-accent-500 bg-accent-50" 
              : "border-border hover:border-accent-500/50"
          )}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            multiple
            accept=".txt,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileInput}
          />
          <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            .txt, .pdf, .doc, .docx
          </p>
        </div>

        {/* Lista de arquivos */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Arquivos selecionados:</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file) => (
                <div 
                  key={file.name}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                >
                  <FileText className="h-5 w-5 text-accent-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                      {extractedTexts[file.name] && (
                        <span className="text-green-600 ml-2">
                          ✓ Texto extraído ({extractedTexts[file.name].length} caracteres)
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info sobre embeddings */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Como funciona:</strong> Os arquivos serão processados, o texto extraído e 
            automaticamente indexado para os agentes usarem no RAG (Retrieval Augmented Generation).
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0 || Object.keys(extractedTexts).length !== files.length}
            className="bg-accent-500 hover:bg-accent-600"
          >
            {uploading ? 'Enviando...' : `Enviar ${files.length > 0 ? `(${files.length})` : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
