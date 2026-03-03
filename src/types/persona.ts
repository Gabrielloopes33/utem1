export type PersonaProfile = 'conservador' | 'moderado' | 'agressivo';

export interface Persona {
  id: string;
  org_id: string;
  created_by: string;
  name: string;
  avatar_url?: string;
  profile_type: PersonaProfile;
  age_range?: string;
  income_range?: string;
  patrimony_range?: string;
  objectives: string[];
  fears: string[];
  interests: string[];
  communication_tone?: string;
  preferred_channels: Record<string, number>;
  conversion_triggers: string[];
  content_preferences?: Record<string, any>;
  ai_response?: string;
  created_at: string;
  updated_at: string;
}

export const PERSONA_PROFILE_LABELS: Record<PersonaProfile, { label: string; color: string; description: string }> = {
  conservador: {
    label: 'Conservador',
    color: 'bg-blue-500',
    description: 'Prioriza segurança e preservação de capital',
  },
  moderado: {
    label: 'Moderado',
    color: 'bg-yellow-500',
    description: 'Busca balanceamento entre segurança e crescimento',
  },
  agressivo: {
    label: 'Agressivo',
    color: 'bg-red-500',
    description: 'Busca alta rentabilidade, aceita maior risco',
  },
};

// Templates de personas para facilitar criação
export const PERSONA_TEMPLATES: Record<PersonaProfile, Partial<Persona>> = {
  conservador: {
    age_range: '45-60 anos',
    income_range: 'R$ 10K-30K/mês',
    patrimony_range: 'R$ 50K-200K',
    objectives: ['Preservar capital', 'Renda extra', 'Aposentadoria segura'],
    fears: ['Perder dinheiro', 'Inflação comer poupança', 'Falta de liquidez'],
    interests: ['Renda Fixa', 'CDB', 'Tesouro Direto', 'Fundos Conservadores'],
    communication_tone: 'Formal, seguro, baseado em dados históricos',
    preferred_channels: { Instagram: 70, YouTube: 60, Email: 40 },
    conversion_triggers: ['Garantias', 'Certificações', 'Cases conservadores', 'Tempo no mercado'],
  },
  moderado: {
    age_range: '30-45 anos',
    income_range: 'R$ 15K-40K/mês',
    patrimony_range: 'R$ 200K-1M',
    objectives: ['Crescimento moderado', 'Diversificação', 'Independência financeira'],
    fears: ['Volatilidade excessiva', 'Concentração de risco', 'Falta de diversificação'],
    interests: ['Fundos Multimercado', 'FII', 'Ações de boas empresas', 'RF'],
    communication_tone: 'Equilibrado, educativo, exemplos práticos',
    preferred_channels: { Instagram: 85, YouTube: 70, LinkedIn: 50 },
    conversion_triggers: ['Diversificação inteligente', 'Cases de sucesso', 'Educação financeira'],
  },
  agressivo: {
    age_range: '25-40 anos',
    income_range: 'R$ 20K-50K/mês',
    patrimony_range: 'R$ 500K+',
    objectives: ['Alta rentabilidade', 'Multiplicar patrimônio', 'Independência precoce'],
    fears: ['Perder oportunidades', 'Retornos baixos', 'Ficar para trás'],
    interests: ['Ações', 'Criptomoedas', 'Venture Capital', 'Day Trade', 'Opções'],
    communication_tone: 'Direto, ambicioso, focado em resultados',
    preferred_channels: { Instagram: 90, Twitter: 80, YouTube: 75 },
    conversion_triggers: ['Alto retorno', 'Inovação', 'Exclusividade', 'Network'],
  },
};
