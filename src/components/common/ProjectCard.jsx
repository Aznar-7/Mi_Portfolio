import { ArrowUpRight } from 'lucide-react'
import { TechTag } from '@/components/common/TechTag'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ProgressiveImage } from '@/components/common/ProgressiveImage'
import { useSoundEffects } from '@/contexts/SoundContext'
import { cn, l } from '@/lib/utils'

function Cover({ project }) {
  return (
    <ProgressiveImage
      src={project.image}
      alt=""
      wrapperClassName="h-full w-full"
      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
    />
  )
}

/**
 * Clickable project summary; opens the detail modal.
 * `wide` lays image and text side by side for the lead project; a project
 * without screenshots becomes a text-led card instead of an empty frame.
 */
export function ProjectCard({ project, lang, T, onOpen, wide = false }) {
  const { playHover, playClick } = useSoundEffects()
  const techLimit = wide ? 6 : 4
  const hasImage = Boolean(project.image)

  return (
    <button
      type="button"
      onClick={() => { playClick(); onOpen() }}
      onMouseEnter={playHover}
      aria-label={`${project.title}: ${T.view_details}`}
      className={cn(
        'group relative flex h-full w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] text-left',
        'transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--line-strong)]',
        wide ? 'flex-col md:flex-row' : 'flex-col',
      )}
    >
      {hasImage && (
        <div
          className={cn(
            'relative shrink-0 overflow-hidden bg-[var(--bg-surface)]',
            wide ? 'aspect-[4/3] md:aspect-auto md:w-[52%]' : 'aspect-[16/10]',
          )}
        >
          <Cover project={project} />
        </div>
      )}

      <div className={cn('relative flex flex-1 flex-col', wide ? 'p-6 sm:p-8 md:p-10' : hasImage ? 'p-6' : 'p-6 sm:p-8')}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <StatusBadge status={project.status} label={T.status[project.status]} />
          <ArrowUpRight
            size={18}
            aria-hidden="true"
            className="text-[var(--text-muted)] transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]"
          />
        </div>

        <h3 className={cn('font-semibold tracking-[-0.025em] text-[var(--text-primary)]', wide || !hasImage ? 'text-3xl sm:text-4xl' : 'text-xl')}>
          {project.title}
        </h3>
        <p className={cn('mt-2 text-[var(--text-secondary)]', wide || !hasImage ? 'text-base sm:text-lg' : 'text-[15px] leading-relaxed')}>
          {l(project.tagline, lang)}
        </p>
        {/* Without screenshots, the build sheet takes the place of the cover and the long description */}
        {hasImage || !project.architecture ? (
          <p
            className={cn(
              'max-w-prose leading-relaxed text-[var(--text-muted)]',
              wide ? 'mt-5 line-clamp-4 text-[15px]' : 'mt-3 line-clamp-3 text-sm',
            )}
          >
            {l(project.description, lang)}
          </p>
        ) : (
          <dl className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {project.architecture.map(({ layer, detail }) => (
              <div key={l(layer, 'en')} className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <dt className="text-sm text-[var(--text-primary)]">{l(layer, lang)}</dt>
                <dd className="text-sm leading-relaxed text-[var(--text-secondary)]">{l(detail, lang)}</dd>
              </div>
            ))}
          </dl>
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
