/**
 * Cliente N8N para comunicação com os agentes
 * Todos os agentes rodam no n8n - não há processamento direto no frontend
 */

const N8N_BASE_URL = 'https://flow.agenciatouch.com.br/webhook';

// Endpoints dos agentes (ATUALIZADOS - workflows ativos no n8n)
const AGENT_ENDPOINTS = {
  generalista: '97ab2e1b-12f4-4a2d-b087-be15edfaf000',
  campanhas: 'agente-campanhas',
  personas: 'agente-personas',
  concorrentes: 'agente-concorrentes',
  gerarPost: 'agente-gerar-post',
} as const;

// Tipos de payload
export interface AgenteGeneralistaPayload {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userId: string;
}

export interface AgenteCampanhasPayload {
  nome: string;
  objetivo: 'conversao' | 'atracao' | 'nutricao';
  formato: 'lancamento' | 'perpetuo' | 'interna';
  tiposConteudo: Array<'tecnico' | 'emocional' | 'objecao' | 'autoridade' | 'social'>;
  formatos: Array<'carrossel' | 'card' | 'reels'>;
  periodo: {
    inicio: string;
    fim: string;
  };
  persona?: string;
}

export interface AgentePersonasPayload {
  acao: 'criar' | 'analisar' | 'sugerir-conteudo';
  nome: string;
  perfil: 'conservador' | 'moderado' | 'agressivo';
  dados?: {
    idade?: number;
    renda?: string;
    patrimonio?: string;
    objetivos?: string[];
    medos?: string[];
  };
  objetivo?: string;
}

export interface AgenteConcorrentesPayload {
  concorrente: string;
  handle: string;
}

export interface AgenteGerarPostPayload {
  tema: string;
  tipoConteudo: 'tecnico' | 'emocional' | 'objecao' | 'autoridade' | 'social';
  formato: 'carrossel' | 'card' | 'reels';
  persona: string;
  perfilPersona: 'conservador' | 'moderado' | 'agressivo';
  campanha?: string;
  referencias?: string;
}

/**
 * Função base para chamar qualquer agente
 */
async function callAgent<TPayload, TResponse>(
  endpoint: string,
  payload: TPayload,
  timeout: number = 30000
): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${N8N_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro ao chamar agente: ${response.status} ${response.statusText}`);
    }

    // Alguns agentes retornam text, outros json
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text() as TResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido. O agente está demorando muito para responder.');
    }
    
    throw error;
  }
}

/**
 * Agente Generalista - Planejamento de conteúdo
 * 
 * ONDE ATUA:
 * - Dashboard Home (chat de ideias)
 * - Menu Agentes > Ideias de Conteúdo
 * 
 * PAYLOAD ESPERADO:
 * {
 *   message: "Quero ideias sobre Fundos Imobiliários",
 *   history: [{role: "user", content: "..."}],
 *   userId: "uuid"
 * }
 * 
 * RESPOSTA: Texto com ideias de conteúdo formatado
 */
export async function agenteGeneralista(
  payload: AgenteGeneralistaPayload
): Promise<string> {
  return callAgent<AgenteGeneralistaPayload, string>(
    AGENT_ENDPOINTS.generalista,
    payload,
    30000 // 30s timeout
  );
}

/**
 * Agente Campanhas - Criar e estruturar campanhas
 * 
 * ONDE ATUA:
 * - Tela Campanhas > Botão "Nova Campanha"
 * - Cria calendário de conteúdo, sugere temas, define estratégia
 * 
 * PAYLOAD ESPERADO:
 * {
 *   nome: "Lançamento FII",
 *   objetivo: "conversao",
 *   formato: "lancamento",
 *   tiposConteudo: ["tecnico", "emocional"],
 *   formatos: ["carrossel", "reels"],
 *   periodo: { inicio: "2026-03-01", fim: "2026-03-15" },
 *   persona: "Investidor Moderado" (opcional)
 * }
 * 
 * RESPOSTA: Texto com calendário completo, sugestões de posts, métricas esperadas
 */
export async function agenteCampanhas(
  payload: AgenteCampanhasPayload
): Promise<string> {
  return callAgent<AgenteCampanhasPayload, string>(
    AGENT_ENDPOINTS.campanhas,
    payload,
    30000
  );
}

/**
 * Agente Personas - Criar e analisar personas de investidores
 * 
 * ONDE ATUA:
 * - Tela Personas > Botão "Nova Persona"
 * - Sugere conteúdo para persona específica
 * 
 * PAYLOAD ESPERADO:
 * {
 *   acao: "criar",
 *   nome: "Fernanda",
 *   perfil: "moderado",
 *   dados: { idade: 35, renda: "R$ 15K", patrimonio: "R$ 200K" }
 * }
 * 
 * RESPOSTA: Texto com perfil completo da persona
 */
export async function agentePersonas(
  payload: AgentePersonasPayload
): Promise<string> {
  return callAgent<AgentePersonasPayload, string>(
    AGENT_ENDPOINTS.personas,
    payload,
    30000
  );
}

/**
 * Agente Concorrentes - Análise de concorrentes (usa Apify)
 * 
 * ONDE ATUA:
 * - Tela Análise de Concorrentes > Seletor (XP, Raul Sena, Primo Rico, Gêmeos)
 * - Dashboard > Métricas Instagram (com @autem.inv)
 * 
 * PAYLOAD ESPERADO:
 * {
 *   concorrente: "XP Investimentos",
 *   handle: "xpinvestimentos"
 * }
 * 
 * RESPOSTA: JSON com métricas, top posts, insights da IA, recomendações
 */
export async function agenteConcorrentes(
  payload: AgenteConcorrentesPayload
): Promise<{
  analise: string;
  metricas: {
    seguidores: number;
    taxaEngajamento: string;
    postsAnalisados: number;
  };
  topPosts: Array<{
    caption: string;
    likes: number;
    comments: number;
    type: string;
  }>;
}> {
  return callAgent<AgenteConcorrentesPayload, any>(
    AGENT_ENDPOINTS.concorrentes,
    payload,
    60000 // 60s timeout (Apify pode demorar)
  );
}

/**
 * Agente Gerar Post - Criar posts prontos para Instagram
 * 
 * ONDE ATUA:
 * - Tela Campanhas > Botão "Gerar Post" em cada campanha
 * - Tela Personas > Botão "Gerar Conteúdo" na modal de detalhes
 * 
 * PAYLOAD ESPERADO:
 * {
 *   tema: "FII vs Tesouro Selic",
 *   tipoConteudo: "tecnico",
 *   formato: "carrossel",
 *   persona: "Investidor Conservador",
 *   perfilPersona: "conservador",
 *   campanha: "Educação Financeira",
 *   referencias: "Material sobre RF" (opcional)
 * }
 * 
 * RESPOSTA: JSON com post completo formatado
 */
export async function agenteGerarPost(
  payload: AgenteGerarPostPayload
): Promise<{
  post: string;
  metadata: {
    tipo: string;
    formato: string;
    tema: string;
  };
}> {
  return callAgent<AgenteGerarPostPayload, any>(
    AGENT_ENDPOINTS.gerarPost,
    payload,
    30000
  );
}

// Export endpoints for direct use if needed
export { AGENT_ENDPOINTS };
