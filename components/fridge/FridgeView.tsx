'use client'

import { useRef, useState } from 'react'
import { Plus, RefrigeratorIcon, Trash2, Camera, ImageIcon, MapPin } from 'lucide-react'
import { Ingredient, FridgeSection, CustomLocation } from '@/lib/types'
import { IngredientItem } from './IngredientItem'
import { getSectionLabel } from '@/lib/utils'
import { analyzeFridgeImage } from '@/app/actions/fridge'
import { MOCK_INGREDIENTS } from '@/lib/mock-data'

const BUILTIN_SECTIONS: FridgeSection[] = [
  'top-shelf', 'middle-shelf', 'bottom-shelf', 'crisper',
  'door-upper', 'door-lower', 'freezer',
]

const SECTION_ICONS: Record<string, string> = {
  'top-shelf': '🔼', 'middle-shelf': '▪️', 'bottom-shelf': '🔽',
  'crisper': '🥦', 'door-upper': '🚪', 'door-lower': '🚪', 'freezer': '❄️',
}

interface FridgeViewProps {
  ingredients: Ingredient[]
  customLocations: CustomLocation[]
  apiKey: string
  onDeleteIngredient: (id: string) => void
  onClearSection: (section: FridgeSection) => void
  onClearAll: () => void
  onAddIngredient: (section: FridgeSection) => void
  onUncertainIngredient: (ingredient: Ingredient) => void
  onTapIngredient: (ingredient: Ingredient) => void
  onAddSectionIngredients: (section: FridgeSection, ingredients: Ingredient[]) => void
  onOpenAddLocation: () => void
}

