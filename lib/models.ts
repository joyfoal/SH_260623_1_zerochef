export interface ModelInfo {
  id: string
  name: string
  provider: string
  providerEmoji: string
  hasVision: boolean   // 이미지 분석 지원 여부
  badge?: string
  color: string        // tailwind bg class for badge
}

export const OPENROUTER_MODELS: ModelInfo[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerEmoji: '🤖',
    hasVision: true,
    badge: '추천',
    color: 'bg-green-600',
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    providerEmoji: '💎',
    hasVision: true,
    badge: '강력',
    color: 'bg-blue-600',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    providerEmoji: '⚡',
    hasVision: true,
    badge: '빠름',
    color: 'bg-yellow-600',
  },
  {
    id: 'anthropic/claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    providerEmoji: '🔮',
    hasVision: true,
    color: 'bg-purple-600',
  },
  {
    id: 'anthropic/claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    providerEmoji: '🌸',
    hasVision: true,
    badge: '저렴',
    color: 'bg-pink-600',
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    providerEmoji: '🦙',
    hasVision: false,
    badge: '무료',
    color: 'bg-orange-600',
  },
]

export const DEFAULT_MODEL_ID = 'openai/gpt-4o'
export const MODEL_STORAGE_KEY = 'selected_model'

export function getModelById(id: string): ModelInfo {
  return OPENROUTER_MODELS.find(m => m.id === id) ?? OPENROUTER_MODELS[0]
}
