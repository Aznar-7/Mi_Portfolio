import { useScroll, useSpring, motion } from 'motion/react'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))',
        transformOrigin: '0%',
        scaleX,
        zIndex: 100,
        pointerEvents: 'none',
        boxShadow: '0 0 8px rgba(124,106,247,0.6)',
      }}
    />
  )
}
