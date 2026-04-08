import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ExternalLink, Cpu, Globe, Terminal, Zap } from 'lucide-react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ProjectCard } from '@/components/common/ProjectCard'
import { ProjectModal } from '@/components/common/ProjectModal'
import { Aurora } from '@/components/background/Aurora'
import { TechTag } from '@/components/common/TechTag'
import { projects } from '@/data/projects'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function l(v, lang) {
  if (!v || typeof v === 'string') return v
  return v[lang] ?? v.es ?? v.en ?? ''
}

const STATUS_STYLES = {
  'in-development': { color: '#4ade80' },
  completed:        { color: '#9b8cff' },
}

function FeaturedBentoCard({ project, lang, T, onOpenModal }) {
  const reduced = useReducedMotion()
  const status = STATUS_STYLES[project.status]
  const statusLabel = T.status?.[project.status] ?? project.status

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ type: 'spring', stiffness: 180, damping: 24 }}
      className="group cursor-target relative col-span-1 sm:col-span-2 overflow-hidden rounded-xl border border-[var(--accent)]/15 bg-[var(--bg-surface)] transition-[border-color] hover:border-[var(--accent)]/30"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

      <div className="flex flex-col sm:flex-row">
        {/* Left: content */}
        <div className="flex-1 p-5 sm:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {status && (
              <span
                className="rounded-full px-2.5 py-1 font-mono text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase"
                style={{
                  color: status.color,
                  backgroundColor: `${status.color}15`,
                  border: `1px solid ${status.color}28`,
                }}
              >
                {statusLabel}
              </span>
            )}
            <span className="font-mono text-[9px] sm:text-[10px] tracking-wider text-[var(--accent)] uppercase">
              {T.featured ?? 'featured'}
            </span>
          </div>

          <h3 className="mb-2 text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {project.title}
          </h3>
          <p className="mb-4 text-[12px] sm:text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {l(project.description, lang)}
          </p>

          <div className="mb-5 flex flex-wrap gap-1.5">
            {project.tech.map((t) => <TechTag key={t} name={t} />)}
          </div>

          <div className="flex flex-wrap gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-target inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold text-white transition-all hover:bg-[var(--accent-hover)] hover:shadow-[0_8px_24px_rgba(124,106,247,0.3)]"
              >
                <ExternalLink size={13} /> {T.live ?? 'Live'}
              </a>
            )}
            <button
              onClick={onOpenModal}
              className="cursor-target inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold text-[var(--text-secondary)] transition-all hover:border-white/[0.12] hover:text-white"
            >
              {T.view_details ?? 'Ver detalles'} →
            </button>
          </div>
        </div>

        {/* Right: image + architecture */}
        <div className="relative h-48 w-full sm:h-auto sm:w-56 sm:flex-shrink-0 overflow-hidden sm:rounded-r-xl">
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--accent)]/10 to-transparent" />
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="mb-1.5 font-mono text-[8px] tracking-[0.14em] text-[var(--text-muted)] uppercase">
              Stack
            </p>
            <div className="flex flex-col gap-1">
              {(project.architecture ?? []).slice(0, 4).map((item, i) => (
                <p key={i} className="text-[10px] font-semibold text-[var(--accent)]">
                  {l(item.layer, lang)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Projects() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].projects
  const [selectedProject, setSelectedProject] = useState(null)

  const featured    = projects.filter((p) => p.featured)
  const nonFeatured = projects.filter((p) => !p.featured)

  return (
    <div className="relative overflow-hidden">
      <Aurora />
      <SectionWrapper id="projects">
        <SectionHeading label={T.label} title={T.title} subtitle={T.subtitle} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featured.map((p) => (
            <FeaturedBentoCard
              key={p.id}
              project={p}
              lang={lang}
              T={T}
              onOpenModal={() => setSelectedProject(p)}
            />
          ))}

          {nonFeatured.map((project, i) => (
            <motion.div
              key={project.id}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ type: 'spring', stiffness: 180, damping: 24, delay: i * 0.07 }}
            >
              <ProjectCard
                project={project}
                lang={lang}
                T={T}
                onClick={() => setSelectedProject(project)}
              />
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            key={selectedProject.id}
            project={selectedProject}
            lang={lang}
            T={T}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
