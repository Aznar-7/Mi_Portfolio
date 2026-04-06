import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

// Camera-reticle style cursor with 4 corner brackets + center dot
const ARM    = 11  // L-arm length in px
const BOX    = 50  // corner-bracket frame size in px
const HOVER_BOX = 32

const CORNER_STYLES = [
  { top: 0,    left: 0,    borderTop: '1.5px', borderLeft: '1.5px'  },
  { top: 0,    right: 0,   borderTop: '1.5px', borderRight: '1.5px' },
  { bottom: 0, left: 0,    borderBottom: '1.5px', borderLeft: '1.5px'  },
  { bottom: 0, right: 0,   borderBottom: '1.5px', borderRight: '1.5px' },
]

export function TargetCursor() {
  // Only on pointer devices
  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return null

  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)

  // Bracket frame lags behind with spring
  const rx = useSpring(mx, { stiffness: 140, damping: 14, mass: 0.08 })
  const ry = useSpring(my, { stiffness: 140, damping: 14, mass: 0.08 })

  // Reactive values for hover state
  const boxSize  = useSpring(BOX, { stiffness: 280, damping: 22 })
  const opacity  = useSpring(1,   { stiffness: 280, damping: 22 })
  const dotSize  = useSpring(5,   { stiffness: 280, damping: 22 })
  const dotOpacity = useSpring(1, { stiffness: 280, damping: 22 })

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    if (!mq.matches) return
    document.body.style.cursor = 'none'

    const move  = (e) => { mx.set(e.clientX); my.set(e.clientY) }

    const isInteractive = (el) =>
      el.closest('a, button, [role="button"], input, textarea, select')

    const over  = (e) => {
      if (!isInteractive(e.target)) return
      boxSize.set(HOVER_BOX); opacity.set(0.9); dotSize.set(3); dotOpacity.set(0.6)
    }
    const out   = (e) => {
      if (!isInteractive(e.target)) return
      boxSize.set(BOX); opacity.set(1); dotSize.set(5); dotOpacity.set(1)
    }
    const down  = () => { boxSize.set(24); opacity.set(0.7) }
    const up    = () => { boxSize.set(BOX); opacity.set(1) }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover',  over)
    document.addEventListener('mouseout',   out)
    document.addEventListener('mousedown',  down)
    document.addEventListener('mouseup',    up)

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout',  out)
      document.removeEventListener('mousedown', down)
      document.removeEventListener('mouseup',   up)
    }
  }, [])

  const color = 'rgba(124,106,247,0.8)'

  return (
    <>
      {/* Corner bracket frame — spring-lagged */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          x: rx, y: ry,
          width: boxSize, height: boxSize,
          translateX: '-50%', translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 9997,
          opacity,
        }}
      >
        {CORNER_STYLES.map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: ARM, height: ARM,
              top: c.top, left: c.left, right: c.right, bottom: c.bottom,
              borderTop:    c.borderTop    ? `${c.borderTop} solid ${color}`    : 'none',
              borderLeft:   c.borderLeft   ? `${c.borderLeft} solid ${color}`   : 'none',
              borderRight:  c.borderRight  ? `${c.borderRight} solid ${color}`  : 'none',
              borderBottom: c.borderBottom ? `${c.borderBottom} solid ${color}` : 'none',
            }}
          />
        ))}
      </motion.div>

      {/* Center dot — instant mouse follow */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          x: mx, y: my,
          width: dotSize, height: dotSize,
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          translateX: '-50%', translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: dotOpacity,
          boxShadow: '0 0 6px rgba(124,106,247,0.5)',
        }}
      />
    </>
  )
}
