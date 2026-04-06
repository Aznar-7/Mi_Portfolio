import { motion } from 'motion/react'
import { ExternalLink } from 'lucide-react'
import { GitHubIcon } from '@/components/common/SocialIcons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TechBadge } from './TechBadge'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const STATUS_LABELS = {
  'in-development': { label: 'En desarrollo', color: '#4ade80' },
  completed: { label: 'Completado', color: '#9b8cff' },
}

export function ProjectCard({ project }) {
  const reduced = useReducedMotion()
  const status = STATUS_LABELS[project.status]

  return (
    <motion.div
      whileHover={reduced ? {} : { y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ height: '100%' }}
    >
      <Card
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'border-color 0.2s',
          borderRadius: '10px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(124,106,247,0.3)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <CardHeader style={{ padding: '20px 20px 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px',
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
              {project.title}
            </h3>
            {status && (
              <span
                style={{
                  fontSize: '11px',
                  color: status.color,
                  backgroundColor: `${status.color}20`,
                  border: `1px solid ${status.color}40`,
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  marginLeft: '8px',
                }}
              >
                {status.label}
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description}
          </p>
        </CardHeader>

        <CardContent
          style={{
            padding: '16px 20px 20px',
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {project.tech.map((t) => (
              <TechBadge key={t} label={t} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'var(--accent-hover)',
                  textDecoration: 'none',
                  padding: '4px 10px',
                  border: '1px solid rgba(124,106,247,0.3)',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(124,106,247,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <ExternalLink size={12} /> Live
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '4px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                <GitHubIcon size={12} /> GitHub
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
