import { Mail } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { site } from '@/data/site'

export function Contact() {
  return (
    <SectionWrapper id="contact">
      <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: '0 0 16px',
          }}
        >
          // 06 — Contacto
        </p>
        <h2
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            margin: '0 0 16px',
            lineHeight: 1.1,
          }}
        >
          Construyamos algo.
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 40px',
          }}
        >
          Disponible para proyectos freelance, roles full-stack y colaboraciones open source.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <a
            href={`mailto:${site.email}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 500,
              backgroundColor: 'var(--accent)',
              color: '#fff',
              textDecoration: 'none',
              transition: 'background-color 0.2s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Mail size={16} /> {site.email}
          </a>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              }}
            >
              <GitHubIcon size={15} /> GitHub
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              }}
            >
              <LinkedInIcon size={15} /> LinkedIn
            </a>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
