import { findSecret } from '@/lib/secrets'
import { jump } from '@/lib/hyperspace'
import { site } from '@/data/site'

// Page-wide secrets that don't belong to one section: Konami, the devtools note and the mate.
// The others live where they happen (board chips, console commands). Returns a cleanup.
export function installEggs() {
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
    // the long cut: stars stretch, the jump, a moment of tunnel; the galaxy mounts underneath before it fades
    jump({ from: 1.4, to: 7.6, peakAt: 7.2, onPeak: land })
  }

  // Devtools: a note for whoever reads the console
  const mark = ['  o           o', '  |           |', '   \\         /', '    \\       /', '     \\     /', '      \\ _ /', '      ( o )'].join('\n')
  console.info(
    `%c${mark}%c\n\n¿Mirando el código? Somos de la misma especie.\nEscribí hire() y te paso el contacto.`,
    'color:#d4574e; font:600 12px ui-monospace, monospace', 'font:600 13px system-ui; color:#e8e2b0',
  )
  window.hire = () => { findSecret('devtools'); return site.email }
  offs.push(() => { delete window.hire })

  // Mate: a quiet minute
  let idle
  const reset = () => { clearTimeout(idle); idle = setTimeout(() => findSecret('mate'), 60000) }
  for (const ev of ['pointermove', 'keydown', 'scroll', 'touchstart']) on(window, ev, reset, { passive: true })
  reset()
  offs.push(() => clearTimeout(idle))

  return () => offs.forEach((off) => off())
}
