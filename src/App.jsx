import { lazy, Suspense } from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import SplashCursor from '@/components/background/SplashCursor'
import { CustomCursor } from '@/components/background/CustomCursor'
import Threads from '@/components/background/Threads'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { Hero } from '@/components/sections/Hero'

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

export default function App() {
  return (
    <LanguageProvider>
      <CustomCursor />
      <SplashCursor />
      <ScrollProgress />
      <Threads color={[0.486, 0.416, 0.969]} amplitude={1.2} distance={0.3} />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 10 }}>
        <Hero />
        <Suspense fallback={null}>
          <FeaturedProject />
          <Experience />
          <Projects />
          <Skills />
          <About />
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </LanguageProvider>
  )
}
