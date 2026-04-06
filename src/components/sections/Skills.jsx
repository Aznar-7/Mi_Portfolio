import { motion } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { skills } from '@/data/skills'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const CATEGORY_LABELS = {
  'Frontend':               { en: 'Frontend' },
  'Backend':                { en: 'Backend' },
  'Bases de datos':         { en: 'Databases' },
  'Infraestructura':        { en: 'Infrastructure' },
  'Metodología':            { en: 'Methodology' },
  'Académico / Investigación': { en: 'Academic / Research' },
}

export function Skills() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].skills

  const entries = Object.entries(skills)
  const main = entries.filter(([, d]) => !d.academic)
  const academicSkills = entries.filter(([, d]) => d.academic).flatMap(([, d]) => d.items)

  const getLabel = (key) =>
    lang === 'en' ? (CATEGORY_LABELS[key]?.en ?? key) : key

  return (
    <SectionWrapper id="skills">
      <SectionHeading label={T.label} title={T.title} subtitle={T.subtitle} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {main.map(([category, data], i) => (
          <motion.div
            key={category}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={reduced ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)]/25 hover:bg-[var(--bg-hover)]"
          >
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: 'radial-gradient(350px circle at 50% 0%, rgba(124,106,247,0.07), transparent 70%)' }} />
            <p className="mb-3 font-mono text-[10px] font-semibold tracking-[0.14em] text-[var(--accent)] uppercase">
              {getLabel(category)}
            </p>
            <div className="flex flex-wrap gap-2">
              {data.items.map((skill) => (
                <span
                  key={skill}
                  className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    data.accent
                      ? 'bg-[rgba(124,106,247,0.12)] text-[var(--accent-hover)] ring-1 ring-[rgba(124,106,247,0.2)]'
                      : 'bg-white/[0.04] text-[var(--text-secondary)] ring-1 ring-white/[0.06] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {academicSkills.length > 0 && (
        <>
          <div className="my-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.05]" />
            <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--text-muted)] uppercase">
              {T.academic}
            </span>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {academicSkills.map((skill, i) => (
              <motion.span
                key={skill}
                initial={reduced ? false : { opacity: 0, scale: 0.88 }}
                whileInView={reduced ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="rounded-full border border-white/[0.07] px-3 py-1 text-[12px] italic text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </>
      )}
    </SectionWrapper>
  )
}
