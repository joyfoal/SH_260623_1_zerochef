'use client'

import { useState, useCallback } from 'react'
import { RefrigeratorIcon, ChefHat, Package, Camera, Settings } from 'lucide-react'
import { Ingredient, FridgeSection } from '@/lib/types'
import { MOCK_INGREDIENTS } from '@/lib/mock-data'
import { useApiKey } from '@/hooks/useApiKey'
import { PhotoUpload } from '@/components/upload/PhotoUpload'
import { FridgeView } from '@/components/fridge/FridgeView'
import { AddIngredientModal } from '@/components/ingredients/AddIngredientModal'
import { UncertainItemPopup } from '@/components/ingredients/UncertainItemPopup'
import { IngredientDetailSheet } from '@/components/ingredients/IngredientDetailSheet'
import { HoldingArea } from '@/components/ingredients/HoldingArea'
import { RecipeList } from '@/components/recipes/RecipeList'
import { SettingsSheet } from '@/components/settings/SettingsSheet'

type Tab = 'fridge' | 'recipes' | 'holding'

let nextId = 100

export default function Home() {
  const { apiKey, saveApiKey, clearApiKey } = useApiKey()
  const [phase, setPhase] = useState<'upload' | 'app'>('upload')
  const [tab, setTab] = useState<Tab>('fridge')
  const [ingredients, setIngredients] = useState<Ingredient[]>(MOCK_INGREDIENTS)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalSection, setAddModalSection] = useState<FridgeSection | null>(null)
  const [uncertainPopup, setUncertainPopup] = useState<Ingredient | null>(null)
  const [detailIngredient, setDetailIngredient] = useState<Ingredient | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const confirmedIngredients = ingredients.filter(i => i.status === 'confirmed')
  const heldIngredients = ingredients.filter(i => i.status === 'held')

  const handleAnalyzeComplete = useCallback(() => {
    setPhase('app')
    setTab('fridge')
  }, [])

  const handleDeleteIngredient = useCallback((id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id))
  }, [])

  const handleAddIngredient = useCallback((section: FridgeSection) => {
    setAddModalSection(section)
    setAddModalOpen(true)
  }, [])

  const handleAddConfirm = useCallback((data: Omit<Ingredient, 'id'>) => {
    const newIng: Ingredient = { ...data, id: String(nextId++) }
    setIngredients(prev => [...prev, newIng])
    setAddModalOpen(false)
  }, [])

  const handleUncertainIngredient = useCallback((ingredient: Ingredient) => {
    setUncertainPopup(ingredient)
  }, [])

  const handleUncertainConfirm = useCallback((id: string, correctedName: string) => {
    setIngredients(prev =>
      prev.map(i => i.id === id ? { ...i, name: correctedName, status: 'confirmed' as const } : i)
    )
    setUncertainPopup(null)
  }, [])

  const handleUncertainHold = useCallback((id: string) => {
    setIngredients(prev =>
      prev.map(i => i.id === id ? { ...i, status: 'held' as const } : i)
    )
    setUncertainPopup(null)
  }, [])

  const handleHoldConfirm = useCallback((id: string, name: string) => {
    setIngredients(prev =>
      prev.map(i => i.id === id ? { ...i, name, status: 'confirmed' as const } : i)
    )
  }, [])

  const handleHoldDelete = useCallback((id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id))
  }, [])

  const handleTapIngredient = useCallback((ingredient: Ingredient) => {
    setDetailIngredient(ingredient)
  }, [])

  const handleDetailDelete = useCallback((id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id))
    setDetailIngredient(null)
  }, [])

  if (phase === 'upload') {
    return (
      <div className="h-full overflow-y-auto">
        <PhotoUpload onAnalyzeComplete={handleAnalyzeComplete} apiKey={apiKey} />
        <SettingsSheet
          open={settingsOpen}
          apiKey={apiKey}
          onSave={saveApiKey}
          onClear={clearApiKey}
          onClose={() => setSettingsOpen(false)}
        />
        {/* Settings button on upload screen */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="fixed top-4 right-4 w-9 h-9 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'fridge', label: '냉장고', icon: <RefrigeratorIcon className="w-5 h-5" /> },
    { id: 'recipes', label: '레시피', icon: <ChefHat className="w-5 h-5" /> },
    {
      id: 'holding',
      label: '보류함',
      icon: <Package className="w-5 h-5" />,
      badge: heldIngredients.length || undefined,
    },
  ]

  return (
    <div className="h-full flex flex-col bg-[#09090b]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧊</span>
          <span className="text-white font-bold text-sm">냉장고 셰프</span>
          {/* API key indicator */}
          <div className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-green-400' : 'bg-zinc-600'}`}
            title={apiKey ? 'API 키 등록됨' : 'API 키 없음 (데모 모드)'}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-xs">{confirmedIngredients.length}가지 재료</span>
          <button
            onClick={() => setPhase('upload')}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 text-xs transition-colors"
          >
            <Camera className="w-3 h-3" />
            재촬영
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              apiKey
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                : 'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
            }`}
            title="API 키 설정"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 max-w-lg mx-auto">
          {tab === 'fridge' && (
            <FridgeView
              ingredients={ingredients.filter(i => i.status !== 'held')}
              onDeleteIngredient={handleDeleteIngredient}
              onAddIngredient={handleAddIngredient}
              onUncertainIngredient={handleUncertainIngredient}
              onTapIngredient={handleTapIngredient}
            />
          )}
          {tab === 'recipes' && (
            <RecipeList ingredients={confirmedIngredients} />
          )}
          {tab === 'holding' && (
            <HoldingArea
              ingredients={heldIngredients}
              onConfirm={handleHoldConfirm}
              onDelete={handleHoldDelete}
            />
          )}
        </div>
      </main>

      {/* Bottom navigation */}
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
