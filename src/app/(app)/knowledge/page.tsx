"use client"

import { useEffect, useState } from "react"
import { BookOpen, Plus, FileText, Trash2, Search, Lightbulb, Target, Sparkles, RefreshCw, Database } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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

const BASE_CONFIG = {
  ganchos: {
    label: 'Ganchos',
    description: 'Hooks e frases de abertura validados para conteúdo',
    icon: Target,
    color: '#E4405F',
    bgColor: '#FDECEF',
  },
  estrategia: {
    label: 'Estratégia',
    description: 'Frameworks e princípios de conteúdo de alta conversão',
    icon: Lightbulb,
    color: '#22A06B',
    bgColor: '#E8F7EF',
  },
  resumo_executivo: {
    label: 'Resumo Executivo',
    description: 'Posicionamento, tom de voz, pilares e essência da marca',
    icon: Sparkles,
    color: '#8B5CF6',
    bgColor: '#F3EEFF',
  },
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeBase, setActiveBase] = useState<KnowledgeBaseType>('ganchos')
  
  // Dialog states
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null)
  
  // Form states
  const [form, setForm] = useState({
    title: '',
    content: '',
    metadata: '{}',
  })
  const [saving, setSaving] = useState(false)
  const [generatingEmbeddings, setGeneratingEmbeddings] = useState(false)

  useEffect(() => {
    fetchDocuments()
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

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.content.toLowerCase().includes(search.toLowerCase())
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

  async function generateEmbeddings() {
    setGeneratingEmbeddings(true)
    try {
      const res = await fetch('/api/knowledge/generate-embeddings', {
        method: 'POST',
      })
      
      if (res.ok) {
        const result = await res.json()
        toast.success(`${result.generated} embeddings gerados!`)
        fetchDocuments()
      } else {
        toast.error('Erro ao gerar embeddings')
      }
    } catch {
      toast.error('Erro ao gerar embeddings')
    } finally {
      setGeneratingEmbeddings(false)
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

  function resetForm() {
    setForm({ title: '', content: '', metadata: '{}' })
  }

  const config = BASE_CONFIG[activeBase]
  const Icon = config.icon

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Bases de Conhecimento"
        description="Gerencie os documentos que o agente de conteúdo utiliza para planejar"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={generateEmbeddings}
            disabled={generatingEmbeddings}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${generatingEmbeddings ? 'animate-spin' : ''}`} />
            {generatingEmbeddings ? 'Gerando...' : 'Gerar Embeddings'}
          </Button>
          <Button
            onClick={openCreate}
            className="bg-accent-500 hover:bg-accent-600 gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Documento
          </Button>
        </div>
      </PageHeader>

      <Tabs value={activeBase} onValueChange={(v) => setActiveBase(v as KnowledgeBaseType)}>
        <TabsList className="grid grid-cols-3 w-full max-w-xl">
          {Object.entries(BASE_CONFIG).map(([key, cfg]) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              <cfg.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{cfg.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(BASE_CONFIG).map((baseKey) => (
          <TabsContent key={baseKey} value={baseKey} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: BASE_CONFIG[baseKey as KnowledgeBaseType].bgColor }}
                    >
                      {(() => {
                        const Icon = BASE_CONFIG[baseKey as KnowledgeBaseType].icon
                        return <Icon className="h-5 w-5" style={{ color: BASE_CONFIG[baseKey as KnowledgeBaseType].color }} />
                      })()}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {BASE_CONFIG[baseKey as KnowledgeBaseType].label}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {BASE_CONFIG[baseKey as KnowledgeBaseType].description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {documents.length} documento{documents.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Documents list */}
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-shimmer h-20 rounded-lg" />
                    ))}
                  </div>
                ) : filteredDocs.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum documento encontrado</p>
                    <Button
                      variant="link"
                      onClick={openCreate}
                      className="text-accent-500"
                    >
                      Criar primeiro documento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-border/50 hover:border-accent-500/50 hover:bg-accent-50/30 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-accent-500" />
                            <h4 className="font-medium text-sm truncate">
                              {doc.title}
                            </h4>
                            {!doc.has_embedding && (
                              <Badge variant="outline" className="text-[10px] h-5">
                                Sem embedding
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {doc.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(doc)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

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
    </div>
  )
}
