import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import BlurText from '@/components/common/BlurText'
import { MagneticButton } from '@/components/common/MagneticButton'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { site } from '@/data/site'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function GitHubLive({ username }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!username || username === 'YOUR_GITHUB') return
    fetch(`https://api.github.com/users/${username}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.public_repos) setData(d) })
      .catch(() => {})
  }, [username])
  if (!data) return null
  return (
    <span className="rounded-full border border-white/[0.07] px-2.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
      {data.public_repos} repos · {data.followers} followers
    </span>
  )
}

function useCounter(target, duration = 1400) {
  const match   = /^(\d+)([^0-9.]*)$/.exec(target)
  const isNum   = !!match
  const numeric = isNum ? parseInt(match[1], 10) : 0
  const suffix  = isNum ? match[2] : ''
  const [val, setVal]         = useState(isNum ? `0${suffix}` : target)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const t = setTimeout(() => setStarted(true), 700)
        obs.disconnect()
        return () => clearTimeout(t)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started || !isNum) return
    let raf = null, startTs = null
    const step = ts => {
      if (!startTs) startTs = ts
      const t = Math.min((ts - startTs) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(`${Math.floor(eased * numeric)}${suffix}`)
      if (t < 1) raf = requestAnimationFrame(step)
      else setVal(`${numeric}${suffix}`)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [started]) // eslint-disable-line react-hooks/exhaustive-deps

  return [val, ref]
}

function Stat({ value, label }) {
  const [count, ref] = useCounter(value)
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 sm:gap-1.5 w-full text-center">
      <span className="font-mono text-[1.4rem] sm:text-[2.1rem] font-black leading-none tracking-tighter text-[var(--text-primary)]">
        {count}
      </span>
      <span className="font-mono text-[8px] sm:text-[10px] font-semibold tracking-[0.1em] text-[var(--text-muted)] uppercase">
        {label}
      </span>
    </div>
  )
}

// A more reliable BlurText implementation for the hero title that handles word wrapping gracefully
function AnimatedTitle({ text }) {
  const words = text.split(' ')
  return (
    <span className="inline-flex flex-wrap justify-center gap-x-[0.2em] gap-y-2">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 + 0.1 }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

export function Hero() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].hero

  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const y    = useTransform(scrollYProgress, [0, 1], [0, -50])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const githubUser = site.github?.split('github.com/')?.[1] ?? ''

  const fp = (delay = 0) =>
    reduced ? {} : {
      initial:    { opacity: 0, y: 30, filter: 'blur(10px)' },
      animate:    { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay },
    }

  return (
    <motion.section
      ref={sectionRef}
      id="hero"
      style={{ y, opacity: fade }}
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12 overflow-hidden"
    >
      {/* Background Orbs & Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-[var(--accent)]/10 to-indigo-500/10 blur-[120px] rounded-[100%] opacity-50" />
        <div className="absolute left-[30%] top-[30%] w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="absolute right-[30%] bottom-[30%] w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl flex flex-col items-center text-center">
        
        {/* Status / Github Badge */}
        <motion.div {...fp(0)} className="mb-8 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-md transition-colors hover:bg-white/[0.05]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] sm:text-xs font-medium text-emerald-400/90 tracking-wide uppercase">
              {T.available}
            </span>
          </div>
          <GitHubLive username={githubUser} />
        </motion.div>

        {/* Role & Location */}
        <motion.div {...fp(0.1)} className="mb-4 font-mono text-[11px] sm:text-xs tracking-[0.2em] text-white/50 uppercase font-medium flex items-center gap-3">
          <span className="text-[var(--accent)]">{site.role}</span>
          <span className="h-1 w-1 bg-white/20 rounded-full" />
          <span>Argentina</span>
        </motion.div>

        {/* Main Name Heading */}
        <h1 className="mb-6 w-full text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight text-white drop-shadow-sm">
          <AnimatedTitle text={site.name} />
        </h1>

        {/* Short bio/description */}
        <motion.p
          {...fp(0.3)}
          className="mb-10 max-w-2xl px-4 text-base sm:text-lg md:text-xl text-white/60 leading-relaxed font-light"
        >
          {T.description}
        </motion.p>

        {/* Action Buttons */}
        <motion.div {...fp(0.4)} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 mb-14">
          <MagneticButton strength={0.3} radius={80} className="w-full sm:w-auto">
            <button
              onClick={() => scrollTo('featured')}
              className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:scale-105 active:scale-95"
            >
              {T.cta_primary}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </MagneticButton>

          {/* Android — mobile only */}
          <MagneticButton strength={0.3} radius={80} className="w-full sm:w-auto md:hidden">
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('open-android'))}
              className="group relative flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-[#3ddc84]/20 bg-[#3ddc84]/[0.07] px-8 py-3.5 text-sm font-medium text-[#5df5a0] backdrop-blur-md transition-all hover:bg-[#3ddc84]/[0.14] hover:border-[#3ddc84]/40 hover:scale-105 active:scale-95"
              title="Open Android Simulation"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M17.523 15.341a.5.5 0 1 1-.001 1 .5.5 0 0 1 .001-1m-11.046 0a.5.5 0 1 1-.001 1 .5.5 0 0 1 .001-1M17.7 9H6.3A.3.3 0 0 0 6 9.3v6.4a.3.3 0 0 0 .3.3h11.4a.3.3 0 0 0 .3-.3V9.3A.3.3 0 0 0 17.7 9M4.5 9.5h-1a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5m16 0h-1a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5M15.157 3.5l1.065-1.896a.25.25 0 1 0-.434-.25L14.69 3.27A6.994 6.994 0 0 0 12 2.75c-.94 0-1.84.19-2.69.52L8.212 1.354a.25.25 0 1 0-.434.25L8.843 3.5A7.248 7.248 0 0 0 4.75 9h14.5A7.248 7.248 0 0 0 15.157 3.5"/>
              </svg>
              Android
            </button>
          </MagneticButton>

          {/* Ubuntu — desktop only */}
          <MagneticButton strength={0.3} radius={80} className="hidden md:block">
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('open-ubuntu'))}
              className="group relative w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95"
              title="Boot Ubuntu OS Simulation"
            >
              <div className="w-5 h-5 rounded-full bg-[#E95420] text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M12,0C5.37,0,0,5.37,0,12c0,6.63,5.37,12,12,12c6.63,0,12-5.37,12-12C24,5.37,18.63,0,12,0z M19.46,15.68c-0.67,1.15-2.18,1.55-3.33,0.88c-1.92-1.11-4.32-1.11-6.25,0c-1.15,0.67-2.65,0.27-3.33-0.88c-0.67-1.15-0.27-2.65,0.88-3.33c2.88-1.66,6.48-1.66,9.36,0C19.74,13.03,20.13,14.53,19.46,15.68z M12,3.31c4.8,0,8.69,3.89,8.69,8.69s-3.89,8.69-8.69,8.69S3.31,16.8,3.31,12S7.2,3.31,12,3.31z M6.92,12c0-2.81,2.27-5.08,5.08-5.08s5.08,2.27,5.08,5.08s-2.27,5.08-5.08,5.08S6.92,14.81,6.92,12z" />
                </svg>
              </div>
              Simulación OS
            </button>
          </MagneticButton>
        </motion.div>

        {/* Stats Section with Glassmorphism */}
        <motion.div {...fp(0.5)} className="grid grid-cols-3 md:flex md:flex-row items-center justify-center gap-2 sm:gap-6 bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm rounded-2xl p-4 sm:p-6 w-full lg:w-auto">
          {T.stats.map((stat, i) => (
            <div key={i} className="flex items-center w-full justify-center lg:w-auto text-center">
              {i > 0 && <div className="hidden md:block mx-6 h-10 w-px bg-white/10" />}
              <Stat value={stat.value} label={stat.label} />
            </div>
          ))}
        </motion.div>
        
      </div>

      {/* Scroll indicator (absolute positioned to bottom) */}
      <motion.button
        {...fp(0.6)}
        onClick={() => scrollTo('featured')}
        className="absolute bottom-6 sm:bottom-10 flex flex-col items-center gap-2 group z-10"
      >
        <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-white/30 uppercase transition-colors group-hover:text-white/70">
          {T.scroll}
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent group-hover:from-white/50 transition-all origin-top group-hover:scale-y-110" />
      </motion.button>
    </motion.section>
  )
}
