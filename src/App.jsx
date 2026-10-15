import { lazy, Suspense, useState, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { ErrorBoundary } from 'react-error-boundary'
import { LanguageProvider, useLang } from '@/contexts/LanguageContext'
import { SoundProvider } from '@/contexts/SoundContext'
import { Hero } from '@/components/board/Hero'
import { Work } from '@/components/board/Work'
import { About } from '@/components/board/About'
import { Shop } from '@/components/board/Shop'
import { Path } from '@/components/board/Path'
import { Contact, Console, Footer, SecretToast } from '@/components/board/Closing'
import { installEggs } from '@/lib/eggs'

const UbuntuOS = lazy(() => import('@/components/layout/UbuntuOS').then((m) => ({ default: m.UbuntuOS })))

function Board() {
  const { lang } = useLang()
  return (
    <div className="site">
      <a className="skip" href="#trabajo">{lang === 'es' ? 'Saltar al contenido' : 'Skip to content'}</a>
      <Hero />
      <main>
        <Work />
        <About />
        <Shop />
        <Path />
        <Contact />
        <Console />
      </main>
      <Footer />
      <SecretToast />
    </div>
  )
}

export default function App() {
  const [ubuntuOpen, setUbuntuOpen] = useState(false)

  useEffect(() => {
    const open = () => setUbuntuOpen(true)
    const onKey = (e) => {
      // Ctrl + Alt + T toggles the Ubuntu simulator
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        setUbuntuOpen((o) => !o)
      }
    }
    document.addEventListener('open-ubuntu', open)
    document.addEventListener('keydown', onKey)
    const uninstall = installEggs()
    return () => {
      document.removeEventListener('open-ubuntu', open)
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
        {!ubuntuOpen && <Board />}
      </LanguageProvider>
    </SoundProvider>
  )
}
