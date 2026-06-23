'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Check, Trash2, KeyRound, ExternalLink, RotateCcw, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SettingsSheetProps {
  open: boolean
  apiKey: string
  onSave: (key: string) => void
  onClear: () => void
  onReset: () => void   // API 키 + 재료 전체 초기화
  onClose: () => void
}

export function SettingsSheet({ open, apiKey, onSave, onClear, onReset, onClose }: SettingsSheetProps) {
  const [draft, setDraft] = useState('')
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (open) { setDraft(apiKey); setSaved(false); setConfirmReset(false) }
  }, [open, apiKey])

  const handleSave = () => {
    if (!draft.trim()) return
    onSave(draft.trim())
    setSaved(true)
    setTimeout(() => onClose(), 800)   // 저장 후 자동으로 닫힘
  }

  const handleReset = () => {
    if (confirmReset) {
      onReset()
      setDraft('')
      setConfirmReset(false)
      onClose()
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  const maskedKey = apiKey ? `${apiKey.slice(0, 7)}${'•'.repeat(16)}${apiKey.slice(-4)}` : ''
  const isValid = draft.startsWith('sk-') && draft.length > 20

  return (
    <AnimatePresence>
      {open && (
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
            <div className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 shadow-2xl">
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-9 h-1 bg-zinc-700 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-green-400" />
                  <span className="text-white font-bold text-base">설정</span>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-5 flex flex-col gap-4 pb-8">
                {/* 현재 키 상태 */}
                {apiKey ? (
                  <div className="flex items-center gap-3 px-3 py-3 bg-green-950/40 border border-green-800/50 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-green-400 text-xs font-semibold">API 키 등록됨</p>
                      <p className="text-zinc-400 text-[11px] font-mono truncate mt-0.5">{maskedKey}</p>
                    </div>
                    <button onClick={onClear} className="text-zinc-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-zinc-500" />
                    <p className="text-zinc-400 text-xs">API 키 없음 — 데모 모드로 동작 중</p>
                  </div>
                )}

                {/* 입력 */}
                <div className="flex flex-col gap-2">
                  <label className="text-zinc-400 text-sm font-medium">OpenAI API Key</label>
                  <div className="relative">
                    <Input
                      type={visible ? 'text' : 'password'}
                      value={draft}
                      onChange={e => { setDraft(e.target.value); setSaved(false) }}
                      onKeyDown={e => e.key === 'Enter' && isValid && handleSave()}
                      placeholder="sk-..."
                      className="pr-11 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 h-12 font-mono text-sm rounded-xl"
                    />
                    <button type="button" onClick={() => setVisible(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {draft && !isValid && (
                    <p className="text-amber-400 text-xs">sk- 로 시작하는 키를 입력해주세요</p>
                  )}
                </div>

                {/* 저장 버튼 */}
                <Button onClick={handleSave} disabled={!isValid || saved}
                  className={`w-full h-12 text-base font-semibold rounded-xl gap-2 transition-all ${
                    saved ? 'bg-green-700 text-white' : 'bg-green-600 hover:bg-green-500 text-white'
                  }`}>
                  {saved ? <><Check className="w-4 h-4" /> 저장됨</> : '저장'}
                </Button>

                {/* 발급 안내 */}
                <div className="bg-zinc-800/60 rounded-2xl p-4 flex flex-col gap-2">
                  <p className="text-zinc-400 text-sm font-medium">API 키 발급 방법</p>
                  <ol className="flex flex-col gap-1.5">
                    {['platform.openai.com 접속','API Keys 메뉴 선택','Create new secret key','생성된 키를 위에 붙여넣기'].map((s,i) => (
                      <li key={i} className="flex gap-2 text-zinc-500 text-xs">
                        <span className="font-bold text-zinc-600 shrink-0">{i+1}.</span>{s}
                      </li>
                    ))}
                  </ol>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-green-400 text-xs mt-1 hover:text-green-300">
                    <ExternalLink className="w-3 h-3" />platform.openai.com/api-keys
                  </a>
                </div>

                {/* 전체 초기화 */}
                <div className="border-t border-zinc-800 pt-4">
                  <button onClick={handleReset}
                    className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all ${
                      confirmReset
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'border-zinc-700 text-zinc-500 hover:border-red-800 hover:text-red-400'
                    }`}>
                    {confirmReset
                      ? <><AlertTriangle className="w-4 h-4" /> 한 번 더 누르면 모두 초기화됩니다</>
                      : <><RotateCcw className="w-4 h-4" /> 앱 전체 초기화</>
                    }
                  </button>
                  <p className="text-zinc-600 text-[11px] text-center mt-2">재료·API 키·장소 설정이 모두 삭제됩니다</p>
                </div>

                <p className="text-zinc-600 text-[10px] text-center">키는 이 기기 브라우저에만 저장됩니다</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
