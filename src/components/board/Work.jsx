import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { projects } from '@/data/projects'
import { l } from '@/lib/utils'

const layerOf = (p) => (p.category === 'iot' ? 'b' : 'f')
const statusOf = (p) => (p.liveUrl ? (p.featured ? 'prod' : 'live') : p.status === 'completed' ? 'done' : 'dev')
const hide = (p) => p && { ...p, on: false }
const linksOf = (p, T) => [
  p.liveUrl && { label: T.live, url: p.liveUrl },
  ...(Array.isArray(p.githubUrl) ? p.githubUrl : p.githubUrl ? [{ label: T.code, url: p.githubUrl }] : []),
].filter(Boolean)
const Ext = ({ url, children }) => <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>

// UTN Hub: a request walks Browser → Nginx → API → PostgreSQL; hovering a node takes over from it
function Flow({ project, lang, label }) {
  const nodes = project.flow
  const [active, setActive] = useState(0)
  const pinned = useRef(false), board = useRef(null), path = useRef(null), dot = useRef(null)

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let xs = [], seen = false, t = 0, raf = 0
    const layout = () => {
      const b = path.current.ownerSVGElement.getBoundingClientRect()
      xs = [...board.current.querySelectorAll('.node')].map((n) => { const r = n.getBoundingClientRect(); return r.left - b.left + r.width / 2 })
      path.current.setAttribute('d', xs.map((x) => `M${x} 58 V74`).join(' ') + ` M${xs[0]} 74 H${xs.at(-1)}`)
    }
    const tick = () => {
      if (seen && !pinned.current) {
        t = (t + 0.004) % 1.25
        const k = Math.min(1, t), x = xs[0] + (xs.at(-1) - xs[0]) * (1 - (1 - k) ** 2)
        dot.current.setAttribute('cx', x); dot.current.setAttribute('cy', 74)
        dot.current.style.opacity = t > 1 ? Math.max(0, 1 - (t - 1) * 4) : 1
        setActive(Math.max(0, xs.findLastIndex((v) => v <= x + 2)))
      }
      raf = requestAnimationFrame(tick)
    }
    layout()
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting })
    io.observe(board.current)
    addEventListener('resize', layout)
    if (!reduced) raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', layout) }
  }, [])

  const pick = (i) => { pinned.current = true; setActive(i) }
  const shared = nodes[1]?.host
  return (
    <div className="flow">
      <p className="flow-label">{label}</p>
      <div className="flow-board" ref={board}>
        <svg className="flow-trace" aria-hidden="true"><path ref={path} /><circle ref={dot} r="4" /></svg>
        {shared && <div className="host">{shared}</div>}
        {nodes.map((n, i) => (
          <button key={n.id} className="node" aria-pressed={active === i} onClick={() => pick(i)} onPointerEnter={() => pick(i)}>
            <b>{l(n.name, lang)}</b><small>{n.host === shared ? n.tech : `${n.tech.split(',')[0]} · ${n.host}`}</small>
          </button>
        ))}
      </div>
      <p className="flow-detail" aria-live="polite">{l(nodes[active].detail, lang)}</p>
    </div>
  )
}

