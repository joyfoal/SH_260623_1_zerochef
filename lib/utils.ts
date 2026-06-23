import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Ingredient } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null
  const expiry = new Date(expiryDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function isExpiringSoon(expiryDate?: string): boolean {
  const days = getDaysUntilExpiry(expiryDate)
  return days !== null && days <= 1
}

export function getExpiryLabel(days: number | null): string {
  if (days === null) return ''
  if (days < 0) return '유통기한 초과'
  if (days === 0) return 'D-day'
  if (days === 1) return 'D-1'
  return `D-${days}`
}

export function getMatchRateBadgeColor(rate: number): string {
  if (rate >= 90) return 'bg-emerald-500 text-white'
  if (rate >= 70) return 'bg-amber-500 text-white'
  return 'bg-rose-500 text-white'
}

export function getSectionLabel(section: Ingredient['section']): string {
  const labels: Record<Ingredient['section'], string> = {
    'top-shelf': '상단 선반',
    'middle-shelf': '중단 선반',
    'bottom-shelf': '하단 선반',
    'crisper': '채소 칸',
    'door-upper': '도어 상단',
    'door-lower': '도어 하단',
    'freezer': '냉동칸',
  }
  return labels[section]
}
