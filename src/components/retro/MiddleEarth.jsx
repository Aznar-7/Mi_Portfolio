import { useEffect, useRef, useState } from 'react'
import { projects } from '@/data/projects'
import { useSoundEffects } from '@/contexts/SoundContext'
import { l } from '@/lib/utils'
import { goTo } from '@/lib/motion'
import '@/styles/middle-earth.css'

// Where "mellon" leads: a hand-inked map of Middle-earth where every place is a part of the portfolio.
// Picking a place shows what lives there; "go" folds the map and takes you to it on the page.

const T = {
  es: {
    title: 'Tierra Media', sub: 'Mapa del portfolio de Vicente Aznar', back: 'Volver a la Tierra de hoy',
    pick: 'Elegí un lugar del mapa.', go: 'Ir allí', close: 'Cerrar',
    route: 'La ruta de la Comunidad, de la Comarca al Monte del Destino',
  },
  en: {
    title: 'Middle-earth', sub: "A map of Vicente Aznar's portfolio", back: 'Back to the present day',
    pick: 'Pick a place on the map.', go: 'Go there', close: 'Close',
    route: 'The route of the Fellowship, from the Shire to Mount Doom',
  },
}

const P = Object.fromEntries(projects.map((p) => [p.id, p]))

// x, y in map units (1000 × 680); `to` is a selector on the page, `project` opens that project
const PLACES = [
  { id: 'shire', x: 268, y: 262, name: { es: 'La Comarca', en: 'The Shire' }, real: { es: 'Sobre mí', en: 'About me' }, to: '#sobre',
    text: { es: 'Donde empieza todo: Córdoba, un mate y una placa sobre el escritorio.', en: 'Where it all starts: Córdoba, a mate and a circuit board on the desk.' } },
  { id: 'bree', x: 350, y: 274, name: { es: 'Bree', en: 'Bree' }, real: { es: 'Contacto', en: 'Contact' }, to: '#contacto',
    text: { es: 'Toda aventura empieza con una charla en una posada. Esta es la mía: escribime.', en: 'Every adventure starts with a chat at an inn. This one is mine: write to me.' } },
  { id: 'rivendell', x: 528, y: 228, name: { es: 'Rivendel', en: 'Rivendell' }, real: { es: 'Formación', en: 'Education' }, to: '#trayectoria .edu',
    text: { es: 'La casa del saber: Ingeniería en Sistemas y la Licenciatura en IA, las dos en la UTN.', en: 'The house of lore: Systems Engineering and the AI degree, both at UTN.' } },
  { id: 'esgaroth', x: 694, y: 196, name: { es: 'Esgaroth', en: 'Lake-town' }, real: { es: 'Trayectoria', en: 'Experience' }, to: '#trayectoria',
    text: { es: 'El pueblo que comercia con todos: donde trabajé y para quién.', en: 'The town that trades with everyone: where I have worked, and for whom.' } },
  { id: 'erebor', x: 712, y: 124, project: 'utn-hub', name: { es: 'Erebor', en: 'Erebor' },
    text: { es: 'El tesoro de la montaña. Mi proyecto insignia, en producción.', en: 'The treasure under the mountain. My flagship project, in production.' } },
  { id: 'moria', x: 474, y: 322, project: 'eco-records', name: { es: 'Moria', en: 'Moria' },
    text: { es: 'Forjas enanas: hardware, carcasa y app hechos a mano.', en: 'Dwarven forges: hardware, enclosure and app made by hand.' } },
  { id: 'lorien', x: 566, y: 350, project: 'camisetas-agv', name: { es: 'Lothlórien', en: 'Lothlórien' },
    text: { es: 'Acá se tejen las capas élficas. Y algunas camisetas.', en: 'Elven cloaks are woven here. And a few T-shirts.' } },
  { id: 'isengard', x: 432, y: 432, project: 'autofull', name: { es: 'Isengard', en: 'Isengard' },
    text: { es: 'Torre de máquinas. Por suerte, esta tiene buenas intenciones.', en: 'A tower of machines. Luckily, this one means well.' } },
  { id: 'edoras', x: 520, y: 470, project: 'orden66-viandas', name: { es: 'Edoras', en: 'Edoras' },
    text: { es: 'En el salón dorado nadie se queda sin comer.', en: 'Nobody goes hungry in the golden hall.' } },
  { id: 'minas', x: 652, y: 530, project: 'gavia', name: { es: 'Minas Tirith', en: 'Minas Tirith' },
    text: { es: 'La ciudad blanca, construida capa por capa. Como un estudio de software.', en: 'The white city, built layer by layer. Like a software studio.' } },
  { id: 'doom', x: 806, y: 500, name: { es: 'Monte del Destino', en: 'Mount Doom' }, real: { es: 'Producción, un viernes', en: 'Production, on a Friday' },
    text: { es: 'No se deploya así nomás un viernes a la tarde.', en: 'One does not simply deploy on a Friday afternoon.' } },
]

