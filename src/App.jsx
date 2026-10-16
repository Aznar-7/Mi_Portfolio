import { lazy, Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence } from 'motion/react'
import { ErrorBoundary } from 'react-error-boundary'
import { LanguageProvider, useLang } from '@/contexts/LanguageContext'
import { SoundProvider } from '@/contexts/SoundContext'
import { Hero } from '@/components/board/Hero'
import { Work } from '@/components/board/Work'
import { About } from '@/components/board/About'
import { Process } from '@/components/board/Process'
import { Shop } from '@/components/board/Shop'
import { Path } from '@/components/board/Path'
import { Contact, Console, Footer, SecretToast } from '@/components/board/Closing'
import { installEggs } from '@/lib/eggs'
import { initMotion } from '@/lib/motion'
import { EggStage } from '@/components/board/EggStage'
import { Mascot } from '@/components/board/Mascot'
import { Probe } from '@/components/board/Probe'
import { Intro } from '@/components/board/Intro'

const Win95 = lazy(() => import('@/components/retro/Win95').then((m) => ({ default: m.Win95 })))
// full-screen eggs drawn over the board, which stays mounted so their "go there" can scroll the page
const loadMiddle = () => import('@/components/retro/MiddleEarth'), loadGalaxy = () => import('@/components/retro/Galaxy')
const OVERLAYS = {
  middle: lazy(() => loadMiddle().then((m) => ({ default: m.MiddleEarth }))),
  galaxy: lazy(() => loadGalaxy().then((m) => ({ default: m.Galaxy }))),
}
// the egg's own intro plays for a few seconds first: fetch the overlay meanwhile, so it opens on time
const PREFETCH = { mellon: loadMiddle, hyperspace: loadGalaxy }
const UbuntuOS = lazy(() => import('@/components/layout/UbuntuOS').then((m) => ({ default: m.UbuntuOS })))

function Board() {
  const { lang } = useLang()
  const root = useRef(null)
  // re-run per language: the titles are re-split into new letters
  useEffect(() => {
    let undo = () => {}, cancelled = false
    document.fonts.ready.then(() => { if (!cancelled) undo = initMotion(root.current) })
    return () => { cancelled = true; undo() }
  }, [lang])
  return (
    <div className="site" ref={root}>
      <a className="skip" href="#trabajo">{lang === 'es' ? 'Saltar al contenido' : 'Skip to content'}</a>
      <Hero />
      <main>
        <Work />
        <Path />
        <Process />
        <About />
        <Shop />
        <Contact />
        <Console />
      </main>
      <Footer />
      <SecretToast />
      <EggStage />
      <Mascot />
    </div>
  )
}

function Retro({ onExit, leaving }) {
  const { lang } = useLang()
  return (
    <div className={`w95-wrap${leaving ? ' leaving' : ''}`}>
      <Suspense fallback={<div className="fixed inset-0 bg-black" />}><Win95 lang={lang} onExit={onExit} /></Suspense>
    </div>
  )
}

function Overlay({ id, onExit, leaving }) {
  const { lang } = useLang()
  const View = OVERLAYS[id]
  return <Suspense fallback={<div className="fixed inset-0 z-[9000] bg-black" />}><View lang={lang} onExit={onExit} leaving={leaving} /></Suspense>
}

export default function App() {
  const [ubuntuOpen, setUbuntuOpen] = useState(false)
  const [retro, setRetro] = useState(false)
  const [overlay, setOverlay] = useState(null) // 'middle' | 'galaxy'
  // leaving an egg is a scene too: it plays its exit, then the board powers back on
  const [leaving, setLeaving] = useState(false)
  const leave = useCallback((after) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    setLeaving(true)
    setTimeout(() => {
      after(); setLeaving(false)
      if (reduced) return
      document.body.classList.add('returning')
      setTimeout(() => document.body.classList.remove('returning'), 1000)
    }, reduced ? 0 : 680)
  }, [])
  const closeOverlay = useCallback(() => leave(() => setOverlay(null)), [leave])
  const closeRetro = useCallback(() => leave(() => setRetro(false)), [leave])

  useEffect(() => {
    const open = () => setUbuntuOpen(true)
    const onKey = (e) => {
      // Ctrl + Alt + T toggles the Ubuntu simulator
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        setUbuntuOpen((o) => !o)
      }
    }
    const toRetro = () => { setRetro(true); scrollTo({ top: 0, behavior: 'instant' }) }
    const toMap = () => setOverlay('middle'), toGalaxy = () => setOverlay('galaxy')
    document.addEventListener('open-middle-earth', toMap)
    document.addEventListener('open-galaxy', toGalaxy)
    document.addEventListener('open-ubuntu', open)
    document.addEventListener('open-retro', toRetro)
    document.addEventListener('keydown', onKey)
    const prefetch = (e) => PREFETCH[e.detail.id]?.()
    document.addEventListener('secret', prefetch)
    const uninstall = installEggs()
    return () => {
      document.removeEventListener('open-ubuntu', open)
      document.removeEventListener('open-retro', toRetro)
      document.removeEventListener('open-middle-earth', toMap)
      document.removeEventListener('open-galaxy', toGalaxy)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('secret', prefetch)
      uninstall()
    }
  }, [])

  // the page powered down to open the OS (lib/power); bring it back when the OS closes
  useEffect(() => { if (!ubuntuOpen) document.body.classList.remove('off') }, [ubuntuOpen])

  return (
    <SoundProvider>
      <LanguageProvider>
        <ErrorBoundary fallback={<div className="flex h-screen items-center justify-center text-[var(--text-secondary)]">No se pudo cargar el simulador. Recargá la página.</div>}>
          <AnimatePresence>
            {ubuntuOpen && (
              <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-black" />}>
                <UbuntuOS key="ubuntu" onClose={() => setUbuntuOpen(false)} />
              </Suspense>
            )}
          </AnimatePresence>
        </ErrorBoundary>
        {retro && !ubuntuOpen && <Retro onExit={closeRetro} leaving={leaving} />}
        {!ubuntuOpen && !retro && (
          <>
            {!overlay && <Probe />}
            <Board />
            <Intro />
            {overlay && <Overlay id={overlay} onExit={closeOverlay} leaving={leaving} />}
          </>
        )}
      </LanguageProvider>
    </SoundProvider>
  )
}
