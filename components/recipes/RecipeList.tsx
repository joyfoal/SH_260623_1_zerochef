'use client'

import { useMemo, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { Ingredient, FilterType } from '@/lib/types'
import { getDaysUntilExpiry } from '@/lib/utils'
import { ExpiringBanner } from './ExpiringBanner'
import { FilterBar } from './FilterBar'
import { RecipeCard } from './RecipeCard'
import { MOCK_RECIPES } from '@/lib/mock-data'

interface RecipeListProps {
  ingredients: Ingredient[]
  filterIngredient?: string | null   // 재료로 레시피 찾기
  onClearIngredientFilter?: () => void
}

export function RecipeList({ ingredients, filterIngredient, onClearIngredientFilter }: RecipeListProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const expiringIngredients = ingredients.filter(i => {
    const days = getDaysUntilExpiry(i.expiryDate)
    return days !== null && days <= 1 && i.status === 'confirmed' && !i.isBasicSeasoning
  })
  const expiringNames = new Set(expiringIngredients.map(i => i.name))

  const filtered = useMemo(() => {
    let list = [...MOCK_RECIPES]

    // 특정 재료 필터
    if (filterIngredient) {
      list = list.filter(r =>
        r.availableIngredients.includes(filterIngredient) ||
        r.missingIngredients.includes(filterIngredient)
      )
    }

    switch (filter) {
      case 'high-match': list = list.sort((a, b) => b.matchRate - a.matchRate); break
      case '5min':  list = list.filter(r => r.cookTime <= 5).sort((a, b) => b.matchRate - a.matchRate); break
      case '10min': list = list.filter(r => r.cookTime <= 10).sort((a, b) => b.matchRate - a.matchRate); break
      case 'expiring':
        list = list.filter(r => r.availableIngredients.some(i => expiringNames.has(i)))
          .sort((a, b) => b.matchRate - a.matchRate); break
      default: list = list.sort((a, b) => b.matchRate - a.matchRate)
    }
    return list
  }, [filter, filterIngredient, expiringNames])

  return (
    <div className="flex flex-col gap-3">
      <ExpiringBanner ingredients={ingredients} onFilterByExpiring={() => setFilter('expiring')} />

      {/* 재료 필터 배지 */}
      {filterIngredient && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-green-950/40 border border-green-800/50 rounded-2xl">
          <span className="text-green-400 text-sm font-medium flex-1">
            🔍 <span className="font-bold">{filterIngredient}</span> 포함 레시피
          </span>
          <button onClick={onClearIngredientFilter}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-green-400" />
        <h2 className="text-white font-bold text-sm">추천 레시피</h2>
        <span className="ml-auto text-zinc-500 text-xs">기본 양념 제외</span>
      </div>

      <FilterBar active={filter} onChange={setFilter} expiringCount={expiringIngredients.length} />

      {filtered.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-zinc-500 text-sm">해당 조건의 레시피가 없어요</p>
          {filterIngredient && (
            <button onClick={onClearIngredientFilter} className="mt-3 text-green-400 text-sm underline">
              필터 해제하기
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((recipe, idx) => <RecipeCard key={recipe.id} recipe={recipe} index={idx} />)}
        </div>
      )}
    </div>
  )
}
