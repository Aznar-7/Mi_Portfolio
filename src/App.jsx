import { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import { AnimatePresence, LayoutGroup } from 'motion/react'
import { ErrorBoundary } from 'react-error-boundary'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { SoundProvider } from '@/contexts/SoundContext'
import TargetCursor from '@/components/common/TargetCursor'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { Intro } from '@/components/layout/Intro'
import { shouldPlayIntro } from '@/lib/intro'
import { Hero } from '@/components/sections/Hero'

const named = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })))

const UbuntuOS        = named(() => import('@/components/layout/UbuntuOS'), 'UbuntuOS')
const CommandPalette  = named(() => import('@/components/layout/CommandPalette'), 'CommandPalette')
const FeaturedProject = named(() => import('@/components/sections/FeaturedProject'), 'FeaturedProject')
const Experience      = named(() => import('@/components/sections/Experience'), 'Experience')
const Projects        = named(() => import('@/components/sections/Projects'), 'Projects')
const Skills          = named(() => import('@/components/sections/Skills'), 'Skills')
const About           = named(() => import('@/components/sections/About'), 'About')
const Contact         = named(() => import('@/components/sections/Contact'), 'Contact')

const SECTIONS = [
  ['featured', FeaturedProject],
  ['experience', Experience],
  ['projects', Projects],
  ['skills', Skills],
  ['about', About],
  ['contact', Contact],
]

// Reserves space while a lazy section loads so the scrollbar doesn't jump
const SectionFallback = () => <div className="min-h-[70vh]" aria-hidden="true" />

export default function App() {
  const [playIntro] = useState(shouldPlayIntro)
  const [introDone, setIntroDone] = useState(!playIntro)
  const [ubuntuOpen, setUbuntuOpen] = useState(false)
  const finishIntro = useCallback(() => setIntroDone(true), [])

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
    return () => {
      document.removeEventListener('open-ubuntu', open)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

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

        {introDone && (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <CommandPalette />
            </Suspense>
          </ErrorBoundary>
        )}

        {introDone && !ubuntuOpen && (
          <TargetCursor
            spinDuration={2}
            hideDefaultCursor={false}
            parallaxOn
            hoverDuration={0.2}
            targetSelector="a, button, .cursor-target, [role='button']"
          />
        )}

        {!ubuntuOpen && (
          <LayoutGroup>
            <AnimatePresence>
              {!introDone && <Intro key="intro" onDone={finishIntro} />}
            </AnimatePresence>

            <ScrollProgress />
            <Navbar />
            <main className="relative">
              <Hero ready={introDone} fromIntro={playIntro} />
              {SECTIONS.map(([key, Section]) => (
                <Suspense key={key} fallback={<SectionFallback />}>
                  <Section />
                </Suspense>
              ))}
            </main>
            <Footer />
          </LayoutGroup>
        )}
      </LanguageProvider>
    </SoundProvider>
  )
}
