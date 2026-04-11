import { motion } from 'motion/react'
import { Mail, ArrowRight } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { site } from '@/data/site'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function Contact() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].contact

  return (
    <SectionWrapper id="contact">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[var(--bg-surface)] px-5 py-12 text-center shadow-2xl sm:px-8 sm:py-16 md:px-16 md:py-24">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 100%, rgba(124,106,247,0.14) 0%, transparent 70%)' }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/35 to-transparent" />

        <div className="relative z-10">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 font-mono text-[11px] tracking-[0.16em] text-[var(--accent)] uppercase"
          >
            {T.label}
          </motion.p>

          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mb-5 text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)]"
          >
            {T.title}
          </motion.h2>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mb-10 max-w-sm text-base leading-relaxed text-[var(--text-secondary)]"
          >
            {T.subtitle}
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[var(--accent)] px-5 py-4 sm:px-8 text-[13px] sm:text-[15px] font-semibold text-white transition-all hover:-translate-y-1 hover:bg-[var(--accent-hover)] hover:shadow-[0_14px_36px_rgba(124,106,247,0.38)] max-w-full overflow-hidden"
            >
              <Mail size={17} className="shrink-0" />
              <span className="truncate">{site.email}</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 shrink-0" />
            </a>

            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-5 py-2.5 text-[13px] font-medium text-[var(--text-secondary)] transition-all hover:border-white/20 hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
              >
                <GitHubIcon size={15} /> GitHub
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-5 py-2.5 text-[13px] font-medium text-[var(--text-secondary)] transition-all hover:border-white/20 hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
              >
                <LinkedInIcon size={15} /> LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  )
}
