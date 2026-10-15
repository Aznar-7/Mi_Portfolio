import { useEffect, useRef, useState } from 'react'
import { projects } from '@/data/projects'
import { experience, academic } from '@/data/experience'
import { skillGroups } from '@/data/skills'
import { about } from '@/data/about'
import { site } from '@/data/site'
import { l } from '@/lib/utils'
import '@/styles/win95.css'

const TEXT = {
  es: {
    role: 'Desarrollador full stack e IoT',
    start: 'Inicio', pc: 'Mi PC', projects: 'Proyectos', career: 'Trayectoria', stack: 'Stack',
    contact: 'Contacto', readme: 'LEEME.txt', trash: 'Papelera', back: 'Volver al futuro',
    shutdown: 'Apagar el equipo...', min: 'Minimizar', max: 'Maximizar', restore: 'Restaurar',
    close: 'Cerrar', about: 'Acerca de mí', facts: 'Datos', work: 'Trabajo', education: 'Formación',
    items: (n) => `${n} objeto(s)`, name: 'Nombre', type: 'Tipo', statusCol: 'Estado', summary: 'Resumen',
    tech: 'Tecnologías', live: 'Abrir sitio', code: 'Ver código', mail: 'Escribir un correo',
    cvEs: 'CV en español', cvEn: 'CV en inglés', links: 'Enlaces', resumes: 'Currículum',
    contactIntro: 'Escribime por mail o por LinkedIn. El CV está en español y en inglés.',
    trashEmpty: 'La papelera está vacía. Los bugs viejos ya los arreglé; los nuevos todavía no aparecieron.',
    booting: 'Iniciando Portfolio 95...', desktop: 'Escritorio', taskbar: 'Barra de tareas',
    volume: 'Volumen', menu: ['Archivo', 'Edición', 'Buscar', 'Ayuda'], open: 'Abrir',
    hint: 'Doble clic para abrir',
    status: { 'in-development': 'En desarrollo', completed: 'Terminado' },
    readmeBody: `Hola, soy Vicente.

Este es mi portfolio como se habría visto en 1995. Los proyectos, los trabajos y el stack son los mismos que en la versión de hoy.

Hacé doble clic en un ícono del escritorio para abrirlo. Si estás apurado, en Contacto tenés mi mail y el CV para descargar.

Para volver al presente, abrí Inicio y elegí "Volver al futuro".

Gracias por pasar.`,
  },
  en: {
    role: 'Full stack and IoT developer',
    start: 'Start', pc: 'My Computer', projects: 'Projects', career: 'Career', stack: 'Stack',
    contact: 'Contact', readme: 'README.txt', trash: 'Recycle Bin', back: 'Back to the future',
    shutdown: 'Shut down...', min: 'Minimize', max: 'Maximize', restore: 'Restore',
    close: 'Close', about: 'About me', facts: 'Facts', work: 'Work', education: 'Education',
    items: (n) => `${n} object(s)`, name: 'Name', type: 'Type', statusCol: 'Status', summary: 'Summary',
    tech: 'Technologies', live: 'Open site', code: 'View code', mail: 'Send an email',
    cvEs: 'CV in Spanish', cvEn: 'CV in English', links: 'Links', resumes: 'Résumé',
    contactIntro: 'Reach me by email or on LinkedIn. The CV comes in Spanish and English.',
    trashEmpty: 'The recycle bin is empty. I fixed the old bugs; the new ones have not shown up yet.',
    booting: 'Starting Portfolio 95...', desktop: 'Desktop', taskbar: 'Taskbar',
    volume: 'Volume', menu: ['File', 'Edit', 'Search', 'Help'], open: 'Open',
    hint: 'Double-click to open',
    status: { 'in-development': 'In development', completed: 'Completed' },
    readmeBody: `Hi, I'm Vicente.

This is my portfolio the way it might have looked in 1995. The projects, jobs and stack are the same as on today's site.

Double-click a desktop icon to open it. If you're in a hurry, Contact has my email and CV.

To get back to the present, open Start and pick "Back to the future".

Thanks for stopping by.`,
  },
}

