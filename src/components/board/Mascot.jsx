import { useEffect, useRef, useState } from 'react'
import { useSoundEffects } from '@/contexts/SoundContext'

// Chip: the board's little resident, sitting by the console. A chip package with copper legs and two
// LED eyes that follow the pointer. Listening for 'chip' events from the console, it watches you type, cheers a known command, tilts at an unknown
// one, celebrates secrets, and drops a hint when you poke it.

const LINES = {
  es: ['¡Hola! Soy Chip. Vivo en esta placa.', 'Probá escribir help acá al lado.', 'Dicen que una palabra élfica abre una puerta…', 'Si tocás los seis chips de arriba, pasa algo.', 'Psst: ↑ ↑ ↓ ↓ ← → ← → B A', 'Arriba hay un botón que vuelve al pasado.', 'Las pistas completas están en «secretos», al pie.'],
  en: ['Hi! I am Chip. I live on this board.', 'Try typing help right next to me.', 'They say an Elvish word opens a door…', 'Click the six chips up top and something happens.', 'Psst: ↑ ↑ ↓ ↓ ← → ← → B A', 'There is a button up top that goes back in time.', 'Full hints live in "secrets", down in the footer.'],
}
const MOODS = { happy: { es: '¡Eso!', en: 'Nice!' }, confused: { es: '¿Eh? Probá help.', en: 'Huh? Try help.' }, secret: { es: '¡Encontraste un secreto!', en: 'You found a secret!' } }

export function Mascot({ lang }) {
  const { playSelect } = useSoundEffects()
  const ref = useRef(null)
  const [look, setLook] = useState([0, 0])
  const [blink, setBlink] = useState(false)
  const [say, setSay] = useState(null)
  const [state, setState] = useState('idle') // idle | typing | happy | confused
  const line = useRef(0), timer = useRef(0)

  const speak = (text, st = 'idle', ms = 3200) => {
    setSay(text); setState(st)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setSay(null); setState('idle') }, ms)
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
    let t
    const loop = () => { t = setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 140); loop() }, 2600 + Math.random() * 3200) }
    loop()
    return () => clearTimeout(t)
  }, [])

  // react to the console ('chip' events) and to secrets found anywhere on the page
  useEffect(() => {
    const onChip = (e) => {
      const kind = e.detail
      if (kind === 'typing') { setState('typing'); clearTimeout(timer.current); timer.current = setTimeout(() => setState('idle'), 900); return }
      speak(MOODS[kind]?.[lang] ?? null, kind, 2600)
    }
    const onSecret = (e) => { if (e.detail.fresh) speak(MOODS.secret[lang], 'happy', 3000) }
    document.addEventListener('chip', onChip)
    document.addEventListener('secret', onSecret)
    return () => { document.removeEventListener('chip', onChip); document.removeEventListener('secret', onSecret) }
  }, [lang])
  useEffect(() => () => clearTimeout(timer.current), [])

  const poke = () => {
    playSelect()
    const lines = LINES[lang] ?? LINES.es
    speak(lines[line.current % lines.length], 'happy', 3800)
    line.current++
  }

  const [lx, ly] = state === 'typing' ? [-2.6, 2.2] : look
  return (
    <div className={`chip-pet ${state}`} ref={ref}>
      {say && <p className="chip-say" role="status">{say}</p>}
      <button type="button" className="chip-body" onClick={poke} aria-label={lang === 'es' ? 'Chip, la mascota. Tocá para una pista.' : 'Chip, the mascot. Click for a hint.'}>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          {/* antenna with a status LED */}
          <path d="M60 22 V10" className="ant" /><circle cx="60" cy="8" r="4" className="led" />
          {/* copper legs */}
          {[38, 52, 66, 80].map((y) => <g key={y}><rect x="14" y={y} width="12" height="6" rx="1.5" className="leg" /><rect x="94" y={y} width="12" height="6" rx="1.5" className="leg" /></g>)}
          {/* the package */}
          <rect x="24" y="22" width="72" height="76" rx="12" className="pkg" />
          <circle cx="34" cy="32" r="2.2" className="dot" />
          {/* face */}
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
