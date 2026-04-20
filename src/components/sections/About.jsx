import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitHubCalendar } from 'react-github-calendar'
import { X } from 'lucide-react'

import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { about } from '@/data/about'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSoundEffects } from '@/contexts/SoundContext'

function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

export function About() {
  const [isImageOpen, setIsImageOpen] = useState(false)
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const { playHover, playNavigation } = useSoundEffects()
  const T = translations[lang].about
  const bio = l(about.bio, lang)

  return (
    <SectionWrapper id="about">
      <SectionHeading label={T.label} title={T.title} />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14 lg:items-stretch">
        
        {/* Left Column: Bio with refined typography */}
        <div className="flex flex-col justify-center relative">
          {/* Subtle accent glow behind bio */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-r from-[var(--accent)]/10 to-indigo-500/10 blur-[80px] pointer-events-none" />
          
          <div className="space-y-6 relative z-10 text-white/80">
            {/* Inline float photo */}
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              src="/port.jpg"
              alt="Vicente Aznar"
              onClick={() => setIsImageOpen(true)}
              className="float-left mr-5 mb-2 h-20 w-20 md:h-24 md:w-24 rounded-full object-cover outline outline-2 outline-white/10 shadow-xl cursor-pointer hover:scale-[1.05] hover:outline-white/30 transition-all"
            />
            {bio.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={reduced ? { duration: 0 } : { duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`text-[16px] md:text-[17px] leading-[1.8] tracking-wide ${i === 0 ? 'text-white/90 font-medium' : 'text-white/60 font-light'} clear-none`}
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* Connect/Social Line */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a 
              href="/ResumeVicenteAznar.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playHover}
              onClick={playNavigation}
              className="group relative flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-6 py-2.5 text-sm font-medium text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-white"
            >
              <span>{lang === 'es' ? 'Descargar CV' : 'Download Resume'}</span>
              <svg 
                className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div className="h-px w-12 bg-white/20 ml-2" />
            <span className="font-mono text-xs text-white/40 tracking-[0.2em] font-medium uppercase">
               {lang === 'es' ? 'Construyendo el futuro' : 'Building the future'}
            </span>
          </motion.div>
        </div>

        {/* Right Column: Bento Box Style Facts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
          
          {/* Main Status Bento Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 sm:col-span-2 group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-md hover:bg-white/[0.04] transition-colors"
          >
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
             <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
             
             <dt className="mb-3 font-mono text-[10px] font-semibold tracking-[0.16em] text-white/40 uppercase">
                {lang === 'es' ? 'Ahora mismo' : 'Right now'}
             </dt>
             <dd className="flex items-center gap-4">
               <div className="relative flex h-3 w-3 shrink-0">
                 <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-70" />
                 <span className="relative block h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
               </div>
               <span className="text-[16px] leading-[1.6] text-white/90 font-medium">
                 {lang === 'es'
                   ? 'UTN Hub en desarrollo · Ing. en Sistemas cursando'
                   : 'UTN Hub in development · Systems Engineering ongoing'}
               </span>
             </dd>
          </motion.div>

          {/* Quick Facts Mini Bentos */}
          {about.quickFacts.map((fact, index) => (
             <motion.div
                key={l(fact.label, lang)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.3 + (index * 0.1), ease: [0.16, 1, 0.3, 1] }}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.01] p-6 backdrop-blur-sm transition-all hover:bg-white/[0.03] hover:-translate-y-1 hover:border-white/[0.1] shadow-xl"
             >
                <div className="absolute bottom-0 right-0 -mr-8 -mb-8 h-24 w-24 rounded-full bg-[var(--accent)]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <dt className="mb-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-white/40 uppercase">
                  {l(fact.label, lang)}
                </dt>
                <dd className="text-[15px] font-semibold leading-snug text-white/80 group-hover:text-[var(--accent)] transition-colors">
                  {l(fact.value, lang)}
                </dd>
             </motion.div>
          ))}
        </div>
      </div>

      {/* GitHub Calendar Widget */}
      <motion.div 
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-16 sm:mt-24 p-6 sm:p-10 rounded-[2rem] border border-white/[0.05] bg-[#0d1117] flex flex-col items-center overflow-x-auto shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
        <h4 className="font-semibold text-white mb-6 self-start w-full text-center sm:text-left flex items-center justify-center sm:justify-start gap-3">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="text-[var(--accent)]">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="tracking-wide">
            {lang === 'es' ? 'GitHub Contributions' : 'GitHub Contributions'}
          </span>
        </h4>
        <div className="w-full flex justify-center text-sm md:scale-100 scale-90 origin-left sm:origin-center">
          <GitHubCalendar 
            username="Aznar-7" 
            colorScheme="dark"
            theme={{
              light: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
              dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
            }}
            hideTotalCount={false}
            hideMonthLabels={false}
          />
        </div>
      </motion.div>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {isImageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageOpen(false)}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-10 bg-black/80 backdrop-blur-sm"
          >
             <button
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                onClick={() => setIsImageOpen(false)}
             >
                <X size={32} />
             </button>
             <motion.img
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                src="/port.jpg"
                alt="Vicente Aznar"
                className="w-full max-w-[500px] rounded-2xl shadow-2xl object-cover ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
             />
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
