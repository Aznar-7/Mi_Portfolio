import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wifi, Battery, Signal, Copy, Check, ExternalLink, ArrowLeft, ChevronUp } from 'lucide-react'
import { about } from '@/data/about'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'

/* ── helpers ── */
function useClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function pad(n) { return String(n).padStart(2, '0') }

/* ── Status bar ── */
function StatusBar({ time }) {
  const h = pad(time.getHours())
  const m = pad(time.getMinutes())
  return (
    <div className="flex items-center justify-between px-5 pt-2 pb-1">
      <span className="font-mono text-[12px] font-semibold text-white/90">{h}:{m}</span>
      <div className="flex items-center gap-1.5">
        <Signal size={11} className="text-white/80" />
        <Wifi size={11} className="text-white/80" />
        <Battery size={13} className="text-white/80" />
      </div>
    </div>
  )
}

/* ── Lock screen ── */
function LockScreen({ time, onUnlock }) {
  const h = pad(time.getHours())
  const m = pad(time.getMinutes())
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const dateStr = `${days[time.getDay()]}, ${months[time.getMonth()]} ${time.getDate()}`

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-between py-10 cursor-pointer select-none"
      style={{ background: 'linear-gradient(160deg, #0f0c24 0%, #1a1035 50%, #0a0818 100%)' }}
      onClick={onUnlock}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.35 }}
    >
      {/* Ambient blob */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-60 w-60 rounded-full bg-purple-600/20 blur-[80px]" />

      <StatusBar time={time} />

      {/* Clock */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-black text-[5.5rem] leading-none tracking-[-0.04em] text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {h}:{m}
        </span>
        <span className="font-mono text-[13px] tracking-[0.15em] text-white/50 uppercase">{dateStr}</span>
      </div>

      {/* Swipe hint */}
      <motion.div
        className="flex flex-col items-center gap-2"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronUp size={20} className="text-white/40" />
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">tap to unlock</span>
      </motion.div>
    </motion.div>
  )
}

/* ── App icons data ── */
const APPS = [
  {
    id: 'utnhub',
    label: 'UTN Hub',
    bg: 'from-violet-600 to-purple-800',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'skills',
    label: 'Skills',
    bg: 'from-blue-500 to-cyan-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    id: 'about',
    label: 'About',
    bg: 'from-emerald-500 to-teal-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    id: 'contact',
    label: 'Contact',
    bg: 'from-orange-500 to-rose-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    id: 'terminal',
    label: 'Terminal',
    bg: 'from-gray-700 to-gray-900',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
        <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    bg: 'from-slate-600 to-slate-800',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  },
]

