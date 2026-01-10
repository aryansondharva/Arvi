import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Member ID utilities
export function formatMemberId(memberId: string | undefined | null): string {
  if (!memberId) return 'N/A'
  return String(memberId)
}

export function generateMemberId(year: number = new Date().getFullYear()): string {
  const yearStr = year.toString()
  const sequence = Math.floor(Math.random() * 9999) + 1
  return `${yearStr}${sequence.toString().padStart(4, '0')}`
}

export function validateMemberId(memberId: string): boolean {
  const pattern = /^\d{8}$/
  if (!pattern.test(memberId)) return false
  
  const year = parseInt(memberId.substring(0, 4))
  const currentYear = new Date().getFullYear()
  
  return year >= 2020 && year <= currentYear + 1
}

export function getMemberIdYear(memberId: string): number {
  if (!memberId || !validateMemberId(memberId)) return 0
  return parseInt(memberId.substring(0, 4))
}

export function getMemberIdSequence(memberId: string): number {
  if (!memberId || !validateMemberId(memberId)) return 0
  return parseInt(memberId.substring(4))
}
