import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { projects } from '@/data/projects'
import { useSoundEffects } from '@/contexts/SoundContext'
import { l } from '@/lib/utils'
import { goTo } from '@/lib/motion'
import '@/styles/middle-earth.css'

// Where "mellon" leads: a hand-inked map of Middle-earth, laid out like the classic one, where every
// place is a part of the portfolio. Picking a place shows what lives there; "go" takes you to it.

const T = {
  es: {
    title: ['El Reino de la', 'Tierra Media'], sub: 'Mapa del portfolio de Vicente Aznar', back: 'Volver a la Tierra de hoy',
    pick: 'Tocá un lugar marcado en rojo: cada uno es una parte del portfolio.', go: 'Ir allí', close: 'Cerrar',
    route: 'La ruta de la Comunidad, de la Comarca al Monte del Destino', music: 'Música', miles: 'Leguas',
  },
  en: {
    title: ['The Realm of', 'Middle-earth'], sub: "A map of Vicente Aznar's portfolio", back: 'Back to the present day',
    pick: 'Tap a place marked in red: each one is a part of the portfolio.', go: 'Go there', close: 'Close',
    route: 'The route of the Fellowship, from the Shire to Mount Doom', music: 'Music', miles: 'Leagues',
  },
}

const P = Object.fromEntries(projects.map((p) => [p.id, p]))

// x, y in map units (1000 × 750); `to` is a selector on the page, `project` opens that project
const PLACES = [
  { id: 'shire', x: 262, y: 210, name: { es: 'La Comarca', en: 'The Shire' }, real: { es: 'Sobre mí', en: 'About me' }, to: '#sobre',
    text: { es: 'Donde empieza todo: Córdoba, un mate y una placa sobre el escritorio.', en: 'Where it all starts: Córdoba, a mate and a circuit board on the desk.' } },
  { id: 'bree', x: 322, y: 212, name: { es: 'Bree', en: 'Bree' }, real: { es: 'Contacto', en: 'Contact' }, to: '#contacto',
    text: { es: 'Toda aventura empieza con una charla en una posada. Esta es la mía: escribime.', en: 'Every adventure starts with a chat at an inn. This one is mine: write to me.' } },
  { id: 'rivendell', x: 494, y: 196, name: { es: 'Rivendel', en: 'Rivendell' }, real: { es: 'Formación', en: 'Education' }, to: '#trayectoria .edu',
    text: { es: 'La casa del saber: Ingeniería en Sistemas y la Licenciatura en IA, las dos en la UTN.', en: 'The house of lore: Systems Engineering and the AI degree, both at UTN.' } },
  { id: 'esgaroth', x: 662, y: 160, name: { es: 'Esgaroth', en: 'Lake-town' }, real: { es: 'Trayectoria', en: 'Experience' }, to: '#trayectoria',
    text: { es: 'El pueblo que comercia con todos: donde trabajé y para quién.', en: 'The town that trades with everyone: where I have worked, and for whom.' } },
  { id: 'erebor', x: 672, y: 126, project: 'utn-hub', name: { es: 'Erebor', en: 'Erebor' },
    text: { es: 'El tesoro bajo la montaña. Mi proyecto insignia, en producción.', en: 'The treasure under the mountain. My flagship project, in production.' } },
  { id: 'moria', x: 462, y: 290, project: 'eco-records', name: { es: 'Moria', en: 'Moria' },
    text: { es: 'Forjas enanas: hardware, carcasa y app hechos a mano.', en: 'Dwarven forges: hardware, enclosure and app made by hand.' } },
  { id: 'lorien', x: 522, y: 318, project: 'camisetas-agv', name: { es: 'Lórien', en: 'Lórien' },
    text: { es: 'Acá se tejen las capas élficas. Y algunas camisetas.', en: 'Elven cloaks are woven here. And a few T-shirts.' } },
  { id: 'isengard', x: 428, y: 398, project: 'autofull', name: { es: 'Isengard', en: 'Isengard' },
    text: { es: 'Torre de máquinas. Por suerte, esta tiene buenas intenciones.', en: 'A tower of machines. Luckily, this one means well.' } },
  { id: 'edoras', x: 486, y: 448, project: 'orden66-viandas', name: { es: 'Edoras', en: 'Edoras' },
    text: { es: 'En el salón dorado nadie se queda sin comer.', en: 'Nobody goes hungry in the golden hall.' } },
  { id: 'minas', x: 628, y: 492, project: 'gavia', name: { es: 'Minas Tirith', en: 'Minas Tirith' },
    text: { es: 'La ciudad blanca, construida capa por capa. Como un estudio de software.', en: 'The white city, built layer by layer. Like a software studio.' } },
  { id: 'doom', x: 714, y: 502, name: { es: 'Monte del Destino', en: 'Mount Doom' }, real: { es: 'Producción, un viernes', en: 'Production, on a Friday' },
    text: { es: 'No se deploya así nomás un viernes a la tarde.', en: 'One does not simply deploy on a Friday afternoon.' } },
]

