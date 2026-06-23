import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

export function getExpiryLabel(days: number | null): string {
  if (days === null) return ''
  if (days < 0) return '만료됨'
  if (days === 0) return 'D-day'
  if (days === 1) return 'D-1'
  return `D-${days}`
}

export function getMatchRateBadgeColor(rate: number): string {
  if (rate >= 90) return 'bg-emerald-500 text-white'
  if (rate >= 70) return 'bg-amber-500 text-white'
  return 'bg-rose-500 text-white'
}

const BUILTIN_LABELS: Record<string, string> = {
  'top-shelf': '상단 선반',
  'middle-shelf': '중단 선반',
  'bottom-shelf': '하단 선반',
  'crisper': '채소 칸',
  'door-upper': '도어 상단',
  'door-lower': '도어 하단',
  'freezer': '냉동칸',
}

export function getSectionLabel(section: string, customName?: string): string {
  return customName ?? BUILTIN_LABELS[section] ?? section
}
