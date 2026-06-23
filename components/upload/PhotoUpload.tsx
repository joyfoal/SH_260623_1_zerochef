'use client'

import { useRef, useState } from 'react'
import { Camera, Upload, Sparkles, Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { analyzeFridgeImage } from '@/app/actions/fridge'

interface PhotoUploadProps {
  onAnalyzeComplete: () => void
  apiKey: string
}

const PROGRESS_STEPS = [
  { pct: 20, label: '이미지 분석 중...' },
  { pct: 45, label: '식재료 인식 중...' },
  { pct: 70, label: '위치 매핑 중...' },
  { pct: 90, label: '레시피 준비 중...' },
  { pct: 100, label: '완료!' },
]

export function PhotoUpload({ onAnalyzeComplete, apiKey }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusLabel, setStatusLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    setAnalyzing(true)
    setProgress(0)

    if (apiKey) {
      // Real API call
      try {
        setStatusLabel('이미지 변환 중...')
        setProgress(10)

        const base64 = await fileToBase64(file)
        setStatusLabel('AI가 식재료를 인식하고 있어요...')
        setProgress(30)

        await analyzeFridgeImage(base64, apiKey)

        setProgress(90)
        setStatusLabel('완료!')
        await new Promise(r => setTimeout(r, 500))
        setProgress(100)
        await new Promise(r => setTimeout(r, 300))
        onAnalyzeComplete()
      } catch (e: any) {
        setAnalyzing(false)
        setPreview(null)
        setError(
          e?.message?.includes('401') ? 'API 키가 유효하지 않아요. 설정에서 확인해주세요.' :
          e?.message?.includes('429') ? '요청 한도를 초과했어요. 잠시 후 다시 시도해주세요.' :
          'AI 분석 중 오류가 발생했어요. 다시 시도해주세요.'
        )
      }
    } else {
      // Demo mode — simulate progress
      for (const step of PROGRESS_STEPS) {
        setStatusLabel(step.label)
        setProgress(step.pct)
        await new Promise(r => setTimeout(r, 600))
      }
      await new Promise(r => setTimeout(r, 300))
      onAnalyzeComplete()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
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
                <p className="text-white font-medium text-sm">{statusLabel || 'AI가 재료를 인식하고 있어요'}</p>
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
          {/* API key notice */}
          {!apiKey && (
            <div className="w-full max-w-sm mb-4 flex items-center gap-2.5 px-3 py-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl fade-in-up">
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-amber-300 text-xs">
                API 키 미등록 — 사진 업로드 시 데모 모드로 동작해요
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="w-full max-w-sm mb-4 px-3 py-2.5 bg-red-950/40 border border-red-500/30 rounded-xl fade-in-up">
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          {/* Upload zone */}
          <div
            className="w-full max-w-sm border-2 border-dashed border-zinc-700 rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-green-500/50 hover:bg-green-500/5 transition-all active:scale-[0.99] fade-in-up"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center">
              <Camera className="w-8 h-8 text-zinc-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-1">냉장고 사진 업로드</p>
              <p className="text-zinc-500 text-xs">문을 열고 정면에서 찍어주세요</p>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white gap-2">
              <Upload className="w-4 h-4" />
              사진 선택
            </Button>
          </div>

          {/* Demo mode */}
          <div className="mt-6 fade-in-up">
            <button
              onClick={onAnalyzeComplete}
              className="flex items-center gap-2 text-zinc-400 text-sm hover:text-green-400 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              데모 모드로 바로 시작하기
            </button>
          </div>

          {/* Feature pills */}
          <div className="flex gap-2 mt-8 flex-wrap justify-center fade-in-up">
            {['AI 자동 인식', '1초 수정', '5분 레시피'].map(f => (
              <span key={f} className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full">
                ✓ {f}
              </span>
            ))}
          </div>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
