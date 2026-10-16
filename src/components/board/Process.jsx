import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { processSteps } from '@/data/process'
import { l } from '@/lib/utils'
import { PowerTitle } from './PowerTitle'

gsap.registerPlugin(ScrollTrigger)

// ── One authored diagram per stage, drawn from the real case it cites. They animate when their
// panel turns on (CSS, keyed on .on), and sit fully drawn with reduced motion.

function Understand({ D }) {
  return (
    <svg viewBox="0 0 380 260" className="dia">
      {D.rules.map((r, i) => (
        <g key={r} className="pop" style={{ '--d': `${i * 0.12}s` }}>
          <rect x="10" y={30 + i * 70} width="128" height="44" rx="8" className="card" />
          <text x="74" y={57 + i * 70} className="t">{r}</text>
          <path d={`M138 ${52 + i * 70} C 166 ${52 + i * 70}, 160 130, 182 130`} className="wire draw" style={{ '--d': `${0.4 + i * 0.1}s` }} pathLength="1" />
        </g>
      ))}
      {D.states.map((s, i) => (
        <g key={s} className="state" style={{ '--d': `${0.9 + i * 0.35}s` }}>
          <circle cx={198 + i * 78} cy="130" r="20" className="node-c" />
          <text x={198 + i * 78} y="170" className="t sm">{s}</text>
          {i < 2 && <path d={`M${218 + i * 78} 130 H${256 + i * 78}`} className="wire draw" pathLength="1" style={{ '--d': `${1.1 + i * 0.35}s` }} />}
        </g>
      ))}
    </svg>
  )
}

function Design({ D }) {
  const layers = D.layers
  return (
    <svg viewBox="0 0 380 260" className="dia">
      {/* the bus runs beside the layers, so the packet never crosses their labels */}
      <path d="M44 36 V216" className="wire draw" pathLength="1" />
      {layers.map(([a, b], i) => (
        <g key={a} className="slide" style={{ '--d': `${i * 0.14}s` }}>
          <path d={`M44 ${36 + i * 60} H72`} className="wire" />
          <rect x="72" y={14 + i * 60} width="264" height="44" rx="8" className={`card ${i ? 'hosted' : ''}`} />
          <text x="88" y={41 + i * 60} className="t l">{a}</text>
          <text x="320" y={41 + i * 60} className="t r dim">{b}</text>
        </g>
      ))}
      <circle r="5" className="packet"><animateMotion dur="2.4s" repeatCount="indefinite" path="M44 36 V216" /></circle>
    </svg>
  )
}

function Build() {
  return (
    <svg viewBox="0 0 380 260" className="dia">
      <rect x="10" y="20" width="170" height="220" rx="10" className="card" />
      {[120, 90, 140, 70, 110, 100, 60, 130].map((w, i) => (
        <rect key={i} x={26 + (i % 3 === 1 ? 14 : 0)} y={44 + i * 22} width={w} height="7" rx="3.5" className="code" style={{ '--d': `${i * 0.12}s`, '--w': `${w}px` }} />
      ))}
      <path d="M180 130 H220" className="wire draw" pathLength="1" style={{ '--d': '.9s' }} />
      <rect x="220" y="60" width="150" height="140" rx="8" className="card board-c" />
      <text x="232" y="84" className="t l sm">RPi Zero 2W</text>
      {[0, 1, 2].map((i) => <rect key={i} x={252 + i * 9} y={102 + i * 9} width={86 - i * 18} height={70 - i * 18} rx={10 - i * 2} className="coil" style={{ '--d': `${1 + i * 0.15}s` }} />)}
    </svg>
  )
}

function Deploy({ D }) {
  return (
    <svg viewBox="0 0 380 260" className="dia">
      <rect x="10" y="14" width="360" height="232" rx="10" className="term-c" />
      <circle cx="30" cy="32" r="4" className="tl-dot" /><circle cx="44" cy="32" r="4" className="tl-dot" /><circle cx="58" cy="32" r="4" className="tl-dot" />
      {D.log.map(([cmd, ok], i) => (
        <g key={cmd} className="line" style={{ '--d': `${0.3 + i * 0.38}s` }}>
          <text x="28" y={72 + i * 30} className="t l mono"><tspan className="pr">$ </tspan>{cmd}</text>
          {ok && <text x="352" y={72 + i * 30} className="t r mono ok">{ok}</text>}
        </g>
      ))}
    </svg>
  )
}

