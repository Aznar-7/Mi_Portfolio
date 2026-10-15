import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { projects } from '@/data/projects'
import { useSoundEffects } from '@/contexts/SoundContext'
import { l } from '@/lib/utils'
import { goTo } from '@/lib/motion'
import '@/styles/middle-earth.css'

// Where "mellon" leads: the map of Middle-earth with the portfolio marked on it. Picking a place
// flies the map to it and unrolls a note: what lives there, a nod to the films, and the next stop
// along the Fellowship's road. The map image is 1920 × 1440; places are in those pixels.

const T = {
  es: {
    title: 'Tierra Media', sub: 'Mapa del portfolio de Vicente Aznar', back: 'Volver a la Tierra de hoy',
    pick: 'Tocá un lugar marcado en rojo: cada uno es una parte del portfolio.', go: 'Ir allí', all: 'Ver todo el mapa',
    prev: 'Parada anterior', next: 'Siguiente parada', music: 'Música', stop: 'Parada',
  },
  en: {
    title: 'Middle-earth', sub: "A map of Vicente Aznar's portfolio", back: 'Back to the present day',
    pick: 'Tap a place marked in red: each one is a part of the portfolio.', go: 'Go there', all: 'See the whole map',
    prev: 'Previous stop', next: 'Next stop', music: 'Music', stop: 'Stop',
  },
}

const P = Object.fromEntries(projects.map((p) => [p.id, p]))

