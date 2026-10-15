import { useEffect, useRef } from 'react'

// A planet rendered by hand on a 2D canvas: a noise texture is generated once (wrapped on a cylinder
// so it tiles around the globe), then every frame each pixel of the disc is lit as a sphere and
// looked up in the texture at its rotated longitude. Presets give each world its look.

// ── noise ───────────────────────────────────────────────────────────────
function hash(x, y, z, seed) {
  let h = x * 374761393 + y * 668265263 + z * 2147483647 + seed * 144269504
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
const smooth = (t) => t * t * (3 - 2 * t)
function noise3(x, y, z, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi)
  const l = (a, b, t) => a + (b - a) * t
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz, seed)
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
    l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf), zf)
}
function fbm(x, y, z, seed, oct = 5) {
  let v = 0, a = 0.5, f = 1
  for (let i = 0; i < oct; i++) { v += a * noise3(x * f, y * f, z * f, seed + i); f *= 2; a *= 0.5 }
  return v / (1 - 0.5 ** oct)
}
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
// sample a list of [stop, color] at t
function ramp(stops, t) {
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) {
    const [s0, c0] = stops[i - 1], [s1, c1] = stops[i]
    return mix(c0, c1, (t - s0) / (s1 - s0 || 1))
  }
  return stops[stops.length - 1][1]
}

// ── worlds ──────────────────────────────────────────────────────────────
const R = (list) => list.map(([s, c]) => [s, hex(c)])
const WORLDS = {
  tatooine: { seed: 3, land: R([[0, '#8a5a32'], [0.45, '#c9965a'], [0.7, '#e3bd84'], [1, '#f2dcae']]), scale: 2.2, atmo: [255, 200, 140], suns: true },
  bespin: { seed: 5, gas: R([[0, '#b8653a'], [0.3, '#e0a070'], [0.55, '#f6d2a8'], [0.8, '#d98c5a'], [1, '#f3c9a0']]), bands: 9, atmo: [255, 170, 110] },
  coruscant: { seed: 7, land: R([[0, '#1d222b'], [0.5, '#39404c'], [1, '#5c6370']]), scale: 6, atmo: [120, 170, 255], lights: [255, 196, 110] },
  geonosis: { seed: 9, land: R([[0, '#5a2414'], [0.5, '#a5482a'], [0.8, '#d07a48'], [1, '#e6a070']]), scale: 3, atmo: [255, 120, 80], ring: true },
  jakku: { seed: 11, land: R([[0, '#b49a6e'], [0.5, '#dcc59a'], [1, '#f1e4c4']]), scale: 4, ridged: true, atmo: [255, 225, 170] },
  utapau: { seed: 13, land: R([[0, '#2c2620'], [0.18, '#3a322a'], [0.22, '#8c7c66'], [0.7, '#b3a184'], [1, '#d2c3a6']]), scale: 3.4, atmo: [200, 190, 170] },
  naboo: { seed: 15, land: R([[0, '#123a6b'], [0.5, '#1f5e9c'], [0.53, '#d9cf9a'], [0.58, '#4f8f3e'], [0.8, '#2f6a2c'], [1, '#86a86a']]), scale: 2.4, clouds: 0.55, atmo: [130, 190, 255] },
  dagobah: { seed: 17, land: R([[0, '#1b2a1c'], [0.45, '#2f4a2a'], [0.6, '#4f6b3a'], [1, '#7d8f5a']]), scale: 3, clouds: 0.42, fog: true, atmo: [170, 210, 160] },
  corellia: { seed: 19, land: R([[0, '#163a5c'], [0.52, '#2a5d86'], [0.55, '#a59a7c'], [0.75, '#7c7564'], [1, '#c9c2ad']]), scale: 2.8, clouds: 0.6, atmo: [140, 190, 255], lights: [255, 210, 150] },
  takodana: { seed: 21, land: R([[0, '#1d4c63'], [0.42, '#2e7a8c'], [0.46, '#3f7a3a'], [0.75, '#2c5e2a'], [1, '#6f9a52']]), scale: 3, clouds: 0.5, atmo: [150, 210, 230] },
}

const TW = 640, TH = 320
function makeTexture(w) {
  const base = new Float32Array(TW * TH * 3), cloud = w.clouds ? new Float32Array(TW * TH) : null, city = w.lights ? new Float32Array(TW * TH) : null
  for (let j = 0; j < TH; j++) for (let i = 0; i < TW; i++) {
    const u = i / TW, v = j / TH, a = u * Math.PI * 2
    const x = Math.cos(a), y = Math.sin(a), z = (v - 0.5) * Math.PI
    let col
    if (w.gas) {
      const turb = fbm(x * 2, y * 2, z * 3, w.seed, 4)
      col = ramp(w.gas, ((v * w.bands + turb * 1.6) % 1 + 1) % 1)
    } else {
      const s = w.scale
      let n = fbm(x * s, y * s, z * s, w.seed)
      if (w.ridged) n = 1 - Math.abs(n * 2 - 1) * 0.9
      col = ramp(w.land, Math.min(1, Math.max(0, n)))
    }
    const k = (j * TW + i) * 3
    base[k] = col[0]; base[k + 1] = col[1]; base[k + 2] = col[2]
    if (cloud) cloud[j * TW + i] = Math.max(0, fbm(x * 3, y * 3, z * 4, w.seed + 50, 4) - (1 - w.clouds)) / w.clouds
    if (city) city[j * TW + i] = fbm(x * 18, y * 18, z * 18, w.seed + 90, 2) > 0.6 ? 1 : 0
  }
  return { base, cloud, city }
}

