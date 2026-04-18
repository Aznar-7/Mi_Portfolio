import { lazy, Suspense, useState, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { ErrorBoundary } from 'react-error-boundary'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { SoundProvider } from '@/contexts/SoundContext'
import TargetCursor from '@/components/common/TargetCursor'
import Threads from '@/components/background/Threads'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { Hero } from '@/components/sections/Hero'

const UbuntuOS = lazy(() => import('@/components/layout/UbuntuOS').then((m) => ({ default: m.UbuntuOS })))
const CommandPalette = lazy(() => import('@/components/layout/CommandPalette').then((m) => ({ default: m.CommandPalette })))

const FeaturedProject = lazy(() =>
  import('@/components/sections/FeaturedProject').then((m) => ({ default: m.FeaturedProject }))
)
const Experience = lazy(() =>
  import('@/components/sections/Experience').then((m) => ({ default: m.Experience }))
)
const Projects = lazy(() =>
  import('@/components/sections/Projects').then((m) => ({ default: m.Projects }))
)
const Skills = lazy(() =>
  import('@/components/sections/Skills').then((m) => ({ default: m.Skills }))
)
const About = lazy(() =>
  import('@/components/sections/About').then((m) => ({ default: m.About }))
)
const Contact = lazy(() =>
  import('@/components/sections/Contact').then((m) => ({ default: m.Contact }))
)
const CubesSection = lazy(() =>
  import('@/components/sections/CubesSection').then((m) => ({ default: m.CubesSection }))
)

function SectionSkeleton({ cols = 2, rows = 2 }) {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-5 py-14 sm:px-6 sm:py-16 lg:py-24">
      <div className="mb-3 h-2.5 w-16 rounded-full bg-white/[0.04]" />
      <div className="mb-2 h-8 w-48 rounded-lg bg-white/[0.04]" />
      <div className="mb-14 h-4 w-72 rounded bg-white/[0.03]" />
      <div className="gap-4" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-white/[0.03]" />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [ubuntuOpen,  setUbuntuOpen]  = useState(false);
  // const [androidOpen, setAndroidOpen] = useState(false);

  useEffect(() => {
    const handleOpenUbuntu  = () => setUbuntuOpen(true);
    // const handleOpenAndroid = () => setAndroidOpen(true);
    
    document.addEventListener('open-ubuntu',  handleOpenUbuntu);
    // document.addEventListener('open-android', handleOpenAndroid);
    
    return () => {
      document.removeEventListener('open-ubuntu',  handleOpenUbuntu);
      // document.removeEventListener('open-android', handleOpenAndroid);
    };
  }, []);

  return (
    <SoundProvider>
      <LanguageProvider>
        <ErrorBoundary fallback={<div className="h-screen w-screen bg-black text-white flex items-center justify-center">Error al cargar el sistema operativo. Recarga la página.</div>}>
          <AnimatePresence>
            {ubuntuOpen  && (
              <Suspense fallback={<div className="h-screen w-screen bg-black" />}>
                <UbuntuOS  key="ubuntu"  onClose={() => setUbuntuOpen(false)} />
              </Suspense>
            )}
            {/* {androidOpen && <AndroidOS key="android" onClose={() => setAndroidOpen(false)} />} */}
          </AnimatePresence>
        </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <CommandPalette />
        </Suspense>
      </ErrorBoundary>
      {!ubuntuOpen && (
        <TargetCursor 
          spinDuration={2}
          hideDefaultCursor={false}
          parallaxOn={true}
          hoverDuration={0.2}
          targetSelector="a, button, .cursor-target, [role='button']"
        />
      )}
      {!ubuntuOpen && (
        <>
          <ScrollProgress />
          <Threads color={[0.486, 0.416, 0.969]} amplitude={1.2} distance={0.3} />
          <Navbar />
          <main style={{ position: 'relative', zIndex: 10 }}>
            <Hero />
            <Suspense fallback={<SectionSkeleton cols={2} rows={2} />}>
              <FeaturedProject />
            </Suspense>
            <Suspense fallback={<SectionSkeleton cols={1} rows={3} />}>
              <Experience />
            </Suspense>
            <Suspense fallback={<SectionSkeleton cols={3} rows={2} />}>
              <Projects />
            </Suspense>
            <Suspense fallback={<SectionSkeleton cols={4} rows={2} />}>
              <Skills />
            </Suspense>
            <Suspense fallback={<SectionSkeleton cols={2} rows={1} />}>
              <About />
            </Suspense>
            <Suspense fallback={<SectionSkeleton cols={1} rows={1} />}>
              <CubesSection />
            </Suspense>
            <Suspense fallback={<SectionSkeleton cols={1} rows={1} />}>
              <Contact />
            </Suspense>
          </main>
          <Footer />
        </>
      )}
      </LanguageProvider>
    </SoundProvider>
  )
}
