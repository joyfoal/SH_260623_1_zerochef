'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Calendar, Package, AlertTriangle, ChefHat, Pencil, Check } from 'lucide-react'
import { Ingredient } from '@/lib/types'
import { getDaysUntilExpiry, getExpiryLabel, getSectionLabel } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const MEALDB_MAP: Record<string, string> = {
  // 유제품·계란
  '우유': 'Milk', '요거트': 'Yogurt', '치즈': 'Cheddar Cheese', '버터': 'Butter',
  '계란': 'Eggs', '달걀': 'Eggs',
  // 두부·콩
  '두부': 'Tofu', '콩': 'Beans', '콩나물': 'Bean Sprouts', '된장': 'Miso',
  // 육류
  '베이컨': 'Bacon', '돼지고기': 'Pork', '쇠고기': 'Beef', '닭고기': 'Chicken',
  '삼겹살': 'Pork Belly', '닭가슴살': 'Chicken Breast', '닭다리': 'Chicken Thighs',
  '소고기': 'Beef', '햄': 'Ham', '소시지': 'Sausages',
  // 해산물
  '새우': 'Prawns', '연어': 'Salmon', '오징어': 'Squid', '조개': 'Clams',
  '굴': 'Oysters', '게': 'Crab', '참치': 'Tuna', '멸치': 'Anchovies',
  '홍합': 'Mussels', '문어': 'Octopus', '고등어': 'Mackerel',
  // 채소
  '당근': 'Carrots', '양파': 'Onion', '파': 'Spring Onions', '쪽파': 'Spring Onions',
  '마늘': 'Garlic', '생강': 'Ginger', '감자': 'Potatoes', '고구마': 'Sweet Potatoes',
  '시금치': 'Spinach', '버섯': 'Mushrooms', '애호박': 'Zucchini', '호박': 'Butternut Squash',
  '브로콜리': 'Broccoli', '토마토': 'Tomatoes', '오이': 'Cucumber', '배추': 'Cabbage',
  '양배추': 'Cabbage', '무': 'White Radish', '가지': 'Aubergine', '파프리카': 'Red Pepper',
  '고추': 'Red Pepper', '피망': 'Green Pepper', '셀러리': 'Celery', '아스파라거스': 'Asparagus',
  '상추': 'Lettuce', '깻잎': 'Sesame Leaves',
  // 과일
  '사과': 'Apples', '바나나': 'Banana', '레몬': 'Lemon', '오렌지': 'Orange',
  '포도': 'Grapes', '딸기': 'Strawberries', '블루베리': 'Blueberries',
  '복숭아': 'Peaches', '파인애플': 'Pineapple', '망고': 'Mango', '배': 'Pears',
  '키위': 'Kiwi Fruit', '수박': 'Watermelon', '체리': 'Cherries',
  // 조미료·소스
  '케첩': 'Tomato Ketchup', '마요네즈': 'Mayonnaise', '간장': 'Soy Sauce',
  '참기름': 'Sesame Oil', '설탕': 'Sugar', '소금': 'Salt', '식초': 'White Wine Vinegar',
  '올리브오일': 'Olive Oil', '고추장': 'Chilli Sauce', '후추': 'Black Pepper',
  '참깨': 'Sesame Seeds', '들기름': 'Sesame Oil',
  // 가공식품·기타
  '밀가루': 'Plain Flour', '빵': 'Bread', '쌀': 'White Rice', '라면': 'Noodles',
  '김': 'Seaweed', '떡': 'Rice',
}

const SECTION_EMOJIS: Record<string, string> = {
  'top-shelf': '🔼', 'middle-shelf': '▪️', 'bottom-shelf': '🔽',
  'crisper': '🥦', 'door-upper': '🚪', 'door-lower': '🚪', 'freezer': '❄️',
}

// 냉장고 섹션별 줌 기준점 (transformOrigin) — scale(2.5) 시 어느 위치를 중심으로 확대할지
const SECTION_ORIGIN: Record<string, string> = {
  'top-shelf':    'center 15%',
  'middle-shelf': 'center 45%',
  'bottom-shelf': 'center 70%',
  'crisper':      'center 88%',
  'door-upper':   '90% 20%',
  'door-lower':   '90% 70%',
  'freezer':      'center 40%',
}

interface IngredientDetailSheetProps {
  ingredient: Ingredient | null
  customLocationName?: string
  sectionImageUrl?: string
  onClose: () => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: Partial<Ingredient>) => void
  onFindRecipes: (ingredientName: string) => void
}

