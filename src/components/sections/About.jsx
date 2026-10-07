import { GitHubCalendar } from 'react-github-calendar'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { about } from '@/data/about'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { l } from '@/lib/utils'

// Violet ramp matching --accent, from empty cell to busiest day
const CALENDAR_THEME = { dark: ['#16161d', '#2e2852', '#4a3f8f', '#6d5fd6', '#a99dff'] }
const githubUser = site.github.split('github.com/')[1]

export function About() {
  const { lang } = useLang()
  const T = translations[lang].about
  const [lead, ...rest] = l(about.bio, lang)

  return (
    <SectionWrapper id="about">
      <SectionHeading title={T.title} />

      <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-20">
        <div className="max-w-prose">
          <p className="text-xl leading-relaxed tracking-[-0.01em] text-[var(--text-primary)] sm:text-2xl sm:leading-snug">
            {lead}
          </p>
          {rest.map((para) => (
            <p key={para} className="mt-6 text-[17px] leading-relaxed text-[var(--text-secondary)]">
              {para}
            </p>
          ))}
        </div>

        <dl className="divide-y divide-[var(--line)] self-start border-y border-[var(--line)]">
          {about.quickFacts.map((fact) => (
            <div key={l(fact.label, 'en')} className="flex flex-col gap-1 py-4">
              <dt className="text-sm text-[var(--text-muted)]">{l(fact.label, lang)}</dt>
              <dd className="text-[15px] text-[var(--text-primary)]">{l(fact.value, lang)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <figure className="mt-20 overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-6 sm:p-8">
        <figcaption className="mb-6 text-sm text-[var(--text-secondary)]">
          {lang === 'es' ? 'Actividad en GitHub, último año' : 'GitHub activity, last year'}
        </figcaption>
        <GitHubCalendar
          username={githubUser}
          colorScheme="dark"
          theme={CALENDAR_THEME}
          blockRadius={3}
          fontSize={12}
          labels={lang === 'es' ? {
            totalCount: '{{count}} contribuciones en el último año',
            legend: { less: 'Menos', more: 'Más' },
            months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          } : undefined}
        />
      </figure>
    </SectionWrapper>
  )
}
