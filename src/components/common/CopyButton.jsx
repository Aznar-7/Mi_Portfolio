import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Copy, Check } from 'lucide-react'
import { useSoundEffects } from '@/contexts/SoundContext'
import { cn } from '@/lib/utils'

const SWAP = {
  initial: { opacity: 0, y: 8, scale: 0.6, rotate: -30 },
  animate: { opacity: 1, y: 0, scale: 1, rotate: 0 },
  exit:    { opacity: 0, y: -8, scale: 0.6, rotate: 30 },
  transition: { type: 'spring', stiffness: 500, damping: 28 },
}

/** Copies `value` and confirms with an icon/label morph and a chime. */
export function CopyButton({ value, label, copiedLabel, className }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)
  const { playSuccess, playHover } = useSoundEffects()

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    playSuccess()
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={copy}
      onMouseEnter={playHover}
      className={cn(
        'relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-[10px] border px-3.5 text-[13px] font-medium transition-colors duration-300 active:scale-[0.97]',
        copied
          ? 'border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-300'
          : 'border-[var(--line-strong)] text-[var(--text-primary)] hover:bg-white/[0.04]',
        className,
      )}
    >
      <span className="relative h-3.5 w-3.5">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={copied ? 'check' : 'copy'} className="absolute inset-0" {...SWAP}>
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="relative" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={copied ? 'done' : 'idle'}
            className="block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {copied ? copiedLabel : label}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  )
}
