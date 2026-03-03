/**
 * Tipos para o Agente Gerar Post
 */

export type TipoConteudo = "tecnico" | "emocional" | "objecao" | "autoridade" | "social"
export type FormatoPost = "carrossel" | "card" | "reels"
export type PerfilPersona = "conservador" | "moderado" | "agressivo"
export type PostStatus = "draft" | "generating" | "completed" | "error"

export interface PersonaData {
  id: string
  name: string
  profile_type: PerfilPersona
  age_range?: string
  income_range?: string
  patrimony_range?: string
  objectives?: string[]
  fears?: string[]
  interests?: string[]
  communication_tone?: string
}

export interface PostFormData {
  tema: string
  tipoConteudo: TipoConteudo
  formato: FormatoPost
  persona: string
  perfilPersona: PerfilPersona
  personaData?: PersonaData | null
  campanha?: string
  referencias?: string
}

export interface GeneratedPost {
  id: string
  user_id: string
  tema: string
  tipo: TipoConteudo
  formato: FormatoPost
  persona: string
  status: PostStatus
  content: {
    hook: string
    copy: string
    legenda: string
    hashtags: string[]
    elementosVisuais: string
    slides?: string[] // Para carrossel
    roteiro?: string // Para reels
  }
  created_at: string
  updated_at: string
}

export const TIPOS_CONTEUDO: { value: TipoConteudo; label: string; description: string; icon: string }[] = [
  { 
    value: "tecnico", 
    label: "Técnico", 
    description: "Conteúdo educacional e informativo",
    icon: "BookOpen"
  },
  { 
    value: "emocional", 
    label: "Emocional", 
    description: "Conecta com os sentimentos do público",
    icon: "Heart"
  },
  { 
    value: "objecao", 
    label: "Objeção", 
    description: "Quebra objeções e mitos",
    icon: "Shield"
  },
  { 
    value: "autoridade", 
    label: "Autoridade", 
    description: "Demonstra expertise e credibilidade",
    icon: "Award"
  },
  { 
    value: "social", 
    label: "Social Proof", 
    description: "Cases e resultados de clientes",
    icon: "Users"
  },
]

export const FORMATOS_POST: { value: FormatoPost; label: string; description: string; icon: string }[] = [
  { 
    value: "carrossel", 
    label: "Carrossel", 
    description: "Múltiplos slides educativos",
    icon: "Images"
  },
  { 
    value: "card", 
    label: "Card Único", 
    description: "Imagem única com copy impactante",
    icon: "Image"
  },
  { 
    value: "reels", 
    label: "Reels", 
    description: "Vídeo curto e dinâmico",
    icon: "Video"
  },
]

export const PERFIS_PERSONA: { value: PerfilPersona; label: string; description: string; color: string }[] = [
  { 
    value: "conservador", 
    label: "Conservador", 
    description: "Busca segurança e estabilidade",
    color: "blue"
  },
  { 
    value: "moderado", 
    label: "Moderado", 
    description: "Equilibra segurança e crescimento",
    color: "amber"
  },
  { 
    value: "agressivo", 
    label: "Agressivo", 
    description: "Aceita riscos por maior retorno",
    color: "red"
  },
]
