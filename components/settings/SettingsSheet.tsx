'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Check, Trash2, KeyRound, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SettingsSheetProps {
  open: boolean
  apiKey: string
  onSave: (key: string) => void
  onClear: () => void
  onClose: () => void
}

export function SettingsSheet({ open, apiKey, onSave, onClear, onClose }: SettingsSheetProps) {
  const [draft, setDraft] = useState(apiKey)
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleOpen = () => {
    setDraft(apiKey)
    setSaved(false)
  }

  const handleSave = () => {
    if (!draft.trim()) return
    onSave(draft.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    onClear()
    setDraft('')
  }

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 7)}${'•'.repeat(20)}${apiKey.slice(-4)}`
    : ''

  const isValid = draft.startsWith('sk-') && draft.length > 20

  return (
    <AnimatePresence onExitComplete={() => setDraft(apiKey)}>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            onAnimationStart={() => open && handleOpen()}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
          >
            <div className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 shadow-2xl">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-9 h-1 bg-zinc-700 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-green-400" />
                  <span className="text-white font-bold">API 키 설정</span>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-5 flex flex-col gap-5 pb-8">
                {/* Current key status */}
                {apiKey ? (
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-green-950/40 border border-green-800/50 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-green-400 text-xs font-medium">키 등록됨</p>
                      <p className="text-zinc-400 text-[11px] font-mono truncate">{maskedKey}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-zinc-500" />
                    <p className="text-zinc-400 text-xs">키가 등록되지 않았어요. 데모 모드로 동작 중입니다.</p>
                  </div>
                )}

                {/* Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-zinc-400 text-xs font-medium">
                    OpenAI API Key
                  </label>
                  <div className="relative">
                    <Input
                      type={visible ? 'text' : 'password'}
                      value={draft}
                      onChange={e => { setDraft(e.target.value); setSaved(false) }}
                      placeholder="sk-..."
                      className="pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 h-11 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setVisible(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {draft && !isValid && (
                    <p className="text-amber-400 text-[11px]">
                      유효한 키는 sk- 로 시작합니다
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={!isValid || saved}
                    className={`flex-1 h-11 gap-2 font-medium transition-all ${
                      saved
                        ? 'bg-green-700 text-white'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {saved ? (
                      <><Check className="w-4 h-4" /> 저장됨</>
                    ) : (
                      '저장'
                    )}
                  </Button>
                  {apiKey && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="border-red-900/60 text-red-400 hover:bg-red-950/30 h-11 gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </Button>
                  )}
                </div>

                {/* Guide */}
                <div className="bg-zinc-800/60 rounded-xl p-3.5 flex flex-col gap-2">
                  <p className="text-zinc-400 text-xs font-medium">API 키 발급 방법</p>
                  <ol className="flex flex-col gap-1">
                    {[
                      'platform.openai.com 접속',
                      'API Keys 메뉴 선택',
                      'Create new secret key 클릭',
                      '생성된 키를 위에 붙여넣기',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-zinc-500 text-[11px]">
                        <span className="text-zinc-600 font-bold shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-green-400 text-xs mt-1 hover:text-green-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    platform.openai.com/api-keys
                  </a>
                </div>

                <p className="text-zinc-600 text-[10px] text-center">
                  키는 이 기기의 브라우저에만 저장되며 외부로 전송되지 않습니다
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
