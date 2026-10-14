import { motion } from 'motion/react'
import { ArrowDown, GitCommitHorizontal, TerminalSquare } from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'
import Circuit from '@/components/background/Circuit'
import { Button } from '@/components/common/Button'
import { HeroName } from '@/components/common/HeroName'
import { Fiducials } from '@/components/common/Fiducials'
import { ResumeDownloadMenu } from '@/components/common/ResumeDownloadMenu'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useLatestPush, timeAgo } from '@/hooks/useLatestPush'
import { useLocalTime } from '@/hooks/useLocalTime'
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
  const localTime = useLocalTime()

  // Staggered entrance for everything except the name, gated on `ready`
  const enter = (i) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
          transition: { duration: 0.6, ease: EASE, delay: (fromIntro ? 0.2 : 0.3) + i * 0.07 },
        }

  return (
    <section id="hero" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      >
        <ErrorBoundary fallback={null}>
          <Circuit />
        </ErrorBoundary>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-10 pt-28 sm:px-6 lg:pt-32">
        {/* Origin of the margin trace: it leaves the hero board on a pad and runs down the page */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-6 bottom-0 hidden h-56 w-px bg-[var(--accent)] xl:block">
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-[var(--accent)]" />
        </span>

        <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="min-w-0">
            <h1>
              {fromIntro ? (
                ready ? <HeroName layoutId="hero-name" /> : <HeroName className="invisible" />
              ) : (
                <HeroName reveal={!reduced} />
              )}
              <span className="sr-only">, {T.role}</span>
            </h1>

            <motion.p
              {...enter(0)}
              className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl sm:leading-relaxed"
            >
              <span className="text-[var(--text-primary)]">{T.role}.</span> {T.description}
            </motion.p>

            <motion.div {...enter(1)} className="mt-10 flex flex-wrap items-center gap-3">
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

          {/* Portrait framed by fiducials, with its silkscreen notes: status, local time, last push */}
          <figure>
            <div className="relative w-44 sm:w-52 lg:w-[280px] xl:w-[320px]">
              <Fiducials />
              <motion.div
                initial={reduced ? false : { clipPath: 'inset(100% 0 0 0)' }}
                animate={ready ? { clipPath: 'inset(0% 0 0 0)' } : undefined}
                transition={{ duration: 0.9, ease: EASE, delay: fromIntro ? 0.15 : 0.25 }}
                className="aspect-[4/5] overflow-hidden rounded-[2px] bg-[var(--bg-surface)]"
              >
                <img src="/port.jpg" alt={T.portrait_alt} fetchPriority="high" className="h-full w-full object-cover" />
              </motion.div>
            </div>
            <motion.figcaption {...enter(2)} className="silkscreen mt-5 flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--accent-hover)]" />
                {T.available}
              </span>
              <span>{T.local_time(localTime)}</span>
              {push && (
                <a
                  href={`${site.github}/${push.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-6 items-center gap-1.5 transition-colors hover:text-[var(--text-primary)]"
                >
                  <GitCommitHorizontal size={13} aria-hidden="true" />
                  {T.last_push(timeAgo(push.at, lang), push.repo)}
                </a>
              )}
            </motion.figcaption>
          </figure>
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
