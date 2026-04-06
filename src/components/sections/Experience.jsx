import { motion } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { experience, academic } from '@/data/experience'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function ExperienceCard({ item, type, index = 0 }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: -24 }}
      whileInView={reduced ? {} : { opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', gap: '24px', paddingBottom: '40px' }}
    >
      {/* Timeline dot + line */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: type === 'work' ? 'var(--accent)' : 'var(--text-muted)',
            border: '2px solid var(--bg-base)',
            boxShadow: type === 'work' ? '0 0 0 3px rgba(124,106,247,0.2)' : 'none',
            flexShrink: 0,
            marginTop: '5px',
          }}
        />
        <div
          style={{
            width: '1px',
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.06)',
            marginTop: '8px',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: '8px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '4px',
            flexWrap: 'wrap',
            gap: '4px',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {item.role || item.degree}
          </h3>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {item.period}
          </span>
        </div>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--accent)',
            margin: '0 0 16px',
            fontWeight: 500,
          }}
        >
          {item.company || item.institution}
        </p>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {(item.impact || item.highlights).map((point, i) => (
            <li
              key={i}
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                paddingLeft: '16px',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '9px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-muted)',
                  display: 'inline-block',
                }}
              />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export function Experience() {
  return (
    <SectionWrapper id="experience">
      <SectionHeading
        label="// 02 — Trayectoria"
        title="Experiencia"
        subtitle="Impacto real, no solo tareas."
      />

      <div style={{ maxWidth: '720px' }}>
        {experience.map((item, i) => (
          <ExperienceCard key={i} item={item} type="work" index={i} />
        ))}

        {/* Academic divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '16px 0 32px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}
          >
            Formación académica
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </div>

        {academic.map((item, i) => (
          <ExperienceCard key={i} item={item} type="academic" index={i} />
        ))}
      </div>
    </SectionWrapper>
  )
}
