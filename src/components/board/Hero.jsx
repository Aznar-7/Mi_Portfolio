import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { site } from '@/data/site'
import { findSecret } from '@/lib/secrets'
import { createBoard } from './engine'

const SECTIONS = ['trabajo', 'taller', 'trayectoria', 'contacto', 'consola']

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M17 12 V22 L32 41 M47 12 V22 L32 41" fill="none" stroke="#eceef2" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17" cy="12" r="4.5" fill="#eceef2" />
      <circle cx="47" cy="12" r="4.5" fill="#eceef2" />
      <circle cx="32" cy="47" r="7.5" fill="none" stroke="rgb(212,87,78)" strokeWidth="4.5" />
    </svg>
  )
}

// Sticks once the hero copy scrolls away and marks the section in view
function Header({ copyRef }) {
  const { lang, toggle } = useLang()
  const T = copy[lang].nav
  const [stuck, setStuck] = useState(false)
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' })
    io.observe(copyRef.current)
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el) })
    return () => { io.disconnect(); spy.disconnect() }
  }, [copyRef])

  return (
    <header className={`site-header${stuck ? ' stuck' : ''}`}>
      <a href="#top" aria-label="Vicente Aznar"><Mark /></a>
      <nav aria-label={T.label}>
        {SECTIONS.map((id) => (
          <a key={id} href={`#${id}`} aria-current={current === id}>{T[id]}</a>
        ))}
      </nav>
      <button className="lang" onClick={toggle} aria-label={T.lang} lang={lang === 'es' ? 'en' : 'es'}>{T.langShort}</button>
    </header>
  )
}

export function Hero() {
  const { lang } = useLang()
  const T = copy[lang].hero
  const heroRef = useRef(null), canvasRef = useRef(null), partsRef = useRef(null), statusRef = useRef(null), copyRef = useRef(null)

  // the board is rebuilt per language so its labels follow it
  useEffect(() => {
    let board, cancelled = false
    document.fonts.ready.then(() => {
      if (cancelled) return
      const hero = heroRef.current
      board = createBoard({
        root: hero.closest('.site'),
        hero,
        canvas: canvasRef.current,
        partsLayer: partsRef.current,
        statusEl: statusRef.current,
        keepOut: [copyRef.current, statusRef.current, ...hero.querySelectorAll('.site-header nav, .site-header .mark, .site-header .lang')],
        letters: [...hero.querySelectorAll('h1 .l')],
        text: T,
        onComplete: () => findSecret('placa'),
      })
    })
    return () => { cancelled = true; board?.destroy() }
  }, [T])

  const letters = (word, offset) => [...word].map((ch, i) => <span key={offset + i} className="l" aria-hidden="true">{ch}</span>)

  return (
    <section className="hero" id="top" ref={heroRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <Header copyRef={copyRef} />
      <div ref={partsRef} />
      <div className="hero-copy" ref={copyRef}>
        <h1 aria-label={`${T.first} ${T.last}`}>
          {letters(T.first, 0)}<br />{letters(T.last, 100)}
        </h1>
        <p className="lede"><strong>{T.ledeStrong}</strong> {T.lede}</p>
        <div className="cta">
          <a className="btn" href="#trabajo">{T.ctaWork}</a>
          <a className="btn ghost" href={`mailto:${site.email}`}>{T.ctaMail}</a>
        </div>
      </div>
      {/* visual hint only: the parts are reachable as links and the counter would spam screen readers */}
      <p className="status" ref={statusRef} aria-hidden="true" />
    </section>
  )
}
