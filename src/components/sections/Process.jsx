import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { processSteps } from '@/data/process'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { l } from '@/lib/utils'

// Example lines read "Project: what happened"; the project name sits above as the reference
function Example({ text }) {
  const at = text.indexOf(': ')
  if (at === -1) return text
  const rest = text.slice(at + 2)
  return (
    <>
      <span className="mb-1 block text-sm text-[var(--text-primary)]">{text.slice(0, at)}</span>
      {rest.charAt(0).toUpperCase() + rest.slice(1)}
    </>
  )
}

// The delivery flow as a ledger, like Experience: stage | what I do | where it happened
export function Process() {
  const { lang } = useLang()
  const T = translations[lang].process

  return (
    <SectionWrapper id="process">
      <SectionHeading title={T.title} subtitle={T.subtitle} />
      <ol className="border-b border-[var(--line)]">
        {processSteps.map((step, i) => (
          <li
            key={step.id}
            className="grid gap-x-10 gap-y-3 border-t border-[var(--line)] py-7 md:grid-cols-[10rem_1fr] lg:grid-cols-[10rem_1fr_1fr]"
          >
            <h3 className="flex items-baseline gap-3 text-xl font-medium tracking-[-0.02em] text-[var(--text-primary)]">
              <span className="text-sm tabular-nums text-[var(--text-muted)]">{i + 1}</span>
              {l(step.title, lang)}
            </h3>
            <p className="max-w-prose text-[15px] leading-relaxed text-[var(--text-secondary)]">{l(step.detail, lang)}</p>
            <p className="max-w-prose text-[15px] leading-relaxed text-[var(--text-muted)] md:col-start-2 lg:col-start-auto">
              <Example text={l(step.example, lang)} />
            </p>
          </li>
        ))}
      </ol>
    </SectionWrapper>
  )
}
