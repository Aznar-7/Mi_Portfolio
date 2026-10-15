import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { about } from '@/data/about'
import { site } from '@/data/site'
import { l } from '@/lib/utils'
import { useLatestPush, timeAgo } from '@/hooks/useLatestPush'
import { useGitHubLanguages } from '@/hooks/useGitHubLanguages'
import { GitHubIcon } from '@/components/common/SocialIcons'
import { PowerTitle } from './PowerTitle'
import { ToolIcon } from './ToolIcon'

// Solder-mask ground to bright pad: the busiest days shine like fresh solder
const CALENDAR_THEME = { dark: ['#16181d', '#3a3224', '#66552f', '#a3884a', '#e8e2b0'] }
const githubUser = site.github.split('github.com/')[1]
// The calendar pulls in a date library; it loads after the first screen
const GitHubCalendar = lazy(() => import('react-github-calendar').then((m) => ({ default: m.GitHubCalendar })))

function useCordobaTime(lang) {
  const fmt = () => new Intl.DateTimeFormat(lang === 'es' ? 'es-AR' : 'en-US', { timeZone: 'America/Argentina/Cordoba', hour: '2-digit', minute: '2-digit' }).format(new Date())
  const [t, setT] = useState(fmt)
  useEffect(() => { const id = setInterval(() => setT(fmt()), 15000); return () => clearInterval(id) })
  return t
}

// "Right now": live, real readings instead of adjectives
function Now({ T, lang }) {
  const time = useCordobaTime(lang)
  const push = useLatestPush(githubUser)
  const langs = useGitHubLanguages(githubUser)
  return (
    <aside className="now" aria-label={T.now}>
      <p className="now-title"><i className="led live" />{T.now}</p>
      <dl>
        <div><dt>{T.local}</dt><dd className="mono">{time} · Córdoba</dd></div>
        <div><dt>{T.building}</dt><dd>{T.buildingWhat}</dd></div>
        {push && <div><dt>{T.lastPush}</dt><dd><a href={`${site.github}/${push.repo}`} target="_blank" rel="noopener noreferrer">{push.repo}</a>, {timeAgo(push.at, lang)}</dd></div>}
      </dl>
      {langs && (
        <div className="langs">
          <p className="now-sub">{T.langs}</p>
          <div className="lang-bar" aria-hidden="true">
            {langs.map((g) => <span key={g.name} style={{ flexGrow: g.share }} />)}
          </div>
          <ul>
            {langs.map((g) => <li key={g.name}><ToolIcon name={g.name} size={13} />{g.name}<small>{Math.round(g.share * 100)}%</small></li>)}
          </ul>
        </div>
      )}
    </aside>
  )
}

export function About() {
  const { lang } = useLang()
  const T = copy[lang].about
  const [lead, ...rest] = l(about.bio, lang)

  return (
    <section className="about" id="sobre">
      <PowerTitle text={T.title} />
      <div className="about-top">
        <p className="about-lead">{lead}</p>
        <figure className="portrait">
          <img src="/port.jpg" alt="Vicente Aznar" width="400" height="400" loading="lazy" />
          <figcaption>Vicente Aznar · Córdoba</figcaption>
        </figure>
      </div>
      <div className="about-cols">
        <div className="about-body">{rest.map((p) => <p key={p}>{p}</p>)}</div>
        <dl className="facts">
          {about.quickFacts.map((f) => (
            <div key={l(f.label, lang)}><dt>{l(f.label, lang)}</dt><dd>{l(f.value, lang)}</dd></div>
          ))}
        </dl>
        <Now T={T} lang={lang} />
      </div>
      <figure className="activity">
        <figcaption>
          <span><GitHubIcon size={15} />{T.github}</span>
          <a href={site.github} target="_blank" rel="noopener noreferrer">github.com/{githubUser}<ArrowUpRight size={14} aria-hidden="true" /></a>
        </figcaption>
        <div className="cal-scroll">
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
        </div>
      </figure>
    </section>
  )
}
