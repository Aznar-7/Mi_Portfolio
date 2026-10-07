import { useEffect } from 'react'
import { motion } from 'motion/react'
import { site } from '@/data/site'
import { HeroName } from '@/components/common/HeroName'
import { markIntroSeen } from '@/lib/intro'

const DURATION_MS = 1900
const EASE = [0.16, 1, 0.3, 1]

// Full-screen name reveal. On finish, the name hands off (shared layoutId)
// to the Hero headline, so the intro flows into the page instead of
// cutting to it. Any key, click, touch or wheel skips it.
export function Intro({ onDone }) {
  useEffect(() => {
    markIntroSeen()

    const timer = setTimeout(onDone, DURATION_MS)
    const skip = () => onDone()
    const events = ['keydown', 'pointerdown', 'wheel', 'touchstart']
    events.forEach((e) => window.addEventListener(e, skip, { once: true, passive: true }))
    document.documentElement.style.overflow = 'hidden'

    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, skip))
      document.documentElement.style.overflow = ''
    }
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-[var(--bg-base)] px-5"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      aria-hidden="true"
    >
      <div className="w-full max-w-6xl sm:px-6">
        <HeroName layoutId="hero-name" reveal />

        <div className="mt-10 flex items-center gap-4">
          <div className="relative h-px w-full max-w-xs overflow-hidden bg-[var(--line)]">
            <motion.span
              className="absolute inset-y-0 left-0 w-full origin-left bg-[var(--text-primary)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: DURATION_MS / 1000 - 0.2, ease: [0.65, 0, 0.35, 1] }}
            />
          </div>
          <motion.span
            className="shrink-0 text-sm text-[var(--text-muted)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {site.role}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}
