import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { experience, academic } from '@/data/experience'
import { l } from '@/lib/utils'
import { PowerTitle } from './PowerTitle'

gsap.registerPlugin(ScrollTrigger)

// A vertical trace draws itself with the scroll and powers each role's pad as it arrives, while a
// large sticky year keeps time on the left. Everything stays readable without hovering.
export function Path() {
  const { lang } = useLang()
  const T = copy[lang].path
  const root = useRef(null)
  const items = [
    ...experience.map((e) => ({ kind: 'job', name: e.company, role: l(e.role, lang), span: e.span, bullets: l(e.impact, lang) })),
    ...academic.map((a) => ({ kind: 'study', name: l(a.degree, lang), role: a.institution.replace(' — ', ' · '), span: a.span, bullets: l(a.highlights, lang) })),
  ]
  const [active, setActive] = useState(0)
  const year = items[active].span[0]

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.tl-item').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 55%', end: 'bottom 55%',
          onToggle: (st) => { if (st.isActive) setActive(i) },
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
        <div className="tl-year" aria-hidden="true">
          <span key={year} className={`yr ${items[active].kind}`}>{year}</span>
          <small>{items[active].kind === 'job' ? items[active].name : 'UTN'}</small>
        </div>
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
              <ul>{it.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
