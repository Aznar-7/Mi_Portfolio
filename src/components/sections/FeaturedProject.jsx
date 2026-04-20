import { ExternalLink, ArrowRight, Zap, Users, TrendingUp, Server, Database, Globe, Layers } from 'lucide-react'
import { motion } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { TechBadge } from '@/components/common/TechBadge'
import { featuredProject } from '@/data/projects'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSoundEffects } from '@/contexts/SoundContext'

function l(value, lang) {
  if (!value || typeof value === 'string') return value
  return value[lang] ?? value.es ?? value.en ?? ''
}

const ICON_MAP = { Zap, Users, TrendingUp, Server, Database, Globe }
const LAYER_ICONS = { Frontend: Globe, Backend: Server, 'Base de datos': Database, Database: Database, Infraestructura: Layers, Infrastructure: Layers }

function MetricCard({ value, label, iconName, index, reduced }) {
  const Icon = ICON_MAP[iconName] ?? Zap
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 sm:p-5"
    >
      <div className="flex items-center gap-2 text-[var(--accent)]/70">
        <Icon size={13} />
        <span className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase text-[var(--text-muted)]">
          {label}
        </span>
      </div>
      <span className="font-mono text-[1.6rem] sm:text-[2.2rem] font-black leading-none tracking-tighter text-[var(--text-primary)]">
        {value}
      </span>
    </motion.div>
  )
}

export function FeaturedProject() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].featured
  const { playHover, playNavigation } = useSoundEffects()

  const fp = (delay = 0) =>
    reduced ? {} : {
      initial:    { opacity: 0, y: 14 },
      whileInView: { opacity: 1, y: 0 },
      viewport:   { once: true },
      transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
    }

  return (
    <SectionWrapper id="featured">
      <SectionHeading label={T.label} title={featuredProject.title} subtitle={l(featuredProject.tagline, lang)} />

      {/* ── Outer card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.55)]">

        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/45 to-transparent" />

        {/* Subtle glow behind content */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[var(--accent)]/[0.06] blur-[100px]" />

        {/* ── Top strip: status + metrics ── */}
        <div className="border-b border-white/[0.05] bg-[var(--bg-surface)]/60 px-6 py-5 sm:px-10 sm:py-6 md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            {/* Status */}
            <motion.div {...fp(0)} className="inline-flex items-center gap-2 rounded-full border border-green-500/22 bg-green-500/[0.06] px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-widest text-green-400 uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative block h-2 w-2 rounded-full bg-green-500" />
              </span>
              {T.active}
            </motion.div>

            {/* Metrics */}
            {featuredProject.metrics?.length > 0 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
                {featuredProject.metrics.map((m, i) => (
                  <MetricCard
                    key={i}
                    value={m.value}
                    label={l(m.label, lang)}
                    iconName={m.icon}
                    index={i}
                    reduced={reduced}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Body: description left / arch right ── */}
        <div className="grid bg-[var(--bg-surface)]/40 lg:grid-cols-[1fr_420px]">

          {/* Left: description + tech + CTA */}
          <div className="flex flex-col justify-between border-b border-white/[0.05] p-6 sm:p-10 md:p-12 lg:border-b-0 lg:border-r">
            {/* Image (if available) */}
            {featuredProject.image && (
              <motion.div
                {...fp(0.1)}
                className="relative mb-8 overflow-hidden rounded-2xl border border-white/[0.05] shadow-xl aspect-[16/9] group"
              >
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <img
                  src={featuredProject.image}
                  alt={`${featuredProject.title} preview`}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {/* Floating URL badge */}
                {featuredProject.liveUrl && (
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    <span className="font-mono text-[10px] text-white/70">
                      {featuredProject.liveUrl.replace('https://', '')}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            <div>
              <motion.div {...fp(0.16)} className="mb-6 text-[15px] leading-[1.82] text-[var(--text-secondary)]">
                {l(featuredProject.description, lang)}
              </motion.div>

              <motion.div {...fp(0.22)} className="mb-8 flex flex-wrap gap-2">
                {featuredProject.tech.map(t => <TechBadge key={t} label={t} accent />)}
              </motion.div>
            </div>

            <motion.div {...fp(0.28)}>
              {featuredProject.liveUrl && (
                <a
                  href={featuredProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={playHover}
                  onClick={playNavigation}
                  className="group inline-flex items-center gap-2.5 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-6 py-3 text-[14px] font-semibold text-[var(--accent)] transition-all duration-300 hover:bg-[var(--accent)] hover:text-white hover:border-transparent hover:shadow-[0_10px_28px_-8px_rgba(124,106,247,0.55)]"
                >
                  <ExternalLink size={15} />
                  {T.view}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              )}
            </motion.div>
          </div>

          {/* Right: Architecture stack */}
          <div className="p-6 sm:p-10 md:p-12">
            <motion.div {...fp(0.1)} className="mb-8 flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                <Layers size={13} />
              </span>
              <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-[var(--text-muted)] uppercase">
                {T.arch_label}
              </span>
            </motion.div>

            {/* Numbered stack */}
            <div className="relative flex flex-col gap-0">
              {/* Vertical connecting line */}
              <div className="absolute left-[14px] top-[28px] bottom-[28px] w-px bg-gradient-to-b from-[var(--accent)]/40 via-[var(--accent)]/20 to-transparent" />

              {featuredProject.architecture.map((item, i) => {
                const layerName = l(item.layer, lang)
                const LayerIcon = LAYER_ICONS[layerName] ?? Server
                return (
                  <motion.div
                    key={i}
                    {...fp(0.15 + i * 0.08)}
                    onMouseEnter={playHover}
                  className="group relative flex gap-5 pb-7 last:pb-0"
                  >
                    {/* Number node */}
                    <div
                      className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--bg-base)] font-mono text-[10px] font-bold text-[var(--accent)] transition-all duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]/10"
                    >
                      {i + 1}
                    </div>

                    {/* Content */}
                    <div className="pt-0.5">
                      <div className="mb-1 flex items-center gap-2">
                        <LayerIcon size={11} className="text-[var(--accent)]/60" />
                        <p className="font-mono text-[10px] font-bold tracking-[0.15em] text-[var(--accent)] uppercase">
                          {layerName}
                        </p>
                      </div>
                      <p className="text-[13.5px] leading-[1.7] text-[var(--text-muted)] transition-colors duration-300 group-hover:text-[var(--text-secondary)]">
                        {l(item.detail, lang)}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