// in the order of the road, from the Shire to Mount Doom (Erebor and Lake-town close the list)
const PLACES = [
  { id: 'shire', x: 505, y: 402, name: { es: 'La Comarca', en: 'The Shire' }, real: { es: 'Sobre mí', en: 'About me' }, to: '#sobre',
    text: { es: 'Donde empieza todo: Córdoba, un mate y una placa sobre el escritorio.', en: 'Where it all starts: Córdoba, a mate and a circuit board on the desk.' },
    more: { es: 'Full stack en Porta Hnos, estudiante de Sistemas e IA en la UTN y cofundador de Gavia. Me gusta llevar una idea hasta que funcione de verdad.', en: 'Full stack at Porta Hnos, Systems and AI student at UTN and co-founder of Gavia. I like taking an idea all the way until it really works.' },
    film: { es: 'Toda gran aventura empieza saliendo por la puerta de casa.', en: 'Every great adventure starts by stepping out of your own door.' } },
  { id: 'bree', x: 630, y: 418, name: { es: 'Bree', en: 'Bree' }, real: { es: 'Contacto', en: 'Contact' }, to: '#contacto',
    text: { es: 'En la posada del Poney Pisador siempre hay alguien que conoce el camino. Escribime.', en: 'At the Prancing Pony there is always someone who knows the way. Write to me.' },
    more: { es: 'Mail, LinkedIn, GitHub o el formulario de la página. Contesto rápido.', en: 'Email, LinkedIn, GitHub or the form on the page. I reply fast.' },
    film: { es: 'Un forastero en el rincón, la capucha puesta, esperando tu mensaje.', en: 'A stranger in the corner, hood up, waiting for your message.' } },
  { id: 'rivendell', x: 950, y: 382, name: { es: 'Rivendel', en: 'Rivendell' }, real: { es: 'Formación', en: 'Education' }, to: '#trayectoria .edu',
    text: { es: 'La casa del saber, donde se reunió el Concilio.', en: 'The house of lore, where the Council met.' },
    more: { es: 'Dos carreras en paralelo en la UTN: Ingeniería en Sistemas de Información y la Licenciatura en Inteligencia Artificial.', en: 'Two degrees in parallel at UTN: Information Systems Engineering and the Bachelor in Artificial Intelligence.' },
    film: { es: 'Acá se decide el rumbo antes de salir.', en: 'This is where the course is set before setting out.' } },
  { id: 'moria', x: 868, y: 566, project: 'eco-records', name: { es: 'Moria', en: 'Moria' },
    text: { es: 'Las forjas de los enanos: hardware, carcasa y app hechos a mano.', en: 'The dwarves’ forges: hardware, enclosure and app made by hand.' },
    film: { es: 'Los enanos cavaron demasiado hondo. Yo cavé hasta el hardware.', en: 'The dwarves dug too deep. I dug all the way down to the hardware.' } },
  { id: 'lorien', x: 1004, y: 626, project: 'camisetas-agv', name: { es: 'Lórien', en: 'Lórien' },
    text: { es: 'Los elfos te regalan una capa al irte. Acá, una camiseta.', en: 'The elves give you a cloak as you leave. Here, a T-shirt.' },
    film: { es: 'Un bosque dorado donde todo está hecho con cuidado.', en: 'A golden wood where everything is made with care.' } },
  { id: 'isengard', x: 822, y: 762, project: 'autofull', name: { es: 'Isengard', en: 'Isengard' },
    text: { es: 'La torre de las máquinas. Por suerte, esta tiene buenas intenciones.', en: 'The tower of machines. Luckily, this one means well.' },
    film: { es: 'Saruman construyó máquinas para la guerra; esta esquiva obstáculos.', en: 'Saruman built machines for war; this one dodges obstacles.' } },
  { id: 'edoras', x: 928, y: 898, project: 'orden66-viandas', name: { es: 'Edoras', en: 'Edoras' },
    text: { es: 'En el salón dorado de Rohan nadie se queda sin comer.', en: 'Nobody goes hungry in the golden hall of Rohan.' },
    film: { es: 'Rohan responde al llamado. Y al almuerzo.', en: 'Rohan answers the call. And lunch.' } },
  { id: 'minas', x: 1226, y: 952, project: 'gavia', name: { es: 'Minas Tirith', en: 'Minas Tirith' },
    text: { es: 'La Ciudad Blanca, construida nivel por nivel.', en: 'The White City, built level by level.' },
    film: { es: 'Siete niveles de muralla; un estudio de software crece igual.', en: 'Seven levels of walls; a software studio grows the same way.' } },
  { id: 'doom', x: 1372, y: 958, below: true, name: { es: 'Monte del Destino', en: 'Mount Doom' }, real: { es: 'Producción, un viernes', en: 'Production, on a Friday' },
    text: { es: 'No se deploya así nomás un viernes a la tarde.', en: 'One does not simply deploy on a Friday afternoon.' },
    more: { es: 'Acá termina el viaje de la Comunidad. El mío no: lo que sale a producción, se cuida.', en: 'The Fellowship’s journey ends here. Mine doesn’t: what ships to production gets looked after.' },
    film: { es: 'El fuego del Orodruin es el único lugar para ciertos bugs.', en: 'The fires of Orodruin are the only place for certain bugs.' } },
  { id: 'erebor', x: 1290, y: 240, project: 'utn-hub', name: { es: 'Erebor', en: 'Erebor' },
    text: { es: 'El tesoro bajo la Montaña Solitaria: mi proyecto insignia, en producción.', en: 'The treasure under the Lonely Mountain: my flagship project, in production.' },
    film: { es: 'Un tesoro que vale la pena cuidar. Sin dragón, por ahora.', en: 'A treasure worth guarding. No dragon, so far.' } },
  { id: 'esgaroth', x: 1282, y: 292, name: { es: 'Esgaroth', en: 'Lake-town' }, real: { es: 'Trayectoria', en: 'Experience' }, to: '#trayectoria',
    text: { es: 'La Ciudad del Lago vive del comercio con todos: donde trabajé y para quién.', en: 'Lake-town lives by trading with everyone: where I have worked, and for whom.' },
    more: { es: 'Gavia, el estudio que cofundé; Porta Hnos, donde hice sistemas internos completos; y un producto en equipo con Globant.', en: 'Gavia, the studio I co-founded; Porta Hnos, where I built complete internal systems; and a team product with Globant.' },
    film: { es: 'Barcazas que van y vienen, como los deploys.', en: 'Barges coming and going, like deploys.' } },
]
const ROUTE = 'M505 402 C560 412 600 420 630 418 C740 410 860 380 950 382 C930 450 890 520 868 566 C920 590 970 610 1004 626 C1060 700 1120 800 1170 880 C1200 930 1300 960 1372 958'
const W = 1920, H = 1440

