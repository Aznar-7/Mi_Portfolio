import { useEffect, useRef, useState } from 'react'
import { projects } from '@/data/projects'
import { useSoundEffects } from '@/contexts/SoundContext'
import { l } from '@/lib/utils'
import { goTo } from '@/lib/motion'
import { Planet } from './Planet'
import '@/styles/galaxy.css'

// Where the hyperspace jump comes out: a spiral galaxy turning slowly, with the portfolio charted
// as star systems. Pick one for a holo readout; "set course" drops you at that part of the page.

const T = {
  es: { title: 'Una galaxia muy, muy lejana', sub: 'Carta estelar del portfolio', back: 'Salir de la galaxia', pick: 'Tocá un sistema para viajar hasta él. Cada planeta es una parte del portfolio.', go: 'Fijar rumbo a esta sección', galaxy: 'Volver a la galaxia', prev: 'Sistema anterior', next: 'Sistema siguiente', sector: 'Sistema' },
  en: { title: 'A galaxy far, far away', sub: 'A star chart of the portfolio', back: 'Leave the galaxy', pick: 'Tap a system to travel there. Every planet is a part of the portfolio.', go: 'Set course for this section', galaxy: 'Back to the galaxy', prev: 'Previous system', next: 'Next system', sector: 'System' },
}

const P = Object.fromEntries(projects.map((p) => [p.id, p]))

// a: angle in the disc (radians), r: distance from the core (0..1)
const SYSTEMS = [
  { id: 'tatooine', a: 0.4, r: 0.78, name: 'Tatooine', real: { es: 'Sobre mí', en: 'About me' }, to: '#sobre',
    text: { es: 'Un planeta en el borde, lejos del centro. Así empiezan las buenas historias: en Córdoba.', en: 'A planet on the rim, far from the core. That is how good stories start: in Córdoba.' } },
  { id: 'bespin', a: 1.5, r: 0.55, project: 'utn-hub', name: 'Bespin',
    text: { es: 'Una ciudad en las nubes. Este proyecto también vive en la nube, en mi VM de Oracle.', en: 'A city in the clouds. This project lives in the cloud too, on my Oracle VM.' } },
  { id: 'coruscant', a: 2.6, r: 0.2, project: 'gavia', name: 'Coruscant',
    text: { es: 'El planeta ciudad, cerca del núcleo. Un estudio que se construye capa por capa.', en: 'The city planet, close to the core. A studio built layer by layer.' } },
  { id: 'geonosis', a: 3.4, r: 0.62, project: 'autofull', name: 'Geonosis',
    text: { es: 'Fábricas de droides. Este anda solo, con un ESP32 y sensores.', en: 'Droid foundries. This one drives itself, with an ESP32 and sensors.' } },
  { id: 'jakku', a: 4.3, r: 0.86, project: 'eco-records', name: 'Jakku',
    text: { es: 'Chatarreros que rearman cualquier cosa. Hardware, carcasa y app, hechos a mano.', en: 'Scavengers who can rebuild anything. Hardware, enclosure and app, made by hand.' } },
  { id: 'utapau', a: 5.0, r: 0.42, project: 'orden66-viandas', name: 'Utapau',
    text: { es: 'Acá se dio la orden 66. Esta vez es de viandas.', en: 'Order 66 was given here. This time it is about lunch boxes.' } },
  { id: 'naboo', a: 5.8, r: 0.7, project: 'camisetas-agv', name: 'Naboo',
    text: { es: 'El planeta con más estilo de la galaxia.', en: 'The most stylish planet in the galaxy.' } },
  { id: 'dagobah', a: 0.95, r: 0.32, name: 'Dagobah', real: { es: 'Formación', en: 'Education' }, to: '#trayectoria .edu',
    text: { es: 'Entrenando con maestros: Sistemas e IA en la UTN.', en: 'Training with masters: Systems and AI at UTN.' } },
  { id: 'corellia', a: 2.1, r: 0.88, name: 'Corellia', real: { es: 'Trayectoria', en: 'Experience' }, to: '#trayectoria',
    text: { es: 'Astilleros y comercio: donde trabajé y para quién.', en: 'Shipyards and trade: where I have worked, and for whom.' } },
  { id: 'takodana', a: 3.95, r: 0.3, name: 'Takodana', real: { es: 'Contacto', en: 'Contact' }, to: '#contacto',
    text: { es: 'El castillo donde todos se cruzan. Pasá y escribime.', en: 'The castle where everyone crosses paths. Stop by and write to me.' } },
]

const TILT = 0.58 // the disc is seen from above at an angle
const SPIN = (Math.PI * 2) / 420 // one turn every seven minutes, in radians per second

