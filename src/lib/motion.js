import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Lists that arrive as lists: one batch per scroll position, capped stagger
const CASCADE = ['.net', '.bin', '.pin', '.facts > div', '.chips li', '.mail-form .field', '.form-foot', '.ev-list li']
// Media that is uncovered rather than faded
const UNCOVER = ['.feature-media .shot', '.portrait', '.activity']

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

  // images and the lazy calendar change heights after load
  const refresh = () => ScrollTrigger.refresh()
  addEventListener('load', refresh)
  const t = setTimeout(refresh, 1500)
  return () => { ctx.revert(); removeEventListener('load', refresh); clearTimeout(t) }
}
