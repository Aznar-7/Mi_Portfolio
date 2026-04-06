import { motion } from 'motion/react'
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
      initial={reduced ? false : { opacity: 0, x: -24 }}
      whileInView={reduced ? {} : { opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-6 pb-10"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{
            backgroundColor: type === 'work' ? 'var(--accent)' : 'var(--text-muted)',
            border: '2px solid var(--bg-base)',
            boxShadow: type === 'work' ? '0 0 0 4px rgba(124,106,247,0.15)' : 'none',
          }}
        />
        <div className="mt-2 w-px flex-1 bg-white/[0.05]" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            {l(item.role ?? item.degree, lang)}
          </h3>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            {l(item.period, lang)}
          </span>
        </div>
        <p className="mb-4 text-sm font-medium text-[var(--accent)]">
          {item.company ?? item.institution}
        </p>
        <ul className="flex flex-col gap-2.5">
          {points.map((point, i) => (
            <li key={i} className="relative pl-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              <span className="absolute left-0 top-[9px] h-1 w-1 rounded-full bg-[var(--text-muted)]" />
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

      <div className="max-w-[700px]">
        {experience.map((item, i) => (
          <ExperienceCard key={i} item={item} type="work" index={i} />
        ))}

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.05]" />
          <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--text-muted)] uppercase whitespace-nowrap">
            {T.academic_divider}
          </span>
          <div className="h-px flex-1 bg-white/[0.05]" />
        </div>

        {academic.map((item, i) => (
          <ExperienceCard key={i} item={item} type="academic" index={i} />
        ))}
      </div>
    </SectionWrapper>
  )
}
