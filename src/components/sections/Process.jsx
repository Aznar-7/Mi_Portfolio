import { useRef, useState } from 'react'
import { motion, useScroll, useSpring, useMotionValueEvent } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { processSteps } from '@/data/process'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn, l } from '@/lib/utils'

/**
 * The delivery flow as a scroll-driven rail: the line fills as the reader
 * scrolls and each step lights up when the line reaches it.
 */
export function Process() {
  const { lang } = useLang()
  const T = translations[lang].process
  const reduced = useReducedMotion()
  const { playHover } = useSoundEffects()
  const listRef = useRef(null)
  const [reached, setReached] = useState(reduced ? processSteps.length - 1 : -1)

  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 65%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (reduced) return
    const idx = p <= 0 ? -1 : Math.min(processSteps.length - 1, Math.floor(p * processSteps.length + 0.15))
    if (idx !== reached) {
      if (idx > reached) playHover()
      setReached(idx)
    }
  })

  return (
    <SectionWrapper id="process">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading title={T.title} subtitle={T.subtitle} />
        </div>

        <ol ref={listRef} className="relative">
          {/* Rail: static track + scroll-driven fill */}
          <span aria-hidden="true" className="absolute bottom-3 left-[15px] top-3 w-px bg-[var(--line)]" />
          <motion.span
            aria-hidden="true"
            style={{ scaleY: reduced ? 1 : fill }}
            className="absolute bottom-3 left-[15px] top-3 w-px origin-top bg-gradient-to-b from-[var(--accent-hover)] to-[var(--accent)]"
          />

          {processSteps.map((step, i) => {
            const on = i <= reached
            return (
              <li key={step.id} className="relative grid grid-cols-[32px_1fr] gap-6 pb-12 last:pb-0">
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition-[background-color,border-color,color,box-shadow] duration-500',
                    on
                      ? 'border-[var(--accent-hover)] bg-[var(--accent)] text-white shadow-[0_0_0_6px_var(--accent-glow)]'
                      : 'border-[var(--line-strong)] bg-[var(--bg-base)] text-[var(--text-muted)]',
                  )}
                >
                  {i + 1}
                </span>
                <div className={cn('pt-0.5 transition-opacity duration-500', on ? 'opacity-100' : 'opacity-45')}>
                  <h3 className="text-xl font-medium tracking-[-0.02em] text-[var(--text-primary)]">{l(step.title, lang)}</h3>
                  <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-[var(--text-secondary)]">{l(step.detail, lang)}</p>
                  <p className="mt-4 border-l border-[var(--line-strong)] pl-4 text-sm leading-relaxed text-[var(--text-muted)]">
                    {l(step.example, lang)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </SectionWrapper>
  )
}