export function FridgeView({
  ingredients, customLocations, apiKey,
  onDeleteIngredient, onClearSection, onClearAll,
  onAddIngredient, onUncertainIngredient, onTapIngredient,
  onAddSectionIngredients, onOpenAddLocation,
}: FridgeViewProps) {
  const [confirmClearAll, setConfirmClearAll] = useState(false)

  const confirmedIngredients = ingredients.filter(i => i.status === 'confirmed')
  const uncertainIngredients = ingredients.filter(i => i.status === 'uncertain')

  const getBySection = (section: FridgeSection) =>
    confirmedIngredients.filter(i => i.section === section)

  const handleClearAll = () => {
    if (confirmClearAll) { onClearAll(); setConfirmClearAll(false) }
    else { setConfirmClearAll(true); setTimeout(() => setConfirmClearAll(false), 3000) }
  }

  const allSections: { section: FridgeSection; label: string; icon: string; isCustom: boolean }[] = [
    ...BUILTIN_SECTIONS.filter(s => s !== 'freezer').map(s => ({
      section: s, label: getSectionLabel(s), icon: SECTION_ICONS[s] ?? '📦', isCustom: false,
    })),
    ...customLocations.map(loc => ({
      section: loc.id, label: loc.name, icon: loc.emoji, isCustom: true,
    })),
  ]

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Stats bar */}
      <div className="flex items-center gap-3 px-3 py-3 bg-zinc-900 rounded-2xl border border-zinc-800">
        <RefrigeratorIcon className="w-5 h-5 text-green-400 shrink-0" />
        <span className="text-white text-sm font-semibold">{confirmedIngredients.length}가지 재료</span>
        {uncertainIngredients.length > 0 && (
          <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
            ❓ {uncertainIngredients.length}개
          </span>
        )}
        {confirmedIngredients.length > 0 && (
          <button onClick={handleClearAll}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              confirmClearAll ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-red-400'
            }`}>
            <Trash2 className="w-3 h-3" />
            {confirmClearAll ? '한 번 더 누르세요' : '전체 비우기'}
          </button>
        )}
      </div>

      <p className="text-center text-zinc-600 text-xs">← 스와이프 삭제  ·  탭으로 상세 보기  ·  📷 구역별 재촬영</p>

      {/* 냉장고 본체 */}
      <div className="rounded-2xl border-4 border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden fridge-glow">
        <div className="bg-zinc-700/80 px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm text-zinc-200 font-bold">냉장실</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.8)]" />
            <span className="text-xs text-zinc-400">2°C</span>
          </div>
        </div>

        <div className="divide-y divide-zinc-700/50">
          {allSections.map(({ section, label, icon, isCustom }) => (
            <FridgeSectionRow
              key={section}
              section={section}
              label={label}
              icon={icon}
              isCustom={isCustom}
              ingredients={getBySection(section)}
              apiKey={apiKey}
              onDelete={onDeleteIngredient}
              onClearSection={onClearSection}
              onAdd={() => onAddIngredient(section)}
              onUncertain={onUncertainIngredient}
              onTap={onTapIngredient}
              onAddIngredients={items => onAddSectionIngredients(section, items)}
            />
          ))}
        </div>

        {/* 냉동실 */}
        <div className="bg-zinc-700 px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm text-zinc-200 font-bold">❄️ 냉동실</span>
          <span className="text-xs text-zinc-400">-18°C</span>
        </div>
        <FridgeSectionRow
          section="freezer" label="냉동칸" icon="❄️" isCustom={false}
          ingredients={getBySection('freezer')} apiKey={apiKey}
          onDelete={onDeleteIngredient} onClearSection={onClearSection}
          onAdd={() => onAddIngredient('freezer')}
          onUncertain={onUncertainIngredient} onTap={onTapIngredient}
          onAddIngredients={items => onAddSectionIngredients('freezer', items)}
        />
      </div>

      {/* + 장소 추가 버튼 */}
      <button onClick={onOpenAddLocation}
        className="flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-green-500/50 hover:text-green-400 transition-all active:scale-[0.98]">
        <MapPin className="w-4 h-4" />
        <span className="text-sm font-medium">장소 추가 (김치냉장고, 팬트리...)</span>
      </button>

      {/* 불확실 재료 */}
      {uncertainIngredients.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
          <p className="text-amber-400 text-sm font-semibold mb-2.5">❓ 확인이 필요한 재료</p>
          <div className="flex flex-wrap gap-2">
            {uncertainIngredients.map(ing => (
              <button key={ing.id} onClick={() => onUncertainIngredient(ing)}
                className="flex items-center gap-2 px-3 py-2 bg-amber-900/40 border border-amber-500/40 rounded-xl text-amber-200 hover:bg-amber-900/60 active:scale-95 transition-all">
                <span className="text-base">{ing.emoji}</span>
                <span className="text-sm">확인하기</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 구역 행 컴포넌트 ── */
interface SectionRowProps {
  section: FridgeSection
  label: string
  icon: string
  isCustom: boolean
  ingredients: Ingredient[]
  apiKey: string
  onDelete: (id: string) => void
  onClearSection: (s: FridgeSection) => void
  onAdd: () => void
  onUncertain: (i: Ingredient) => void
  onTap: (i: Ingredient) => void
  onAddIngredients: (items: Ingredient[]) => void
}

function FridgeSectionRow({
  section, label, icon, isCustom, ingredients, apiKey,
  onDelete, onClearSection, onAdd, onUncertain, onTap, onAddIngredients,
}: SectionRowProps) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [scanning, setScanning] = useState(false)

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirmClear) { onClearSection(section); setConfirmClear(false) }
    else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 2500) }
  }

  const handleRetake = async (file: File) => {
    setScanning(true)
    let items: Ingredient[] = []
    if (apiKey) {
      try {
        const base64 = await new Promise<string>((res, rej) => {
          const r = new FileReader(); r.onload = () => res((r.result as string).split(',')[1])
          r.onerror = rej; r.readAsDataURL(file)
        })
        const result = await analyzeFridgeImage(base64, apiKey)
        items = result.map((item, idx) => ({
          ...item, id: `${section}-${Date.now()}-${idx}`, section,
          status: (item.status ?? 'confirmed') as Ingredient['status'],
        } as Ingredient))
      } catch {}
    } else {
      await new Promise(r => setTimeout(r, 1000))
      items = MOCK_INGREDIENTS.slice(0, 3).map((ing, idx) => ({
        ...ing, id: `${section}-${Date.now()}-${idx}`, section,
      }))
    }
    onAddIngredients(items)
    setScanning(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) handleRetake(f); e.target.value = ''
  }

  return (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="px-3 py-3 min-h-[64px] cursor-pointer group"
        onClick={e => {
          if ((e.target as HTMLElement).closest('[data-no-add]')) return
          onAdd()
        }}
      >
        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className="text-zinc-400 text-xs font-semibold tracking-wide">{label}</span>
            {ingredients.length > 0 && (
              <span className="text-zinc-600 text-[10px]">({ingredients.length})</span>
            )}
            {scanning && (
              <span className="text-green-400 text-[10px] animate-pulse">스캔 중...</span>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-1" data-no-add="true" onClick={e => e.stopPropagation()}>
            {/* 재촬영 드롭다운 */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => cameraRef.current?.click()}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-green-700 text-zinc-400 hover:text-white transition-all"
                title="카메라로 재촬영">
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => galleryRef.current?.click()}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white transition-all"
                title="앨범에서 재촬영">
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            {ingredients.length > 0 && (
              <button onClick={handleClear}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  confirmClear ? 'bg-red-600 text-white' : 'text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100'
                }`}>
                <Trash2 className="w-3 h-3" />
                {confirmClear ? '확인' : '비우기'}
              </button>
            )}
          </div>
        </div>

        {/* 재료 목록 */}
        {ingredients.length === 0 ? (
          <div className="flex items-center gap-2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm">터치해서 재료 추가</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing, idx) => (
              <div key={ing.id} data-no-add="true">
                <IngredientItem ingredient={ing} onDelete={onDelete}
                  onUncertain={onUncertain} onTap={onTap}
                  showHint={section === 'middle-shelf' && idx === 0} />
              </div>
            ))}
            <button data-no-add="true" onClick={e => { e.stopPropagation(); onAdd() }}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-dashed border-zinc-600 text-zinc-600 hover:border-green-500/50 hover:text-green-500 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
