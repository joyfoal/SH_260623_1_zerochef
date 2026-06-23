'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Calendar, MapPin, Package, AlertTriangle } from 'lucide-react'
import { Ingredient } from '@/lib/types'
import { getDaysUntilExpiry, getExpiryLabel, getSectionLabel } from '@/lib/utils'

/* ── TheMealDB free ingredient image API ── */
const MEALDB_MAP: Record<string, string> = {
  '우유': 'Milk',
  '요거트': 'Yogurt',
  '두부': 'Tofu',
  '치즈': 'Cheddar Cheese',
  '계란': 'Eggs',
  '베이컨': 'Bacon',
  '돼지고기': 'Pork',
  '쇠고기': 'Beef',
  '닭고기': 'Chicken',
  '당근': 'Carrots',
  '양파': 'Onion',
  '파': 'Spring Onions',
  '마늘': 'Garlic',
  '생강': 'Ginger',
  '감자': 'Potatoes',
  '고구마': 'Sweet Potatoes',
  '시금치': 'Spinach',
  '버섯': 'Mushrooms',
  '애호박': 'Zucchini',
  '브로콜리': 'Broccoli',
  '토마토': 'Tomatoes',
  '오이': 'Cucumber',
  '배추': 'Cabbage',
  '무': 'Daikon Radish',
  '피망': 'Green Pepper',
  '케첩': 'Tomato Ketchup',
  '마요네즈': 'Mayonnaise',
  '간장': 'Soy Sauce',
  '고추장': 'Gochujang',
  '된장': 'Miso',
  '참기름': 'Sesame Oil',
  '버터': 'Butter',
  '올리브 오일': 'Olive Oil',
  '밀가루': 'Plain Flour',
  '설탕': 'Sugar',
  '소금': 'Salt',
  '새우': 'Prawns',
  '오징어': 'Squid',
  '연어': 'Salmon',
  '오렌지 주스': 'Orange Juice',
  '맥주': 'Beer',
  '사과': 'Apples',
  '바나나': 'Banana',
  '레몬': 'Lemon',
  '빵': 'Bread',
  '쌀': 'Rice',
  '파스타': 'Pasta',
  '냉동 만두': 'Gyoza Wrappers',
  '김치': 'Kimchi',
}

const SECTION_EMOJIS: Record<string, string> = {
  'top-shelf': '🔼',
  'middle-shelf': '▪️',
  'bottom-shelf': '🔽',
  'crisper': '🥦',
  'door-upper': '🚪',
  'door-lower': '🚪',
  'freezer': '❄️',
}

function getImageUrl(name: string): string | null {
  const en = MEALDB_MAP[name]
  if (!en) return null
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(en)}.png`
}

interface IngredientDetailSheetProps {
  ingredient: Ingredient | null
  onClose: () => void
  onDelete: (id: string) => void
}

export function IngredientDetailSheet({ ingredient, onClose, onDelete }: IngredientDetailSheetProps) {
  const [imgError, setImgError] = useState(false)

  const handleDelete = () => {
    if (!ingredient) return
    onDelete(ingredient.id)
    onClose()
  }

  const days = ingredient ? getDaysUntilExpiry(ingredient.expiryDate) : null
  const isCritical = days !== null && days <= 1
  const isWarning = days !== null && days <= 3 && days > 1
  const imageUrl = ingredient ? getImageUrl(ingredient.name) : null

  return (
    <AnimatePresence>
      {ingredient && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
          >
            <div className="bg-zinc-900 rounded-t-3xl overflow-hidden border-t border-zinc-800 shadow-2xl">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-9 h-1 bg-zinc-700 rounded-full" />
              </div>

              {/* Photo area */}
              <div className="relative h-52 bg-zinc-800 overflow-hidden">
                {imageUrl && !imgError ? (
                  <img
                    src={imageUrl}
                    alt={ingredient.name}
                    className="w-full h-full object-contain p-4"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  /* Emoji fallback */
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <span className="text-[96px] drop-shadow-lg">{ingredient.emoji}</span>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Expiry badge overlay */}
                {days !== null && (
                  <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isCritical ? 'bg-red-500 text-white' :
                    isWarning ? 'bg-amber-500 text-white' :
                    'bg-zinc-800/80 text-zinc-300'
                  }`}>
                    {isCritical && <AlertTriangle className="w-3 h-3" />}
                    {getExpiryLabel(days)}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="px-5 pt-4 pb-6">
                {/* Name row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-white text-xl font-bold">{ingredient.name}</h2>
                    {ingredient.quantity && (
                      <p className="text-zinc-400 text-sm mt-0.5">{ingredient.quantity}</p>
                    )}
                  </div>
                  <span className="text-3xl">{ingredient.emoji}</span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <InfoCard
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    label="위치"
                    value={`${SECTION_EMOJIS[ingredient.section]} ${getSectionLabel(ingredient.section)}`}
                  />
                  <InfoCard
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    label="유통기한"
                    value={
                      days === null
                        ? '미지정'
                        : days < 0
                        ? '만료됨'
                        : days === 0
                        ? '오늘까지!'
                        : `${days}일 남음`
                    }
                    highlight={isCritical ? 'red' : isWarning ? 'amber' : undefined}
                  />
                  <InfoCard
                    icon={<Package className="w-3.5 h-3.5" />}
                    label="AI 인식률"
                    value={`${Math.round(ingredient.confidence * 100)}%`}
                    highlight={ingredient.confidence >= 0.85 ? 'green' : 'amber'}
                  />
                  {ingredient.isBasicSeasoning && (
                    <InfoCard
                      icon={<span className="text-xs">🧂</span>}
                      label="분류"
                      value="기본 양념"
                    />
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-900/60 bg-red-950/30 text-red-400 hover:bg-red-950/50 active:scale-[0.98] transition-all text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  냉장고에서 제거
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function InfoCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: 'red' | 'amber' | 'green'
}) {
  const valueColor =
    highlight === 'red' ? 'text-red-400' :
    highlight === 'amber' ? 'text-amber-400' :
    highlight === 'green' ? 'text-green-400' :
    'text-white'

  return (
    <div className="bg-zinc-800/60 rounded-xl px-3 py-2.5">
      <div className={`flex items-center gap-1.5 text-zinc-500 mb-1`}>
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${valueColor}`}>{value}</p>
    </div>
  )
}
