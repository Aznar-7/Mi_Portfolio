import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const WAVES = [
  { freq: 0.012, amp: 38, speed: 0.018, color: 'rgba(139,92,246,', phase: 0   },
  { freq: 0.018, amp: 28, speed: 0.026, color: 'rgba(96,165,250,',  phase: 2   },
  { freq: 0.008, amp: 48, speed: 0.012, color: 'rgba(167,139,250,', phase: 4.5 },
  { freq: 0.025, amp: 18, speed: 0.038, color: 'rgba(52,211,153,',  phase: 1.2 },
]

export function WaveField() {
  const canvasRef = useRef(null)
  const reduced   = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return

    let running = true
    let raf     = null
    let ctx     = null
    let W = 0, H = 0
    let mouse   = { x: -1, y: -1 }
    let time    = 0
    // Per-wave phase accumulator
    let phases  = WAVES.map(w => w.phase)
    let splash  = null   // { x, t } — click distortion

    const setup = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      if (W === 0 || H === 0) { raf = requestAnimationFrame(setup); return }
      const dpr     = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width  = W * dpr
      canvas.height = H * dpr
      ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      raf = requestAnimationFrame(tick)
    }

    const tick = () => {
      if (!running || !ctx) return
      ctx.clearRect(0, 0, W, H)

      // Mouse influence: y moves vertical offset, x tweaks frequency slightly
      const mouseInfluence = mouse.y > 0 ? (mouse.y / H - 0.5) * 0.6 : 0
      const mousePhase     = mouse.x > 0 ? (mouse.x / W - 0.5) * 1.2 : 0

      WAVES.forEach((w, i) => {
        phases[i] += w.speed

        ctx.beginPath()
        for (let x = 0; x <= W; x += 2) {
          // Base sine
          let y = Math.sin(x * w.freq + phases[i] + mousePhase * (i % 2 === 0 ? 1 : -1)) * (w.amp + mouseInfluence * 20)

          // Splash distortion
          if (splash) {
            const dx    = x - splash.x
            const decay = Math.max(0, 1 - splash.t / 60)
            y += Math.sin(dx * 0.05 - splash.t * 0.4) * 18 * decay * Math.exp(-dx * dx / 80000)
          }

          const drawY = H / 2 + y
          x === 0 ? ctx.moveTo(x, drawY) : ctx.lineTo(x, drawY)
        }

        // Fill below each wave
        ctx.lineTo(W, H)
        ctx.lineTo(0, H)
        ctx.closePath()

        const alpha = 0.08 + i * 0.012
        ctx.fillStyle = `${w.color}${alpha})`
        ctx.fill()

        // Stroke line
        ctx.beginPath()
        for (let x = 0; x <= W; x += 2) {
          let y = Math.sin(x * w.freq + phases[i] + mousePhase * (i % 2 === 0 ? 1 : -1)) * (w.amp + mouseInfluence * 20)
          if (splash) {
            const dx    = x - splash.x
            const decay = Math.max(0, 1 - splash.t / 60)
            y += Math.sin(dx * 0.05 - splash.t * 0.4) * 18 * decay * Math.exp(-dx * dx / 80000)
          }
          const drawY = H / 2 + y
          x === 0 ? ctx.moveTo(x, drawY) : ctx.lineTo(x, drawY)
        }
        ctx.strokeStyle = `${w.color}${0.35 + i * 0.05})`
        ctx.lineWidth   = 1.5
        ctx.stroke()
      })

      if (splash) {
        splash.t++
        if (splash.t > 60) splash = null
      }

      time++
      raf = requestAnimationFrame(tick)
    }

    const onMove  = e => {
      const r = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => { mouse = { x: -1, y: -1 } }
    const onClick = e => {
      const r = canvas.getBoundingClientRect()
      splash = { x: e.clientX - r.left, t: 0 }
    }
    const onTouch = e => {
      e.preventDefault()
      const r = canvas.getBoundingClientRect()
      const t = e.touches[0]
      mouse = { x: t.clientX - r.left, y: t.clientY - r.top }
    }

    canvas.addEventListener('mousemove',  onMove)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('click',      onClick)
    canvas.addEventListener('touchmove',  onTouch, { passive: false })
    canvas.addEventListener('touchend',   onLeave)

    raf = requestAnimationFrame(setup)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove',  onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('click',      onClick)
      canvas.removeEventListener('touchmove',  onTouch)
      canvas.removeEventListener('touchend',   onLeave)
    }
  }, [reduced])

  if (reduced) return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[rgb(8,6,20)]">
      <span className="font-mono text-xs tracking-[0.3em] text-white/20 uppercase">· · ·</span>
    </div>
  )

  return <canvas ref={canvasRef} className="h-full w-full cursor-crosshair rounded-2xl" />
}
