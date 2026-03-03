export interface CompetitorAnalysis {
  handle: string;
  name: string;
  platform: string;
  profile_url?: string;
  
  // Métricas principais
  followers_count: number;
  following_count?: number;
  posts_count?: number;
  engagement_rate: number;
  posts_per_month: number;
  avg_reach: number;
  
  // Crescimento
  growth_90d: {
    followers_change: number;
    followers_change_pct: number;
    engagement_trend: 'up' | 'down' | 'stable';
  };
  
  // Análise de conteúdo
  content_breakdown: {
    carrossel: number;
    reels: number;
    card: number;
  };
  content_performance: {
    carrossel_avg: number;
    reels_avg: number;
    card_avg: number;
  };
  
  // Top posts
  top_posts: CompetitorPost[];
  
  // IA Analysis
  ai_insights: string[];
  recommendations: string[];
  
  // Metadata
  analyzed_at: string;
  cached?: boolean;
}

export interface CompetitorPost {
  id: string;
  caption: string;
  likes: number;
  comments: number;
  reach?: number;
  engagement_rate?: number;
  media_type: 'carousel' | 'reel' | 'image';
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
  // Análise da IA
  topic?: string;
  why_it_worked?: string;
}

// Lista de concorrentes pré-configurados
export const DEFAULT_COMPETITORS = [
  {
    handle: 'xpinvestimentos',
    name: 'XP Investimentos',
    platform: 'instagram',
    profile_url: 'https://instagram.com/xpinvestimentos',
  },
  {
    handle: 'raulsena',
    name: 'Raul Sena',
    platform: 'instagram',
    profile_url: 'https://instagram.com/raulsena',
  },
  {
    handle: 'primorico',
    name: 'Primo Rico',
    platform: 'instagram',
    profile_url: 'https://instagram.com/primorico',
  },
  {
    handle: 'gemeosdasfinancas',
    name: 'Gêmeos das Finanças',
    platform: 'instagram',
    profile_url: 'https://instagram.com/gemeosdasfinancas',
  },
] as const;

export type DefaultCompetitorHandle = typeof DEFAULT_COMPETITORS[number]['handle'];
