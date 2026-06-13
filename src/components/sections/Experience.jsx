import { motion } from 'motion/react'
import { BriefcaseBusiness, GraduationCap } from 'lucide-react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { experience, academic } from '@/data/experience'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { l } from '@/lib/utils'

const GROUP_STYLES = {
  work: {
    Icon: BriefcaseBusiness,
    accent: 'var(--accent)',
    accentRgb: '124,106,247',
  },
  academic: {
    Icon: GraduationCap,
    accent: '#22d3ee',
    accentRgb: '34,211,238',
  },
}

function ExperienceCard({ item, type, index, isLast }) {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const points = l(item.impact ?? item.highlights, lang) ?? []
  const style = GROUP_STYLES[type]

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
      className={`group relative grid gap-4 md:grid-cols-[160px_1fr] md:gap-8 ${isLast ? '' : 'pb-10 sm:pb-12'}`}
    >
      <div className="flex items-start justify-between gap-4 md:block md:pt-5 md:text-right">
        <span
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: style.accent }}
        >
          {l(item.period, lang)}
        </span>
        <span className="font-mono text-[10px] text-[var(--text-muted)] md:mt-2 md:block">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {!isLast && (
        <div
          className="absolute bottom-0 left-[175px] top-7 hidden w-px md:block"
          style={{ background: `linear-gradient(to bottom, rgba(${style.accentRgb},0.32), rgba(${style.accentRgb},0.04))` }}
        />
      )}
      <div
        className="absolute left-[170px] top-6 hidden h-3 w-3 rounded-full border-[3px] border-[var(--bg-base)] md:block"
        style={{
          background: style.accent,
          boxShadow: `0 0 0 3px rgba(${style.accentRgb},0.12), 0 0 18px rgba(${style.accentRgb},0.22)`,
        }}
      />

      <div
        className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] sm:p-6"
        style={{ boxShadow: `inset 0 1px 0 rgba(${style.accentRgb},0.04)` }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-px opacity-70"
          style={{ background: `linear-gradient(to bottom, transparent, ${style.accent}, transparent)` }}
        />

        <div className="mb-4">
          <h4 className="text-[1.05rem] font-bold tracking-tight text-[var(--text-primary)] sm:text-[1.15rem]">
            {l(item.role ?? item.degree, lang)}
          </h4>
          <p className="mt-1.5 text-[12px] font-semibold tracking-wide text-[var(--text-muted)] sm:text-[13px]">
            {item.company ?? item.institution}
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {points.map((point, pointIndex) => (
            <li
              key={pointIndex}
              className="relative pl-4 text-[13px] leading-[1.75] text-[var(--text-secondary)]"
            >
              <span
                className="absolute left-0 top-[8px] h-1.5 w-1.5 rounded-full"
                style={{ background: `rgba(${style.accentRgb},0.55)` }}
              />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}

function ExperienceGroup({ type, title, subtitle, countLabel, items }) {
  const reduced = useReducedMotion()
  const style = GROUP_STYLES[type]
  const Icon = style.Icon

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[var(--bg-surface)]/55"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, rgba(${style.accentRgb},0.55), transparent)` }}
      />
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `rgba(${style.accentRgb},0.07)` }}
      />

      <header className="relative flex flex-col gap-5 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
            style={{
              color: style.accent,
              borderColor: `rgba(${style.accentRgb},0.2)`,
              background: `rgba(${style.accentRgb},0.07)`,
            }}
          >
            <Icon size={19} />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
              {title}
            </h3>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[var(--text-muted)]">
              {subtitle}
            </p>
          </div>
        </div>

        <span
          className="w-fit rounded-full border px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]"
          style={{
            color: style.accent,
            borderColor: `rgba(${style.accentRgb},0.18)`,
            background: `rgba(${style.accentRgb},0.05)`,
          }}
        >
          {items.length} {countLabel}
        </span>
      </header>

      <div className="relative p-5 sm:p-7 lg:p-8">
        {items.map((item, index) => (
          <ExperienceCard
            key={`${item.company ?? item.institution}-${index}`}
            item={item}
            type={type}
            index={index}
            isLast={index === items.length - 1}
          />
        ))}
      </div>
    </motion.section>
  )
}

export function Experience() {
  const { lang } = useLang()
  const T = translations[lang].experience

  return (
    <SectionWrapper id="experience">
      <SectionHeading label={T.label} title={T.title} subtitle={T.subtitle} />

      <div className="mt-14 grid max-w-5xl gap-8">
        <ExperienceGroup
          type="work"
          title={T.work_title}
          subtitle={T.work_subtitle}
          countLabel={T.roles}
          items={experience}
        />
        <ExperienceGroup
          type="academic"
          title={T.education_title}
          subtitle={T.education_subtitle}
          countLabel={T.programs}
          items={academic}
        />
      </div>
    </SectionWrapper>
  )
}
