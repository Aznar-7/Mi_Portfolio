import { useRef, useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { skillGroups } from '@/data/skills'
import { projects } from '@/data/projects'
import { l } from '@/lib/utils'

// Everywhere a tool can point: the projects plus the day job
const PLACES = [
  ...projects.map((p) => ({ id: p.id, name: p.title, kind: p.category === 'iot' ? 'hw' : 'web' })),
  { id: 'porta', name: 'Porta Hnos', kind: 'job' },
]

// Hovering a tool draws ratsnest airwires to the places that used it, like an unrouted board
export function Shop() {
  const { lang } = useLang()
  const T = copy[lang].shop
  const [pick, setPick] = useState(null) // { tool, used }
  const [wires, setWires] = useState([])
  const section = useRef(null), places = useRef({})

  const choose = (tool, used, btn) => {
    setPick({ tool, used })
    if (matchMedia('(max-width: 900px)').matches) return setWires([])
    const s = section.current.getBoundingClientRect(), a = btn.getBoundingClientRect()
    const x1 = a.right - s.left, y1 = a.top + a.height / 2 - s.top
    setWires(used.map((id) => {
      const r = places.current[id].getBoundingClientRect(), x2 = r.left - s.left + 17, y2 = r.top + r.height / 2 - s.top
      return { id: tool + id, x1, y1, x2, y2, len: Math.hypot(x2 - x1, y2 - y1) }
    }))
  }

  return (
    <section className="shop" id="taller" ref={section}>
      <svg className="rats" aria-hidden="true">
        {wires.map((w) => <line key={w.id} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} style={{ '--len': w.len }} />)}
      </svg>
      <h2>{T.title}</h2>
      <p className="sec-intro">{T.intro}</p>
      <div className="shop-grid">
        <div>
          {skillGroups.filter((g) => g.id !== 'other').map((g) => (
            <div key={g.id} className="bin">
              <h3>{l(g.label, lang)}<small>{g.sub}</small></h3>
              <div className="tools">
                {g.items.map((tool) => {
                  const used = g.usedIn[tool] ?? []
                  const go = (e) => choose(tool, used, e.currentTarget)
                  return (
                    <button key={tool} className={`tool${used.length ? '' : ' idle'}`} aria-pressed={pick?.tool === tool}
                      onPointerEnter={go} onFocus={go} onClick={go}>
                      {tool === '3D Modeling' && lang === 'es' ? 'Modelado 3D' : tool}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <aside className="evidence" aria-label={T.where}>
          <p className="ev-label" aria-live="polite">
            {!pick ? T.pick : pick.used.length ? T.count(pick.tool, pick.used.length) : T.none(pick.tool)}
          </p>
          <ul className="ev-list">
            {PLACES.map((p) => (
              <li key={p.id} ref={(el) => { places.current[p.id] = el }} className={pick?.used.includes(p.id) ? 'on' : undefined}>
                {p.name}<small>{T.kind[p.kind]}</small>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