export function IngredientDetailSheet({
  ingredient, customLocationName, sectionImageUrl,
  onClose, onDelete, onUpdate, onFindRecipes,
}: IngredientDetailSheetProps) {
  const [mealdbError, setMealdbError] = useState(false)
  const [fridgeError, setFridgeError] = useState(false)
  const [editing,     setEditing]     = useState(false)
  const [editName,    setEditName]    = useState('')
  const [editQty,     setEditQty]     = useState('')
  const [editExpiry,  setEditExpiry]  = useState('')

  // 이름 변경 시 사진 에러 초기화 (수정 후 사진이 업데이트되도록)
  useEffect(() => {
    setMealdbError(false)
  }, [ingredient?.name])

  if (!ingredient) return null

  const days       = getDaysUntilExpiry(ingredient.expiryDate)
  const isCritical = days !== null && days <= 1
  const isWarning  = days !== null && days <= 3 && days > 1
  const mealdbEn   = MEALDB_MAP[ingredient.name]
  const mealdbUrl  = mealdbEn
    ? `https://www.themealdb.com/images/ingredients/${encodeURIComponent(mealdbEn)}.png`
    : null
  const sectionIcon = SECTION_EMOJIS[ingredient.section] ?? '📦'
  const sectionName = getSectionLabel(ingredient.section, customLocationName)

  const openEdit = () => {
    setEditName(ingredient.name)
    setEditQty(ingredient.quantity ?? '')
    setEditExpiry(ingredient.expiryDate ?? '')
    setEditing(true)
  }

  const saveEdit = () => {
    onUpdate(ingredient.id, {
      name:       editName.trim() || ingredient.name,
      quantity:   editQty.trim() || undefined,
      expiryDate: editExpiry || undefined,
    })
    setEditing(false)
  }

  return (
    <AnimatePresence>
      <>
        <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div key={`sh-${ingredient.id}`}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="fixed bottom-0 left-0 right-0 z-50 max-w-[390px] mx-auto"
          drag="y" dragConstraints={{ top: 0 }} dragElastic={{ top: 0, bottom: 0.4 }}
          onDragEnd={(_, i) => { if (i.offset.y > 80) onClose() }}
        >
          <div className="bg-zinc-900 rounded-t-3xl overflow-hidden border-t border-zinc-800 shadow-2xl max-h-[90dvh] flex flex-col">
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-9 h-1 bg-zinc-700 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* 이미지 2단 */}
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
                    {isCritical && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        <AlertTriangle className="w-2.5 h-2.5" />{getExpiryLabel(days!)}
                      </div>
                    )}
                  </div>
                </div>

                {/* 냉장고 실제 사진 (확대 크롭) */}
                <div className="flex flex-col gap-1">
                  <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wide pl-1">냉장고 사진</p>
                  <div className="relative h-36 bg-zinc-800 rounded-2xl overflow-hidden">
                    {sectionImageUrl && !fridgeError ? (
                      <img src={sectionImageUrl} alt="냉장고"
                        className="w-full h-full object-cover"
                        style={{
                          transform: 'scale(2.5)',
                          transformOrigin: SECTION_ORIGIN[ingredient.section] ?? 'center center',
                        }}
                        onError={() => setFridgeError(true)} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <span className="text-4xl">{sectionIcon}</span>
                        <span className="text-zinc-600 text-xs text-center px-2">{sectionName}</span>
                      </div>
                    )}
                    {sectionImageUrl && !fridgeError && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-4 pb-1.5 px-2">
                        <p className="text-white text-[10px] font-medium">{sectionIcon} {sectionName}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 이름 + 수정 토글 */}
              <div className="px-4 pt-1 pb-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-xl font-bold truncate">{ingredient.name}</h2>
                  {ingredient.quantity && !editing && (
                    <p className="text-zinc-400 text-sm mt-0.5">{ingredient.quantity}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {days !== null && !isCritical && !editing && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      isWarning ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>{getExpiryLabel(days)}</span>
                  )}
                  <button onClick={() => editing ? saveEdit() : openEdit()}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      editing ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}>
                    {editing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </button>
                  <button onClick={onClose}
                    className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 편집 폼 */}
              {editing && (
                <div className="px-4 pb-3 flex flex-col gap-2">
                  <div>
                    <label className="text-zinc-500 text-xs mb-1 block">이름</label>
                    <Input value={editName} onChange={e => setEditName(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white h-11 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs mb-1 block">수량</label>
                    <Input value={editQty} onChange={e => setEditQty(e.target.value)}
                      placeholder="예: 2개, 반 봉지..."
                      className="bg-zinc-800 border-zinc-700 text-white h-11 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs mb-1 block">소비기한</label>
                    <Input type="date" value={editExpiry} onChange={e => setEditExpiry(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white h-11 rounded-xl text-sm" />
                  </div>
                  <button onClick={saveEdit}
                    className="w-full h-11 bg-green-600 hover:bg-green-500 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98]">
                    저장하기
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="w-full h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 text-sm transition-all">
                    취소
                  </button>
                </div>
              )}

              {/* 정보 카드 (편집 중이 아닐 때) */}
              {!editing && (
                <>
                  <div className="px-4 grid grid-cols-2 gap-2 mb-4">
                    <InfoCard icon={<Calendar className="w-3.5 h-3.5" />} label="소비기한"
                      value={days === null ? '미지정' : days < 0 ? '만료됨' : days === 0 ? '오늘까지!' : `${days}일 남음`}
                      highlight={isCritical ? 'red' : isWarning ? 'amber' : undefined} />
                    <InfoCard icon={<Package className="w-3.5 h-3.5" />} label="AI 인식률"
                      value={`${Math.round(ingredient.confidence * 100)}%`}
                      highlight={ingredient.confidence >= 0.85 ? 'green' : 'amber'} />
                  </div>

                  {/* CTA */}
                  <div className="px-4 pb-6 flex flex-col gap-2">
                    <button onClick={() => { onFindRecipes(ingredient.name); onClose() }}
                      className="w-full py-3.5 flex items-center justify-center gap-2.5 rounded-2xl bg-green-600 hover:bg-green-500 active:scale-[0.98] text-white font-semibold text-base transition-all">
                      <ChefHat className="w-5 h-5" />이 재료로 레시피 찾기
                    </button>
                    <button onClick={() => { onDelete(ingredient.id); onClose() }}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl border border-red-900/60 bg-red-950/30 text-red-400 hover:bg-red-950/50 active:scale-[0.98] text-sm font-medium transition-all">
                      <Trash2 className="w-4 h-4" />냉장고에서 제거
                    </button>
                  </div>
                </>
              )}
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
