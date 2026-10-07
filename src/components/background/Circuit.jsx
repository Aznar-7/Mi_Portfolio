import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const CELL = 30                 // grid pitch in CSS px
const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
const GLOW_RADIUS = 180
const MAX_PULSES = 18

// PCB-style traces: random walks on a grid that keep a heading and only
// bend by 45°, so they read as routed copper rather than noise.
function buildTraces(cols, rows) {
  const used = new Set()
  const key = (x, y) => x * 10000 + y
  const traces = []
  const target = Math.floor((cols * rows) / 9)

  for (let attempt = 0; attempt < target * 3 && traces.length < target; attempt++) {
    let x = Math.floor(Math.random() * cols)
    let y = Math.floor(Math.random() * rows)
    if (used.has(key(x, y))) continue
    let d = Math.floor(Math.random() * 8)
    const pts = [[x, y]]
    used.add(key(x, y))
    const len = 4 + Math.floor(Math.random() * 14)

    for (let i = 0; i < len; i++) {
      if (Math.random() < 0.25) d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8
      const nx = x + DIRS[d][0]
      const ny = y + DIRS[d][1]
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || used.has(key(nx, ny))) break
      x = nx; y = ny
      used.add(key(x, y))
      pts.push([x, y])
    }
    if (pts.length >= 3) traces.push(pts.map(([px, py]) => [px * CELL + CELL / 2, py * CELL + CELL / 2]))
  }
  return traces
}

function polylineLength(pts) {
  let len = 0
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return len
}

function pointAt(pts, dist) {
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]
    const [bx, by] = pts[i]
    const seg = Math.hypot(bx - ax, by - ay)
    if (dist <= seg) return [ax + ((bx - ax) * dist) / seg, ay + ((by - ay) * dist) / seg]
    dist -= seg
  }
  return pts[pts.length - 1]
}

/**
 * Animated circuit-board background. Signals travel along traces; traces
 * near the pointer light up and attract new signals; click fires a burst.
 */
export default function Circuit({ color = [139, 123, 255] }) {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()
  const [r, g, b] = color

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const board = document.createElement('canvas')
    const bctx = board.getContext('2d')
    let traces = []
    let lengths = []
    let w = 0, h = 0, dpr = 1
    let pulses = []
    let raf = 0
    let visible = true
    let lastSpawn = 0
    const mouse = { x: -9999, y: -9999, active: false }

    const drawBoard = () => {
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bctx.clearRect(0, 0, w, h)
      bctx.lineWidth = 1
      bctx.strokeStyle = 'rgba(255,255,255,0.055)'
      bctx.fillStyle = 'rgba(255,255,255,0.09)'
      for (const t of traces) {
        bctx.beginPath()
        t.forEach(([x, y], i) => (i ? bctx.lineTo(x, y) : bctx.moveTo(x, y)))
        bctx.stroke()
        for (const [x, y] of [t[0], t[t.length - 1]]) {
          bctx.beginPath()
          bctx.arc(x, y, 2.2, 0, Math.PI * 2)
          bctx.fill()
        }
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width; h = rect.height
      for (const c of [canvas, board]) { c.width = w * dpr; c.height = h * dpr }
      traces = buildTraces(Math.ceil(w / CELL), Math.ceil(h / CELL))
      lengths = traces.map(polylineLength)
      pulses = []
      drawBoard()
      render(performance.now())
    }

    const nearestTraces = (x, y, radius) =>
      traces.reduce((acc, t, i) => {
        if (t.some(([px, py]) => Math.hypot(px - x, py - y) < radius)) acc.push(i)
        return acc
      }, [])

    const spawn = (index) => {
      if (pulses.length >= MAX_PULSES) return
      const i = index ?? Math.floor(Math.random() * traces.length)
      if (!traces[i]) return
      pulses.push({ i, d: 0, speed: 90 + Math.random() * 110 })
    }

    const render = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(board, 0, 0, w, h)

      // Pointer glow: re-stroke trace segments near the cursor
      if (mouse.active) {
        ctx.lineWidth = 1.2
        for (const t of traces) {
          for (let k = 1; k < t.length; k++) {
            const mx = (t[k][0] + t[k - 1][0]) / 2
            const my = (t[k][1] + t[k - 1][1]) / 2
            const dist = Math.hypot(mx - mouse.x, my - mouse.y)
            if (dist > GLOW_RADIUS) continue
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.55 * (1 - dist / GLOW_RADIUS)})`
            ctx.beginPath()
            ctx.moveTo(t[k - 1][0], t[k - 1][1])
            ctx.lineTo(t[k][0], t[k][1])
            ctx.stroke()
          }
        }
      }

      // Signals: bright head with a short fading tail
      for (const p of pulses) {
        const t = traces[p.i]
        for (let s = 0; s < 6; s++) {
          const [x, y] = pointAt(t, Math.max(0, p.d - s * 5))
          ctx.fillStyle = `rgba(${r},${g},${b},${(1 - s / 6) * 0.9})`
          ctx.beginPath()
          ctx.arc(x, y, 1.8 - s * 0.2, 0, Math.PI * 2)
          ctx.fill()
        }
        if (p.d >= lengths[p.i]) {
          const [x, y] = t[t.length - 1]
          ctx.fillStyle = `rgba(${r},${g},${b},0.5)`
          ctx.beginPath()
          ctx.arc(x, y, 3.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      return now
    }

    let last = performance.now()
    const loop = (now) => {
      if (!visible) { raf = 0; return }
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      pulses.forEach((p) => { p.d += p.speed * dt })
      pulses = pulses.filter((p) => p.d < lengths[p.i] + 30)

      if (now - lastSpawn > 260) {
        lastSpawn = now
        const near = mouse.active ? nearestTraces(mouse.x, mouse.y, GLOW_RADIUS) : []
        spawn(near.length && Math.random() < 0.7 ? near[Math.floor(Math.random() * near.length)] : undefined)
      }
      render(now)
      raf = requestAnimationFrame(loop)
    }

    const toLocal = (e) => {
      const rect = canvas.getBoundingClientRect()
      return [e.clientX - rect.left, e.clientY - rect.top, rect]
    }
    const onMove = (e) => {
      const [x, y, rect] = toLocal(e)
      mouse.x = x; mouse.y = y
      mouse.active = y >= 0 && y <= rect.height
    }
    const onLeave = () => { mouse.active = false }
    const onDown = (e) => {
      const [x, y, rect] = toLocal(e)
      if (y < 0 || y > rect.height) return
      nearestTraces(x, y, GLOW_RADIUS * 0.8).slice(0, 8).forEach(spawn)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    if (reduced) return () => ro.disconnect()

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(loop) }
    })
    io.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [reduced, r, g, b])

  return <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
}