function Iterate({ D }) {
  const ticks = Array.from({ length: 8 }, (_, i) => i)
  return (
    <svg viewBox="0 0 380 260" className="dia">
      {/* a full circle drawn from 12 o'clock (an arc that closes on itself rendered empty) */}
      <circle cx="190" cy="130" r="92" transform="rotate(-90 190 130)" className="loop draw" pathLength="1" />
      {ticks.map((i) => {
        const a = (i / ticks.length) * Math.PI * 2 - Math.PI / 2
        return <circle key={i} cx={190 + Math.cos(a) * 92} cy={130 + Math.sin(a) * 92} r="5" className="tick" style={{ '--d': `${0.4 + i * 0.1}s` }} />
      })}
      <circle r="7" className="packet"><animateMotion dur="4s" repeatCount="indefinite" path="M190 38 A92 92 0 1 1 189.9 38" /></circle>
      <text x="190" y="124" className="t">{D.loop}</text>
      <text x="190" y="146" className="t sm dim">{D.sprint}</text>
    </svg>
  )
}

const DIAGRAMS = [Understand, Design, Build, Deploy, Iterate]

export function Process() {
  const { lang } = useLang()
  const T = copy[lang].process
  const root = useRef(null), track = useRef(null)
  const [active, setActive] = useState(0)
  // phones and reduced motion get a plain vertical stack with every diagram drawn
  const [flat, setFlat] = useState(() => matchMedia('(prefers-reduced-motion: reduce), (max-width: 900px)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce), (max-width: 900px)')
    const on = () => setFlat(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    if (flat) return
    const ctx = gsap.context(() => {
      const el = track.current
      // the track is padded so the first and last panels sit centered; travel is its overflow
      const distance = () => el.scrollWidth - el.clientWidth
      const n = processSteps.length
      gsap.to(el, {
        x: () => -distance(), ease: 'none',
        // follow the tween, not the scroll: with scrub they differ and the lit pad lagged the panel on screen
        onUpdate() { setActive(Math.round(this.progress() * (n - 1))) },
        scrollTrigger: {
          // no snap: it fought the reader's own scroll and yanked the page back to the start
          trigger: '.ps-pin', start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.4, invalidateOnRefresh: true,
        },
      })
    }, root)
    return () => ctx.revert()
  }, [flat])

  return (
    <section className={`process${flat ? ' flat' : ''}`} id="proceso" ref={root}>
      {/* the heading rides inside the pin so the section keeps its name while the track moves */}
      <div className="ps-pin">
        <header className="ps-head">
          <PowerTitle text={T.title} />
          <p className="sec-intro">{T.intro}</p>
        </header>
        <div className="ps-bus" aria-hidden="true">
          <span className="ps-line"><span className="ps-fill" style={{ transform: `scaleX(${active / (processSteps.length - 1)})` }} /></span>
          {processSteps.map((s, i) => (
            <span key={s.id} className={`ps-pad${i <= active ? ' on' : ''}`} style={{ left: `${(i / (processSteps.length - 1)) * 100}%` }}>
              <b>{l(s.title, lang)}</b>
            </span>
          ))}
        </div>
        <ol className="ps-track" ref={track}>
          {processSteps.map((s, i) => {
            const Dia = DIAGRAMS[i]
            const ex = l(s.example, lang), at = ex.indexOf(': ')
            return (
              <li key={s.id} className={`panel${flat || i === active ? ' on' : ''}${i < active ? ' past' : ''}`}>
                <div className="panel-text">
                  <h3>{l(s.title, lang)}</h3>
                  <p>{l(s.detail, lang)}</p>
                  <p className="panel-case">
                    <b>{at > 0 ? ex.slice(0, at) : ''}</b>
                    {at > 0 ? ex.charAt(at + 2).toUpperCase() + ex.slice(at + 3) : ex}
                  </p>
                </div>
                <div className="panel-dia" aria-hidden="true"><Dia D={T.dia} /></div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
