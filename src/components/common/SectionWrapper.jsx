import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

/**
 * One segment of the copper trace that runs down the page margin. Segments of
 * consecutive sections meet edge to edge, so together they read as one trace;
 * the via sits level with the section heading and the segment fills with scroll.
 * `className` positions the segment, `terminal` bends its end onto the content
 * (the contact pad), where the trace finishes.
 */
export function TraceSegment({ targetRef, className = 'inset-y-0 -left-6', viaClassName = 'top-[8.4rem]', terminal = false }) {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start 70%', 'end 70%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 })

  return (
    <span aria-hidden="true" className={cn('pointer-events-none absolute hidden w-px xl:block', className)}>
      <span className="absolute inset-0 bg-[var(--accent)]/20" />
      <motion.span
        style={{ scaleY: reduced ? 1 : fill }}
        className="absolute inset-0 origin-top bg-[var(--accent)]"
      />
      <span className={cn('absolute left-1/2 h-[11px] w-[11px] -translate-x-1/2 rounded-full border-2 border-[var(--accent)] bg-[var(--bg-base)]', viaClassName)} />
      {terminal && <span className="absolute bottom-0 left-0 h-px w-12 bg-[var(--accent)]" />}
    </span>
  )
}

// Shared section frame: max width, gutters, vertical rhythm, the hairline
// marking the section boundary and (unless the section draws its own) its trace segment.
export function SectionWrapper({ id, children, className, trace = true }) {
  const ref = useRef(null)

  return (
    <section
      ref={ref}
      id={id}
      className={cn('relative z-10 mx-auto max-w-6xl scroll-mt-16 px-5 py-20 sm:px-6 sm:py-24 lg:py-32', className)}
    >
      <div aria-hidden="true" className="absolute inset-x-5 top-0 h-px bg-[var(--line)] sm:inset-x-6" />
      {trace && <TraceSegment targetRef={ref} />}
      {children}
    </section>
  )
}
