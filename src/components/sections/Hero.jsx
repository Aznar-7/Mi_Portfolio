import { motion } from 'motion/react'
import { ArrowDown, GitCommitHorizontal, TerminalSquare } from 'lucide-react'
import Circuit from '@/components/background/Circuit'
import { Button } from '@/components/common/Button'
import { HeroName } from '@/components/common/HeroName'
import { ResumeDownloadMenu } from '@/components/common/ResumeDownloadMenu'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useLatestPush, timeAgo } from '@/hooks/useLatestPush'
import { site } from '@/data/site'

const EASE = [0.16, 1, 0.3, 1]

const openOS = () => document.dispatchEvent(new CustomEvent('open-ubuntu'))
const scrollToProjects = () => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })

/**
 * @param {boolean} ready      false while the intro overlay is still on screen
 * @param {boolean} fromIntro  the name arrives from the intro via layoutId
 */
export function Hero({ ready = true, fromIntro = false }) {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].hero
  const push = useLatestPush(site.github.split('github.com/')[1])

  // Staggered entrance for everything except the name, gated on `ready`
  const enter = (i) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
          transition: { duration: 0.8, ease: EASE, delay: (fromIntro ? 0.45 : 0.55) + i * 0.08 },
        }

  return (
    <section id="hero" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      >
        <Circuit />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-10 pt-28 sm:px-6 lg:pt-32">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="min-w-0">
            <motion.div {...enter(0)} className="mb-8 flex flex-wrap items-center gap-3">
              <img
                src="/port.jpg"
                alt={T.portrait_alt}
                width="40"
                height="40"
                className="h-10 w-10 rounded-full object-cover lg:hidden"
              />
              <span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {T.available}
              </span>
              {push && (
                <motion.a
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  href={`${site.github}/${push.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden items-center gap-2 border-l border-[var(--line-strong)] pl-3 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] sm:inline-flex"
                >
                  <GitCommitHorizontal size={15} aria-hidden="true" />
                  {T.last_push(timeAgo(push.at, lang), push.repo)}
                </motion.a>
              )}
            </motion.div>

            <h1>
              {fromIntro ? (
                ready ? <HeroName layoutId="hero-name" /> : <HeroName className="invisible" />
              ) : (
                <HeroName reveal={!reduced} />
              )}
              <span className="sr-only">, {T.role}</span>
            </h1>

            <motion.p
              {...enter(1)}
              className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl sm:leading-relaxed"
            >
              <span className="text-[var(--text-primary)]">{T.role}.</span> {T.description}
            </motion.p>

            <motion.div {...enter(2)} className="mt-10 flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={scrollToProjects}>
                {T.cta_primary}
                <ArrowDown size={16} aria-hidden="true" className="transition-transform duration-300 group-hover/btn:translate-y-0.5" />
              </Button>
              <ResumeDownloadMenu />
              <Button variant="ghost" onClick={openOS} title={T.open_os_hint}>
                <TerminalSquare size={16} aria-hidden="true" className="transition-transform duration-300 group-hover/btn:-rotate-6" />
                {T.open_os}
              </Button>
            </motion.div>
          </div>

          <motion.figure
            initial={reduced ? false : { clipPath: 'inset(100% 0 0 0)' }}
            animate={ready ? { clipPath: 'inset(0% 0 0 0)' } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: fromIntro ? 0.35 : 0.45 }}
            className="relative hidden aspect-[4/5] w-[300px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] lg:block xl:w-[340px]"
          >
            <img
              src="/port.jpg"
              alt={T.portrait_alt}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg-base)]/50 via-transparent to-transparent" />
          </motion.figure>
        </div>

        <motion.dl
          {...enter(3)}
          className="mt-16 grid gap-6 border-t border-[var(--line)] pt-6 sm:grid-cols-3 lg:mt-24"
        >
          {T.facts.map(({ term, detail }) => (
            <div key={term}>
              <dt className="text-sm text-[var(--text-muted)]">{term}</dt>
              <dd className="mt-1 text-[15px] text-[var(--text-primary)]">{detail}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}