// ── drawing helpers ─────────────────────────────────────────────────────
function rand(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647 }
// a Catmull-Rom curve through the points, written as cubic béziers
function smooth(pts, closed = false) {
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]]
  let d = `M${p[1][0]} ${p[1][1]}`
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1], [x3, y3] = p[i + 2]
    d += ` C${(x1 + (x2 - x0) / 6).toFixed(1)} ${(y1 + (y2 - y0) / 6).toFixed(1)} ${(x2 - (x3 - x1) / 6).toFixed(1)} ${(y2 - (y3 - y1) / 6).toFixed(1)} ${x2} ${y2}`
  }
  return closed ? d + ' Z' : d
}
// peaks scattered along a ridge, back to front
function ridge(points, { gap = 9, size = 1, seed = 1, width = 10 } = {}) {
  const r = rand(seed), out = []
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i], [x2, y2] = points[i + 1], len = Math.hypot(x2 - x1, y2 - y1)
    for (let t = 0; t < len; t += gap * (0.6 + r() * 0.8)) {
      const k = t / len
      out.push([x1 + (x2 - x1) * k + (r() - 0.5) * width, y1 + (y2 - y1) * k + (r() - 0.5) * width * 0.7, size * (0.6 + r() * 0.7)])
    }
  }
  return out.sort((a, b) => a[1] - b[1])
}
const f1 = (n) => n.toFixed(1)
// the classic inked mountain: a dark silhouette with one lit flank stroke
const peakD = ([x, y, s]) => `M${f1(x - 8 * s)} ${f1(y)} L${f1(x - 1.5 * s)} ${f1(y - 11 * s)} L${f1(x + s)} ${f1(y - 8 * s)} L${f1(x + 2.5 * s)} ${f1(y - 10 * s)} L${f1(x + 8 * s)} ${f1(y)} Z`
const litD = ([x, y, s]) => `M${f1(x - 1.5 * s)} ${f1(y - 10 * s)} L${f1(x - 5 * s)} ${f1(y - 2 * s)}`

// ── geography (map units, traced from the classic layout) ───────────────
const COAST = [[21, 0], [31, 62], [57, 83], [31, 120], [47, 156], [62, 198], [76, 222], [122, 206], [172, 178], [176, 194], [112, 234], [104, 270], [136, 302], [198, 312], [218, 334], [229, 374], [250, 400], [270, 418], [281, 448], [270, 480], [255, 512], [244, 552], [226, 578], [262, 582], [312, 552], [374, 536], [447, 552], [478, 574], [499, 600], [490, 624], [526, 614], [542, 604], [552, 634], [552, 660], [542, 680], [552, 700], [542, 750]]
const COAST_D = smooth(COAST)
const SEA_D = `${COAST_D} L0 750 L0 0 Z`
const LAND_D = `${COAST_D} L1000 750 L1000 0 Z`

