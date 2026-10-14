import { TECH_ICONS } from '@/data/techIcons'
import { cn } from '@/lib/utils'

// The icon takes its brand color on hover; everything else stays monochrome
export function TechTag({ name, size = 'sm' }) {
  const entry = TECH_ICONS[name]
  return (
    <span
      style={entry ? { '--brand': entry.brand } : undefined}
      className={cn(
        'group/tag inline-flex items-center rounded-md border border-[var(--line)] text-[var(--text-secondary)] transition-[border-color,color,transform] duration-200 hover:-translate-y-px hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]',
        size === 'md' ? 'h-9 gap-2 px-3 text-sm' : 'h-7 gap-1.5 px-2.5 text-xs',
      )}
    >
      {entry && (
        <entry.Icon
          size={size === 'md' ? 15 : 12}
          color="currentColor"
          aria-hidden="true"
          className="transition-colors duration-200 group-hover/tag:text-[var(--brand)]"
        />
      )}
      {name}
    </span>
  )
}
