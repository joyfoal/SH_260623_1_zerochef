'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { Trash2, AlertTriangle } from 'lucide-react'
import { Ingredient } from '@/lib/types'
import { getDaysUntilExpiry, getExpiryLabel } from '@/lib/utils'

interface IngredientItemProps {
  ingredient: Ingredient
  onDelete: (id: string) => void
  onTap?: (ingredient: Ingredient) => void
  onUncertain?: (ingredient: Ingredient) => void
  showHint?: boolean
}

const SWIPE_THRESHOLD = -72

export function IngredientItem({ ingredient, onDelete, onTap, onUncertain, showHint }: IngredientItemProps) {
  const [deleted, setDeleted] = useState(false)
  const controls = useAnimation()
  const x = useMotionValue(0)
  const scale = useTransform(x, [-120, 0], [0.95, 1])

  const days = getDaysUntilExpiry(ingredient.expiryDate)
  const isCritical = days !== null && days <= 1
  const isWarning = days !== null && days <= 3 && days > 1

  const handleDragEnd = async () => {
    const currentX = x.get()
    if (currentX < SWIPE_THRESHOLD) {
      await controls.start({ x: -400, opacity: 0, transition: { duration: 0.22 } })
      setDeleted(true)
      onDelete(ingredient.id)
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } })
    }
  }

  // Framer Motion's onTap only fires when drag distance is negligible — safe to use alongside drag
  const handleTap = () => {
    if (ingredient.status === 'uncertain') {
      onUncertain?.(ingredient)
    } else {
      onTap?.(ingredient)
    }
  }

  if (deleted) return null

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete background */}
      <motion.div
        className="absolute inset-0 bg-red-500/20 flex items-center justify-end pr-4 rounded-lg"
        style={{ opacity: useTransform(x, [-120, -30], [1, 0]) }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <Trash2 className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-[10px] font-medium">삭제</span>
        </div>
      </motion.div>

      {/* Ingredient chip */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        style={{ x, scale }}
        animate={controls}
        whileTap={{ scale: 0.96 }}
        className={`relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer select-none ${
          isCritical
            ? 'bg-red-950/60 border border-red-500/40'
            : isWarning
            ? 'bg-amber-950/60 border border-amber-500/30'
            : 'bg-zinc-800/80 border border-zinc-700/50'
        } ${showHint ? 'swipe-hint' : ''}`}
      >
        <span className="text-base leading-none">{ingredient.emoji}</span>
        <div className="flex flex-col min-w-0">
          <span className="text-white text-xs font-medium leading-tight truncate">{ingredient.name}</span>
          {ingredient.quantity && (
            <span className="text-zinc-500 text-[10px] leading-tight">{ingredient.quantity}</span>
          )}
        </div>
        {days !== null && (
          <span
            className={`ml-auto text-[10px] font-bold shrink-0 px-1 py-0.5 rounded ${
              isCritical ? 'bg-red-500 text-white' : isWarning ? 'bg-amber-500 text-white' : 'text-zinc-500'
            }`}
          >
            {getExpiryLabel(days)}
          </span>
        )}
        {ingredient.status === 'uncertain' && (
          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
        )}
      </motion.div>
    </div>
  )
}