const CATEGORY = { 'full-stack': 'Full stack', iot: 'IoT', frontend: 'Frontend' }
const TASKBAR = 40
const WIDTH = { pc: 500, projects: 540, career: 580, stack: 520, contact: 400, readme: 480, trash: 360 }
const DESKTOP = ['pc', 'projects', 'career', 'stack', 'contact', 'readme', 'trash']
const mobile = () => window.matchMedia('(max-width: 639px)').matches

// ---------- pixel icons (16x16 grid, drawn at any size) ----------

function Svg({ size = 32, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      {children}
    </svg>
  )
}

const ICONS = {
  pc: (
    <>
      <rect x="1" y="1" width="13" height="10" fill="#c0c0c0" />
      <rect x="1" y="1" width="13" height="1" fill="#fff" /><rect x="1" y="1" width="1" height="10" fill="#fff" />
      <rect x="2" y="10" width="12" height="1" fill="#808080" /><rect x="13" y="2" width="1" height="9" fill="#808080" />
      <rect x="14" y="1" width="1" height="11" fill="#000" /><rect x="1" y="11" width="14" height="1" fill="#000" />
      <rect x="3" y="3" width="9" height="6" fill="#000" /><rect x="4" y="4" width="7" height="4" fill="#000080" />
      <rect x="5" y="5" width="2" height="1" fill="#00ffff" /><rect x="11" y="9" width="1" height="1" fill="#00c000" />
      <rect x="6" y="12" width="4" height="1" fill="#808080" />
      <rect x="2" y="13" width="12" height="2" fill="#c0c0c0" /><rect x="2" y="13" width="12" height="1" fill="#fff" />
      <rect x="2" y="15" width="13" height="1" fill="#000" /><rect x="14" y="13" width="1" height="3" fill="#000" />
    </>
  ),
  projects: (
    <>
      <rect x="1" y="2" width="6" height="2" fill="#808000" />
      <rect x="1" y="4" width="14" height="10" fill="#808000" />
      <rect x="1" y="6" width="14" height="8" fill="#ffff00" /><rect x="2" y="6" width="12" height="1" fill="#ffffc0" />
      <rect x="1" y="14" width="15" height="1" fill="#000" /><rect x="15" y="4" width="1" height="10" fill="#000" />
    </>
  ),
  career: (
    <>
      <rect x="5" y="2" width="6" height="1" fill="#000" /><rect x="5" y="2" width="1" height="3" fill="#000" />
      <rect x="10" y="2" width="1" height="3" fill="#000" />
      <rect x="1" y="5" width="14" height="9" fill="#a05000" /><rect x="1" y="5" width="14" height="1" fill="#d08030" />
      <rect x="1" y="9" width="14" height="1" fill="#603000" /><rect x="7" y="8" width="2" height="3" fill="#ffff00" />
      <rect x="1" y="14" width="15" height="1" fill="#000" /><rect x="15" y="5" width="1" height="10" fill="#000" />
    </>
  ),
  stack: (
    <>
      {[4, 6, 8, 10].map((p) => (
        <g key={p} fill="#c0c0c0">
          <rect x={p + 0.5} y="1" width="1" height="2" /><rect x={p + 0.5} y="13" width="1" height="2" />
          <rect x="1" y={p + 0.5} width="2" height="1" /><rect x="13" y={p + 0.5} width="2" height="1" />
        </g>
      ))}
      <rect x="3" y="3" width="10" height="10" fill="#202020" /><rect x="3" y="3" width="10" height="1" fill="#505050" />
      <rect x="5" y="5" width="2" height="2" fill="#808080" /><rect x="5" y="9" width="6" height="1" fill="#c0c0c0" />
      <rect x="5" y="11" width="4" height="1" fill="#00c000" />
    </>
  ),
  contact: (
    <>
      <rect x="1.5" y="3.5" width="13" height="9" fill="#fff" stroke="#000" />
      <path d="M1.5 3.5 8 9l6.5-5.5" fill="none" stroke="#000080" />
      <rect x="11" y="5" width="2" height="2" fill="#ff0000" />
      <rect x="2" y="13" width="14" height="1" fill="#808080" />
    </>
  ),
  readme: (
    <>
      <rect x="3.5" y="1.5" width="10" height="13" fill="#fff" stroke="#000" />
      <rect x="14" y="2" width="1" height="13" fill="#808080" />
      {[4, 6, 8, 10].map((x) => <rect key={x} x={x + 1} y="0" width="1" height="3" fill="#808080" />)}
      {[5, 7, 9, 11].map((y) => <rect key={y} x="5" y={y} width={y === 11 ? 4 : 7} height="1" fill="#000080" />)}
    </>
  ),
  trash: (
    <>
      <rect x="6" y="1" width="4" height="1" fill="#000" />
      <rect x="2.5" y="2.5" width="11" height="2" fill="#808080" stroke="#000" />
      <rect x="3.5" y="5.5" width="9" height="9" fill="#c0c0c0" stroke="#000" />
      <rect x="4" y="6" width="1" height="8" fill="#fff" />
      {[6, 8, 10].map((x) => <rect key={x} x={x} y="7" width="1" height="6" fill="#808080" />)}
    </>
  ),
  doc: (
    <>
      <path d="M3.5 1.5h6l3 3v10h-9z" fill="#fff" stroke="#000" />
      <path d="M9.5 1.5v3h3" fill="#c0c0c0" stroke="#000" />
      <rect x="5" y="7" width="6" height="4" fill="#008080" /><rect x="6" y="8" width="2" height="1" fill="#ffff00" />
      <rect x="5" y="12" width="5" height="1" fill="#808080" />
    </>
  ),
  logo: (
    <>
      <rect x="1" y="1" width="6" height="6" fill="#e00000" /><rect x="9" y="1" width="6" height="6" fill="#00a000" />
      <rect x="1" y="9" width="6" height="6" fill="#0040e0" /><rect x="9" y="9" width="6" height="6" fill="#f0c000" />
    </>
  ),
  back: (
    <>
      <rect x="1" y="7" width="14" height="2" fill="#808080" />
      <path d="M2 11h4l2-6 2 6h4" fill="none" stroke="#ff8000" strokeWidth="2" />
      <rect x="7" y="1" width="2" height="2" fill="#00c0ff" />
    </>
  ),
  power: (
    <>
      <rect x="2.5" y="3.5" width="11" height="9" fill="#c0c0c0" stroke="#000" />
      <rect x="4" y="5" width="8" height="5" fill="#000" /><rect x="7" y="13" width="2" height="2" fill="#808080" />
      <rect x="10" y="10" width="1" height="1" fill="#00c000" />
    </>
  ),
}

