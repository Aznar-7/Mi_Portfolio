import { useEffect, useState } from 'react'

// First visit of the session: the board powers on. Two traces draw in from the edges to the mark,
// the mark's pad lights, and the screen opens from that line onto the page. About 1.4 s, gone on
// any key or click, never with reduced motion, never twice in a session.
const KEY = 'va-intro'

export function Intro() {
  const [on, setOn] = useState(() => {
    try {
      return !matchMedia('(prefers-reduced-motion: reduce)').matches && !sessionStorage.getItem(KEY)
    } catch { return false }
  })
  useEffect(() => {
    if (!on) return
    try { sessionStorage.setItem(KEY, '1') } catch { /* storage blocked: it just plays again */ }
    const end = () => setOn(false)
    const t = setTimeout(end, 1500)
    addEventListener('keydown', end, { once: true })
    addEventListener('pointerdown', end, { once: true })
    return () => { clearTimeout(t); removeEventListener('keydown', end); removeEventListener('pointerdown', end) }
  }, [on])
  if (!on) return null
  return (
    <div className="intro" aria-hidden="true">
      <span className="intro-half top" /><span className="intro-half bottom" />
      <svg className="intro-trace" viewBox="0 0 1000 2" preserveAspectRatio="none"><path d="M0 1 H468" pathLength="1" /><path d="M1000 1 H532" pathLength="1" /></svg>
      <svg className="intro-mark" viewBox="0 0 64 64">
        <path d="M17 12 V22 L32 41 M47 12 V22 L32 41" className="v" pathLength="1" />
        <circle cx="17" cy="12" r="4.5" className="pin" /><circle cx="47" cy="12" r="4.5" className="pin" />
        <circle cx="32" cy="47" r="7.5" className="pad" />
      </svg>
    </div>
  )
}
