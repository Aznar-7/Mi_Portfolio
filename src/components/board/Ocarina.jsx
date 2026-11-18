import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '@/contexts/LanguageContext'
import { findSecret, useSecretsFound } from '@/lib/secrets'
import { travel } from '@/lib/motion'
import { SONGS, KEYS, match, preload, playNote, playSong, playCorrect, playError, playSecret, playHey, playStorm, hushNote, playWarp, playEpona, playMusic, fadeOut, hasOcarina, takeOcarina, songsPlayed, markSong } from '@/lib/ocarina'
import '@/styles/ocarina.css'

const OcarinaModel = lazy(() => import('./OcarinaModel'))

// The Ocarina of Time, as a quest. Three secrets in, Navi calls; she leads you to the Stack, where the
// ocarina waits among the tools. Once it is yours, O takes it out: A and the arrows are its five holes,
// and twelve songs from the game do something to the page. The Song of Time opens Hyrule.

const T = {
  es: {
    hey: '¡Hey! ¡Escuchá!', heySub: 'Encontré algo entre las herramientas.', follow: 'Seguir a Navi',
    here: '¡Acá!', take: 'Tomar la ocarina',
    got: 'Conseguiste la Ocarina del Tiempo', gotSub: 'Tocala con A ↓ → ← ↑ o con los botones. La sacás y la guardás con la tecla O.', play: 'Tocar',
    open: 'Sacar la ocarina', close: 'Guardar la ocarina', book: 'Canciones', played: 'tocada', staff: 'Pentagrama', title: 'Ocarina del Tiempo',
    youPlayed: (id) => [`¡Tocaste ${['minuet', 'bolero', 'requiem', 'nocturne', 'prelude'].includes(id) ? 'el' : 'la'} `, '!'],
    songs: { zelda: 'Nana de Zelda', epona: 'Canción de Epona', saria: 'Canción de Saria', sun: 'Canción del Sol', time: 'Canción del Tiempo', storms: 'Canción de las Tormentas', minuet: 'Minueto del Bosque', bolero: 'Bolero del Fuego', serenade: 'Serenata del Agua', requiem: 'Réquiem del Espíritu', nocturne: 'Nocturno de la Sombra', prelude: 'Preludio de la Luz' },
    does: { zelda: 'Muestra las pistas de los secretos', epona: 'Te lleva a galope hasta Contacto', saria: 'El bosque crece sobre el cobre', sun: 'Amanece, o vuelve la noche', time: 'Abre el Templo del Tiempo', storms: 'Se larga a llover', minuet: 'Viaja a Proyectos', bolero: 'Viaja al Stack', serenade: 'Viaja a Experiencia', requiem: 'Viaja a Sobre mí', nocturne: 'Viaja a la Consola', prelude: 'Vuelve al inicio' },
  },
  en: {
    hey: 'Hey! Listen!', heySub: 'I found something among the tools.', follow: 'Follow Navi',
    here: 'Here!', take: 'Take the ocarina',
    got: 'You got the Ocarina of Time', gotSub: 'Play it with A ↓ → ← ↑ or the buttons. The O key takes it out and puts it away.', play: 'Play',
    open: 'Take out the ocarina', close: 'Put the ocarina away', book: 'Songs', played: 'played', staff: 'Staff', title: 'Ocarina of Time',
    youPlayed: () => ['You played ', '!'],
    songs: { zelda: "Zelda's Lullaby", epona: "Epona's Song", saria: "Saria's Song", sun: "Sun's Song", time: 'Song of Time', storms: 'Song of Storms', minuet: 'Minuet of Forest', bolero: 'Bolero of Fire', serenade: 'Serenade of Water', requiem: 'Requiem of Spirit', nocturne: 'Nocturne of Shadow', prelude: 'Prelude of Light' },
    does: { zelda: 'Shows the hints for the secrets', epona: 'Gallops you to Contact', saria: 'The forest grows over the copper', sun: 'Dawn breaks, or night comes back', time: 'Opens the Temple of Time', storms: 'It starts to rain', minuet: 'Warps to Projects', bolero: 'Warps to the Stack', serenade: 'Warps to Experience', requiem: 'Warps to About', nocturne: 'Warps to the Console', prelude: 'Back to the top' },
  },
}

