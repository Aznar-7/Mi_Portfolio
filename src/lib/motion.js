import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Lists that arrive as lists: one batch per scroll position, capped stagger
const CASCADE = ['.bin', '.facts > div', '.ev-list li']
// Media that is uncovered rather than faded
const UNCOVER = ['.feature-media .shot', '.portrait', '.activity']

// Smooth travel to an element. The target is re-measured every frame, so rows opening or a
// ScrollTrigger refresh mid-flight can't leave us short; 'instant' sidesteps html{scroll-behavior:smooth}.
export function travel(el, offset = 80) {
  if (!el) return
  const dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1000
  const from = scrollY, t0 = performance.now()
  const step = (now) => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1
    const e = k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2
    const to = el.getBoundingClientRect().top + scrollY - offset
    scrollTo({ top: from + (to - from) * e, behavior: 'instant' })
    if (k < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// Where the map overlays send you: 'p:<id>' opens that project row, anything else is a selector.
// Called after the overlay closes, so the page is free to scroll.
export function goTo(target) {
  if (target.startsWith('p:')) document.dispatchEvent(new CustomEvent('board:open-project', { detail: target.slice(2) }))
  else travel(document.querySelector(target))
}

// The page powers on as the signal reaches it: titles light up letter by letter, lists cascade,
// photos are uncovered. Content is visible by default; this only runs with motion allowed.
export function initMotion(root) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const ctx = gsap.context(() => {
    for (const title of gsap.utils.toArray('.pt', root)) {
      gsap.from(title.querySelectorAll('.pl'), {
        yPercent: 70, opacity: 0, filter: 'blur(8px)', duration: 0.8, ease: 'power3.out', stagger: 0.022,
        scrollTrigger: { trigger: title, start: 'top 86%', once: true, onEnter: () => title.classList.add('on') },
      })
    }

    const cascade = gsap.utils.toArray(CASCADE.join(','), root).filter((el) => el.getBoundingClientRect().top > innerHeight)
    gsap.set(cascade, { opacity: 0, y: 26 })
    ScrollTrigger.batch(cascade, {
      start: 'top 90%', once: true, interval: 0.08, batchMax: 8,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, overwrite: true, clearProps: 'transform' }),
    })

    for (const el of gsap.utils.toArray(UNCOVER.join(','), root)) {
      gsap.from(el, {
        clipPath: 'inset(0 0 100% 0 round 12px)', duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    }

    for (const p of gsap.utils.toArray('.sec-intro, .big, .about-lead', root)) {
      gsap.from(p, { opacity: 0, y: 18, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 90%', once: true } })
    }
  }, root)

  // Any height change (a project row opening, images, the lazy calendar) moves every trigger below
  // it; without a refresh the Process pin fires early and lands on top of Work.
  let t, lastH = root.offsetHeight
  const ro = new ResizeObserver(() => {
    if (Math.abs(root.offsetHeight - lastH) < 2) return
    lastH = root.offsetHeight
    clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150)
  })
  ro.observe(root)
  return () => { ctx.revert(); ro.disconnect(); clearTimeout(t) }
}
