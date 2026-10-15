import { useEffect, useRef, useState } from 'react'
import { useSoundEffects } from '@/contexts/SoundContext'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { site } from '@/data/site'
import { travel } from '@/lib/motion'
import { powerOn } from '@/lib/power'
import { useSecretsFound, SECRETS } from '@/lib/secrets'

// Chip: the board's resident, floating in the corner once you leave the hero. A chip package with
// copper legs and LED eyes that follow the pointer. It drops one short tip per section (mutable),
// reacts to the console, cheers secrets, and its menu does the useful things: jump to a section,
// a guided tour, copy the email, the CV, sound, language, a hint and the OS.

const C = {
  es: {
    hello: '¡Hola! Soy Chip. Tocame si necesitás algo.',
    go: 'Llevame a…', tour: 'Recorrido guiado', next: 'Siguiente', stop: 'Terminar',
    mail: 'Copiar mail', copied: '¡Copiado! Te espera.', cv: 'Bajar CV', sound: (m) => (m ? 'Activar sonido' : 'Silenciar sonido'),
    lang: 'English', hint: 'Una pista', os: 'Abrir el OS', quiet: 'Chip, callate un rato', talk: 'Chip, podés hablar',
    secrets: (n, t) => `Secretos: ${n} de ${t}`, close: 'Cerrar',
    happy: '¡Eso!', confused: '¿Eh? Probá help.', secret: '¡Encontraste un secreto!',
    tips: {
      trabajo: 'Usá ↑ ↓ en la lista para recorrer los proyectos.',
      proceso: 'Seguí bajando: los paneles avanzan solos.',
      sobre: 'Ese calendario sale de GitHub, en vivo.',
      taller: 'Pasá por una herramienta y se iluminan los proyectos.',
      trayectoria: 'A la izquierda el año, a la derecha qué hizo.',
      contacto: 'Completá la carta: le llega al instante.',
      consola: 'Probá escribir help acá abajo.',
    },
    tourSteps: [
      ['trabajo', 'Acá están los proyectos. Elegí uno de la lista y mirá el detalle.'],
      ['proceso', 'Así trabaja: del problema a producción, con un caso real por etapa.'],
      ['sobre', 'Quién es, qué está construyendo ahora y su actividad en GitHub.'],
      ['taller', 'Su stack, conectado a los proyectos donde lo usó.'],
      ['trayectoria', 'Dónde trabajó y qué estudia.'],
      ['contacto', 'Y si te gustó: escribile. Responde en el día.'],
    ],
    hints: ['Dicen que una palabra élfica abre una puerta en la consola…', 'Si tocás los seis chips de arriba, pasa algo.', 'Psst: ↑ ↑ ↓ ↓ ← → ← → B A', 'Hay un botón que vuelve al pasado.', 'Probá orden 66 en la consola.'],
  },
  en: {
    hello: 'Hi! I am Chip. Tap me if you need anything.',
    go: 'Take me to…', tour: 'Guided tour', next: 'Next', stop: 'End tour',
    mail: 'Copy email', copied: 'Copied! He is waiting.', cv: 'Get CV', sound: (m) => (m ? 'Sound on' : 'Mute sound'),
    lang: 'Español', hint: 'A hint', os: 'Open the OS', quiet: 'Chip, quiet for now', talk: 'Chip, you can talk',
    secrets: (n, t) => `Secrets: ${n} of ${t}`, close: 'Close',
    happy: 'Nice!', confused: 'Huh? Try help.', secret: 'You found a secret!',
    tips: {
      trabajo: 'Use ↑ ↓ in the list to walk the projects.',
      proceso: 'Keep scrolling: the panels move on their own.',
      sobre: 'That calendar comes from GitHub, live.',
      taller: 'Hover a tool and its projects light up.',
      trayectoria: 'The year on the left, what he did on the right.',
      contacto: 'Fill in the letter: it reaches him instantly.',
      consola: 'Try typing help down here.',
    },
    tourSteps: [
      ['trabajo', 'Here are the projects. Pick one from the list and see the detail.'],
      ['proceso', 'How he works: problem to production, a real case per stage.'],
      ['sobre', 'Who he is, what he is building now and his GitHub activity.'],
      ['taller', 'His stack, wired to the projects where he used it.'],
      ['trayectoria', 'Where he has worked and what he studies.'],
      ['contacto', 'And if you liked it: write to him. He replies within the day.'],
    ],
    hints: ['They say an Elvish word opens a door in the console…', 'Click the six chips up top and something happens.', 'Psst: ↑ ↑ ↓ ↓ ← → ← → B A', 'There is a button that goes back in time.', 'Try order 66 in the console.'],
  },
}
const QUIET_KEY = 'chip-quiet'