// seeded noise, so the map is drawn the same way on every visit
function rand(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647 }

// Mountains in the old ink style: a lit left face, a hatched right face, filled with paper so the
// front rows overlap the back ones. Peaks scatter along a ridge line in loose rows.
function ridge(points, { gap = 19, size = 1.25, seed = 1, rows = 2 } = {}) {
  const r = rand(seed), peaks = []
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i], [x2, y2] = points[i + 1], len = Math.hypot(x2 - x1, y2 - y1)
    for (let t = 0; t < len; t += gap * (0.7 + r() * 0.6)) {
      for (let row = 0; row < rows; row++) {
        const k = t / len, s = size * (0.7 + r() * 0.6) * (row ? 0.8 : 1)
        // the second row sits beside the first, so a range reads as a band, not a single file
        peaks.push([x1 + (x2 - x1) * k + (row ? 13 : 0) + (r() - 0.5) * 8, y1 + (y2 - y1) * k + (row ? 7 : 0) + (r() - 0.5) * 6, s])
      }
    }
  }
  return peaks.sort((a, b) => a[1] - b[1])
}
function Peak({ p: [x, y, s], dark }) {
  // broad and low, lit from the left: two hatch strokes shade the right flank
  const tx = x - 2 * s, ty = y - 11 * s
  const outline = `M${x - 14 * s} ${y} Q${x - 8 * s} ${y - 6 * s} ${tx} ${ty} L${x + 2 * s} ${y - 8 * s} Q${x + 7 * s} ${y - 4 * s} ${x + 13 * s} ${y}`
  const hatch = [1, 2].map((k) => `M${tx + k * 3.4 * s} ${ty + k * 2.6 * s} l${2.4 * s} ${7 * s - k * 2.6 * s}`).join(' ')
  return (
    <g className={`pk${dark ? ' dark' : ''}`}>
      <path d={`${outline} Z`} className="pk-body" />
      <path d={outline} className="pk-line" />
      <path d={hatch} className="pk-hatch" />
    </g>
  )
}
// rolling hills: a soft hump with one shading stroke
const hills = (seed, cx, cy, n, spread = 40) => {
  const r = rand(seed)
  return Array.from({ length: n }, () => [cx + (r() - 0.5) * spread * 2, cy + (r() - 0.5) * spread * 0.6, 0.8 + r() * 0.5]).sort((a, b) => a[1] - b[1])
}
const Hill = ({ h: [x, y, s] }) => (
  <g className="hl"><path d={`M${x - 10 * s} ${y} Q${x} ${y - 9 * s} ${x + 10 * s} ${y}`} /><path d={`M${x + 2 * s} ${y - 4 * s} q${3 * s} ${1 * s} ${5 * s} ${3.4 * s}`} className="sh" /></g>
)

// Woods as small lollipop trees, drawn back to front
function wood(seed, cx, cy, rx, ry, n, size = 1) {
  const r = rand(seed)
  return Array.from({ length: n }, () => {
    const a = r() * Math.PI * 2, d = Math.sqrt(r())
    return [cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, (2.6 + r() * 1.8) * size]
  }).sort((a, b) => a[1] - b[1])
}
const Tree = ({ t: [x, y, r] }) => (
  <g className="tr"><path d={`M${x} ${y} v${r * 1.1}`} /><circle cx={x} cy={y - r * 0.15} r={r} /></g>
)

