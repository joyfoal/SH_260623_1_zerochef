'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { Sparkles, X, Loader2, RefreshCw } from 'lucide-react'
import { Ingredient, FilterType, Recipe } from '@/lib/types'
import { getDaysUntilExpiry } from '@/lib/utils'
import { ExpiringBanner } from './ExpiringBanner'
import { FilterBar } from './FilterBar'
import { RecipeCard } from './RecipeCard'
import { MOCK_RECIPES } from '@/lib/mock-data'
import { getRecipeRecommendations } from '@/app/actions/fridge'

interface RecipeListProps {
  ingredients: Ingredient[]
  apiKey: string
  hasKey?: boolean
  filterIngredient?: string | null
  onClearIngredientFilter?: () => void
}

export function RecipeList({ ingredients, apiKey, hasKey, filterIngredient, onClearIngredientFilter }: RecipeListProps) {
  const [filter,      setFilter]      = useState<FilterType>('all')
  const [aiRecipes,   setAiRecipes]   = useState<Recipe[] | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const lastFilterRef = useRef<string | null | undefined>(undefined)

  const expiringIngredients = ingredients.filter(i => {
    const days = getDaysUntilExpiry(i.expiryDate)
    return days !== null && days <= 1 && i.status === 'confirmed' && !i.isBasicSeasoning
  })
  const expiringNames = new Set(expiringIngredients.map(i => i.name))

  // filterIngredient가 바뀌면 자동으로 AI 호출
  useEffect(() => {
    if (filterIngredient && filterIngredient !== lastFilterRef.current) {
      lastFilterRef.current = filterIngredient
      fetchAiRecipes(filterIngredient)
    }
  }, [filterIngredient])

  const canUseAi = hasKey ?? !!apiKey

  const fetchAiRecipes = async (target?: string) => {
    if (!canUseAi || loading) return
    setLoading(true); setError(null); setAiRecipes(null)
    try {
      const names = ingredients
        .filter(i => i.status === 'confirmed' && !i.isBasicSeasoning)
        .map(i => i.name)
      const result = await getRecipeRecommendations(names, apiKey, target)
      setAiRecipes(result as Recipe[])
    } catch (e: any) {
      setError(e?.message?.includes('401')
        ? 'API 키를 확인해주세요'
        : 'AI 레시피 추천에 실패했어요. 다시 시도해주세요.')
    }
    setLoading(false)
  }

  // 표시할 레시피 목록
  const baseRecipes = aiRecipes ?? MOCK_RECIPES

  const filtered = useMemo(() => {
    let list = [...baseRecipes]
    if (filterIngredient && !aiRecipes) {
      list = list.filter(r =>
        r.availableIngredients.includes(filterIngredient) ||
        r.missingIngredients.includes(filterIngredient)
      )
    }
    switch (filter) {
      case 'high-match': list = list.sort((a, b) => b.matchRate - a.matchRate); break
      case '5min':       list = list.filter(r => r.cookTime <= 5).sort((a, b) => b.matchRate - a.matchRate); break
      case '10min':      list = list.filter(r => r.cookTime <= 10).sort((a, b) => b.matchRate - a.matchRate); break
      case 'expiring':
        list = list.filter(r => r.availableIngredients.some(i => expiringNames.has(i)))
          .sort((a, b) => b.matchRate - a.matchRate); break
      default: list = list.sort((a, b) => b.matchRate - a.matchRate)
    }
    return list
  }, [filter, filterIngredient, expiringNames, baseRecipes, aiRecipes])

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
            className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 헤더 + AI 버튼 */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-green-400" />
        <h2 className="text-white font-bold text-sm">
          {aiRecipes ? 'AI 추천 레시피' : '추천 레시피'}
        </h2>
        {aiRecipes && (
          <span className="text-xs text-green-400 bg-green-950/40 px-2 py-0.5 rounded-full">AI</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {aiRecipes && (
            <button onClick={() => { setAiRecipes(null); lastFilterRef.current = undefined }}
              className="text-zinc-600 hover:text-zinc-400 text-xs flex items-center gap-1">
              <X className="w-3 h-3" />기본으로
            </button>
          )}
          <button
            onClick={() => fetchAiRecipes(filterIngredient ?? undefined)}
            disabled={!canUseAi || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all active:scale-95">
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />분석 중</>
              : <><RefreshCw className="w-3.5 h-3.5" />AI 추천</>
            }
          </button>
        </div>
      </div>

      {/* 오류 */}
      {error && (
        <div className="px-3 py-2.5 bg-red-950/40 border border-red-800/40 rounded-xl">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      )}

      {!loading && (
        <>
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
              {filtered.map((recipe, idx) => (
                <RecipeCard key={recipe.id ?? idx} recipe={recipe} index={idx} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
