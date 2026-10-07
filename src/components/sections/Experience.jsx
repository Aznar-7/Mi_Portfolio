import { BriefcaseBusiness, GraduationCap } from 'lucide-react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { experience, academic } from '@/data/experience'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { l } from '@/lib/utils'

const isCurrent = (period) => /present|presente/i.test(l(period, 'en'))

// Emphasize quantified impact ("40%", "4+") inside a sentence
function Highlighted({ text }) {
  return text.split(/(\d+(?:[.,]\d+)?\s?%|\d+\+)/).map((part, i) =>
    i % 2 ? <strong key={i} className="font-medium text-[var(--text-primary)]">{part}</strong> : part,
  )
}

function GroupTitle({ Icon, title, note }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line-strong)] text-[var(--accent-hover)]">
        <Icon size={17} aria-hidden="true" />
      </span>
      <h3 className="text-lg font-medium text-[var(--text-primary)]">{title}</h3>
      <span className="text-sm text-[var(--text-muted)]">{note}</span>
    </div>
  )
}

function WorkTimeline({ items, lang, T }) {
  return (
    <ol className="relative ml-[17px] border-l border-[var(--line)]">
      {items.map((item) => {
        const current = isCurrent(item.period)
        return (
          <li key={item.company} className="relative pb-12 pl-8 last:pb-0 sm:pl-10">
            <span
              aria-hidden="true"
              className={`absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full ${current ? 'bg-[var(--accent-hover)] shadow-[0_0_0_5px_var(--accent-glow)]' : 'border border-[var(--line-strong)] bg-[var(--bg-base)]'}`}
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h4 className="text-xl font-medium tracking-[-0.02em] text-[var(--text-primary)]">{l(item.role, lang)}</h4>
              {current && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 px-2 py-0.5 text-xs text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  {T.current}
                </span>
              )}
            </div>
            <p className="mt-1 text-[15px] text-[var(--text-secondary)]">
              {item.company}
              <span className="mx-2 text-[var(--text-muted)]" aria-hidden="true">/</span>
              <span className="tabular-nums text-[var(--text-muted)]">{l(item.period, lang)}</span>
            </p>
            <ul className="mt-5 flex max-w-prose flex-col gap-3">
              {(l(item.impact, lang) ?? []).map((point) => (
                <li
                  key={point}
                  className="relative pl-5 text-[15px] leading-relaxed text-[var(--text-secondary)] before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-[var(--text-muted)]"
                >
                  <Highlighted text={point} />
                </li>
              ))}
            </ul>
          </li>
        )
      })}
    </ol>
  )
}

function EducationCards({ items, lang, T }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={l(item.degree, 'en')} className="flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--text-muted)]">{item.institution}</span>
            {isCurrent(item.period) && <span className="shrink-0 text-[var(--accent-hover)]">{T.in_progress}</span>}
          </div>
          <h4 className="mt-3 text-xl font-medium tracking-[-0.02em] text-[var(--text-primary)]">{l(item.degree, lang)}</h4>
          <p className="mt-1 text-sm tabular-nums text-[var(--text-muted)]">{l(item.period, lang)}</p>
          <ul className="mt-5 flex flex-col gap-2.5 border-t border-[var(--line)] pt-5">
            {(l(item.highlights, lang) ?? []).map((point) => (
              <li key={point} className="text-sm leading-relaxed text-[var(--text-secondary)]">{point}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

export function Experience() {
  const { lang } = useLang()
  const T = translations[lang].experience

  return (
    <SectionWrapper id="experience">
      <SectionHeading title={T.title} subtitle={T.subtitle} />
      <div className="flex flex-col gap-20">
        <div>
          <GroupTitle Icon={BriefcaseBusiness} title={T.work_title} note={T.work_note} />
          <WorkTimeline items={experience} lang={lang} T={T} />
        </div>
        <div>
          <GroupTitle Icon={GraduationCap} title={T.education_title} note={T.education_note} />
          <EducationCards items={academic} lang={lang} T={T} />
        </div>
      </div>
    </SectionWrapper>
  )
}
