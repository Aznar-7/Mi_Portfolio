import { motion } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function SectionWrapper({ id, children, className = '' }) {
  const reduced = useReducedMotion()

  return (
    <motion.section
      id={id}
      initial={reduced ? false : { opacity: 0, y: 40, filter: 'blur(6px)' }}
      whileInView={reduced ? {} : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1152px',
        margin: '0 auto',
        padding: '96px 24px',
      }}
      className={className}
    >
      {children}
    </motion.section>
  )
}