const Icon = ({ name, size }) => <Svg size={size}>{ICONS[name]}</Svg>

// ---------- window chrome ----------

function Win({ w, title, icon, active, t, onFocus, onClose, onMin, onMax, onMove, children }) {
  const ref = useRef(null)
  const drag = useRef(null)

  useEffect(() => { ref.current?.focus({ preventScroll: true }) }, [])

  function down(e) {
    if (e.button !== 0 || w.max || mobile() || e.target.closest('button')) return
    drag.current = { dx: e.clientX - w.x, dy: e.clientY - w.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function move(e) {
    if (!drag.current) return
    const maxX = window.innerWidth - ref.current.offsetWidth
    const maxY = window.innerHeight - TASKBAR - 22
    onMove(
      Math.max(0, Math.min(maxX, e.clientX - drag.current.dx)),
      Math.max(0, Math.min(maxY, e.clientY - drag.current.dy)),
    )
  }
  const up = () => { drag.current = null }

  return (
    <section
      ref={ref}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      className={`w95-win${w.max ? ' is-max' : ''}${active ? ' is-active' : ''}`}
      hidden={w.min}
      style={w.max ? { zIndex: w.z } : {
        zIndex: w.z, left: w.x, top: w.y, width: w.width,
        maxHeight: `calc(100dvh - ${TASKBAR + w.y + 8}px)`,
      }}
      onPointerDownCapture={onFocus}
    >
      <header
        className="w95-title"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onDoubleClick={(e) => { if (!e.target.closest('button')) onMax() }}
      >
        <Icon name={icon} size={16} />
        <span className="w95-title-text">{title}</span>
        <button type="button" className="w95-ctl" aria-label={t.min} onClick={onMin}>
          <svg width="8" height="7" viewBox="0 0 8 7" aria-hidden="true"><rect x="0" y="5" width="6" height="2" /></svg>
        </button>
        <button type="button" className="w95-ctl w95-ctl-max" aria-label={w.max ? t.restore : t.max} onClick={onMax}>
          {w.max ? (
            <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true" shapeRendering="crispEdges">
              <path d="M2.5 .5h6v5h-2M2 1h7" fill="none" stroke="#000" /><rect x=".5" y="3.5" width="6" height="5" fill="none" stroke="#000" /><rect x="0" y="3" width="7" height="2" />
            </svg>
          ) : (
            <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true" shapeRendering="crispEdges">
              <rect x=".5" y=".5" width="8" height="8" fill="none" stroke="#000" /><rect x="0" y="0" width="9" height="2" />
            </svg>
          )}
        </button>
        <button type="button" className="w95-ctl w95-ctl-close" aria-label={t.close} onClick={onClose}>
          <svg width="8" height="7" viewBox="0 0 8 7" aria-hidden="true"><path d="M0 0l8 7M8 0 0 7" stroke="#000" strokeWidth="1.6" /></svg>
        </button>
      </header>
      {children}
    </section>
  )
}

// ---------- window contents ----------

const Group = ({ label, children }) => (
  <fieldset className="w95-group"><legend>{label}</legend>{children}</fieldset>
)

function Links({ p, t }) {
  const repos = typeof p.githubUrl === 'string' ? [{ label: t.code, url: p.githubUrl }]
    : (p.githubUrl ?? []).map((r) => ({ label: `${t.code}: ${r.label}`, url: r.url }))
  if (!p.liveUrl && !repos.length) return null
  return (
    <div className="w95-actions">
      {p.liveUrl && <a className="w95-btn" href={p.liveUrl} target="_blank" rel="noreferrer">{t.live}</a>}
      {repos.map((r) => <a key={r.url} className="w95-btn" href={r.url} target="_blank" rel="noreferrer">{r.label}</a>)}
    </div>
  )
}

// single click selects, double click or Enter opens, a touch tap opens straight away
function useOpenable(onOpen) {
  const touch = useRef(false)
  return (key, select) => ({
    onPointerDown: (e) => { touch.current = e.pointerType === 'touch' },
    onClick: () => (touch.current ? onOpen(key) : select(key)),
    onDoubleClick: () => onOpen(key),
    onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); onOpen(key) } },
  })
}

