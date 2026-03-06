"use client"

/**
 * Agente de Campanhas - Interface minimalista estilo Claude
 * Sub-sidebar com histórico, botão de toggle nela, sem header
 */

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  Send, 
  Loader2, 
  Plus, 
  User, 
  PanelLeft,
  MessageSquare,
  Upload,
  X,
  File,
  FileImage,
  Trash2,
  Edit3,
  Search,
  Megaphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// ============================================
// TIPOS
// ============================================

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at: string
  metadata?: {
    step?: string
    options?: Array<{ label: string; value: string }>
    showInput?: boolean
    campanha?: CampanhaData
  }
}

interface Conversation {
  id: string
  title: string
  updated_at: string
}

interface CampanhaData {
  nome?: string
  tema?: string
  tipoConteudo?: string
  formato?: string
  persona?: string
  perfilPersona?: string
  referencias?: string
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  path: string
}

// ============================================
// ANIMAÇÕES CSS
// ============================================

const animations = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}

.animate-pulse-soft {
  animation: pulse-soft 2s ease-in-out infinite;
}

.animate-typing {
  animation: typing 1s ease-in-out infinite;
}

.animate-typing-delay-1 { animation-delay: 0ms; }
.animate-typing-delay-2 { animation-delay: 150ms; }
.animate-typing-delay-3 { animation-delay: 300ms; }
`

// ============================================
// COMPONENTES
// ============================================

// Componente de animação de digitação
function TypingAnimation() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <div className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  )
}

// Componente para renderizar texto com formatação
function FormattedMessage({ content }: { content: string }) {
  // Processa negrito **texto** e quebras de linha
  const parts = content.split(/(\*\*.*?\*\*|\n)/g)
  
  return (
    <>
      {parts.map((part, i) => {
        if (part === "\n") {
          return <br key={i} />
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function ChatBubble({ 
  message, 
  onOptionSelect,
  isLoading 
}: { 
  message: ChatMessage
  onOptionSelect?: (value: string) => void
  isLoading?: boolean
}) {
  const isUser = message.role === "user"
  const [showOptions, setShowOptions] = useState(true)

  return (
    <div className={cn(
      "group w-full animate-fade-in-up py-2",
      isUser ? "bg-transparent" : "bg-slate-100/50"
    )}>
      <div className="max-w-3xl mx-auto px-4">
        <div className={cn(
          "flex gap-3",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Avatar */}
          <div className={cn(
            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
            isUser 
              ? "bg-accent-500 text-white" 
              : "bg-gradient-to-br from-accent-500 to-purple-600 text-white"
          )}>
            {isUser ? <User className="h-4 w-4" /> : <Megaphone className="h-4 w-4" />}
          </div>

          {/* Balão de mensagem */}
          <div className={cn("flex-1 min-w-0", isUser ? "flex justify-end" : "flex justify-start")}>
            <div className={cn(
              "relative px-4 py-3 rounded-2xl shadow-sm max-w-[85%]",
              isUser 
                ? "bg-accent-500 text-white rounded-br-md" 
                : "bg-white text-foreground rounded-bl-md border border-slate-200"
            )}>
              {/* Conteúdo da mensagem */}
              <div className="text-[15px] leading-relaxed">
                <FormattedMessage content={message.content} />
              </div>

              {/* Horário (simulado) */}
              <div className={cn(
                "text-[10px] mt-1 text-right",
                isUser ? "text-accent-100" : "text-slate-400"
              )}>
                {new Date(message.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>

        {/* Opções clicáveis - fora do balão */}
        {!isUser && message.metadata?.options && showOptions && onOptionSelect && (
          <div className="mt-3 flex flex-wrap gap-2 pl-11 animate-fade-in-up">
            {message.metadata.options.map((option, idx) => (
              <button
                key={option.value}
                onClick={() => {
                  setShowOptions(false)
                  onOptionSelect(option.value)
                }}
                disabled={isLoading}
                className={cn(
                  "px-4 py-2 text-sm bg-white hover:bg-accent-500 hover:text-white",
                  "border border-slate-200 rounded-full transition-all duration-200 shadow-sm",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SuggestionCards({ onSelect }: { onSelect: (prompt: string) => void }) {
  const suggestions = [
    { title: "Campanha de Lançamento", prompt: "Crie uma campanha de lançamento para um novo produto" },
    { title: "Campanha Educacional", prompt: "Crie uma campanha educacional sobre investimentos para iniciantes" },
    { title: "Campanha de Conversão", prompt: "Crie uma campanha para converter leads em clientes" },
    { title: "Campanha de Atração", prompt: "Crie uma campanha para atrair novos seguidores" },
    { title: "Campanha de Nutrição", prompt: "Crie uma campanha para nutrir leads existentes" },
    { title: "Campanha para FII", prompt: "Crie uma campanha sobre Fundos Imobiliários" },
    { title: "Campanha para Renda Fixa", prompt: "Crie uma campanha sobre investimentos em renda fixa" },
    { title: "Campanha para Persona Conservadora", prompt: "Crie uma campanha direcionada a investidores conservadores" },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto px-4">
      {suggestions.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(item.prompt)}
          className={cn(
            "px-4 py-2 text-left rounded-full border transition-all duration-200 whitespace-nowrap",
            "bg-white/80 border-accent-200 hover:bg-white hover:border-accent-300 shadow-sm",
            "animate-fade-in-up"
          )}
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <p className="font-medium text-xs text-accent-900">{item.title}</p>
        </button>
      ))}
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function AgenteCampanhasContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const conversationParam = searchParams.get("conversation")
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [currentStep, setCurrentStep] = useState<string>("inicio")
  const [campanhaData, setCampanhaData] = useState<CampanhaData>({})
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Carregar conversas
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("agent_conversations")
        .select("id, title, updated_at")
        .eq("agent_type", "campanhas")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(50)

      if (data) setConversations(data)
    } catch (error) {
      console.error("Erro ao carregar conversas:", error)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [supabase])

  useEffect(() => { loadConversations() }, [loadConversations])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])
  useEffect(() => { if (hasStarted && !isLoading) inputRef.current?.focus() }, [hasStarted, isLoading])

  // Verificar se tabela campaigns existe
  const checkCampaignsTable = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .select("id", { count: "exact", head: true })
      
      return !error
    } catch {
      return false
    }
  }

  // Salvar campanha no banco
  const saveCampanha = async (campanhaData: CampanhaData) => {
    try {
      console.log("Tentando salvar campanha:", campanhaData)
      
      // Verificar se tabela existe
      const tableExists = await checkCampaignsTable()
      if (!tableExists) {
        console.warn("Tabela campaigns não existe. Pulando salvamento.")
        toast.info("Campanha criada! (A tabela 'campaigns' ainda não foi configurada no banco)")
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.id) {
        throw new Error("Usuário não autenticado")
      }

      // Validar dados mínimos
      if (!campanhaData.nome && !campanhaData.tema) {
        throw new Error("Nome ou tema da campanha é obrigatório")
      }

      // Mapeia tipoConteudo para objective válido
      const objectiveMap: Record<string, string> = {
        tecnico: "conversao",
        emocional: "atracao",
        autoridade: "nutricao",
        social: "atracao"
      }

      const objective = campanhaData.tipoConteudo && objectiveMap[campanhaData.tipoConteudo] 
        ? objectiveMap[campanhaData.tipoConteudo] 
        : "conversao"

      // Pega o conversation_id atual (se existir)
      const currentConvId = conversationId
      
      const campanhaToSave = {
        user_id: user.id,
        name: campanhaData.nome || campanhaData.tema || "Nova Campanha",
        objective: objective,
        status: "ativo" as const,
        target_persona: campanhaData.persona || null,
        metadata: {
          tipoConteudo: campanhaData.tipoConteudo || "tecnico",
          formato: campanhaData.formato || "carrossel",
          perfilPersona: campanhaData.perfilPersona || "moderado",
          referencias: campanhaData.referencias || "",
          tema: campanhaData.tema || "",
          conversation_id: currentConvId // Vincula à conversa do agente
        }
      }

      console.log("Dados a serem salvos:", campanhaToSave)

      const { data, error } = await supabase
        .from("campaigns")
        .insert(campanhaToSave)
        .select()
        .single()

      if (error) {
        console.error("Erro do Supabase:", error)
        throw new Error(error.message)
      }
      
      console.log("Campanha salva com sucesso:", data)
      toast.success("Campanha salva com sucesso!")

    } catch (error) {
      console.error("Erro ao salvar campanha:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Erro ao salvar campanha: ${errorMessage}`)
    }
  }

  // Extrair texto do arquivo
  const extractTextFromFile = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'txt' || ext === 'md') return await file.text()
    return `[Arquivo: ${file.name} - Tipo: ${file.type || ext?.toUpperCase()}]`
  }

  // Upload de arquivo
  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Não autenticado")

      setIsUploading(true)
      const content = await extractTextFromFile(file)

      const { data: kbData, error: kbError } = await supabase
        .from('knowledge_documents')
        .insert({
          base_type: 'estrategia',
          title: file.name,
          content: content,
          metadata: {
            file_type: file.type,
            file_size: file.size,
            file_ext: file.name.split('.').pop(),
            source: 'agente-campanhas',
            uploaded_by: user.id,
            is_active: true,
          }
        })
        .select()
        .single()

      if (kbError) throw kbError
      toast.success(`${file.name} adicionado!`)

      return { id: kbData.id, name: file.name, size: file.size, type: file.type, url: '', path: '' }
    } catch (error) {
      console.error("Erro:", error)
      toast.error(`Erro ao enviar ${file.name}`)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Processar arquivos
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const uploaded: UploadedFile[] = []
    for (const file of Array.from(files)) {
      const result = await uploadFile(file)
      if (result) uploaded.push(result)
    }
    setUploadedFiles(prev => [...prev, ...uploaded])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = async (file: UploadedFile) => {
    await supabase.from('knowledge_documents').delete().eq('id', file.id)
    setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
    toast.success("Arquivo removido")
  }

  const getFileIcon = (type: string) => type.startsWith('image/') ? <FileImage className="h-4 w-4" /> : <File className="h-4 w-4" />

  // Criar conversa
  const createConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Não autenticado")

      const { data, error } = await supabase
        .from("agent_conversations")
        .insert({ title: "📝 Definindo tema...", agent_type: "campanhas", user_id: user.id })
        .select()
        .single()

      if (error) throw error

      setConversationId(data.id)
      setHasStarted(true)
      setCurrentStep("inicio")
      setCampanhaData({})
      setMessages([]) // Limpar mensagens anteriores
      
      // Chamar API para primeira mensagem
      const response = await fetch("/api/agentes/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "",
          step: "inicio",
          conversationId: data.id,
          campanhaData: {}
        })
      })

      const apiData = await response.json()

      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: apiData.response || "Olá! Sou o Agente de Campanhas. Vou te guiar passo a passo para criar uma campanha completa. Qual é o tema da sua campanha?",
        created_at: new Date().toISOString(),
        metadata: {
          step: apiData.nextStep,
          options: apiData.options,
          showInput: apiData.showInput
        }
      }
      setMessages([welcomeMessage])
      setCurrentStep(apiData.nextStep || "tema")
      
      // Salvar mensagem inicial no banco
      await saveMessage(data.id, welcomeMessage)
      
      loadConversations()
      
      return data.id
    } catch {
      toast.error("Erro ao iniciar conversa")
      return null
    }
  }

  const loadConversation = async (id: string) => {
    setIsLoading(true)
    setConversationId(id)
    setInput("")
    setUploadedFiles([])
    
    try {
      // Buscar mensagens da conversa
      const { data: messagesData } = await supabase
        .from("agent_messages")
        .select("id, role, content, created_at, metadata")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })

      if (messagesData && messagesData.length > 0) {
        const loadedMessages = messagesData.map(m => ({ 
          id: m.id, 
          role: m.role as "user" | "assistant", 
          content: m.content, 
          created_at: m.created_at,
          metadata: m.metadata
        }))
        
        setMessages(loadedMessages)
        setHasStarted(true)
        
        // Recuperar o step da última mensagem do assistente
        const lastAssistantMessage = [...loadedMessages].reverse().find(m => m.role === "assistant")
        if (lastAssistantMessage?.metadata?.step) {
          setCurrentStep(lastAssistantMessage.metadata.step)
        }
        
        // Recuperar dados da campanha se existirem na última mensagem
        if (lastAssistantMessage?.metadata?.campanha) {
          setCampanhaData(lastAssistantMessage.metadata.campanha)
        }
      } else {
        // Se não há mensagens, mostra estado vazio
        setMessages([])
        setHasStarted(true)
        setCurrentStep("inicio")
      }
    } catch {
      toast.error("Erro ao carregar conversa")
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar conversa automaticamente se houver param na URL
  useEffect(() => {
    if (conversationParam && !hasStarted && !isLoading) {
      loadConversation(conversationParam)
      // Limpar a URL após carregar
      router.replace("/agentes/campanhas", { scroll: false })
    }
  }, [conversationParam, hasStarted, isLoading, loadConversation, router])

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Excluir esta conversa?")) return
    await supabase.from("agent_conversations").delete().eq("id", id)
    if (conversationId === id) handleNewChat()
    setConversations(prev => prev.filter(c => c.id !== id))
    toast.success("Excluído")
  }

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(conv.id)
    setEditTitle(conv.title)
  }

  const saveTitle = async (id: string) => {
    await supabase.from("agent_conversations").update({ title: editTitle }).eq("id", id)
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitle } : c))
    setEditingId(null)
  }

  // Salvar mensagem no histórico
  const saveMessage = async (conversationId: string, message: ChatMessage) => {
    try {
      await supabase.from("agent_messages").insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        metadata: message.metadata || {}
      })
    } catch (error) {
      console.error("Erro ao salvar mensagem:", error)
    }
  }

  // Enviar mensagem
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    let currentConvId = conversationId
    if (!currentConvId) {
      currentConvId = await createConversation() || undefined
      if (!currentConvId) return
    }

    setIsLoading(true)
    setInput("")
    setHasStarted(true)

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])
    
    // Salvar mensagem do usuário no banco
    await saveMessage(currentConvId, userMessage)

    // Atualizar dados da campanha
    setCampanhaData(prev => {
      const updated = { ...prev }
      switch (currentStep) {
        case "tema":
          updated.tema = content
          break
        case "tipo_conteudo":
          updated.tipoConteudo = content
          break
        case "formato":
          updated.formato = content
          break
        case "persona_descricao":
          updated.persona = content
          break
        case "perfil_persona":
          updated.perfilPersona = content
          break
        case "nome_campanha":
          updated.nome = content
          break
      }
      return updated
    })

    try {
      const response = await fetch("/api/agentes/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          step: currentStep,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          conversationId: currentConvId,
          campanhaData: { ...campanhaData, [currentStep]: content },
          files: uploadedFiles.map(f => ({ id: f.id, name: f.name })),
        })
      })

      const data = await response.json()
      
      // Atualizar campanhaData com dados retornados da API (se houver)
      const updatedCampanhaData = { ...campanhaData, [currentStep]: content }
      if (data.campanha) {
        Object.assign(updatedCampanhaData, data.campanha)
      }
      setCampanhaData(updatedCampanhaData)
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response || "Desculpe, não consegui processar.",
        created_at: new Date().toISOString(),
        metadata: {
          step: data.nextStep,
          options: data.options,
          showInput: data.showInput,
          campanha: data.campanha
        }
      }
      setMessages(prev => [...prev, assistantMessage])
      
      // Salvar mensagem do assistente no banco
      await saveMessage(currentConvId, assistantMessage)
      
      setCurrentStep(data.nextStep)
      
      // Se finalizou, salvar campanha
      if (data.nextStep === "finalizado") {
        // Usar dados mesclados: API + dados locais acumulados
        const dadosFinais = { ...updatedCampanhaData, ...data.campanha }
        console.log("Salvando campanha com dados:", dadosFinais)
        await saveCampanha(dadosFinais)
      }
      
      // Atualizar título da conversa baseado no conteúdo
      if (currentStep === "tema" && content) {
        // Se é o tema, atualiza com nome descritivo
        const newTitle = `🎯 ${content.slice(0, 40)}${content.length > 40 ? '...' : ''}`
        await supabase.from("agent_conversations").update({ title: newTitle }).eq("id", currentConvId)
        loadConversations()
      } else if (currentStep === "nome_campanha" && content) {
        // Se é o nome final da campanha, atualiza com o nome oficial
        const newTitle = `✅ ${content.slice(0, 40)}${content.length > 40 ? '...' : ''}`
        await supabase.from("agent_conversations").update({ title: newTitle }).eq("id", currentConvId)
        loadConversations()
      }
    } catch {
      toast.error("Erro ao processar")
    } finally {
      setIsLoading(false)
    }
  }

  // Gerar posts para a campanha
  const generatePosts = async () => {
    if (!campanhaData.nome) {
      toast.error("Dados da campanha incompletos")
      return
    }

    setIsLoading(true)
    toast.info("Gerando posts... Isso pode levar alguns segundos.")

    try {
      const response = await fetch("/api/agentes/campanhas/gerar-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campanhaData,
          quantidade: 5 // Gerar 5 posts por padrão
        })
      })

      const data = await response.json()

      if (data.success && data.posts) {
        toast.success(`${data.posts.length} posts gerados com sucesso!`)
        
        // Redirecionar para a página de posts da campanha
        // Vamos buscar a campanha recém-criada pelo nome
        const { data: campanha } = await supabase
          .from("campaigns")
          .select("id")
          .eq("name", campanhaData.nome)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (campanha) {
          // Redirecionar para a página de gerenciamento de posts
          window.location.href = `/campanhas/${campanha.id}/posts`
        } else {
          toast.error("Campanha não encontrada para associar posts")
        }
      } else {
        toast.error(data.error || "Erro ao gerar posts")
      }
    } catch (error) {
      console.error("Erro ao gerar posts:", error)
      toast.error("Erro ao gerar posts. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handler para opções clicáveis
  const handleOptionSelect = async (value: string) => {
    if (value === "gerar_posts") {
      await generatePosts()
    } else if (value === "ver_campanha") {
      // Buscar campanha e redirecionar
      const { data: campanha } = await supabase
        .from("campaigns")
        .select("id")
        .eq("name", campanhaData.nome)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
      
      if (campanha) {
        window.location.href = `/campanhas/${campanha.id}`
      } else {
        toast.error("Campanha não encontrada")
      }
    } else if (value === "nova_campanha") {
      handleNewChat()
    } else {
      // Opções normais do fluxo
      await sendMessage(value)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setInput("")
    setConversationId(undefined)
    setHasStarted(false)
    setUploadedFiles([])
    setCurrentStep("inicio")
    setCampanhaData({})
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return "Hoje"
    if (diff === 1) return "Ontem"
    if (diff < 7) return "Semana"
    if (diff < 30) return "Mês"
    return "Antigo"
  }

  const grouped = () => {
    const groups: { [key: string]: Conversation[] } = { Hoje: [], Ontem: [], Semana: [], Mês: [], Antigo: [] }
    conversations.forEach(c => {
      const g = formatDate(c.updated_at)
      if (!groups[g]) groups[g] = []
      groups[g].push(c)
    })
    return groups
  }

  // Drag & Drop
  const handleDrag = (e: React.DragEvent, active: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(active)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const uploaded: UploadedFile[] = []
    for (const file of files) {
      const result = await uploadFile(file)
      if (result) uploaded.push(result)
    }
    setUploadedFiles(prev => [...prev, ...uploaded])
  }

  const groups = grouped()

  return (
    <div className="fixed inset-0 top-[3rem] left-[var(--sidebar-width-expanded)] right-0 bottom-0 flex">
      <style>{animations}</style>
      
      {/* Sub-sidebar - colada à sidebar azul */}
      <div 
        className={cn(
          "h-full bg-[#f1f5f9] border-r border-border/30 flex flex-col transition-all duration-300 ease-in-out shrink-0",
          sidebarOpen ? "w-[260px]" : "w-0 overflow-hidden"
        )}
      >
        {/* Header da sub-sidebar com botão de toggle */}
        <div className="flex items-center gap-2 p-3 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 shrink-0"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            className="flex-1 justify-start gap-2 text-sm bg-white/80 hover:bg-white border-accent-200"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            Nova campanha
          </Button>
        </div>

        {/* Busca */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-7 pr-2 py-1.5 text-xs bg-white/80 rounded-md outline-none placeholder:text-muted-foreground border border-accent-100"
            />
          </div>
        </div>

        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto py-2">
          {isLoadingConversations ? (
            <div className="p-4 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
          ) : (
            <div className="space-y-1 px-2">
              {Object.entries(groups).map(([name, items]) => (
                items.length > 0 && (
                  <div key={name} className="mb-2">
                    <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {name}
                    </p>
                    {items.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className={cn(
                          "group relative flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all",
                          conversationId === conv.id 
                            ? "bg-accent-200 shadow-sm" 
                            : "hover:bg-white/60"
                        )}
                      >
                        <MessageSquare className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          conversationId === conv.id ? "text-accent-700" : "text-muted-foreground"
                        )} />
                        
                        {editingId === conv.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => saveTitle(conv.id)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveTitle(conv.id); if (e.key === "Escape") setEditingId(null) }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="flex-1 min-w-0 text-xs bg-white rounded px-1 py-0.5 outline-none border border-accent-300"
                          />
                        ) : (
                          <span className={cn(
                            "flex-1 min-w-0 text-xs truncate",
                            conversationId === conv.id ? "font-medium text-accent-900" : "text-foreground/90"
                          )}>
                            {conv.title}
                          </span>
                        )}
                        
                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button onClick={(e) => startEditing(conv, e)} className="p-1 hover:bg-accent-300/50 rounded">
                            <Edit3 className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button onClick={(e) => deleteConversation(conv.id, e)} className="p-1 hover:bg-red-100 rounded">
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo principal - ocupa o espaço restante */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f1f5f9] overflow-hidden">
        {/* Header minimalista - só aparece quando sidebar está fechada */}
        {!sidebarOpen && (
          <div className="flex items-center gap-2 p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-8 w-8"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center">
              <Megaphone className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            {!hasStarted ? (
              <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
                <div className="text-center space-y-10 w-full max-w-4xl">
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center mb-4">
                      <Megaphone className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                      Agente de Campanhas
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                      Crie campanhas completas para suas redes sociais com inteligência artificial
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <div 
                      className={cn(
                        "relative bg-white border rounded-2xl shadow-lg transition-all",
                        isDragging && "border-accent-500 ring-2 ring-accent-500/20 bg-accent-50/50"
                      )}
                      onDragEnter={(e) => handleDrag(e, true)}
                      onDragLeave={(e) => handleDrag(e, false)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                    >
                      {isDragging && (
                        <div className="absolute inset-0 flex items-center justify-center bg-accent-50/80 rounded-2xl z-10">
                          <div className="flex items-center gap-2 text-accent-600">
                            <Upload className="h-6 w-6" />
                            <span className="font-medium">Solte o arquivo aqui</span>
                          </div>
                        </div>
                      )}
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) }}}
                        placeholder="Descreva a campanha que você quer criar..."
                        rows={3}
                        className="w-full px-4 py-4 bg-transparent outline-none resize-none text-[15px] placeholder:text-muted-foreground min-h-[100px] max-h-[200px]"
                      />
                      <div className="flex items-center justify-between px-3 pb-3">
                        <div className="flex items-center gap-2">
                          <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.doc,.docx,.md,image/*" onChange={handleFileSelect} className="hidden" />
                          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="h-8 w-8">
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} size="icon" className="h-8 w-8 bg-accent-500 hover:bg-accent-600">
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-3">Sugestões para começar (clique para usar)</p>
                    <SuggestionCards onSelect={(p) => { setInput(p); inputRef.current?.focus(); }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="pb-48">
                {messages.map(m => (
                  <ChatBubble 
                    key={m.id} 
                    message={m} 
                    onOptionSelect={handleOptionSelect}
                    isLoading={isLoading}
                  />
                ))}
                {isLoading && (
                  <div className="w-full animate-fade-in-up py-2 bg-slate-100/50">
                    <div className="max-w-3xl mx-auto px-4">
                      <div className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <Megaphone className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 flex justify-start">
                          <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200 shadow-sm min-w-[80px]">
                            <TypingAnimation />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input fixo */}
          {hasStarted && (
            <div className="p-6 pt-0">
              <div className="max-w-3xl mx-auto space-y-2">
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-1">
                    {uploadedFiles.map(f => (
                      <div key={f.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-accent-200 rounded-full text-sm">
                        {getFileIcon(f.type)}
                        <span className="max-w-[150px] truncate text-xs">{f.name}</span>
                        <button onClick={() => removeFile(f)} className="ml-1 p-0.5 hover:bg-accent-100 rounded-full"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div 
                  className={cn(
                    "relative bg-white border rounded-2xl shadow-lg transition-all",
                    isDragging && "border-accent-500 ring-2 ring-accent-500/20 bg-accent-50/50"
                  )}
                  onDragEnter={(e) => handleDrag(e, true)}
                  onDragLeave={(e) => handleDrag(e, false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-accent-50/80 rounded-2xl z-10">
                      <div className="flex items-center gap-2 text-accent-600">
                        <Upload className="h-6 w-6" />
                        <span className="font-medium">Solte o arquivo aqui</span>
                      </div>
                    </div>
                  )}
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) }}}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-transparent outline-none resize-none text-[15px] placeholder:text-muted-foreground min-h-[56px] max-h-[200px] disabled:opacity-50"
                  />
                  <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-2">
                      <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.doc,.docx,.md,image/*" onChange={handleFileSelect} className="hidden" />
                      <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isLoading} className="h-8 w-8">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} size="icon" className="h-8 w-8 bg-accent-500 hover:bg-accent-600">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AgenteCampanhasPage() {
  return (
    <Suspense>
      <AgenteCampanhasContent />
    </Suspense>
  )
}
