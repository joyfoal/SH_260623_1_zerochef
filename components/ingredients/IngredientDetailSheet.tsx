'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Calendar, MapPin, Package, AlertTriangle, ChefHat } from 'lucide-react'
import { Ingredient } from '@/lib/types'
import { getDaysUntilExpiry, getExpiryLabel, getSectionLabel } from '@/lib/utils'

const MEALDB_MAP: Record<string, string> = {
  '우유': 'Milk', '요거트': 'Yogurt', '두부': 'Tofu', '치즈': 'Cheddar Cheese',
  '계란': 'Eggs', '베이컨': 'Bacon', '돼지고기': 'Pork', '쇠고기': 'Beef',
  '닭고기': 'Chicken', '당근': 'Carrots', '양파': 'Onion', '파': 'Spring Onions',
  '마늘': 'Garlic', '생강': 'Ginger', '감자': 'Potatoes', '고구마': 'Sweet Potatoes',
  '시금치': 'Spinach', '버섯': 'Mushrooms', '애호박': 'Zucchini', '브로콜리': 'Broccoli',
  '토마토': 'Tomatoes', '오이': 'Cucumber', '배추': 'Cabbage', '무': 'Daikon Radish',
  '피망': 'Green Pepper', '케첩': 'Tomato Ketchup', '마요네즈': 'Mayonnaise',
  '간장': 'Soy Sauce', '참기름': 'Sesame Oil', '버터': 'Butter', '밀가루': 'Plain Flour',
  '설탕': 'Sugar', '소금': 'Salt', '새우': 'Prawns', '연어': 'Salmon',
  '오렌지 주스': 'Orange Juice', '맥주': 'Beer', '사과': 'Apples', '바나나': 'Banana', '빵': 'Bread',
}

const SECTION_EMOJIS: Record<string, string> = {
  'top-shelf': '🔼', 'middle-shelf': '▪️', 'bottom-shelf': '🔽',
  'crisper': '🥦', 'door-upper': '🚪', 'door-lower': '🚪', 'freezer': '❄️',
}

function getImageUrl(name: string): string | null {
  const en = MEALDB_MAP[name]
  return en ? `https://www.themealdb.com/images/ingredients/${encodeURIComponent(en)}.png` : null
}

interface IngredientDetailSheetProps {
  ingredient: Ingredient | null
  customLocationName?: string
  onClose: () => void
  onDelete: (id: string) => void
  onFindRecipes: (ingredientName: string) => void
}

export function IngredientDetailSheet({
  ingredient, customLocationName, onClose, onDelete, onFindRecipes,
}: IngredientDetailSheetProps) {
  const [imgError, setImgError] = useState(false)

  if (!ingredient) return null

  const days = getDaysUntilExpiry(ingredient.expiryDate)
  const isCritical = days !== null && days <= 1
  const isWarning = days !== null && days <= 3 && days > 1
  const imageUrl = getImageUrl(ingredient.name)
  const sectionIcon = SECTION_EMOJIS[ingredient.section] ?? '📦'
  const sectionName = getSectionLabel(ingredient.section, customLocationName)

  return (
    <AnimatePresence>
      <>
        <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div key="sh"
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="fixed bottom-0 left-0 right-0 z-50 max-w-[390px] mx-auto"
          drag="y" dragConstraints={{ top: 0 }} dragElastic={{ top: 0, bottom: 0.4 }}
          onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
        >
          <div className="bg-zinc-900 rounded-t-3xl overflow-hidden border-t border-zinc-800 shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* 사진 영역 */}
            <div className="relative h-52 bg-zinc-800 overflow-hidden">
              {imageUrl && !imgError ? (
                <img src={imageUrl} alt={ingredient.name}
                  className="w-full h-full object-contain p-4"
                  onError={() => setImgError(true)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <span className="text-[96px] drop-shadow-lg">{ingredient.emoji}</span>
                </div>
              )}
              <button onClick={onClose}
                className="absolute top-3 right-3 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70">
                <X className="w-4 h-4" />
              </button>
              {days !== null && (
                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isCritical ? 'bg-red-500 text-white' : isWarning ? 'bg-amber-500 text-white' : 'bg-zinc-800/80 text-zinc-300'
                }`}>
                  {isCritical && <AlertTriangle className="w-3 h-3" />}
                  {getExpiryLabel(days)}
                </div>
              )}
            </div>

            {/* 상세 정보 */}
            <div className="px-5 pt-4 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-white text-xl font-bold">{ingredient.name}</h2>
                  {ingredient.quantity && <p className="text-zinc-400 text-sm mt-0.5">{ingredient.quantity}</p>}
                </div>
                <span className="text-3xl">{ingredient.emoji}</span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <InfoCard icon={<MapPin className="w-3.5 h-3.5" />} label="위치"
                  value={`${sectionIcon} ${sectionName}`} />
                <InfoCard icon={<Calendar className="w-3.5 h-3.5" />} label="유통기한"
                  value={days === null ? '미지정' : days < 0 ? '만료됨' : days === 0 ? '오늘까지!' : `${days}일 남음`}
                  highlight={isCritical ? 'red' : isWarning ? 'amber' : undefined} />
                <InfoCard icon={<Package className="w-3.5 h-3.5" />} label="AI 인식률"
                  value={`${Math.round(ingredient.confidence * 100)}%`}
                  highlight={ingredient.confidence >= 0.85 ? 'green' : 'amber'} />
              </div>

              {/* 재료로 레시피 찾기 — 메인 CTA */}
              <button
                onClick={() => { onFindRecipes(ingredient.name); onClose() }}
                className="w-full h-13 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-green-600 hover:bg-green-500 active:scale-[0.98] text-white font-semibold text-base transition-all mb-2.5"
              >
                <ChefHat className="w-5 h-5" />
                이 재료로 레시피 찾기
              </button>

              {/* 삭제 */}
              <button onClick={() => { onDelete(ingredient.id); onClose() }}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl border border-red-900/60 bg-red-950/30 text-red-400 hover:bg-red-950/50 active:scale-[0.98] text-sm font-medium transition-all">
                <Trash2 className="w-4 h-4" />냉장고에서 제거
              </button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}

function InfoCard({ icon, label, value, highlight }: {
  icon: React.ReactNode; label: string; value: string; highlight?: 'red' | 'amber' | 'green'
}) {
  const valueColor = highlight === 'red' ? 'text-red-400' : highlight === 'amber' ? 'text-amber-400'
    : highlight === 'green' ? 'text-green-400' : 'text-white'
  return (
    <div className="bg-zinc-800/60 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-zinc-500 mb-1">{icon}
        <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${valueColor}`}>{value}</p>
    </div>
  )
}
