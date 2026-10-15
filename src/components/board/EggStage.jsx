import { useEffect, useRef, useState } from 'react'
import { Segments } from './Segments'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { useSoundEffects } from '@/contexts/SoundContext'

// How long each scene holds the stage, in ms
// scenes that lead somewhere when they end
const NEXT = { mellon: 'open-middle-earth', mph: 'open-retro' }
const HOLD = { mellon: 4200, order66: 2600, mph: 5000, placa: 2200, hire: 2600, mate: 6000 }

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
  const raf = useRef(0)
  useEffect(() => {
    const t0 = performance.now()
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 1700)
      setMph(Math.round(88 * (1 - (1 - k) ** 2.2)))
      if (k < 1) raf.current = requestAnimationFrame(tick)
      else setTimeout(() => setJumped(true), 120)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])
  const present = stamp(now)
  return (
    <>
      <div className={`speedo${jumped ? ' gone' : ''}`}>
        <Segments text={String(mph).padStart(2, '0')} />
        <b>MPH</b>
      </div>
      {jumped && <><span className="flash" /><span className="flame one" /><span className="flame two" /></>}
      <div className={`circuits${jumped ? ' in' : ''}`}>
        <Row label={T.dest} d={dest} kind="dest" />
        <Row label={T.pres} d={jumped ? dest : present} kind="pres" flip={jumped} />
        <Row label={T.last} d={jumped ? present : LAST} kind="last" flip={jumped} />
      </div>
    </>
  )
}

export function EggStage() {
  const { lang } = useLang()
  const T = copy[lang].eggs
  const [scene, setScene] = useState(null) // { id, key }
  const { playEgg } = useSoundEffects()
  const sound = useRef(playEgg)
  useEffect(() => { sound.current = playEgg })

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let t
    const go = (id) => NEXT[id] && document.dispatchEvent(new CustomEvent(NEXT[id]))
    const on = (e) => {
      const id = e.detail.id
      sound.current(id)
      if (reduced) return go(id)
      if (!HOLD[id]) return
      setScene({ id, key: Date.now(), now: new Date() })
      const site = document.querySelector('.site')
      if (id === 'order66') { site?.classList.add('sith'); setTimeout(() => site?.classList.remove('sith'), 7000) }
      clearTimeout(t); t = setTimeout(() => { setScene(null); go(id) }, HOLD[id])
    }
    document.addEventListener('secret', on)
    return () => { document.removeEventListener('secret', on); clearTimeout(t) }
  }, [])

  if (!scene) return null
  const { id, key, now } = scene
  return (
    <div key={key} className={`stage-egg egg-${id}`} aria-hidden="true">
      {id === 'mellon' && (<><span className="stars" /><Durin /><p className="egg-caption elvish">{T.mellon}</p></>)}

      {id === 'order66' && (
        <>
          <svg className="saber" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="-5" y1="8" x2="105" y2="92" /><line className="core" x1="-5" y1="8" x2="105" y2="92" /></svg>
          <svg className="projector" viewBox="0 0 400 420" aria-hidden="true">
            <defs>
              <linearGradient id="cone" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#ff3b3b" stopOpacity=".55" />
                <stop offset="1" stopColor="#ff3b3b" stopOpacity="0" />
              </linearGradient>
              <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#ff5a5a" /></pattern>
              <clipPath id="beam"><polygon points="200,380 40,40 360,40" /></clipPath>
            </defs>
            <polygon className="cone" points="200,380 40,40 360,40" fill="url(#cone)" />
            <g className="hologram">
              <text x="200" y="190" textAnchor="middle" className="h66">66</text>
              <rect x="40" y="40" width="320" height="340" fill="url(#scan)" opacity=".16" clipPath="url(#beam)" />
            </g>
            <ellipse cx="200" cy="384" rx="70" ry="12" className="emitter" />
            <ellipse cx="200" cy="384" rx="34" ry="5" fill="#ff8080" />
          </svg>
          <p className="egg-caption sith">{T.order66b}</p>
        </>
      )}

      {id === 'mph' && <MphScene T={T} now={now} dest={PAST} />}

      {id === 'placa' && (<><span className="scan" /><div className="test"><small>{T.test}</small><b>TEST OK · 6/6</b></div></>)}

      {id === 'hire' && (
        <div className="granted">
          {T.sudo.map((line, i) => <p key={line} style={{ '--d': `${i * 0.28}s` }}>{line}</p>)}
          <b style={{ '--d': `${T.sudo.length * 0.28}s` }}>{T.granted}</b>
        </div>
      )}

      {id === 'mate' && (
        <div className="mate">
          <svg viewBox="0 0 120 150">
            <path className="steam s1" d="M52 40 q-8 -12 0 -22 q8 -10 0 -20" />
            <path className="steam s2" d="M66 42 q-8 -12 0 -22 q8 -10 0 -20" />
            <path className="gourd" d="M30 62 q-14 40 6 66 q24 22 48 0 q20 -26 6 -66 z" />
            <path className="rim" d="M30 62 q30 -10 60 0" />
            <path className="bombilla" d="M64 64 l18 -44 l8 -4" />
          </svg>
          <p>{T.mate}</p>
        </div>
      )}
    </div>
  )
}