// one pass to paint the galaxy into an offscreen canvas; each frame only rotates the bitmap
function paintGalaxy(size) {
  const c = document.createElement('canvas'); c.width = c.height = size
  const x = c.getContext('2d'), h = size / 2
  let s = 42
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd())
  const armAt = (t, arm) => arm * Math.PI + t * 4.6 // two log-ish arms, about three quarters of a turn
  x.globalCompositeOperation = 'lighter'
  // nebulae first: big soft clouds strung along the arms
  for (let i = 0; i < 90; i++) {
    const t = 0.15 + rnd() * 0.8, arm = i % 2, ang = armAt(t, arm) + gauss() * 0.12
    const px = h + Math.cos(ang) * t * h * 0.95, py = h + Math.sin(ang) * t * h * 0.95, rr = h * (0.05 + rnd() * 0.09)
    const g = x.createRadialGradient(px, py, 0, px, py, rr)
    const tint = rnd() < 0.35 ? '255,120,170' : rnd() < 0.5 ? '120,150,255' : '150,200,255'
    g.addColorStop(0, `rgba(${tint},.10)`); g.addColorStop(1, `rgba(${tint},0)`)
    x.fillStyle = g; x.fillRect(px - rr, py - rr, rr * 2, rr * 2)
  }
  // stars: most along the arms with a spread that widens outward, the rest as a diffuse disc
  for (let i = 0; i < 26000; i++) {
    let px, py, t
    if (rnd() < 0.72) {
      t = Math.pow(rnd(), 0.8)
      const ang = armAt(t, i % 2) + gauss() * (0.1 + t * 0.22)
      const r = (t + gauss() * 0.025) * h * 0.95
      px = h + Math.cos(ang) * r; py = h + Math.sin(ang) * r
    } else {
      t = Math.min(1, -Math.log(rnd() + 1e-9) * 0.28)
      const ang = rnd() * Math.PI * 2
      px = h + Math.cos(ang) * t * h; py = h + Math.sin(ang) * t * h
    }
    const warm = Math.max(0, 1 - t * 1.6)
    x.fillStyle = `rgba(${200 + warm * 55 | 0},${205 + warm * 25 | 0},${255 - warm * 90 | 0},${0.18 + rnd() * 0.5})`
    const sz = rnd() < 0.02 ? 2 : rnd() < 0.2 ? 1.3 : 0.8
    x.fillRect(px, py, sz, sz)
  }
  // the core: a hot bulge with a short bar through it
  const core = x.createRadialGradient(h, h, 0, h, h, h * 0.3)
  core.addColorStop(0, 'rgba(255,244,220,.95)'); core.addColorStop(0.25, 'rgba(255,200,140,.5)'); core.addColorStop(1, 'rgba(255,160,120,0)')
  x.fillStyle = core; x.fillRect(0, 0, size, size)
  x.save(); x.translate(h, h); x.rotate(0.6); x.scale(1, 0.35)
  const bar = x.createRadialGradient(0, 0, 0, 0, 0, h * 0.16)
  bar.addColorStop(0, 'rgba(255,230,190,.6)'); bar.addColorStop(1, 'rgba(255,230,190,0)')
  x.fillStyle = bar; x.fillRect(-h * 0.16, -h * 0.16, h * 0.32, h * 0.32)
  x.restore()
  return c
}