/* ── App screens ── */
function AppUTNHub({ lang }) {
  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="rounded-2xl bg-purple-600/10 border border-purple-500/20 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white font-black text-lg">U</div>
          <div>
            <p className="font-semibold text-white text-[15px]">UTN Hub</p>
            <p className="font-mono text-[10px] text-white/40 tracking-wider uppercase">Full-stack platform</p>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-white/60">
          {lang === 'es'
            ? 'Plataforma académica para UTN. React + Django + Oracle Cloud. Sistema completo end-to-end, un solo desarrollador.'
            : 'Academic platform for UTN. React + Django + Oracle Cloud. Full end-to-end system, solo developer.'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Stack', value: '6 techs' },
          { label: 'Arch.', value: '4 layers' },
          { label: lang === 'es' ? 'Infra' : 'Infra', value: 'Oracle' },
          { label: 'Status', value: lang === 'es' ? 'En dev' : 'In dev' },
        ].map(m => (
          <div key={m.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-center">
            <p className="font-black text-white text-[18px]">{m.value}</p>
            <p className="font-mono text-[9px] text-white/35 tracking-wider uppercase mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
      <a
        href="https://github.com/Aznar-7"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-purple-600/20 border border-purple-500/30 py-3 text-[13px] font-semibold text-purple-300"
      >
        <ExternalLink size={14} />
        {lang === 'es' ? 'Ver en GitHub' : 'View on GitHub'}
      </a>
    </div>
  )
}

function AppSkills({ lang }) {
  const CATS = [
    { name: 'Frontend', color: 'text-blue-400', items: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Framer Motion'] },
    { name: 'Backend', color: 'text-emerald-400', items: ['Django', 'Python', 'REST APIs', 'PostgreSQL'] },
    { name: lang === 'es' ? 'Infraestructura' : 'Infrastructure', color: 'text-orange-400', items: ['Oracle Cloud', 'Docker', 'Nginx', 'Linux'] },
    { name: lang === 'es' ? 'Otros' : 'Other', color: 'text-purple-400', items: ['Git', 'Haskell', 'Prolog', 'IoT'] },
  ]
  return (
    <div className="flex flex-col gap-4 p-5">
      {CATS.map(cat => (
        <div key={cat.name}>
          <p className={`font-mono text-[10px] font-semibold tracking-[0.18em] uppercase mb-2 ${cat.color}`}>{cat.name}</p>
          <div className="flex flex-wrap gap-1.5">
            {cat.items.map(s => (
              <span key={s} className="rounded-lg bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 text-[11px] text-white/70">{s}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AppAbout({ lang }) {
  const bio = about.bio[lang] ?? about.bio.es
  return (
    <div className="flex flex-col gap-4 p-5">
      {bio.map((para, i) => (
        <p key={i} className="text-[13px] leading-[1.75] text-white/65">{para}</p>
      ))}
      <div className="mt-2 border-t border-white/[0.06] pt-4 flex flex-col gap-2">
        {about.quickFacts.map(f => {
          const label = typeof f.label === 'string' ? f.label : (f.label[lang] ?? f.label.es)
          const value = typeof f.value === 'string' ? f.value : (f.value[lang] ?? f.value.es)
          return (
            <div key={label} className="flex items-start gap-3">
              <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
              <div>
                <p className="font-mono text-[9px] tracking-wider text-white/30 uppercase">{label}</p>
                <p className="text-[12px] text-white/70">{value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AppContact({ lang }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(site.email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }
  const socials = [
    { label: 'GitHub', href: site.github },
    { label: 'LinkedIn', href: site.linkedin },
  ]
  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <p className="font-mono text-[10px] tracking-[0.18em] text-white/30 uppercase mb-2">Email</p>
        <button
          onClick={copy}
          className="w-full flex items-center justify-between rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3 text-[13px] text-white/80 transition hover:bg-white/[0.08]"
        >
          <span className="truncate">{site.email}</span>
          {copied ? <Check size={14} className="text-emerald-400 shrink-0 ml-2" /> : <Copy size={14} className="text-white/30 shrink-0 ml-2" />}
        </button>
      </div>
      <div>
        <p className="font-mono text-[10px] tracking-[0.18em] text-white/30 uppercase mb-2">{lang === 'es' ? 'Redes' : 'Socials'}</p>
        <div className="flex flex-col gap-2">
          {socials.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3 text-[13px] text-white/80 transition hover:bg-white/[0.08]"
            >
              {s.label}
              <ExternalLink size={13} className="text-white/30" />
            </a>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-70" />
          <span className="relative block h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[12px] text-emerald-300/80">
          {lang === 'es' ? 'Disponible para proyectos' : 'Available for projects'}
        </span>
      </div>
    </div>
  )
}

function AppTerminal({ lang }) {
  const COMMANDS = [
    { cmd: 'whoami', out: 'Vicente Aznar — Full Stack Developer' },
    { cmd: 'cat stack.txt', out: 'React · Django · Oracle Cloud · PostgreSQL · Docker' },
    { cmd: lang === 'es' ? 'echo $LOCATION' : 'echo $LOCATION', out: 'Argentina 🇦🇷' },
    { cmd: 'git log --oneline -1', out: 'f6706b8 feat: portfolio v2' },
    { cmd: 'echo $STATUS', out: lang === 'es' ? 'Abierto a oportunidades ✓' : 'Open to opportunities ✓' },
  ]
  return (
    <div className="p-4">
      <div className="rounded-xl bg-[#0d0d0d] border border-white/[0.08] p-4 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 mb-4">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 text-white/20 text-[10px]">bash</span>
        </div>
        {COMMANDS.map((c, i) => (
          <div key={i} className="mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">~</span>
              <span className="text-purple-400">$</span>
              <span className="text-white/80">{c.cmd}</span>
            </div>
            <div className="mt-0.5 ml-4 text-white/40">{c.out}</div>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400">~</span>
          <span className="text-purple-400">$</span>
          <span className="inline-block h-3.5 w-px bg-white/60 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function AppGitHub() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-5">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-[15px]">@Aznar-7</p>
        <p className="text-white/40 text-[12px] mt-1">github.com/Aznar-7</p>
      </div>
      <a
        href={site.github}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-xl bg-white/[0.08] border border-white/[0.12] px-6 py-3 text-[13px] font-semibold text-white/80"
      >
        <ExternalLink size={14} />
        Open GitHub
      </a>
    </div>
  )
}

/* ── App drawer ── */
const APP_SCREENS = {
  utnhub:   AppUTNHub,
  skills:   AppSkills,
  about:    AppAbout,
  contact:  AppContact,
  terminal: AppTerminal,
  github:   AppGitHub,
}

const APP_TITLES = {
  utnhub:   { es: 'UTN Hub',    en: 'UTN Hub' },
  skills:   { es: 'Skills',     en: 'Skills' },
  about:    { es: 'Sobre mí',   en: 'About' },
  contact:  { es: 'Contacto',   en: 'Contact' },
  terminal: { es: 'Terminal',   en: 'Terminal' },
  github:   { es: 'GitHub',     en: 'GitHub' },
}

/* ── Home screen ── */
function HomeScreen({ time, onOpenApp }) {
  const h = pad(time.getHours())
  const m = pad(time.getMinutes())
  const dockApps = APPS.slice(0, 4)

  return (
    <motion.div
      className="absolute inset-0 flex flex-col select-none"
      style={{ background: 'linear-gradient(170deg, #120e2a 0%, #0c0820 60%, #080614 100%)' }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28 }}
    >
      {/* Ambient */}
      <div className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-purple-600/15 blur-[70px]" />

      <StatusBar time={time} />

      {/* Mini clock */}
      <div className="text-center mt-6 mb-8">
        <p className="font-black text-[3rem] leading-none tracking-[-0.03em] text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {h}:{m}
        </p>
      </div>

      {/* App grid */}
      <div className="flex-1 px-5">
        <div className="grid grid-cols-3 gap-x-4 gap-y-5">
          {APPS.map(app => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${app.bg} flex items-center justify-center shadow-lg transition-transform duration-150 group-active:scale-90`}>
                {app.icon}
              </div>
              <span className="text-[10px] text-white/70 font-medium leading-tight text-center">{app.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dock */}
      <div className="px-5 pb-6">
        <div className="flex items-center justify-around rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/[0.1] py-3 px-2">
          {dockApps.map(app => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${app.bg} flex items-center justify-center shadow-md transition-transform duration-150 active:scale-90`}
            >
              {app.icon}
            </button>
          ))}
        </div>
        {/* Home indicator */}
        <div className="mt-3 flex justify-center">
          <div className="h-1 w-28 rounded-full bg-white/25" />
        </div>
      </div>
    </motion.div>
  )
}

/* ── App drawer screen ── */
function AppDrawer({ appId, lang, onBack }) {
  const Screen = APP_SCREENS[appId]
  const title  = APP_TITLES[appId]?.[lang] ?? appId

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: 'linear-gradient(160deg, #100c25 0%, #0a0818 100%)' }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* App top bar */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-3 border-b border-white/[0.06]">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.07] text-white/60 transition active:scale-90"
        >
          <ArrowLeft size={15} />
        </button>
        <span className="font-semibold text-white/90 text-[15px]">{title}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {Screen ? <Screen lang={lang} /> : null}
      </div>
    </motion.div>
  )
}

/* ── Main component ── */
export function AndroidOS({ onClose }) {
  const time       = useClock()
  const { lang }   = useLang()
  const [screen, setScreen] = useState('lock') // 'lock' | 'home' | appId

  const handleUnlock = useCallback(() => setScreen('home'), [])
  const handleOpenApp = useCallback((id) => setScreen(id), [])
  const handleBack    = useCallback(() => setScreen('home'), [])

  // Close on Escape
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isApp = screen !== 'lock' && screen !== 'home'

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop — desktop only */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      />

      {/* Phone frame */}
      <motion.div
        className="relative overflow-hidden bg-[#0a0818]
          /* Mobile: full screen */
          w-full h-full rounded-none
          /* Desktop: phone frame */
          md:w-[375px] md:h-[780px] md:rounded-[44px] md:shadow-[0_0_0_10px_#1a1630,0_0_0_11px_#2a2040,0_40px_120px_rgba(0,0,0,0.8)]"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Notch (desktop) */}
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 z-10 h-7 w-28 rounded-b-2xl bg-[#0a0818] items-center justify-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-white/15" />
          <div className="h-2 w-12 rounded-full bg-white/10" />
        </div>

        {/* Close button — desktop only */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-3 right-[-46px] z-20 h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Mobile close — top right corner pill */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-white/[0.12] px-3 py-1.5 text-white/60 text-[11px] font-mono backdrop-blur-sm"
        >
          <X size={12} />
          close
        </button>

        {/* Screens */}
        <AnimatePresence mode="wait">
          {screen === 'lock' && (
            <LockScreen key="lock" time={time} onUnlock={handleUnlock} />
          )}
          {screen === 'home' && (
            <HomeScreen key="home" time={time} onOpenApp={handleOpenApp} />
          )}
          {isApp && (
            <AppDrawer key={screen} appId={screen} lang={lang} onBack={handleBack} />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
