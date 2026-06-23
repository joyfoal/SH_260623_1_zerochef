'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Check, Key, ChevronLeft, AlertTriangle, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ApiKeyEntry } from '@/hooks/useApiKeys'

interface SettingsSheetProps {
  open: boolean
  keys: ApiKeyEntry[]
  activeId: string
  onAddKey: (label: string, key: string) => void
  onRemoveKey: (id: string) => void
  onActivateKey: (id: string) => void
  onReset: () => void
  onClose: () => void
}

export function SettingsSheet({
  open, keys, activeId, onAddKey, onRemoveKey, onActivateKey, onReset, onClose,
}: SettingsSheetProps) {
  const [view, setView]         = useState<'main' | 'add'>('main')
  const [newLabel, setNewLabel] = useState('')
  const [newKey, setNewKey]     = useState('')
  const [showKey, setShowKey]   = useState(false)
  const [resetStep, setResetStep] = useState(0)
  const [visibleId, setVisibleId] = useState<string | null>(null)

  const handleClose = () => {
    setView('main'); setNewLabel(''); setNewKey(''); setShowKey(false)
    onClose()
  }

  const handleAdd = () => {
    if (!newKey.trim().startsWith('sk-')) return
    onAddKey(newLabel.trim() || `API 키 ${keys.length + 1}`, newKey.trim())
    setNewLabel(''); setNewKey(''); setShowKey(false)
    setView('main')
    setTimeout(handleClose, 400)
  }

  const handleReset = () => {
    if (resetStep === 0) { setResetStep(1); setTimeout(() => setResetStep(0), 3000) }
    else { onReset(); setResetStep(0); handleClose() }
  }

  const maskKey = (k: string) => k.slice(0, 7) + '••••••••' + k.slice(-4)
  const isValid = newKey.trim().startsWith('sk-') && newKey.trim().length > 20

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

          <motion.div key="sh"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-[390px] mx-auto"
            drag="y" dragConstraints={{ top: 0 }} dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, i) => { if (i.offset.y > 80) handleClose() }}
          >
            <div className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 shadow-2xl max-h-[88dvh] flex flex-col">
              {/* 핸들 */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-9 h-1 bg-zinc-700 rounded-full" />
              </div>

              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  {view === 'add' && (
                    <button onClick={() => { setView('main'); setNewKey(''); setNewLabel('') }}
                      className="text-zinc-400 hover:text-white -ml-1 mr-0.5 p-1">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <span className="text-white font-bold text-base">
                    {view === 'main' ? '⚙️ 설정' : '🔑 새 API 키 등록'}
                  </span>
                </div>
                <button onClick={handleClose}
                  className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 pb-10 flex flex-col gap-5">
                {view === 'main' ? (
                  <>
                    {/* ── API 키 관리 ── */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-zinc-300 text-sm font-bold">API 키 관리</h3>
                        <button onClick={() => setView('add')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-xl text-white text-xs font-semibold transition-colors active:scale-95">
                          <Plus className="w-3.5 h-3.5" />새 키 등록
                        </button>
                      </div>

                      {keys.length === 0 ? (
                        <button onClick={() => setView('add')}
                          className="w-full flex items-center gap-3 p-4 bg-zinc-800/60 border-2 border-dashed border-zinc-700 rounded-2xl text-zinc-500 hover:border-green-500/40 hover:text-zinc-400 transition-all active:scale-[0.98]">
                          <Key className="w-5 h-5 shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-semibold">API 키를 등록해주세요</p>
                            <p className="text-xs text-zinc-600">OpenAI sk-... 키가 필요합니다</p>
                          </div>
                          <Plus className="w-4 h-4 ml-auto" />
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {keys.map(entry => {
                            const isActive = entry.id === activeId
                            const isVis    = visibleId === entry.id
                            return (
                              <div key={entry.id}
                                className={`p-3.5 rounded-2xl border transition-all ${
                                  isActive ? 'border-green-500/50 bg-green-950/20' : 'border-zinc-700 bg-zinc-800/40'
                                }`}>
                                <div className="flex items-center gap-2.5">
                                  <button onClick={() => onActivateKey(entry.id)}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                      isActive ? 'border-green-400 bg-green-400' : 'border-zinc-600 hover:border-green-500'
                                    }`}>
                                    {isActive && <Check className="w-3 h-3 text-black" />}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{entry.label}</p>
                                    <p className="text-zinc-500 text-[11px] font-mono mt-0.5 truncate">
                                      {isVis ? entry.key : maskKey(entry.key)}
                                    </p>
                                  </div>
                                  <button onClick={() => setVisibleId(isVis ? null : entry.id)}
                                    className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-zinc-400">
                                    {isVis ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button onClick={() => onRemoveKey(entry.id)}
                                    className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {isActive && (
                                  <p className="text-green-400 text-[10px] font-bold mt-1.5 pl-8">✓ 현재 사용 중</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <div className="mt-3 bg-zinc-800/40 rounded-xl p-3.5 flex flex-col gap-1.5">
                        <p className="text-zinc-400 text-xs font-semibold">API 키 발급</p>
                        <ol className="flex flex-col gap-1">
                          {['platform.openai.com 접속', 'API Keys 메뉴 선택', 'Create new secret key', '생성된 키를 여기에 등록'].map((s, i) => (
                            <li key={i} className="flex gap-2 text-zinc-500 text-[11px]">
                              <span className="text-zinc-600 font-bold shrink-0">{i + 1}.</span>{s}
                            </li>
                          ))}
                        </ol>
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-400 text-[11px] mt-0.5 hover:text-green-300">
                          <ExternalLink className="w-3 h-3" />platform.openai.com/api-keys
                        </a>
                      </div>
                    </section>

                    {/* ── 앱 초기화 ── */}
                    <section className="border-t border-zinc-800 pt-4">
                      <h3 className="text-zinc-300 text-sm font-bold mb-1.5">앱 초기화</h3>
                      <p className="text-zinc-600 text-xs mb-3 leading-relaxed">
                        재료 목록, 커스텀 장소, 등록된 모든 API 키를 삭제하고<br />처음 상태로 돌아갑니다.
                      </p>
                      <button onClick={handleReset}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border text-sm font-semibold transition-all active:scale-[0.98] ${
                          resetStep === 1
                            ? 'border-red-500 bg-red-950/50 text-red-400'
                            : 'border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:border-red-800 hover:text-red-400'
                        }`}>
                        <AlertTriangle className="w-4 h-4" />
                        {resetStep === 1 ? '한 번 더 누르면 모두 삭제됩니다' : '모든 데이터 초기화'}
                      </button>
                    </section>
                  </>
                ) : (
                  /* ── 새 키 등록 폼 ── */
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-zinc-400 text-sm font-medium mb-2 block">키 이름 (선택)</label>
                      <Input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                        placeholder="예: 메인 키, 회사 키, 개인 키..."
                        className="bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl text-base" />
                    </div>

                    <div>
                      <label className="text-zinc-400 text-sm font-medium mb-2 block">API 키 *</label>
                      <div className="relative">
                        <Input
                          type={showKey ? 'text' : 'password'}
                          value={newKey}
                          onChange={e => setNewKey(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && isValid && handleAdd()}
                          placeholder="sk-..."
                          className="bg-zinc-800 border-zinc-700 text-white h-12 rounded-xl text-base pr-12 font-mono"
                        />
                        <button onClick={() => setShowKey(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {newKey && !isValid && (
                        <p className="text-amber-400 text-xs mt-1.5">sk- 로 시작하는 키를 입력해주세요</p>
                      )}
                    </div>

                    <button onClick={handleAdd} disabled={!isValid}
                      className="w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-all active:scale-[0.98]">
                      <Key className="w-5 h-5" />등록하기
                    </button>

                    <p className="text-zinc-600 text-xs text-center leading-relaxed">
                      API 키는 이 기기의 브라우저 로컬 스토리지에만 저장되며<br />
                      외부 서버로 전송되지 않습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
