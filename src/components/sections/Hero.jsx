import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  Download,
  Languages,
  MapPin,
  MonitorUp,
  Sparkles,
} from 'lucide-react'
import { ProgressiveImage } from '@/components/common/ProgressiveImage'
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
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.public_repos) setData(d)
      })
      .catch(() => {})
  }, [username])

  if (!data) return null

  return (
    <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
      {data.public_repos} repos · {data.followers} followers
    </span>
  )
}

function useCounter(target, duration = 1400) {
  const match = /^(\d+)([^0-9.]*)$/.exec(target)
  const isNum = !!match
  const numeric = isNum ? parseInt(match[1], 10) : 0
  const suffix = isNum ? match[2] : ''
  const [val, setVal] = useState(isNum ? `0${suffix}` : target)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const t = setTimeout(() => setStarted(true), 700)
          obs.disconnect()
          return () => clearTimeout(t)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started || !isNum) return

    let raf = null
    let startTs = null
    const step = (ts) => {
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
    <div ref={ref} className="flex min-w-0 flex-col gap-1">
      <span className="font-mono text-[1.25rem] font-black leading-none text-white sm:text-[1.65rem]">
        {count}
      </span>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </span>
    </div>
  )
}

function AnimatedTitle({ text }) {
  return (
    <span className="inline-flex flex-wrap gap-x-[0.18em] gap-y-2">
      {text.split(' ').map((word, i) => (
        <motion.span
          key={word}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.14 + 0.08 }}
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
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -28])
  const panelY = useTransform(scrollYProgress, [0, 1], [0, 22])
  const githubUser = site.github?.split('github.com/')?.[1] ?? ''
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const fp = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay },
        }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-4 pb-24 pt-28 sm:px-6 sm:pb-28 lg:pt-24"
    >
      <motion.div
        aria-hidden="true"
        style={{ y: visualY }}
        className="pointer-events-none absolute inset-0 z-0 opacity-80"
      >
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,184,166,0.1),transparent_34%,rgba(124,106,247,0.1)_72%,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.09),transparent_60%)]" />
        <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      </motion.div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        <div className="min-w-0">
          <motion.div {...fp(0)} className="mb-7 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3.5 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                {T.available}
              </span>
            </div>
            <GitHubLive username={githubUser} />
          </motion.div>

          <motion.div {...fp(0.08)} className="mb-5 flex flex-wrap items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/48">
            <span className="inline-flex items-center gap-1.5 text-[var(--accent-hover)]">
              <Sparkles size={13} />
              {site.role}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/22" />
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} />
              Argentina
            </span>
          </motion.div>

          <h1 className="max-w-3xl text-[clamp(2.65rem,8vw,6.4rem)] font-black leading-[0.96] text-white">
            <AnimatedTitle text={site.name} />
          </h1>

          <motion.p {...fp(0.26)} className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            {T.description}
          </motion.p>

          <motion.div {...fp(0.36)} className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
            <MagneticButton strength={0.24} radius={90} className="w-full sm:w-auto">
              <button
                onClick={() => scrollTo('featured')}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-black shadow-[0_18px_55px_-22px_rgba(255,255,255,0.8)] transition hover:-translate-y-0.5 hover:bg-white/92 active:translate-y-0 sm:w-auto"
              >
                {T.cta_primary}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </MagneticButton>

            <MagneticButton strength={0.24} radius={90} className="w-full sm:w-auto">
              <a
                href="/ResumeVicenteAznar.pdf"
                download="Vicente_Aznar_CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.1] active:translate-y-0 sm:w-auto"
              >
                <Download size={16} className="text-white/65 transition-colors group-hover:text-white" />
                {lang === 'es' ? 'Descargar CV' : 'Download CV'}
              </a>
            </MagneticButton>

            <MagneticButton strength={0.24} radius={90} className="w-full sm:w-auto">
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('open-ubuntu'))}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#E95420]/12 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#E95420]/35 hover:bg-[#E95420]/18 active:translate-y-0 sm:w-auto"
                title="Boot Ubuntu OS Simulation"
              >
                <MonitorUp size={16} className="text-[#ff9b72]" />
                {lang === 'es' ? 'Abrir OS' : 'Open OS'}
              </button>
            </MagneticButton>
          </motion.div>

          <motion.div {...fp(0.46)} className="mt-8 grid grid-cols-3 gap-3 sm:max-w-xl">
            {T.stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3.5 backdrop-blur-sm">
                <Stat value={stat.value} label={stat.label} />
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          {...fp(0.2)}
          style={{ y: panelY }}
          className="relative mx-auto flex w-full max-w-[520px] items-center justify-center lg:max-w-none"
        >
          <div className="relative w-full min-h-[420px] sm:min-h-[500px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,420px)] w-[min(70vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(54vw,330px)] w-[min(54vw,330px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--accent)]/20" />
            <motion.div
              animate={reduced ? {} : { rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[min(78vw,455px)] w-[min(78vw,455px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.08]"
            />

            <div className="absolute left-1/2 top-1/2 h-[min(62vw,350px)] w-[min(62vw,350px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-white/[0.1] bg-white/[0.035] shadow-[0_30px_80px_-36px_rgba(0,0,0,0.9)]">
              <ProgressiveImage
                src="/port.jpg"
                alt="Vicente Aznar"
                eager
                wrapperClassName="h-full w-full rounded-full"
                className="h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-black/45 via-transparent to-white/[0.04]" />
            </div>

            <div className="absolute right-1 top-20 flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0c0d13]/82 px-3 py-2 backdrop-blur-md sm:right-8">
              <Languages size={14} className="text-[var(--accent-hover)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/62">
                {T.portrait_language}
              </span>
            </div>

            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-hover)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/48">
                {T.portrait_signal}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.button
        {...fp(0.6)}
        onClick={() => scrollTo('featured')}
        whileHover={reduced ? {} : { y: -4 }}
        whileTap={{ scale: 0.96 }}
        className="cursor-target group absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50 transition hover:text-white sm:bottom-7"
        aria-label={T.scroll_label}
      >
        <motion.div
          animate={reduced ? {} : { y: [0, -3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] backdrop-blur-md sm:text-[10px]"
        >
          <span>{T.scroll}</span>
          <ArrowDown size={12} className="ml-2 text-[var(--accent-hover)]" />
        </motion.div>
        <div className="relative mt-1 flex h-12 w-6 justify-center overflow-hidden">
          <span className="absolute top-0 h-full w-px bg-white/10" />
          <motion.span
            animate={reduced ? {} : { y: [-18, 44], opacity: [0, 1, 0] }}
            transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 h-5 w-px bg-gradient-to-b from-transparent via-[var(--accent-hover)] to-transparent shadow-[0_0_12px_rgba(155,140,255,0.8)]"
          />
          <motion.span
            animate={reduced ? {} : { scale: [0.8, 1.2, 0.8], opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-[var(--accent-hover)]"
          />
        </div>
      </motion.button>
    </section>
  )
}
