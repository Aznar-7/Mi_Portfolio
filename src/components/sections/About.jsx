import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { about } from '@/data/about'

export function About() {
  return (
    <SectionWrapper id="about">
      <SectionHeading label="// 05 — Sobre mí" title="Quién soy" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '48px',
          alignItems: 'start',
        }}
      >
        {/* Bio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {about.bio.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: '15px',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Quick facts */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 20px',
            }}
          >
            Quick facts
          </p>
          <dl style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: 0 }}>
            {about.quickFacts.map((fact) => (
              <div key={fact.label}>
                <dt
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '2px',
                  }}
                >
                  {fact.label}
                </dt>
                <dd
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </SectionWrapper>
  )
}
