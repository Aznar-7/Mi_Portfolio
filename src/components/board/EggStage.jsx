import { useEffect, useRef, useState } from 'react'
import { Segments } from './Segments'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { useSoundEffects } from '@/contexts/SoundContext'

// How long each scene holds the stage, in ms
// scenes that lead somewhere when they end
const NEXT = { mellon: 'open-middle-earth', mph: 'open-retro' }
const HOLD = { mellon: 4200, order66: 9200, mph: 5000, placa: 2200, hire: 2600, mate: 7600 }
// scenes with a soundtrack (the visitor's sound setting still applies)
const MUSIC = { order66: '/audio/imperial-march.mp3' }

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
  const { playEgg, isMuted } = useSoundEffects()
  const sound = useRef(playEgg), muted = useRef(isMuted)
  useEffect(() => { sound.current = playEgg; muted.current = isMuted })

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
      if (id === 'order66') { site?.classList.add('sith'); setTimeout(() => site?.classList.remove('sith'), HOLD.order66 + 4000) }
      if (MUSIC[id] && !muted.current) {
        const a = new Audio(MUSIC[id]); a.volume = 0.55; a.play().catch(() => {})
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
    <div key={key} className={`stage-egg egg-${id}`} aria-hidden="true">
      {id === 'mellon' && (<><span className="stars" /><Durin /><p className="egg-caption elvish">{T.mellon}</p></>)}

      {id === 'order66' && (
        <>
          {/* 1. an incoming transmission: a hooded figure in blue holo light gives the order */}
          <div className="o66-holo">
            <svg viewBox="0 0 300 380" aria-hidden="true">
              <defs>
                <linearGradient id="o66-beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#7cc6ff" stopOpacity=".45" /><stop offset="1" stopColor="#7cc6ff" stopOpacity="0" /></linearGradient>
                <pattern id="o66-scan" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="1.2" fill="#bfe4ff" /></pattern>
                <clipPath id="o66-fig"><path d="M150 40 C124 40 110 60 110 88 C110 108 118 118 110 128 C88 134 68 148 62 172 C54 222 52 282 48 330 H252 C248 282 246 222 238 172 C232 148 212 134 190 128 C182 118 190 108 190 88 C190 60 176 40 150 40 Z" /></clipPath>
              </defs>
              <polygon points="150,350 40,30 260,30" fill="url(#o66-beam)" />
              <g className="o66-figure">
                <path d="M150 40 C124 40 110 60 110 88 C110 108 118 118 110 128 C88 134 68 148 62 172 C54 222 52 282 48 330 H252 C248 282 246 222 238 172 C232 148 212 134 190 128 C182 118 190 108 190 88 C190 60 176 40 150 40 Z" className="robe" />
                <path d="M128 92 C134 78 166 78 172 92 C174 110 164 122 150 122 C136 122 126 110 128 92 Z" className="hood" />
                <path d="M118 150 C134 160 166 160 182 150 M150 160 V330" className="fold" />
                <rect x="40" y="30" width="220" height="320" fill="url(#o66-scan)" opacity=".35" clipPath="url(#o66-fig)" />
              </g>
              <ellipse cx="150" cy="352" rx="60" ry="10" className="o66-emitter" />
            </svg>
            <p className="o66-line one"><small>{T.o66from}</small>{T.order66b}</p>
            <p className="o66-line two">{T.o66reply}</p>
          </div>
          {/* 2. the blade */}
          <svg className="saber" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="-5" y1="8" x2="105" y2="92" pathLength="100" /><line className="core" x1="-5" y1="8" x2="105" y2="92" pathLength="100" /></svg>
          {/* 3. the squad marches through */}
          <div className="o66-squad">
            {Array.from({ length: 7 }, (_, i) => (
              <svg key={i} viewBox="0 0 40 90" style={{ '--i': i }} aria-hidden="true">
                <path d="M20 4 C9 4 6 12 6 22 L7 32 C10 36 30 36 33 32 L34 22 C34 12 31 4 20 4 Z" className="helm" />
                <path d="M11 18 H29 M20 18 V30" className="visor" />
                <path d="M10 38 H30 L32 62 H8 Z" className="armor" />
                <path d="M12 62 L10 86 M28 62 L30 86" className="legs" />
                <path d="M30 42 L40 50" className="blaster" />
              </svg>
            ))}
          </div>
          <p className="egg-caption sith o66-end">{T.o66end}</p>
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
          <svg viewBox="0 0 220 200" aria-hidden="true">
            {/* the thermos tips over the gourd and pours */}
            <g className="termo">
              <rect x="128" y="10" width="34" height="96" rx="9" className="termo-body" />
              <rect x="131" y="2" width="28" height="14" rx="4" className="termo-cap" />
              <path d="M128 30 h-10 v8 h10" className="termo-spout" />
              <rect x="136" y="40" width="4" height="50" rx="2" className="termo-shine" />
            </g>
            <path d="M118 36 C108 60 96 84 92 108" className="water" />
            {/* the gourd, the yerba, the bombilla */}
            <path d="M52 112 C34 150 50 192 92 192 C134 192 150 150 132 112 Z" className="gourd" />
            <ellipse cx="92" cy="112" rx="40" ry="9" className="virola" />
            <ellipse cx="92" cy="112" rx="34" ry="6" className="yerba" />
            {[[78, 110], [88, 113], [100, 110], [106, 114], [84, 115]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.6" className="leaf" />)}
            <path d="M100 112 L124 60 M120 58 h10" className="bombilla" />
            <path className="steam s1" d="M80 100 q-8 -12 0 -22 q8 -10 0 -20" />
            <path className="steam s2" d="M96 100 q-8 -12 0 -22 q8 -10 0 -20" />
          </svg>
          <p><b>{T.mate}</b><span>{T.mate2}</span></p>
        </div>
      )}
    </div>
  )
}
