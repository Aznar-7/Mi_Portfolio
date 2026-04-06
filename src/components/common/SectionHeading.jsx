export function SectionHeading({ label, title, subtitle }) {
  return (
    <div style={{ marginBottom: '48px' }}>
      {label && (
        <p
          style={{
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            margin: '0 0 12px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {label}
        </p>
      )}
      <h2
        style={{
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          margin: '0 0 16px',
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
