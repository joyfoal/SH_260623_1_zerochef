'use client'

import { useState, useEffect } from 'react'
import { RefrigeratorIcon, ChefHat, Package, Settings } from 'lucide-react'
import { Ingredient, FridgeSection, CustomLocation } from '@/lib/types'
import { useApiKeys } from '@/hooks/useApiKeys'
import { useIngredients } from '@/hooks/useIngredients'
import { useCustomLocations } from '@/hooks/useCustomLocations'
import { useModel } from '@/hooks/useModel'
import { getModelById } from '@/lib/models'
import { getEnvKeyStatus } from '@/app/actions/fridge'
import { PhotoUpload } from '@/components/upload/PhotoUpload'
import { FridgeView } from '@/components/fridge/FridgeView'
import { AddLocationModal } from '@/components/fridge/AddLocationModal'
import { AddIngredientModal } from '@/components/ingredients/AddIngredientModal'
import { UncertainItemPopup } from '@/components/ingredients/UncertainItemPopup'
import { IngredientDetailSheet } from '@/components/ingredients/IngredientDetailSheet'
import { HoldingArea } from '@/components/ingredients/HoldingArea'
import { RecipeList } from '@/components/recipes/RecipeList'
import { SettingsSheet } from '@/components/settings/SettingsSheet'

// 냉장실 칸들 (섹션 이미지 key 용도)
const FRIDGE_SCOPE_KEY  = 'fridge'
const FREEZER_SCOPE_KEY = 'freezer'

type Tab = 'fridge' | 'recipes' | 'holding'
let nextId = 1000

