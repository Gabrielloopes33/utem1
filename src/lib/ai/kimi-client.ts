import OpenAI from 'openai';

// Kimi API is OpenAI-compatible
export const kimi = new OpenAI({
  apiKey: process.env.KIMI_API_KEY || '',
  baseURL: 'https://api.moonshot.cn/v1',
});

// Model configurations
export const KIMI_MODELS = {
  CHAT: 'moonshot-v1-8k',        // For chat/assistant
  CHAT_LONG: 'moonshot-v1-32k',  // For longer contexts
  EMBEDDING: 'text-embedding-v1', // For embeddings (if available)
};
