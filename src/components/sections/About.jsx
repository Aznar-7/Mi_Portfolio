import { motion } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { about } from '@/data/about'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

export function About() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].about
  const bio = l(about.bio, lang)

  return (
    <SectionWrapper id="about">
      <SectionHeading label={T.label} title={T.title} />

      <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:items-start">
        {/* Bio */}
        <div className="flex flex-col gap-5">
          {bio.map((para, i) => (
            <motion.p
              key={i}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[15px] leading-[1.82] text-[var(--text-secondary)]"
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* Quick facts card */}
        <motion.div
          initial={reduced ? false : { opacity: 0, x: 20 }}
          whileInView={reduced ? {} : { opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--bg-surface)] p-6"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/25 to-transparent" />
          <p className="mb-5 font-mono text-[10px] tracking-[0.16em] text-[var(--accent)] uppercase">
            {T.quick_facts}
          </p>
          <dl className="flex flex-col gap-4">
            {about.quickFacts.map((fact) => (
              <div key={l(fact.label, lang)}>
                <dt className="mb-0.5 font-mono text-[10px] tracking-[0.1em] text-[var(--text-muted)] uppercase">
                  {l(fact.label, lang)}
                </dt>
                <dd className="text-sm text-[var(--text-primary)]">
                  {l(fact.value, lang)}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