// staff lines, top to bottom, as in the game; and the buttons in the controller's order
const ROW = { up: 0, left: 1, right: 2, down: 3, a: 4 }
const BUTTONS = ['a', 'down', 'right', 'left', 'up']
const ARROW = { up: 'M6 2.5 10 9H2z', down: 'M6 9.5 10 3H2z', left: 'M2.5 6 9 2v8z', right: 'M9.5 6 3 2v8z' }
// the six warp songs and where (and in which light) they land
const WARP = { minuet: ['trabajo', '120,210,120'], bolero: ['taller', '240,110,60'], serenade: ['trayectoria', '90,150,255'], requiem: ['sobre', '245,170,70'], nocturne: ['consola', '170,110,230'], prelude: ['top', '250,225,120'] }

export function Note({ n }) {
  return (
    <span className={`oc-note ${n === 'a' ? 'oc-a' : 'oc-c'}`}>
      {n === 'a' ? 'A' : <svg viewBox="0 0 12 12" aria-hidden="true"><path d={ARROW[n]} /></svg>}
    </span>
  )
}

const OcarinaIcon = () => (
  <svg viewBox="0 0 40 28" aria-hidden="true">
    <path d="M4 15c0-6 7-10 16-10s16 4 16 9-6 9-15 9c-3 0-5 1-8 3-2 1-4 0-4-2l1-3C6 20 4 18 4 15z" className="oc-body" />
    <path d="M30 8l6-4" className="oc-mouth" />
    {[[14, 12], [20, 11], [26, 12], [17, 18]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.8" className="oc-hole" />)}
  </svg>
)

// what each song does to the page; returns a cleanup for timed effects
function perform(id, setFx) {
  const palette = (p) => document.dispatchEvent(new CustomEvent('board:palette', { detail: p }))
  if (WARP[id]) {
    const [to, rgb] = WARP[id]
    playWarp(); setFx({ kind: 'warp', rgb })
    setTimeout(() => travel(document.getElementById(to), 70), 650)
    setTimeout(() => setFx(null), 2000)
    return
  }
  const root = document.documentElement
  switch (id) {
    case 'time':
      setFx({ kind: 'time' })
      setTimeout(() => { document.dispatchEvent(new CustomEvent('open-hyrule')); setFx(null) }, 1500)
      break
    case 'sun': {
      const dawn = !root.classList.contains('dawn')
      root.classList.toggle('dawn', dawn); palette(dawn ? 'dawn' : null)
      break
    }
    case 'saria':
      palette('forest')
      setTimeout(() => palette(root.classList.contains('dawn') ? 'dawn' : null), 20000)
      break
    case 'storms':
      playStorm(14); setFx({ kind: 'storm' })
      setTimeout(() => setFx((f) => (f?.kind === 'storm' ? null : f)), 14000)
      break
    case 'zelda':
      document.getElementById('eggs-pop')?.showPopover?.()
      break
    case 'epona':
      playEpona()
      travel(document.getElementById('contacto'), 70)
      break
  }
  // an event that opens something gets the secret chime, as in the game
  if (['time', 'zelda', 'sun', 'saria', 'storms'].includes(id)) playSecret()
}

// a light rain drawn on a canvas; lightning is a CSS flash on the layer
function Rain() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, x = c.getContext('2d')
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const fit = () => { c.width = innerWidth; c.height = innerHeight }
    fit(); addEventListener('resize', fit)
    const drops = Array.from({ length: 220 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, v: 14 + Math.random() * 10, l: 10 + Math.random() * 16 }))
    let raf = 0
    const frame = () => {
      x.clearRect(0, 0, c.width, c.height)
      x.strokeStyle = 'rgba(190,210,235,.35)'; x.lineWidth = 1; x.beginPath()
      for (const d of drops) {
        x.moveTo(d.x, d.y); x.lineTo(d.x - d.l * 0.18, d.y + d.l)
        d.y += d.v; d.x -= d.v * 0.18
        if (d.y > c.height) { d.y = -20; d.x = Math.random() * (c.width + 200) }
      }
      x.stroke()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit) }
  }, [])
  return <canvas className="oc-rain" ref={ref} aria-hidden="true" />
}

