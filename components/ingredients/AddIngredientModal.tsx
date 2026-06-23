'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Mic, MicOff, Plus, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FridgeSection, Ingredient } from '@/lib/types'
import { COMMON_INGREDIENTS } from '@/lib/mock-data'
import { getSectionLabel } from '@/lib/utils'

interface AddIngredientModalProps {
  open: boolean
  section: FridgeSection | null
  onClose: () => void
  onAdd: (ingredient: Omit<Ingredient, 'id'>) => void
}

const INGREDIENT_EMOJIS: Record<string, string> = {
  '계란': '🥚', '우유': '🥛', '두부': '⬜', '김치': '🌶️', '돼지고기': '🥩',
  '쇠고기': '🥩', '닭고기': '🍗', '파': '🌿', '양파': '🧅', '마늘': '🧄',
  '당근': '🥕', '감자': '🥔', '시금치': '🥬', '버섯': '🍄', '배추': '🥬',
  '토마토': '🍅', '오이': '🥒', '라면': '🍜', '쌀': '🍚', '치즈': '🧀',
  '버터': '🧈', '요거트': '🫙', '고추장': '🌶️', '된장': '🫙', '간장': '🍶',
  '새우': '🦐', '오징어': '🦑', '사과': '🍎', '바나나': '🍌', '빵': '🍞',
}

function getEmoji(name: string): string {
  return INGREDIENT_EMOJIS[name] || '🥗'
}

export function AddIngredientModal({ open, section, onClose, onAdd }: AddIngredientModalProps) {
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const filtered = query.length > 0
    ? COMMON_INGREDIENTS.filter(i => i.includes(query)).slice(0, 12)
    : COMMON_INGREDIENTS.slice(0, 16)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setListening(false)
    }
  }, [open])

  const handleAdd = (name: string) => {
    if (!section || !name.trim()) return
    onAdd({
      name: name.trim(),
      emoji: getEmoji(name.trim()),
      section,
      confidence: 1,
      status: 'confirmed',
    })
    onClose()
  }

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('이 브라우저는 음성 입력을 지원하지 않아요')
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'ko-KR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setQuery(transcript)
      setListening(false)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-base">
            재료 추가
            {section && (
              <span className="ml-2 text-zinc-400 text-sm font-normal">
                · {getSectionLabel(section)}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query && handleAdd(query)}
            placeholder="재료 이름 입력..."
            className="pl-9 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-11"
            autoFocus
          />
          <button
            onClick={toggleVoice}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
              listening ? 'text-red-400' : 'text-zinc-500 hover:text-green-400'
            }`}
          >
            {listening ? (
              <div className="relative">
                <MicOff className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>

        {listening && (
          <p className="text-center text-red-400 text-xs animate-pulse">🎤 말씀해 주세요...</p>
        )}

        {/* Quick add if query doesn't match */}
        {query && !COMMON_INGREDIENTS.includes(query) && (
          <Button
            onClick={() => handleAdd(query)}
            className="w-full bg-green-600 hover:bg-green-500 text-white gap-2"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            "{query}" 직접 추가
          </Button>
        )}

        {/* Suggestions grid */}
        <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
          {filtered.map(item => (
            <button
              key={item}
              onClick={() => handleAdd(item)}
              className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all"
            >
              <span className="text-lg">{getEmoji(item)}</span>
              <span className="text-zinc-300 text-[10px] leading-tight text-center">{item}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
