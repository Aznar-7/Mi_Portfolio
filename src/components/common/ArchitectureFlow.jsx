import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { useSoundEffects } from '@/contexts/SoundContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn, l } from '@/lib/utils'

const STEP_MS = 1400
const HOLD_MS = 2800 // pause on the last hop before the request starts over

// Consecutive nodes on the same host share one dashed box
function groupByHost(flow) {
  return flow.reduce((groups, node, index) => {
    const last = groups[groups.length - 1]
    if (last?.host === node.host) last.items.push({ node, index })
    else groups.push({ host: node.host, items: [{ node, index }] })
    return groups
  }, [])
}

// Line between two hops. It fills once the request has passed it (top-down
// on mobile, left-right on desktop); the hop in progress also shows a packet.
function Connector({ filled, travelling, grow }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative mx-auto block h-7 w-px shrink-0 self-center bg-[var(--line-strong)] md:mx-0 md:h-px',
        grow ? 'md:w-auto md:min-w-8 md:flex-1' : 'md:w-14',
      )}
    >
      <span
        style={{ '--p': filled ? 1 : 0 }}
        className="absolute inset-0 origin-top bg-[var(--accent-hover)] transition-transform duration-500 ease-out [transform:scaleY(var(--p))] md:origin-left md:[transform:scaleX(var(--p))]"
      />
      {travelling && (
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 animate-[packet-y_0.5s_ease-out_forwards] rounded-full bg-white shadow-[0_0_10px_3px_var(--accent-hover)] md:left-0 md:top-1/2 md:animate-[packet-x_0.5s_ease-out_forwards]" />
      )}
    </span>
  )
}

function Node({ node, state, lang, onPin, onRelease }) {
  return (
    <button
      type="button"
      onMouseEnter={onPin}
      onFocus={onPin}
      onMouseLeave={onRelease}
      onBlur={onRelease}
      aria-pressed={state === 'active'}
      className={cn(
        'relative w-full rounded-xl border px-4 py-3 text-left transition-[border-color,background-color,box-shadow] duration-300 md:w-auto md:min-w-[9.5rem]',
        state === 'active' && 'border-[var(--accent-hover)] bg-[var(--accent)]/10 shadow-[0_0_0_4px_var(--accent-glow)]',
        state === 'reached' && 'border-[var(--line-strong)] bg-[var(--bg-surface)]',
        state === 'idle' && 'border-[var(--line)] bg-[var(--bg-surface)]/40',
      )}
    >
      <span className={cn('block text-[15px] font-medium transition-colors duration-300', state === 'idle' ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]')}>
        {l(node.name, lang)}
      </span>
      <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{node.tech}</span>
    </button>
  )
}

/**
 * A request travelling through a system's layers. Auto-plays while on
 * screen; hovering or focusing a layer pins it and shows what it does.
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
  const stateOf = (index) => (index === shown ? 'active' : index < shown ? 'reached' : 'idle')
  const node = flow[shown]

  return (
    <figure ref={rootRef} className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-8">
      <figcaption className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm text-[var(--text-secondary)]">{title}</span>
        <span className="hidden text-xs text-[var(--text-muted)] md:inline">{hint}</span>
      </figcaption>

      <div className="flex flex-col md:flex-row md:items-stretch">
        {groupByHost(flow).map((group, g) => (
          <Fragment key={group.host + g}>
            {g > 0 && <Connector filled={group.items[0].index <= shown} travelling={group.items[0].index === shown && shown > 0} />}
            <div className={cn('relative rounded-2xl border border-dashed border-[var(--line-strong)] p-3 pt-8 md:flex md:items-center', group.items.length > 1 && 'md:flex-1')}>
              <span className="absolute left-3 top-2.5 text-xs text-[var(--text-muted)]">{group.host}</span>
              <div className="flex flex-col md:w-full md:flex-row md:items-center">
                {group.items.map(({ node: n, index }, i) => (
                  <Fragment key={n.id}>
                    {i > 0 && <Connector filled={index <= shown} travelling={index === shown} grow />}
                    <Node node={n} state={stateOf(index)} lang={lang} onPin={() => pin(index)} onRelease={release} />
                  </Fragment>
                ))}
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="mt-6 min-h-[5.5rem] border-t border-[var(--line)] pt-5" aria-live="polite">
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
