'use client'

import { useState } from 'react'
import { Plus, RefrigeratorIcon } from 'lucide-react'
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
  onAddIngredient: (section: FridgeSection) => void
  onUncertainIngredient: (ingredient: Ingredient) => void
  onTapIngredient: (ingredient: Ingredient) => void
}

export function FridgeView({
  ingredients,
  onDeleteIngredient,
  onAddIngredient,
  onUncertainIngredient,
  onTapIngredient,
}: FridgeViewProps) {
  const [firstItem] = useState(true)

  const confirmedIngredients = ingredients.filter(i => i.status === 'confirmed')
  const uncertainIngredients = ingredients.filter(i => i.status === 'uncertain')

  const bySection = SECTION_ORDER.reduce((acc, section) => {
    acc[section] = confirmedIngredients.filter(i => i.section === section)
    return acc
  }, {} as Record<FridgeSection, Ingredient[]>)

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Stats bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
        <RefrigeratorIcon className="w-4 h-4 text-green-400" />
        <span className="text-white text-sm font-medium">{confirmedIngredients.length}가지 재료</span>
        {uncertainIngredients.length > 0 && (
          <span className="ml-auto text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
            ❓ {uncertainIngredients.length}개 확인 필요
          </span>
        )}
      </div>

      {/* Swipe hint */}
      <p className="text-center text-zinc-600 text-xs">← 스와이프로 삭제 · 빈 공간 터치로 추가</p>

      {/* Fridge body */}
      <div className="relative rounded-2xl border-4 border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden fridge-glow">
        {/* Fridge top bar */}
        <div className="bg-zinc-700/80 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-semibold tracking-wide">냉장실</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.8)]" />
            <span className="text-[10px] text-zinc-400">2°C</span>
          </div>
        </div>

        {/* Sections */}
        <div className="divide-y divide-zinc-700/50">
          {SECTION_ORDER.filter(s => s !== 'freezer').map(section => (
            <FridgeSectionView
              key={section}
              section={section}
              ingredients={bySection[section]}
              onDelete={onDeleteIngredient}
              onAdd={() => onAddIngredient(section)}
              onUncertain={onUncertainIngredient}
              onTap={onTapIngredient}
              showHint={firstItem && section === 'middle-shelf' && bySection[section].length > 0}
            />
          ))}
        </div>

        {/* Freezer divider */}
        <div className="bg-zinc-700 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-semibold tracking-wide">❄️ 냉동실</span>
          <div className="flex gap-1">
            <span className="text-[10px] text-zinc-400">-18°C</span>
          </div>
        </div>
        <FridgeSectionView
          section="freezer"
          ingredients={bySection['freezer']}
          onDelete={onDeleteIngredient}
          onAdd={() => onAddIngredient('freezer')}
          onUncertain={onUncertainIngredient}
          onTap={onTapIngredient}
          showHint={false}
        />
      </div>

      {/* Uncertain items row */}
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
  onAdd: () => void
  onUncertain: (ingredient: Ingredient) => void
  onTap: (ingredient: Ingredient) => void
  showHint: boolean
}

function FridgeSectionView({ section, ingredients, onDelete, onAdd, onUncertain, onTap, showHint }: SectionProps) {
  return (
    <div
      className="px-3 py-2.5 min-h-[60px] cursor-pointer group"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-ingredient]')) return
        onAdd()
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px]">{SECTION_ICONS[section]}</span>
        <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
          {getSectionLabel(section)}
        </span>
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
