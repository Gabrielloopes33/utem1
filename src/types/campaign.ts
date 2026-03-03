export type CampaignObjective = 'conversao' | 'atracao' | 'nutricao';
export type CampaignFormat = 'lancamento' | 'perpetuo' | 'interna';
export type ContentType = 'tecnico' | 'emocional' | 'objecao' | 'autoridade' | 'social';
export type FormatType = 'carrossel' | 'card' | 'reels';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface Campaign {
  id: string;
  org_id: string;
  created_by: string;
  name: string;
  objective: CampaignObjective;
  format: CampaignFormat;
  content_types: ContentType[];
  formats: FormatType[];
  start_date: string;
  end_date?: string;
  status: CampaignStatus;
  ai_response?: string;
  metrics?: CampaignMetrics;
  created_at: string;
  updated_at: string;
}

export interface CampaignMetrics {
  posts_generated?: number;
  posts_published?: number;
  engagement_rate?: number;
  reach?: number;
  conversions?: number;
}

export const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  conversao: 'Conversão',
  atracao: 'Atração',
  nutricao: 'Nutrição',
};

export const FORMAT_LABELS: Record<CampaignFormat, string> = {
  lancamento: 'Lançamento',
  perpetuo: 'Perpétuo',
  interna: 'Campanha Interna',
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  tecnico: 'Técnico',
  emocional: 'Conexão Emocional',
  objecao: 'Quebra de Objeção',
  autoridade: 'Reforço de Autoridade',
  social: 'Prova Social',
};

export const FORMAT_TYPE_LABELS: Record<FormatType, string> = {
  carrossel: 'Carrossel',
  card: 'Card Único',
  reels: 'Roteiro para Reels',
};

export const STATUS_LABELS: Record<CampaignStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-gray-500' },
  active: { label: 'Ativa', color: 'bg-green-500' },
  paused: { label: 'Pausada', color: 'bg-yellow-500' },
  completed: { label: 'Concluída', color: 'bg-blue-500' },
  archived: { label: 'Arquivada', color: 'bg-gray-400' },
};
