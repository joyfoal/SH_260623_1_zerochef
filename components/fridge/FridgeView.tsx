'use client'

import { useRef, useState } from 'react'
import { Plus, RefrigeratorIcon, Trash2, Camera, ImageIcon, MapPin, Loader2, Pencil, Check, X } from 'lucide-react'
import { Ingredient, FridgeSection, CustomLocation } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { IngredientItem } from './IngredientItem'
import { getSectionLabel } from '@/lib/utils'
import { analyzeFridgeImage } from '@/app/actions/fridge'

// 냉장실 칸들 (냉동실 제외)
const FRIDGE_SHELF_SECTIONS: FridgeSection[] = [
  'top-shelf', 'middle-shelf', 'bottom-shelf', 'crisper', 'door-upper', 'door-lower',
]
const SECTION_ICONS: Record<string, string> = {
  'top-shelf': '🔼', 'middle-shelf': '▪️', 'bottom-shelf': '🔽',
  'crisper': '🥦', 'door-upper': '🚪', 'door-lower': '🚪', 'freezer': '❄️',
}

// display:none이면 iOS에서 카메라가 열리지 않아 position:absolute로 숨김
const hiddenInputStyle: React.CSSProperties = {
  position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden',
  border: 'none', padding: 0, pointerEvents: 'none',
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
  onRetake: (scope: 'fridge' | 'freezer' | string, items: Ingredient[], imageUrl: string) => void
  onUpdateLocation: (id: string, patch: { name?: string; emoji?: string }) => void
  onOpenAddLocation: () => void
}

