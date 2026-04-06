import { lazy, Suspense } from 'react'
import { DotGrid } from '@/components/background/DotGrid'
import { CustomCursor } from '@/components/background/CustomCursor'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { Hero } from '@/components/sections/Hero'

// Lazy load below-fold sections
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
    <>
      <CustomCursor />
      <ScrollProgress />
      <DotGrid />
      <Navbar />
      <main>
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
    </>
  )
}
