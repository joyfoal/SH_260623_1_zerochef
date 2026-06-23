'use client'

import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Ingredient, Recipe, FilterType } from '@/lib/types'
import { getDaysUntilExpiry } from '@/lib/utils'
import { ExpiringBanner } from './ExpiringBanner'
import { FilterBar } from './FilterBar'
import { RecipeCard } from './RecipeCard'
import { MOCK_RECIPES } from '@/lib/mock-data'

interface RecipeListProps {
  ingredients: Ingredient[]
}

export function RecipeList({ ingredients }: RecipeListProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const expiringIngredients = ingredients.filter(i => {
    const days = getDaysUntilExpiry(i.expiryDate)
    return days !== null && days <= 1 && i.status === 'confirmed' && !i.isBasicSeasoning
  })

  const expiringNames = new Set(expiringIngredients.map(i => i.name))

  // Boost match rate for recipes using expiring ingredients
  const recipes = useMemo<Recipe[]>(() => {
    return MOCK_RECIPES.map(recipe => {
      const usesExpiring = recipe.availableIngredients.some(i => expiringNames.has(i))
      return usesExpiring ? { ...recipe, _expiryBoost: true } as Recipe & { _expiryBoost?: boolean } : recipe
    })
  }, [expiringNames])

  const filtered = useMemo(() => {
    let list = [...recipes]

    switch (filter) {
      case 'high-match':
        list = list.sort((a, b) => b.matchRate - a.matchRate)
        break
      case '5min':
        list = list.filter(r => r.cookTime <= 5).sort((a, b) => b.matchRate - a.matchRate)
        break
      case '10min':
        list = list.filter(r => r.cookTime <= 10).sort((a, b) => b.matchRate - a.matchRate)
        break
      case 'expiring':
        list = list
          .filter(r => r.availableIngredients.some(i => expiringNames.has(i)))
          .sort((a, b) => b.matchRate - a.matchRate)
        break
      default:
        list = list.sort((a, b) => b.matchRate - a.matchRate)
    }

    return list
  }, [filter, recipes, expiringNames])

  return (
    <div className="flex flex-col gap-4">
      {/* Expiring banner — always at top */}
      <ExpiringBanner
        ingredients={ingredients}
        onFilterByExpiring={() => setFilter('expiring')}
      />

      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-green-400" />
        <h2 className="text-white font-bold text-sm">오늘의 추천 레시피</h2>
        <span className="ml-auto text-zinc-500 text-xs">기본 양념 제외</span>
      </div>

      {/* Filters */}
      <FilterBar
        active={filter}
        onChange={setFilter}
        expiringCount={expiringIngredients.length}
      />

      {/* Recipe cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-zinc-500">해당 조건의 레시피가 없어요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((recipe, idx) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={idx} />
          ))}
        </div>
      )}
    </div>
  )
}
