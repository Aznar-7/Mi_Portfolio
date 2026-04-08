import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import { Globe, Cpu, Terminal, Zap } from 'lucide-react'
import { TechTag } from '@/components/common/TechTag'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

const CATEGORY_ICONS = {
  web:     Globe,
  startup: Zap,
  iot:     Cpu,
  cli:     Terminal,
}

const STATUS_STYLES = {
  'in-development': { color: '#4ade80' },
  completed:        { color: '#9b8cff' },
}

function ImageArea({ project }) {
  if (project.image) {
    return (
      <img
        src={project.image}
        alt={project.title}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        loading="lazy"
      />
    )
  }
  const Icon = project.placeholderIcon === 'Cpu' ? Cpu : Terminal
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-b ${project.placeholderGradient ?? 'from-[var(--bg-elevated)] to-transparent'}`}
    >
      <Icon size={40} className="text-white/20" />
    </div>
  )
}

export function ProjectCard({ project, lang = 'es', T = {}, onClick }) {
  const reduced = useReducedMotion()
  const cardRef = useRef(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rawRotateX = useMotionValue(0)
  const rawRotateY = useMotionValue(0)
  const rotateX = useSpring(rawRotateX, { stiffness: 200, damping: 25 })
  const rotateY = useSpring(rawRotateY, { stiffness: 200, damping: 25 })

  const spotlightBg = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(124,106,247,0.08), transparent 70%)`

  function onMouseMove(e) {
    if (reduced) return
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
    rawRotateX.set(-(e.clientY - cy) / 14)
    rawRotateY.set((e.clientX - cx) / 14)
  }

  function onMouseLeave() {
    mouseX.set(0); mouseY.set(0)
    rawRotateX.set(0); rawRotateY.set(0)
  }

  const status = STATUS_STYLES[project.status]
  const statusLabel = T.status?.[project.status] ?? project.status
  const CategoryIcon = CATEGORY_ICONS[project.category]

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        rotateX: reduced ? 0 : rotateX,
        rotateY: reduced ? 0 : rotateY,
        transformPerspective: 800,
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
      }}
      whileHover={reduced ? {} : { y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group cursor-target relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--bg-surface)]/90 shadow-lg backdrop-blur-md transition-[border-color] hover:border-[var(--accent)]/30"
    >
      {/* Mouse spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: spotlightBg,
        }}
      />

      {/* Image area */}
      <div className="relative h-[180px] overflow-hidden">
        <ImageArea project={project} />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-sm">
            {T.view_details ?? 'Ver detalles'} →
          </span>
        </div>

        {/* Category icon — bottom left */}
        {CategoryIcon && (
          <span className="absolute bottom-2.5 left-3 flex h-6 w-6 items-center justify-center rounded-md bg-black/50 backdrop-blur-sm">
            <CategoryIcon size={12} className="text-white/70" />
          </span>
        )}

        {/* Status badge — bottom right */}
        {status && (
          <span
            className="absolute bottom-2.5 right-3 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color: status.color,
              backgroundColor: `${status.color}18`,
              border: `1px solid ${status.color}30`,
            }}
          >
            {statusLabel}
          </span>
        )}
      </div>

      {/* Card content */}
      <div className="relative z-10 flex flex-1 flex-col p-5">
        <h3 className="mb-1 text-base font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
          {project.title}
        </h3>
        <p className="mb-4 line-clamp-1 text-[12px] text-[var(--text-muted)]">
          {l(project.tagline, lang)}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5 border-t border-white/[0.05] pt-4">
          {project.tech.slice(0, 4).map((t) => (
            <TechTag key={t} name={t} />
          ))}
          {project.tech.length > 4 && (
            <span className="rounded-md bg-white/[0.04] px-2.5 py-1 text-[11px] text-[var(--text-muted)] ring-1 ring-white/[0.06]">
              +{project.tech.length - 4}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
