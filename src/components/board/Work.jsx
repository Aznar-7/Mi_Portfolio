import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { ArrowUpRight, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { copy } from '@/i18n/site'
import { projects } from '@/data/projects'
import { l } from '@/lib/utils'
import { GitHubIcon } from '@/components/common/SocialIcons'
import { ToolIcon } from './ToolIcon'
import { PowerTitle } from './PowerTitle'
import { travel } from '@/lib/motion'

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
  // pinned: a click or focus parks the signal; held: the pointer rests on a node and lets go on leave
  const pinned = useRef(false), held = useRef(false), resume = useRef(-1), board = useRef(null), path = useRef(null), dot = useRef(null)

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let xs = [], raf = 0, from = 0, step = -1, t0 = 0
    const layout = () => {
      const b = path.current.ownerSVGElement.getBoundingClientRect()
      xs = [...board.current.querySelectorAll('.node')].map((n) => { const r = n.getBoundingClientRect(); return r.left - b.left + r.width / 2 })
      path.current.setAttribute('d', xs.map((x) => `M${x} 0 V16`).join(' ') + ` M${xs[0]} 16 H${xs.at(-1)}`)
    }
    // the request stops at each hop long enough to read it: 0.6 s gliding, then 2.4 s parked.
    // Time-based, so it runs at the same pace on a 60 Hz or a 144 Hz screen.
    const HOP = 3000, GLIDE = 600
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      // only while on screen (a rect read per frame is cheaper and steadier than an observer here)
      const r = board.current?.getBoundingClientRect()
      const seen = r && r.bottom > 0 && r.top < innerHeight
      if (!seen || pinned.current || held.current || !xs.length) { t0 = 0; return }
      // after a hover the signal carries on from the node it was parked on
      if (!t0) { t0 = now - Math.max(0, resume.current) * HOP - GLIDE; if (resume.current >= 0) { step = resume.current; from = xs[step] } resume.current = -1 }
      const e = now - t0, i = Math.floor(e / HOP) % xs.length, k = Math.min(1, (e % HOP) / GLIDE)
      if (i !== step) { from = step < 0 ? xs[0] : xs[step]; step = i; setActive(i) }
      const ease = 1 - (1 - k) ** 3, x = i === 0 && from === xs.at(-1) ? xs[0] : from + (xs[i] - from) * ease
      dot.current.setAttribute('cx', x); dot.current.setAttribute('cy', 16)
      dot.current.style.opacity = i === 0 && k < 1 && from !== xs[0] ? k : 1 // back to the start: fade in, no backwards slide
    }
    layout()
    // the board changes width with the inspector, not only the window
    const ro = new ResizeObserver(layout); ro.observe(board.current)
    if (!reduced) raf = requestAnimationFrame(tick)
    else if (dot.current) dot.current.style.opacity = 0
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  // pinning parks the signal on that node, so the dot and the highlighted node always agree
  const pick = (i, hover = false) => {
    if (hover) held.current = true; else pinned.current = true
    resume.current = i; setActive(i)
    const n = board.current?.querySelectorAll('.node')[i], b = path.current?.ownerSVGElement.getBoundingClientRect()
    if (n && b && dot.current) { const r = n.getBoundingClientRect(); dot.current.setAttribute('cx', r.left - b.left + r.width / 2); dot.current.style.opacity = 1 }
  }
  const shared = nodes[1]?.host
  return (
    <div className="flow">
      <p className="flow-label">{label}</p>
      <div className="flow-board" ref={board} onPointerLeave={() => { held.current = false }}>
        {shared && <span className="host">{shared}</span>}
        {nodes.map((n, i) => (
          <button key={n.id} className={`node${n.host === shared ? ' hosted' : ''}`} aria-pressed={active === i}
            onClick={() => pick(i)} onFocus={() => pick(i)} aria-describedby="flow-detail" onPointerEnter={() => { playHover(); pick(i, true) }}>
            <b>{l(n.name, lang)}</b><small>{n.host === shared ? n.tech : `${n.tech.split(',')[0]} · ${n.host}`}</small>
          </button>
        ))}
        <svg className="flow-trace" aria-hidden="true"><path ref={path} /><circle ref={dot} r="4" /></svg>
      </div>
      <p className="flow-detail" id="flow-detail">{l(nodes[active].detail, lang)}</p>
    </div>
  )
}

