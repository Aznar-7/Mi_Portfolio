import { motion } from 'motion/react'
import { ExternalLink, Cpu } from 'lucide-react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ProjectCard } from '@/components/common/ProjectCard'
import { projects } from '@/data/projects'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function l(v, lang) {
  if (!v || typeof v === 'string') return v
  return v[lang] ?? v.es ?? v.en ?? ''
}

const STATUS_COLORS = {
  'in-development': '#4ade80',
  completed: '#9b8cff',
}

// Large featured card for UTN Hub (2-col spanning)
function FeaturedBentoCard({ project, lang, T }) {
  const reduced = useReducedMotion()
  const statusColor = STATUS_COLORS[project.status] ?? '#888'

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ type: 'spring', stiffness: 180, damping: 24 }}
      className="group relative col-span-2 overflow-hidden rounded-xl border border-[var(--accent)]/15 bg-[var(--bg-surface)] p-7"
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'radial-gradient(500px circle at 0% 0%, rgba(124,106,247,0.08), transparent 60%)' }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
        {/* Left */}
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider uppercase"
              style={{ color: statusColor, backgroundColor: `${statusColor}15`, border: `1px solid ${statusColor}28` }}
            >
              {T.status?.[project.status] ?? project.status}
            </span>
            <span className="font-mono text-[10px] tracking-wider text-[var(--accent)] uppercase">featured</span>
          </div>

          <h3 className="mb-2 text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {project.title}
          </h3>
          <p className="mb-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {l(project.description, lang)}
          </p>

          <div className="mb-5 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span key={t} className="rounded-md bg-[rgba(124,106,247,0.08)] px-2.5 py-1 text-[11px] text-[var(--accent-hover)] ring-1 ring-[rgba(124,106,247,0.15)]">
                {t}
              </span>
            ))}
          </div>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[var(--accent-hover)] hover:shadow-[0_8px_24px_rgba(124,106,247,0.3)]"
            >
              <ExternalLink size={13} /> {T.live ?? 'Live'}
            </a>
          )}
        </div>

        {/* Right: architecture mini */}
        <div className="flex-shrink-0 sm:w-48">
          <p className="mb-2 font-mono text-[10px] tracking-[0.14em] text-[var(--text-muted)] uppercase">Stack</p>
          <div className="flex flex-col gap-1.5">
            {(project.architecture ?? []).slice(0, 4).map((item, i) => (
              <div key={i} className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-1.5">
                <p className="text-[10px] font-semibold text-[var(--accent)]">
                  {l(item.layer, lang)}
                </p>
              </div>
            ))}
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

  const featured   = projects.filter((p) => p.featured)
  const nonFeatured = projects.filter((p) => !p.featured)

  return (
    <SectionWrapper id="projects">
      <SectionHeading label={T.label} title={T.title} subtitle={T.subtitle} />

      {/* Bento grid — 2 columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Featured cards (2-col span) */}
        {featured.map((p) => (
          <FeaturedBentoCard key={p.id} project={p} lang={lang} T={T} />
        ))}

        {/* Standard project cards */}
        {nonFeatured.map((project, i) => (
          <motion.div
            key={project.id}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={reduced ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ type: 'spring', stiffness: 180, damping: 24, delay: i * 0.07 }}
          >
            <ProjectCard project={project} lang={lang} T={T} />
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  )
}
