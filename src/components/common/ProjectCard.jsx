import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import { ExternalLink } from 'lucide-react'
import { GitHubIcon } from '@/components/common/SocialIcons'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

const STATUS_LABELS = {
  'in-development': { color: '#4ade80' },
  completed:        { color: '#9b8cff' },
}

export function ProjectCard({ project, lang = 'es', T = {} }) {
  const reduced = useReducedMotion()
  const cardRef = useRef(null)

  // Mouse tracking for 3D tilt + spotlight
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 25 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 25 })

  function onMouseMove(e) {
    if (reduced) return
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
    rotateX.set(-(e.clientY - cy) / 14)
    rotateY.set((e.clientX - cx) / 14)
  }

  function onMouseLeave() {
    mouseX.set(0); mouseY.set(0)
    rotateX.set(0); rotateY.set(0)
  }

  const status = STATUS_LABELS[project.status]
  const statusLabel = l({ es: project.status === 'in-development' ? 'En desarrollo' : 'Completado', en: project.status === 'in-development' ? 'In development' : 'Completed' }, lang)

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX: reduced ? 0 : rotateX,
        rotateY: reduced ? 0 : rotateY,
        transformPerspective: 800,
        transformStyle: 'preserve-3d',
      }}
      whileHover={reduced ? {} : { y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--bg-surface)]/90 shadow-lg backdrop-blur-md transition-[border-color] hover:border-[var(--accent)]/30"
    >
      {/* Mouse spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(124,106,247,0.1), transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <div className="flex-1 p-5 pb-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
              {project.title}
            </h3>
            {status && (
              <span
                className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: status.color, backgroundColor: `${status.color}14`, border: `1px solid ${status.color}28` }}
              >
                {statusLabel}
              </span>
            )}
          </div>
          <p className="line-clamp-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {l(project.description, lang)}
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t border-white/[0.05] p-5">
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span key={t} className="rounded-md bg-white/[0.04] px-2.5 py-1 text-[11px] text-[var(--text-muted)] ring-1 ring-white/[0.06]">
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/8 px-3 py-1.5 text-[12px] font-medium text-[var(--accent-hover)] transition-all hover:bg-[var(--accent)]/20"
              >
                <ExternalLink size={12} /> {T.live ?? 'Live'}
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-all hover:border-white/10 hover:text-white"
              >
                <GitHubIcon size={12} /> {T.code ?? 'Code'}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