export function Galaxy({ lang = 'es', onExit }) {
  const t = T[lang] ?? T.es
  const { playClick, playEgg } = useSoundEffects()
  const [sel, setSel] = useState(null) // the system we are visiting
  const [warp, setWarp] = useState(null) // { x, y } while jumping toward a system
  const rootRef = useRef(null), canvasRef = useRef(null), backRef = useRef(null), marks = useRef({})
  const sys = SYSTEMS.find((p) => p.id === sel)
  const proj = sys?.project && P[sys.project]

  useEffect(() => {
    const root = rootRef.current, cv = canvasRef.current, ctx = cv.getContext('2d')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const stop = (e) => e.preventDefault()
    root.addEventListener('wheel', stop, { passive: false })
    backRef.current?.focus({ preventScroll: true })
    let W, H, R, tilt, gal, raf
    // a fixed field of background stars, twinkling a little
    const field = Array.from({ length: 220 }, () => [Math.random(), Math.random(), Math.random() * 1.3 + 0.2, Math.random() * 6])
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2)
      // phones are tall: a bigger, more face-on disc uses the height instead of a thin ellipse
      W = innerWidth; H = innerHeight; tilt = W < 700 ? 0.9 : TILT; R = W < 700 ? Math.min(W * 0.62, H * 0.42) : Math.min(W * 0.46, H * 0.8)
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      gal = paintGalaxy(Math.round(R * 2 * dpr))
    }
    size()
    const t0 = performance.now()
    const frame = (now) => {
      const sec = (now - t0) / 1000, rot = reduced ? 0 : sec * SPIN
      ctx.clearRect(0, 0, W, H)
      for (const [fx, fy, fr, ph] of field) {
        ctx.fillStyle = `rgba(220,230,255,${0.25 + 0.25 * Math.sin(sec * 1.3 + ph)})`
        ctx.fillRect(fx * W, fy * H, fr, fr)
      }
      const cx = W / 2, cy = H * 0.52
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, tilt); ctx.rotate(rot)
      ctx.drawImage(gal, -R, -R, R * 2, R * 2)
      ctx.restore()
      // systems ride the disc
      for (const s of SYSTEMS) {
        const el = marks.current[s.id]
        if (!el) continue
        const a = s.a + rot
        el.style.transform = `translate(${cx + Math.cos(a) * s.r * R}px, ${cy + Math.sin(a) * s.r * R * tilt}px)`
      }
      if (!reduced) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const onResize = () => { size(); if (reduced) requestAnimationFrame(frame) }
    addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize); root.removeEventListener('wheel', stop) }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { if (sel) setSel(null); else onExit() }
      if (sel && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const n = SYSTEMS.length, i = SYSTEMS.findIndex((x) => x.id === sel)
        playEgg('warp'); setSel(SYSTEMS[(i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n].id)
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [sel, onExit, playEgg])

  // jump: the galaxy rushes toward the system, then the planet view takes over
  const pick = (id) => {
    const b = marks.current[id]?.getBoundingClientRect()
    playEgg('warp')
    setWarp(b ? { x: b.left + 8, y: b.top + 8 } : { x: innerWidth / 2, y: innerHeight / 2 })
    setTimeout(() => { setSel(id); setWarp(null) }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650)
  }
  const hop = (dir) => {
    const i = SYSTEMS.findIndex((x) => x.id === sel)
    playEgg('warp'); setSel(SYSTEMS[(i + dir + SYSTEMS.length) % SYSTEMS.length].id)
  }
  const go = () => {
    playClick()
    const to = sys.project ? `p:${sys.project}` : sys.to
    onExit()
    setTimeout(() => goTo(to), 80)
  }

  return (
    <div className={`gx${warp ? ' warping' : ''}${sel ? ' visiting' : ''}`} ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="gx-title"
      style={warp ? { '--wx': `${warp.x}px`, '--wy': `${warp.y}px` } : undefined}>
      <canvas ref={canvasRef} className="gx-sky" aria-hidden="true" />
      <ul className="gx-systems">
        {SYSTEMS.map((s, i) => (
          <li key={s.id} ref={(el) => { marks.current[s.id] = el }} style={{ '--d': `${0.9 + i * 0.07}s` }}>
            <button type="button" className={sel === s.id ? 'on' : ''} aria-pressed={sel === s.id} onClick={() => pick(s.id)}
              aria-label={`${s.name}: ${s.project ? P[s.project].title : l(s.real, lang)}`}>
              <i aria-hidden="true" /><span>{s.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <header className="gx-head">
        <h2 id="gx-title">{t.title}</h2>
        <p>{t.sub}</p>
      </header>
      <button ref={backRef} type="button" className="gx-back" onClick={() => { playClick(); onExit() }}>{t.back}</button>

      <p className="gx-hint">{t.pick}</p>

      {sys && (
        <section className="gx-visit" key={sys.id} aria-live="polite">
          <Planet world={sys.id} className="gx-world" />
          <div className="gx-card">
            <small>{t.sector} · {sys.name}</small>
            <h3>{proj ? proj.title : l(sys.real, lang)}</h3>
            <p className="flavor">{l(sys.text, lang)}</p>
            {proj && <p>{l(proj.tagline, lang)}</p>}
            <div className="gx-actions">
              <button type="button" className="go" onClick={go}>{t.go}</button>
              <button type="button" onClick={() => { playClick(); setSel(null) }}>{t.galaxy}</button>
            </div>
            <div className="gx-hop">
              <button type="button" onClick={() => hop(-1)} aria-label={t.prev}>←</button>
              <span>{SYSTEMS.findIndex((x) => x.id === sys.id) + 1} / {SYSTEMS.length}</span>
              <button type="button" onClick={() => hop(1)} aria-label={t.next}>→</button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
