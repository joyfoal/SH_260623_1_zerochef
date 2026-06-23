'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, ImageIcon, Loader2, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CustomLocation, Ingredient } from '@/lib/types'
import { analyzeFridgeImage } from '@/app/actions/fridge'

const LOCATION_PRESETS = [
  { name: '김치냉장고', emoji: '🌶️' },
  { name: '베란다 냉장고', emoji: '🏠' },
  { name: '냉동고', emoji: '❄️' },
  { name: '팬트리', emoji: '🗄️' },
  { name: '식료품 창고', emoji: '📦' },
  { name: '와인셀러', emoji: '🍷' },
]

interface AddLocationModalProps {
  open: boolean
  apiKey: string
  model?: string
  onAdd: (location: CustomLocation, ingredients: Ingredient[], imageUrl?: string) => void
  onClose: () => void
  onOpenSettings?: () => void
}

export function AddLocationModal({ open, apiKey, model, onAdd, onClose, onOpenSettings }: AddLocationModalProps) {
  const cameraRef  = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [name, setName]       = useState('')
  const [emoji, setEmoji]     = useState('📦')
  const [analyzing, setAnalyzing] = useState(false)
  const [progress,  setProgress]  = useState(0)

  const reset = () => { setName(''); setEmoji('📦'); setAnalyzing(false); setProgress(0) }

  const handlePhoto = async (file: File) => {
    if (!name.trim() || !apiKey) return
    setAnalyzing(true); setProgress(20)
    const locationId = `custom-${Date.now()}`
    const location: CustomLocation = { id: locationId, name: name.trim(), emoji }
    const imageUrl = URL.createObjectURL(file)

    try {
      setProgress(40)
      const base64 = await fileToJpegBase64(file)
      setProgress(70)
      const result = await analyzeFridgeImage(base64, apiKey, model)
      setProgress(95)
      const newIngredients: Ingredient[] = result.map((item, idx) => ({
        ...item, id: `${locationId}-${idx}`, section: locationId,
        status: (item.status ?? 'confirmed') as Ingredient['status'],
      } as Ingredient))
      await new Promise(r => setTimeout(r, 300))
      onAdd(location, newIngredients, imageUrl)
    } catch {
      URL.revokeObjectURL(imageUrl)
      onAdd(location, [])
    }
    reset(); onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = ''
  }

  const handleAddWithoutPhoto = () => {
    if (!name.trim()) return
    const locationId = `custom-${Date.now()}`
    onAdd({ id: locationId, name: name.trim(), emoji }, [])
    reset(); onClose()
  }

  return (
    <>
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment"
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden', border: 'none', padding: 0, pointerEvents: 'none' }}
        onChange={handleChange} />
      <input ref={galleryRef} type="file" accept="image/*"
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden', border: 'none', padding: 0, pointerEvents: 'none' }}
        onChange={handleChange} />

      <AnimatePresence>
        {open && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => { reset(); onClose() }} />

            <motion.div key="sh"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-[390px] mx-auto"
              drag="y" dragConstraints={{ top: 0 }} dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, i) => { if (i.offset.y > 80) { reset(); onClose() } }}
            >
              <div className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 shadow-2xl">
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-9 h-1 bg-zinc-700 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                  <span className="text-white font-bold text-base">📍 새 장소 추가</span>
                  <button onClick={() => { reset(); onClose() }}
                    className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-5 py-4 flex flex-col gap-4 pb-8">
                  {analyzing ? (
                    <div className="py-10 flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                      <p className="text-white font-medium">{name} 분석 중...</p>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5">
                        <div className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 장소명 입력 */}
                      <div>
                        <label className="text-zinc-400 text-sm font-medium mb-2 block">장소 이름</label>
                        <div className="flex gap-2">
                          <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-xl text-2xl flex items-center justify-center shrink-0">
                            {emoji}
                          </div>
                          <Input value={name} onChange={e => setName(e.target.value)}
                            placeholder="예: 김치냉장고, 베란다 냉장고..."
                            className="flex-1 bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl text-base" />
                        </div>
                      </div>

                      {/* 프리셋 */}
                      <div className="grid grid-cols-3 gap-2">
                        {LOCATION_PRESETS.map(p => (
                          <button key={p.name}
                            onClick={() => { setName(p.name); setEmoji(p.emoji) }}
                            className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs transition-all active:scale-95 ${
                              name === p.name
                                ? 'border-green-500 bg-green-950/40 text-green-400'
                                : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                            }`}>
                            <span className="text-xl">{p.emoji}</span>
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* 촬영 또는 API 키 안내 */}
                      {apiKey ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-zinc-400 text-sm font-medium">사진으로 재료 인식하기</p>
                          <div className="flex gap-2">
                            <button onClick={() => cameraRef.current?.click()} disabled={!name.trim()}
                              className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
                              <Camera className="w-6 h-6 text-white" />
                              <span className="text-white text-sm font-semibold">바로 촬영</span>
                            </button>
                            <button onClick={() => galleryRef.current?.click()} disabled={!name.trim()}
                              className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
                              <ImageIcon className="w-6 h-6 text-zinc-300" />
                              <span className="text-zinc-300 text-sm font-semibold">앨범 선택</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 p-3.5 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                          <p className="text-zinc-400 text-xs font-medium">API 키 없이는 재료 인식이 불가해요</p>
                          {onOpenSettings && (
                            <button onClick={() => { reset(); onClose(); onOpenSettings() }}
                              className="flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600/20 border border-green-600/40 text-green-400 text-xs font-semibold">
                              <Settings className="w-3.5 h-3.5" />설정에서 API 키 등록
                            </button>
                          )}
                        </div>
                      )}

                      {/* 사진 없이 장소만 추가 */}
                      <button onClick={handleAddWithoutPhoto} disabled={!name.trim()}
                        className="text-zinc-500 text-xs hover:text-zinc-400 transition-colors text-center disabled:opacity-40">
                        사진 없이 장소만 추가하기
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function fileToJpegBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1600
      let { width, height } = img
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height)
        width = Math.round(width * ratio); height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.88).split(',')[1])
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject; reader.readAsDataURL(file)
    }
    img.src = objectUrl
  })
}
