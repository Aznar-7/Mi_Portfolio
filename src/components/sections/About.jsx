import { useEffect, useRef } from 'react'
import { GitHubCalendar } from 'react-github-calendar'
import { ArrowUpRight } from 'lucide-react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { about } from '@/data/about'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { l } from '@/lib/utils'

// Copper ramp matching --accent, from bare board to busiest day
const CALENDAR_THEME = { dark: ['#1b1814', '#4a2f1f', '#7a4a2e', '#c97d4f', '#f0b48a'] }
const githubUser = site.github.split('github.com/')[1]

export function About() {
  const { lang } = useLang()
  const T = translations[lang].about
  const [lead, ...rest] = l(about.bio, lang)
  const calendarRef = useRef(null)

  // On phones the calendar scrolls sideways; open it on the latest weeks, not the oldest.
  // The library renders after fetching, so wait for the scroller to appear, then let go.
  useEffect(() => {
    const root = calendarRef.current
    if (!root) return
    const toLatest = () => {
      const scroller = [...root.querySelectorAll('*')].find((el) => el.scrollWidth > el.clientWidth)
      if (!scroller) return false
      scroller.scrollLeft = scroller.scrollWidth
      return true
    }
    if (toLatest()) return
    const observer = new MutationObserver(() => toLatest() && observer.disconnect())
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

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
        {/* The library sizes itself with inline styles. From md up, stretch its SVG (it has a viewBox) to the column; on phones keep real cell size and let it scroll */}
        <div ref={calendarRef} className="text-[var(--text-muted)] md:[&_.react-activity-calendar]:!w-full md:[&_.react-activity-calendar__footer]:!text-sm md:[&_svg]:!h-auto md:[&_svg]:!w-full">
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