const RANGES = {
  luinN: ridge([[112, 80], [122, 120], [128, 166]], { seed: 2, width: 18, gap: 5 }),
  luinS: ridge([[154, 234], [168, 262], [182, 292]], { seed: 4, width: 18, gap: 5 }),
  angmar: ridge([[318, 60], [356, 50], [396, 46]], { seed: 6, size: 0.8, width: 6 }),
  misty: ridge([[452, 66], [484, 118], [499, 172], [494, 234], [473, 292], [458, 354], [446, 406]], { seed: 3, width: 24, gap: 4 }),
  grey: ridge([[520, 86], [580, 82], [652, 86]], { seed: 5, size: 0.85, width: 12, gap: 5.5 }),
  iron: ridge([[728, 128], [790, 132], [850, 138]], { seed: 7, size: 0.8, width: 6 }),
  white: ridge([[302, 516], [364, 494], [420, 474], [470, 462], [520, 470], [577, 492], [612, 500]], { seed: 9, width: 20, gap: 4.5 }),
  lithui: ridge([[662, 458], [720, 456], [780, 455], [850, 451], [926, 447]], { seed: 11, size: 0.9, width: 12, gap: 5 }),
  ephel: ridge([[666, 466], [672, 520], [680, 580], [692, 628]], { seed: 13, size: 0.9, width: 12, gap: 5 }),
  southM: ridge([[700, 632], [780, 612], [850, 594], [900, 578]], { seed: 15, size: 0.85, width: 10, gap: 5.5 }),
  rhun: ridge([[820, 330], [850, 344]], { seed: 17, size: 0.7, width: 4 }),
}
const WOODS = {
  mirkwood: smooth([[556, 120], [608, 108], [650, 104], [671, 136], [664, 176], [666, 210], [678, 270], [664, 312], [636, 342], [606, 352], [584, 330], [570, 290], [568, 250], [578, 210], [560, 168]], true),
  fangorn: smooth([[468, 346], [500, 340], [520, 360], [512, 392], [484, 400], [466, 380]], true),
  lorien: smooth([[510, 306], [530, 304], [536, 318], [526, 330], [510, 326]], true),
  old: smooth([[280, 208], [300, 204], [306, 214], [292, 222], [278, 218]], true),
  trolls: smooth([[432, 186], [456, 182], [462, 194], [444, 200], [430, 196]], true),
  vorn: smooth([[218, 352], [234, 348], [240, 364], [226, 372], [214, 366]], true),
  luin: smooth([[118, 104], [132, 98], [138, 120], [130, 140], [118, 134]], true),
}
const RIVERS = [
  smooth([[577, 112], [572, 182], [588, 260], [608, 333], [624, 395], [634, 447], [640, 494], [629, 546], [608, 598], [598, 650], [577, 676]]),
  smooth([[312, 166], [300, 196], [291, 218], [282, 246], [270, 270], [250, 296], [229, 312]]),
  smooth([[452, 292], [410, 316], [364, 338], [326, 352], [291, 364], [276, 380]]),
  smooth([[432, 406], [400, 426], [364, 442], [330, 448], [300, 456]]),
  smooth([[676, 156], [720, 180], [780, 208], [790, 234], [820, 270]]),
  smooth([[770, 146], [780, 190], [796, 234], [806, 290]]),
  smooth([[508, 404], [540, 420], [580, 432], [612, 440]]),
]
const LAKES = [
  'M858 282 L884 262 L896 282 L928 268 L924 300 L948 318 L918 326 L912 352 L890 336 L862 348 L868 318 L846 304 Z',
  'M778 604 C796 588 834 584 852 594 C864 602 848 616 822 620 C800 624 772 618 778 604 Z',
  'M658 150 C662 142 670 142 670 150 L668 166 C666 172 658 172 658 164 Z',
  'M240 140 C246 134 254 136 254 144 C254 152 244 156 240 150 Z',
]
const ROADS = [
  smooth([[200, 214], [262, 210], [322, 212], [380, 206], [440, 202], [494, 196]]),
  smooth([[322, 212], [350, 270], [376, 316], [398, 362], [416, 400], [440, 430], [486, 448], [560, 474], [628, 492]]),
]
const ROUTE = smooth([[262, 210], [322, 212], [400, 204], [494, 196], [470, 250], [462, 290], [522, 318], [560, 360], [600, 420], [640, 470], [690, 500], [714, 502]])