// Every project in one list you can read at a glance; the inspector beside it shows the selected
// one in full. Arrow keys walk the list, the filter narrows it, links are always visible.
export function Work() {
  const { lang } = useLang()
  const { playToggle, playSelect } = useSoundEffects()
  const T = copy[lang].work
  const [layer, setLayer] = useState('all')
  const [selId, setSelId] = useState(projects.find((p) => p.featured)?.id ?? projects[0].id)
  const list = projects.filter((p) => layer === 'all' || layerOf(p) === layer)
  const sel = list.find((p) => p.id === selId) ?? list[0]
  const count = { all: projects.length, f: projects.filter((p) => layerOf(p) === 'f').length, b: projects.filter((p) => layerOf(p) === 'b').length }
  const listRef = useRef(null), benchRef = useRef(null), inspRef = useRef(null)
  const [hover, setHover] = useState(null)
  // the wiring between the list and the datasheet: one trace per row, measured from the layout
  const [wires, setWires] = useState({ x1: 0, x2: 0, rows: [] })
  useLayoutEffect(() => {
    const measure = () => {
      const b = benchRef.current?.getBoundingClientRect(), ins = inspRef.current?.getBoundingClientRect()
      if (!b || !ins) return
      const rows = [...listRef.current.querySelectorAll('button[data-id]')].map((el) => {
        const r = el.getBoundingClientRect()
        return { id: el.dataset.id, y: r.top - b.top + r.height / 2, x: r.right - b.left }
      })
      setWires({ x1: Math.max(...rows.map((w) => w.x), 0), x2: ins.left - b.left, rows })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(benchRef.current)
    return () => ro.disconnect()
  }, [layer, sel.id, lang])

  const choose = (id) => { if (id !== sel.id) { playSelect(); setSelId(id) } }
  const onKey = (e) => {
    const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    if (!dir) return
    e.preventDefault()
    const i = list.findIndex((p) => p.id === sel.id), next = list[(i + dir + list.length) % list.length]
    choose(next.id)
    listRef.current?.querySelector(`[data-id="${next.id}"]`)?.focus()
  }

  // other parts of the page (the Middle-earth map, the galaxy) can select a project and bring it into view
  useEffect(() => {
    const go = (e) => {
      setLayer('all'); setSelId(e.detail)
      requestAnimationFrame(() => travel(document.getElementById('trabajo'), 70))
    }
    document.addEventListener('board:open-project', go)
    return () => document.removeEventListener('board:open-project', go)
  }, [])

  return (
    <section className="work" id="trabajo">
      <svg className="bus" data-bus aria-hidden="true" />
      <PowerTitle text={T.title} />
      <div className="work-intro">
        <p>{T.intro}</p>
        <div className="layers" role="group" aria-label={T.layers}>
          {[['all', T.all], ['f', T.web, 'F.Cu'], ['b', T.hw, 'B.Cu']].map(([id, label, silk]) => (
            <button key={id} aria-pressed={layer === id} onClick={() => { playToggle(); setLayer(id) }}>
              {silk && <i className={`sw ${id}`} />}{label}<span className="n">{count[id]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bench" ref={benchRef}>
        <ol className="netlist" ref={listRef} onKeyDown={onKey} aria-label={T.title}>
          {list.map((p) => {
            const st = statusOf(p), ref = `U${projects.indexOf(p) + 1}`
            return (
              <li key={p.id}>
                <button type="button" data-id={p.id} id={`p-${p.id}`} className={p.id === sel.id ? 'on' : ''} aria-current={p.id === sel.id ? 'true' : undefined}
                  onClick={() => choose(p.id)} tabIndex={p.id === sel.id ? 0 : -1} aria-controls="inspector"
                  onPointerEnter={() => setHover(p.id)} onPointerLeave={() => setHover(null)}>
                  <span className="nl-ref" aria-hidden="true">{ref}</span>
                  <span className="nl-thumb">{p.image ? <img src={p.image} alt="" loading="lazy" /> : <ToolIcon name={p.tech[0]} size={20} />}</span>
                  <span className="nl-main">
                    <span className="nl-title">{p.title}</span>
                    <span className="nl-line">{l(p.tagline, lang)}</span>
                  </span>
                  <span className={`nl-led ${st}`} /><span className="sr-only">{T.status[st]}</span>
                </button>
              </li>
            )
          })}
        </ol>
        {/* each row is wired to a pin on the datasheet; the selected net carries signal */}
        <svg className="bench-wires" aria-hidden="true">
          {wires.rows.map((w) => {
            const on = w.id === sel.id, near = w.id === hover && !on
            const mid = wires.x1 + (wires.x2 - wires.x1) * 0.5
            return (
              <g key={w.id} className={on ? 'on' : near ? 'near' : ''}>
                <path d={`M${w.x} ${w.y} H${wires.x2}`} className="wire" />
                {on && <path d={`M${w.x} ${w.y} H${wires.x2}`} className="signal" />}
                <circle cx={w.x + 1} cy={w.y} r="3.5" className="pad" />
                <rect x={wires.x2 - 4} y={w.y - 5} width="8" height="10" rx="1.5" className="pin" />
                {on && <circle cx={mid} cy={w.y} r="2" className="via" />}
              </g>
            )
          })}
        </svg>
        <div className="ins-slot" ref={inspRef}><Inspector key={sel.id} project={sel} lang={lang} T={T} /></div>
      </div>
    </section>
  )
}

// opening and closing the big view morphs the image when the browser can (View Transitions)
const morph = (fn) => {
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return fn()
  // a skipped transition (hidden tab, another one running) still applies the update; only the morph is lost
  document.startViewTransition(() => flushSync(fn)).ready.catch(() => {})
}

// a mostly horizontal drag of 40px+ turns the page; `swiped` tells the click that follows to stand down
function useSwipe(onSwipe) {
  const start = useRef(null), swiped = useRef(false)
  return {
    swiped,
    handlers: {
      // a second finger means pinch-zoom, never a page turn
      onPointerDown: (e) => { if (!e.isPrimary) { start.current = null; return } start.current = [e.clientX, e.clientY]; swiped.current = false },
      onPointerUp: (e) => {
        if (!start.current || !e.isPrimary) return
        const dx = e.clientX - start.current[0], dy = e.clientY - start.current[1]
        start.current = null
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped.current = true; onSwipe(dx < 0 ? 1 : -1) }
      },
      onPointerCancel: () => { start.current = null },
    },
  }
}

function Inspector({ project, lang, T }) {
  const { playSelect } = useSoundEffects()
  const shots = [...new Set([project.image, ...(project.gallery ?? [])].filter(Boolean))]
  const [shot, setShot] = useState(0)
  const [dir, setDir] = useState(0) // the side the next image slides in from
  const [big, setBig] = useState(false)
  const st = statusOf(project), links = linksOf(project, T)
  const show = (i, d = i > shot ? 1 : -1) => { playSelect(); setDir(d); setShot((i + shots.length) % shots.length) }
  const step = (d) => show(shot + d, d)
  const swipe = useSwipe(step)
  const alt = `${project.title}: ${l(project.tagline, lang)}`

  // the neighbours load ahead, so stepping through never shows an empty frame
  useEffect(() => {
    for (const d of [1, -1]) { const src = shots[(shot + d + shots.length) % shots.length]; if (src) new Image().src = src }
  }, [shot]) // eslint-disable-line react-hooks/exhaustive-deps -- shots derive from the project, which keys this component
  // a datasheet: name, state and links on top; what it is and its stack beside a moderate image
  return (
    <article className={`inspector ${layerOf(project)}`} id="inspector">
      <span className="ins-corner tl" aria-hidden="true" /><span className="ins-corner tr" aria-hidden="true" />
      <span className="ins-corner bl" aria-hidden="true" /><span className="ins-corner br" aria-hidden="true" />
      <header className="ins-head">
        <div>
          <h3>{project.title}</h3>
          <p className="ins-tag">{l(project.tagline, lang)}</p>
        </div>
        <span className="inline-state"><i className={`led ${st === 'done' || st === 'dev' ? 'done' : 'live'}`} />{T.status[st]}</span>
        {links.length > 0 && <Links links={links} />}
      </header>
      <div className="ins-grid">
        <div className="ins-text">
          <p className="desc">{l(project.summary, lang)}</p>
          <Stack tech={project.tech} />
          {!project.flow && project.architecture && (
            <dl className="stack">
              {project.architecture.map((a) => <div key={l(a.layer, lang)}><dt>{l(a.layer, lang)}</dt><dd>{l(a.detail, lang)}</dd></div>)}
            </dl>
          )}
        </div>
        {shots.length > 0 && (
          <figure className="ins-media" onKeyDown={(e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }}>
            <div className="ins-shot" {...(shots.length > 1 ? swipe.handlers : {})}>
              <button type="button" className="shot-open" aria-label={T.enlarge} onClick={() => { if (!swipe.swiped.current) morph(() => setBig(true)) }}>
                <img key={shots[shot]} src={shots[shot]} alt={alt} draggable="false" style={{ '--dir': dir, viewTransitionName: big ? 'none' : 'shot' }} />
                <span className="shot-zoom" aria-hidden="true"><Maximize2 size={14} /></span>
              </button>
              {shots.length > 1 && (
                <div className="shot-ctrl">
                  <button type="button" onClick={() => step(-1)} aria-label={T.prevShot}><ChevronLeft size={16} aria-hidden="true" /></button>
                  <span aria-live="polite">{shot + 1} / {shots.length}</span>
                  <button type="button" onClick={() => step(1)} aria-label={T.nextShot}><ChevronRight size={16} aria-hidden="true" /></button>
                </div>
              )}
            </div>
            {shots.length > 1 && (
              <div className="ins-thumbs" role="group" aria-label={T.screens(project.title)}>
                {shots.slice(0, 8).map((src, i) => (
                  <button key={src} type="button" aria-pressed={shot === i} aria-label={T.screen(i + 1, shots.length)} onClick={() => show(i)}><img src={src} alt="" loading="lazy" /></button>
                ))}
              </div>
            )}
          </figure>
        )}
      </div>
      {project.flow && <div className="ins-flow"><Flow project={project} lang={lang} label={T.flow} /></div>}
      {big && <Lightbox label={T.screens(project.title)} src={shots[shot]} alt={alt} n={shot + 1} total={shots.length} dir={dir} T={T} step={shots.length > 1 ? step : null} onClose={() => morph(() => setBig(false))} />}
    </article>
  )
}

// The big view: a native modal dialog (focus trap, Esc, top layer) with the same controls and swipe
function Lightbox({ label, src, alt, n, total, dir, T, step, onClose }) {
  const ref = useRef(null)
  const swipe = useSwipe((d) => step?.(d))
  useLayoutEffect(() => {
    const d = ref.current
    d.showModal()
    return () => d.close()
  }, [])
  return (
    <dialog ref={ref} className="lightbox" aria-label={label} {...swipe.handlers}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current && !swipe.swiped.current) onClose() }}
      onKeyDown={(e) => { if (step && e.key === 'ArrowRight') step(1); if (step && e.key === 'ArrowLeft') step(-1) }}>
      <img key={src} src={src} alt={alt} draggable="false" style={{ '--dir': dir, viewTransitionName: 'shot' }} />
      <div className="lb-bar">
        {step && <button type="button" onClick={() => step(-1)} aria-label={T.prevShot}><ChevronLeft size={18} aria-hidden="true" /></button>}
        {total > 1 && <span aria-live="polite">{n} / {total}</span>}
        {step && <button type="button" onClick={() => step(1)} aria-label={T.nextShot}><ChevronRight size={18} aria-hidden="true" /></button>}
        <button type="button" onClick={onClose} aria-label={T.closeShot} autoFocus><X size={18} aria-hidden="true" /></button>
      </div>
    </dialog>
  )
}
