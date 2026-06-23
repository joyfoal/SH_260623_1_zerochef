'use client'

import { useState, useCallback } from 'react'
import { RefrigeratorIcon, ChefHat, Package, Camera, Settings } from 'lucide-react'
import { Ingredient, FridgeSection, CustomLocation } from '@/lib/types'
import { useApiKey } from '@/hooks/useApiKey'
import { useIngredients } from '@/hooks/useIngredients'
import { useCustomLocations } from '@/hooks/useCustomLocations'
import { PhotoUpload } from '@/components/upload/PhotoUpload'
import { FridgeView } from '@/components/fridge/FridgeView'
import { AddLocationModal } from '@/components/fridge/AddLocationModal'
import { AddIngredientModal } from '@/components/ingredients/AddIngredientModal'
import { UncertainItemPopup } from '@/components/ingredients/UncertainItemPopup'
import { IngredientDetailSheet } from '@/components/ingredients/IngredientDetailSheet'
import { HoldingArea } from '@/components/ingredients/HoldingArea'
import { RecipeList } from '@/components/recipes/RecipeList'
import { SettingsSheet } from '@/components/settings/SettingsSheet'

type Tab = 'fridge' | 'recipes' | 'holding'
let nextId = 1000

export default function Home() {
  const { apiKey, saveApiKey, clearApiKey } = useApiKey()
  const { ingredients, setAll, update, clearSection, clearAll, initialized } = useIngredients()
  const { locations, addLocation, removeLocation } = useCustomLocations()

  const [tab, setTab] = useState<Tab>('fridge')
  const [addModalSection, setAddModalSection] = useState<FridgeSection | null>(null)
  const [uncertainPopup, setUncertainPopup] = useState<Ingredient | null>(null)
  const [detailIngredient, setDetailIngredient] = useState<Ingredient | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addLocationOpen, setAddLocationOpen] = useState(false)
  const [recipeFilter, setRecipeFilter] = useState<string | null>(null)

  const confirmedIngredients = ingredients.filter(i => i.status === 'confirmed')
  const heldIngredients = ingredients.filter(i => i.status === 'held')

  if (!initialized) return <div className="phone-shell bg-[#09090b]" />

  const showUpload = ingredients.length === 0

  // 전체 초기화
  const handleReset = () => {
    clearAll()
    clearApiKey()
    try {
      localStorage.removeItem('custom_locations_v1')
    } catch {}
    locations.forEach(l => removeLocation(l.id))
  }

  const handleAnalyzeComplete = (newIngredients: Ingredient[]) => {
    setAll(newIngredients); setTab('fridge')
  }

  const handleAddConfirm = (data: Omit<Ingredient, 'id'>) => {
    update(prev => [...prev, { ...data, id: String(nextId++) }])
    setAddModalSection(null)
  }

  const handleAddSectionIngredients = (section: FridgeSection, items: Ingredient[]) => {
    update(prev => [
      ...prev.filter(i => i.section !== section),
      ...items,
    ])
  }

  const handleAddLocation = (loc: CustomLocation, items: Ingredient[]) => {
    addLocation(loc)
    update(prev => [...prev, ...items])
  }

  const handleUncertainConfirm = (id: string, name: string) => {
    update(prev => prev.map(i => i.id === id ? { ...i, name, status: 'confirmed' as const } : i))
    setUncertainPopup(null)
  }
  const handleUncertainHold = (id: string) => {
    update(prev => prev.map(i => i.id === id ? { ...i, status: 'held' as const } : i))
    setUncertainPopup(null)
  }

  const handleFindRecipes = (ingredientName: string) => {
    setRecipeFilter(ingredientName); setTab('recipes')
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'fridge', label: '냉장고', icon: <RefrigeratorIcon className="w-6 h-6" /> },
    { id: 'recipes', label: '레시피', icon: <ChefHat className="w-6 h-6" /> },
    { id: 'holding', label: '보류함', icon: <Package className="w-6 h-6" />, badge: heldIngredients.length || undefined },
  ]

  // 커스텀 장소 이름 찾기
  const getCustomName = (section: string) =>
    locations.find(l => l.id === section)?.name

  return (
    <div className="phone-shell">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🧊</span>
          <span className="text-white font-extrabold text-lg tracking-tight">Zero Chef</span>
          <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-400' : 'bg-zinc-600'}`} />
        </div>
        <div className="flex items-center gap-2">
          {!showUpload && (
            <button onClick={() => { clearAll(); setTab('fridge') }}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 text-sm font-medium transition-colors">
              <Camera className="w-4 h-4" />재촬영
            </button>
          )}
          <button onClick={() => setSettingsOpen(true)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              apiKey ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                     : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
            }`}>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          {showUpload ? (
            <PhotoUpload onAnalyzeComplete={handleAnalyzeComplete} apiKey={apiKey} />
          ) : (
            <>
              {tab === 'fridge' && (
                <FridgeView
                  ingredients={ingredients.filter(i => i.status !== 'held')}
                  customLocations={locations}
                  apiKey={apiKey}
                  onDeleteIngredient={id => update(prev => prev.filter(i => i.id !== id))}
                  onClearSection={clearSection}
                  onClearAll={clearAll}
                  onAddIngredient={s => setAddModalSection(s)}
                  onUncertainIngredient={ing => setUncertainPopup(ing)}
                  onTapIngredient={ing => setDetailIngredient(ing)}
                  onAddSectionIngredients={handleAddSectionIngredients}
                  onOpenAddLocation={() => setAddLocationOpen(true)}
                />
              )}
              {tab === 'recipes' && (
                <RecipeList
                  ingredients={confirmedIngredients}
                  filterIngredient={recipeFilter}
                  onClearIngredientFilter={() => setRecipeFilter(null)}
                />
              )}
              {tab === 'holding' && (
                <HoldingArea
                  ingredients={heldIngredients}
                  onConfirm={(id, name) => update(prev => prev.map(i => i.id === id ? { ...i, name, status: 'confirmed' as const } : i))}
                  onDelete={id => update(prev => prev.filter(i => i.id !== id))}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Bottom nav */}
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

      {/* Modals */}
      <AddIngredientModal
        open={!!addModalSection} section={addModalSection}
        onClose={() => setAddModalSection(null)} onAdd={handleAddConfirm} />

      <AddLocationModal
        open={addLocationOpen} apiKey={apiKey}
        onAdd={handleAddLocation} onClose={() => setAddLocationOpen(false)} />

      <UncertainItemPopup
        ingredient={uncertainPopup}
        onConfirm={handleUncertainConfirm}
        onHold={handleUncertainHold}
        onClose={() => setUncertainPopup(null)} />

      <IngredientDetailSheet
        ingredient={detailIngredient}
        customLocationName={detailIngredient ? getCustomName(detailIngredient.section) : undefined}
        onClose={() => setDetailIngredient(null)}
        onDelete={id => { update(prev => prev.filter(i => i.id !== id)); setDetailIngredient(null) }}
        onFindRecipes={handleFindRecipes} />

      <SettingsSheet
        open={settingsOpen} apiKey={apiKey}
        onSave={saveApiKey} onClear={clearApiKey}
        onReset={handleReset} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
