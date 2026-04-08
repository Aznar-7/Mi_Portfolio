import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronLeft, ChevronRight, ExternalLink, Cpu, Terminal } from 'lucide-react'
import { GitHubIcon } from '@/components/common/SocialIcons'
import { TechTag } from '@/components/common/TechTag'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

const STATUS_STYLES = {
  'in-development': { color: '#4ade80' },
  completed:        { color: '#9b8cff' },
}

const PLACEHOLDER_ICON_MAP = { Cpu, Terminal }

function CarouselSlide({ src, placeholderGradient, placeholderIcon, title }) {
  if (src) {
    return (
      <img
        src={src}
        alt={title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    )
  }
  const Icon = placeholderIcon ? PLACEHOLDER_ICON_MAP[placeholderIcon] : null
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-b ${placeholderGradient ?? 'from-[var(--bg-elevated)] to-transparent'}`}
    >
      {Icon && <Icon size={56} className="text-white/20" />}
    </div>
  )
}

export function ProjectModal({ project, lang = 'es', T = {}, onClose }) {
  const reduced = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  const images = project?.gallery?.length
    ? project.gallery
    : project?.image
      ? [project.image]
      : []
  const hasMultiple = images.length > 1

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')  setActiveIndex((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setActiveIndex((i) => Math.min(images.length - 1, i + 1))
    },
    [onClose, images.length],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  useEffect(() => { setActiveIndex(0) }, [project?.id])

  if (!project) return null

  const status = STATUS_STYLES[project.status]
  const statusLabel = T.status?.[project.status] ?? project.status

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        style={{ backgroundColor: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          key="modal-panel"
          initial={reduced ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? {} : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[var(--bg-elevated)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="cursor-target absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-[var(--text-secondary)] transition-colors hover:bg-white/[0.1] hover:text-white"
            aria-label={T.close ?? 'Cerrar'}
          >
            <X size={14} />
          </button>

          {/* Carousel */}
          <div className="relative h-56 sm:h-72 overflow-hidden rounded-t-2xl bg-[var(--bg-base)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? {} : { opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <CarouselSlide
                  src={images[activeIndex] ?? null}
                  placeholderGradient={project.placeholderGradient}
                  placeholderIcon={project.placeholderIcon}
                  title={project.title}
                />
              </motion.div>
            </AnimatePresence>

            {hasMultiple && (
              <>
                <button
                  onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                  disabled={activeIndex === 0}
                  className="cursor-target absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 disabled:opacity-30"
                  aria-label={T.prev ?? 'Anterior'}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setActiveIndex((i) => Math.min(images.length - 1, i + 1))}
                  disabled={activeIndex === images.length - 1}
                  className="cursor-target absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 disabled:opacity-30"
                  aria-label={T.next ?? 'Siguiente'}
                >
                  <ChevronRight size={16} />
                </button>

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                      }`}
                      aria-label={`${T.slide ?? 'Imagen'} ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            {/* Meta row */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {status && (
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    color: status.color,
                    backgroundColor: `${status.color}18`,
                    border: `1px solid ${status.color}30`,
                  }}
                >
                  {statusLabel}
                </span>
              )}
              {project.featured && (
                <span className="rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] ring-1 ring-[var(--accent)]/30">
                  Featured
                </span>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target ml-auto flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={11} />
                  {project.liveUrl.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            <h2 className="mb-3 text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {project.title}
            </h2>
            <p className="mb-6 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {l(project.description, lang)}
            </p>

            {/* Stack */}
            <div className="mb-6">
              <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {T.stack ?? 'Stack'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => <TechTag key={t} name={t} />)}
              </div>
            </div>

            {/* Architecture */}
            {project.architecture?.length > 0 && (
              <div className="mb-6">
                <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {T.architecture ?? 'Arquitectura'}
                </p>
                <div className="flex flex-col gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] p-4">
                  {project.architecture.map((item, i) => (
                    <div key={i} className="flex gap-3 text-[12px]">
                      <span className="w-20 shrink-0 font-semibold text-[var(--accent)]">
                        {l(item.layer, lang)}
                      </span>
                      <span className="text-[var(--text-secondary)]">
                        {l(item.detail, lang)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 border-t border-white/[0.05] pt-5">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[var(--accent-hover)] hover:shadow-[0_8px_24px_rgba(124,106,247,0.3)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={13} /> {T.live ?? 'Ver en vivo'}
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-target inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-[13px] font-semibold text-[var(--text-secondary)] transition-all hover:border-white/[0.12] hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GitHubIcon size={13} /> {T.code ?? 'Ver código'}
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
