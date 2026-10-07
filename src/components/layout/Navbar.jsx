import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, VolumeX } from 'lucide-react'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { translations } from '@/i18n/translations'
import { site } from '@/data/site'
import { cn } from '@/lib/utils'

const NAV_IDS = ['featured', 'experience', 'projects', 'skills', 'about', 'contact']
const NAV_KEYS = { featured: 'project', experience: 'experience', projects: 'projects', skills: 'skills', about: 'about', contact: 'contact' }

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

// Three bars that bounce while sound is on
function SoundBars() {
  return (
    <span aria-hidden="true" className="flex h-3.5 items-end gap-[2px]">
      {[0, 0.2, 0.4].map((delay) => (
        <motion.span
          key={delay}
          className="w-[2px] rounded-full bg-current"
          animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay }}
        />
      ))}
    </span>
  )
}

// Fade the page content out, swap language at the low point, fade back in
function switchLanguage(toggle) {
  const main = document.querySelector('main')
  if (!main?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return toggle()
  main.animate([{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0.15, filter: 'blur(4px)' }], { duration: 160, easing: 'ease-in', fill: 'forwards' })
    .finished.then(() => {
      toggle()
      main.animate([{ opacity: 0.15, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: 260, easing: 'ease-out', fill: 'forwards' })
    })
}

function LangToggle({ lang, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={lang === 'es' ? 'Switch to English' : 'Cambiar a español'}
      className="relative flex shrink-0 items-center rounded-full border border-[var(--line)] p-0.5 text-[11px] font-semibold"
    >
      {['es', 'en'].map((code) => (
        <span
          key={code}
          className={cn(
            'relative z-10 rounded-full px-2.5 py-1 uppercase transition-colors duration-200',
            lang === code ? 'text-[var(--bg-base)]' : 'text-[var(--text-muted)]',
          )}
        >
          {code}
          {lang === code && (
            <motion.span
              layoutId="lang-pill"
              className="absolute inset-0 -z-10 rounded-full bg-[var(--text-primary)]"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
        </span>
      ))}
    </button>
  )
}

export function Navbar() {
  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const lastY = useRef(0)
  const activeId = useScrollSpy(NAV_IDS)
  const { lang, toggle } = useLang()
  const { isMuted, toggleMute, playClick, playHover, playNavigation, playToggle } = useSoundEffects()
  const T = translations[lang].nav
  const links = NAV_IDS.map((id) => ({ id, label: T[NAV_KEYS[id]] }))

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY
      const diff = y - lastY.current
      setAtTop(y < 40)
      if (y < 40 || diff < -6) setVisible(true)
      else if (diff > 6) setVisible(false)
      lastY.current = y
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const go = (id) => {
    playNavigation()
    scrollToId(id)
    setMobileOpen(false)
  }

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: visible || mobileOpen ? 0 : -96 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300',
          atTop && !mobileOpen
            ? 'border-transparent bg-transparent'
            : 'border-[var(--line)] bg-[var(--bg-base)]/80 backdrop-blur-xl',
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-6">
          <a
            href="#hero"
            data-brand-mark
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="mr-auto text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]"
          >
            {site.name}
          </a>

          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {links.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => { e.preventDefault(); go(id) }}
                    onMouseEnter={playHover}
                    aria-current={activeId === id ? 'true' : undefined}
                    className={cn(
                      'relative block rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200',
                      activeId === id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                    )}
                  >
                    {activeId === id && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LangToggle lang={lang} onToggle={() => { playToggle(); switchLanguage(toggle) }} />
            <button
              onClick={toggleMute}
              onMouseEnter={playHover}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
              aria-pressed={!isMuted}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] transition-colors hover:text-[var(--text-primary)]',
                isMuted ? 'text-[var(--text-muted)]' : 'text-[var(--accent-hover)]',
              )}
            >
              {isMuted ? <VolumeX size={14} aria-hidden="true" /> : <SoundBars />}
            </button>
            <button
              onClick={() => { playClick(); setMobileOpen((v) => !v) }}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-[var(--text-secondary)] md:hidden"
            >
              {mobileOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--bg-base)]/97 backdrop-blur-xl md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <nav aria-label="Principal" className="flex h-full flex-col justify-center px-8" onClick={(e) => e.stopPropagation()}>
              {links.map(({ id, label }, i) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => { e.preventDefault(); go(id) }}
                  className={cn(
                    'border-b border-[var(--line)] py-4 text-3xl font-semibold tracking-[-0.03em]',
                    activeId === id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]',
                  )}
                >
                  {label}
                </motion.a>
              ))}
              <div className="mt-8 flex gap-6 text-sm text-[var(--text-secondary)]">
                <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