export function FridgeView({
  ingredients, customLocations, apiKey,
  onDeleteIngredient, onClearSection, onClearAll,
  onAddIngredient, onUncertainIngredient, onTapIngredient,
  onRetake, onUpdateLocation, onOpenAddLocation,
}: FridgeViewProps) {
  const [confirmClearAll, setConfirmClearAll] = useState(false)

  const confirmedIngredients = ingredients.filter(i => i.status === 'confirmed')
  const uncertainIngredients = ingredients.filter(i => i.status === 'uncertain')
  // 모든 재료(confirmed + uncertain + held) 포함해서 구역별로 표시
  const getBySection = (s: FridgeSection) => ingredients.filter(i => i.section === s)

  const fridgeCount   = FRIDGE_SHELF_SECTIONS.reduce((n, s) => n + getBySection(s).length, 0)
  const freezerCount  = getBySection('freezer').length

  const handleClearAll = () => {
    if (confirmClearAll) { onClearAll(); setConfirmClearAll(false) }
    else { setConfirmClearAll(true); setTimeout(() => setConfirmClearAll(false), 3000) }
  }

  // 냉장실 전체 비우기 (냉동실/커스텀 제외)
  const clearFridgeSections = () => {
    FRIDGE_SHELF_SECTIONS.forEach(s => onClearSection(s))
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* 통계 + 전체비우기 */}
      <div className="flex items-center gap-3 px-3 py-3 bg-zinc-900 rounded-2xl border border-zinc-800">
        <RefrigeratorIcon className="w-5 h-5 text-green-400 shrink-0" />
        <span className="text-white text-sm font-semibold">{confirmedIngredients.length}가지 재료</span>
        {(uncertainIngredients.length + ingredients.filter(i=>i.status==='held').length) > 0 && (
          <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
            ❓ {uncertainIngredients.length + ingredients.filter(i=>i.status==='held').length}개
          </span>
        )}
        {confirmedIngredients.length > 0 && (
          <button onClick={handleClearAll}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              confirmClearAll ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-red-400'
            }`}>
            <Trash2 className="w-3 h-3" />
            {confirmClearAll ? '한 번 더 누르세요' : '전체 비우기'}
          </button>
        )}
      </div>

      {/* 냉장고 본체 */}
      <div className="rounded-2xl border-4 border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden">
        {/* 냉장실 헤더 + 컨트롤 */}
        <SectionHeader
          title="냉장실" temp="2°C" emoji="🧊"
          itemCount={fridgeCount}
          scope="fridge"
          apiKey={apiKey}
          sections={FRIDGE_SHELF_SECTIONS}
          onRetake={onRetake}
          onClear={clearFridgeSections}
        />

        {/* 냉장실 칸들 (버튼 없음) */}
        <div className="divide-y divide-zinc-700/40">
          {FRIDGE_SHELF_SECTIONS.map(section => (
            <ShelfRow
              key={section}
              section={section}
              icon={SECTION_ICONS[section] ?? '📦'}
              label={getSectionLabel(section)}
              ingredients={getBySection(section)}
              onAdd={() => onAddIngredient(section)}
              onDelete={onDeleteIngredient}
              onUncertain={onUncertainIngredient}
              onTap={onTapIngredient}
            />
          ))}
        </div>

        {/* 냉동실 헤더 + 컨트롤 */}
        <SectionHeader
          title="냉동실" temp="-18°C" emoji="❄️"
          itemCount={freezerCount}
          scope="freezer"
          apiKey={apiKey}
          sections={['freezer']}
          onRetake={onRetake}
          onClear={() => onClearSection('freezer')}
        />
        <ShelfRow
          section="freezer" icon="❄️" label="냉동칸"
          ingredients={getBySection('freezer')}
          onAdd={() => onAddIngredient('freezer')}
          onDelete={onDeleteIngredient}
          onUncertain={onUncertainIngredient}
          onTap={onTapIngredient}
        />
      </div>

      {/* 커스텀 장소들 */}
      {customLocations.map(loc => (
        <CustomLocationBlock
          key={loc.id}
          location={loc}
          itemCount={getBySection(loc.id).length}
          ingredients={getBySection(loc.id)}
          apiKey={apiKey}
          onRetake={onRetake}
          onClear={() => onClearSection(loc.id)}
          onAdd={() => onAddIngredient(loc.id)}
          onDelete={onDeleteIngredient}
          onUncertain={onUncertainIngredient}
          onTap={onTapIngredient}
          onUpdateLocation={onUpdateLocation}
        />
      ))}

      {/* 장소 추가 */}
      <button onClick={onOpenAddLocation}
        className="flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-green-500/50 hover:text-green-400 transition-all active:scale-[0.98]">
        <MapPin className="w-4 h-4" />
        <span className="text-sm font-medium">장소 추가 (김치냉장고, 팬트리...)</span>
      </button>

      {/* 보류/미확인 재료 안내 (있을 때만) */}
      {(uncertainIngredients.length > 0 || ingredients.some(i => i.status === 'held')) && (
        <div className="px-3 py-2 bg-amber-950/20 border border-amber-500/20 rounded-2xl">
          <p className="text-amber-400/80 text-xs">
            ❓ 탭하면 이름을 입력하거나 빠르게 선택할 수 있어요
          </p>
        </div>
      )}
    </div>
  )
}

/* ── 냉장실/냉동실/장소 헤더 (촬영·갤러리·비우기 버튼 여기에만) ── */
interface SectionHeaderProps {
  title: string; emoji: string; temp?: string; itemCount: number
  scope: 'fridge' | 'freezer' | string
  sections: FridgeSection[]
  apiKey: string
  onRetake: (scope: 'fridge' | 'freezer' | string, items: Ingredient[], imageUrl: string) => void
  onClear: () => void
}

function SectionHeader({ title, emoji, temp, itemCount, scope, sections, apiKey, onRetake, onClear }: SectionHeaderProps) {
  const cameraRef  = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [scanning,      setScanning]      = useState(false)
  const [confirmClear,  setConfirmClear]  = useState(false)

  const handleFile = async (file: File) => {
    if (!apiKey) return
    setScanning(true)
    const imageUrl = URL.createObjectURL(file)
    try {
      const base64 = await fileToBase64(file)
      const result = await analyzeFridgeImage(base64, apiKey)
      const items  = result.map((item, idx) => ({
        ...item,
        id: `${scope}-${Date.now()}-${idx}`,
        section: sections[0] === 'freezer' ? 'freezer' : (sections[idx % sections.length] ?? sections[0]),
        status: (item.status ?? 'confirmed') as Ingredient['status'],
      } as Ingredient))
      onRetake(scope, items, imageUrl)
    } catch {
      URL.revokeObjectURL(imageUrl)
    }
    setScanning(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement | null>) => {
    const f = e.target.files?.[0]; if (f) handleFile(f)
    if (ref.current) ref.current.value = ''
  }

  const handleClear = () => {
    if (confirmClear) { onClear(); setConfirmClear(false) }
    else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 2500) }
  }

  return (
    <>
      {/* position:absolute 방식 — display:none은 iOS에서 카메라를 열지 못함 */}
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment"
        style={hiddenInputStyle} onChange={e => handleChange(e, cameraRef)} />
      <input ref={galleryRef} type="file" accept="image/*"
        style={hiddenInputStyle} onChange={e => handleChange(e, galleryRef)} />

      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-700/60">
        <span className="text-base">{emoji}</span>
        <span className="text-sm text-zinc-200 font-bold flex-1">{title}</span>
        {temp && <span className="text-xs text-zinc-400 mr-1">{temp}</span>}
        {itemCount > 0 && <span className="text-xs text-zinc-500">({itemCount})</span>}
        {scanning && <Loader2 className="w-3.5 h-3.5 text-green-400 animate-spin" />}

        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={() => cameraRef.current?.click()}
            disabled={!apiKey || scanning}
            title="카메라로 재촬영"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-600 hover:bg-green-700 text-zinc-300 hover:text-white disabled:opacity-30 transition-all active:scale-90">
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            disabled={!apiKey || scanning}
            title="앨범에서 선택"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-600 hover:bg-zinc-500 text-zinc-300 hover:text-white disabled:opacity-30 transition-all active:scale-90">
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            title="이 구역 비우기"
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 ${
              confirmClear ? 'bg-red-600 text-white' : 'bg-zinc-600 hover:bg-zinc-500 text-zinc-400 hover:text-red-400'
            }`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )
}

