import { motion } from 'motion/react'
import { site } from '@/data/site'

const EASE = [0.16, 1, 0.3, 1]

// The name set as the page's display type. Shared by the Intro and the
// Hero so both render it at the exact same size: the layoutId hand-off
// is then a pure translate, with no text distortion from scaling.
export function HeroName({ as: Tag = 'span', layoutId, reveal = false, className = '' }) {
  const words = site.name.split(' ')

  return (
    <Tag className={`block text-[clamp(3.6rem,12vw,9.5rem)] font-semibold leading-[0.86] tracking-[-0.055em] text-[var(--text-primary)] ${className}`}>
      <motion.span layoutId={layoutId} transition={{ duration: 0.9, ease: EASE }} className="block">
        {words.map((word, i) => (
          <span key={word} className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="block"
              initial={reveal ? { y: '105%' } : false}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.12 }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
