import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { site } from '@/data/site'
import GooeyNav from '@/components/layout/GooeyNav'

const NAV_IDS = ['featured', 'experience', 'projects', 'skills', 'contact']

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const activeId = useScrollSpy(NAV_IDS)
  const { lang, toggle } = useLang()
  const T = translations[lang].nav

  const NAV_LINKS = [
    { id: 'featured',    label: T.project },
    { id: 'experience',  label: T.experience },
    { id: 'projects',    label: T.projects },
    { id: 'skills',      label: T.skills },
    { id: 'contact',     label: T.contact },
  ]

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        backgroundColor: scrolled ? 'rgba(10,10,15,0.88)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'background-color 0.4s, border-color 0.4s',
      }}
    >
      <nav
        style={{
          maxWidth: '1152px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <a
          href="#hero"
          style={{
            fontWeight: 700,
            fontSize: '15px',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            letterSpacing: '-0.03em',
            flexShrink: 0,
          }}
        >
          {site.name}
        </a>

        {/* Nav links */}
        <GooeyNav
          items={NAV_LINKS}
          activeId={activeId}
          particleCount={10}
          particleDistances={[50, 8]}
          animationTime={450}
          timeVariance={180}
        />

        {/* Language toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle language"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.03)',
            padding: 0,
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
                  padding: '5px 11px',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  color: active ? '#fff' : 'var(--text-muted)',
                  transition: 'color 0.25s',
                  userSelect: 'none',
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
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </span>
            )
          })}
        </button>
      </nav>
    </header>
  )
}
