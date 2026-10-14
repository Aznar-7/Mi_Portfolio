import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { useSoundEffects } from '@/contexts/SoundContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn, l } from '@/lib/utils'

const STEP_MS = 1400
const HOLD_MS = 2800 // pause on the last hop before the request starts over
const COLS = 'md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]'

// Consecutive nodes on the same host share one dimension line
function groupByHost(flow) {
  return flow.reduce((groups, node) => {
    const last = groups[groups.length - 1]
    if (last?.host === node.host) last.count += 1
    else groups.push({ host: node.host, count: 1 })
    return groups
  }, [])
}

/**
 * A request travelling through a system's layers, drawn like a blueprint:
 * one track, a marker per layer, hosts as dimension lines. Auto-plays while
 * on screen; hovering or focusing a layer pins it and explains it.
 */
export function ArchitectureFlow({ flow, lang, title, hint }) {
  const reduced = useReducedMotion()
  const { playHover } = useSoundEffects()
  const rootRef = useRef(null)
  const inView = useInView(rootRef, { amount: 0.4 })
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(null)
  const shown = pinned ?? active
  const last = flow.length - 1

  useEffect(() => {
    if (reduced || pinned !== null || !inView) return
    const t = setTimeout(() => setActive((a) => (a >= last ? 0 : a + 1)), active >= last ? HOLD_MS : STEP_MS)
    return () => clearTimeout(t)
  }, [active, pinned, inView, reduced, last])

  const pin = (index) => { if (pinned !== index) playHover(); setPinned(index) }
  const release = () => { if (pinned !== null) setActive(pinned); setPinned(null) }

  const node = flow[shown]
  const vars = {
    '--n': flow.length,
    '--edge': `${50 / flow.length}%`, // track runs between the first and last marker centers
    '--p': last ? shown / last : 0,
  }

  return (
    <figure ref={rootRef} style={vars} className="border-t border-[var(--line)] pt-8">
      <figcaption className="mb-10 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm text-[var(--text-muted)]">{title}</span>
        <span className="hidden text-sm text-[var(--text-muted)] md:inline">{hint}</span>
      </figcaption>

      {/* Hosts as dimension lines over the layers they run (desktop) */}
      <div className={cn('mb-6 hidden md:grid', COLS)}>
        {groupByHost(flow).map((g, i) => (
          <div key={g.host + i} style={{ gridColumn: `span ${g.count}` }} className="px-3">
            <span className="block text-xs text-[var(--text-muted)]">{g.host}</span>
            <span aria-hidden="true" className="mt-2 block h-2 border-x border-t border-[var(--line-strong)]" />
          </div>
        ))}
      </div>

      <div className={cn('relative grid auto-rows-fr md:auto-rows-auto', COLS)}>
        {/* Track: vertical on mobile, horizontal on desktop */}
        <span
          aria-hidden="true"
          className="absolute bottom-[var(--edge)] left-[7px] top-[var(--edge)] w-px bg-[var(--line-strong)] md:bottom-auto md:left-[var(--edge)] md:right-[var(--edge)] md:top-[7px] md:h-px md:w-auto"
        >
          <span className="absolute inset-0 origin-top bg-[var(--accent-hover)] transition-transform duration-700 ease-out [transform:scaleY(var(--p))] md:origin-left md:[transform:scaleX(var(--p))]" />
          {!reduced && (
            <span
              className={cn(
                'absolute left-1/2 top-[calc(var(--p)*100%)] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_3px_var(--accent-hover)] md:left-[calc(var(--p)*100%)] md:top-1/2',
                shown === 0 ? 'opacity-0' : 'transition-[top,left] duration-700 ease-out',
              )}
            />
          )}
        </span>

        {flow.map((n, i) => {
          const state = i === shown ? 'active' : i < shown ? 'reached' : 'idle'
          return (
            <button
              key={n.id}
              type="button"
              onMouseEnter={() => pin(i)}
              onFocus={() => pin(i)}
              onMouseLeave={release}
              onBlur={release}
              aria-pressed={state === 'active'}
              className="group relative flex items-center gap-4 py-3 text-left md:flex-col md:gap-3 md:px-3 md:py-0 md:text-center"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-10 h-[15px] w-[15px] shrink-0 rounded-full border transition-[background-color,border-color,box-shadow] duration-300',
                  state === 'active' && 'border-[var(--accent-hover)] bg-[var(--accent)] shadow-[0_0_0_5px_var(--accent-glow)]',
                  state === 'reached' && 'border-[var(--accent-hover)] bg-[var(--bg-base)]',
                  state === 'idle' && 'border-[var(--line-strong)] bg-[var(--bg-base)] group-hover:border-[var(--text-muted)]',
                )}
              />
              <span>
                <span className={cn('block text-[15px] font-medium transition-colors duration-300', state === 'idle' ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]')}>
                  {l(n.name, lang)}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                  <span className="md:hidden">{n.host}, </span>{n.tech}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-10 min-h-[5.5rem] border-t border-[var(--line)] pt-6" aria-live="polite">
        <motion.div
          key={node.id}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="flex flex-wrap items-baseline gap-x-3 text-[15px] font-medium text-[var(--text-primary)]">
            {l(node.name, lang)}
            <span className="text-sm font-normal text-[var(--text-muted)]">{node.tech}</span>
          </p>
          <p className="mt-1.5 max-w-3xl text-[15px] leading-relaxed text-[var(--text-secondary)]">{l(node.detail, lang)}</p>
        </motion.div>
      </div>
    </figure>
  )
}
