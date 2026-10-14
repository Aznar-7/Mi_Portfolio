import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve a localised string. Accepts a plain string or a { es, en } object.
 */
export function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

export const STATUS_STYLES = {
  'in-development': { color: '#4ade80' },
  completed:        { color: '#9b8cff' },
}
