import { lazy, Suspense } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { about } from '@/data/about'
import { site } from '@/data/site'
import { l } from '@/lib/utils'
import { PowerTitle } from './PowerTitle'

// Solder-mask ground to bright pad: the busiest days shine like fresh solder
const CALENDAR_THEME = { dark: ['#16181d', '#3a3224', '#66552f', '#a3884a', '#e8e2b0'] }
const githubUser = site.github.split('github.com/')[1]
// The calendar pulls in a date library; it loads after the first screen
const GitHubCalendar = lazy(() => import('react-github-calendar').then((m) => ({ default: m.GitHubCalendar })))

export function About() {
  const { lang } = useLang()
  const T = copy[lang].about
  const [lead, ...rest] = l(about.bio, lang)

  return (
    <section className="about" id="sobre">
      <PowerTitle text={T.title} />
      <div className="about-grid">
        <figure className="portrait">
          <img src="/port.jpg" alt="Vicente Aznar" width="400" height="400" loading="lazy" />
        </figure>
        <div className="about-body">
          <p className="about-lead">{lead}</p>
          {rest.map((p) => <p key={p}>{p}</p>)}
          <dl className="facts">
            {about.quickFacts.map((f) => (
              <div key={l(f.label, lang)}><dt>{l(f.label, lang)}</dt><dd>{l(f.value, lang)}</dd></div>
            ))}
          </dl>
        </div>
      </div>
      <figure className="activity">
        <figcaption>
          <span>{T.github}</span>
          <a href={site.github} target="_blank" rel="noopener noreferrer">github.com/{githubUser}<ArrowUpRight size={14} aria-hidden="true" /></a>
        </figcaption>
        <Suspense fallback={<div className="cal-wait" />}>
        <GitHubCalendar
          username={githubUser}
          colorScheme="dark"
          theme={CALENDAR_THEME}
          blockSize={12}
          blockMargin={4}
          blockRadius={2}
          fontSize={12}
          labels={{ totalCount: T.total, legend: { less: T.less, more: T.more }, ...(T.months && { months: T.months }) }}
        />
        </Suspense>
      </figure>
    </section>
  )
}
