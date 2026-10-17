import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Segments } from './Segments'

// three.js and the car only load when someone actually hits 88 mph
import { setSith } from '@/lib/sith'
const DeLorean3D = lazy(() => import('./DeLorean3D'))
const Order66_3D = lazy(() => import('./Order66_3D'))
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { useSoundEffects } from '@/contexts/SoundContext'

// How long each scene holds the stage, in ms
// scenes that lead somewhere when they end
const NEXT = { mellon: 'open-middle-earth', mph: 'open-retro' }
const HOLD = { mellon: 4200, order66: 9200, mph: 6800, placa: 2200, hire: 2600, mate: 45000 }
// scenes with a soundtrack (the visitor's sound setting still applies)
// mph uses a recorded time-travel effect: its boom sits at 10.6 s, so starting at 7.8 s lands it on 88
const MUSIC = { order66: { src: '/audio/imperial-march.mp3', vol: 0.55 }, mph: { src: '/audio/bttf-travel.mp3', from: 7.8, vol: 0.75 } }

const pad = (n) => String(n).padStart(2, '0')
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
function stamp(d) {
  const h = d.getHours() % 12 || 12
  return { mon: MONTHS[d.getMonth()], day: pad(d.getDate()), year: d.getFullYear(), ampm: d.getHours() < 12 ? 'AM' : 'PM', hour: pad(h), min: pad(d.getMinutes()) }
}

// The Doors of Durin, drawn line by line in ithildin. Each leaf is its own layer carrying its half of
// the emblem, so the doors swing open on their hinges in 3D and we walk through into the light.
function Durin() {
  const star8 = (cx, cy, r) => Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI / 8) * i - Math.PI / 2, rr = i % 2 ? r * .42 : r
    return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`
  }).join(' ')
  const small = (cx, cy) => star8(cx, cy, 5)
  const emblem = (
    <>
      <g className="sigil">
        <circle pathLength="1" cx="200" cy="290" r="46" />
        <polygon pathLength="1" points={star8(200, 290, 40)} />
        {/* crown and the seven stars */}
        <path pathLength="1" d="M176 214 l8 -16 l8 12 l8 -18 l8 18 l8 -12 l8 16 z" />
        {[[150, 220], [160, 196], [178, 180], [200, 174], [222, 180], [240, 196], [250, 220]].map(([x, y]) => <polygon key={x} pathLength="1" points={small(x, y)} />)}
        {/* hammer and anvil */}
        <path pathLength="1" d="M180 384 h40 l-8 10 h-24 z M194 394 v14 h12 v-14 M206 370 l12 -12 M214 354 l10 10" />
      </g>
      <path className="arcband" pathLength="1" d="M70 250 A132 132 0 0 1 330 250" />
    </>
  )
  const leaf = (side) => (
    <div className={`leaf ${side}`}>
      <svg viewBox="0 0 400 520" aria-hidden="true">
        <defs><clipPath id={`durin-${side}`}><rect x={side === 'left' ? 0 : 200} width="200" height="520" /></clipPath></defs>
        <path className="slab" d={side === 'left' ? 'M200 500 V140 A140 140 0 0 0 60 260 V500 Z' : 'M200 500 V140 A140 140 0 0 1 340 260 V500 Z'} />
        {side === 'left' ? (
          <>
            <path pathLength="1" d="M200 500 V140 A140 140 0 0 0 60 260 V500" />
            <path pathLength="1" d="M84 500 V262 A116 116 0 0 1 200 162" />
            {/* holly tree climbing the pillar */}
            <path pathLength="1" d="M72 500 V300 M72 330 q-14 -20 -6 -40 M72 360 q16 -18 10 -40 M72 300 q-6 -22 6 -40 q12 -14 30 -24" />
            <path pathLength="1" d="M60 500 h40 M60 492 h40" />
          </>
        ) : (
          <>
            <path pathLength="1" d="M200 500 V140 A140 140 0 0 1 340 260 V500" />
            <path pathLength="1" d="M316 500 V262 A116 116 0 0 0 200 162" />
            <path pathLength="1" d="M328 500 V300 M328 330 q14 -20 6 -40 M328 360 q-16 -18 -10 -40 M328 300 q6 -22 -6 -40 q-12 -14 -30 -24" />
            <path pathLength="1" d="M300 500 h40 M300 492 h40" />
          </>
        )}
        <g clipPath={`url(#durin-${side})`}>{emblem}</g>
      </svg>
    </div>
  )
  return (
    <div className="durin">
      <span className="beyond" />
      {leaf('left')}
      {leaf('right')}
    </div>
  )
}


const LAST = { mon: 'OCT', day: '26', year: 1985, ampm: 'AM', hour: '01', min: '21' }
// "Volver al pasado": the day Windows 95 shipped
const PAST = { mon: 'AUG', day: '24', year: 1995, ampm: 'AM', hour: '09', min: '00' }

