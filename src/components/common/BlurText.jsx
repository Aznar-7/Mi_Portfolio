import { useRef, useEffect, useState } from 'react'
import { motion, useAnimation } from 'motion/react'

const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
  stepDuration = 0.35,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('')
  const [inView, setInView] = useState(false)
  const ref = useRef(null)
  const animationControls = useAnimation()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(ref.current)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    animationControls.start('visible')
  }, [inView, animationControls])

  const defaultFrom =
    direction === 'top'
      ? { filter: 'blur(10px)', opacity: 0, y: -20 }
      : { filter: 'blur(10px)', opacity: 0, y: 20 }

  const defaultTo = [
    {
      filter: 'blur(5px)',
      opacity: 0.5,
      y: direction === 'top' ? -8 : 8,
      transition: { duration: stepDuration },
    },
    {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: { duration: stepDuration },
    },
  ]

  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em' }}>
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          initial={defaultFrom}
          animate={animationControls}
          variants={{
            visible: {
              filter: defaultTo[1].filter,
              opacity: defaultTo[1].opacity,
              y: defaultTo[1].y,
              transition: {
                delay: (index * delay) / 1000,
                duration: stepDuration * 2,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          style={{ display: 'inline-block' }}
        >
          {segment}
        </motion.span>
      ))}
    </p>
  )
}

export default BlurText
