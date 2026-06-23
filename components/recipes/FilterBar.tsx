'use client'

import { FilterType } from '@/lib/types'

interface FilterBarProps {
  active: FilterType
  onChange: (filter: FilterType) => void
  expiringCount: number
}

const FILTERS: { id: FilterType; label: string; emoji: string }[] = [
  { id: 'all', label: '전체', emoji: '🍽️' },
  { id: 'high-match', label: '재료 일치율 순', emoji: '📊' },
  { id: '5min', label: '5분 이내', emoji: '⚡' },
  { id: '10min', label: '10분 이내', emoji: '⏱️' },
  { id: 'expiring', label: '임박 재료 활용', emoji: '🚨' },
]

export function FilterBar({ active, onChange, expiringCount }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      {FILTERS.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition-all shrink-0 ${
            active === f.id
              ? 'bg-green-600 text-white shadow-[0_0_12px_rgba(34,197,94,0.3)]'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
          }`}
        >
          <span>{f.emoji}</span>
          <span>{f.label}</span>
          {f.id === 'expiring' && expiringCount > 0 && (
            <span className="ml-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
              {expiringCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