export function MiddleEarth({ lang = 'es', onExit }) {
  const t = T[lang] ?? T.es
  const { playSelect, playClick } = useSoundEffects()
  const [sel, setSel] = useState(null)
  const [music, setMusic] = useState(true)
  const rootRef = useRef(null), backRef = useRef(null), audioRef = useRef(null)
  const place = PLACES.find((p) => p.id === sel)
  const proj = place?.project && P[place.project]

  // the page underneath must not scroll while the map is up. Not overflow:hidden on <html>: toggling it
  // cancels the scroll that "go there" starts right after. The wheel stops here instead.
  useEffect(() => {
    const el = rootRef.current
    const stop = (e) => e.preventDefault()
    el.addEventListener('wheel', stop, { passive: false })
    backRef.current?.focus({ preventScroll: true })
    return () => el.removeEventListener('wheel', stop)
  }, [])

  // the Shire theme plays while the map is open, fading in and out
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    let raf
    const fade = (to, then) => {
      cancelAnimationFrame(raf)
      const step = () => {
        a.volume = Math.max(0, Math.min(1, a.volume + (to > a.volume ? 0.015 : -0.03)))
        if (Math.abs(a.volume - to) > 0.03) raf = requestAnimationFrame(step)
        else { a.volume = to; then?.() }
      }
      step()
    }
    if (music) { a.volume = 0; a.play().then(() => fade(0.5)).catch(() => setMusic(false)) }
    else fade(0, () => a.pause())
    return () => cancelAnimationFrame(raf)
  }, [music])

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
      <audio ref={audioRef} src="/audio/concerning-hobbits.mp3" loop preload="auto" />
      <div className="me-sheet">
        <svg className="me-map" viewBox="0 0 1000 750" role="group" aria-label={t.title.join(' ')}>
          <defs>
            <radialGradient id="me-paper" gradientUnits="userSpaceOnUse" cx="550" cy="340" r="720">
              <stop offset="0" stopColor="#e9cf98" /><stop offset=".55" stopColor="#d9b276" /><stop offset=".85" stopColor="#c08a48" /><stop offset="1" stopColor="#9a6430" />
            </radialGradient>
            <radialGradient id="me-seatint" gradientUnits="userSpaceOnUse" cx="200" cy="600" r="700">
              <stop offset="0" stopColor="#9aa56a" stopOpacity=".75" /><stop offset="1" stopColor="#b8a462" stopOpacity=".35" />
            </radialGradient>
            <filter id="me-grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4" /><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .2  0 0 0 0 .1  0 0 0 .14 0" /></filter>
            <filter id="me-blot"><feTurbulence type="fractalNoise" baseFrequency=".008 .012" numOctaves="3" seed="9" /><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .28  0 0 0 0 .12  0 0 0 -1.4 .5" /></filter>
            <filter id="me-glow"><feGaussianBlur stdDeviation="4" /></filter>
            <pattern id="me-scallop" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M0 5 a5 4.2 0 0 1 10 0 M-5 10 a5 4.2 0 0 1 10 0 M5 10 a5 4.2 0 0 1 10 0" />
            </pattern>
            <clipPath id="me-land"><path d={LAND_D} /></clipPath>
            <mask id="me-reveal"><path d={ROUTE} pathLength="1" className="me-reveal" /></mask>
            <path id="arc-eriador" d="M196 330 Q310 270 440 300" />
            <path id="arc-rhov" d="M600 150 Q690 240 640 360" />
            <path id="arc-gondor" d="M400 580 Q520 540 650 560" />
            <path id="arc-mordor" d="M722 576 Q830 536 975 530" />
          </defs>

          {/* parchment and the green sea */}
          <rect width="1000" height="750" fill="url(#me-paper)" />
          <path d={SEA_D} fill="url(#me-seatint)" />
          {/* contour lines hugging the coast: wide strokes of ink on the sea, then the land hides its half */}
          {/* each contour is a wide ink stroke covered by a slightly narrower stroke of paper + sea,
              which leaves a hairline; painting the same gradients keeps the sea seamless */}
          {[34, 25, 17, 10].map((w) => (
            <g key={w}>
              <path d={COAST_D} className="me-contour" style={{ strokeWidth: w + 1.1 }} />
              <path d={COAST_D} className="me-contour-gap" stroke="url(#me-paper)" style={{ strokeWidth: w }} />
              <path d={COAST_D} className="me-contour-gap" stroke="url(#me-seatint)" style={{ strokeWidth: w }} />
            </g>
          ))}
          <path d={LAND_D} fill="url(#me-paper)" />
          <rect width="1000" height="750" filter="url(#me-blot)" opacity=".6" />
          <path d={COAST_D} className="me-coast" />

          <g clipPath="url(#me-land)">
            {LAKES.map((d) => <path key={d} d={d} className="me-lake" />)}
            {RIVERS.map((d) => <path key={d} d={d} className="me-river" />)}
            {ROADS.map((d) => <path key={d} d={d} className="me-road" />)}
            {Object.entries(WOODS).map(([k, d]) => <path key={k} d={d} className={`me-wood ${k}`} />)}
            {Object.entries(RANGES).map(([k, peaks]) => (
              <g key={k}>{peaks.map((p, i) => <g key={i}><path d={peakD(p)} className="pk" /><path d={litD(p)} className="pk-lit" /></g>)}</g>
            ))}
            <path d={peakD([672, 140, 2])} className="pk" /><path d={litD([672, 140, 2])} className="pk-lit" />
            <circle cx="714" cy="494" r="12" className="me-fire" filter="url(#me-glow)" />
            <path d={peakD([714, 508, 1.6])} className="pk" />
          </g>
          <rect width="1000" height="750" filter="url(#me-grain)" />

          {/* lettering, in the manner of the old map */}
          <g className="me-big">
            <text><textPath href="#arc-eriador">ERIADOR</textPath></text>
            <text className="sm"><textPath href="#arc-rhov">RHOVANION</textPath></text>
            <text><textPath href="#arc-gondor">GONDOR</textPath></text>
            <text><textPath href="#arc-mordor">MORDOR</textPath></text>
            <text x="474" y="430" className="sm">ROHAN</text>
            <text x="520" y="40" className="xs">FORODWAITH</text>
            <text x="300" y="402" className="xs" transform="rotate(-30 300 402)">ENEDWAITH</text>
            <text x="900" y="720" className="xs">HARAD</text>
            {[...'RHÛN'].map((c, i) => <text key={c} x="944" y={90 + i * 52} className="sm">{c}</text>)}
          </g>
          <g className="me-small">
            <text x="690" y="250" transform="rotate(78 690 250)">{lang === 'es' ? 'Bosque Negro' : 'Mirkwood'}</text>
            <text x="790" y="122">{lang === 'es' ? 'Colinas de Hierro' : 'Iron Hills'}</text>
            <text x="590" y="74">Ered Mithrin</text>
            <text x="884" y="372">{lang === 'es' ? 'Mar de Rhûn' : 'Sea of Rhûn'}</text>
            <text x="818" y="640">{lang === 'es' ? 'Mar de Núrnen' : 'Sea of Núrnen'}</text>
            <text x="790" y="438">Ered Lithui</text>
            <text x="404" y="532" transform="rotate(-14 404 532)">Ered Nimrais</text>
            <text x="512" y="250" transform="rotate(-72 512 250)">{lang === 'es' ? 'Montañas Nubladas' : 'Misty Mountains'}</text>
            <text x="96" y="196" transform="rotate(-70 96 196)">Ered Luin</text>
            <text x="492" y="372">Fangorn</text>
            <text x="560" y="625">Belfalas</text>
            <text x="96" y="452" className="sea">Belegaer</text>
          </g>

          {/* the Fellowship's road, drawn as the map opens */}
          <path className="me-route" d={ROUTE} pathLength="1" mask="url(#me-reveal)"><title>{t.route}</title></path>

          {/* compass and scale, out on the sea like the old map */}
          <g className="me-compass" transform="translate(84 336)">
            <circle r="24" /><circle r="17" className="thin" />
            <path d="M0 -34 L5 -5 L34 0 L5 5 L0 34 L-5 5 L-34 0 L-5 -5 Z" className="rose" />
            <path d="M0 -34 L5 -5 L0 0 Z M34 0 L5 5 L0 0 Z M0 34 L-5 5 L0 0 Z M-34 0 L-5 -5 L0 0 Z" className="rose-dark" />
            <text y="-42" textAnchor="middle">N</text>
          </g>
          <g className="me-scale" transform="translate(56 690)">
            <path d="M0 0 H130 M0 -4 V4 M32 -3 V3 M65 -4 V4 M97 -3 V3 M130 -4 V4" />
            <text x="65" y="-9" textAnchor="middle">{t.miles}</text>
          </g>

          <rect x="6" y="6" width="988" height="738" className="me-border" />

          {PLACES.map((p, i) => (
            <g key={p.id} className={`me-place${sel === p.id ? ' on' : ''}`} style={{ '--d': `${1.3 + i * 0.07}s` }}
              tabIndex={0} role="button" aria-pressed={sel === p.id} aria-label={`${l(p.name, lang)}: ${p.project ? P[p.project].title : l(p.real, lang)}`}
              onClick={() => pick(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p.id) } }}>
              <circle cx={p.x} cy={p.y} r="16" className="hit" />
              <circle cx={p.x} cy={p.y} r="6.5" className="ring" />
              <circle cx={p.x} cy={p.y} r="3.2" className="dot" />
              <text x={p.x} y={p.y - 11} textAnchor="middle" className="me-name">{l(p.name, lang)}</text>
            </g>
          ))}
        </svg>

        <header className="me-cartouche">
          <h2 id="me-title"><small>{t.title[0]}</small>{t.title[1]}</h2>
          <p>{t.sub}</p>
        </header>
        <div className="me-tools">
          <button type="button" className="me-btn" aria-pressed={music} onClick={() => setMusic((m) => !m)}>
            {music ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}{t.music}
          </button>
          <button ref={backRef} type="button" className="me-btn" onClick={() => { playClick(); onExit() }}>{t.back}</button>
        </div>

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
