import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { experience, academic } from '@/data/experience'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { l } from '@/lib/utils'

function Entry({ item, lang }) {
  const points = l(item.impact ?? item.highlights, lang) ?? []

  return (
    <li className="grid gap-3 border-t border-[var(--line)] py-8 first:border-t-0 first:pt-0 sm:grid-cols-[9rem_1fr] sm:gap-8">
      <p className="text-sm tabular-nums text-[var(--text-muted)] sm:pt-1">{l(item.period, lang)}</p>
      <div>
        <h4 className="text-lg font-medium tracking-[-0.015em] text-[var(--text-primary)]">
          {l(item.role ?? item.degree, lang)}
        </h4>
        <p className="mt-1 text-[15px] text-[var(--text-secondary)]">{item.company ?? item.institution}</p>
        <ul className="mt-5 flex max-w-prose flex-col gap-3">
          {points.map((point) => (
            <li
              key={point}
              className="relative pl-5 text-[15px] leading-relaxed text-[var(--text-secondary)] before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-[var(--text-muted)]"
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

function Group({ title, items, lang }) {
  return (
    <div className="grid gap-6 md:grid-cols-[12rem_1fr] md:gap-10">
      <h3 className="text-sm font-medium text-[var(--accent-hover)] md:sticky md:top-24 md:self-start">{title}</h3>
      <ol>
        {items.map((item) => (
          <Entry key={`${item.company ?? item.institution}-${l(item.role ?? item.degree, 'en')}`} item={item} lang={lang} />
        ))}
      </ol>
    </div>
  )
}

export function Experience() {
  const { lang } = useLang()
  const T = translations[lang].experience

  return (
    <SectionWrapper id="experience">
      <SectionHeading title={T.title} subtitle={T.subtitle} />
      <div className="flex flex-col gap-16 md:gap-20">
        <Group title={T.work_title} items={experience} lang={lang} />
        <Group title={T.education_title} items={academic} lang={lang} />
      </div>
    </SectionWrapper>
  )
}
