import { motion } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1], // expo ease-out
    },
  },
}

/**
 * Words that should render with the gradient-text class for visual emphasis.
 * Edit to match the tagline words you want highlighted.
 */
const HIGHLIGHT_WORDS = new Set(['scale', 'production.', 'prototype'])

export function AnimatedText({ text, as = 'h1', className = '', style = {}, highlightWords = true }) {
  const reduced = useReducedMotion()
  const words = text.split(' ')

  if (reduced) {
    const Plain = as
    return (
      <Plain className={className} style={style}>
        {text}
      </Plain>
    )
  }

  const Tag = motion[as]

  return (
    <Tag
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0.28em' }}
    >
      {words.map((word, i) => {
        const isHighlight = highlightWords && HIGHLIGHT_WORDS.has(word.toLowerCase())
        return (
          <motion.span
            key={i}
            variants={wordVariants}
            style={{ display: 'inline-block', overflow: 'visible' }}
            className={isHighlight ? 'gradient-text' : undefined}
          >
            {word}
          </motion.span>
        )
      })}
    </Tag>
  )
}
