import { useState, useEffect } from 'react'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { site } from '@/data/site'

const NAV_LINKS = [
  { id: 'featured', label: 'Proyecto' },
  { id: 'experience', label: 'Experiencia' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contacto' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const activeId = useScrollSpy(NAV_LINKS.map((l) => l.id))

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: scrolled ? 'rgba(10,10,15,0.85)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background-color 0.3s, border-color 0.3s, backdrop-filter 0.3s',
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
        }}
      >
        <a
          href="#hero"
          style={{
            fontWeight: 600,
            fontSize: '16px',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          {site.name}
        </a>

        <ul
          style={{
            display: 'flex',
            gap: '4px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                style={{
                  fontSize: '14px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  transition: 'color 0.2s, background-color 0.2s',
                  color: activeId === link.id ? 'var(--accent-hover)' : 'var(--text-secondary)',
                  backgroundColor: activeId === link.id ? 'var(--accent-glow)' : 'transparent',
                  display: 'block',
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
