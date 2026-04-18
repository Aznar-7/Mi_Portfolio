import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Volume2, VolumeX } from 'lucide-react'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { translations } from '@/i18n/translations'
import { site } from '@/data/site'
import GooeyNav from '@/components/layout/GooeyNav'

const NAV_IDS = ['featured', 'experience', 'projects', 'skills', 'contact']

export function Navbar() {
  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const lastY = useRef(0)
  const activeId = useScrollSpy(NAV_IDS)
  const { lang, toggle } = useLang()
  const { isMuted, toggleMute, playHover, playClick, playNavigation, playToggle } = useSoundEffects()
  const T = translations[lang].nav

  const NAV_LINKS = [
    { id: 'featured',   label: T.project },
    { id: 'experience', label: T.experience },
    { id: 'projects',   label: T.projects },
    { id: 'skills',     label: T.skills },
    { id: 'contact',    label: T.contact },
  ]

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  useEffect(() => {
    const handler = () => {
      const curr = window.scrollY
      const diff = curr - lastY.current
      setAtTop(curr < 60)
      if (curr < 60) { setVisible(true) }
      else if (diff > 6) { setVisible(false) }
      else if (diff < -6) { setVisible(true) }
      lastY.current = curr
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: visible ? 0 : -110, opacity: visible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          translateX: '-50%',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 6px 6px 14px',
          borderRadius: '100px',
          border: `1px solid ${atTop ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.1)'}`,
          backgroundColor: atTop ? 'rgba(10,10,15,0.55)' : 'rgba(10,10,15,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: atTop ? 'none' : '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
          transition: 'background-color 0.4s, border-color 0.4s, box-shadow 0.4s',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Brand mark */}
        <a
          href="#hero"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            paddingRight: '12px',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          {site.name.split(' ').map(p => p[0]).join('.')}
        </a>

        {/* Navigation — hidden on small screens */}
        <div className="hidden sm:flex">
          <GooeyNav
            items={NAV_LINKS}
            activeId={activeId}
            onItemClick={playNavigation}
            particleCount={8}
            particleDistances={[40, 6]}
            animationTime={400}
            timeVariance={150}
          />
        </div>

        {/* Language toggle */}
        <button
          onClick={() => { playToggle(); toggle(); }}
          aria-label="Toggle language"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.03)',
            padding: 0,
            flexShrink: 0,
            marginLeft: '2px',
          }}
        >
          {['ES', 'EN'].map((code) => {
            const active = lang === code.toLowerCase()
            return (
              <span
                key={code}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '5px 10px',
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.07em',
                  color: active ? '#fff' : 'var(--text-muted)',
                  transition: 'color 0.25s',
                  userSelect: 'none',
                  lineHeight: 1,
                }}
              >
                {code}
                {active && (
                  <motion.span
                    layoutId="lang-pill"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '100px',
                      backgroundColor: 'var(--accent)',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
              </span>
            )
          })}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            playToggle()
            toggleMute()
          }}
          onMouseEnter={playHover}
          aria-label="Toggle sound"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            padding: '5px 8px',
            flexShrink: 0,
            marginLeft: '8px',
            color: isMuted ? 'var(--text-muted)' : 'var(--accent)',
            transition: 'all 0.25s',
          }}
          className="hover:text-white hover:border-white/[0.15]"
        >
          {isMuted ? <VolumeX size={14} strokeWidth={2.5} /> : <Volume2 size={14} strokeWidth={2.5} />}
        </button>

        {/* Hamburger — visible only on small screens */}
        <button
          className="sm:hidden flex items-center justify-center h-8 w-8 rounded-full border border-white/[0.08] bg-white/[0.03] text-[var(--text-secondary)] transition-colors hover:text-white ml-2"
          onClick={() => {
            playClick()
            setMobileOpen((v) => !v)
          }}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          style={{ marginLeft: '2px', flexShrink: 0 }}
        >
          {mobileOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 sm:hidden"
            style={{ backgroundColor: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(16px)' }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="flex flex-col items-center justify-center h-full gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.07 + i * 0.06 }}
                  onClick={() => { playNavigation(); scrollTo(link.id); }}
                  className={`px-8 py-4 text-2xl font-bold tracking-tight transition-colors ${
                    activeId === link.id
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  style={{ background: 'none', border: 'none' }}
                >
                  {link.label}
                </motion.button>
              ))}

              {/* Divider */}
              <div className="my-4 h-px w-16 bg-white/[0.06]" />

              {/* Social & lang */}
              <div className="flex items-center gap-4">
                <a
                  href={site.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors uppercase"
                  onClick={() => setMobileOpen(false)}
                >
                  GitHub
                </a>
                <span className="text-white/10">·</span>
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors uppercase"
                  onClick={() => setMobileOpen(false)}
                >
                  LinkedIn
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