export function Mascot() {
  const { lang, toggle } = useLang()
  const nav = copy[lang].nav
  const t = C[lang] ?? C.es
  const { playSelect, playClick, isMuted, toggleMute } = useSoundEffects()
  const found = useSecretsFound()
  const ref = useRef(null)
  const [look, setLook] = useState([0, 0])
  const [blink, setBlink] = useState(false)
  const [say, setSay] = useState(null)
  const [state, setState] = useState('idle') // idle | typing | happy | confused
  const [menu, setMenu] = useState(false)
  const [tour, setTour] = useState(-1)
  const [shown, setShown] = useState(false) // floats in once the hero is behind
  const [quiet, setQuiet] = useState(() => { try { return localStorage.getItem(QUIET_KEY) === '1' } catch { return false } })
  const timer = useRef(0), hintN = useRef(0), seen = useRef(new Set()), busy = useRef(false)
  useEffect(() => { busy.current = menu || tour >= 0 }, [menu, tour])

  const speak = (text, st = 'idle', ms = 3600) => {
    setSay(text); setState(st)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { if (!busy.current) setSay(null); setState('idle') }, ms)
  }

  // eyes follow the pointer, a few pixels at most
  useEffect(() => {
    let raf = 0
    const move = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect(); if (!r) return
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.42), d = Math.hypot(dx, dy) || 1
        const k = Math.min(1, d / 260)
        setLook([(dx / d) * 3.2 * k, (dy / d) * 2.6 * k])
      })
    }
    addEventListener('pointermove', move, { passive: true })
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf) }
  }, [])

  // blink every few seconds
  useEffect(() => {
    let tm
    const loop = () => { tm = setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 140); loop() }, 2600 + Math.random() * 3200) }
    loop()
    return () => clearTimeout(tm)
  }, [])

  // show up after the hero; one short tip the first time each section comes into view
  useEffect(() => {
    const hero = document.getElementById('top')
    const ioHero = new IntersectionObserver(([e]) => setShown(!e.isIntersecting), { threshold: 0.15 })
    if (hero) ioHero.observe(hero)
    const ioSec = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = e.target.id
        if (!e.isIntersecting || seen.current.has(id)) continue
        seen.current.add(id)
        // on phones a tip would sit on top of what you are reading; the menu still has everything
        if (!quiet && !busy.current && innerWidth > 700 && t.tips[id]) speak(t.tips[id], 'idle', 4200)
      }
    }, { threshold: 0.35 })
    for (const id of Object.keys(C.es.tips)) { const el = document.getElementById(id); if (el) ioSec.observe(el) }
    return () => { ioHero.disconnect(); ioSec.disconnect() }
  }, [quiet, lang]) // eslint-disable-line react-hooks/exhaustive-deps -- speak only sets state

  // react to the console ('chip' events) and to secrets found anywhere
  useEffect(() => {
    const onChip = (e) => {
      const kind = e.detail
      if (kind === 'typing') { setState('typing'); clearTimeout(timer.current); timer.current = setTimeout(() => setState('idle'), 900); return }
      speak(t[kind] ?? null, kind, 2600)
    }
    const onSecret = (e) => { if (e.detail.fresh) speak(t.secret, 'happy', 3000) }
    document.addEventListener('chip', onChip)
    document.addEventListener('secret', onSecret)
    return () => { document.removeEventListener('chip', onChip); document.removeEventListener('secret', onSecret) }
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps -- speak only sets state
  useEffect(() => () => clearTimeout(timer.current), [])

  const close = () => { setMenu(false); setSay(null); setState('idle') }
  const poke = () => { playSelect(); if (menu || tour >= 0) { setTour(-1); close() } else { setMenu(true); setSay(t.hello); setState('happy') } }
  const goTo = (id) => { playClick(); close(); travel(document.getElementById(id), 70) }
  const step = (i) => {
    if (i >= t.tourSteps.length) { setTour(-1); close(); return }
    const [id, line] = t.tourSteps[i]
    setMenu(false); setTour(i); setSay(line); setState('happy')
    travel(document.getElementById(id), 70)
  }
  const copyMail = async () => {
    playClick()
    try { await navigator.clipboard.writeText(site.email); setSay(t.copied); setState('happy') } catch { setSay(site.email) }
  }
  const hint = () => { playClick(); setSay(t.hints[hintN.current++ % t.hints.length]); setState('happy') }
  const toggleQuiet = () => {
    const q = !quiet; setQuiet(q)
    try { localStorage.setItem(QUIET_KEY, q ? '1' : '0') } catch { /* fine, it resets */ }
  }
  const cv = site.resumes[lang === 'en' ? 'en' : 'es']

  const [lx, ly] = state === 'typing' ? [-2.6, 2.2] : look
  return (
    <div className={`chip-pet ${state}${shown || menu || tour >= 0 ? ' shown' : ''}`} ref={ref}>
      {(say || menu || tour >= 0) && (
        <div className="chip-say" role="status">
          {say && <p>{say}</p>}
          {tour >= 0 && (
            <div className="chip-menu">
              <span className="chip-step">{tour + 1} / {t.tourSteps.length}</span>
              <button type="button" onClick={() => step(tour + 1)}>{tour + 1 < t.tourSteps.length ? t.next : t.stop}</button>
              {tour + 1 < t.tourSteps.length && <button type="button" onClick={() => step(t.tourSteps.length)}>{t.stop}</button>}
            </div>
          )}
          {menu && (
            <>
              <p className="chip-label">{t.go}</p>
              <div className="chip-menu">
                {['trabajo', 'sobre', 'taller', 'trayectoria', 'contacto', 'consola'].map((id) => <button key={id} type="button" onClick={() => goTo(id)}>{nav[id]}</button>)}
              </div>
              <div className="chip-menu">
                <button type="button" className="strong" onClick={() => step(0)}>{t.tour}</button>
                <button type="button" onClick={copyMail}>{t.mail}</button>
                <a href={cv.url} download={cv.filename} onClick={playClick}>{t.cv}</a>
              </div>
              <div className="chip-menu">
                <button type="button" onClick={hint}>{t.hint}</button>
                <button type="button" onClick={() => { close(); powerOn() }}>{t.os}</button>
                <button type="button" onClick={toggleMute}>{t.sound(isMuted)}</button>
                <button type="button" onClick={toggle}>{t.lang}</button>
                <button type="button" onClick={toggleQuiet}>{quiet ? t.talk : t.quiet}</button>
              </div>
              <p className="chip-foot">{t.secrets(found.size, SECRETS.length)}<button type="button" className="x" onClick={close} aria-label={t.close}>×</button></p>
            </>
          )}
        </div>
      )}
      <button type="button" className="chip-body" onClick={poke} aria-expanded={menu} aria-label={lang === 'es' ? 'Chip, el asistente del sitio. Abrir su menú.' : 'Chip, the site assistant. Open its menu.'}>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <path d="M60 22 V10" className="ant" /><circle cx="60" cy="8" r="4" className="led" />
          {[38, 52, 66, 80].map((y) => <g key={y}><rect x="14" y={y} width="12" height="6" rx="1.5" className="leg" /><rect x="94" y={y} width="12" height="6" rx="1.5" className="leg" /></g>)}
          <rect x="24" y="22" width="72" height="76" rx="12" className="pkg" />
          <circle cx="34" cy="32" r="2.2" className="dot" />
          <g className="eyes" transform={`translate(${lx.toFixed(2)} ${ly.toFixed(2)})`}>
            {state === 'happy'
              ? <><path d="M42 58 q6 -7 12 0" className="eye-arc" /><path d="M66 58 q6 -7 12 0" className="eye-arc" /></>
              : <><rect x="43" y={blink ? 56 : 50} width="10" height={blink ? 2 : 13} rx="5" className="eye" /><rect x="67" y={blink ? 56 : 50} width="10" height={blink ? 2 : 13} rx="5" className="eye" /></>}
          </g>
          {state === 'confused' ? <path d="M50 80 q5 -4 10 0 q5 4 10 0" className="mouth" />
            : state === 'happy' ? <path d="M50 76 q10 10 20 0" className="mouth" />
            : state === 'typing' ? <rect x="55" y="77" width="10" height="4" rx="2" className="mouth-fill" />
            : <path d="M53 78 q7 4 14 0" className="mouth" />}
          <circle cx="40" cy="72" r="4" className="blush" /><circle cx="80" cy="72" r="4" className="blush" />
        </svg>
      </button>
    </div>
  )
}
