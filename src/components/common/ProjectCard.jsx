import { ArrowUpRight } from 'lucide-react'
import { TechTag } from '@/components/common/TechTag'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ProgressiveImage } from '@/components/common/ProgressiveImage'
import { Fiducials } from '@/components/common/Fiducials'
import { CategoryIcon } from '@/components/common/CategoryIcon'
import { projectCategories } from '@/data/projectCategories'
import { useSoundEffects } from '@/contexts/SoundContext'
import { cn, l } from '@/lib/utils'

function Cover({ project, T, wide }) {
  if (project.image) {
    return (
      <ProgressiveImage
        src={project.image}
        alt=""
        wrapperClassName="h-full w-full"
        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />
    )
  }
  const category = projectCategories.find((c) => c.id === project.category)
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
      {category && <CategoryIcon name={category.icon} size={wide ? 40 : 28} strokeWidth={1.25} aria-hidden="true" />}
      <span className="silkscreen">{T.no_image}</span>
    </div>
  )
}

/**
 * Clickable project summary; opens the detail modal.
 * `wide` lays image and text side by side for the lead project.
 */
export function ProjectCard({ project, lang, T, onOpen, wide = false }) {
  const { playHover, playClick } = useSoundEffects()

  const techLimit = wide ? 6 : 4

  return (
    <button
      type="button"
      onClick={() => { playClick(); onOpen() }}
      onMouseEnter={playHover}
      aria-label={`${project.title}: ${T.view_details}`}
      className={cn(
        'group relative flex h-full w-full overflow-hidden rounded-[2px] border border-[var(--line)] bg-[var(--bg-elevated)] text-left',
        'transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]/50',
        wide ? 'flex-col md:flex-row' : 'flex-col',
      )}
    >
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-[var(--bg-surface)]',
          wide ? 'aspect-[4/3] md:aspect-auto md:w-[52%]' : 'aspect-[16/10]',
        )}
      >
        <Cover project={project} T={T} wide={wide} />
        <Fiducials inset="12px" />
      </div>

      <div className={cn('relative flex flex-1 flex-col', wide ? 'p-6 sm:p-8 md:p-10' : 'p-6')}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <StatusBadge status={project.status} label={T.status[project.status]} />
          <ArrowUpRight
            size={18}
            aria-hidden="true"
            className="text-[var(--text-muted)] transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]"
          />
        </div>

        <h3 className={cn('font-semibold tracking-[-0.025em] text-[var(--text-primary)]', wide ? 'text-3xl sm:text-4xl' : 'text-xl')}>
          {project.title}
        </h3>
        <p className={cn('mt-2 text-[var(--text-secondary)]', wide ? 'text-base sm:text-lg' : 'line-clamp-2 text-sm leading-relaxed')}>
          {l(project.tagline, lang)}
        </p>
        {wide && (
          <p className="mt-5 line-clamp-4 max-w-prose text-[15px] leading-relaxed text-[var(--text-muted)]">
            {l(project.description, lang)}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
          {project.tech.slice(0, techLimit).map((t) => <TechTag key={t} name={t} />)}
          {project.tech.length > techLimit && (
            <span className="inline-flex h-7 items-center px-1.5 text-xs text-[var(--text-muted)]">
              +{project.tech.length - techLimit}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
