'use client'

import { useState, useEffect, useCallback } from 'react'
import { CustomLocation } from '@/lib/types'

const STORAGE_KEY = 'custom_locations_v1'

export function useCustomLocations() {
  const [locations, setLocations] = useState<CustomLocation[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setLocations(JSON.parse(raw))
    } catch {}
  }, [])

  const persist = (locs: CustomLocation[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(locs)) } catch {}
  }

  const addLocation = useCallback((loc: CustomLocation) => {
    setLocations(prev => {
      const next = [...prev, loc]
      persist(next)
      return next
    })
  }, [])

  const updateLocation = useCallback((id: string, patch: Partial<Omit<CustomLocation, 'id'>>) => {
    setLocations(prev => {
      const next = prev.map(l => l.id === id ? { ...l, ...patch } : l)
      persist(next)
      return next
    })
  }, [])

  const removeLocation = useCallback((id: string) => {
    setLocations(prev => {
      const next = prev.filter(l => l.id !== id)
      persist(next)
      return next
    })
  }, [])

  return { locations, addLocation, updateLocation, removeLocation }
}