function Row({ label, d, kind, flip }) {
  return (
    <div className={`tc-row ${kind}${flip ? ' flip' : ''}`}>
      <div className="tc-cells">
        <span className="tc-cell"><small>MONTH</small><Segments text={d.mon} alpha /></span>
        <span className="tc-cell"><small>DAY</small><Segments text={d.day} /></span>
        <span className="tc-cell"><small>YEAR</small><Segments text={String(d.year)} /></span>
        <span className="tc-ampm"><small>AM</small><i className={d.ampm === 'AM' ? 'on' : ''} /><small>PM</small><i className={d.ampm === 'PM' ? 'on' : ''} /></span>
        <span className="tc-cell"><small>HOUR</small><Segments text={d.hour} /></span>
        <span className="tc-colon"><i /><i /></span>
        <span className="tc-cell"><small>MIN</small><Segments text={d.min} /></span>
      </div>
      <em>{label}</em>
    </div>
  )
}

// 88 mph: the speedo climbs, the car breaks through at 88, and the circuits show the jump:
// present becomes 24 Aug 1995 (the day Windows 95 shipped) and "last departed" the visitor's real now.
function MphScene({ T, now, dest }) {
  const [mph, setMph] = useState(0)
  const [jumped, setJumped] = useState(false)
  const [start] = useState(() => performance.now())
  const raf = useRef(0)
  useEffect(() => {
    const tick = () => {
      // performance.now, the same clock the 3D car reads
      const k = Math.min(1, (performance.now() - start) / 2600)
      setMph(Math.round(88 * (1 - (1 - k) ** 2.2)))
      if (k < 1) raf.current = requestAnimationFrame(tick)
      else setTimeout(() => setJumped(true), 120)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [start])
  const present = stamp(now)
  const charge = mph / 88 // the flux capacitor and the arcs build with the speed
  return (
    <>
      {/* the flux capacitor: three tubes pulsing into the center, faster as the car speeds up */}
      <svg className={`flux${jumped ? ' gone' : ''}`} viewBox="0 0 200 180" style={{ '--flux': `${Math.max(0.12, 0.9 - charge * 0.78)}s` }} aria-hidden="true">
        <rect x="6" y="6" width="188" height="168" rx="10" className="flux-box" />
        {['M40 30 L100 96', 'M160 30 L100 96', 'M100 160 L100 96'].map((d) => <path key={d} d={d} className="flux-tube" />)}
        {['M40 30 L100 96', 'M160 30 L100 96', 'M100 160 L100 96'].map((d) => <path key={'g' + d} d={d} className="flux-glow" pathLength="1" />)}
        <circle cx="100" cy="96" r="9" className="flux-core" style={{ opacity: 0.35 + charge * 0.65 }} />
      </svg>
      {charge > 0.6 && !jumped && (
        <svg className="arcs" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2 30 L8 34 L5 40 L11 46 L7 52" /><path d="M98 62 L92 66 L95 72 L89 77 L93 84" /><path d="M30 98 L34 92 L40 95 L45 89 L52 93" />
        </svg>
      )}
      <Suspense fallback={null}><DeLorean3D start={start} /></Suspense>
      <p className="egg-credit">DeLorean 3D: <a href="https://poly.pizza/m/1uZKezeldGG" target="_blank" rel="noopener noreferrer">DeLorean DMC-12</a> · David Sirera, <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a>, vía Poly Pizza</p>
      <div className={`speedo${jumped ? ' gone' : ''}`}>
        <Segments text={String(mph).padStart(2, '0')} />
        <b>MPH</b>
      </div>
      {jumped && <><span className="flash" /><span className="flame one" /><span className="flame two" /><span className="plate" aria-hidden="true">OUTATIME</span></>}
      <div className={`circuits${jumped ? ' in' : ''}`}>
        <Row label={T.dest} d={dest} kind="dest" />
        <Row label={T.pres} d={jumped ? dest : present} kind="pres" flip={jumped} />
        <Row label={T.last} d={jumped ? present : LAST} kind="last" flip={jumped} />
      </div>
    </>
  )
}

// Order 66, staged like the film: a holo transmission gives the order over the board (three.js), it
// cuts out, and blaster fire tears through while the board turns red.
function Order66({ T }) {
  const order = [...T.order66b]
  return (
    <>
      <div className="o66-tx">
        <p className="o66-from">{T.o66from}</p>
        <p className="o66-order" aria-label={T.order66b}>
          {order.map((ch, i) => <span key={i} style={{ '--i': i }}>{ch}</span>)}
        </p>
        <p className="o66-reply">{T.o66reply}</p>
      </div>
      <Suspense fallback={null}><Order66_3D /></Suspense>
      <p className="egg-credit">Holograma: <a href="https://poly.pizza/m/97m_4VkXpmo" target="_blank" rel="noopener noreferrer">Tie Fighter 1 V1</a> · Joe Scalise, <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a> via Poly Pizza</p>
      <p className="egg-caption sith o66-end">{T.o66end}</p>
    </>
  )
}

// The mate: the thermos pours, and you can ask for another. After five the yerba is washed out
// and gets changed, as it should.
function MateScene({ T, onClose }) {
  const { playEgg, playClick } = useSoundEffects()
  const [n, setN] = useState(1)
  const fresh = n % 5 === 0
  const another = () => { playClick(); playEgg('mate'); setN((x) => x + 1) }
  return (
    <div className="mate" role="dialog" aria-label={T.mate}>
      <svg key={n} viewBox="0 0 220 200" aria-hidden="true">
        <g className="termo">
          <rect x="128" y="10" width="34" height="96" rx="9" className="termo-body" />
          <rect x="131" y="2" width="28" height="14" rx="4" className="termo-cap" />
          <path d="M128 30 h-10 v8 h10" className="termo-spout" />
          <rect x="136" y="40" width="4" height="50" rx="2" className="termo-shine" />
        </g>
        <path d="M74 70 C78 84 88 98 92 110" className="water" />
        <path d="M54 116 C36 152 52 192 92 192 C132 192 148 152 130 116 Z" className="gourd" />
        <path d="M44 156 C60 164 124 164 140 156 L136 170 C120 178 64 178 48 170 Z" className="band" />
        <ellipse cx="92" cy="114" rx="40" ry="9" className="virola" />
        <ellipse cx="92" cy="114" rx="34" ry="6" className="yerba" />
        {[[78, 112], [88, 115], [100, 112], [106, 116], [84, 117], [96, 118]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.7" className="leaf" />)}
        {[[86, 111], [95, 113], [101, 110]].map(([x, y], i) => <circle key={'f' + x} cx={x} cy={y} r="2.4" className="foam" style={{ animationDelay: `${1.3 + i * 0.12}s` }} />)}
        <path d="M100 114 L124 58" className="bombilla" /><path d="M119 58 h12" className="bombilla-tip" />
        <path className="steam s1" d="M80 102 q-8 -12 0 -22 q8 -10 0 -20" />
        <path className="steam s2" d="M96 102 q-8 -12 0 -22 q8 -10 0 -20" />
      </svg>
      <div className="mate-copy">
        <p className="mate-title">{n === 1 ? T.mate : fresh ? T.mateFresh : T.mateMore(n)}</p>
        <p>{n === 1 ? T.mate2 : fresh ? T.mateFresh2 : T.mateMore2}</p>
        <div className="mate-actions">
          <button type="button" className="btn" onClick={another}>{T.mateAgain}</button>
          <button type="button" className="btn ghost" onClick={() => { playClick(); onClose() }}>{T.mateNo}</button>
        </div>
      </div>
    </div>
  )
}

export function EggStage() {
  const { lang } = useLang()
  const T = copy[lang].eggs
  const [scene, setScene] = useState(null) // { id, key }
  const { playEgg, isMuted } = useSoundEffects()
  const sound = useRef(playEgg), muted = useRef(isMuted)
  useEffect(() => { sound.current = playEgg; muted.current = isMuted })

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let t
    const go = (id) => NEXT[id] && document.dispatchEvent(new CustomEvent(NEXT[id]))
    const on = (e) => {
      const id = e.detail.id
      if (!MUSIC[id]?.from) sound.current(id) // a recorded effect replaces the synth cue
      if (reduced) return go(id)
      if (!HOLD[id]) return
      setScene({ id, key: Date.now(), now: new Date() })
      if (id === 'order66') setSith(true)
      if (MUSIC[id] && !muted.current) {
        const m = MUSIC[id], a = new Audio(m.src); a.volume = m.vol; if (m.from) a.currentTime = m.from; a.play().catch(() => {})
        // fade out over the last second of the scene
        setTimeout(() => { const f = setInterval(() => { a.volume = Math.max(0, a.volume - 0.05); if (a.volume === 0) { clearInterval(f); a.pause() } }, 80) }, HOLD[id] - 900)
      }
      clearTimeout(t); t = setTimeout(() => { setScene(null); go(id) }, HOLD[id])
    }
    document.addEventListener('secret', on)
    return () => { document.removeEventListener('secret', on); clearTimeout(t) }
  }, [])

  if (!scene) return null
  const { id, key, now } = scene
  return (
    <div key={key} className={`stage-egg egg-${id}`} aria-hidden={id === 'mate' ? undefined : 'true'}>
      {id === 'mellon' && (<><span className="stars" /><Durin /><p className="egg-caption elvish">{T.mellon}</p></>)}

      {id === 'order66' && <Order66 T={T} />}

      {id === 'mph' && <MphScene T={T} now={now} dest={PAST} />}

      {id === 'placa' && (<><span className="scan" /><div className="test"><small>{T.test}</small><b>TEST OK · 6/6</b></div></>)}

      {id === 'hire' && (
        <div className="granted">
          {T.sudo.map((line, i) => <p key={line} style={{ '--d': `${i * 0.28}s` }}>{line}</p>)}
          <b style={{ '--d': `${T.sudo.length * 0.28}s` }}>{T.granted}</b>
        </div>
      )}

      {id === 'mate' && <MateScene T={T} onClose={() => setScene(null)} />}
    </div>
  )
}