const COAST = 'M210 22 C196 70 222 104 204 150 C188 190 214 226 198 268 C182 306 212 344 196 384 C186 420 214 452 236 470 C262 492 300 520 330 560 C352 590 396 606 440 612 C490 618 520 636 560 668'
const MOUNTAINS = {
  misty: ridge([[516, 46], [500, 120], [512, 196], [492, 280], [474, 372], [462, 416]], { seed: 3, gap: 23 }),
  white: ridge([[462, 490], [520, 500], [592, 496], [632, 490]], { seed: 5, size: 1.2 }),
  ash: ridge([[704, 446], [790, 440], [880, 444], [930, 452]], { seed: 7, size: 1.1, rows: 1 }),
  shadow: ridge([[700, 458], [712, 520], [724, 600]], { seed: 11, size: 1.1, rows: 1 }),
  blue: ridge([[238, 70], [230, 150], [242, 214]], { seed: 13, size: 1, rows: 1 }),
  iron: ridge([[842, 116], [906, 112]], { seed: 17, size: 0.95, rows: 1 }),
}
const WOODS = {
  mirk: wood(7, 642, 250, 44, 86, 150),
  lorien: wood(11, 566, 352, 20, 14, 22),
  fangorn: wood(19, 470, 400, 20, 14, 22),
  old: wood(23, 306, 302, 22, 11, 18, 0.9),
}
const HILLS = [...hills(29, 300, 248, 6, 34), ...hills(31, 420, 268, 5, 22), ...hills(37, 660, 418, 6, 26), ...hills(41, 380, 380, 4, 30)]
const ROUTE = 'M268 262 L350 274 C430 262 478 236 528 228 C514 266 492 300 474 322 L566 350 C600 400 622 450 640 474 C700 504 760 504 806 500'

