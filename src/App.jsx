import { lazy, Suspense, useState, useEffect, useRef } from 'react'
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
import TargetCursor from '@/components/common/TargetCursor'

const Win95 = lazy(() => import('@/components/retro/Win95').then((m) => ({ default: m.Win95 })))
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
        <Process />
        <About />
        <Shop />
        <Path />
        <Contact />
        <Console />
      </main>
      <Footer />
      <SecretToast />
      <EggStage />
    </div>
  )
}

function Retro({ onExit }) {
  const { lang } = useLang()
  return <Suspense fallback={<div className="fixed inset-0 bg-black" />}><Win95 lang={lang} onExit={onExit} /></Suspense>
}

export default function App() {
  const [ubuntuOpen, setUbuntuOpen] = useState(false)
  const [retro, setRetro] = useState(false)

  useEffect(() => {
    const open = () => setUbuntuOpen(true)
    const onKey = (e) => {
      // Ctrl + Alt + T toggles the Ubuntu simulator
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        setUbuntuOpen((o) => !o)
      }
    }
    const toRetro = () => { setRetro(true); scrollTo(0, 0) }
    document.addEventListener('open-ubuntu', open)
    document.addEventListener('open-retro', toRetro)
    document.addEventListener('keydown', onKey)
    const uninstall = installEggs()
    return () => {
      document.removeEventListener('open-ubuntu', open)
      document.removeEventListener('open-retro', toRetro)
      document.removeEventListener('keydown', onKey)
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
        {retro && !ubuntuOpen && <Retro onExit={() => setRetro(false)} />}
        {!ubuntuOpen && !retro && (
          <>
            <TargetCursor spinDuration={2} hideDefaultCursor={false} parallaxOn hoverDuration={0.2} targetSelector="a, button, summary, .cursor-target, [role='button']" />
            <Board />
          </>
        )}
      </LanguageProvider>
    </SoundProvider>
  )
}
