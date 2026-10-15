import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { experience, academic } from '@/data/experience'
import { l } from '@/lib/utils'

const START = 2023
const now = new Date()
const NOW = now.getFullYear() + now.getMonth() / 12
const pct = (y) => ((y - START) / (NOW - START + .15)) * 100

// One trace per role, its length is time; open roles run to today and end on a live pad
export function Path() {
  const { lang } = useLang()
  const T = copy[lang].path
  const lanes = [
    ...experience.map((e) => ({ name: e.company, role: l(e.role, lang), span: e.span, items: l(e.impact, lang), c: 'var(--fcu-c)' })),
    ...academic.map((a) => ({ name: `UTN · ${l(a.short, lang)}`, role: l(a.degree, lang), span: a.span, items: l(a.highlights, lang), c: 'var(--bcu-c)' })),
  ]
  const [active, setActive] = useState(1)
  const lanesRef = useRef(null)
  const lane = lanes[active]

  // traces grow from their start pad the first time the lanes come into view
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const segs = [...lanesRef.current.querySelectorAll('.seg')]
    segs.forEach((s) => { s.style.transform = 'scaleX(0)' })
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      segs.forEach((s, i) => s.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 900, delay: i * 120, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }))
      io.disconnect()
    }, { threshold: .4 })
    io.observe(lanesRef.current)
    return () => io.disconnect()
  }, [])

  const years = Array.from({ length: now.getFullYear() - START + 1 }, (_, i) => START + i)
  return (
    <section className="path" id="trayectoria">
      <h2>{T.title}</h2>
      <p className="sec-intro">{T.intro}</p>
      <div className="lanes" ref={lanesRef}>
        <div className="axis" aria-hidden="true">
          {years.map((y) => <span key={y} style={{ left: pct(y) + '%' }}>{y}</span>)}
          <span className="now" style={{ left: pct(NOW) + '%' }}>{T.now}</span>
        </div>
        {lanes.map((ln, i) => {
          const [from, to] = ln.span, end = to == null ? NOW : to + 1
          const pick = () => setActive(i)
          return (
            <button key={ln.name} className="lane" aria-pressed={active === i} onPointerEnter={pick} onFocus={pick} onClick={pick}>
              <span className="lane-name">{ln.name}<small>{ln.role}</small></span>
              <span className="lane-track">
                <i className={`seg${to == null ? ' open' : ''}`} style={{ '--c': ln.c, left: pct(from) + '%', width: pct(end) - pct(from) + '%' }} />
              </span>
            </button>
          )
        })}
      </div>
      <div className="lane-detail" aria-live="polite" style={{ '--c': lane.c }}>
        <p className="meta">{lane.span[1] == null ? T.ongoing(lane.span[0]) : lane.span[0]}</p>
        <h3>{lane.name}</h3>
        <p className="meta">{lane.role}</p>
        <ul>{lane.items.map((it) => <li key={it}>{it}</li>)}</ul>
      </div>
    </section>
  )
}