function ProjectsFolder({ lang, t, onOpen }) {
  const [sel, setSel] = useState(null)
  const openable = useOpenable(onOpen)
  return (
    <>
      <div className="w95-body w95-body-flush">
        <div className="w95-list" role="list">
          <div className="w95-list-row w95-list-head" aria-hidden="true">
            <span>{t.name}</span><span>{t.type}</span><span>{t.statusCol}</span>
          </div>
          {projects.map((p) => (
            <div role="listitem" key={p.id}>
              <button
                type="button"
                className={`w95-list-row${sel === p.id ? ' is-sel' : ''}`}
                title={t.hint}
                {...openable(`p:${p.id}`, () => setSel(p.id))}
              >
                <span className="w95-list-name"><Icon name="doc" size={16} /><b>{p.title}</b><i>{l(p.tagline, lang)}</i></span>
                <span>{CATEGORY[p.category] ?? p.category}</span>
                <span>{t.status[p.status] ?? p.status}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <footer className="w95-statusbar"><span>{t.items(projects.length)}</span><span>{t.hint}</span></footer>
    </>
  )
}

function Content({ id, lang, t, onOpen }) {
  if (id === 'readme') {
    return (
      <>
        <nav className="w95-menubar" aria-hidden="true">{t.menu.map((m) => <span key={m}><u>{m[0]}</u>{m.slice(1)}</span>)}</nav>
        <div className="w95-body w95-notepad">{t.readmeBody}</div>
      </>
    )
  }
  if (id === 'projects') return <ProjectsFolder lang={lang} t={t} onOpen={onOpen} />
  if (id.startsWith('p:')) {
    const p = projects.find((x) => x.id === id.slice(2))
    return (
      <>
        <div className="w95-body">
          {p.image && <div className="w95-frame"><img src={p.image} alt={p.title} loading="lazy" /></div>}
          <h2 className="w95-h">{p.title}</h2>
          <p className="w95-lead">{l(p.tagline, lang)}</p>
          <Group label={t.summary}><p>{l(p.summary, lang)}</p></Group>
          <Group label={t.tech}><ul className="w95-chips">{p.tech.map((x) => <li key={x}>{x}</li>)}</ul></Group>
          <Links p={p} t={t} />
        </div>
        <footer className="w95-statusbar"><span>{CATEGORY[p.category] ?? p.category}</span><span>{t.status[p.status] ?? p.status}</span></footer>
      </>
    )
  }
  if (id === 'pc') {
    return (
      <div className="w95-body">
        <div className="w95-hero">
          <Icon name="pc" size={64} />
          <div>
            <h2 className="w95-h">{site.name}</h2>
            <p className="w95-lead">{t.role}</p>
            <p className="w95-lead">Córdoba, Argentina</p>
          </div>
        </div>
        <Group label={t.about}>{l(about.bio, lang).map((p) => <p key={p}>{p}</p>)}</Group>
        <Group label={t.facts}>
          <dl className="w95-facts">
            {about.quickFacts.map((f) => (
              <div key={l(f.label, lang)}><dt>{l(f.label, lang)}</dt><dd>{l(f.value, lang)}</dd></div>
            ))}
          </dl>
        </Group>
      </div>
    )
  }
  if (id === 'career') {
    return (
      <div className="w95-body">
        <Group label={t.work}>
          {experience.map((x) => (
            <article key={x.company} className="w95-entry">
              <h3>{l(x.role, lang)} <span>{x.company}</span></h3>
              <p className="w95-when">{l(x.period, lang)}</p>
              <ul>{l(x.impact, lang).map((i) => <li key={i}>{i}</li>)}</ul>
            </article>
          ))}
        </Group>
        <Group label={t.education}>
          {academic.map((x) => (
            <article key={l(x.degree, 'es')} className="w95-entry">
              <h3>{l(x.degree, lang)}</h3>
              <p className="w95-when">{x.institution}, {l(x.period, lang)}</p>
              <ul>{l(x.highlights, lang).map((i) => <li key={i}>{i}</li>)}</ul>
            </article>
          ))}
        </Group>
      </div>
    )
  }
  if (id === 'stack') {
    return (
      <div className="w95-body">
        {skillGroups.map((g) => (
          <Group key={g.id} label={l(g.label, lang)}>
            <ul className="w95-chips">{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
          </Group>
        ))}
      </div>
    )
  }
  if (id === 'contact') {
    return (
      <div className="w95-body">
        <div className="w95-hero">
          <Icon name="contact" size={48} />
          <p>{t.contactIntro}</p>
        </div>
        <Group label={t.links}>
          <div className="w95-actions w95-actions-col">
            <a className="w95-btn" href={`mailto:${site.email}`}>{t.mail} <small>{site.email}</small></a>
            <a className="w95-btn" href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="w95-btn" href={site.github} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </Group>
        <Group label={t.resumes}>
          <div className="w95-actions">
            <a className="w95-btn" href={site.resumes.es.url} download={site.resumes.es.filename}>{t.cvEs}</a>
            <a className="w95-btn" href={site.resumes.en.url} download={site.resumes.en.filename}>{t.cvEn}</a>
          </div>
        </Group>
      </div>
    )
  }
  return (
    <div className="w95-body">
      <div className="w95-hero"><Icon name="trash" size={48} /><p>{t.trashEmpty}</p></div>
    </div>
  )
}

// ---------- sound ----------

function chime() {
  try {
    if (localStorage.getItem('site_sound') !== 'on') return // same key and value SoundContext writes
    const ctx = new AudioContext()
    const now = ctx.currentTime
    // D major add9, rolled upward
    ;[146.83, 220, 293.66, 369.99, 440, 659.25].forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const at = now + i * 0.09
      osc.type = i < 2 ? 'sine' : 'triangle'
      osc.frequency.value = f
      gain.gain.setValueAtTime(0, at)
      gain.gain.linearRampToValueAtTime(0.09, at + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.8)
      osc.connect(gain).connect(ctx.destination)
      osc.start(at)
      osc.stop(at + 1.9)
    })
    setTimeout(() => ctx.close(), 2600)
  } catch { /* audio unavailable */ }
}

// ---------- desktop ----------

function place(id, count) {
  const width = id.startsWith('p:') ? 560 : WIDTH[id]
  const x = Math.max(8, Math.min(window.innerWidth - width - 8, Math.round(window.innerWidth / 2 - width / 2 + (count - 1) * 28)))
  return { id, width, x, y: 24 + count * 28, min: false, max: false }
}

export function Win95({ lang = 'es', onExit }) {
  const t = TEXT[lang] ?? TEXT.es
  const [boot, setBoot] = useState(() => (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : 'black'
  ))
  const [wins, setWins] = useState(() => [{ ...place('readme', 0), z: 1 }])
  const [sel, setSel] = useState(null)
  const [startOpen, setStartOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const openable = useOpenable(open)

  useEffect(() => {
    if (!boot) { const s = setTimeout(chime, 0); return () => clearTimeout(s) }
    const a = setTimeout(() => setBoot('splash'), 300)
    const b = setTimeout(() => { setBoot(null); chime() }, 1250)
    return () => { clearTimeout(a); clearTimeout(b) }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- boot sequence runs once on mount
  }, [])

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      if (startOpen) { setStartOpen(false); return }
      setWins((ws) => {
        const top = topOf(ws)
        return top ? ws.filter((w) => w !== top) : ws
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [startOpen])

  const zMax = (ws) => ws.reduce((m, w) => Math.max(m, w.z), 0)
  const topOf = (ws) => ws.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0]
  const patch = (id, fn) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...fn(w, ws) } : w)))
  const focus = (id) => patch(id, (w, ws) => (w.z === zMax(ws) && !w.min ? {} : { z: zMax(ws) + 1, min: false }))

  function open(id) {
    setStartOpen(false)
    setWins((ws) => (ws.some((w) => w.id === id)
      ? ws.map((w) => (w.id === id ? { ...w, min: false, z: zMax(ws) + 1 } : w))
      : [...ws, { ...place(id, ws.length), max: mobile(), z: zMax(ws) + 1 }]))
  }

  function title(id) {
    return id.startsWith('p:') ? projects.find((p) => p.id === id.slice(2)).title : t[id]
  }

  const active = topOf(wins)

  return (
    <div
      className="w95"
      lang={lang}
      onPointerDown={(e) => {
        if (startOpen && !e.target.closest('.w95-start, .w95-startbtn')) setStartOpen(false)
        if (e.target.classList.contains('w95-desktop')) setSel(null)
      }}
    >
      <main className="w95-desktop" aria-label={t.desktop}>
        <ul className="w95-icons">
          {DESKTOP.map((id) => (
            <li key={id}>
              <button type="button" className={`w95-icon${sel === id ? ' is-sel' : ''}`} {...openable(id, setSel)}>
                <Icon name={id} size={32} />
                <span>{t[id]}</span>
              </button>
            </li>
          ))}
        </ul>

        {wins.map((w) => (
          <Win
            key={w.id}
            w={w}
            t={t}
            title={title(w.id)}
            icon={w.id.startsWith('p:') ? 'doc' : w.id}
            active={active === w}
            onFocus={() => focus(w.id)}
            onClose={() => setWins((ws) => ws.filter((x) => x.id !== w.id))}
            onMin={() => patch(w.id, () => ({ min: true }))}
            onMax={() => patch(w.id, (x) => ({ max: !x.max }))}
            onMove={(x, y) => patch(w.id, () => ({ x, y }))}
          >
            <Content id={w.id} lang={lang} t={t} onOpen={open} />
          </Win>
        ))}
      </main>

      {startOpen && (
        <nav className="w95-start" aria-label={t.start}>
          <div className="w95-start-band" aria-hidden="true"><b>Portfolio</b>95</div>
          <ul>
            {DESKTOP.filter((id) => id !== 'trash').map((id, i) => (
              <li key={id}>
                <button type="button" autoFocus={i === 0} onClick={() => open(id)}>
                  <Icon name={id} size={24} />{t[id]}
                </button>
              </li>
            ))}
            <li role="separator" className="w95-sep" />
            <li><button type="button" onClick={onExit}><Icon name="back" size={24} />{t.back}</button></li>
            <li><button type="button" onClick={onExit}><Icon name="power" size={24} />{t.shutdown}</button></li>
          </ul>
        </nav>
      )}

      <footer className="w95-taskbar" aria-label={t.taskbar}>
        <button
          type="button"
          className={`w95-startbtn${startOpen ? ' is-down' : ''}`}
          aria-expanded={startOpen}
          onClick={() => setStartOpen((o) => !o)}
        >
          <Icon name="logo" size={16} />{t.start}
        </button>
        <div className="w95-tasks">
          {wins.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`w95-task${active === w ? ' is-down' : ''}`}
              aria-pressed={active === w}
              onClick={() => (active === w ? patch(w.id, () => ({ min: true })) : focus(w.id))}
            >
              <Icon name={w.id.startsWith('p:') ? 'doc' : w.id} size={16} />
              <span>{title(w.id)}</span>
            </button>
          ))}
        </div>
        <div className="w95-tray">
          <span role="img" aria-label={t.volume}>
            <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
              <rect x="2.5" y="5.5" width="3" height="5" fill="#c0c0c0" stroke="#000" />
              <path d="M5.5 5.5 9.5 2.5v11l-4-3z" fill="#ffff00" stroke="#000" />
              <rect x="11" y="6" width="1" height="4" /><rect x="13" y="4" width="1" height="8" />
            </svg>
          </span>
          <time dateTime={now.toISOString()}>
            {now.toLocaleTimeString(lang === 'es' ? 'es-AR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
      </footer>

      {boot && (
        <div className={`w95-boot is-${boot}`} role="status" aria-label={t.booting}>
          {boot === 'splash' && (
            <div className="w95-splash">
              <Icon name="logo" size={64} />
              <p className="w95-splash-name"><b>Portfolio</b>95</p>
              <p>{site.name}</p>
              <div className="w95-progress"><span /></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
