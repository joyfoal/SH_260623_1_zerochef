export type BuiltinSection =
  | 'top-shelf'
  | 'middle-shelf'
  | 'bottom-shelf'
  | 'crisper'
  | 'door-upper'
  | 'door-lower'
  | 'freezer'

// custom-{id} 형태로 커스텀 장소 지원
export type FridgeSection = BuiltinSection | string

export type IngredientStatus = 'confirmed' | 'uncertain' | 'held'

export interface Ingredient {
  id: string
  name: string
  emoji: string
  section: FridgeSection
  confidence: number
  expiryDate?: string
  quantity?: string
  status: IngredientStatus
  isBasicSeasoning?: boolean
}

export interface CustomLocation {
  id: string         // e.g. "custom-1234"
  name: string       // e.g. "김치냉장고"
  emoji: string
}

export interface Recipe {
  id: string
  name: string
  emoji: string
  cookTime: number
  difficulty: 'easy' | 'medium'
  matchRate: number
  availableIngredients: string[]
  missingIngredients: string[]
  steps: string[]
  tags: string[]
  calories?: number
  youtubeQuery?: string  // YouTube 검색어
  naverQuery?: string    // 네이버 레시피 검색어
}

export type FilterType = 'all' | '5min' | '10min' | 'high-match' | 'expiring'
