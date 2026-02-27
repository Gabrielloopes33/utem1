export type Provider = "anthropic" | "openai"

export interface ModelOption {
  id: string
  name: string
  provider: Provider
  maxTokens: number
}

export const MODELS: Record<Provider, ModelOption[]> = {
  anthropic: [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic", maxTokens: 8192 },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", provider: "anthropic", maxTokens: 8192 },
  ],
  openai: [
    { id: "gpt-4o", name: "GPT-4o", provider: "openai", maxTokens: 16384 },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", maxTokens: 16384 },
  ],
}

export const ALL_MODELS = Object.values(MODELS).flat()

export function getModelName(modelId: string): string {
  const model = ALL_MODELS.find((m) => m.id === modelId)
  return model?.name ?? modelId
}
