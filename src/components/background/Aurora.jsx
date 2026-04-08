import { useReducedMotion } from '@/hooks/useReducedMotion'

export function Aurora({ className = '' }) {
  const reduced = useReducedMotion()

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className={reduced ? '' : 'aurora-blob-1'}
        style={{
          position: 'absolute',
          width: '600px',
          height: '400px',
          top: '-80px',
          left: '5%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #7c6af7 0%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: 0.12,
        }}
      />
      <div
        className={reduced ? '' : 'aurora-blob-2'}
        style={{
          position: 'absolute',
          width: '500px',
          height: '350px',
          top: '100px',
          right: '5%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.09,
        }}
      />
      <div
        className={reduced ? '' : 'aurora-blob-3'}
        style={{
          position: 'absolute',
          width: '400px',
          height: '300px',
          bottom: '0',
          left: '35%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #9b8cff 0%, transparent 70%)',
          filter: 'blur(120px)',
          opacity: 0.07,
        }}
      />
    </div>
  )
}
