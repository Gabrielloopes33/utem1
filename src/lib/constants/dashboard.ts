// Constantes do Dashboard - dados mockados estaticamente definidos
// para evitar recriação em cada render

/**
 * Dados de crescimento dos últimos 30 dias (Gráfico 1)
 * Valores percentuais de crescimento simulados
 */
export const GROWTH_DATA_30_DAYS = [40, 55, 45, 70, 65, 80, 75, 90, 85, 95]

/**
 * Dados de alcance dos últimos 30 dias (Gráfico 2)
 * Valores percentuais de alcance simulados
 */
export const REACH_DATA_30_DAYS = [30, 40, 35, 50, 60, 55, 70, 65, 80, 85]

/**
 * Configurações de UI do dashboard
 */
export const DASHBOARD_CONFIG = {
  /** Número de posts a exibir na lista de destaque */
  TOP_POSTS_LIMIT: 10,
  /** Número de imagens com prioridade de carregamento (LCP) */
  PRIORITY_IMAGES_COUNT: 3,
  /** Altura máxima do container de posts */
  POSTS_CONTAINER_MAX_HEIGHT: 'calc(100vh - 280px)',
} as const

/**
 * Cores de gradiente por tipo de conteúdo
 */
export const CONTENT_TYPE_COLORS: Record<string, string> = {
  Carrossel: 'from-blue-400 to-blue-600',
  Reels: 'from-purple-400 to-pink-500',
  Imagem: 'from-green-400 to-emerald-600',
  Vídeo: 'from-orange-400 to-red-500',
  Card: 'from-gray-400 to-gray-600',
} as const
