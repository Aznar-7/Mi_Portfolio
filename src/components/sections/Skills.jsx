import { motion } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { TechBadge } from '@/components/common/TechBadge'
import { skills } from '@/data/skills'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const categoryVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }, // spring overshoot
  },
}

export function Skills() {
  const reduced = useReducedMotion()

  return (
    <SectionWrapper id="skills">
      <SectionHeading
        label="// 04 — Stack"
        title="Habilidades técnicas"
        subtitle="Organizado por área de especialización."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', maxWidth: '760px' }}>
        {Object.entries(skills).map(([category, data], catIndex) => (
          <motion.div
            key={category}
            initial={reduced ? false : { opacity: 0, x: -16 }}
            whileInView={reduced ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: catIndex * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: data.academic ? 'var(--text-muted)' : 'var(--accent)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: '0 0 14px',
                fontStyle: data.academic ? 'italic' : 'normal',
              }}
            >
              {category}
            </p>
            <motion.div
              variants={reduced ? {} : categoryVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
            >
              {data.items.map((skill) => (
                <motion.div key={skill} variants={reduced ? {} : badgeVariants}>
                  <TechBadge label={skill} accent={data.accent} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  )
}
