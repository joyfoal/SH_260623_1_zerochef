'use client'

import { useState, useCallback } from 'react'
import { RefrigeratorIcon, ChefHat, Package, Camera, Settings } from 'lucide-react'
import { Ingredient, FridgeSection } from '@/lib/types'
import { useApiKey } from '@/hooks/useApiKey'
import { useIngredients } from '@/hooks/useIngredients'
import { PhotoUpload } from '@/components/upload/PhotoUpload'
import { FridgeView } from '@/components/fridge/FridgeView'
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

  const [tab, setTab] = useState<Tab>('fridge')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalSection, setAddModalSection] = useState<FridgeSection | null>(null)
  const [uncertainPopup, setUncertainPopup] = useState<Ingredient | null>(null)
  const [detailIngredient, setDetailIngredient] = useState<Ingredient | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const confirmedIngredients = ingredients.filter(i => i.status === 'confirmed')
  const heldIngredients = ingredients.filter(i => i.status === 'held')

  // 아직 localStorage 초기화 전이면 빈 화면
  if (!initialized) return <div className="h-full bg-[#09090b]" />

  // 재료가 없으면 업로드 화면
  const showUpload = ingredients.length === 0

  const handleAnalyzeComplete = (newIngredients: Ingredient[]) => {
    setAll(newIngredients)
    setTab('fridge')
  }

  const handleDeleteIngredient = (id: string) => {
    update(prev => prev.filter(i => i.id !== id))
  }

  const handleAddIngredient = (section: FridgeSection) => {
    setAddModalSection(section)
    setAddModalOpen(true)
  }

  const handleAddConfirm = (data: Omit<Ingredient, 'id'>) => {
    update(prev => [...prev, { ...data, id: String(nextId++) }])
    setAddModalOpen(false)
  }

  const handleUncertainConfirm = (id: string, correctedName: string) => {
    update(prev => prev.map(i => i.id === id ? { ...i, name: correctedName, status: 'confirmed' as const } : i))
    setUncertainPopup(null)
  }

  const handleUncertainHold = (id: string) => {
    update(prev => prev.map(i => i.id === id ? { ...i, status: 'held' as const } : i))
    setUncertainPopup(null)
  }

  const handleHoldConfirm = (id: string, name: string) => {
    update(prev => prev.map(i => i.id === id ? { ...i, name, status: 'confirmed' as const } : i))
  }

  const handleDetailDelete = (id: string) => {
    update(prev => prev.filter(i => i.id !== id))
    setDetailIngredient(null)
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'fridge', label: '냉장고', icon: <RefrigeratorIcon className="w-5 h-5" /> },
    { id: 'recipes', label: '레시피', icon: <ChefHat className="w-5 h-5" /> },
    { id: 'holding', label: '보류함', icon: <Package className="w-5 h-5" />, badge: heldIngredients.length || undefined },
  ]

  return (
    <div className="h-full flex flex-col bg-[#09090b]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧊</span>
          <span className="text-white font-bold text-sm">냉장고 셰프</span>
          <div
            className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-green-400' : 'bg-zinc-600'}`}
            title={apiKey ? 'API 키 등록됨' : '데모 모드'}
          />
        </div>
        <div className="flex items-center gap-2">
          {!showUpload && (
            <button
              onClick={() => { clearAll(); setTab('fridge') }}
              className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 text-xs transition-colors"
            >
              <Camera className="w-3 h-3" />
              재촬영
            </button>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              apiKey
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                : 'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 max-w-lg mx-auto">
          {showUpload ? (
            <PhotoUpload onAnalyzeComplete={handleAnalyzeComplete} apiKey={apiKey} />
          ) : (
            <>
              {tab === 'fridge' && (
                <FridgeView
                  ingredients={ingredients.filter(i => i.status !== 'held')}
                  onDeleteIngredient={handleDeleteIngredient}
                  onClearSection={clearSection}
                  onClearAll={clearAll}
                  onAddIngredient={handleAddIngredient}
                  onUncertainIngredient={ing => setUncertainPopup(ing)}
                  onTapIngredient={ing => setDetailIngredient(ing)}
                />
              )}
              {tab === 'recipes' && <RecipeList ingredients={confirmedIngredients} />}
              {tab === 'holding' && (
                <HoldingArea
                  ingredients={heldIngredients}
                  onConfirm={handleHoldConfirm}
                  onDelete={id => update(prev => prev.filter(i => i.id !== id))}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Bottom nav — 업로드 화면에서는 숨김 */}
      {!showUpload && (
        <nav className="shrink-0 border-t border-zinc-800 bg-zinc-950 safe-bottom">
          <div className="flex items-center">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative ${
                  tab === t.id ? 'text-green-400' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="absolute top-2 right-[calc(50%-12px)] w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {t.badge}
                  </span>
                )}
                {t.icon}
                <span className="text-[10px] font-medium">{t.label}</span>
                {tab === t.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-green-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Modals */}
      <AddIngredientModal
        open={addModalOpen}
        section={addModalSection}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddConfirm}
      />
      <UncertainItemPopup
        ingredient={uncertainPopup}
        onConfirm={handleUncertainConfirm}
        onHold={handleUncertainHold}
        onClose={() => setUncertainPopup(null)}
      />
      <IngredientDetailSheet
        ingredient={detailIngredient}
        onClose={() => setDetailIngredient(null)}
        onDelete={handleDetailDelete}
      />
      <SettingsSheet
        open={settingsOpen}
        apiKey={apiKey}
        onSave={saveApiKey}
        onClear={clearApiKey}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
