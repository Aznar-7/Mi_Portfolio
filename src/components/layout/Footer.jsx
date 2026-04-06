import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { site } from '@/data/site'

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: '1152px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
          © {new Date().getFullYear()} {site.name}
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="GitHub"
          >
            <GitHubIcon size={18} />
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="LinkedIn"
          >
            <LinkedInIcon size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
