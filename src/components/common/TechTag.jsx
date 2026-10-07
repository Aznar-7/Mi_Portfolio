import { TECH_ICONS } from '@/data/techIcons'
import { cn } from '@/lib/utils'

export function TechTag({ name, size = 'sm' }) {
  const Icon = TECH_ICONS[name]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-[var(--line)] text-[var(--text-secondary)]',
        size === 'md' ? 'h-9 gap-2 px-3 text-sm' : 'h-7 gap-1.5 px-2.5 text-xs',
      )}
    >
      {Icon && <Icon size={size === 'md' ? 15 : 12} color="currentColor" aria-hidden="true" />}
      {name}
    </span>
  )
}
