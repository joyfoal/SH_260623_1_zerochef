'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronDown, ChevronUp, CheckCircle2, XCircle, PlayCircle, Globe } from 'lucide-react'
import { Recipe } from '@/lib/types'
import { getMatchRateBadgeColor } from '@/lib/utils'

interface RecipeCardProps {
  recipe: Recipe
  index: number
}

export function RecipeCard({ recipe, index }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false)
  const badgeColor = getMatchRateBadgeColor(recipe.matchRate)

  const ytUrl    = `https://www.youtube.com/results?search_query=${encodeURIComponent((recipe.youtubeQuery ?? recipe.name) + ' 레시피 만들기')}`
  const naverUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent((recipe.naverQuery ?? recipe.name) + ' 레시피')}`
  const recipeUrl = `https://www.10000recipe.com/recipe/list.html?q=${encodeURIComponent(recipe.name)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
    >
      {/* 카드 헤더 */}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-2xl shrink-0">
            {recipe.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-sm truncate">{recipe.name}</h3>
              <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full badge-pop ${badgeColor}`}>
                {recipe.matchRate}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-zinc-500 text-xs">
                <Clock className="w-3 h-3" /><span>{recipe.cookTime}분</span>
              </div>
              <span className="text-zinc-500 text-xs">
                {recipe.difficulty === 'easy' ? '⭐ 쉬움' : '⭐⭐ 보통'}
              </span>
              {recipe.calories && <span className="text-zinc-500 text-xs">{recipe.calories}kcal</span>}
            </div>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {recipe.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded-md">{tag}</span>
              ))}
            </div>
          </div>
          <div className="text-zinc-600 shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* 일치율 바 */}
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-1 rounded-full ${
                  recipe.matchRate >= 90 ? 'bg-emerald-500' :
                  recipe.matchRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${recipe.matchRate}%` }}
                transition={{ delay: index * 0.06 + 0.2, duration: 0.5 }}
              />
            </div>
            <span className="text-zinc-500 text-[10px]">보유 일치율</span>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-green-400/80 text-[10px]">{recipe.availableIngredients.length}가지 보유</span>
            </div>
            {recipe.missingIngredients.length > 0 && (
              <div className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-zinc-600" />
                <span className="text-zinc-500 text-[10px]">{recipe.missingIngredients.join(', ')} 부족</span>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* 펼쳐진 내용 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-zinc-800 pt-3 flex flex-col gap-4">
              {/* 재료 */}
              <div>
                <p className="text-zinc-400 text-xs font-medium mb-2">재료</p>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.availableIngredients.map(ing => (
                    <span key={ing} className="text-[11px] px-2 py-1 bg-green-950/60 text-green-400 border border-green-800/50 rounded-full">
                      ✓ {ing}
                    </span>
                  ))}
                  {recipe.missingIngredients.map(ing => (
                    <span key={ing} className="text-[11px] px-2 py-1 bg-zinc-800 text-zinc-500 border border-zinc-700 rounded-full line-through">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* 조리 방법 */}
              <div>
                <p className="text-zinc-400 text-xs font-medium mb-2">조리 방법</p>
                <ol className="flex flex-col gap-2">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] text-zinc-400 font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 text-xs leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 추가 재료 팁 */}
              {recipe.additionalTips && recipe.additionalTips.length > 0 && (
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3">
                  <p className="text-amber-400 text-xs font-semibold mb-2">✨ 이것만 추가하면 더 맛있어요</p>
                  <ul className="flex flex-col gap-1.5">
                    {recipe.additionalTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 text-[10px] mt-0.5 shrink-0">+</span>
                        <span className="text-amber-200/80 text-xs leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 참고 링크 */}
              <div>
                <p className="text-zinc-400 text-xs font-medium mb-2">참고 사이트</p>
                <div className="flex gap-2">
                  <a href={ytUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-950/60 text-xs font-semibold transition-all active:scale-95">
                    <PlayCircle className="w-4 h-4" />YouTube
                  </a>
                  <a href={naverUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-950/40 border border-green-800/40 text-green-400 hover:bg-green-950/60 text-xs font-semibold transition-all active:scale-95">
                    <Globe className="w-4 h-4" />네이버
                  </a>
                  <a href={recipeUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-950/40 border border-orange-800/40 text-orange-400 hover:bg-orange-950/60 text-xs font-semibold transition-all active:scale-95">
                    <Globe className="w-4 h-4" />만개레시피
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