// ── the view ────────────────────────────────────────────────────────────
export function Planet({ world, className = '' }) {
  const cv = useRef(null)
  useEffect(() => {
    const w = WORLDS[world]; if (!w) return
    const c = cv.current, ctx = c.getContext('2d')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const tex = makeTexture(w)
    const D = 360 // drawn at a fixed resolution, scaled by CSS: keeps the per-pixel loop cheap
    c.width = c.height = D
    const img = ctx.createImageData(D, D), px = img.data
    const L = [-0.62, -0.32, 0.72], Ln = Math.hypot(...L), lx = L[0] / Ln, ly = L[1] / Ln, lz = L[2] / Ln
    let raf, t0 = performance.now()
    const frame = (now) => {
      const rot = reduced ? 0.6 : ((now - t0) / 1000) * 0.12, crot = rot * 1.35
      for (let y = 0; y < D; y++) {
        const ny = (y + 0.5) / D * 2 - 1
        for (let x = 0; x < D; x++) {
          const nx = (x + 0.5) / D * 2 - 1, r2 = nx * nx + ny * ny, o = (y * D + x) * 4
          if (r2 > 1) { px[o + 3] = 0; continue }
          const nz = Math.sqrt(1 - r2)
          const lit = nx * lx + ny * ly + nz * lz
          const lon = Math.atan2(nx, nz) + rot, lat = Math.asin(ny)
          const u = ((lon / (Math.PI * 2)) % 1 + 1) % 1, v = lat / Math.PI + 0.5
          const fx = u * TW - 0.5, fy = Math.min(TH - 1.001, Math.max(0, v * TH - 0.5))
          const x0 = ((fx | 0) + TW) % TW, x1 = (x0 + 1) % TW, y0 = fy | 0, y1 = y0 + 1, ax = fx - Math.floor(fx), ay = fy - y0
          const ti = y0 * TW + x0, b = tex.base
          const k00 = ti * 3, k10 = (y0 * TW + x1) * 3, k01 = (y1 * TW + x0) * 3, k11 = (y1 * TW + x1) * 3
          const bl = (c) => (b[k00 + c] * (1 - ax) + b[k10 + c] * ax) * (1 - ay) + (b[k01 + c] * (1 - ax) + b[k11 + c] * ax) * ay
          const day = Math.max(0, lit), shade = 0.06 + day * 1.05
          let cr = bl(0) * shade, cg = bl(1) * shade, cb = bl(2) * shade
          if (tex.cloud) {
            const cu = (((lon + crot - rot) / (Math.PI * 2)) % 1 + 1) % 1
            const cl = tex.cloud[Math.min(TH - 1, v * TH | 0) * TW + (cu * TW | 0)] * (w.fog ? 0.75 : 0.9)
            const cs = 0.08 + day * 1.1
            cr += (235 * cs - cr) * cl; cg += (240 * cs - cg) * cl; cb += (245 * cs - cb) * cl
          }
          if (tex.city && lit < 0.05 && tex.city[ti]) { // cities burn on the night side
            const glow = Math.min(1, (0.05 - lit) * 6) * 0.9
            cr += w.lights[0] * glow; cg += w.lights[1] * glow; cb += w.lights[2] * glow
          }
          const rim = Math.pow(1 - nz, 3) * (0.25 + day * 0.9) // atmosphere at the limb
          cr += w.atmo[0] * rim; cg += w.atmo[1] * rim; cb += w.atmo[2] * rim
          const edge = Math.min(1, (1 - Math.sqrt(r2)) * D * 0.5) // antialiased limb
          px[o] = cr; px[o + 1] = cg; px[o + 2] = cb; px[o + 3] = 255 * edge
        }
      }
      ctx.putImageData(img, 0, 0)
      if (!reduced) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [world])
  const w = WORLDS[world]
  return (
    <div className={`planet ${className}`} style={{ '--atmo': w ? w.atmo.join(',') : '140,190,255' }}>
      {w?.suns && <><span className="sun one" /><span className="sun two" /></>}
      {w?.ring && <span className="ring back" />}
      <canvas ref={cv} aria-hidden="true" />
      {w?.ring && <span className="ring front" />}
    </div>
  )
}
