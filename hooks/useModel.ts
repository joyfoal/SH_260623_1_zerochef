'use client'

import { useState, useEffect } from 'react'
import { DEFAULT_MODEL_ID, MODEL_STORAGE_KEY } from '@/lib/models'

export function useModel() {
  const [modelId, setModelIdState] = useState(DEFAULT_MODEL_ID)
  const [loaded,  setLoaded]       = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODEL_STORAGE_KEY)
      if (saved) setModelIdState(saved)
    } catch {}
    setLoaded(true)
  }, [])

  const setModelId = (id: string) => {
    setModelIdState(id)
    try { localStorage.setItem(MODEL_STORAGE_KEY, id) } catch {}
  }

  return { modelId, setModelId, loaded }
}
