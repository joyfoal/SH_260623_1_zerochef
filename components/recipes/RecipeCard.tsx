'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react'
import { Recipe } from '@/lib/types'
import { getMatchRateBadgeColor } from '@/lib/utils'

interface RecipeCardProps {
  recipe: Recipe
  index: number
}

export function RecipeCard({ recipe, index }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false)
  const badgeColor = getMatchRateBadgeColor(recipe.matchRate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          {/* Emoji */}
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-2xl shrink-0">
            {recipe.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-sm truncate">{recipe.name}</h3>
              <span
                className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full badge-pop ${badgeColor}`}
              >
                {recipe.matchRate}%
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-zinc-500 text-xs">
                <Clock className="w-3 h-3" />
                <span>{recipe.cookTime}분</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-500 text-xs">
                <span>
                  {recipe.difficulty === 'easy' ? '⭐ 쉬움' : '⭐⭐ 보통'}
                </span>
              </div>
              {recipe.calories && (
                <span className="text-zinc-500 text-xs">{recipe.calories}kcal</span>
              )}
            </div>

            {/* Tags */}
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {recipe.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Expand icon */}
          <div className="text-zinc-600 shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* Ingredient bars */}
        <div className="mt-3">
          {/* Match rate bar */}
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

          {/* Available & missing summary */}
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

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-zinc-800 pt-3">
              {/* Ingredients */}
              <div className="mb-3">
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

              {/* Steps */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