export default function Home() {
  const { keys, activeKey, activeId, loaded: keysLoaded, addKey, removeKey, activateKey, clearAll: clearKeys } = useApiKeys()
  const { ingredients, setAll, update, clearSection, clearAll: clearIngredients, initialized } = useIngredients()
  const { locations, addLocation, updateLocation, removeLocation, clearAll: clearLocations } = useCustomLocations()
  const { modelId, setModelId } = useModel()

  // 비전 미지원 모델이면 이미지 분석엔 GPT-4o fallback
  const visionModelId = getModelById(modelId).hasVision ? modelId : 'openai/gpt-4o'

  const [tab,              setTab]              = useState<Tab>('fridge')
  const [addModalSection,  setAddModalSection]  = useState<FridgeSection | null>(null)
  const [uncertainPopup,   setUncertainPopup]   = useState<Ingredient | null>(null)
  const [detailIngredient, setDetailIngredient] = useState<Ingredient | null>(null)
  const [settingsOpen,     setSettingsOpen]     = useState(false)
  const [addLocationOpen,  setAddLocationOpen]  = useState(false)
  const [recipeFilter,     setRecipeFilter]     = useState<string | null>(null)
  const [envKeyConfigured, setEnvKeyConfigured] = useState(false)

  useEffect(() => {
    getEnvKeyStatus().then(({ configured }) => setEnvKeyConfigured(configured))
  }, [])

  // 구역별 촬영 이미지 URL 보관
  // key: 'fridge' | 'freezer' | customLocationId
  const [sectionImages, setSectionImages] = useState<Record<string, string>>({})

  if (!initialized || !keysLoaded) return <div className="phone-shell bg-[#09090b]" />

  // 환경변수 또는 localStorage 키가 있으면 사용 가능
  const hasKey               = envKeyConfigured || !!activeKey
  const showUpload           = ingredients.length === 0
  const confirmedIngredients = ingredients.filter(i => i.status === 'confirmed')
  const heldIngredients      = ingredients.filter(i => i.status === 'held')

  // 재료가 속한 구역의 이미지 찾기
  const getSectionImageUrl = (ing: Ingredient): string | undefined => {
    if (ing.section === 'freezer') return sectionImages[FREEZER_SCOPE_KEY] ?? sectionImages[FRIDGE_SCOPE_KEY]
    if (ing.section.startsWith('custom-')) return sectionImages[ing.section]
    return sectionImages[FRIDGE_SCOPE_KEY]
  }

  // 전체 초기화
  const handleReset = () => {
    clearIngredients()
    clearKeys()
    clearLocations()
    setSectionImages({})
    setTab('fridge')
  }

  // 최초 사진 분석 완료 → 레시피 탭으로
  const handleAnalyzeComplete = (newIngredients: Ingredient[], imageUrl: string) => {
    setAll(newIngredients)
    setSectionImages({ [FRIDGE_SCOPE_KEY]: imageUrl })
    setTab('recipes')
  }

  // 구역별 재촬영 완료
  const handleRetake = (scope: 'fridge' | 'freezer' | string, items: Ingredient[], imageUrl: string) => {
    setSectionImages(prev => ({ ...prev, [scope]: imageUrl }))
    if (scope === FRIDGE_SCOPE_KEY) {
      // 냉장실 전체 교체 (냉동실·커스텀 제외)
      const FRIDGE_SECTIONS = ['top-shelf','middle-shelf','bottom-shelf','crisper','door-upper','door-lower']
      update(prev => [
        ...prev.filter(i => !FRIDGE_SECTIONS.includes(i.section)),
        ...items,
      ])
    } else if (scope === FREEZER_SCOPE_KEY) {
      update(prev => [...prev.filter(i => i.section !== 'freezer'), ...items])
    } else {
      update(prev => [...prev.filter(i => i.section !== scope), ...items])
    }
  }

  const handleAddConfirm = (data: Omit<Ingredient, 'id'>) => {
    update(prev => [...prev, { ...data, id: String(nextId++) }])
    setAddModalSection(null)
  }

  const handleAddLocation = (loc: CustomLocation, items: Ingredient[], imageUrl?: string) => {
    addLocation(loc)
    update(prev => [...prev, ...items])
    if (imageUrl) setSectionImages(prev => ({ ...prev, [loc.id]: imageUrl }))
  }

  const handleDeleteLocation = (id: string) => {
    clearSection(id)
    removeLocation(id)
    setSectionImages(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  const handleFindRecipes = (ingredientName: string) => {
    setRecipeFilter(ingredientName); setTab('recipes')
  }

  const getCustomName = (section: string) =>
    locations.find(l => l.id === section)?.name

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'fridge',  label: '냉장고', icon: <RefrigeratorIcon className="w-6 h-6" /> },
    { id: 'recipes', label: '레시피', icon: <ChefHat className="w-6 h-6" /> },
    { id: 'holding', label: '보류함', icon: <Package className="w-6 h-6" />, badge: heldIngredients.length || undefined },
  ]

  return (
    <div className="phone-shell">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🧊</span>
          <span className="text-white font-extrabold text-lg tracking-tight">Zero Chef</span>
          <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-400' : 'bg-zinc-600'}`} />
        </div>
        <button onClick={() => setSettingsOpen(true)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            hasKey
              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
              : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
          }`}>
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* 본문 */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className={showUpload ? 'flex-1 flex flex-col' : 'px-4 py-4'}>
          {showUpload ? (
            <PhotoUpload
              onAnalyzeComplete={handleAnalyzeComplete}
              onOpenSettings={() => setSettingsOpen(true)}
              apiKey={hasKey ? (activeKey || '__env__') : ''}
              model={visionModelId}
            />
          ) : (
            <>
              {tab === 'fridge' && (
                <FridgeView
                  ingredients={ingredients}
                  customLocations={locations}
                  apiKey={activeKey}
                  onDeleteIngredient={id => update(prev => prev.filter(i => i.id !== id))}
                  onClearSection={clearSection}
                  onClearAll={clearIngredients}
                  onAddIngredient={s => setAddModalSection(s)}
                  onUncertainIngredient={ing => setUncertainPopup(ing)}
                  onTapIngredient={ing => setDetailIngredient(ing)}
                  model={visionModelId}
                  onRetake={handleRetake}
                  onUpdateLocation={updateLocation}
                  onDeleteLocation={handleDeleteLocation}
                  onOpenAddLocation={() => setAddLocationOpen(true)}
                />
              )}
              {tab === 'recipes' && (
                <RecipeList
                  ingredients={confirmedIngredients}
                  apiKey={activeKey}
                  model={modelId}
                  hasKey={hasKey}
                  filterIngredient={recipeFilter}
                  onClearIngredientFilter={() => setRecipeFilter(null)}
                />
              )}
              {tab === 'holding' && (
                <HoldingArea
                  ingredients={heldIngredients}
                  onConfirm={(id, name) => update(prev =>
                    prev.map(i => i.id === id ? { ...i, name, status: 'confirmed' as const } : i)
                  )}
                  onDelete={id => update(prev => prev.filter(i => i.id !== id))}
                  onClearAll={() => update(prev => prev.filter(i => i.status !== 'held'))}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* 하단 탭 바 */}
      {!showUpload && (
        <nav className="shrink-0 border-t border-zinc-800 bg-zinc-950 safe-bottom">
          <div className="flex items-center">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3.5 relative transition-colors ${
                  tab === t.id ? 'text-green-400' : 'text-zinc-600 hover:text-zinc-400'
                }`}>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="absolute top-2.5 right-[calc(50%-18px)] w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {t.badge}
                  </span>
                )}
                {t.icon}
                <span className="text-[11px] font-semibold">{t.label}</span>
                {tab === t.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-green-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* 모달 */}
      <AddIngredientModal
        open={!!addModalSection} section={addModalSection}
        onClose={() => setAddModalSection(null)} onAdd={handleAddConfirm} />

      <AddLocationModal
        open={addLocationOpen} apiKey={hasKey ? (activeKey || '__env__') : ''} model={visionModelId}
        onAdd={handleAddLocation} onClose={() => setAddLocationOpen(false)}
        onOpenSettings={() => { setAddLocationOpen(false); setSettingsOpen(true) }} />

      <UncertainItemPopup
        ingredient={uncertainPopup}
        onConfirm={(id, name) => {
          update(prev => prev.map(i => i.id === id ? { ...i, name, status: 'confirmed' as const } : i))
          setUncertainPopup(null)
        }}
        onHold={id => {
          update(prev => prev.map(i => i.id === id ? { ...i, status: 'held' as const } : i))
          setUncertainPopup(null)
        }}
        onClose={() => setUncertainPopup(null)} />

      <IngredientDetailSheet
        key={detailIngredient?.id ?? 'none'}
        ingredient={detailIngredient}
        customLocationName={detailIngredient ? getCustomName(detailIngredient.section) : undefined}
        sectionImageUrl={detailIngredient ? getSectionImageUrl(detailIngredient) : undefined}
        onClose={() => setDetailIngredient(null)}
        onDelete={id => { update(prev => prev.filter(i => i.id !== id)); setDetailIngredient(null) }}
        onUpdate={(id, patch) => {
          update(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
          // detailIngredient도 업데이트
          if (detailIngredient?.id === id) setDetailIngredient(prev => prev ? { ...prev, ...patch } : prev)
        }}
        onFindRecipes={handleFindRecipes} />

      <SettingsSheet
        open={settingsOpen}
        keys={keys} activeId={activeId}
        envKeyConfigured={envKeyConfigured}
        selectedModel={modelId} onSelectModel={setModelId}
        onAddKey={addKey} onRemoveKey={removeKey} onActivateKey={activateKey}
        onReset={handleReset} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
