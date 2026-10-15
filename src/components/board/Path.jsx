import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { experience, academic } from '@/data/experience'
import { l } from '@/lib/utils'
import { PowerTitle } from './PowerTitle'
import { ToolIcon } from './ToolIcon'

gsap.registerPlugin(ScrollTrigger)

// A vertical trace draws itself with the scroll and powers each role's pad as it arrives. Each role reads
// in three columns: when, who and where, what got done. Studies run in parallel, so they sit apart.
export function Path() {
  const { lang } = useLang()
  const T = copy[lang].path
  const root = useRef(null)
  const items = [
    ...experience.map((e) => ({ kind: 'job', name: e.company, role: l(e.role, lang), span: e.span, bullets: l(e.impact, lang), tech: e.tech, stats: e.stats?.map((st) => ({ value: st.value, label: l(st.label, lang) })) })),
  ]
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.tl-item').forEach((el) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 60%',
          onEnter: () => el.classList.add('on'),
          onLeaveBack: () => el.classList.remove('on'),
        })
      })
      if (!reduced) {
        gsap.fromTo('.tl-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.tl-list', start: 'top 55%', end: 'bottom 55%', scrub: 0.5 } })
      }
    }, root)
    return () => ctx.revert()
  }, [lang])

  return (
    <section className="path" id="trayectoria" ref={root}>
      <PowerTitle text={T.title} />
      <p className="sec-intro">{T.intro}</p>
      <div className="tl">
        <div className="tl-list">
          <span className="tl-line" aria-hidden="true"><span className="tl-fill" /></span>
          <ol className="tl-items">
          {items.map((it) => (
            <li key={it.name} className={`tl-item ${it.kind}`}>
              <span className="tl-pad" aria-hidden="true" />
              <p className="tl-when">{it.span[1] == null ? T.ongoing(it.span[0]) : it.span[0]}</p>
              <div className="tl-head">
                <div>
                  <h3>{it.name}</h3>
                  <p className="tl-role">{it.role}</p>
                </div>
              </div>
              {it.stats && (
                <dl className="tl-stats">
                  {it.stats.map((st) => <div key={st.label}><dt>{st.value}</dt><dd>{st.label}</dd></div>)}
                </dl>
              )}
              <ul>{it.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              {it.tech && <ul className="chips tl-chips">{it.tech.map((t) => <li key={t}><ToolIcon name={t} />{t}</li>)}</ul>}
            </li>
          ))}
          </ol>
        </div>
      </div>
      <div className="edu">
        <h3 className="edu-title">{T.study}</h3>
        <ol className="edu-list">
          {academic.map((a) => (
            <li key={a.degree.es}>
              <p className="edu-when">{a.span[1] == null ? T.ongoing(a.span[0]) : a.span.join(' – ')}</p>
              <div className="edu-what">
                <h4>{l(a.degree, lang)}</h4>
                <p className="edu-where">{a.institution.replace(' — ', ' · ')}</p>
              </div>
              <p className="edu-note">{l(a.highlights, lang).join(' ')}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
