'use client'

import { useRef, useState } from 'react'
import { Camera, ImageIcon, Sparkles, Loader2, KeyRound } from 'lucide-react'
import { analyzeFridgeImage } from '@/app/actions/fridge'
import { Ingredient } from '@/lib/types'
import { MOCK_INGREDIENTS } from '@/lib/mock-data'

interface PhotoUploadProps {
  onAnalyzeComplete: (ingredients: Ingredient[]) => void
  apiKey: string
}

export function PhotoUpload({ onAnalyzeComplete, apiKey }: PhotoUploadProps) {
  // 두 개의 input ref: 카메라 직접촬영 / 앨범 선택
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusLabel, setStatusLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setPreview(URL.createObjectURL(file))
    setAnalyzing(true)
    setProgress(0)

    if (apiKey) {
      try {
        setStatusLabel('이미지 변환 중...')
        setProgress(15)
        const base64 = await fileToBase64(file)

        setStatusLabel('AI가 식재료를 인식하고 있어요...')
        setProgress(40)
        const result = await analyzeFridgeImage(base64, apiKey)

        setProgress(85)
        setStatusLabel('위치 매핑 중...')
        await new Promise(r => setTimeout(r, 400))

        setProgress(100)
        setStatusLabel('완료!')
        await new Promise(r => setTimeout(r, 300))

        // API 결과가 있으면 사용, 없으면 데모 데이터
        const ingredients: Ingredient[] = (result.length > 0 ? result : MOCK_INGREDIENTS).map(
          (item, idx) => ({ ...item, id: item.id ?? String(Date.now() + idx), status: item.status ?? 'confirmed' } as Ingredient)
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
    } else {
      // 데모 모드 — 애니메이션만 보여주고 목데이터 사용
      const steps = [
        { pct: 20, label: '이미지 분석 중...' },
        { pct: 45, label: '식재료 인식 중...' },
        { pct: 70, label: '위치 매핑 중...' },
        { pct: 90, label: '레시피 준비 중...' },
        { pct: 100, label: '완료!' },
      ]
      for (const s of steps) {
        setProgress(s.pct)
        setStatusLabel(s.label)
        await new Promise(r => setTimeout(r, 600))
      }
      await new Promise(r => setTimeout(r, 300))
      onAnalyzeComplete(MOCK_INGREDIENTS)
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      {/* Header */}
      <div className="text-center mb-8 fade-in-up">
        <div className="text-5xl mb-3">🧊</div>
        <h1 className="text-2xl font-bold text-white mb-1">스마트 냉장고 셰프</h1>
        <p className="text-zinc-400 text-sm">냉장고 사진 한 장으로 오늘 저녁을 해결해요</p>
      </div>

      {analyzing ? (
        /* 분석 중 화면 */
        <div className="w-full max-w-sm fade-in-up">
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
            <div
              className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          {/* API 키 없음 안내 */}
          {!apiKey && (
            <div className="w-full max-w-sm mb-4 flex items-center gap-2.5 px-3 py-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl fade-in-up">
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-amber-300 text-xs">API 키 미등록 — 데모 목데이터로 동작해요</p>
            </div>
          )}

          {/* 오류 */}
          {error && (
            <div className="w-full max-w-sm mb-4 px-3 py-2.5 bg-red-950/40 border border-red-500/30 rounded-xl fade-in-up">
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          {/* 업로드 영역 (드래그 앤 드롭) */}
          <div
            className="w-full max-w-sm border-2 border-dashed border-zinc-700 rounded-2xl p-6 flex flex-col items-center gap-5 fade-in-up"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center">
              <Camera className="w-7 h-7 text-zinc-400" />
            </div>
            <p className="text-white font-medium text-center">
              냉장고 사진을 등록해주세요
              <span className="block text-zinc-500 text-xs mt-1">문을 열고 정면에서 찍어주세요</span>
            </p>

            {/* 두 버튼: 직접 촬영 / 앨범 선택 */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex-1 flex flex-col items-center gap-2 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 active:scale-[0.97] transition-all"
              >
                <Camera className="w-5 h-5 text-white" />
                <span className="text-white text-xs font-semibold">바로 촬영</span>
              </button>
              <button
                onClick={() => galleryRef.current?.click()}
                className="flex-1 flex flex-col items-center gap-2 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 active:scale-[0.97] transition-all"
              >
                <ImageIcon className="w-5 h-5 text-zinc-300" />
                <span className="text-zinc-300 text-xs font-semibold">앨범 선택</span>
              </button>
            </div>
          </div>

          {/* 데모 모드 */}
          <div className="mt-6 fade-in-up">
            <button
              onClick={() => onAnalyzeComplete(MOCK_INGREDIENTS)}
              className="flex items-center gap-2 text-zinc-400 text-sm hover:text-green-400 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              데모 모드로 바로 시작하기
            </button>
          </div>

          <div className="flex gap-2 mt-8 flex-wrap justify-center fade-in-up">
            {['AI 자동 인식', '1초 수정', '5분 레시피'].map(f => (
              <span key={f} className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full">
                ✓ {f}
              </span>
            ))}
          </div>
        </>
      )}

      {/* 카메라 직접 촬영 input */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      {/* 앨범 선택 input */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
