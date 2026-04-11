import { motion } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function SectionWrapper({ id, children, className = '' }) {
  const reduced = useReducedMotion()

  return (
    <motion.section
      id={id}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ type: 'spring', stiffness: 180, damping: 24 }}
      style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1152px',
        margin: '0 auto',
      }}
      className={`px-5 py-14 sm:px-6 sm:py-16 lg:py-24 ${className}`}
    >
      {children}
    </motion.section>
  )
}
