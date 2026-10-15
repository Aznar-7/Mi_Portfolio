import { findSecret } from '@/lib/secrets'
import { site } from '@/data/site'

// Page-wide secrets that don't belong to one section: Konami, the devtools note and the mate.
// The others live where they happen (board chips, console commands). Returns a cleanup.
export function installEggs() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const offs = []
  const on = (target, ev, fn, opts) => { target.addEventListener(ev, fn, opts); offs.push(() => target.removeEventListener(ev, fn, opts)) }

  // Konami: jump to hyperspace and come out over a galaxy map of the portfolio
  const land = () => document.dispatchEvent(new CustomEvent('open-galaxy'))
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']
  let k = 0
  on(window, 'keydown', (e) => {
    if (e.target instanceof Element && e.target.matches('input, textarea')) return
    const key = e.key.toLowerCase()
    k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0
    if (k === KONAMI.length) { k = 0; hyperspace() }
  })
  function hyperspace() {
    findSecret('hyperspace')
    if (reduced) return land()
    const c = Object.assign(document.createElement('canvas'), { className: 'hyper', width: innerWidth, height: innerHeight })
    document.body.append(c)
    const x = c.getContext('2d'), t0 = performance.now()
    const stars = Array.from({ length: 260 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random() * 40, v: 1 + Math.random() * 3 }))
    ;(function frame(now) {
      const p = (now - t0) / 1200, cx = c.width / 2, cy = c.height / 2
      x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, 0, c.width, c.height)
      x.strokeStyle = '#dfe9ff'; x.lineWidth = 1.2
      for (const s of stars) {
        const r1 = s.r + s.v * (4 + p * p * 120)
        x.beginPath(); x.moveTo(cx + Math.cos(s.a) * s.r, cy + Math.sin(s.a) * s.r); x.lineTo(cx + Math.cos(s.a) * r1, cy + Math.sin(s.a) * r1); x.stroke()
        s.r = r1 * .9
      }
      if (p < 1) requestAnimationFrame(frame)
      else { land(); setTimeout(() => c.remove(), 700) }
    })(t0)
  }

  // Devtools: a note for whoever reads the console
  const mark = ['  o           o', '  |           |', '   \\         /', '    \\       /', '     \\     /', '      \\ _ /', '      ( o )'].join('\n')
  console.info(
    `%c${mark}%c\n\n¿Mirando el código? Somos de la misma especie.\nEscribí hire() y te paso el contacto.`,
    'color:#d4574e; font:600 12px ui-monospace, monospace', 'font:600 13px system-ui; color:#e8e2b0',
  )
  window.hire = () => { findSecret('devtools'); return site.email }
  offs.push(() => { delete window.hire })

  // Mate: three quiet minutes
  let idle
  const reset = () => { clearTimeout(idle); idle = setTimeout(() => findSecret('mate'), 180000) }
  for (const ev of ['pointermove', 'keydown', 'scroll', 'touchstart']) on(window, ev, reset, { passive: true })
  reset()
  offs.push(() => clearTimeout(idle))

  return () => offs.forEach((off) => off())
}
