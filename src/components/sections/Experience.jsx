import { motion } from 'framer-motion'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { experience, academic } from '@/data/experience'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

function ExperienceCard({ item, type, index = 0 }) {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const points = l(item.impact ?? item.highlights, lang) ?? []

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 30 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
      className="group relative grid gap-6 md:grid-cols-[180px_1fr] md:gap-10 pb-16 last:pb-0"
    >
      {/* Date / Period Column (Left on Desktop) */}
      <div className="flex flex-col md:items-end md:text-right pt-1">
        <span className="font-mono text-[12px] font-medium uppercase tracking-widest text-[var(--accent)]/80 sm:text-[13px]">
          {l(item.period, lang)}
        </span>
        <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-60">
          {type === 'work' ? 'Profesional' : 'Académico'}
        </div>
      </div>

      {/* Middle Line & Dot (Hidden on mobile for cleaner look, visible on md+) */}
      <div className="absolute left-[8px] top-2 hidden h-full w-[2px] bg-gradient-to-b from-[var(--accent)]/40 to-transparent md:left-[199px] md:block" />
      <div className="absolute left-0 top-2 hidden h-4 w-4 rounded-full border-4 border-[var(--bg-base)] bg-[var(--accent)] shadow-[0_0_0_2px_rgba(124,106,247,0.2)] md:left-[192px] md:block transition-transform duration-300 group-hover:scale-125" />

      {/* Content Column (Right on Desktop) */}
      <div className="relative z-10 flex-1 md:pl-8">
        <div className="mb-2">
          <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)] transition-colors duration-300 group-hover:text-[var(--accent)]">
            {l(item.role ?? item.degree, lang)}
          </h3>
          <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
            {item.company ?? item.institution}
          </p>
        </div>

        <ul className="mt-5 flex flex-col gap-3">
          {points.map((point, i) => (
            <li key={i} className="relative pl-5 text-[14px] leading-[1.8] text-[var(--text-secondary)] transition-colors group-hover:text-gray-300">
              <span className="absolute left-0 top-[10px] h-1.5 w-1.5 rounded-full bg-[var(--accent)]/50 transition-colors group-hover:bg-[var(--accent)]" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export function Experience() {
  const { lang } = useLang()
  const T = translations[lang].experience

  return (
    <SectionWrapper id="experience">
      <SectionHeading label={T.label} title={T.title} subtitle={T.subtitle} />

      <div className="relative mt-16 max-w-5xl">
        {/* Timeline Column */}
        <div className="relative">
          {/* Professional Experience */}
          <div className="mb-20">
            {experience.map((item, i) => (
              <ExperienceCard key={i} item={item} type="work" index={i} />
            ))}
          </div>

          {/* Academic section header */}
          <div className="mb-12 flex items-center gap-6">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/[0.08] md:flex-none md:w-[180px] md:to-[var(--accent)]/50" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mix-blend-screen">
              {T.academic_divider}
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.08] to-transparent md:from-[var(--accent)]/50" />
          </div>

          {/* Academic Experience */}
          <div>
            {academic.map((item, i) => (
              <ExperienceCard key={i} item={item} type="academic" index={i} />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
