import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const GRAVITY   = 0.28
const DAMPING   = 0.78     // velocity multiplier on wall bounce
const FRICTION  = 0.995
const REPEL_R   = 110
const REPEL_F   = 5.5

const PALETTE = [
  [139, 92,  246],   // purple
  [96,  165, 250],   // blue
  [167, 139, 250],   // violet
  [52,  211, 153],   // teal
  [251, 146,  60],   // orange
  [251, 191,  36],   // yellow
  [236,  72, 153],   // pink
]

function makeBall(W, H, vx = 0, vy = 0) {
  const r   = Math.random() * 12 + 8
  const col = PALETTE[Math.floor(Math.random() * PALETTE.length)]
  return {
    x:  Math.random() * (W - 2 * r) + r,
    y:  Math.random() * (H / 2) + r,
    vx: vx || (Math.random() - 0.5) * 4,
    vy: vy || (Math.random() - 0.5) * 2,
    r,
    col,
  }
}

export function PhysicsField() {
  const canvasRef = useRef(null)
  const reduced   = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return

    let running = true
    let raf     = null
    let ctx     = null
    let W = 0, H = 0
    let balls   = []
    let mouse   = { x: -9999, y: -9999 }

    const setup = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      if (W === 0 || H === 0) { raf = requestAnimationFrame(setup); return }
      const dpr     = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width  = W * dpr
      canvas.height = H * dpr
      ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      balls = Array.from({ length: 13 }, () => makeBall(W, H))
      raf = requestAnimationFrame(tick)
    }

    const tick = () => {
      if (!running || !ctx) return
      ctx.clearRect(0, 0, W, H)

      // Update physics
      balls.forEach(b => {
        b.vy += GRAVITY
        b.vx *= FRICTION
        b.vy *= FRICTION

        // Mouse repulsion
        const dx  = b.x - mouse.x
        const dy  = b.y - mouse.y
        const d   = Math.sqrt(dx * dx + dy * dy)
        if (d < REPEL_R && d > 1) {
          const f = (1 - d / REPEL_R) * REPEL_F
          b.vx += (dx / d) * f
          b.vy += (dy / d) * f
        }

        b.x += b.vx
        b.y += b.vy

        // Wall collisions
        if (b.x - b.r < 0)   { b.x  = b.r;      b.vx = Math.abs(b.vx) * DAMPING }
        if (b.x + b.r > W)   { b.x  = W - b.r;  b.vx = -Math.abs(b.vx) * DAMPING }
        if (b.y - b.r < 0)   { b.y  = b.r;      b.vy = Math.abs(b.vy) * DAMPING }
        if (b.y + b.r > H)   { b.y  = H - b.r;  b.vy = -Math.abs(b.vy) * DAMPING }
      })

      // Ball-ball collision (position correction + velocity exchange)
      for (let i = 0; i < balls.length - 1; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a  = balls[i], b = balls[j]
          const dx = b.x - a.x,  dy = b.y - a.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          const minD = a.r + b.r
          if (d < minD && d > 0.01) {
            const nx   = dx / d,  ny = dy / d
            const over = (minD - d) / 2
            a.x -= nx * over;  a.y -= ny * over
            b.x += nx * over;  b.y += ny * over
            const dvx  = a.vx - b.vx, dvy = a.vy - b.vy
            const dot  = dvx * nx + dvy * ny
            if (dot > 0) {
              const imp = dot * 0.9
              a.vx -= imp * nx;  a.vy -= imp * ny
              b.vx += imp * nx;  b.vy += imp * ny
            }
          }
        }
      }

      // Draw balls
      balls.forEach(b => {
        const [r, g, bv] = b.col
        // Glow
        const grd = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1, b.x, b.y, b.r * 1.4)
        grd.addColorStop(0, `rgba(${r},${g},${bv},0.9)`)
        grd.addColorStop(0.6, `rgba(${r},${g},${bv},0.5)`)
        grd.addColorStop(1,   `rgba(${r},${g},${bv},0)`)
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r * 1.4, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Core
        const core = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1, b.x, b.y, b.r)
        core.addColorStop(0, `rgba(255,255,255,0.9)`)
        core.addColorStop(0.4, `rgba(${r},${g},${bv},0.95)`)
        core.addColorStop(1,   `rgba(${Math.floor(r*0.6)},${Math.floor(g*0.6)},${Math.floor(bv*0.6)},0.8)`)
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = core
        ctx.fill()
      })

      raf = requestAnimationFrame(tick)
    }

    const onMove  = e => {
      const rect = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => { mouse = { x: -9999, y: -9999 } }
    const onClick = e => {
      if (balls.length >= 22) return  // cap
      const rect = canvas.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2
        balls.push({ ...makeBall(W, H), x: cx, y: cy, vx: Math.cos(angle) * 5, vy: Math.sin(angle) * 5 - 3 })
      }
    }
    const onTouch = e => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const t    = e.touches[0]
      mouse = { x: t.clientX - rect.left, y: t.clientY - rect.top }
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
