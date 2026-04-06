import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { site } from '@/data/site'
import GooeyNav from '@/components/layout/GooeyNav'

const NAV_IDS = ['featured', 'experience', 'projects', 'skills', 'contact']

export function Navbar() {
  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)
  const lastY = useRef(0)
  const activeId = useScrollSpy(NAV_IDS)
  const { lang, toggle } = useLang()
  const T = translations[lang].nav

  const NAV_LINKS = [
    { id: 'featured',   label: T.project },
    { id: 'experience', label: T.experience },
    { id: 'projects',   label: T.projects },
    { id: 'skills',     label: T.skills },
    { id: 'contact',    label: T.contact },
  ]

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

  return (
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
          particleCount={8}
          particleDistances={[40, 6]}
          animationTime={400}
          timeVariance={150}
        />
      </div>

      {/* Language toggle */}
      <button
        onClick={toggle}
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
    </motion.header>
  )
}
