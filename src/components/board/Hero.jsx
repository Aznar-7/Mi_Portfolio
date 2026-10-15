import { useEffect, useRef, useState } from 'react'
import { Download, History, TerminalSquare, Volume2, VolumeX } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { copy } from '@/i18n/site'
import { site } from '@/data/site'
import { findSecret } from '@/lib/secrets'
import { useLatestPush, timeAgo } from '@/hooks/useLatestPush'
import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { powerOn } from '@/lib/power'
import { createBoard } from './engine'

const SECTIONS = ['trabajo', 'sobre', 'taller', 'trayectoria', 'contacto', 'consola']
const githubUser = site.github.split('github.com/')[1]

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
  const { isMuted, toggleMute, playHover, playNavigation, playToggle } = useSoundEffects()
  const T = copy[lang].nav
  const [stuck, setStuck] = useState(false)
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    // back on the hero nothing is current
    const io = new IntersectionObserver(([e]) => { setStuck(!e.isIntersecting); if (e.isIntersecting) setCurrent(null) }, { rootMargin: '-80px 0px 0px 0px' })
    io.observe(copyRef.current)
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)), { rootMargin: '-40% 0px -55% 0px' })
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el) })
    return () => { io.disconnect(); spy.disconnect() }
  }, [copyRef])

  return (
    <header className={`site-header${stuck ? ' stuck' : ''}`}>
      <a href="#top" aria-label="Vicente Aznar" onClick={playNavigation}><Mark /></a>
      <nav aria-label={T.label}>
        {SECTIONS.map((id) => (
          <a key={id} href={`#${id}`} aria-current={current === id} onPointerEnter={playHover} onClick={playNavigation}>{T[id]}</a>
        ))}
      </nav>
      <div className="tools-bar">
        <a className="icon-btn" href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" onPointerEnter={playHover}><GitHubIcon size={17} /></a>
        <a className="icon-btn" href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" onPointerEnter={playHover}><LinkedInIcon size={17} /></a>
        <button className={`icon-btn${isMuted ? '' : ' on'}`} onClick={toggleMute} aria-pressed={!isMuted} aria-label={isMuted ? T.soundOff : T.soundOn}>
          {isMuted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
        </button>
        <button className="icon-btn lang" onClick={() => { playToggle(); toggle() }} aria-label={T.lang}>{T.langShort}</button>
      </div>
    </header>
  )
}

// The portrait sits on the board as part U0: a calm duotone in the board's silkscreen tones that
// turns to full colour on hover, so the face reads first and the effect stays quiet.
function Portrait({ alt }) {
  // a gentle lean toward the pointer, at most a few degrees
  const lean = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--rx', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`)
    e.currentTarget.style.setProperty('--ry', `${(0.5 - (e.clientY - r.top) / r.height) * 8}deg`)
  }
  const rest = (e) => { e.currentTarget.style.removeProperty('--rx'); e.currentTarget.style.removeProperty('--ry') }
  return (
    <figure className="hero-photo" tabIndex={0} onPointerMove={lean} onPointerLeave={rest}>
      <img src="/port.jpg" alt={alt} width="400" height="400" fetchPriority="high" />
    </figure>
  )
}

export function Hero() {
  const { lang } = useLang()
  const { playClick, playHover, playSuccess } = useSoundEffects()
  const T = copy[lang].hero
  const push = useLatestPush(githubUser)
  const heroRef = useRef(null), canvasRef = useRef(null), partsRef = useRef(null), statusRef = useRef(null), copyRef = useRef(null), frameRef = useRef(null)
  // the engine lives outside React; it reads the latest sound callbacks through a ref
  const sounds = useRef({})
  useEffect(() => { sounds.current = { playClick, playHover, playSuccess } })

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
        keepOut: [copyRef.current, statusRef.current, ...hero.querySelectorAll('.site-header nav, .site-header .mark, .site-header .tools-bar')],
        photo: frameRef.current.querySelector('.hero-photo'),
        frame: frameRef.current,
        letters: [...hero.querySelectorAll('h1 .l')],
        text: T,
        onComplete: () => { sounds.current.playSuccess?.(); findSecret('placa') },
        onSolder: () => sounds.current.playClick?.(),
        onPartHover: () => sounds.current.playHover?.(),
      })
    })
    return () => { cancelled = true; board?.destroy() }
  }, [T])

  const letters = (word, offset, cls = 'l') => [...word].map((ch, i) => <span key={offset + i} className={cls} aria-hidden="true">{ch}</span>)

  return (
    <section className="hero" id="top" ref={heroRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <Header copyRef={copyRef} />
      <div ref={partsRef} />
      <div className="hero-frame" ref={frameRef}>
      <Portrait alt={T.portrait} />
      <div className="hero-copy" ref={copyRef}>
        <div className="hero-meta">
          <img src="/port.jpg" alt={T.portrait} width="44" height="44" />
          <p>
            <span className="avail"><i className="led live" />{T.available}</span>
            <span>{T.place}</span>
          </p>
        </div>
        <h1 aria-label={`${T.first} ${T.last}`}>
          {letters(T.first, 0)}<br />{letters(T.last, 100, 'l last')}
        </h1>
        <p className="lede"><strong>{T.ledeStrong}</strong> {T.lede}</p>
        <div className="cta">
          <a className="btn" href="#trabajo" onClick={playClick}>{T.ctaWork}</a>
          <a className="btn ghost" href={`mailto:${site.email}`} onClick={playClick}>{T.ctaMail}</a>
        </div>
        <p className="cta-sub">
          <a href={site.resumes.es.url} download={site.resumes.es.filename}><Download size={14} aria-hidden="true" />{T.cvEs}</a>
          <a href={site.resumes.en.url} download={site.resumes.en.filename}><Download size={14} aria-hidden="true" />{T.cvEn}</a>
          <button type="button" onClick={() => { playClick(); powerOn() }}><TerminalSquare size={14} aria-hidden="true" />{T.os}</button>
          <button type="button" className="past" onClick={() => { playClick(); findSecret('mph') }}><History size={14} aria-hidden="true" />{T.past}</button>
        </p>
        <dl className="hero-facts">
          {T.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        {/* the row keeps its height while GitHub answers, so the board routes around it from the start */}
        <p className="push">
          {push && (
            <a href={`${site.github}/${push.repo}`} target="_blank" rel="noopener noreferrer">
              <GitHubIcon size={13} />{T.lastPush(timeAgo(push.at, lang), push.repo)}
            </a>
          )}
        </p>
      </div>
      {/* visual hint only: the parts are reachable as links and the counter would spam screen readers */}
      <p className="status" ref={statusRef} aria-hidden="true" />
      </div>
    </section>
  )
}
