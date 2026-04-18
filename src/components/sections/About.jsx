import { motion } from 'framer-motion'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { about } from '@/data/about'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

export function About() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
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
          
          <div className="space-y-6 relative z-10">
            {bio.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={reduced ? { duration: 0 } : { duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`text-[16px] md:text-[17px] leading-[1.8] tracking-wide ${i === 0 ? 'text-white/90 font-medium' : 'text-white/60 font-light'}`}
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
    </SectionWrapper>
  )
}
