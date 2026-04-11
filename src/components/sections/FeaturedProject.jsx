import { ExternalLink, Layers, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { TechBadge } from '@/components/common/TechBadge'
import { featuredProject } from '@/data/projects'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Resolves {es, en} or plain string
function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

export function FeaturedProject() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].featured

  return (
    <SectionWrapper id="featured">
      <SectionHeading
        label={T.label}
        title={featuredProject.title}
        subtitle={l(featuredProject.tagline, lang)}
      />

      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[var(--bg-surface)]/80 p-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:grid lg:grid-cols-[1fr_480px] transition-all duration-500 hover:shadow-[0_30px_80px_-20px_rgba(124,106,247,0.15)] group:featured-card">
        {/* Background glow animations */}
        <div className="pointer-events-none absolute -left-[50%] -top-[50%] h-[200%] w-[200%] rounded-full bg-[radial-gradient(ellipse_at_center,var(--accent)_0%,transparent_50%)] opacity-[0.03] blur-[100px] transition-opacity duration-700 group-hover/featured-card:opacity-[0.06]" />
        
        {/* Animated border top */}
        <div className="absolute inset-x-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent opacity-50" />
        
        {/* Left: Visual/Image Content (New) */}
        <div className="relative z-10 flex flex-col justify-between border-b border-white/[0.05] p-5 sm:p-8 lg:border-b-0 lg:border-r md:p-12">
          
          <div>
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/[0.05] px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-widest text-green-400 uppercase shadow-[0_0_20px_rgba(74,222,128,0.1)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              {T.active}
            </motion.div>

            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-3xl font-extrabold tracking-tight md:text-4xl text-white"
            >
              {featuredProject.title}
            </motion.h3>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10 flex flex-col gap-5 text-[16px] leading-[1.8] text-[var(--text-secondary)]"
            >
              {l(featuredProject.description, lang).split('. ').filter(Boolean).map((s, i) => (
                <p key={i}>
                  {s.endsWith('.') ? s : `${s}.`}
                </p>
              ))}
            </motion.div>
          </div>

          <div>
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="mb-10 flex flex-wrap gap-2.5"
             >
               {featuredProject.tech.map((t) => <TechBadge key={t} label={t} accent />)}
             </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {featuredProject.liveUrl && (
                <a
                  href={featuredProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#6a5cdb] px-7 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(124,106,247,0.6)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
                >
                  <ExternalLink size={16} />
                  {T.view}
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                </a>
              )}
            </motion.div>
          </div>
        </div>

        {/* Right: Architecture & Visuals */}
        <div className="relative z-10 flex flex-col bg-black/40 p-5 sm:p-8 md:p-12">
          
          {/* Subtle Image Integration */}
          {featuredProject.image && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative mb-10 overflow-hidden rounded-2xl border border-white/5 shadow-2xl aspect-[16/9] group"
            >
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
               <img 
                  src={featuredProject.image} 
                  alt={`${featuredProject.title} preview`} 
                  className="h-full w-full object-cover object-top transition-transform duration-700 ease-in-out group-hover:scale-105"
                  loading="lazy"
               />
            </motion.div>
          )}

          <div className="mb-6 flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
               <Layers size={14} />
            </span>
            {T.arch_label}
          </div>

          <div className="flex flex-col gap-3">
            {featuredProject.architecture.map((item, i) => (
              <motion.div
                key={i}
                initial={reduced ? false : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
                className="group relative overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 transition-all duration-300 hover:border-[var(--accent)]/30 hover:bg-white/[0.03] hover:shadow-[0_4px_20px_-10px_rgba(124,106,247,0.15)] hover:-translate-y-0.5"
              >
                <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-[var(--accent)] to-transparent opacity-30 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="mb-2 font-mono text-[10px] font-bold tracking-widest text-[var(--accent)] uppercase">
                  {l(item.layer, lang)}
                </p>
                <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] group-hover:text-gray-300 transition-colors">
                  {l(item.detail, lang)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
