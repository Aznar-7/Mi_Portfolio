import { useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useSoundEffects } from '@/contexts/SoundContext'

/**
 * Wraps any element with a magnetic attraction effect.
 * On pointer devices only — zero effect on touch.
 *
 * @param {number} strength  How far the element moves (0–1). Default 0.35.
 * @param {number} radius    Detection radius in px. Default 70.
 */
export function MagneticButton({ children, strength = 0.35, radius = 70, className = '', style = {}, onClick }) {
  const ref = useRef(null)
  const { playHover, playClick } = useSoundEffects()

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 200, damping: 18, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 200, damping: 18, mass: 0.5 })

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top  + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < radius) {
      rawX.set(dx * strength)
      rawY.set(dy * strength)
    }
  }, [strength, radius])

  const handleMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [])

  // No magnetic effect on touch devices
  const isTouch = typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches
  if (isTouch) {
    return (
      <div 
        className={`inline-flex ${className}`} 
        style={style} 
        onClick={(e) => {
          playClick()
          if (onClick) onClick(e)
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y, ...style }}
      className={`inline-flex ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={playHover}
      onClick={(e) => {
        playClick()
        if (onClick) onClick(e)
      }}
    >
      {children}
    </motion.div>
  )
}
