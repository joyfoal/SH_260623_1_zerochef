'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Ingredient } from '@/lib/types'
import { getDaysUntilExpiry, getExpiryLabel } from '@/lib/utils'

interface ExpiringBannerProps {
  ingredients: Ingredient[]
  onFilterByExpiring: () => void
}

export function ExpiringBanner({ ingredients, onFilterByExpiring }: ExpiringBannerProps) {
  const expiring = ingredients.filter(i => {
    const days = getDaysUntilExpiry(i.expiryDate)
    return days !== null && days <= 1 && i.status === 'confirmed' && !i.isBasicSeasoning
  })

  if (expiring.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-500/40 bg-gradient-to-r from-red-950/60 to-orange-950/60 p-3.5 cursor-pointer active:scale-[0.99] transition-transform"
      onClick={onFilterByExpiring}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 font-bold text-sm">오늘 써야 해요!</span>
        </div>
        <span className="ml-auto text-red-400/70 text-xs flex items-center gap-0.5">
          이 재료로 레시피 보기 <ChevronRight className="w-3 h-3" />
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {expiring.map(ing => {
          const days = getDaysUntilExpiry(ing.expiryDate)
          return (
            <div
              key={ing.id}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-950/60 border border-red-500/30 rounded-lg"
            >
              <span className="text-base">{ing.emoji}</span>
              <div>
                <p className="text-white text-xs font-medium leading-tight">{ing.name}</p>
                {ing.quantity && <p className="text-red-400/70 text-[10px] leading-tight">{ing.quantity}</p>}
              </div>
              <span className="ml-1 text-[10px] font-bold text-red-400 bg-red-500/20 px-1 py-0.5 rounded">
                {getExpiryLabel(days)}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
