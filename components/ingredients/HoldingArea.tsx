'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Check, Trash2, Eraser } from 'lucide-react'
import { Ingredient } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface HoldingAreaProps {
  ingredients: Ingredient[]
  onConfirm: (id: string, name: string) => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

export function HoldingArea({ ingredients, onConfirm, onDelete, onClearAll }: HoldingAreaProps) {
  const [confirmClear, setConfirmClear] = useState(false)

  const handleClearAll = () => {
    if (confirmClear) { onClearAll(); setConfirmClear(false) }
    else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000) }
  }

  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-zinc-600" />
        </div>
        <p className="text-zinc-500 font-medium">보류함이 비어있어요</p>
        <p className="text-zinc-600 text-sm mt-1">불확실한 재료를 퀵 패스하면 여기 모여요</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* 헤더 + 비우기 버튼 */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-lg">❓</span>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">보류함</p>
          <p className="text-zinc-500 text-xs">{ingredients.length}개의 재료가 확인을 기다려요</p>
        </div>
        <button onClick={handleClearAll}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
            confirmClear
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-zinc-500 hover:text-red-400 border border-zinc-700'
          }`}>
          <Eraser className="w-3.5 h-3.5" />
          {confirmClear ? '한 번 더 누르세요' : '보류함 비우기'}
        </button>
      </div>

      {ingredients.map((ing, idx) => (
        <motion.div
          key={ing.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.08 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-2xl border-2 border-zinc-700">
              {ing.emoji}
            </div>
            <div className="flex-1">
              <p className="text-zinc-400 text-xs mb-0.5">AI 인식 확률</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-zinc-700 rounded-full">
                  <div className="h-1.5 bg-amber-500 rounded-full"
                    style={{ width: `${ing.confidence * 100}%` }} />
                </div>
                <span className="text-amber-400 text-xs font-bold">{Math.round(ing.confidence * 100)}%</span>
              </div>
            </div>
          </div>

          <p className="text-zinc-500 text-xs mb-3">이 재료가 무엇인지 알려주세요</p>

          <div className="flex gap-2">
            {['두부', '소스', '나물', '기타'].map(name => (
              <button key={name} onClick={() => onConfirm(ing.id, name)}
                className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all active:scale-95">
                {name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <Button onClick={() => onConfirm(ing.id, '기타 재료')} size="sm"
              className="flex-1 bg-green-900/50 hover:bg-green-800/60 text-green-400 border border-green-800 h-8 text-xs gap-1"
              variant="outline">
              <Check className="w-3 h-3" />기타로 확인
            </Button>
            <Button onClick={() => onDelete(ing.id)} size="sm" variant="outline"
              className="border-red-900/50 text-red-400 hover:bg-red-950/30 h-8 text-xs gap-1">
              <Trash2 className="w-3 h-3" />삭제
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
