import { GitHubCalendar } from 'react-github-calendar'
import { ArrowUpRight } from 'lucide-react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { about } from '@/data/about'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { l } from '@/lib/utils'

// Violet ramp matching --accent, from empty cell to busiest day
const CALENDAR_THEME = { dark: ['#14141b', '#2e2852', '#4a3f8f', '#6d5fd6', '#a99dff'] }
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

      <figure className="mt-20 border-t border-[var(--line)] pt-8">
        <figcaption className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <span className="text-sm text-[var(--text-muted)]">
            {lang === 'es' ? 'Actividad en GitHub, último año' : 'GitHub activity, last year'}
          </span>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            github.com/{githubUser}
            <ArrowUpRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </figcaption>
        {/* The library sizes itself with inline styles; stretch its SVG (it has a viewBox) to the column */}
        <div className="text-[var(--text-muted)] [&_.react-activity-calendar]:!w-full [&_.react-activity-calendar__footer]:!text-sm [&_svg]:!h-auto [&_svg]:!w-full">
          <GitHubCalendar
            username={githubUser}
            colorScheme="dark"
            theme={CALENDAR_THEME}
            blockSize={12}
            blockMargin={4}
            blockRadius={2}
            fontSize={11}
            labels={lang === 'es' ? {
              totalCount: '{{count}} contribuciones en el último año',
              legend: { less: 'Menos', more: 'Más' },
              months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            } : undefined}
          />
        </div>
      </figure>
    </SectionWrapper>
  )
}
