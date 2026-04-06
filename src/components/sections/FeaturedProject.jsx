import { motion } from 'motion/react'
import { ExternalLink, Layers, ArrowRight } from 'lucide-react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { TechBadge } from '@/components/common/TechBadge'
import { featuredProject } from '@/data/projects'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Resolves {es, en} or plain string
function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

export function FeaturedProject() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].featured

  return (
    <SectionWrapper id="featured">
      <SectionHeading
        label={T.label}
        title={featuredProject.title}
        subtitle={l(featuredProject.tagline, lang)}
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--bg-surface)]/60 p-7 shadow-2xl backdrop-blur-xl md:p-10 lg:grid lg:grid-cols-[1fr_420px] lg:gap-14 lg:items-start">
        {/* Background glow */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-[var(--accent)]/[0.07] blur-[100px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

        {/* Left: Description + links */}
        <div className="relative z-10 mb-10 lg:mb-0">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-green-400/30 bg-green-400/[0.08] px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.14em] text-green-400 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            {T.active}
          </div>

          <div className="mb-8 flex flex-col gap-4">
            {l(featuredProject.description, lang).split('. ').filter(Boolean).map((s, i) => (
              <p key={i} className="text-[15px] leading-[1.75] text-[var(--text-secondary)]">
                {s.endsWith('.') ? s : `${s}.`}
              </p>
            ))}
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {featuredProject.tech.map((t) => <TechBadge key={t} label={t} accent />)}
          </div>

          {featuredProject.liveUrl && (
            <a
              href={featuredProject.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[0_8px_24px_rgba(124,106,247,0.35)]"
            >
              <ExternalLink size={14} />
              {T.view}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </a>
          )}
        </div>

        {/* Right: Architecture */}
        <div className="relative z-10">
          <div className="mb-5 flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-[var(--text-muted)] uppercase">
            <Layers size={13} className="text-[var(--accent)]" />
            {T.arch_label}
          </div>

          <div className="flex flex-col gap-3">
            {featuredProject.architecture.map((item, i) => (
              <motion.div
                key={i}
                initial={reduced ? false : { opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.09, ease: 'easeOut' }}
                className="group relative overflow-hidden rounded-xl border border-white/[0.05] bg-black/20 p-5 backdrop-blur-sm transition-all hover:border-white/[0.09] hover:bg-black/30"
              >
                <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[var(--accent)] to-[var(--accent)]/30 transition-opacity group-hover:opacity-100 opacity-60" />
                <p className="mb-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-[var(--accent)] uppercase">
                  {l(item.layer, lang)}
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {l(item.detail, lang)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
