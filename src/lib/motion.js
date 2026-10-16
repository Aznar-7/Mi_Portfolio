import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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

// The page powers on as the signal reaches it: each section title lights up letter by letter, like
// the hero name, and photos are uncovered. Nothing slides or blurs in; the text is there from the
// start and only its brightness moves. Runs only with motion allowed.
export function initMotion(root) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const ctx = gsap.context(() => {
    for (const title of gsap.utils.toArray('.pt', root)) {
      gsap.from(title.querySelectorAll('.pl'), {
        color: 'rgba(236,238,242,.16)', duration: 0.35, ease: 'none', stagger: 0.035, clearProps: 'color',
        scrollTrigger: { trigger: title, start: 'top 86%', once: true },
      })
    }

    for (const el of gsap.utils.toArray(UNCOVER.join(','), root)) {
      gsap.from(el, {
        clipPath: 'inset(0 0 100% 0 round 12px)', duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
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