/* ── 개별 칸 행 (버튼 없이 재료 + 추가만) ── */
interface ShelfRowProps {
  section: FridgeSection; icon: string; label: string; hideLabel?: boolean
  ingredients: Ingredient[]
  onAdd: () => void
  onDelete: (id: string) => void
  onUncertain: (i: Ingredient) => void
  onTap: (i: Ingredient) => void
}

function ShelfRow({ section, icon, label, hideLabel, ingredients, onAdd, onDelete, onUncertain, onTap }: ShelfRowProps) {
  return (
    <div className="px-3 py-3 min-h-[56px] cursor-pointer"
      onClick={e => { if ((e.target as HTMLElement).closest('[data-no-add]')) return; onAdd() }}>
      {!hideLabel && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs">{icon}</span>
          <span className="text-zinc-500 text-xs font-medium">{label}</span>
          {ingredients.length > 0 && (
            <span className="text-zinc-700 text-[10px]">({ingredients.length})</span>
          )}
        </div>
      )}
      {ingredients.length === 0 ? (
        <div className="flex items-center gap-2 text-zinc-700 hover:text-zinc-500 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          <span className="text-xs">터치해서 재료 추가</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {ingredients.map((ing, idx) => (
            <div key={ing.id} data-no-add="true">
              <IngredientItem ingredient={ing} onDelete={onDelete}
                onUncertain={onUncertain} onTap={onTap}
                showHint={section === 'middle-shelf' && idx === 0} />
            </div>
          ))}
          <button data-no-add="true" onClick={e => { e.stopPropagation(); onAdd() }}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-dashed border-zinc-700 text-zinc-700 hover:border-green-500/50 hover:text-green-500 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── 커스텀 장소 블록 (이름/이모지 편집 포함) ── */
interface CustomLocationBlockProps {
  location: CustomLocation
  itemCount: number
  ingredients: Ingredient[]
  apiKey: string
  onRetake: (scope: string, items: Ingredient[], imageUrl: string) => void
  onClear: () => void
  onAdd: () => void
  onDelete: (id: string) => void
  onUncertain: (i: Ingredient) => void
  onTap: (i: Ingredient) => void
  onUpdateLocation: (id: string, patch: { name?: string; emoji?: string }) => void
}

const EMOJI_OPTIONS = ['🌶️','🏠','❄️','🗄️','📦','🍷','🧊','🥡','🫙','🍱','🥩','🥬']

function CustomLocationBlock({
  location, itemCount, ingredients, apiKey,
  onRetake, onClear, onAdd, onDelete, onUncertain, onTap, onUpdateLocation,
}: CustomLocationBlockProps) {
  const [editing,   setEditing]   = useState(false)
  const [editName,  setEditName]  = useState(location.name)
  const [editEmoji, setEditEmoji] = useState(location.emoji)

  const saveEdit = () => {
    if (editName.trim()) {
      onUpdateLocation(location.id, { name: editName.trim(), emoji: editEmoji })
    }
    setEditing(false)
  }

  return (
    <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-900 overflow-hidden">
      {editing ? (
        /* 인라인 편집 폼 */
        <div className="px-4 py-3 bg-zinc-700/60 flex flex-col gap-2">
          <div className="flex gap-2">
            <button onClick={() => {}}
              className="w-10 h-10 bg-zinc-800 border border-zinc-600 rounded-xl text-xl flex items-center justify-center shrink-0">
              {editEmoji}
            </button>
            <Input value={editName} onChange={e => setEditName(e.target.value)}
              className="flex-1 bg-zinc-800 border-zinc-600 text-white h-10 rounded-xl text-sm" />
            <button onClick={saveEdit}
              className="w-10 h-10 bg-green-600 hover:bg-green-500 rounded-xl flex items-center justify-center transition-all active:scale-90">
              <Check className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => setEditing(false)}
              className="w-10 h-10 bg-zinc-700 hover:bg-zinc-600 rounded-xl flex items-center justify-center transition-all active:scale-90">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
          {/* 이모지 선택 */}
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setEditEmoji(e)}
                className={`w-8 h-8 rounded-lg text-base transition-all active:scale-90 ${
                  editEmoji === e ? 'bg-green-600' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}>
                {e}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* 일반 헤더 */
        <div className="flex items-center gap-1 pl-1 pr-1">
          <div className="flex-1">
            <SectionHeader
              title={location.name} emoji={location.emoji}
              itemCount={itemCount} scope={location.id}
              apiKey={apiKey} sections={[location.id]}
              onRetake={onRetake} onClear={onClear}
            />
          </div>
          <button onClick={() => { setEditName(location.name); setEditEmoji(location.emoji); setEditing(true) }}
            className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors mr-1 shrink-0">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <ShelfRow
        section={location.id} icon={location.emoji} label={location.name}
        ingredients={ingredients}
        onAdd={onAdd} onDelete={onDelete}
        onUncertain={onUncertain} onTap={onTap}
        hideLabel
      />
    </div>
  )
}

// Canvas로 리사이즈 + JPEG 변환 (HEIC 등 모든 포맷 처리, 크기 축소)
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      const MAX = 1600
      let { width, height } = img
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.88).split(',')[1])
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      const reader = new FileReader()
      reader.onload  = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    }

    img.src = objectUrl
  })
}
