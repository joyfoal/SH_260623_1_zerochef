'use client'

import { useState, useEffect, useCallback } from 'react'
import { Ingredient } from '@/lib/types'

const STORAGE_KEY = 'fridge_ingredients_v1'

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [initialized, setInitialized] = useState(false)

  // 마운트 시 localStorage에서 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setIngredients(JSON.parse(raw))
    } catch {}
    setInitialized(true)
  }, [])

  const persist = (items: Ingredient[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }

  // 전체 재료 교체 (사진 분석 후)
  const setAll = useCallback((items: Ingredient[]) => {
    setIngredients(items)
    persist(items)
  }, [])

  // 부분 업데이트 (추가/삭제/수정)
  const update = useCallback((fn: (prev: Ingredient[]) => Ingredient[]) => {
    setIngredients(prev => {
      const next = fn(prev)
      persist(next)
      return next
    })
  }, [])

  // 특정 구역 전체 삭제
  const clearSection = useCallback((section: Ingredient['section']) => {
    update(prev => prev.filter(i => i.section !== section))
  }, [update])

  // 전체 삭제
  const clearAll = useCallback(() => {
    setIngredients([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { ingredients, setAll, update, clearSection, clearAll, initialized }
}
