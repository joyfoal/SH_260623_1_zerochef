'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ApiKeyEntry {
  id: string
  label: string
  key: string
}

const KEYS_KEY   = 'openai_keys_v1'
const ACTIVE_KEY = 'openai_active_id'
const LEGACY_KEY = 'openai_api_key'

export function useApiKeys() {
  const [keys, setKeys]            = useState<ApiKeyEntry[]>([])
  const [activeId, setActiveIdState] = useState<string>('')
  const [loaded, setLoaded]        = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEYS_KEY)
      if (raw) {
        const parsed: ApiKeyEntry[] = JSON.parse(raw)
        setKeys(parsed)
        const aid = localStorage.getItem(ACTIVE_KEY) ?? parsed[0]?.id ?? ''
        setActiveIdState(aid)
      } else {
        // 이전 단일 키 마이그레이션
        const legacy = localStorage.getItem(LEGACY_KEY)
        if (legacy) {
          const entry: ApiKeyEntry = { id: 'k-migrated', label: '기본 API 키', key: legacy }
          setKeys([entry])
          setActiveIdState('k-migrated')
          localStorage.setItem(KEYS_KEY, JSON.stringify([entry]))
          localStorage.setItem(ACTIVE_KEY, 'k-migrated')
        }
      }
    } catch {}
    setLoaded(true)
  }, [])

  const persist = (list: ApiKeyEntry[]) => {
    try { localStorage.setItem(KEYS_KEY, JSON.stringify(list)) } catch {}
  }

  const addKey = useCallback((label: string, key: string) => {
    const entry: ApiKeyEntry = { id: `k-${Date.now()}`, label, key }
    setKeys(prev => {
      const next = [...prev, entry]
      persist(next)
      return next
    })
    // 새 키를 바로 활성화
    localStorage.setItem(ACTIVE_KEY, entry.id)
    setActiveIdState(entry.id)
    return entry
  }, [])

  const removeKey = useCallback((id: string) => {
    setKeys(prev => {
      const next = prev.filter(k => k.id !== id)
      persist(next)
      return next
    })
    setActiveIdState(prev => {
      if (prev !== id) return prev
      const remaining = keys.filter(k => k.id !== id)
      const newActive = remaining[0]?.id ?? ''
      localStorage.setItem(ACTIVE_KEY, newActive)
      return newActive
    })
  }, [keys])

  const activateKey = useCallback((id: string) => {
    localStorage.setItem(ACTIVE_KEY, id)
    setActiveIdState(id)
  }, [])

  const clearAll = useCallback(() => {
    setKeys([])
    setActiveIdState('')
    try {
      localStorage.removeItem(KEYS_KEY)
      localStorage.removeItem(ACTIVE_KEY)
      localStorage.removeItem(LEGACY_KEY)
    } catch {}
  }, [])

  const activeKey = keys.find(k => k.id === activeId)?.key ?? ''

  return { keys, activeKey, activeId, loaded, addKey, removeKey, activateKey, clearAll }
}
