import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"

export function getLanguageModel(provider: string, model: string) {
  switch (provider) {
    case "openai":
      return openai(model)
    case "anthropic":
    default:
      return anthropic(model)
  }
}