export function Ocarina() {
  const { lang } = useLang()
  const t = T[lang] ?? T.es
  const found = useSecretsFound()
  const [has, setHas] = useState(hasOcarina)
  const [stage, setStage] = useState(null) // null | 'call' | 'lead' | 'get'
  const [open, setOpen] = useState(false)
  const [book, setBook] = useState(false)
  const [staff, setStaff] = useState([])
  const [song, setSong] = useState(null) // the one being answered
  const [played, setPlayed] = useState(songsPlayed)
  const [fx, setFx] = useState(null)
  const busy = useRef(false), timers = useRef([])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Navi shows up once the visitor has proved curious: three secrets
  useEffect(() => {
    if (has || stage || found.size < 3) return
    preload()
    const id = setTimeout(() => { setStage('call'); playHey() }, 1200)
    return () => clearTimeout(id)
  }, [has, stage, found.size])

  const follow = () => { playHey(); setStage('lead'); travel(document.getElementById('taller'), 70) }
  const take = () => { setStage('get'); playMusic('getocarina') }
  const start = () => { takeOcarina(); setHas(true); setStage(null); findSecret('ocarina'); setOpen(true) }

  // the staff lives in a ref so a note is handled exactly once; state only draws it
  const notes = useRef([])
  const draw = (next) => { notes.current = next; setStaff(next) }
  // a little note rises from the ocarina on every breath
  const [floats, setFloats] = useState([])
  const rise = () => {
    const id = Math.random()
    setFloats((f) => [...f, { id, x: Math.random() * 60 - 30 }])
    later(() => setFloats((f) => f.filter((o) => o.id !== id)), 1400)
    document.dispatchEvent(new Event('ocarina:note'))
  }
  const [lit, setLit] = useState(-1) // which note of the answered song is sounding
  const blow = useCallback((n) => {
    if (busy.current) return
    playNote(n); rise()
    const next = [...notes.current, n].slice(-8)
    draw(next)
    const m = match(next)
    if (m) {
      busy.current = true
      markSong(m.id); setPlayed(songsPlayed())
      // the game's order: the last note settles, the 'correct' jingle, then the song plays back, then the effect
      hushNote(0.35); playCorrect()
      later(() => {
        draw(m.notes); setSong(m.id); setLit(-1)
        // the song as the game plays it back: the full phrase with its accompaniment. If the file
        // fails, the ocarina samples replay the notes instead.
        const track = playMusic(m.id)
        const go = (secs) => {
          const total = secs * 1000, span = Math.min(total * 0.6, 4500)
          m.notes.forEach((_, i) => later(() => { setLit(i); rise() }, (i / m.notes.length) * span))
          // warps leave while the song is still sounding, as in the game; the rest wait for its end
          later(() => {
            if (m.id === 'time') { findSecret('hyrule'); fadeOut(track) }
            perform(m.id, setFx)
            busy.current = false; setSong(null); setLit(-1); draw([])
          }, (WARP[m.id] ? Math.min(total, 6500) : total) + 300)
        }
        track.addEventListener('loadedmetadata', () => go(track.duration), { once: true })
        track.addEventListener('error', () => go(playSong(m).dur), { once: true })
      }, 1300)
    } else if (next.length === 8) later(() => { if (notes.current === next) { playError(); draw([]) } }, 700)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- later/rise/draw only touch refs and setters

  // keys: O takes it out and puts it away; while it is out, A and the arrows are the holes
  useEffect(() => {
    if (!has) return
    const onKey = (e) => {
      if (e.target instanceof Element && e.target.matches('input, textarea, [contenteditable]')) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'o') { setOpen((o) => !o); return }
      if (!open) return
      if (k === 'escape') { setOpen(false); return }
      const n = KEYS[k]
      if (n && !e.repeat) { e.preventDefault(); blow(n) }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [has, open, blow])
  // the Konami code shares the arrows: it waits while the ocarina is out
  useEffect(() => {
    if (open) preload()
    if (open) document.body.dataset.ocarina = '1'
    else delete document.body.dataset.ocarina
  }, [open])

  const taller = typeof document !== 'undefined' ? document.getElementById('taller') : null

  return (
    <>
      {stage === 'call' && (
        <div className="oc-navi-call" role="dialog" aria-label="Navi">
          <span className="oc-navi" aria-hidden="true" />
          <div className="oc-bubble">
            <b>{t.hey}</b><span>{t.heySub}</span>
            <button type="button" onClick={follow}>{t.follow}</button>
          </div>
        </div>
      )}
      {stage === 'lead' && taller && createPortal(
        <div className="oc-hide">
          <span className="oc-navi small" aria-hidden="true" />
          <span className="oc-here" aria-hidden="true">{t.here}</span>
          <button type="button" className="oc-glint" onClick={take} aria-label={t.take}><OcarinaIcon /></button>
        </div>, taller)}
      {stage === 'get' && (
        <div className="oc-get" role="dialog" aria-modal="true" aria-labelledby="oc-get-t">
          <div className="oc-rays" aria-hidden="true" />
          <Suspense fallback={<div className="oc-model" />}><OcarinaModel /></Suspense>
          <h2 id="oc-get-t">{t.got}</h2>
          <p>{t.gotSub}</p>
          <button type="button" className="btn" onClick={start} autoFocus>{t.play}</button>
        </div>
      )}

      {has && !open && (
        <button type="button" className="oc-toggle" onClick={() => setOpen(true)} aria-label={t.open} title={`${t.open} (O)`}><OcarinaIcon /></button>
      )}
      {has && open && <div className={`oc-haze${song ? ' on' : ''}`} aria-hidden="true" />}
      {has && open && (
        <div className={`oc-panel${song ? ' sung' : ''}`} role="group" aria-label="Ocarina">
          <div className="oc-held" aria-hidden="true">
            <Suspense fallback={null}><OcarinaModel mode="play" /></Suspense>
            {floats.map((f) => <svg key={f.id} className="oc-float" style={{ '--dx': `${f.x}px` }} viewBox="0 0 16 22"><path d="M6 17.5a3.5 3 0 1 1-1-2.3V2l9 3v4l-7.5-2.4z" /></svg>)}
          </div>
          {book && (
            <ul className="oc-book">
              {SONGS.map((s) => (
                <li key={s.id} className={played.has(s.id) ? 'done' : ''}>
                  <b>{t.songs[s.id]}</b>
                  <span className="oc-row">{s.notes.map((n, i) => <Note key={i} n={n} />)}</span>
                  <small>{t.does[s.id]}{played.has(s.id) && ` · ${t.played}`}</small>
                </li>
              ))}
            </ul>
          )}
          <div className="oc-sheet">
            <i className="oc-corner tl" /><i className="oc-corner tr" /><i className="oc-corner bl" /><i className="oc-corner br" />
            <p className="oc-head" aria-live="polite">
              {song ? <>{t.youPlayed(song)[0]}<em>{t.songs[song]}</em>{t.youPlayed(song)[1]}</> : t.title}
            </p>
            <div className="oc-staff" aria-label={t.staff}>
              <svg className="oc-clef" viewBox="0 0 24 64" aria-hidden="true"><path d="M13.5 62c-3 0-5-2-5-4.5s2-3.5 3.5-3.5 2.5 1 2.5 2.3-1 2.2-2 2.2c.6 1 1.6 1.6 2.8 1.6 2.4 0 3.5-2 3.2-5L16 25c4-4 7-9 7-14 0-5-2-9-4.5-9-3.5 0-6 7-6 13 0 2 .3 4 .7 6C7 26 2 31 2 38c0 7 5 12 12 12 1 0 2-.1 3-.4l1 4.5c.6 3.5-.7 7.9-4.5 7.9zM17.2 13.5c.2-4 1.2-7 2-7 1 0 1.5 1.6 1.5 3.6 0 3.7-2 7-4.7 9.8-.2-1.8-.2-3.8.2-6.4zM15 46.6c-.7.2-1.4.3-2 .3-4.6 0-7.8-3.4-7.8-8 0-5 3.5-8.6 8.4-12l1.2 6c-3 .8-5 3-5 5.6 0 2.4 1.6 4.3 3.4 4.8-1-.8-1.6-2-1.6-3.3 0-2 1.4-3.6 3.5-4z" /></svg>
              {[0, 1, 2, 3, 4].map((i) => <i key={i} className="oc-line" style={{ '--r': i }} />)}
              {staff.map((n, i) => <span key={`${song ?? ''}${i}`} className={`oc-slot${song && i <= lit ? ' lit' : ''}`} style={{ '--x': i, '--r': ROW[n] }}><Note n={n} /></span>)}
            </div>
          </div>
          <div className="oc-keys">
            {BUTTONS.map((n) => (
              <button key={n} type="button" className={`oc-key ${n}`} onPointerDown={(e) => { e.preventDefault(); blow(n) }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); blow(n) } }} aria-label={n === 'a' ? 'A' : `C ${n}`}>
                <Note n={n} />
              </button>
            ))}
            <button type="button" className={`oc-tab${book ? ' on' : ''}`} onClick={() => setBook((b) => !b)} aria-expanded={book}>{t.book}</button>
            <button type="button" className="oc-tab" onClick={() => setOpen(false)} aria-label={t.close}>×</button>
          </div>
        </div>
      )}

      {fx?.kind === 'warp' && <div className="oc-warp" style={{ '--rgb': fx.rgb }} aria-hidden="true" />}
      {fx?.kind === 'time' && <div className="oc-time" aria-hidden="true" />}
      {fx?.kind === 'storm' && <div className="oc-storm" aria-hidden="true"><Rain /></div>}
    </>
  )
}
