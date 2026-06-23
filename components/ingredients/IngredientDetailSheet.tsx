'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Calendar, MapPin, Package, AlertTriangle, ChefHat } from 'lucide-react'
import { Ingredient } from '@/lib/types'
import { getDaysUntilExpiry, getExpiryLabel, getSectionLabel } from '@/lib/utils'

/* ── 재료 원본 이미지 (TheMealDB) ── */
const MEALDB_MAP: Record<string, string> = {
  '우유': 'Milk', '요거트': 'Yogurt', '두부': 'Tofu', '치즈': 'Cheddar Cheese',
  '계란': 'Eggs', '베이컨': 'Bacon', '돼지고기': 'Pork', '쇠고기': 'Beef',
  '닭고기': 'Chicken', '당근': 'Carrots', '양파': 'Onion', '파': 'Spring Onions',
  '마늘': 'Garlic', '생강': 'Ginger', '감자': 'Potatoes', '고구마': 'Sweet Potatoes',
  '시금치': 'Spinach', '버섯': 'Mushrooms', '애호박': 'Zucchini', '브로콜리': 'Broccoli',
  '토마토': 'Tomatoes', '오이': 'Cucumber', '배추': 'Cabbage',
  '케첩': 'Tomato Ketchup', '마요네즈': 'Mayonnaise', '간장': 'Soy Sauce',
  '참기름': 'Sesame Oil', '버터': 'Butter', '밀가루': 'Plain Flour',
  '설탕': 'Sugar', '소금': 'Salt', '새우': 'Prawns', '연어': 'Salmon',
  '오렌지 주스': 'Orange Juice', '사과': 'Apples', '바나나': 'Banana', '빵': 'Bread',
}

/* ── 냉장고 보관 모습 (Unsplash 검색 키워드) ── */
const FRIDGE_KEYWORDS: Record<string, string> = {
  '계란': 'eggs+refrigerator+carton',
  '우유': 'milk+bottle+refrigerator',
  '두부': 'tofu+package+store',
  '치즈': 'cheese+refrigerator+storage',
  '베이컨': 'bacon+package+refrigerator',
  '돼지고기': 'pork+meat+refrigerator+tray',
  '쇠고기': 'beef+meat+refrigerator+package',
  '닭고기': 'chicken+refrigerator+raw',
  '당근': 'carrots+refrigerator+vegetable',
  '양파': 'onions+storage+basket',
  '시금치': 'spinach+refrigerator+bag',
  '버섯': 'mushrooms+refrigerator+container',
  '애호박': 'zucchini+refrigerator',
  '브로콜리': 'broccoli+refrigerator',
  '김치': 'kimchi+jar+refrigerator',
  '냉동 만두': 'frozen+dumplings+freezer+bag',
  '냉동 밥': 'frozen+rice+container',
}

function getMealdbUrl(name: string) {
  const en = MEALDB_MAP[name]
  return en ? `https://www.themealdb.com/images/ingredients/${encodeURIComponent(en)}.png` : null
}

function getFridgeImgUrl(name: string) {
  const kw = FRIDGE_KEYWORDS[name] ?? encodeURIComponent(name) + '+food+refrigerator'
  // source.unsplash.com — 데모용. sig로 항상 같은 이미지 반환 유도
  const sig = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  return `https://source.unsplash.com/280x180/?${kw}&sig=${sig}`
}