function Feature({ project, lang, T }) {
  const shots = [...new Set([project.image, ...project.gallery].filter(Boolean))]
  const [shot, setShot] = useState(0)
  const [fade, setFade] = useState(false)
  const show = (i) => { setFade(true); setTimeout(() => { setShot(i); setFade(false) }, 180) }
  return (
    <article className="feature" data-on={layerOf(project)}>
      <div>
        <a className="shot" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
          <img src={shots[shot]} alt={`${project.title}: ${l(project.tagline, lang)}`} style={{ opacity: fade ? 0 : 1 }} loading="lazy" />
        </a>
        <div className="thumbs" role="group" aria-label={T.screens}>
          {shots.map((src, i) => (
            <button key={src} aria-pressed={shot === i} aria-label={T.screen(i + 1, shots.length)} onClick={() => show(i)}>
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="state"><i className="led live" />{T.status.prod} · <Ext url={project.liveUrl}>{project.liveUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</Ext></p>
        <h3>{project.title}</h3>
        <p className="desc">{l(project.summary, lang)}</p>
        <Flow project={project} lang={lang} label={T.flow} />
      </div>
    </article>
  )
}

export function Work() {
  const { lang } = useLang()
  const T = copy[lang].work
  const [layer, setLayer] = useState('all')
  const [open, setOpen] = useState(() => new Set())
  const [peek, setPeek] = useState(null) // { src, y, on }: keeps the last photo so it can close smoothly
  const spine = useRef(null), dot = useRef(null), section = useRef(null)
  const featured = projects.find((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)

  // a pulse rides the spine with the scroll and lights each branch it reaches
  useEffect(() => {
    let queued = false
    const tick = () => {
      queued = false
      const s = spine.current, r = s.getBoundingClientRect(), y = Math.max(0, Math.min(r.height - 70, innerHeight * .55 - r.top))
      dot.current.style.setProperty('--y', y + 'px')
      for (const el of s.querySelectorAll(':scope > .feature, .net')) {
        const top = el.getBoundingClientRect().top - r.top + (el.classList.contains('net') ? 42 : 24)
        el.classList.toggle('lit', y + 28 >= top)
      }
    }
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(tick) } }
    addEventListener('scroll', onScroll, { passive: true })
    tick()
    return () => removeEventListener('scroll', onScroll)
  }, [])

  const toggle = (id) => setOpen((o) => { const n = new Set(o); n.has(id) ? n.delete(id) : n.add(id); setPeek(hide); return n })
  const hover = (p, e) => {
    if (!p.image || open.has(p.id)) return setPeek(hide)
    setPeek({ src: p.image, y: e.currentTarget.getBoundingClientRect().top - section.current.getBoundingClientRect().top - 70, on: true })
  }

  return (
    <section className="work" id="trabajo" data-layer={layer} ref={section}>
      <svg className="bus" data-bus aria-hidden="true" />
      <h2>{T.title}</h2>
      <div className="work-intro">
        <p>{T.intro}</p>
        <div className="layers" role="group" aria-label={T.layers}>
          {[['all', T.all], ['f', T.web], ['b', T.hw]].map(([id, label]) => (
            <button key={id} aria-pressed={layer === id} onClick={() => setLayer(id)}>
              {id !== 'all' && <i className={`sw ${id}`} />}{label}
            </button>
          ))}
        </div>
      </div>

      <div className="spine" ref={spine}>
        <span className="spine-dot" ref={dot} aria-hidden="true" />
        <Feature project={featured} lang={lang} T={T} />
        <ol className="nets">
          {rest.map((p) => {
            const st = statusOf(p), isOpen = open.has(p.id), links = linksOf(p, T)
            return (
              <li key={p.id} className="net" data-on={layerOf(p)} onPointerEnter={(e) => hover(p, e)} onPointerLeave={() => setPeek(hide)}>
                <button className="net-head" aria-expanded={isOpen} onClick={() => toggle(p.id)}>
                  <span className="net-title">{p.title}</span>
                  <span className="net-tag">{p.tech.slice(0, 4).join(' · ')}</span>
                  <span className="net-state"><i className={`led ${st === 'live' ? 'live' : 'done'}`} />{T.status[st]}</span>
                </button>
                <div className="net-body"><div>
                  <p>{l(p.summary, lang)}</p>
                  {p.gallery.length > 0 ? (
                    <div className="strip">
                      {p.gallery.slice(0, 4).map((src, i) => <img key={src} src={src} alt={`${p.title}, ${i + 1}`} loading="lazy" />)}
                    </div>
                  ) : p.architecture && (
                    <dl className="stack">
                      {p.architecture.map((a) => <div key={l(a.layer, lang)}><dt>{l(a.layer, lang)}</dt><dd>{l(a.detail, lang)}</dd></div>)}
                    </dl>
                  )}
                  {links.length > 0 && <p className="links">{links.map((k) => <Ext key={k.url} url={k.url}>{k.label}</Ext>)}</p>}
                </div></div>
              </li>
            )
          })}
        </ol>
      </div>
      <figure className={`peek${peek?.on ? ' on' : ''}`} style={peek ? { translate: `0 ${peek.y}px` } : undefined} aria-hidden="true">
        {peek && <img src={peek.src} alt="" />}
      </figure>
    </section>
  )
}