export function MiddleEarth({ lang = 'es', onExit, leaving }) {
  const t = T[lang] ?? T.es
  const { playSelect, playClick, isMuted } = useSoundEffects()
  const [sel, setSel] = useState(null)
  const [music, setMusic] = useState(!isMuted)
  const rootRef = useRef(null), backRef = useRef(null), audioRef = useRef(null)
  const idx = PLACES.findIndex((p) => p.id === sel)
  const place = PLACES[idx]
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
    if (music && !leaving) { a.volume = 0; a.play().then(() => fade(0.5)).catch(() => setMusic(false)) }
    else fade(0, () => a.pause())
    return () => cancelAnimationFrame(raf)
  }, [music, leaving])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { if (sel) setSel(null); else onExit() }
      if (sel && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const n = PLACES.length, i = PLACES.findIndex((p) => p.id === sel)
        setSel(PLACES[(i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n].id)
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [sel, onExit])

  const pick = (id) => { playSelect(); setSel(id) }
  const hop = (d) => { playSelect(); setSel(PLACES[(idx + d + PLACES.length) % PLACES.length].id) }
  const go = () => {
    playClick()
    const to = place?.project ? `p:${place.project}` : place?.to
    onExit()
    setTimeout(() => goTo(to), 80)
  }

  // fly the map: scale around the place and park it a third of the way in, leaving room for the note
  const S = 2.4
  const view = place
    ? { transform: `translate(${34 - (place.x / W) * 100 * S}%, ${50 - (place.y / H) * 100 * S}%) scale(${S})` }
    : undefined

  return (
    <div className={`me${leaving ? ' leaving' : ''}${place ? ' zoomed' : ''}`} ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="me-title">
      <audio ref={audioRef} src="/audio/concerning-hobbits.mp3" loop preload="auto" />
      <div className="me-sheet">
        <div className="me-world" style={view}>
          <img src="/images/eggs/middle-earth.webp" alt="" width={W} height={H} decoding="async" draggable="false" />
          <svg viewBox={`0 0 ${W} ${H}`} className="me-layer" role="group" aria-label={t.title}>
            <defs><mask id="me-reveal"><path d={ROUTE} pathLength="1" className="me-reveal" /></mask></defs>
            <path className="me-route" d={ROUTE} pathLength="1" mask="url(#me-reveal)" />
            {PLACES.map((p, i) => (
              <g key={p.id} className={`me-place${sel === p.id ? ' on' : ''}`} style={{ '--d': `${1.2 + i * 0.07}s` }}
                tabIndex={0} role="button" aria-pressed={sel === p.id} aria-label={`${l(p.name, lang)}: ${p.project ? P[p.project].title : l(p.real, lang)}`}
                onClick={() => pick(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p.id) } }}>
                <circle cx={p.x} cy={p.y} r="30" className="hit" />
                <circle cx={p.x} cy={p.y} r="13" className="ring" />
                <circle cx={p.x} cy={p.y} r="6" className="dot" />
                <text x={p.x} y={p.below ? p.y + 46 : p.y - 22} textAnchor="middle" className="me-name">{l(p.name, lang)}</text>
              </g>
            ))}
          </svg>
        </div>

        <header className="me-cartouche">
          <h2 id="me-title">{t.title}</h2>
          <p>{t.sub}</p>
        </header>
        <div className="me-tools">
          {place && <button type="button" className="me-btn" onClick={() => setSel(null)}>{t.all}</button>}
          <button type="button" className="me-btn" aria-pressed={music} onClick={() => setMusic((m) => !m)}>
            {music ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}{t.music}
          </button>
          <button ref={backRef} type="button" className="me-btn" onClick={() => { playClick(); onExit() }}>{t.back}</button>
        </div>

        {!place && <p className="me-hint">{t.pick}</p>}
        {place && (
          <article className="me-note" key={place.id} aria-live="polite">
            <small>{t.stop} {idx + 1} · {l(place.name, lang)}</small>
            <h3>{proj ? proj.title : l(place.real, lang)}</h3>
            <p className="flavor">{l(place.text, lang)}</p>
            <p>{proj ? l(proj.summary, lang) : l(place.more, lang)}</p>
            {proj && <ul className="me-tech">{proj.tech.slice(0, 5).map((x) => <li key={x}>{x}</li>)}</ul>}
            <p className="film">“{l(place.film, lang)}”</p>
            <div className="me-actions">
              {place.id !== 'doom' && <button type="button" className="go" onClick={go}>{t.go}</button>}
              <button type="button" onClick={() => hop(-1)} aria-label={t.prev}>←</button>
              <button type="button" onClick={() => hop(1)}>{t.next} →</button>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
