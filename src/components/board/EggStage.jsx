import { useEffect, useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'

// How long each scene holds the stage, in ms
const HOLD = { mellon: 2700, order66: 2600, mph: 3000, placa: 2200, hire: 1500, mate: 6000 }

const pad = (n) => String(n).padStart(2, '0')
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
function stamp(d) {
  const h = d.getHours() % 12 || 12
  return { mon: MONTHS[d.getMonth()], day: pad(d.getDate()), year: d.getFullYear(), ampm: d.getHours() < 12 ? 'AM' : 'PM', hour: pad(h), min: pad(d.getMinutes()) }
}

// The Doors of Durin, drawn line by line in ithildin, then opening
function Durin() {
  const star8 = (cx, cy, r) => Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI / 8) * i - Math.PI / 2, rr = i % 2 ? r * .42 : r
    return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`
  }).join(' ')
  const small = (cx, cy) => star8(cx, cy, 5)
  return (
    <div className="durin">
      <svg viewBox="0 0 400 520" aria-hidden="true">
        <g className="leaf left">
          <path pathLength="1" d="M200 500 V140 A140 140 0 0 0 60 260 V500" />
          <path pathLength="1" d="M84 500 V262 A116 116 0 0 1 200 162" />
          {/* holly tree climbing the pillar */}
          <path pathLength="1" d="M72 500 V300 M72 330 q-14 -20 -6 -40 M72 360 q16 -18 10 -40 M72 300 q-6 -22 6 -40 q12 -14 30 -24" />
          <path pathLength="1" d="M60 500 h40 M60 492 h40" />
        </g>
        <g className="leaf right">
          <path pathLength="1" d="M200 500 V140 A140 140 0 0 1 340 260 V500" />
          <path pathLength="1" d="M316 500 V262 A116 116 0 0 0 200 162" />
          <path pathLength="1" d="M328 500 V300 M328 330 q14 -20 6 -40 M328 360 q-16 -18 -10 -40 M328 300 q6 -22 -6 -40 q-12 -14 -30 -24" />
          <path pathLength="1" d="M300 500 h40 M300 492 h40" />
        </g>
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
      </svg>
    </div>
  )
}

export function EggStage() {
  const { lang } = useLang()
  const T = copy[lang].eggs
  const [scene, setScene] = useState(null) // { id, key }

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let t
    const on = (e) => {
      const id = e.detail.id
      if (!HOLD[id]) return
      setScene({ id, key: Date.now(), now: new Date() })
      const site = document.querySelector('.site')
      if (id === 'order66') { site?.classList.add('sith'); setTimeout(() => site?.classList.remove('sith'), 7000) }
      clearTimeout(t); t = setTimeout(() => setScene(null), HOLD[id])
    }
    document.addEventListener('secret', on)
    return () => { document.removeEventListener('secret', on); clearTimeout(t) }
  }, [])

  if (!scene) return null
  const { id, key, now } = scene
  return (
    <div key={key} className={`stage-egg egg-${id}`} aria-hidden="true">
      {id === 'mellon' && (<><Durin /><p className="egg-caption elvish">{T.mellon}</p></>)}

      {id === 'order66' && (
        <>
          <svg className="saber" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="-5" y1="8" x2="105" y2="92" /><line className="core" x1="-5" y1="8" x2="105" y2="92" /></svg>
          <div className="holo"><span>{T.order66a}</span><b>{T.order66b}</b></div>
        </>
      )}

      {id === 'mph' && (
        <>
          <span className="flame one" /><span className="flame two" />
          <div className="circuits">
            {[
              ['dest', T.dest, { mon: 'OCT', day: '21', year: 2015, ampm: 'PM', hour: '04', min: '29' }],
              ['pres', T.pres, stamp(now)],
              ['last', T.last, { mon: 'OCT', day: '26', year: 1985, ampm: 'AM', hour: '01', min: '21' }],
            ].map(([k, label, d]) => (
              <div key={k} className={`row ${k}`}>
                <div className="cells">
                  {[['MONTH', d.mon], ['DAY', d.day], ['YEAR', d.year], ['', d.ampm], ['HOUR', d.hour], ['MIN', d.min]].map(([cap, v], i) => (
                    <span key={i} className="cell"><small>{cap}</small><b>{v}</b></span>
                  ))}
                </div>
                <em>{label}</em>
              </div>
            ))}
          </div>
          <span className="flash" />
        </>
      )}

      {id === 'placa' && (<><span className="scan" /><div className="test"><small>{T.test}</small><b>TEST OK · 6/6</b></div></>)}

      {id === 'hire' && <div className="granted"><small>sudo hire</small><b>{T.granted}</b></div>}

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
