export const FRONTEND_AGENT_NAMES = [
  "Estrategista",
  "Copywriter Estrategico",
  "Revisor de Tom",
  "Content Strategist",
  "Script Master",
] as const

export type FrontendAgentName = (typeof FRONTEND_AGENT_NAMES)[number]

export const FRONTEND_AGENT_CATALOG: Record<
  FrontendAgentName,
  {
    role: string
    accent: string
    starters: string[]
  }
> = {
  Estrategista: {
    role: "Estrategia",
    accent: "#2563EB",
    starters: [
      "Monte um calendario editorial semanal alinhado a uma oferta de consultoria em IA.",
      "Crie um briefing para o Copywriter de uma campanha de captacao para publico frio.",
      "Analise este angulo: 'FAZER IA nao e o mesmo que VENDER IA'. Como transformar isso em pauta?",
    ],
  },
  "Copywriter Estrategico": {
    role: "Copy",
    accent: "#D97706",
    starters: [
      "Escreva 3 headlines para uma landing page de consultoria em IA para empresas.",
      "Crie um email de aquecimento para leads mornos com CTA para agendar uma call.",
      "Otimize esta promessa para soar mais premium e menos generica.",
    ],
  },
  "Revisor de Tom": {
    role: "QA Editorial",
    accent: "#7C3AED",
    starters: [
      "Revise este texto e diga se ele soa alinhado com uma marca premium de IA aplicada a negocio.",
      "Aponte onde esta copy ficou generica, professoral ou hypeada demais.",
      "Me devolva um antes/depois com ajustes cirurgicos neste post.",
    ],
  },
  "Content Strategist": {
    role: "Planejamento",
    accent: "#059669",
    starters: [
      "Planeje um calendario quinzenal para Instagram e LinkedIn com foco em autoridade e conversao.",
      "Defina pilares editoriais para uma marca que vende implementacao de IA para empresas.",
      "Distribua este tema em 5 formatos diferentes sem repetir o mesmo angulo.",
    ],
  },
  "Script Master": {
    role: "Roteiro",
    accent: "#DC2626",
    starters: [
      "Crie um roteiro de reel de 30s com hook forte sobre a diferenca entre fazer IA e vender IA.",
      "Transforme este argumento em um roteiro de video de 8 minutos para YouTube.",
      "Escreva um roteiro curto com CTA para agendar uma consultoria.",
    ],
  },
}

export function isFrontendAgentName(name: string): name is FrontendAgentName {
  return FRONTEND_AGENT_NAMES.includes(name as FrontendAgentName)
}

export function sortFrontendAgents<T extends { name: string }>(agents: T[]) {
  return [...agents].sort((a, b) => {
    const aIndex = FRONTEND_AGENT_NAMES.indexOf(a.name as FrontendAgentName)
    const bIndex = FRONTEND_AGENT_NAMES.indexOf(b.name as FrontendAgentName)

    if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1

    return aIndex - bIndex
  })
}

