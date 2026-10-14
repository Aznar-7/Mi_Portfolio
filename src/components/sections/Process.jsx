import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { processSteps } from '@/data/process'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { l } from '@/lib/utils'

// The delivery flow as one compact band: five stages, each backed by a real project
export function Process() {
  const { lang } = useLang()
  const T = translations[lang].process

  return (
    <SectionWrapper id="process">
      <SectionHeading title={T.title} subtitle={T.subtitle} />
      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
        {processSteps.map((step, i) => (
          <li key={step.id} className="border-t border-[var(--line-strong)] pt-5">
            <span className="text-sm tabular-nums text-[var(--accent-hover)]">{i + 1}</span>
            <h3 className="mt-2 text-lg font-medium tracking-[-0.02em] text-[var(--text-primary)]">{l(step.title, lang)}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-secondary)]">{l(step.detail, lang)}</p>
            <p className="mt-4 border-l border-[var(--line-strong)] pl-3 text-sm leading-relaxed text-[var(--text-muted)]">
              {l(step.example, lang)}
            </p>
          </li>
        ))}
      </ol>
    </SectionWrapper>
  )
}
