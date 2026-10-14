import { cn } from '@/lib/utils'

const DOT = {
  'in-development': 'bg-emerald-400',
  completed:        'bg-[var(--text-muted)]',
}

export function StatusBadge({ status, label, className }) {
  if (!status) return null
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT[status])} aria-hidden="true" />
      {label}
    </span>
  )
}
