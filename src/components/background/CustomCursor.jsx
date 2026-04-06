import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function CustomCursor() {
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)

  // Dot: tight spring — follows almost instantly
  const dotX = useSpring(mouseX, { stiffness: 800, damping: 40, mass: 0.2 })
  const dotY = useSpring(mouseY, { stiffness: 800, damping: 40, mass: 0.2 })

  // Ring: loose spring — lags behind for the trail feel
  const ringX = useSpring(mouseX, { stiffness: 120, damping: 16, mass: 0.5 })
  const ringY = useSpring(mouseY, { stiffness: 120, damping: 16, mass: 0.5 })

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(hover: none)').matches) return

    const onMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const onHoverStart = (e) => {
      if (
        e.target.closest('a, button, [role="button"], input, textarea, select, label')
      ) {
        setHovering(true)
      }
    }
    const onHoverEnd = () => setHovering(false)

    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)
    document.addEventListener('mouseover', onHoverStart)
    document.addEventListener('mouseout', onHoverEnd)

    // Hide native cursor
    document.body.style.cursor = 'none'

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseover', onHoverStart)
      document.removeEventListener('mouseout', onHoverEnd)
      document.body.style.cursor = ''
    }
  }, [mouseX, mouseY, visible])

  if (reduced) return null

  return (
    <>
      {/* Outer ring — trails behind */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          width: hovering ? '44px' : '32px',
          height: hovering ? '44px' : '32px',
          borderRadius: '50%',
          border: hovering
            ? '1.5px solid rgba(124,106,247,0.6)'
            : '1px solid rgba(124,106,247,0.35)',
          backgroundColor: hovering ? 'rgba(124,106,247,0.06)' : 'transparent',
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transition: 'width 0.25s ease, height 0.25s ease, border-color 0.25s ease, background-color 0.25s ease, opacity 0.3s ease',
          mixBlendMode: 'normal',
        }}
      />

      {/* Inner dot — snappy */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: hovering ? '5px' : '5px',
          height: hovering ? '5px' : '5px',
          borderRadius: '50%',
          backgroundColor: hovering ? 'var(--accent-hover)' : 'var(--accent)',
          zIndex: 10000,
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          boxShadow: hovering
            ? '0 0 8px rgba(124,106,247,0.8), 0 0 20px rgba(124,106,247,0.3)'
            : '0 0 6px rgba(124,106,247,0.6)',
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease, opacity 0.3s ease',
        }}
      />
    </>
  )
}
