import { motion } from 'framer-motion'
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

      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20 lg:items-center">
        {/* Bio */}
        <div className="flex flex-col gap-6 relative">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[var(--accent)]/[0.04] blur-3xl" />
          
          {bio.map((para, i) => (
            <motion.p
              key={i}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="text-[16px] leading-[1.85] text-[var(--text-secondary)] md:text-[17px] relative z-10"
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* Quick facts card */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          whileInView={reduced ? {} : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative group"
        >
          {/* Card Glow */}
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-b from-[var(--accent)]/30 to-transparent opacity-0 blur-lg transition duration-700 group-hover:opacity-50" />
          
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.05] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-base)] p-8 shadow-2xl transition-transform duration-500 hover:-translate-y-2 md:p-10">
            {/* Top glass reflection */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <h3 className="font-mono text-[12px] font-bold tracking-[0.2em] text-[var(--text-primary)] uppercase">
                {T.quick_facts}
              </h3>
            </div>

            <dl className="flex flex-col gap-6">
              {about.quickFacts.map((fact) => (
                <div key={l(fact.label, lang)} className="group/fact flex items-start gap-4">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] transition-colors duration-300 group-hover/fact:bg-[var(--accent)]" />
                  <div>
                    <dt className="mb-1 font-mono text-[10px] sm:text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase opacity-70">
                      {l(fact.label, lang)}
                    </dt>
                    <dd className="text-[15px] font-medium text-[var(--text-primary)] transition-colors duration-300 group-hover/fact:text-[var(--accent)]">
                      {l(fact.value, lang)}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
