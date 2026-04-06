import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, Mail } from 'lucide-react'
import BlurText from '@/components/common/BlurText'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { site } from '@/data/site'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function useCounter(target, duration = 1400) {
  const [val, setVal] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const numeric = parseInt(target)
    if (isNaN(numeric)) { setVal(target); return }
    const suffix = target.replace(String(numeric), '')
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * numeric) + suffix)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return [val, ref]
}

function Stat({ value, label }) {
  const [count, ref] = useCounter(value)
  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span className="font-mono text-[clamp(1.4rem,3vw,2rem)] font-bold leading-none tracking-tight text-[var(--text-primary)]">
        {count}
      </span>
      <span className="text-[11px] tracking-wide text-[var(--text-muted)]">{label}</span>
    </div>
  )
}

export function Hero() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].hero

  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const y    = useTransform(scrollYProgress, [0, 1], [0, -60])
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const fp = (delay = 0) =>
    reduced ? {} : {
      initial:    { opacity: 0, y: 22, filter: 'blur(6px)' },
      animate:    { opacity: 1, y: 0,  filter: 'blur(0px)' },
      transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] },
    }

  return (
    <motion.section
      ref={sectionRef}
      id="hero"
      style={{ y, opacity: fade }}
      className="relative z-10 flex min-h-[100svh] flex-col justify-center px-6 pb-20 pt-28 md:px-10"
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* Available badge */}
        <motion.div {...fp(0.1)} className="mb-8">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/8 px-4 py-2 font-mono text-[11px] tracking-[0.1em] text-[var(--accent)]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]"
              style={{ animation: reduced ? 'none' : 'dot-pulse 2.2s ease-in-out infinite' }}
            />
            {T.available}
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="mb-6 max-w-4xl text-[clamp(2.6rem,7.5vw,5.5rem)] font-bold leading-[1.04] tracking-[-0.045em] text-[var(--text-primary)]">
          <BlurText text={T.tagline} delay={100} animateBy="words" direction="top" stepDuration={0.4} />
        </h1>

        {/* Subline */}
        <motion.p
          {...fp(0.55)}
          className="mb-10 max-w-[480px] text-[clamp(15px,2vw,17px)] leading-[1.72] text-[var(--text-secondary)]"
        >
          {T.description}
        </motion.p>

        {/* CTA buttons */}
        <motion.div {...fp(0.68)} className="mb-16 flex flex-wrap items-center gap-3">
          <button
            onClick={() => scrollTo('featured')}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[0_10px_30px_rgba(124,106,247,0.4)]"
          >
            {/* Shine sweep */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            {T.cta_primary}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => scrollTo('contact')}
            className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.02] px-7 py-3.5 text-sm font-medium text-[var(--text-secondary)] backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
          >
            <Mail size={15} /> {T.cta_secondary}
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div {...fp(0.82)} className="mb-16 flex gap-8 border-t border-white/[0.06] pt-8 md:gap-14">
          {T.stats.map((stat, i) => (
            <Stat key={i} value={stat.value} label={stat.label} />
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          {...fp(1)}
          onClick={() => scrollTo('featured')}
          className="group flex items-center gap-3"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase transition-colors group-hover:text-[var(--accent)]">
            {T.scroll}
          </span>
          <div className="relative h-8 w-px overflow-hidden bg-white/[0.08]">
            <div
              className="absolute inset-x-0 top-0 h-1/2 bg-[var(--accent)]"
              style={{ opacity: 0.7, animation: reduced ? 'none' : 'scroll-line 1.8s ease-in-out infinite' }}
            />
          </div>
        </motion.button>
      </div>
    </motion.section>
  )
}
