import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

export function CustomCursor() {
  const mx = useMotionValue(-100)
  const my = useMotionValue(-100)

  // Ring lags with spring physics
  const rx = useSpring(mx, { stiffness: 160, damping: 16, mass: 0.08 })
  const ry = useSpring(my, { stiffness: 160, damping: 16, mass: 0.08 })

  const ringW  = useSpring(38, { stiffness: 260, damping: 22 })
  const ringH  = useSpring(38, { stiffness: 260, damping: 22 })
  const dotW   = useSpring(7,  { stiffness: 260, damping: 22 })
  const dotH   = useSpring(7,  { stiffness: 260, damping: 22 })
  const rAlpha = useSpring(1,  { stiffness: 260, damping: 22 })

  useEffect(() => {
    document.body.style.cursor = 'none'

    const move = (e) => {
      mx.set(e.clientX)
      my.set(e.clientY)
    }

    const isInteractive = (el) =>
      el.closest('a, button, [role="button"], input, textarea, select')

    const over = (e) => {
      if (isInteractive(e.target)) {
        ringW.set(56); ringH.set(56)
        dotW.set(0);  dotH.set(0)
        rAlpha.set(0.45)
      }
    }

    const out = (e) => {
      if (isInteractive(e.target)) {
        ringW.set(38); ringH.set(38)
        dotW.set(7);  dotH.set(7)
        rAlpha.set(1)
      }
    }

    const down = () => { ringW.set(28); ringH.set(28) }
    const up   = () => { ringW.set(38); ringH.set(38) }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout',  out)
    document.addEventListener('mousedown', down)
    document.addEventListener('mouseup',   up)

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout',  out)
      document.removeEventListener('mousedown', down)
      document.removeEventListener('mouseup',   up)
    }
  }, [])

  return (
    <>
      {/* Lagging ring */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          x: rx, y: ry,
          width: ringW, height: ringH,
          borderRadius: '50%',
          border: '1.5px solid rgba(124,106,247,0.75)',
          opacity: rAlpha,
          translateX: '-50%', translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 9997,
        }}
      />
      {/* Instant dot */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          x: mx, y: my,
          width: dotW, height: dotH,
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          translateX: '-50%', translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 9998,
          boxShadow: '0 0 8px rgba(124,106,247,0.6)',
        }}
      />
    </>
  )
}
