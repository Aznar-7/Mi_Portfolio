import { motion } from 'motion/react'
import { ExternalLink, Layers } from 'lucide-react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { TechBadge } from '@/components/common/TechBadge'
import { featuredProject } from '@/data/projects'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function FeaturedProject() {
  const reduced = useReducedMotion()

  return (
    <SectionWrapper id="featured">
      <SectionHeading
        label="// 01 — Proyecto Principal"
        title={featuredProject.title}
        subtitle={featuredProject.tagline}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px',
          alignItems: 'start',
        }}
      >
        {/* Left: Description + links */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#4ade80',
              backgroundColor: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: '4px',
              padding: '3px 10px',
              fontFamily: 'var(--font-mono)',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: '#4ade80',
                display: 'inline-block',
              }}
            />
            En desarrollo activo
          </div>

          {featuredProject.description.split('. ').filter(Boolean).map((sentence, i) => (
            <p
              key={i}
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                fontSize: '15px',
                margin: '0 0 12px',
              }}
            >
              {sentence.endsWith('.') ? sentence : `${sentence}.`}
            </p>
          ))}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '24px 0' }}>
            {featuredProject.tech.map((t) => (
              <TechBadge key={t} label={t} accent />
            ))}
          </div>

          {featuredProject.liveUrl && (
            <a
              href={featuredProject.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: 'var(--accent)',
                color: '#fff',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              <ExternalLink size={14} /> Ver proyecto
            </a>
          )}
        </div>

        {/* Right: Architecture layers */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <Layers size={14} /> Arquitectura del sistema
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {featuredProject.architecture.map((item, i) => (
              <motion.div
                key={item.layer}
                initial={reduced ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--accent)',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-mono)',
                    margin: '0 0 6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {item.layer}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
