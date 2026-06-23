'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, HelpCircle } from 'lucide-react'
import { Ingredient } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { COMMON_INGREDIENTS } from '@/lib/mock-data'

interface UncertainItemPopupProps {
  ingredient: Ingredient | null
  onConfirm: (id: string, correctedName: string) => void
  onHold: (id: string) => void
  onClose: () => void
}

const QUICK_GUESSES = ['두부', '소스', '밑반찬', '음료', '묵', '젓갈', '장아찌', '나물']

export function UncertainItemPopup({ ingredient, onConfirm, onHold, onClose }: UncertainItemPopupProps) {
  if (!ingredient) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-zinc-900 border border-amber-500/40 rounded-2xl p-5 w-full max-w-sm shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-semibold">이게 뭔지 잘 모르겠어요</span>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom-in object view */}
          <div className="relative w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-amber-500/40 bg-zinc-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className="text-5xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {ingredient.emoji}
              </motion.span>
            </div>
            <div className="absolute inset-0 ring-2 ring-amber-400/60 ring-inset rounded-xl" />
            <div className="absolute bottom-1 right-1 text-[10px] text-amber-400 font-bold bg-black/50 px-1 rounded">
              {Math.round(ingredient.confidence * 100)}%
            </div>
          </div>

          <p className="text-center text-zinc-300 text-sm mb-4">
            이 재료가 무엇인지 확인해 주세요
          </p>

          {/* Quick guesses */}
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {QUICK_GUESSES.map(guess => (
              <button
                key={guess}
                onClick={() => onConfirm(ingredient.id, guess)}
                className="py-1.5 px-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs text-center transition-all active:scale-95"
              >
                {guess}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => onHold(ingredient.id)}
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-xs h-10 gap-1.5"
            >
              😮‍💨 귀찮아요 (퀵 패스)
            </Button>
            <Button
              onClick={() => onConfirm(ingredient.id, '기타 재료')}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs h-10 gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              기타로 추가
            </Button>
          </div>

          <p className="text-center text-zinc-600 text-[10px] mt-2">
            퀵 패스 시 ❓ 보류함으로 이동해요
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
