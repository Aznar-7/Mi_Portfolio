import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
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
      initial={reduced ? false : { opacity: 0, x: -20 }}
      whileInView={reduced ? {} : { opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ type: 'spring', stiffness: 180, damping: 24, delay: index * 0.08 }}
      className="flex gap-8 pb-10"
    >
      {/* Timeline dot — the fill line is behind in the parent */}
      <div className="flex flex-col items-center flex-shrink-0 w-3">
        <div
          className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full"
          style={{
            backgroundColor: type === 'work' ? 'var(--accent)' : 'var(--text-muted)',
            border: `2px solid var(--bg-base)`,
            boxShadow: type === 'work' ? '0 0 0 4px rgba(124,106,247,0.18)' : 'none',
            position: 'relative',
            zIndex: 2,
          }}
        />
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
        <p className="mb-4 text-sm font-semibold text-[var(--accent)]">
          {item.company ?? item.institution}
        </p>
        <ul className="flex flex-col gap-2.5">
          {points.map((point, i) => (
            <li key={i} className="relative pl-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">
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
  const reduced = useReducedMotion()
  const timelineRef = useRef(null)

  // Scroll-fill timeline line
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 85%', 'end 30%'],
  })
  const rawScale = useSpring(scrollYProgress, { stiffness: 80, damping: 28 })
  const scaleY   = reduced ? 1 : rawScale

  return (
    <SectionWrapper id="experience">
      <SectionHeading label={T.label} title={T.title} subtitle={T.subtitle} />

      <div className="max-w-[700px]" ref={timelineRef}>
        {/* Continuous fill line */}
        <div style={{ position: 'relative' }}>
          {!reduced && (
            <motion.div
              style={{
                position: 'absolute',
                left: '5px',
                top: '6px',
                bottom: '40px',
                width: '1px',
                backgroundColor: 'var(--accent)',
                opacity: 0.35,
                scaleY,
                transformOrigin: 'top',
              }}
            />
          )}
          {/* Background track */}
          <div style={{
            position: 'absolute', left: '5px', top: '6px', bottom: '40px',
            width: '1px', backgroundColor: 'rgba(255,255,255,0.05)',
          }} />

          {experience.map((item, i) => (
            <ExperienceCard key={i} item={item} type="work" index={i} />
          ))}
        </div>

        {/* Academic divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.05]" />
          <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--text-muted)] uppercase whitespace-nowrap">
            {T.academic_divider}
          </span>
          <div className="h-px flex-1 bg-white/[0.05]" />
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: '5px', top: '6px', bottom: '40px',
            width: '1px', backgroundColor: 'rgba(255,255,255,0.05)',
          }} />
          {academic.map((item, i) => (
            <ExperienceCard key={i} item={item} type="academic" index={i} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
