import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { X, ExternalLink } from 'lucide-react'
import { GitHubIcon } from '@/components/common/SocialIcons'
import { TechTag } from '@/components/common/TechTag'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/common/Button'
import { ProjectGallery } from '@/components/common/ProjectGallery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { l } from '@/lib/utils'

const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function githubLinks(githubUrl) {
  if (Array.isArray(githubUrl)) return githubUrl
  return githubUrl ? [{ url: githubUrl }] : []
}

export function ProjectModal({ project, lang, T, onClose }) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const panelRef = useRef(null)
  const closeRef = useRef(null)

  const images = project.gallery?.length ? project.gallery : project.image ? [project.image] : []

  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeRef.current?.focus()
    document.documentElement.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key === 'ArrowLeft') return setIndex((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') return setIndex((i) => Math.min(images.length - 1, i + 1))
      if (e.key !== 'Tab' || !panelRef.current) return
      // Focus trap
      const nodes = panelRef.current.querySelectorAll(FOCUSABLE)
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      previouslyFocused?.focus?.()
    }
  }, [onClose, images.length])

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        onClick={(e) => e.stopPropagation()}
        initial={reduced ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: 24 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-h-[92svh] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-t-2xl border border-[var(--line-strong)] bg-[var(--bg-elevated)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] sm:rounded-2xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={T.close}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <ProjectGallery images={images} index={index} onChange={setIndex} title={project.title} T={T} reduced={reduced} />

        <div className="grid gap-10 p-6 sm:p-8 md:grid-cols-[1fr_15rem] md:p-10">
          <div className="min-w-0">
            <StatusBadge status={project.status} label={T.status[project.status]} />
            <h2 id="project-modal-title" className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              {project.title}
            </h2>
            <p className="mt-2 text-lg text-[var(--text-secondary)]">{l(project.tagline, lang)}</p>
            <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-[var(--text-secondary)]">
              {l(project.description, lang)}
            </p>

            {project.architecture?.length > 0 && (
              <dl className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {project.architecture.map((item) => (
                  <div key={l(item.layer, 'en')} className="grid gap-1 py-3.5 sm:grid-cols-[8rem_1fr] sm:gap-4">
                    <dt className="text-sm font-medium text-[var(--text-primary)]">{l(item.layer, lang)}</dt>
                    <dd className="text-sm leading-relaxed text-[var(--text-secondary)]">{l(item.detail, lang)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <aside className="flex flex-col gap-8">
            <div>
              <h3 className="mb-3 text-sm text-[var(--text-muted)]">{T.stack}</h3>
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => <TechTag key={t} name={t} />)}
              </div>
            </div>

            {(project.liveUrl || project.githubUrl) && (
              <div className="flex flex-col gap-2">
                {project.liveUrl && (
                  <Button variant="primary" href={project.liveUrl}>
                    <ExternalLink size={15} aria-hidden="true" />
                    {T.live}
                  </Button>
                )}
                {githubLinks(project.githubUrl).map(({ label, url }) => (
                  <Button key={url} variant="secondary" href={url}>
                    <GitHubIcon size={15} aria-hidden="true" />
                    {label ? `${T.code}: ${label}` : T.code}
                  </Button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
