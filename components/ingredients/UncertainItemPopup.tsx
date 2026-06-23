'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, HelpCircle } from 'lucide-react'
import { Ingredient } from '@/lib/types'
import { Input } from '@/components/ui/input'

interface UncertainItemPopupProps {
  ingredient: Ingredient | null
  onConfirm: (id: string, correctedName: string) => void
  onHold: (id: string) => void
  onClose: () => void
}

const QUICK_GUESSES = ['두부', '소스', '밑반찬', '음료', '묵', '젓갈', '장아찌', '나물',
  '김치', '된장', '고추장', '떡', '라면', '멸치', '참기름', '기타']

export function UncertainItemPopup({ ingredient, onConfirm, onHold, onClose }: UncertainItemPopupProps) {
  const [customName, setCustomName] = useState('')

  const handleConfirm = (name: string) => {
    const n = name.trim()
    if (!n) return
    onConfirm(ingredient!.id, n)
    setCustomName('')
  }

  if (!ingredient) return null

  const isHeld = ingredient.status === 'held'

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
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-semibold">
                {isHeld ? '보류 재료 — 이름을 입력해주세요' : '이게 뭔지 잘 모르겠어요'}
              </span>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 이모지 미리보기 */}
          <div className="relative w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-amber-500/40 bg-zinc-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span className="text-4xl"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}>
                {ingredient.emoji}
              </motion.span>
            </div>
            <div className="absolute inset-0 ring-2 ring-amber-400/60 ring-inset rounded-xl" />
          </div>

          {/* 직접 입력 */}
          <div className="flex gap-2 mb-3">
            <Input
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirm(customName)}
              placeholder="이름을 직접 입력하세요..."
              className="flex-1 bg-zinc-800 border-zinc-700 text-white h-11 rounded-xl text-sm"
              autoFocus
            />
            <button
              onClick={() => handleConfirm(customName)}
              disabled={!customName.trim()}
              className="w-11 h-11 bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all active:scale-90">
              <Check className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* 빠른 선택 */}
          <p className="text-zinc-600 text-[10px] mb-2">또는 아래에서 선택</p>
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {QUICK_GUESSES.map(guess => (
              <button key={guess}
                onClick={() => handleConfirm(guess)}
                className="py-1.5 px-1 rounded-lg bg-zinc-800 hover:bg-green-900/60 hover:border-green-500/40 border border-transparent text-zinc-300 hover:text-green-300 text-xs text-center transition-all active:scale-95">
                {guess}
              </button>
            ))}
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-2">
            {!isHeld && (
              <button
                onClick={() => onHold(ingredient.id)}
                className="flex-1 h-10 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-xs transition-all active:scale-95">
                😮‍💨 나중에
              </button>
            )}
            <button
              onClick={() => handleConfirm(customName || '기타 재료')}
              className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all active:scale-95">
              <Check className="w-3.5 h-3.5 inline mr-1" />
              {customName.trim() ? `"${customName}" 로 추가` : '기타로 추가'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
