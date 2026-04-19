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

function BootSequence({ onComplete }) {
  const [clicked, setClicked] = useState(false)

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
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [clicked, onComplete])

  useEffect(() => {
    const handleStart = () => setClicked(true)
    if (!clicked) {
      window.addEventListener('keydown', handleStart)
      window.addEventListener('click', handleStart)
      return () => {
        window.removeEventListener('keydown', handleStart)
        window.removeEventListener('click', handleStart)
      }
    }
  }, [clicked])

  return (
    <motion.div
      className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#050505]"
      initial={{ opacity: 1 }}
      animate={{ opacity: clicked ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center gap-12"
      >
        <div className="relative flex flex-col items-center">
          <div 
            className="text-white/80 text-4xl md:text-5xl font-light tracking-[0.4em] font-mono select-none"
            style={{ textShadow: '0 0 40px rgba(255,255,255,0.4)' }}
          >
            VA<span className="text-[#E95420] ml-[-0.2em]">_</span>
          </div>
          <motion.div 
            className="absolute -inset-10 bg-white/5 blur-3xl rounded-full pointer-events-none"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: clicked ? 0 : [0, 1, 0] }}
          transition={{ delay: 1.5, duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-white/30 text-[10px] md:text-xs font-mono tracking-widest uppercase cursor-pointer"
        >
          {clicked ? 'LOADING...' : 'PRESS ANY KEY OR CLICK TO START'}
        </motion.div>
      </motion.div>
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
