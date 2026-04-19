import { lazy, Suspense, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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

import { useSoundEffects } from '@/contexts/SoundContext'

function BootSequence({ onComplete }) {
  const [clicked, setClicked] = useState(false)
  const { startBgmExplicitly } = useSoundEffects()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (clicked) {
      const timer = setTimeout(() => {
        document.body.style.overflow = ''
        onComplete()
      }, 3500) // Animación de línea que se expande dura ~3.5s
      return () => clearTimeout(timer)
    }
  }, [clicked, onComplete])

  useEffect(() => {
    const handleStart = () => {
      if (!clicked) {
        setClicked(true)
        startBgmExplicitly()
      }
    }
    
    if (!clicked) {
      window.addEventListener('keydown', handleStart)
      window.addEventListener('click', handleStart)
      return () => {
        window.removeEventListener('keydown', handleStart)
        window.removeEventListener('click', handleStart)
      }
    }
  }, [clicked, startBgmExplicitly])

  return (
    <motion.div
      className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#050508] cursor-pointer"
      initial={{ opacity: 1 }}
      animate={{ opacity: clicked ? [1, 1, 0] : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 3.5, times: [0, 0.8, 1], ease: 'easeInOut' }}
    >
      {/* Estado inactivo: Esperando Interacción */}
      {!clicked ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-white/40 text-xs md:text-sm tracking-[0.4em] font-light uppercase select-none"
        >
          Press any button to start
        </motion.div>
      ) : (
        /* Estado Activo: Animación de PS4 Boot (Línea central) */
        <div className="relative w-full h-[2px] flex justify-center items-center">
          {/* Línea Principal (Se expande) */}
          <motion.div
            className="absolute bg-white rounded-full"
            initial={{ width: 0, opacity: 0, height: '2px', boxShadow: '0 0 0px #4169E1' }}
            animate={{ 
              width: ['0%', '15%', '100%'],
              opacity: [0, 1, 0.2],
              height: ['2px', '4px', '1px'],
              boxShadow: [
                '0 0 0px #4169E1', 
                '0 0 20px 4px #4169E1, 0 0 40px 10px #7C6AEA', 
                '0 0 80px 15px #7C6AEA, 0 0 120px 30px #ffffff'
              ] 
            }}
            transition={{ duration: 2.8, times: [0, 0.4, 1], ease: 'easeInOut' }}
          />

          {/* Flash Blanco en el centro (Sparkle) */}
          <motion.div
            className="absolute bg-white rounded-full"
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{
              width: ['0px', '250px', '0px'],
              height: ['0px', '15px', '0px'],
              opacity: [0, 1, 0],
              boxShadow: ['0 0 0px white', '0 0 100px 30px white', '0 0 0px white']
            }}
            transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.2 }}
          />
        </div>
      )}
    </motion.div>
  )
}

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [ubuntuOpen,  setUbuntuOpen]  = useState(false);
  // const [androidOpen, setAndroidOpen] = useState(false);

  useEffect(() => {
    const handleOpenUbuntu  = () => setUbuntuOpen(true);
    // const handleOpenAndroid = () => setAndroidOpen(true);

    const handleKeydown = (e) => {
      // Global shortcut: Ctrl + Alt + T to open Terminal
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setUbuntuOpen(o => !o);
      }
    };
    
    document.addEventListener('open-ubuntu',  handleOpenUbuntu);
    document.addEventListener('keydown', handleKeydown);
    // document.addEventListener('open-android', handleOpenAndroid);
    
    return () => {
      document.removeEventListener('open-ubuntu',  handleOpenUbuntu);
      document.removeEventListener('keydown', handleKeydown);
      // document.removeEventListener('open-android', handleOpenAndroid);
    };
  }, []);

  return (
    <SoundProvider>
      <LanguageProvider>

        <AnimatePresence>
          {isBooting && <BootSequence key="boot" onComplete={() => setIsBooting(false)} />}
        </AnimatePresence>

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
          {!isBooting && <CommandPalette />}
        </Suspense>
      </ErrorBoundary>
      {!isBooting && !ubuntuOpen && (
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
