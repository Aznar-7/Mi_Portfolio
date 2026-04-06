export function DotGrid() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Dot pattern with radial mask fade */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse 80% 55% at 50% 0%, black 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 55% at 50% 0%, black 30%, transparent 100%)',
        }}
      />

      {/* Violet glow bloom behind hero */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '500px',
          background:
            'radial-gradient(ellipse at center, rgba(124,106,247,0.18) 0%, transparent 70%)',
          animation: 'glow-pulse 6s ease-in-out infinite',
        }}
      />
    </div>
  )
}
