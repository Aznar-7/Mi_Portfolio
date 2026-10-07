import { lazy, Suspense, useState } from 'react'
import { cn } from '@/lib/utils'

// ponytail: temporary A/B of three backgrounds while choosing one.
// Delete the losing options and the dev switcher once decided.
const OPTIONS = {
  circuit:    { label: 'Circuit',     Component: lazy(() => import('./Circuit')),     props: {} },
  topography: { label: 'Topography',  Component: lazy(() => import('./Topography')),  props: {
    lowColor: '#1a1530', midColor: '#5b4bc4', highColor: '#a99dff', speed: 0.25, bands: 2.5,
    thickness: 0.008, glow: 0.35, contrast: 2.5, brightness: 0.9, grainIntensity: 0.03, mouseRadius: 0.25,
  } },
  grid:       { label: 'Ripple Grid', Component: lazy(() => import('./RippleGrid')), props: {
    gridColor: '#8b7bff', rippleIntensity: 0.03, gridSize: 12, gridThickness: 18, fadeDistance: 1.6,
    vignetteStrength: 2.2, glowIntensity: 0.08, opacity: 0.7, mouseInteractionRadius: 1.1,
  } },
}
const DEFAULT = 'circuit'

function initialChoice() {
  const fromUrl = new URLSearchParams(window.location.search).get('bg')
  return OPTIONS[fromUrl] ? fromUrl : DEFAULT
}

export function HeroBackground() {
  const [choice, setChoice] = useState(initialChoice)
  const { Component, props } = OPTIONS[choice]

  const pick = (id) => {
    setChoice(id)
    const url = new URL(window.location.href)
    url.searchParams.set('bg', id)
    window.history.replaceState(null, '', url)
  }

  return (
    <>
      <Suspense fallback={null}>
        <Component key={choice} {...props} />
      </Suspense>

      {import.meta.env.DEV && (
        <div className="pointer-events-auto fixed bottom-4 right-4 z-[200] flex gap-1 rounded-xl border border-[var(--line-strong)] bg-[var(--bg-elevated)]/90 p-1 text-xs backdrop-blur-md">
          {Object.entries(OPTIONS).map(([id, { label }]) => (
            <button
              key={id}
              type="button"
              onClick={() => pick(id)}
              className={cn('rounded-lg px-3 py-1.5', choice === id ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:text-white')}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
