import { motion } from 'motion/react'
import { ArrowDown, Mail, ArrowRight } from 'lucide-react'
import { AnimatedText } from '@/components/common/AnimatedText'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { site } from '@/data/site'

const STATS = [
  { value: '2+', label: 'Años de experiencia' },
  { value: '10+', label: 'Sistemas construidos' },
  { value: 'E2E', label: 'Frontend → Cloud' },
]

// Staggered fade+slide animation for child elements
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 18, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
  }
}

export function Hero() {
  const reduced = useReducedMotion()

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const fp = (delay) => (reduced ? {} : fadeUp(delay))

  return (
    <section
      id="hero"
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        maxWidth: '1152px',
        margin: '0 auto',
        padding: '96px 24px 64px',
      }}
    >
      {/* Role badge */}
      <motion.div {...fp(0.15)} style={{ marginBottom: '28px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            backgroundColor: 'rgba(124,106,247,0.1)',
            border: '1px solid rgba(124,106,247,0.25)',
            borderRadius: '100px',
            padding: '5px 14px',
            letterSpacing: '0.04em',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success)',
              display: 'inline-block',
              animation: reduced ? 'none' : 'dot-pulse 2s ease-in-out infinite',
            }}
          />
          {site.role}
        </span>
      </motion.div>

      {/* Headline — words animate with blur + y */}
      <AnimatedText
        text={site.tagline}
        as="h1"
        style={{
          fontSize: 'clamp(38px, 7vw, 76px)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 1.06,
          color: 'var(--text-primary)',
          maxWidth: '900px',
          margin: '0 0 28px',
        }}
      />

      {/* Name line */}
      <motion.p {...fp(0.5)} style={{ margin: '0 0 28px' }}>
        <span
          style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          — {site.name}
        </span>
      </motion.p>

      {/* Subheading */}
      <motion.p
        {...fp(0.62)}
        style={{
          fontSize: 'clamp(15px, 2vw, 17px)',
          color: 'var(--text-secondary)',
          maxWidth: '520px',
          lineHeight: 1.7,
          margin: '0 0 40px',
        }}
      >
        {site.description}
      </motion.p>

      {/* CTAs */}
      <motion.div
        {...fp(0.76)}
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '56px' }}
      >
        {/* Primary CTA */}
        <button
          onClick={() => scrollTo('featured')}
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 26px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'none',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.01em',
            transition: 'background-color 0.2s, transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 0 0 0 rgba(124,106,247,0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,106,247,0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 0 0 0 rgba(124,106,247,0)'
          }}
        >
          Ver UTN Hub <ArrowRight size={14} />
        </button>

        {/* Ghost CTA */}
        <button
          onClick={() => scrollTo('contact')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 26px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'none',
            fontFamily: 'var(--font-sans)',
            transition: 'color 0.2s, border-color 0.2s, background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Mail size={15} /> Contacto
        </button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        {...fp(0.9)}
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '64px',
        }}
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              paddingRight: '32px',
              marginRight: '32px',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}
          >
            <div
              style={{
                fontSize: 'clamp(20px, 3vw, 26px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1,
                marginBottom: '4px',
              }}
              className="gradient-text"
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                letterSpacing: '0.03em',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        {...fp(1.05)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'none',
        }}
        onClick={() => scrollTo('featured')}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '32px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              backgroundColor: 'var(--accent)',
              opacity: 0.6,
              animation: reduced ? 'none' : 'scroll-line 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </motion.div>
    </section>
  )
}