export function MiddleEarth({ lang = 'es', onExit }) {
  const t = T[lang] ?? T.es
  const { playSelect, playClick, playEgg } = useSoundEffects()
  const [sel, setSel] = useState(null)
  const rootRef = useRef(null), backRef = useRef(null)
  const place = PLACES.find((p) => p.id === sel)
  const proj = place?.project && P[place.project]

  // the page underneath must not scroll while the map is up. Not overflow:hidden on <html>: toggling it
  // cancels the scroll that "go there" starts right after. The wheel stops here instead.
  useEffect(() => {
    const el = rootRef.current
    const stop = (e) => e.preventDefault()
    el.addEventListener('wheel', stop, { passive: false })
    backRef.current?.focus({ preventScroll: true })
    playEgg('middle')
    return () => el.removeEventListener('wheel', stop)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- once, on open
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { if (sel) setSel(null); else onExit() } }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [sel, onExit])

  const pick = (id) => { playSelect(); setSel((s) => (s === id ? null : id)) }
  const go = () => {
    playClick()
    const to = place.project ? `p:${place.project}` : place.to
    onExit()
    setTimeout(() => goTo(to), 80)
  }

  return (
    <div className="me" ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="me-title">
      <div className="me-sheet">
        <svg className="me-map" viewBox="0 0 1000 680" role="group" aria-label={t.title}>
          <defs>
            <radialGradient id="me-paper" cx="48%" cy="44%" r="78%">
              <stop offset="0" stopColor="#f4e9cc" /><stop offset=".62" stopColor="#ead9b0" /><stop offset="1" stopColor="#cfb07a" />
            </radialGradient>
            <filter id="me-grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4" /><feColorMatrix values="0 0 0 0 .4  0 0 0 0 .28  0 0 0 0 .14  0 0 0 .1 0" /></filter>
            <filter id="me-blot"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="2" seed="9" /><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .38  0 0 0 0 .18  0 0 0 -1.6 .55" /></filter>
            <filter id="me-glow"><feGaussianBlur stdDeviation="5" /></filter>
            <mask id="me-reveal"><path d={ROUTE} pathLength="1" className="me-reveal" /></mask>
          </defs>

          {/* parchment: base, slow stains, fine grain */}
          <rect width="1000" height="680" fill="url(#me-paper)" />
          <rect width="1000" height="680" filter="url(#me-blot)" opacity=".5" />
          <rect width="1000" height="680" filter="url(#me-grain)" />

          {/* sea: the coast and its ripple lines, the way old charts hatch water */}
          {[18, 12, 6].map((o, i) => <path key={o} d={COAST} transform={`translate(${-o} ${o * 0.6})`} className="me-ripple" style={{ opacity: 0.18 + i * 0.12 }} />)}
          <path d={COAST} className="me-coast" />
          <path d="M860 270 c26 -22 74 -20 92 6 c14 22 -6 48 -40 52 c-30 4 -66 -6 -60 -30 z" className="me-lake" />
          <path d="M688 210 c6 -10 18 -10 20 2 c2 12 -6 20 -14 16 c-6 -3 -8 -10 -6 -18 z" className="me-lake" />

          {/* rivers */}
          <path className="me-river" d="M630 60 C618 140 600 210 594 290 C588 370 612 438 646 500 C676 556 698 610 690 668" />
          <path className="me-river thin" d="M326 196 C336 240 340 300 360 352 C378 400 400 456 388 520" />
          <path className="me-river thin" d="M462 430 C446 456 426 474 404 484" />
          <path className="me-river thin" d="M560 362 C574 380 588 388 600 392" />

          {Object.entries(WOODS).map(([k, trees]) => <g key={k} className={`me-wood ${k}`}>{trees.map((tr, i) => <Tree key={i} t={tr} />)}</g>)}
          <g className="me-hills">{HILLS.map((h, i) => <Hill key={i} h={h} />)}</g>
          {Object.entries(MOUNTAINS).map(([k, peaks]) => <g key={k}>{peaks.map((p, i) => <Peak key={i} p={p} dark={k === 'ash' || k === 'shadow'} />)}</g>)}
          <Peak p={[712, 140, 2]} />
          <circle cx="806" cy="492" r="16" className="me-fire" filter="url(#me-glow)" />
          <Peak p={[806, 506, 1.5]} dark />

          {/* a ship out on the western sea */}
          <g className="me-ship" transform="translate(112 196)">
            <path d="M-18 0 Q0 9 18 0 L14 -2 L-14 -2 Z" className="hull" />
            <path d="M0 -2 V-30 M-12 -6 Q0 -30 0 -30 Q4 -18 12 -6 Z" className="sail" />
            <path d="M-26 6 q6 -4 12 0 q6 4 12 0 M4 8 q6 -4 12 0 q6 4 12 0" className="wake" />
          </g>
          <g className="me-regions">
            <text x="104" y="330" className="sea">{lang === 'es' ? 'Mar de Belegaer' : 'Belegaer'}</text>
            <text x="310" y="210">Eriador</text>
            <text x="652" y="160">{lang === 'es' ? 'Bosque Negro' : 'Mirkwood'}</text>
            <text x="560" y="438">Rohan</text>
            <text x="572" y="572">Gondor</text>
            <text x="836" y="566" className="dark">Mordor</text>
            <text x="904" y="350" className="sea">Rhûn</text>
          </g>

          {/* the Fellowship's road, drawn as the map opens */}
          <path className="me-route" d={ROUTE} pathLength="1" mask="url(#me-reveal)"><title>{t.route}</title></path>

          <g className="me-compass" transform="translate(910 606)">
            <circle r="30" /><circle r="22" className="thin" />
            <path d="M0 -42 L6 -6 L42 0 L6 6 L0 42 L-6 6 L-42 0 L-6 -6 Z" className="rose" />
            <path d="M0 -42 L6 -6 L0 0 Z M42 0 L6 6 L0 0 Z M0 42 L-6 6 L0 0 Z M-42 0 L-6 -6 L0 0 Z" className="rose-dark" />
            <text y="-48" textAnchor="middle">N</text>
          </g>

          <rect x="12" y="12" width="976" height="656" className="me-border" />
          <rect x="20" y="20" width="960" height="640" className="me-border thin" />

          {PLACES.map((p, i) => (
            <g key={p.id} className={`me-place${sel === p.id ? ' on' : ''}`} style={{ '--d': `${1.3 + i * 0.07}s` }}
              tabIndex={0} role="button" aria-pressed={sel === p.id} aria-label={`${l(p.name, lang)}: ${p.project ? P[p.project].title : l(p.real, lang)}`}
              onClick={() => pick(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p.id) } }}>
              <circle cx={p.x} cy={p.y} r="18" className="hit" />
              <circle cx={p.x} cy={p.y} r="8" className="ring" />
              <circle cx={p.x} cy={p.y} r="4" className="dot" />
              <text x={p.x} y={p.y - 14} textAnchor="middle" className="me-name">{l(p.name, lang)}</text>
            </g>
          ))}
        </svg>

        <header className="me-cartouche">
          <h2 id="me-title">{t.title}</h2>
          <p>{t.sub}</p>
        </header>
        <button ref={backRef} type="button" className="me-back" onClick={() => { playClick(); onExit() }}>{t.back}</button>

        <div className={`me-card${place ? ' on' : ''}`} aria-live="polite" key={sel ?? 'none'}>
          {place ? (
            <>
              <small>{l(place.name, lang)}</small>
              <h3>{proj ? proj.title : l(place.real, lang)}</h3>
              <p className="flavor">{l(place.text, lang)}</p>
              {proj && <p>{l(proj.tagline, lang)}</p>}
              <div className="me-actions">
                {place.id !== 'doom' && <button type="button" className="go" onClick={go}>{t.go}</button>}
                <button type="button" onClick={() => setSel(null)}>{t.close}</button>
              </div>
            </>
          ) : <p className="hint">{t.pick}</p>}
        </div>
      </div>
    </div>
  )
}
