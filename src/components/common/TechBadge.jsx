import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function TechBadge({ label, accent = false }) {
  return (
    <Badge
      variant={accent ? 'default' : 'secondary'}
      className={cn(
        'text-xs font-medium px-2.5 py-0.5',
        accent &&
          'bg-[rgba(124,106,247,0.15)] text-[#9b8cff] border border-[rgba(124,106,247,0.3)] hover:bg-[rgba(124,106,247,0.22)]'
      )}
    >
      {label}
    </Badge>
  )
}
