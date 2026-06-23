'use client'

import { useRef, useState } from 'react'
import { Camera, Upload, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PhotoUploadProps {
  onAnalyzeComplete: () => void
}

export function PhotoUpload({ onAnalyzeComplete }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setAnalyzing(true)
    setProgress(0)

    // Simulate progressive analysis steps
    const steps = [
      { pct: 20, msg: '이미지 분석 중...' },
      { pct: 45, msg: '식재료 인식 중...' },
      { pct: 70, msg: '위치 매핑 중...' },
      { pct: 90, msg: '레시피 준비 중...' },
      { pct: 100, msg: '완료!' },
    ]

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600))
      setProgress(step.pct)
    }

    await new Promise(r => setTimeout(r, 400))
    onAnalyzeComplete()
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
              {/* Scanning line animation */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_12px_4px_rgba(74,222,128,0.6)]"
                style={{
                  top: `${progress}%`,
                  transition: 'top 0.6s ease',
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 bg-gradient-to-t from-black/80 via-transparent">
                <Loader2 className="w-6 h-6 text-green-400 animate-spin mb-2" />
                <p className="text-white font-medium text-sm">AI가 재료를 인식하고 있어요</p>
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
          {/* Upload zone */}
          <div
            className="w-full max-w-sm border-2 border-dashed border-zinc-700 rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-green-500/50 hover:bg-green-500/5 transition-all active:scale-98 fade-in-up"
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
