export type FridgeSection =
  | 'top-shelf'
  | 'middle-shelf'
  | 'bottom-shelf'
  | 'crisper'
  | 'door-upper'
  | 'door-lower'
  | 'freezer'

export type IngredientStatus = 'confirmed' | 'uncertain' | 'held'

export interface Ingredient {
  id: string
  name: string
  emoji: string
  section: FridgeSection
  confidence: number
  expiryDate?: string // ISO string
  quantity?: string
  status: IngredientStatus
  isBasicSeasoning?: boolean
}

export interface Recipe {
  id: string
  name: string
  emoji: string
  cookTime: number // minutes
  difficulty: 'easy' | 'medium'
  matchRate: number // 0-100
  availableIngredients: string[]
  missingIngredients: string[]
  steps: string[]
  tags: string[]
  calories?: number
}

export type FilterType = 'all' | '5min' | '10min' | 'high-match' | 'expiring'
