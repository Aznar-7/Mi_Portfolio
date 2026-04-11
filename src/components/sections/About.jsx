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

      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20 lg:items-center">
        {/* Bio */}
        <div className="flex flex-col gap-6 relative">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[var(--accent)]/[0.04] blur-3xl" />
          
          {bio.map((para, i) => (
            <motion.p
              key={i}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="text-[16px] leading-[1.85] text-[var(--text-secondary)] md:text-[17px] relative z-10"
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* Quick facts card */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          whileInView={reduced ? {} : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative group"
        >
          {/* Card Glow */}
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-b from-[var(--accent)]/30 to-transparent opacity-0 blur-lg transition duration-700 group-hover:opacity-50" />
          
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.05] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-base)] p-8 shadow-2xl transition-transform duration-500 hover:-translate-y-2 md:p-10">
            {/* Top glass reflection */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <h3 className="font-mono text-[12px] font-bold tracking-[0.2em] text-[var(--text-primary)] uppercase">
                {T.quick_facts}
              </h3>
            </div>

            <dl className="flex flex-col gap-6">
              {about.quickFacts.map((fact) => (
                <div key={l(fact.label, lang)} className="group/fact flex items-start gap-4">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] transition-colors duration-300 group-hover/fact:bg-[var(--accent)]" />
                  <div>
                    <dt className="mb-1 font-mono text-[10px] sm:text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase opacity-70">
                      {l(fact.label, lang)}
                    </dt>
                    <dd className="text-[15px] font-medium text-[var(--text-primary)] transition-colors duration-300 group-hover/fact:text-[var(--accent)]">
                      {l(fact.value, lang)}
                    </dd>
                  </div>
                </div>
              ))}
              
              {/* Live Status Mock */}
              <div className="my-2 border-t border-white/5 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">Live Status</span>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.66 12.9c.42.24.6.84.3 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.42z"/>
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-white">Coding Music</p>
                      <p className="text-[10px] text-white/50">Synthwave · Lofi</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-white">VS Code</p>
                      <p className="text-[10px] text-white/50">Working on React Components</p>
                    </div>
                  </div>
                </div>
              </div>
            </dl>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
