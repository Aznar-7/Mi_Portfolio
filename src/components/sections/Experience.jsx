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

const TYPE_STYLES = {
  work: {
    dotBg:      'var(--accent)',
    dotGlow:    '0 0 0 3px rgba(124,106,247,0.15), 0 0 18px rgba(124,106,247,0.35)',
    badgeBg:    'rgba(124,106,247,0.07)',
    badgeBorder:'rgba(124,106,247,0.22)',
    badgeText:  'rgba(167,152,255,0.85)',
    cardHover:  'rgba(124,106,247,0.12)',
    bullet:     'var(--accent)',
  },
  academic: {
    dotBg:      '#22d3ee',
    dotGlow:    '0 0 0 3px rgba(34,211,238,0.12), 0 0 18px rgba(34,211,238,0.3)',
    badgeBg:    'rgba(34,211,238,0.06)',
    badgeBorder:'rgba(34,211,238,0.2)',
    badgeText:  'rgba(103,232,249,0.85)',
    cardHover:  'rgba(34,211,238,0.06)',
    bullet:     '#22d3ee',
  },
}

function ExperienceCard({ item, type, index = 0 }) {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const points = l(item.impact ?? item.highlights, lang) ?? []
  const s = TYPE_STYLES[type]
  const typeLabel = {
    es: { work: 'Profesional', academic: 'Académico' },
    en: { work: 'Professional', academic: 'Academic'  },
  }[lang][type]

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      className="group relative grid gap-6 md:grid-cols-[180px_1fr] md:gap-10 pb-16 last:pb-0"
    >
      {/* Left: period + type badge */}
      <div className="flex flex-col md:items-end md:text-right pt-1 gap-2.5">
        <span className="font-mono text-[12px] font-semibold uppercase tracking-widest text-[var(--accent)]/80 sm:text-[13px]">
          {l(item.period, lang)}
        </span>
        <span
          className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase border"
          style={{ background: s.badgeBg, borderColor: s.badgeBorder, color: s.badgeText }}
        >
          {typeLabel}
        </span>
      </div>

      {/* Timeline line + dot */}
      <div className="absolute left-[8px] top-2 hidden h-full w-[2px] bg-gradient-to-b from-[var(--accent)]/35 via-white/[0.04] to-transparent md:left-[199px] md:block" />
      <div
        className="absolute left-0 top-[9px] hidden h-3.5 w-3.5 rounded-full border-[3px] border-[var(--bg-base)] transition-all duration-400 md:left-[193px] md:block"
        style={{
          background: s.dotBg,
          boxShadow: '0 0 0 2px rgba(124,106,247,0.1)',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = s.dotGlow; e.currentTarget.style.transform = 'scale(1.3)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(124,106,247,0.1)'; e.currentTarget.style.transform = 'scale(1)' }}
      />

      {/* Content */}
      <div className="relative z-10 md:pl-8">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-[1.2rem] font-bold tracking-tight text-[var(--text-primary)] transition-colors duration-300 group-hover:text-[var(--accent)]">
            {l(item.role ?? item.degree, lang)}
          </h3>
          <p className="mt-1 text-[13px] font-semibold tracking-wide text-[var(--text-muted)]">
            {item.company ?? item.institution}
          </p>
        </div>

        {/* Points card */}
        <div
          className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 transition-all duration-400 group-hover:border-white/[0.08]"
          style={{ '--hover-bg': s.cardHover }}
        >
          <ul className="flex flex-col gap-3.5">
            {points.map((point, i) => (
              <li key={i} className="relative pl-5 text-[13.5px] leading-[1.82] text-[var(--text-secondary)] transition-colors duration-300 group-hover:text-[var(--text-primary)]/80">
                <span
                  className="absolute left-0 top-[9px] h-1.5 w-1.5 rounded-full transition-colors duration-300"
                  style={{ background: `${s.bullet}55` }}
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
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
        {/* Professional */}
        <div className="mb-20">
          {experience.map((item, i) => (
            <ExperienceCard key={i} item={item} type="work" index={i} />
          ))}
        </div>

        {/* Academic divider */}
        <div className="mb-12 flex items-center gap-6">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/[0.06] md:flex-none md:w-[180px] md:to-[var(--accent)]/40" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {T.academic_divider}
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.06] to-transparent md:from-[var(--accent)]/40" />
        </div>

        {/* Academic */}
        <div>
          {academic.map((item, i) => (
            <ExperienceCard key={i} item={item} type="academic" index={i} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
