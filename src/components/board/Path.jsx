import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { experience, academic } from '@/data/experience'
import { l } from '@/lib/utils'

const START = 2023
const now = new Date()
const NOW = now.getFullYear() + now.getMonth() / 12
const pct = (y) => ((y - START) / (NOW - START)) * 100
const YEARS = Array.from({ length: now.getFullYear() - START + 1 }, (_, i) => START + i)

// Reads like a CV: every role open, newest first. Each row carries its own trace on a shared
// 2023 → today scale, so the overlap between work and study shows without hovering anything.
function Row({ name, role, span, items, kind, T }) {
  const [from, to] = span
  const end = to == null ? NOW : to + 1
  return (
    <li className={`role ${kind}`}>
      <div className="role-when">
        <span className="role-period">{to == null ? T.ongoing(from) : from}</span>
        <span className="role-track" aria-hidden="true">
          <i className={to == null ? 'open' : undefined} style={{ left: pct(from) + '%', width: Math.max(4, pct(end) - pct(from)) + '%' }} />
        </span>
      </div>
      <div className="role-what">
        <h3>{name}</h3>
        <p className="role-title">{role}</p>
        <ul>{items.map((it) => <li key={it}>{it}</li>)}</ul>
      </div>
    </li>
  )
}

export function Path() {
  const { lang } = useLang()
  const T = copy[lang].path
  return (
    <section className="path" id="trayectoria">
      <h2>{T.title}</h2>
      <p className="sec-intro">{T.intro}</p>
      <div className="scale" aria-hidden="true">
        {YEARS.map((y) => <span key={y} style={{ left: pct(y) + '%' }}>{y}</span>)}
        <span className="now" style={{ left: '100%' }}>{T.now}</span>
      </div>
      <h3 className="group">{T.work}</h3>
      <ol className="roles">
        {experience.map((e) => <Row key={e.company} name={e.company} role={l(e.role, lang)} span={e.span} items={l(e.impact, lang)} kind="job" T={T} />)}
      </ol>
      <h3 className="group">{T.study}</h3>
      <ol className="roles">
        {academic.map((a) => <Row key={l(a.short, lang)} name={l(a.degree, lang)} role={a.institution.replace(' — ', ' · ')} span={a.span} items={l(a.highlights, lang)} kind="study" T={T} />)}
      </ol>
    </section>
  )
}
