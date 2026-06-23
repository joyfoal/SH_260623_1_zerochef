'use client'

import { useState } from 'react'
import { Plus, RefrigeratorIcon, Trash2, AlertCircle } from 'lucide-react'
import { Ingredient, FridgeSection } from '@/lib/types'
import { IngredientItem } from './IngredientItem'
import { getSectionLabel } from '@/lib/utils'

const SECTION_ORDER: FridgeSection[] = [
  'top-shelf',
  'middle-shelf',
  'bottom-shelf',
  'crisper',
  'door-upper',
  'door-lower',
  'freezer',
]

const SECTION_ICONS: Record<FridgeSection, string> = {
  'top-shelf': '🔼',
  'middle-shelf': '▪️',
  'bottom-shelf': '🔽',
  'crisper': '🥦',
  'door-upper': '🚪',
  'door-lower': '🚪',
  'freezer': '❄️',
}

interface FridgeViewProps {
  ingredients: Ingredient[]
  onDeleteIngredient: (id: string) => void
  onClearSection: (section: FridgeSection) => void
  onClearAll: () => void
  onAddIngredient: (section: FridgeSection) => void
  onUncertainIngredient: (ingredient: Ingredient) => void
  onTapIngredient: (ingredient: Ingredient) => void
}

export function FridgeView({
  ingredients,
  onDeleteIngredient,
  onClearSection,
  onClearAll,
  onAddIngredient,
  onUncertainIngredient,
  onTapIngredient,
}: FridgeViewProps) {
  const [confirmClearAll, setConfirmClearAll] = useState(false)

  const confirmedIngredients = ingredients.filter(i => i.status === 'confirmed')
  const uncertainIngredients = ingredients.filter(i => i.status === 'uncertain')

  const bySection = SECTION_ORDER.reduce((acc, section) => {
    acc[section] = confirmedIngredients.filter(i => i.section === section)
    return acc
  }, {} as Record<FridgeSection, Ingredient[]>)

  const handleClearAll = () => {
    if (confirmClearAll) {
      onClearAll()
      setConfirmClearAll(false)
    } else {
      setConfirmClearAll(true)
      setTimeout(() => setConfirmClearAll(false), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Stats bar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
        <RefrigeratorIcon className="w-4 h-4 text-green-400 shrink-0" />
        <span className="text-white text-sm font-medium">{confirmedIngredients.length}가지 재료</span>
        {uncertainIngredients.length > 0 && (
          <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
            ❓ {uncertainIngredients.length}개 확인 필요
          </span>
        )}
        {confirmedIngredients.length > 0 && (
          <button
            onClick={handleClearAll}
            className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              confirmClearAll
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-zinc-700'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            {confirmClearAll ? '한 번 더 누르면 전체 삭제' : '전체 비우기'}
          </button>
        )}
      </div>

      {/* Swipe hint */}
      <p className="text-center text-zinc-600 text-xs">← 스와이프 삭제 · 터치로 상세 보기 · 빈 칸 터치로 추가</p>

      {/* Fridge body */}
      <div className="relative rounded-2xl border-4 border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden fridge-glow">
        {/* 냉장실 헤더 */}
        <div className="bg-zinc-700/80 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-semibold tracking-wide">냉장실</span>
          <div className="flex gap-1 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.8)]" />
            <span className="text-[10px] text-zinc-400">2°C</span>
          </div>
        </div>

        <div className="divide-y divide-zinc-700/50">
          {SECTION_ORDER.filter(s => s !== 'freezer').map(section => (
            <FridgeSectionView
              key={section}
              section={section}
              ingredients={bySection[section]}
              onDelete={onDeleteIngredient}
              onClearSection={onClearSection}
              onAdd={() => onAddIngredient(section)}
              onUncertain={onUncertainIngredient}
              onTap={onTapIngredient}
              showHint={section === 'middle-shelf' && bySection[section].length > 0}
            />
          ))}
        </div>

        {/* 냉동실 헤더 */}
        <div className="bg-zinc-700 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-semibold tracking-wide">❄️ 냉동실</span>
          <span className="text-[10px] text-zinc-400">-18°C</span>
        </div>
        <FridgeSectionView
          section="freezer"
          ingredients={bySection['freezer']}
          onDelete={onDeleteIngredient}
          onClearSection={onClearSection}
          onAdd={() => onAddIngredient('freezer')}
          onUncertain={onUncertainIngredient}
          onTap={onTapIngredient}
          showHint={false}
        />
      </div>

      {/* 불확실 재료 */}
      {uncertainIngredients.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
          <p className="text-amber-400 text-xs font-semibold mb-2">❓ 확인이 필요한 재료</p>
          <div className="flex flex-wrap gap-2">
            {uncertainIngredients.map(ing => (
              <button
                key={ing.id}
                onClick={() => onUncertainIngredient(ing)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-900/40 border border-amber-500/40 rounded-lg text-sm text-amber-200 hover:bg-amber-900/60 transition-colors"
              >
                <span>{ing.emoji}</span>
                <span className="text-xs">확인하기</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface SectionProps {
  section: FridgeSection
  ingredients: Ingredient[]
  onDelete: (id: string) => void
  onClearSection: (section: FridgeSection) => void
  onAdd: () => void
  onUncertain: (ingredient: Ingredient) => void
  onTap: (ingredient: Ingredient) => void
  showHint: boolean
}

function FridgeSectionView({
  section, ingredients, onDelete, onClearSection, onAdd, onUncertain, onTap, showHint,
}: SectionProps) {
  const [confirmClear, setConfirmClear] = useState(false)

  const handleClearSection = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirmClear) {
      onClearSection(section)
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 2500)
    }
  }

  return (
    <div
      className="px-3 py-2.5 min-h-[60px] cursor-pointer group"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-ingredient]')) return
        if ((e.target as HTMLElement).closest('[data-action]')) return
        onAdd()
      }}
    >
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">{SECTION_ICONS[section]}</span>
          <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
            {getSectionLabel(section)}
          </span>
          {ingredients.length > 0 && (
            <span className="text-zinc-600 text-[10px]">({ingredients.length})</span>
          )}
        </div>

        {/* 구역 전체 삭제 버튼 */}
        {ingredients.length > 0 && (
          <button
            data-action="true"
            onClick={handleClearSection}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
              confirmClear
                ? 'bg-red-600/80 text-white'
                : 'text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Trash2 className="w-2.5 h-2.5" />
            {confirmClear ? '확인' : '비우기'}
          </button>
        )}
      </div>

      {ingredients.length === 0 ? (
        <div className="flex items-center gap-2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          <span className="text-xs">터치해서 재료 추가</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {ingredients.map((ing, idx) => (
            <div key={ing.id} data-ingredient="true">
              <IngredientItem
                ingredient={ing}
                onDelete={onDelete}
                onUncertain={onUncertain}
                onTap={onTap}
                showHint={showHint && idx === 0}
              />
            </div>
          ))}
          <button
            data-action="true"
            onClick={(e) => { e.stopPropagation(); onAdd() }}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-dashed border-zinc-600 text-zinc-600 hover:border-green-500/50 hover:text-green-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