const SECTION_EMOJIS: Record<string, string> = {
  'top-shelf': '🔼', 'middle-shelf': '▪️', 'bottom-shelf': '🔽',
  'crisper': '🥦', 'door-upper': '🚪', 'door-lower': '🚪', 'freezer': '❄️',
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
  const [mealdbError, setMealdbError] = useState(false)
  const [fridgeImgError, setFridgeImgError] = useState(false)

  if (!ingredient) return null

  const days = getDaysUntilExpiry(ingredient.expiryDate)
  const isCritical = days !== null && days <= 1
  const isWarning  = days !== null && days <= 3 && days > 1
  const mealdbUrl  = getMealdbUrl(ingredient.name)
  const fridgeUrl  = getFridgeImgUrl(ingredient.name)
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
          onDragEnd={(_, i) => { if (i.offset.y > 80) onClose() }}
        >
          <div className="bg-zinc-900 rounded-t-3xl overflow-hidden border-t border-zinc-800 shadow-2xl">
            {/* 드래그 핸들 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* ── 이미지 2단 ── */}
            <div className="grid grid-cols-2 gap-2 px-4 pb-2">
              {/* 재료 사진 */}
              <div className="flex flex-col gap-1">
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wide pl-1">재료 사진</p>
                <div className="relative h-36 bg-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center">
                  {mealdbUrl && !mealdbError ? (
                    <img src={mealdbUrl} alt={ingredient.name}
                      className="w-full h-full object-contain p-3"
                      onError={() => setMealdbError(true)} />
                  ) : (
                    <span className="text-6xl">{ingredient.emoji}</span>
                  )}
                  {days !== null && isCritical && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      <AlertTriangle className="w-2.5 h-2.5" />{getExpiryLabel(days)}
                    </div>
                  )}
                </div>
              </div>

              {/* 냉장고 보관 모습 */}
              <div className="flex flex-col gap-1">
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wide pl-1">냉장고 보관 모습</p>
                <div className="relative h-36 bg-zinc-800 rounded-2xl overflow-hidden">
                  {!fridgeImgError ? (
                    <img src={fridgeUrl} alt={`${ingredient.name} 보관`}
                      className="w-full h-full object-cover"
                      onError={() => setFridgeImgError(true)} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-800 to-zinc-900">
                      <span className="text-4xl">🧊</span>
                      <span className="text-zinc-500 text-xs text-center px-2">{sectionIcon} {sectionName}</span>
                    </div>
                  )}
                  {/* 위치 오버레이 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-4 pb-2 px-2">
                    <p className="text-white text-[10px] font-medium">{sectionIcon} {sectionName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 이름 & 수량 */}
            <div className="px-4 pt-1 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">{ingredient.name}</h2>
                {ingredient.quantity && <p className="text-zinc-400 text-sm">{ingredient.quantity}</p>}
              </div>
              <div className="flex items-center gap-2">
                {days !== null && !isCritical && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    isWarning ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>{getExpiryLabel(days)}</span>
                )}
                <button onClick={onClose}
                  className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info grid */}
            <div className="px-4 grid grid-cols-2 gap-2 mb-4">
              <InfoCard icon={<Calendar className="w-3.5 h-3.5" />} label="유통기한"
                value={days === null ? '미지정' : days < 0 ? '만료됨' : days === 0 ? '오늘까지!' : `${days}일 남음`}
                highlight={isCritical ? 'red' : isWarning ? 'amber' : undefined} />
              <InfoCard icon={<Package className="w-3.5 h-3.5" />} label="AI 인식률"
                value={`${Math.round(ingredient.confidence * 100)}%`}
                highlight={ingredient.confidence >= 0.85 ? 'green' : 'amber'} />
            </div>

            {/* CTA 버튼 */}
            <div className="px-4 pb-6 flex flex-col gap-2">
              <button onClick={() => { onFindRecipes(ingredient.name); onClose() }}
                className="w-full h-13 py-3.5 flex items-center justify-center gap-2.5 rounded-2xl bg-green-600 hover:bg-green-500 active:scale-[0.98] text-white font-semibold text-base transition-all">
                <ChefHat className="w-5 h-5" />이 재료로 레시피 찾기
              </button>
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
  icon: React.ReactNode; label: string; value: string; highlight?: 'red'|'amber'|'green'
}) {
  const vc = highlight === 'red' ? 'text-red-400' : highlight === 'amber' ? 'text-amber-400'
    : highlight === 'green' ? 'text-green-400' : 'text-white'
  return (
    <div className="bg-zinc-800/60 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
        {icon}<span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${vc}`}>{value}</p>
    </div>
  )
}
