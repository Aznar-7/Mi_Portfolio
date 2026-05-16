import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Code2, Database, Download, Globe, Layers, MapPin, MonitorUp, Server, Sparkles } from 'lucide-react'
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
  const words = text.split(' ')

  return (
    <span className="inline-flex flex-wrap gap-x-[0.18em] gap-y-2">
      {words.map((word, i) => (
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
  const panelY = useTransform(scrollYProgress, [0, 1], [0, 24])
  const githubUser = site.github?.split('github.com/')?.[1] ?? ''
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const workSignals = lang === 'es'
    ? ['Arquitectura full-stack', 'UX clara', 'Deploy cloud', 'Código mantenible']
    : ['Full-stack architecture', 'Clear UX', 'Cloud deploy', 'Maintainable code']
  const stack = [
    { icon: Code2, label: 'Frontend', value: 'React / Vite' },
    { icon: Server, label: 'Backend', value: 'Django / APIs' },
    { icon: Database, label: 'Data', value: 'PostgreSQL' },
    { icon: Globe, label: 'Infra', value: 'Linux / Cloud' },
  ]

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
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,184,166,0.12),transparent_32%,rgba(124,106,247,0.12)_68%,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
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
          className="relative mx-auto w-full max-w-[560px] lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0c0d13]/88 shadow-[0_28px_90px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/34">
                {T.preview_label}
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#090b10] p-4 sm:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(124,106,247,0.12),transparent_38%,rgba(20,184,166,0.1))]" />
                <div className="relative flex items-start justify-between gap-5">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      {T.panel_kicker}
                    </p>
                    <h2 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
                      {T.panel_title}
                    </h2>
                  </div>
                  <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-[var(--accent-hover)] sm:flex">
                    <Layers size={22} />
                  </div>
                </div>

                <div className="relative mt-5 rounded-lg border border-white/[0.06] bg-black/35 p-3 font-mono text-[11px] leading-6 text-white/58">
                  <p><span className="text-emerald-300">vicente@portfolio</span>:~$ build --scope product</p>
                  <p className="text-white/38">analyzing needs... ok</p>
                  <p className="text-white/38">shipping interface + backend + deploy... ok</p>
                  <p><span className="text-[var(--accent-hover)]">{T.panel_status}</span></p>
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-2.5">
                  {workSignals.map((signal) => (
                    <div key={signal} className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-[12px] font-semibold text-white/70">
                      {signal}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {stack.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center gap-2 text-[var(--accent-hover)]">
                      <Icon size={15} />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">
                        {label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-6 text-white/76">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.button
        {...fp(0.6)}
        onClick={() => scrollTo('featured')}
        className="cursor-target absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/42 transition hover:text-white/80 sm:bottom-7"
        aria-label={T.scroll_label}
      >
        <div className="flex items-center font-mono text-[9px] uppercase tracking-[0.2em] sm:text-[10px]">
          <span className="mr-2 font-bold text-[var(--accent)]/70">{'>'}</span>
          <span>{T.scroll}</span>
          <span className="ml-2 inline-block h-3 w-1.5 animate-[blink_1s_step-end_infinite] bg-[var(--accent)]/80" />
        </div>
        <div className="relative mt-1 h-10 w-px overflow-hidden bg-white/8">
          <div className="absolute left-0 top-0 h-1/2 w-full animate-[scroll-line_2s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[var(--accent)] to-transparent" />
        </div>
      </motion.button>
    </section>
  )
}
