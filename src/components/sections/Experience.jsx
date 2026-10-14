import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { experience, academic } from '@/data/experience'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { l } from '@/lib/utils'

// One row of the ledger: period | role and place | detail
function Row({ period, title, place, children }) {
  return (
    <li className="grid gap-x-10 gap-y-2 border-t border-[var(--line)] py-8 md:grid-cols-[10rem_1fr]">
      <p className="text-sm tabular-nums text-[var(--text-muted)] md:pt-1">{period}</p>
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h4 className="text-xl font-medium tracking-[-0.02em] text-[var(--text-primary)]">{title}</h4>
          <p className="text-[15px] text-[var(--text-secondary)]">{place}</p>
        </div>
        {children}
      </div>
    </li>
  )
}

export function Experience() {
  const { lang } = useLang()
  const T = translations[lang].experience

  return (
    <SectionWrapper id="experience">
      <SectionHeading title={T.title} subtitle={T.subtitle} />

      <h3 className="mb-2 text-sm text-[var(--text-muted)]">{T.work_title}</h3>
      <ol className="border-b border-[var(--line)]">
        {experience.map((job) => (
          <Row key={job.company} period={l(job.period, lang)} title={l(job.role, lang)} place={job.company}>
            <ul className="mt-4 grid max-w-3xl gap-2.5">
              {(l(job.impact, lang) ?? []).map((point) => (
                <li key={point} className="text-[15px] leading-relaxed text-[var(--text-secondary)]">{point}</li>
              ))}
            </ul>
          </Row>
        ))}
      </ol>

      <h3 className="mb-2 mt-16 text-sm text-[var(--text-muted)]">{T.education_title}</h3>
      <ol className="border-b border-[var(--line)]">
        {academic.map((degree) => (
          <Row key={l(degree.degree, 'en')} period={l(degree.period, lang)} title={l(degree.degree, lang)} place={degree.institution} />
        ))}
      </ol>
    </SectionWrapper>
  )
}
