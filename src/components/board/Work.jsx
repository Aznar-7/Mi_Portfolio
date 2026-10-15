import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const listRef = useRef(null)

  const choose = (id) => { if (id !== sel.id) { playSelect(); setSelId(id) } }
  const onKey = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const i = list.findIndex((p) => p.id === sel.id), next = list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]
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

      <div className="bench">
        <ol className="netlist" ref={listRef} onKeyDown={onKey} aria-label={T.title}>
          {list.map((p) => {
            const st = statusOf(p)
            return (
              <li key={p.id}>
                <button type="button" data-id={p.id} id={`p-${p.id}`} className={p.id === sel.id ? 'on' : ''} aria-current={p.id === sel.id ? 'true' : undefined}
                  onClick={() => choose(p.id)} tabIndex={p.id === sel.id ? 0 : -1}>
                  <span className="nl-thumb">{p.image ? <img src={p.image} alt="" loading="lazy" /> : <ToolIcon name={p.tech[0]} size={20} />}</span>
                  <span className="nl-main">
                    <span className="nl-title">{p.title}</span>
                    <span className="nl-line">{l(p.tagline, lang)}</span>
                  </span>
                  <span className={`nl-led ${st}`} title={T.status[st]} />
                </button>
              </li>
            )
          })}
        </ol>
        <Inspector key={sel.id} project={sel} lang={lang} T={T} />
      </div>
    </section>
  )
}

function Inspector({ project, lang, T }) {
  const { playSelect } = useSoundEffects()
  const shots = [...new Set([project.image, ...(project.gallery ?? [])].filter(Boolean))]
  const [shot, setShot] = useState(0)
  const st = statusOf(project), links = linksOf(project, T)
  const show = (i) => { playSelect(); setShot((i + shots.length) % shots.length) }
  // a datasheet: name, state and links on top; what it is and its stack beside a moderate image
  return (
    <article className={`inspector ${layerOf(project)}`} aria-live="polite">
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
          <figure className="ins-media" onKeyDown={(e) => { if (e.key === 'ArrowRight') show(shot + 1); if (e.key === 'ArrowLeft') show(shot - 1) }}>
            <div className="ins-shot">
              <img key={shots[shot]} src={shots[shot]} alt={`${project.title}: ${l(project.tagline, lang)}`} />
              {shots.length > 1 && (
                <div className="shot-ctrl">
                  <button type="button" onClick={() => show(shot - 1)} aria-label={T.prevShot}><ChevronLeft size={16} aria-hidden="true" /></button>
                  <span>{shot + 1} / {shots.length}</span>
                  <button type="button" onClick={() => show(shot + 1)} aria-label={T.nextShot}><ChevronRight size={16} aria-hidden="true" /></button>
                </div>
              )}
            </div>
            {shots.length > 1 && (
              <div className="ins-thumbs" role="group" aria-label={T.screens}>
                {shots.slice(0, 6).map((src, i) => (
                  <button key={src} type="button" aria-pressed={shot === i} aria-label={T.screen(i + 1, shots.length)} onClick={() => show(i)}><img src={src} alt="" loading="lazy" /></button>
                ))}
              </div>
            )}
          </figure>
        )}
      </div>
      {project.flow && <div className="ins-flow"><Flow project={project} lang={lang} label={T.flow} /></div>}
    </article>
  )
}
