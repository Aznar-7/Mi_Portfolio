import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { copy } from '@/i18n/site'
import { projects } from '@/data/projects'
import { l } from '@/lib/utils'
import { GitHubIcon } from '@/components/common/SocialIcons'
import { ToolIcon } from './ToolIcon'

const layerOf = (p) => (p.category === 'iot' ? 'b' : 'f')
const statusOf = (p) => (p.liveUrl ? (p.featured ? 'prod' : 'live') : p.status === 'completed' ? 'done' : 'dev')
const linksOf = (p, T) => [
  p.liveUrl && { label: T.live, url: p.liveUrl, live: true },
  ...(Array.isArray(p.githubUrl) ? p.githubUrl : p.githubUrl ? [{ label: T.code, url: p.githubUrl }] : []),
].filter(Boolean)

function Links({ links }) {
  return (
    <p className="links">
      {links.map((k) => (
        <a key={k.url} href={k.url} target="_blank" rel="noopener noreferrer">
          {k.live ? <ArrowUpRight size={15} aria-hidden="true" /> : <GitHubIcon size={14} />}{k.label}
        </a>
      ))}
    </p>
  )
}

function Stack({ tech }) {
  return <ul className="chips">{tech.map((t) => <li key={t}><ToolIcon name={t} />{t}</li>)}</ul>
}

// UTN Hub: a request walks Browser → Nginx → API → PostgreSQL; hovering a node takes over from it
function Flow({ project, lang, label }) {
  const { playHover } = useSoundEffects()
  const nodes = project.flow
  const [active, setActive] = useState(0)
  const pinned = useRef(false), board = useRef(null), path = useRef(null), dot = useRef(null)

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let xs = [], seen = false, t = 0, raf = 0
    const layout = () => {
      const b = path.current.ownerSVGElement.getBoundingClientRect()
      xs = [...board.current.querySelectorAll('.node')].map((n) => { const r = n.getBoundingClientRect(); return r.left - b.left + r.width / 2 })
      path.current.setAttribute('d', xs.map((x) => `M${x} 0 V16`).join(' ') + ` M${xs[0]} 16 H${xs.at(-1)}`)
    }
    const tick = () => {
      if (seen && !pinned.current) {
        t = (t + 0.004) % 1.25
        const k = Math.min(1, t), x = xs[0] + (xs.at(-1) - xs[0]) * (1 - (1 - k) ** 2)
        dot.current.setAttribute('cx', x); dot.current.setAttribute('cy', 16)
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
        {shared && <span className="host">{shared}</span>}
        {nodes.map((n, i) => (
          <button key={n.id} className={`node${n.host === shared ? ' hosted' : ''}`} aria-pressed={active === i}
            onClick={() => pick(i)} onPointerEnter={() => { playHover(); pick(i) }}>
            <b>{l(n.name, lang)}</b><small>{n.host === shared ? n.tech : `${n.tech.split(',')[0]} · ${n.host}`}</small>
          </button>
        ))}
        <svg className="flow-trace" aria-hidden="true"><path ref={path} /><circle ref={dot} r="4" /></svg>
      </div>
      <p className="flow-detail" aria-live="polite">{l(nodes[active].detail, lang)}</p>
    </div>
  )
}

function Feature({ project, lang, T }) {
  const { playSelect } = useSoundEffects()
  const shots = [...new Set([project.image, ...project.gallery].filter(Boolean))]
  const [shot, setShot] = useState(0)
  const [fade, setFade] = useState(false)
  const show = (i) => { playSelect(); setFade(true); setTimeout(() => { setShot(i); setFade(false) }, 180) }
  return (
    <article className="feature" data-on={layerOf(project)}>
      <div className="feature-media">
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
        <p className="state"><i className="led live" />{T.status.prod}</p>
        <h3>{project.title}</h3>
        <p className="desc">{l(project.summary, lang)}</p>
        <Stack tech={project.tech} />
        <Links links={linksOf(project, T)} />
        <Flow project={project} lang={lang} label={T.flow} />
      </div>
    </article>
  )
}

export function Work() {
  const { lang } = useLang()
  const { playHover, playClick, playToggle } = useSoundEffects()
  const T = copy[lang].work
  const [layer, setLayer] = useState('all')
  const [open, setOpen] = useState(() => new Set())
  const spine = useRef(null), dot = useRef(null)
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
        const top = el.getBoundingClientRect().top - r.top + (el.classList.contains('net') ? 48 : 24)
        el.classList.toggle('lit', y + 28 >= top)
      }
    }
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(tick) } }
    addEventListener('scroll', onScroll, { passive: true })
    tick()
    return () => removeEventListener('scroll', onScroll)
  }, [])

  const toggle = (id) => { playClick(); setOpen((o) => { const n = new Set(o); n.has(id) ? n.delete(id) : n.add(id); return n }) }

  return (
    <section className="work" id="trabajo" data-layer={layer}>
      <svg className="bus" data-bus aria-hidden="true" />
      <h2>{T.title}</h2>
      <div className="work-intro">
        <p>{T.intro}</p>
        <div className="layers" role="group" aria-label={T.layers}>
          {[['all', T.all], ['f', T.web, 'F.Cu'], ['b', T.hw, 'B.Cu']].map(([id, label, silk]) => (
            <button key={id} aria-pressed={layer === id} onClick={() => { playToggle(); setLayer(id) }}>
              {silk && <i className={`sw ${id}`} />}{label}{silk && <small>{silk}</small>}
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
              <li key={p.id} className="net" data-on={layerOf(p)} onPointerEnter={playHover}>
                <button className="net-head" aria-expanded={isOpen} onClick={() => toggle(p.id)}>
                  <span className="net-thumb">
                    {p.image ? <img src={p.image} alt="" loading="lazy" /> : <ToolIcon name={p.tech.find((t) => t === 'ESP32') ?? p.tech[0]} size={26} />}
                  </span>
                  <span className="net-main">
                    <span className="net-title">{p.title}</span>
                    <span className="net-line">{l(p.tagline, lang)}</span>
                  </span>
                  <span className="net-icons" aria-hidden="true">{p.tech.slice(0, 5).map((t) => <ToolIcon key={t} name={t} size={16} />)}</span>
                  <span className="net-state"><i className={`led ${st === 'live' ? 'live' : 'done'}`} />{T.status[st]}</span>
                  <ChevronDown size={18} aria-hidden="true" className="chev" />
                </button>
                <div className="net-body"><div>
                  <p>{l(p.summary, lang)}</p>
                  <Stack tech={p.tech} />
                  {p.gallery.length > 0 ? (
                    <div className="strip">
                      {p.gallery.slice(0, 5).map((src, i) => <img key={src} src={src} alt={`${p.title}, ${i + 1}`} loading="lazy" />)}
                    </div>
                  ) : p.architecture && (
                    <dl className="stack">
                      {p.architecture.map((a) => <div key={l(a.layer, lang)}><dt>{l(a.layer, lang)}</dt><dd>{l(a.detail, lang)}</dd></div>)}
                    </dl>
                  )}
                  {links.length > 0 && <Links links={links} />}
                </div></div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
