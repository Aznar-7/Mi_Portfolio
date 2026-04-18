import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const N            = 90
const CONN_SQ      = 85 * 85      // connection max distance²
const ATTRACT_R    = 145
const MAX_SPD      = 3.8
const EXPLODE_F    = 8
const EXPLODE_R    = 200

export function ParticleField() {
  const canvasRef = useRef(null)
  const reduced   = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return

    let running  = true
    let raf      = null
    let ctx      = null
    let W = 0, H = 0
    let particles = []
    let mouse = { x: -9999, y: -9999 }

    const setup = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      if (W === 0 || H === 0) { raf = requestAnimationFrame(setup); return }

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width  = W * dpr
      canvas.height = H * dpr
      ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      particles = Array.from({ length: N }, () => ({
        x:   Math.random() * W,
        y:   Math.random() * H,
        vx:  (Math.random() - 0.5) * 0.7,
        vy:  (Math.random() - 0.5) * 0.7,
        r:   Math.random() * 1.7 + 0.5,
        hue: 240 + Math.random() * 75,   // deep blue → purple → violet
        a:   Math.random() * 0.45 + 0.2,
      }))

      raf = requestAnimationFrame(tick)
    }

    const tick = () => {
      if (!running || !ctx) return

      // Fade trail
      ctx.fillStyle = 'rgba(8, 6, 20, 0.15)'
      ctx.fillRect(0, 0, W, H)

      // Draw connections
      ctx.lineWidth = 0.55
      for (let i = 0; i < particles.length - 1; i++) {
        const p1 = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const p2  = particles[j]
          const dx  = p1.x - p2.x
          const dy  = p1.y - p2.y
          const dSq = dx * dx + dy * dy
          if (dSq < CONN_SQ) {
            const alpha = (1 - Math.sqrt(dSq) / 85) * 0.16
            ctx.beginPath()
            ctx.strokeStyle = `rgba(167,139,250,${alpha})`
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      // Update + draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Brownian
        p.vx += (Math.random() - 0.5) * 0.022
        p.vy += (Math.random() - 0.5) * 0.022

        // Cursor attraction
        const mdx  = mouse.x - p.x
        const mdy  = mouse.y - p.y
        const mDst = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mDst < ATTRACT_R && mDst > 1) {
          const f = (1 - mDst / ATTRACT_R) * 0.058
          p.vx += (mdx / mDst) * f
          p.vy += (mdy / mDst) * f
        }

        // Cap speed
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (spd > MAX_SPD) { p.vx = (p.vx / spd) * MAX_SPD; p.vy = (p.vy / spd) * MAX_SPD }

        // Damping
        p.vx *= 0.978
        p.vy *= 0.978
        p.x  += p.vx
        p.y  += p.vy

        // Wrap edges
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        // Draw glow core
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5)
        grd.addColorStop(0, `hsla(${p.hue},78%,76%,${p.a})`)
        grd.addColorStop(1, `hsla(${p.hue},78%,76%,0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      raf = requestAnimationFrame(tick)
    }

    // Event handlers
    const onMove = e => {
      const r = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => { mouse = { x: -9999, y: -9999 } }
    const onTouch = e => {
      e.preventDefault()
      const r = canvas.getBoundingClientRect()
      const t = e.touches[0]
      mouse = { x: t.clientX - r.left, y: t.clientY - r.top }
    }
    const onClick = e => {
      const r  = canvas.getBoundingClientRect()
      const cx = e.clientX - r.left
      const cy = e.clientY - r.top
      particles.forEach(p => {
        const dx = p.x - cx
        const dy = p.y - cy
        const d  = Math.sqrt(dx * dx + dy * dy)
        if (d < EXPLODE_R && d > 0) {
          const f = (1 - d / EXPLODE_R) * EXPLODE_F
          p.vx += (dx / d) * f
          p.vy += (dy / d) * f
        }
      })
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

  if (reduced) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[rgb(8,6,20)]">
        <span className="font-mono text-xs tracking-[0.3em] text-white/20 uppercase">· · ·</span>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full cursor-crosshair rounded-2xl"
    />
  )
}
