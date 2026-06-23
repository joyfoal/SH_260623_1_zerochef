'use client'

import { useRef, useState } from 'react'
import { Camera, ImageIcon, Loader2, Settings } from 'lucide-react'
import { analyzeFridgeImage } from '@/app/actions/fridge'
import { Ingredient } from '@/lib/types'

interface PhotoUploadProps {
  onAnalyzeComplete: (ingredients: Ingredient[]) => void
  onOpenSettings: () => void
  apiKey: string
}

export function PhotoUpload({ onAnalyzeComplete, onOpenSettings, apiKey }: PhotoUploadProps) {
  const cameraRef  = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [preview,     setPreview]     = useState<string | null>(null)
  const [analyzing,   setAnalyzing]   = useState(false)
  const [progress,    setProgress]    = useState(0)
  const [statusLabel, setStatusLabel] = useState('')
  const [error,       setError]       = useState<string | null>(null)

  const handleFile = async (file: File) => {
    if (!apiKey) return
    setError(null)
    setPreview(URL.createObjectURL(file))
    setAnalyzing(true)
    setProgress(0)

    try {
      setStatusLabel('이미지 변환 중...'); setProgress(15)
      const base64 = await fileToBase64(file)

      setStatusLabel('AI가 식재료를 인식하고 있어요...'); setProgress(40)
      const result = await analyzeFridgeImage(base64, apiKey)

      setProgress(85); setStatusLabel('완료!')
      await new Promise(r => setTimeout(r, 400))
      setProgress(100)
      await new Promise(r => setTimeout(r, 300))

      const ingredients: Ingredient[] = result.map(
        (item, idx) => ({
          ...item,
          id: item.id ?? String(Date.now() + idx),
          status: item.status ?? 'confirmed',
        } as Ingredient)
      )
      onAnalyzeComplete(ingredients)
    } catch (e: any) {
      setAnalyzing(false)
      setPreview(null)
      setError(
        e?.message?.includes('401') ? 'API 키가 유효하지 않아요. 설정(⚙️)에서 확인해주세요.' :
        e?.message?.includes('429') ? '요청 한도를 초과했어요. 잠시 후 다시 시도해주세요.' :
        'AI 분석 중 오류가 발생했어요. 다시 시도해주세요.'
      )
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleFile(file)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-120px)] px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🧊</div>
        <p className="text-white text-xl font-bold">사진 한 장으로 해결하는 요리</p>
        <p className="text-zinc-500 text-sm mt-1.5">냉장고 문을 열고 정면 사진을 찍어주세요</p>
      </div>

      {analyzing ? (
        <div className="w-full max-w-sm">
          {preview && (
            <div className="relative w-full aspect-[3/4] mb-6 rounded-2xl overflow-hidden">
              <img src={preview} alt="냉장고" className="w-full h-full object-cover opacity-60" />
              <div
                className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_12px_4px_rgba(74,222,128,0.6)]"
                style={{ top: `${progress}%`, transition: 'top 0.6s ease' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 bg-gradient-to-t from-black/80 via-transparent">
                <Loader2 className="w-6 h-6 text-green-400 animate-spin mb-2" />
                <p className="text-white font-medium text-sm">{statusLabel}</p>
                <p className="text-green-400 font-bold text-lg mt-1">{progress}%</p>
              </div>
            </div>
          )}
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <div className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <>
          {/* API 키 미등록 */}
          {!apiKey && (
            <div className="w-full max-w-sm mb-5">
              <div className="flex flex-col items-center gap-3 p-5 bg-zinc-800/60 border border-zinc-700 rounded-2xl text-center">
                <span className="text-3xl">🔑</span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">API 키를 먼저 등록해주세요</p>
                  <p className="text-zinc-500 text-xs">OpenAI API 키가 있어야 냉장고 분석이 가능해요</p>
                </div>
                <button onClick={onOpenSettings}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-white text-sm font-semibold transition-all active:scale-95">
                  <Settings className="w-4 h-4" />설정에서 등록하기
                </button>
              </div>
            </div>
          )}

          {/* 오류 */}
          {error && (
            <div className="w-full max-w-sm mb-4 px-3 py-2.5 bg-red-950/40 border border-red-500/30 rounded-xl">
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          {/* 업로드 영역 */}
          <div
            className="w-full max-w-sm"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <div className="flex gap-3 w-full">
              <button
                onClick={() => cameraRef.current?.click()}
                disabled={!apiKey}
                className="flex-1 flex flex-col items-center gap-2.5 py-6 rounded-2xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-all">
                <Camera className="w-7 h-7 text-white" />
                <span className="text-white text-sm font-bold">바로 촬영</span>
              </button>
              <button
                onClick={() => galleryRef.current?.click()}
                disabled={!apiKey}
                className="flex-1 flex flex-col items-center gap-2.5 py-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-all">
                <ImageIcon className="w-7 h-7 text-zinc-300" />
                <span className="text-zinc-300 text-sm font-bold">앨범 선택</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-8 flex-wrap justify-center">
            {['AI 자동 인식', '구역별 정리', '레시피 추천'].map(f => (
              <span key={f} className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full">✓ {f}</span>
            ))}
          </div>
        </>
      )}

      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleChange} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  )
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
