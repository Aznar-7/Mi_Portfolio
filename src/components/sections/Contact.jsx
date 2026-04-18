import { useState } from 'react'
import { motion } from 'motion/react'
import { Copy, Check, ArrowUpRight } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { site } from '@/data/site'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSoundEffects } from '@/contexts/SoundContext'

const ease = [0.16, 1, 0.3, 1]

const fp = (delay = 0, reduced) =>
  reduced ? {} : {
    initial:    { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport:   { once: true },
    transition: { duration: 0.6, delay, ease },
  }

export function Contact() {
  const reduced  = useReducedMotion()
  const { lang } = useLang()
  const T        = translations[lang].contact
  const [copied, setCopied] = useState(false)
  const { playSuccess } = useSoundEffects()

  const githubUser  = site.github.split('github.com/')[1]  ?? 'GitHub'
  const linkedinSlug = site.linkedin.split('/in/')[1]?.replace(/\/$/, '') ?? 'LinkedIn'

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      playSuccess()
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {}
  }

  return (
    <SectionWrapper id="contact">

      {/* Ghost number — large decorative watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none overflow-hidden font-black leading-none tracking-[-0.06em] text-white/[0.022]"
        style={{ fontSize: 'clamp(9rem, 24vw, 20rem)' }}
      >
        06
      </div>

      {/* Top rule */}
      <div className="mb-12 h-px w-full bg-gradient-to-r from-[var(--accent)]/35 via-white/[0.07] to-transparent" />

      {/* Header row: title left / availability right */}
      <div className="mb-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <motion.p {...fp(0, reduced)} className="mb-5 font-mono text-[10px] tracking-[0.2em] text-[var(--accent)] uppercase">
            {T.label}
          </motion.p>
          <motion.h2
            {...fp(0.06, reduced)}
            className="text-[clamp(2.8rem,9vw,6.5rem)] font-bold leading-[1.01] tracking-[-0.05em] text-[var(--text-primary)]"
          >
            {T.title}
          </motion.h2>
        </div>

        <motion.div {...fp(0.12, reduced)} className="flex flex-col items-start md:items-end gap-2 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-70" />
              <span className="relative block h-2 w-2 rounded-full bg-green-500" />
            </div>
            <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-green-400/85 uppercase">
              {lang === 'es' ? 'Disponible' : 'Available'}
            </span>
          </div>
          <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wide">
            {lang === 'es' ? 'Freelance · Roles · Colabs' : 'Freelance · Roles · Collabs'}
          </span>
        </motion.div>
      </div>

      {/* Divider */}
      <motion.div {...fp(0.18, reduced)} className="mb-14 h-px w-full bg-white/[0.06]" />

      {/* Email — main focal point */}
      <motion.div {...fp(0.24, reduced)} className="mb-3 flex flex-wrap items-center gap-4">
        <a
          href={`mailto:${site.email}`}
          className="group relative font-mono text-[clamp(1rem,3.2vw,1.85rem)] font-semibold tracking-tight text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
        >
          {/* Animated underline */}
          <span className="absolute inset-x-0 -bottom-0.5 block h-[1.5px] scale-x-0 origin-left bg-[var(--accent)]/60 transition-transform duration-300 group-hover:scale-x-100" />
          {site.email}
        </a>

        <button
          onClick={copyEmail}
          title={copied ? (lang === 'es' ? 'Copiado' : 'Copied') : (lang === 'es' ? 'Copiar email' : 'Copy email')}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-3 py-1.5 font-mono text-[10px] font-semibold tracking-widest uppercase text-[var(--text-muted)] transition-all duration-200 hover:border-[var(--accent)]/35 hover:bg-[var(--accent)]/[0.07] hover:text-[var(--accent)]"
        >
          {copied
            ? <><Check size={11} />{lang === 'es' ? 'Copiado' : 'Copied'}</>
            : <><Copy size={11} />{lang === 'es' ? 'Copiar' : 'Copy'}</>
          }
        </button>
      </motion.div>

      {/* Subtitle */}
      <motion.p {...fp(0.3, reduced)} className="mb-14 max-w-sm text-[14.5px] leading-[1.72] text-[var(--text-muted)]">
        {T.subtitle}
      </motion.p>

      {/* Social links — plain text, no cards */}
      <motion.div {...fp(0.36, reduced)} className="flex items-center gap-6 sm:gap-10">
        <a
          href={site.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 font-mono text-[12px] font-bold tracking-[0.18em] text-[var(--text-muted)] uppercase transition-colors duration-200 hover:text-[var(--text-primary)]"
        >
          <GitHubIcon size={14} />
          GitHub
          <ArrowUpRight
            size={11}
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>

        <div className="h-4 w-px bg-white/[0.1]" />

        <a
          href={site.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 font-mono text-[12px] font-bold tracking-[0.18em] text-[var(--text-muted)] uppercase transition-colors duration-200 hover:text-[#4ea7d8]"
        >
          <LinkedInIcon size={14} />
          LinkedIn
          <ArrowUpRight
            size={11}
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </motion.div>

      {/* Bottom rule */}
      <motion.div {...fp(0.42, reduced)} className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
    </SectionWrapper>
  )
}
